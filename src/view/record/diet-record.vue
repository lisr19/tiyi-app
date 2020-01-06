<template>
	<div>
		<mt-header fixed title="饮食记录" >
			<router-link to="/home" slot="left">
				<mt-button icon="back"></mt-button>
			</router-link>
			<mt-button slot="right" v-if="!btnStatus" style="color: #007AFF" @click="doAddDiet">保存</mt-button>
		</mt-header>
		<!--<div style="width: 1rem;height: 1rem;position: absolute;top:0;left: 3rem;z-index: 33;background: black" @click="scrollRefresh"></div>-->
		<hm-scroll ref="hmScroll">
			<div class="hm-diet">
				<div class="hm-field-box">
					<label>用餐类型：</label>
					<div class="hm-field-slot" @click="handleClick(0)">
						<p>{{dietType}}</p>
					</div>
				</div>
				<div class="hm-field-box">
					<label>用餐日期：</label>
					<div class="hm-field-slot" @click="openTimeDate">
						<p v-if="currentDate">{{currentDate}}</p>
						<p v-else style="color:rgb(214, 214, 220)">不填默认今天</p>
					</div>
				</div>
				<div class="hm-field-box" style="margin-bottom:0.48rem">
					<label>用餐时间：</label>
					<div class="hm-field-slot" @click="handleClick(1)">
						<p>{{dietTime}}</p>
					</div>
				</div>

				<div class="hm-diet-body">
					<div class="hm-diet-title">
						<span style="display: inline-block;margin-right: 0.3rem">用餐列表:</span>
						<router-link
								tag="div"
								:to="{name:'diet_list',query:{data:this.form,type:type,dietTime:dietTime,currentDate:this.currentDate}}"
								class="hm-btn3"
								style="display: inline-block"
						>添加</router-link>
						<button
								style="display: inline-block;float:right;padding-top: 0;"
								class="hm-btn4"
								@click="showDetail"
								v-if="groupType"
						>营养详情</button>
					</div>
					<div class="hm-diet-card" v-for="(item,index) in form">
						<div class="hm-diet-card-header">
							<span style="font-size:0.28rem;">用餐{{index+1}}:</span>
							<span style="color: #333;font-size:0.5rem;" @click="handleClose(index)">×</span>
						</div>
						<div class="hm-field-box" @click="showADietDetail(item)">
							<label>食物名称：</label>
							<input type="text" v-model="item.name" disabled="disabled" placeholder="测试" />
						</div>
						<div class="hm-field-box">
							<label>食物重量：</label>
							<input type="text" disabled="disabled" v-model="item.weight" placeholder="食谱重量" />
						</div>
						<div class="hm-field-box">
							<label>摄入量：</label>
							<input
									type="text"
									style="width: 62%"
									v-model="item.percentage"
									maxlength="3"
									placeholder="默认为100%"
									@blur="scrollRefresh"
							/>
							<label class="hm-field-unit">%</label>
						</div>
					</div>
				</div>
			</div>
		</hm-scroll>

		<mt-popup v-model="dietTypeVisible" position="bottom" class="hm-select">
			<mt-picker :slots="dietTypeArray" valueKey="name" @change="onTypeChange"></mt-picker>
		</mt-popup>

		<mt-datetime-picker ref="picker" type="time" v-model="dietTime"></mt-datetime-picker>

		<modal v-model="isShow" @on-cancel="cancelModal">
			<div class="hm-detail">
				<div class="hm-detail-title">{{showTitle}}</div>
				<ul>
					<li>
						摄入卡路里：
						<span>{{nutriObj.energyKcal.toFixed(2)}}</span>&nbsp;&nbsp;Kcal
					</li>
					<li>
						摄入蛋白质：
						<span>{{nutriObj.protein.toFixed(2)}}</span>&nbsp;&nbsp;g
					</li>
					<li>
						摄入碳水化合物：
						<span>{{nutriObj.cho.toFixed(2)}}</span>&nbsp;&nbsp;g
					</li>
					<li>
						摄入脂肪：
						<span>{{nutriObj.fat.toFixed(2)}}</span>&nbsp;&nbsp;g
					</li>
					<li>
						摄入铁：
						<span>{{nutriObj.fe.toFixed(2)}}</span>&nbsp;&nbsp;mg
					</li>
					<li>
						摄入钙：
						<span>{{nutriObj.ca.toFixed(2)}}</span>&nbsp;&nbsp;mg
					</li>
				</ul>
			</div>
			<div slot="footer"></div>
		</modal>

		<mt-datetime-picker
				ref="picker2"
				type="date"
				v-model="pickerValue"
				@confirm='handleConfirm'
				:startDate=startDate
				:endDate='ToDay'
		>
		</mt-datetime-picker>
	</div>
</template>

<script>
	import hmScroll from '../../components/hm-scroll/hm-scroll'
	import utils from '@/utils/util'
	import { Toast, MessageBox, Indicator } from 'mint-ui'

	import { findStandardMenuComposition, findNutri } from '../../api/menu'
	import { doAddDiet } from '../../api/record'

	export default {
		name: 'diet-record',
		components: {
			hmScroll
		},
		computed: {
			today() {
				return utils.formatDate(new Date(), 'yyyy-MM-dd')
			},
			userId() {
				return this.$store.state.user.userId
			},
			groupType() {
				return this.$store.state.user.groupType
			},
			weight() {
				//计算总重量
				let sum = 0
				if (this.form.length > 0) {
					this.form.forEach((v) => {
						let weight = ''
						if (v.currentTab === '1') {
							weight = v.weight.substring(0, v.weight.length - 1)
						} else {
							weight = v.weight
						}
						sum = sum + weight * (v.percentage / 100)
					})
				}
				return sum
			}
		},
		data() {
			return {
				startDate:new Date('2019-01-01'),
				currentDate:'',
				ToDay:new Date(),
				pickerValue:new Date(),
				debug: false,
				menuData: [], //菜谱数据
				showTitle: '本次饮食详情',
				dietTypeVisible: false,
				isShow: false,
				btnStatus: false, //按钮状态
				isComputing: false, //计算状态
				dietTypeArray: [
					{
						values: [{ id: -1, name: ' ' }, { id: 0, name: '加餐' }, { id: 1, name: '早餐' }, { id: 2, name: '午餐' }, { id: 3, name: '晚餐' }]
					}
				],
				dietType: '',
				type: 0, //用餐类型id
				dietTime: '', //用餐时间
				form: [], //用餐列表表单
				nutriObj: {
					//成分数据对象
					protein: 0, //蛋白质
					energyKcal: 0, //能量
					fat: 0, //脂肪
					fe: 0, //铁
					ca: 0, //钙
					cho: 0 //碳水化合物
				},
				saveData: {} // 保存的数据
			}
		},
		watch: {
			form: {
				handler: function(newForm, oldForm) {
					if (newForm.length !== this.menuData.length) {
						this.updateData()
						return
					}
					for (let i = 0; i < newForm.length; i++) {
						if (newForm[i].name !== this.menuData[i].name) {
							this.updateData()
							return
						}
					}
				},
				deep: true
			}
		},
		created(){
			// this.currentDate = this.getDay(0,'-')
		},
		mounted() {
			if (JSON.stringify(this.$route.query) !== '{}') {
				this.form = this.$route.query.data
				this.type = this.$route.query.type
				this.dietTypeArray[0].values.forEach((v) => {
					if (v.id === this.type) {
						this.dietType = v.name
					}
				})
				this.dietTime = this.$route.query.dietTime
				this.currentDate = this.$route.query.currentDate
				this.form.forEach((v) => {
					v.percentage = 100
				})
				// console.log(this.form)
			}else{
				let time = new Date()
				this.dietTime = time.getHours() + ':' +time.getMinutes()
			}
		},
		methods: {
			// 更新数据
			updateData() {
				if (this.form.length !== 0) {
					this.getMenuData()
				}
			},
			//刷新滑动
			scrollRefresh(){
				window.scroll(0,0);
			},
			//校验用餐比例
			checkPercentage() {
				let empty = this.form.some((item) => {
					return !item.percentage
				})
				if (empty) {
					return false
				} else {
					let invalid = this.form.some((item) => {
						return !utils.validateNumber(item.percentage)
					})
					if (invalid) {
						return false
					}
				}
				return true
			},
			// 计算
			compute() {
				while (this.isComputing) {}
				this.isComputing = true
				this.nutriObj = {
					protein: 0, //蛋白质
					energyKcal: 0, //能量
					fat: 0, //脂肪
					fe: 0, //铁
					ca: 0, //钙
					cho: 0 //碳水化合物
				}
				for (let i = 0; i < this.form.length; i++) {
					this.nutriObj.protein = this.nutriObj.protein + (this.menuData[i].protein * this.form[i].percentage) / 100
					this.nutriObj.energyKcal = this.nutriObj.energyKcal + (this.menuData[i].energyKcal * this.form[i].percentage) / 100
					this.nutriObj.fat = this.nutriObj.fat + (this.menuData[i].fat * this.form[i].percentage) / 100
					this.nutriObj.fe = this.nutriObj.fe + (this.menuData[i].fe * this.form[i].percentage) / 100
					this.nutriObj.ca = this.nutriObj.ca + (this.menuData[i].ca * this.form[i].percentage) / 100
					this.nutriObj.cho = this.nutriObj.cho + (this.menuData[i].cho * this.form[i].percentage) / 100
				}
				let dietHistoryMenuRelAddVOList = []
				let dietHistoryCustomFoodRelAddVOList = []
				this.form.forEach((v) => {
					if (v.currentTab === '1') {
						dietHistoryMenuRelAddVOList.push({
							menuId: v.id,
							percentage: v.percentage
						})
					} else if (v.currentTab === '2') {
						dietHistoryCustomFoodRelAddVOList.push({
							customFoodId: v.id,
							percentage: v.percentage
						})
					}
				})
				this.saveData = {
					userId: this.userId,
					weight: this.weight,
					calorie: this.nutriObj.energyKcal,
					dietHistoryMenuRelAddVOList: dietHistoryMenuRelAddVOList,
					dietHistoryCustomFoodRelAddVOList: dietHistoryCustomFoodRelAddVOList
				}
				this.isComputing = false
			},
			// 验证
			formSubmit() {
				let msg = ''
				let status = false
				if (this.type === -1) {
					msg = '用餐类型不能为空'
				} else if (!this.dietTime) {
					msg = '用餐时间不能为空'
				} else {
					if (this.form && this.form.length) {
						let empty = this.form.some((item) => {
							return !item.percentage
						})
						if (empty) {
							msg = '用餐比例不能为空'
						} else {
							let invalid = this.form.some((item) => {
								return !utils.validateNumber(item.percentage)
							})
							if (invalid) {
								msg = '请输入合法的用餐比例'
							}
						}
					} else {
						msg = '用餐列表不能为空'
					}
				}
				if (msg !== '') {
					Toast({
						message: msg,
						position: 'bottom',
						duration: 2000
					})
				} else {
					status = true
				}
				return status
			},
			//添加用餐
			async doAddDiet() {
				if (this.btnStatus) return
				this.btnStatus = true
				if (!this.formSubmit()) {
					this.btnStatus = false
					return
				}
				this.compute()
				this.saveData.type = this.type
				this.saveData.mealTime = this.dietTime + ':00'
				if(this.currentDate){
					this.saveData.createTime = this.currentDate +'12:00:00'
				}
				let res = await doAddDiet(this.saveData)
				if (res.code === 200) {
					Toast({
						message: '添加成功',
						position: 'bottom',
						duration: 2000
					})
					this.$router.push({
						name: 'home'
					})
				} else {
					Toast({
						message: '网络异常',
						position: 'bottom',
						duration: 2000
					})
				}
				this.btnStatus = false
			},
			// 获取菜谱数据
			async getMenuData() {
				this.menuData = []
				for (let i = 0; i < this.form.length; i++) {
					let v = this.form[i]
					if (v[`code`]) {
						let nutri = await this.findMenuData(v.code)
						nutri.name = v.name
						this.menuData.push(nutri)
					} else {
						this.menuData.push({
							name: v.name,
							protein: 0,
							energyKcal: (v.energy * v.percentage) / 100,
							fat: 0,
							fe: 0,
							ca: 0,
							cho: 0
						})
					}
				}
			},
			//显示详情
			showDetail() {
				this.showTitle = '本次饮食详情'
				let time = 0
				if(this.form.length>0)time = this.form.length * 500
				Indicator.open({
					text: '计算中...',
				});
				setTimeout(()=>{
					this.compute()
					this.isShow = true
					Indicator.close();
				},time)
			},
			//显示一个菜谱的详情详情
			showADietDetail(obj) {
				this.nutriObj = {
					protein: 0, //蛋白质
					energyKcal: 0, //能量
					fat: 0, //脂肪
					fe: 0, //铁
					ca: 0, //钙
					cho: 0 //碳水化合物
				}
				this.showTitle = obj.name
				obj[`code`]
					? this.findStandardMenuComposition(obj.code, obj)
					: (this.nutriObj.energyKcal = this.nutriObj.energyKcal + (obj.energy * obj.percentage) / 100)
				this.isShow = true
			},
			cancelModal() {
				this.isShow = false
			},
			//计算用餐摄入的能量和营养素
			countNutri() {
				if (this.form.length > 0) {
					this.form.forEach((v, index) => {
						v[`code`] ? this.findStandardMenuComposition(v.code, v) : (this.nutriObj.energyKcal = this.nutriObj.energyKcal + (v.energy * v.percentage) / 100)
					})
				}
			},
			//获取食物标准成分
			async findMenuData(menuCode) {
				let res = await findStandardMenuComposition({ menuCode: menuCode })
				let nutri = {
					protein: 0, //蛋白质
					energyKcal: 0, //能量
					fat: 0, //脂肪
					fe: 0, //铁
					ca: 0, //钙
					cho: 0 //碳水化合物
				}

				if (res.code === 200) {
					for (let i = 0; i < res.data.length; i++) {
						nutri = await this.findNutri2(res.data[i].composition, res.data[i].quantity, nutri)
					}
				} else {
					Toast({
						message: '网络异常',
						position: 'bottom',
						duration: 2000
					})
				}
				return nutri
			},
			//根据食物成分查询食物营养
			async findNutri2(name, quantity, nutri) {
				let weight = quantity.substring(0, quantity.length - 1) / 100
				let res = await findNutri({ name: name })

				if (res.code === 200) {
					if (res.data[`energyKcal`]) {
						nutri.energyKcal = nutri.energyKcal + res.data.energyKcal * weight
					}
					if (res.data[`protein`]) {
						nutri.protein = nutri.protein + res.data.protein * weight
					}
					if (res.data[`fat`]) {
						nutri.fat = nutri.fat + res.data.fat * weight
					}
					if (res.data[`fe`]) {
						nutri.fe = nutri.fe + res.data.fe * weight
					}
					if (res.data[`ca`]) {
						nutri.ca = nutri.ca + res.data.ca * weight
					}
					if (res.data[`cho`]) {
						nutri.cho = nutri.cho + res.data.cho * weight
					}
				} else {
					Toast({
						message: '网络异常',
						position: 'bottom',
						duration: 2000
					})
				}
				return nutri
			},
			//获取食物标准成分
			async findStandardMenuComposition(menuCode, obj) {
				let params = {
					menuCode: menuCode
				}
				let res = await findStandardMenuComposition(params)
				if (res.code === 200) {
					if (res.data.length > 0) {
						res.data.forEach((v) => {
							this.findNutri(v.composition, v.quantity, obj.percentage / 100)
						})
					}
				} else {
					Toast({
						message: '网络异常',
						position: 'bottom',
						duration: 2000
					})
				}
			},
			//根据食物成分查询食物营养
			async findNutri(name, quantity, percentage) {
				let params = {
					// name: encodeURI(JSON.stringify(name))
					name: name
				}
				let weight = quantity.substring(0, quantity.length - 1) / 100

				let res = await findNutri(params)
				if (res.code === 200) {
					if (res.data[`energyKcal`]) {
						this.nutriObj.energyKcal = this.nutriObj.energyKcal + res.data.energyKcal * weight * percentage
					}
					if (res.data[`protein`]) {
						this.nutriObj.protein = this.nutriObj.protein + res.data.protein * weight * percentage
					}
					if (res.data[`fat`]) {
						this.nutriObj.fat = this.nutriObj.fat + res.data.fat * weight * percentage
					}
					if (res.data[`fe`]) {
						this.nutriObj.fe = this.nutriObj.fe + res.data.fe * weight * percentage
					}
					if (res.data[`ca`]) {
						this.nutriObj.ca = this.nutriObj.ca + res.data.ca * weight * percentage
					}
					if (res.data[`cho`]) {
						this.nutriObj.cho = this.nutriObj.cho + res.data.cho * weight * percentage
					}
				} else {
					Toast({
						message: '网络异常',
						position: 'bottom',
						duration: 2000
					})
				}
			},
			handleClick(index) {
				index === 0 ? (this.dietTypeVisible = true) : this.$refs.picker.open()
			},
			openTimeDate(){
				this.$refs.picker2.open()
			},
			handleConfirm(){
				this.formatDate(this.pickerValue)
				this.currentDate = this.formatDate(this.pickerValue).slice(0,11)
			},
			//获取当前时间
			getDay(num, str) {
				let today = new Date();
				let nowTime = today.getTime();
				let ms = 24*3600*1000*num;
				today.setTime(parseInt(nowTime + ms))
				let oYear = today.getFullYear()
				let oMoth = (today.getMonth() + 1).toString();
				if (oMoth.length <= 1) oMoth = '0' + oMoth;
				let oDay = today.getDate().toString();
				if (oDay.length <= 1) oDay = '0' + oDay;
				// this.currDate = oYear + str + oMoth + str + oDay
				return oYear + str + oMoth + str + oDay;
			},
			// 格式化获取的时间
			formatDate(date) {
				const y = date.getFullYear()
				let M = date.getMonth() + 1
				M = M < 10 ? '0' + M : M
				let d = date.getDate()
				d = d < 10 ? ('0' + d) : d
				let h = date.getHours()
				h = h < 10 ? ('0' + h) : h
				let m = date.getMinutes()
				m = m < 10 ? ('0' + m) : m
				return y + '-' + M + '-' + d + ' ' + h + ':' + m + ':'+'00'
			},
			onTypeChange(picker, values) {
				this.dietType = picker.getValues()[0].name
				this.type = picker.getValues()[0].id
			},
			handleClose(index) {
				if (this.debug) console.log('handleClose')
				this.menuData.splice(index, 1)
				this.form.splice(index, 1)
				//this.form.pop()
			}
		}
	}
</script>
<style lang="less" scoped>
	@import '../../assets/style/common.less';

	.hm-field-box {
		border: 0.02rem solid @grey-5;
		border-radius: 0.1rem;
		background: @grey-6;
		height: 0.64rem;
		margin-bottom: 0.25rem;
		label {
			padding-top: 0.1rem;
		}
		input {
			height: 0.58rem;
			background: @grey-6;
			padding: 0 0.1rem;
		}
		.hm-field-slot {
			height: 0.63rem;
			p {
				padding-top: 0.1rem;
				font-size: 0.28rem;
				font-weight: 400;
				color: @black;
				line-height: 0.4rem;
			}
		}
		.hm-field-unit {
			width: 10%;
			text-align: center;
		}
	}

	.hm-detail {
		.hm-detail-title {
			text-align: center;
			font-size: 0.34rem;
			font-weight: 500;
			color: @black;
			line-height: 0.6rem;
		}
		ul {
			margin-top: 0.3rem;
		}
		ul li {
			margin: 0.1rem 0;
			padding-left: 0.3rem;
		}
		span {
			font-size: 0.3rem;
			font-weight: 500;
			color: @blue;
			line-height: 0.5rem;
		}
	}

	.hm-diet {
		margin-top: 1rem;
		padding: 0.78rem 0.5rem 3rem 0.5rem;
		.hm-diet-body {
			.hm-diet-title {
				font-size: 0.3rem;
				font-weight: 500;
				color: @black;
				line-height: 0.4rem;
				padding-left: 0.1rem;
			}
			.hm-diet-card {
				width: 96%;
				margin: 0.2rem auto;
				padding: 0.2rem;
				border-radius: 0.1rem;
				box-shadow: 0 0.06rem 0.1rem 0 rgba(83, 83, 83, 0.16);
				span {
					font-weight: 400;
					color: @light_grey;
					line-height: 0.4rem;
					margin-bottom: 0.2rem;
					display: block;
				}
				.hm-diet-card-header {
					display: flex;
					display: -webkit-flex;
					justify-content: space-between;
					-webkit-justify-content: space-between;
				}
			}
		}
	}

	.hm-select {
		width: 100%;
		font-size: 0.28rem;
		font-weight: 400;
		color: @black;
		line-height: 0.4rem;
	}
</style>
