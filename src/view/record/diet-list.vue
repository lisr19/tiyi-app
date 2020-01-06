<template>
  <div>
    <mt-header fixed title="选择菜品/食物">
      <mt-button icon="back" @click="handlerSubmit" slot="left"></mt-button>

      <mt-button slot="right" style="color: #007AFF" @click="handlerSubmit">确定</mt-button>
    </mt-header>

    <div class="hm-diet-list">
      <div class="hm-diet-list-header">
        <mt-navbar v-model="currentTab">
          <mt-tab-item id="1">指定菜品</mt-tab-item>
          <mt-tab-item id="2">自定义</mt-tab-item>
        </mt-navbar>
        <input type="text" placeholder="填写菜品名称查询" v-if="currentTab === '1'" v-model="menuName"/>
        <input type="text" placeholder="填写自定义是食物名称查询" v-if="currentTab === '2'" v-model="selfName"/>
      </div>

      <div class="hm-flex" style="margin-top: 0.05rem;">
        <div>
          <div style="width: 100%;height: 0.6rem;" v-show="currentTab!== '2'">
            <div class="tab-btn hm-flex">
              <div :class="currentType==='类型'?'tab-btn-label active':'tab-btn-label normal'"
                   @click="()=>{this.currentType = '类型'}" style="border-radius: 0.08rem 0 0 0.08rem ;">
                <span>类型</span>
              </div>
              <div :class="currentType==='地址'?'tab-btn-label active':'tab-btn-label normal'"
                   @click="()=>{this.currentType = '地址'}" style=" border-radius: 0 0.08rem 0.08rem 0;">
                <span>地址</span>
              </div>
            </div>
          </div>
          <hm-nav
            ref="hmNav"
            v-show="currentType === '类型'"
            :typeData="currentTab!== '2'?menuTypeData:customizeTypeData"
            @watchCurrentSelect="watchCurrentSelect"
            @handleSearchById="handleSearchById"
          ></hm-nav>
          <hm-nav
            ref="hmNav2"
            v-show="currentType === '地址'"
            :typeData="currentTab!== '2'?addressData:customizeTypeData"
            @handleSearchById="handleSearchById2"
          ></hm-nav>
        </div>
        <hm-scroll :pullup="true" @scrollToEnd="loadMore">
          <div class="hm-diet-list-body">
            <div v-for="(item,index) in dataShow">
              <div :class="addedMenu(item.id) !== -1?'hm-active':''" @click="addMenu(item)"></div>
              <img
                :src="currentTab === '1'?'http://'+item.imgUrl+'?imageView2/2/w/100':'http://'+item.imgUrl1+'?imageView2/2/w/100'"
                :onerror="defaultImg"
                @click="openDetailModal(item)"
              />
              <span>{{item.name}}</span>
            </div>

            <div
              class="hm-img-btn"
              v-if="currentTab === '2' && currentSelect===-1"
              @click="openAddModal"
            >
              <img src="../../assets/logo/add_big.png"/>
            </div>
          </div>
        </hm-scroll>
      </div>
      <Modal v-model="isDetail" class="hm-modal">
        <h2>{{detailData.name+'('+detailData.weight+')'}}</h2>
        <img class="img-size" :src="'http://'+detailData.imgUrl+'?imageView2/2/w/100'"/>
        <ul>
          <li>
            卡路里：
            <span>{{nutriObj.energyKcal.toFixed(2)}}</span>&nbsp;&nbsp;Kcal
          </li>
          <li>
            蛋白质：
            <span>{{nutriObj.protein.toFixed(2)}}</span>&nbsp;&nbsp;g
          </li>
          <li>
            碳水化合物：
            <span>{{nutriObj.cho.toFixed(2)}}</span>&nbsp;&nbsp;g
          </li>
          <li>
            脂肪：
            <span>{{nutriObj.fat.toFixed(2)}}</span>&nbsp;&nbsp;g
          </li>
          <li>
            铁：
            <span>{{nutriObj.fe.toFixed(2)}}</span>&nbsp;&nbsp;mg
          </li>
          <li>
            钙：
            <span>{{nutriObj.ca.toFixed(2)}}</span>&nbsp;&nbsp;mg
          </li>
        </ul>
        <div slot="footer">
          <!--<div class="hm-btn2" style="margin: 0.5rem auto" @click="()=>{addMenu(detailData);isDetail = false}">添加</div>-->
        </div>
      </Modal>
      <Modal v-model="helpShow" class="hm-modal" style="text-align:center;">
        <img class="fit-picture" src="../../assets/help.jpg" v-show="helpShow"/>
        <div slot="footer"></div>
      </Modal>
      <Modal v-model="isAdd" class="hm-modal">
        <div>
          <!--<mt-button-->
          <!--@click="handlerClickHelp"-->
          <!--type="primary"-->
          <!--class="question"-->
          <!--style="border-radius: 50%;"-->
          <!--&gt;?</mt-button>-->

          <hm-img-upload ref="imgUpload" @imgUpload="getUploadImg" @delImg="delUploadImg"></hm-img-upload>
          <div class="hm-field-box" style="margin-top: 0.3rem">
            <label>食物名：</label>
            <input type="text" placeholder maxlength="10" v-model="selfForm.name" @blur="scrollRefresh"/>
          </div>
          <div class="hm-field-box">
            <label>总重量：</label>
            <input
              type="text"
              style="width: 62%"
              placeholder="食物重量"
              maxlength="6"
              v-model="selfForm.weight"
              @blur="scrollRefresh"
            />
            <label class="hm-field-unit">g</label>
          </div>
          <div class="hm-field-box">
            <label>总能量：</label>
            <input
              type="text"
              style="width: 62%"
              placeholder="食物能量"
              maxlength="6"
              v-model="selfForm.energy"
              @blur="scrollRefresh"
            />
            <label class="hm-field-unit">kcal</label>
          </div>
          <textarea placeholder="成分：均为食物每100g计算" maxlength="200" v-model="selfForm.composition"
                    @blur="scrollRefresh"></textarea>
        </div>
        <div class="hm-btn2" style="margin: 0.5rem auto" @click="doAddCustomFood">添加</div>
        <div slot="footer"></div>
      </Modal>
    </div>

    <div class="hm-diet-list-btn">
      <img src="../../assets/logo/list.png" @click="handlerClick"/>
      <div class="hm-flag" v-if="addForm.length>0">{{addForm.length}}</div>
      <div class="hm-label" v-if="labelShow">
        <div class="hm-label-item" v-for="(item,index) in addForm">
          <span>{{item.name}}</span>
          <span @click="addMenu(item)">×</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import hmNav from '../../components/hm-nav/hm-nav'
  import hmScroll from '../../components/hm-scroll/hm-scroll'
  import hmImgUpload from '../../components/img-upload/img-upload'
  import utils from '@/utils/util'
  import {Toast, Indicator} from 'mint-ui'

  import {
    findMenuType,
    findMenu,
    findCustomFood,
    doAddCustomFood,
    findAddress,
    findStandardMenuComposition,
    findNutri
  } from '../../api/menu'


  export default {
    name: 'diet-list',
    components: {
      hmNav,
      hmScroll,
      hmImgUpload
    },
    watch: {
      menuName() {
        this.handlerSearchByName()
      },
      selfName() {
        this.handlerSearchByName2()
      },
      currentTab() {
        switch (this.currentTab) {
          case '1':
            this.searchOptionByMenu.page = 1
            this.findMenu(this.searchOptionByMenu)
            this.$refs.hmNav.handleSetId(0)
            break
          case '2':
            this.searchOptionBySelf.page = 1
            this.findCustomFood(this.searchOptionBySelf)
            this.$refs.hmNav.handleSetId(-1)
            break
        }
      }
    },
    computed: {
      userId() {
        return this.$store.state.user.userId
      }
    },
    data() {
      return {
        isAdd: false,
        loading: false,
        isDetail: false,
        currentTab: '1',
        currentSelect: 0,
        currentType: '类型',
        labelShow: false,
        helpShow: false,
        detailData: {},
        nutriObj: {
          //成分数据对象
          protein: 0, //蛋白质
          energyKcal: 0, //能量
          fat: 0, //脂肪
          fe: 0, //铁
          ca: 0, //钙
          cho: 0 //碳水化合物
        },
        defaultImg: 'this.src="' + require('../../assets/default/food.jpg') + '"',
        //自定义类型
        customizeTypeData: [
          {
            id: -1,
            name: '我的',
            expanded: false,
            children: []
          },
          {
            id: -2,
            name: '共享',
            expanded: false,
            children: []
          }
        ],
        selfForm: {}, //添加自定义食物对象
        menuTypeData: [], //菜品类型
        dataShow: [],
        menuData: [], //菜品数据
        selfData: [], //自定义食物数据
        menuName: '', //菜谱名称查询
        selfName: '', //自定义食物名称查询
        addForm: [],
        addressData: [],//地址数据
        imgArray: [], //图片数组
        searchOptionByMenu: {
          //自定菜谱用查询对象
          size: 30,
          page: 1
        },
        searchOptionBySelf: {
          //自定义食物用查询对象
          size: 30,
          page: 1
        }
      }
    },
    mounted() {
      this.findMenuType()
      this.findAddress()
      this.findMenu(this.searchOptionByMenu)
      if (this.$route.query.data) {
        this.addForm = this.$route.query.data
      }
    },
    methods: {
      //刷新滑动
      scrollRefresh() {
        window.scroll(0, 0);
      },
      //获取菜品列表
      async findMenu(params) {
        let res = await findMenu(params)
        if (res.code === 200) {
          this.dataShow = res.data.list
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
      },
      //获取自定义食物列表
      async findCustomFood(params) {
        let res = await findCustomFood(params)
        if (res.code === 200) {
          this.dataShow = res.data.list
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
      },
      //获取地址
      async findAddress() {
        let res = await findAddress()
        if (res.code === 200) {
          console.log(res)
          this.addressData = utils.array2tree(res.data)
          //this.selfData = res.data.list
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
      },
      async loadMore() {
        if (this.loading) {
          return
        }
        this.loading = true
        Indicator.open('加载中...')
        setTimeout(async () => {
          // 加载更多菜品
          if (this.currentTab === '1') {
            this.searchOptionByMenu.page += 1
            let res = await findMenu(this.searchOptionByMenu)
            if (res.code === 200) {
              res.data.list.forEach((element) => {
                //this.menuData.push(element)
                this.dataShow.push(element)
              })
              if (res.data.list.length === 0) {
                this.searchOptionByMenu.page -= 1
                Toast({
                  message: '没有更多数据',
                  position: 'bottom',
                  duration: 2000
                })
              }
            } else {
              Toast({
                message: '网络异常',
                position: 'bottom',
                duration: 2000
              })
            }
          } else {
            this.searchOptionBySelf.page += 1
            let res = await findCustomFood(this.searchOptionBySelf)
            if (res.code === 200) {
              res.data.list.forEach((element) => {
                this.dataShow.push(element)
              })
              if (res.data.list.length === 0) {
                this.searchOptionBySelf.page -= 1
                Toast({
                  message: '没有更多数据',
                  position: 'bottom',
                  duration: 2000
                })
              }
            } else {
              Toast({
                message: '网络异常',
                position: 'bottom',
                duration: 2000
              })
            }
          }
          this.loading = false
          Indicator.close()
        }, 500)
      },
      // 获取菜谱数据
      async getMenuData(code) {
        let res = await findStandardMenuComposition({ menuCode: code })
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
            nutri = await this.findNutri(res.data[i].composition, res.data[i].quantity, nutri)
          }
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
        this.nutriObj =  nutri
      },
      //获取食物标准成分
      async findStandardMenuComposition(menuCode) {
        let params = {
          menuCode: menuCode
        }
        let res = await findStandardMenuComposition(params)
        if (res.code === 200) {
          if (res.data.length > 0) {
            res.data.forEach((v) => {
              this.findNutri(v.composition, v.quantity)
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
      async findNutri(name, quantity, nutri) {
        let weight = quantity.substring(0, quantity.length - 1)/100
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
      //获取菜品类型
      async findMenuType() {
        let res = await findMenuType()
        if (res.code === 200) {
          this.menuTypeData = utils.array2tree(res.data)
          this.menuTypeData.unshift({
            id: 0,
            name: '全部菜品',
            expanded: false,
            children: []
          })
        } else {
          Toast({
            message: '网络异常',
            position: 'bottom',
            duration: 2000
          })
        }
      },
      //添加自定义食物
      async doAddCustomFood() {
        if (this.formSubmit(this.selfForm)) {
          let form = {
            userId: this.userId,
            name: this.selfForm.name,
            weight: this.selfForm.weight,
            energy: this.selfForm.energy,
            composition: this.selfForm.composition ? this.selfForm.composition : ''
          }
          for (let i = 0; i < this.imgArray.length; i++) {
            if (i === 0) form.imgUrl1 = this.imgArray[i]
            if (i === 1) form.imgUrl2 = this.imgArray[i]
            if (i === 2) form.imgUrl3 = this.imgArray[i]
          }
          // console.log(form)
          let res = await doAddCustomFood(form)
          if (res.code === 200) {
            Toast({
              message: '添加成功',
              position: 'bottom',
              duration: 2000
            })
            this.isAdd = false
            this.findCustomFood(this.searchOptionBySelf)
          } else {
            Toast({
              message: '网络异常',
              position: 'bottom',
              duration: 2000
            })
          }
        }
      },
      //根据菜品名称查询菜品
      handlerSearchByName() {
        this.searchOptionByMenu.name = this.menuName
        this.searchOptionByMenu.page = 1
        this.findMenu(this.searchOptionByMenu)
      },
      //根据食物名称查询菜品
      handlerSearchByName2() {
        this.searchOptionBySelf.name = this.selfName
        this.searchOptionByMenu.page = 1
        this.findCustomFood(this.searchOptionBySelf)
      },
      //根据类型id查询菜品
      handleSearchById(id) {
        this.searchOptionByMenu.page = 1
        this.searchOptionBySelf.page = 1
        switch (true) {
          case id > 0:
            this.searchOptionByMenu.menuTypeId = id
            this.searchOptionByMenu.addressId = ''
            this.findMenu(this.searchOptionByMenu)
            break
          case id === 0:
            this.searchOptionByMenu.menuTypeId = ''
            this.searchOptionByMenu.addressId = ''
            this.findMenu(this.searchOptionByMenu)
            break
          case id === -1:
            this.searchOptionBySelf.userId = this.userId
            this.findCustomFood(this.searchOptionBySelf)
            break
          case id === -2:
            this.searchOptionBySelf.userId = ''
            this.findCustomFood(this.searchOptionBySelf)
            break
        }
      },
      //根据地址id查询菜品
      handleSearchById2(id) {
        this.searchOptionByMenu.page = 1
        this.searchOptionBySelf.page = 1
        switch (true) {
          case id > 0:
            this.searchOptionByMenu.addressId = id
            this.searchOptionByMenu.menuTypeId = ''
            this.findMenu(this.searchOptionByMenu)
            break
          case id === -1:
            this.searchOptionBySelf.userId = this.userId
            this.findCustomFood(this.searchOptionBySelf)
            break
          case id === -2:
            this.searchOptionBySelf.userId = ''
            this.findCustomFood(this.searchOptionBySelf)
            break
        }
      },
      //表单验证
      formSubmit(form) {
        let msg = ''
        let status = false
        if (form.name === '' || form.name == null) {
          msg = '食物名称不能为空'
        } else if (form.weight === '' || !utils.validateNumber2(form.weight)) {
          msg = '总重量请填写正整数'
        } else if (form.energy === '' || !utils.validateNumber2(form.energy)) {
          msg = '总能量请填写正整数'
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

      // 获取上传图片url
      getUploadImg(url) {
        // console.log(url)
        this.imgArray.push(url)
      },
      // 删除上传图片url
      delUploadImg(index) {
        // console.log(url)
        this.imgArray.splice(index, 1)
      },
      //提交表单
      handlerSubmit() {
        this.$router.push({
          name: 'diet_record',
          query: {
            data: this.addForm,
            type: this.$route.query.type,
            dietTime: this.$route.query.dietTime,
	          currentDate: this.$route.query.currentDate
          }
        })
      },
      handlerClick() {
        //打开标签modal
        this.labelShow = !this.labelShow
      },
      handlerClickHelp() {
        this.helpShow = !this.helpShow
      },
      addMenu(obj) {
        //添加标签
        let index = this.addedMenu(obj.id)
        if (index === -1) {
          obj.currentTab = this.currentTab
          this.addForm.push(obj)
        } else {
          this.addForm.splice(index, 1)
        }
      },
      addedMenu(id) {
        //校验标签是否已经存在
        let index = -1
        if (this.addForm.length > 0) {
          for (let i = 0; i < this.addForm.length; i++) {
            if (this.addForm[i].id === id) {
              index = i
              break
            }
          }
        }
        return index
      },
      watchCurrentSelect(id) {
        this.currentSelect = id
      },
      //打开自定义食物添加modal
      openAddModal() {
        this.$refs.imgUpload.updateImgUrl([])
        this.selfForm = {}
        this.isAdd = true
      },
      openDetailModal(item) {
        this.isDetail = true
        this.detailData = item
        this.getMenuData(item.code)
      }
    }
  }
</script>
<style>
  .mint-tab-item-label {
    font-size: 0.28rem;
    font-weight: 400;
    line-height: 0.4rem;
  }
</style>
<style lang="less" scoped>
  @import '../../assets/style/common.less';

  a {
    color: @light_grey;
  }

  .tab-btn {
    width: 98%;
    height: 0.6rem;
    .tab-btn-label {
      text-align: center;
      width: 49.5%;
      height: 100%;
      box-shadow: none;
      border: 0.01rem solid #dcdee2;
      transition: all .2s ease-in-out;
      padding: 0.05rem;
      font-size: 0.28rem;
      font-weight: 400;
      line-height: 0.5rem;
    }
    .normal {
      color: @black;
      background: @white;
    }
    .active {
      color: @white;
      background: @blue;
    }
  }

  .mint-navbar {
    height: 0.8rem;
    padding: 0 1.5rem;
  }

  .mint-navbar .mint-tab-item {
    font-size: 0.28rem;
    font-weight: 400;
    line-height: 0.4rem;
    padding: 0.24rem 0;
  }

  .mint-navbar .mint-tab-item.is-selected {
    border-bottom-width: 0.04rem;
    border-bottom-color: @blue-1;
    font-weight: 600;
    color: @black;
    margin-bottom: 0;
    padding: 0.24rem 0;
  }

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

  .hm-diet-list-btn {
    position: absolute;
    bottom: 1.72rem;
    right: 0.24rem;
    width: 0.84rem;
    height: 0.84rem;
    border-radius: 50%;
    .hm-label {
      padding: 0.05rem;
      position: absolute;
      overflow-y: scroll;
      width: 2.2rem;
      height: 4rem;
      bottom: 0.7rem;
      right: 0.8rem;
      border: 0.02rem solid @black;
      background: @white;
      border-radius: 0.08rem;
      .hm-label-item {
        max-width: 2rem;
        height: 0.44rem;
        background: @white;
        border-radius: 0.1rem;
        border: 0.02rem solid @blue;
        padding: 0.05rem;
        display: inline-block;
        margin-bottom: 0.08rem;
        span {
          font-size: 0.24rem;
          font-weight: 400;
          color: @blue;
          line-height: 0.34rem;
        }
      }
    }

    img {
      width: 100%;
      height: 100%;
    }
    .hm-flag {
      position: absolute;
      top: 0;
      right: 0;
      width: 0.36rem;
      height: 0.36rem;
      font-size: 0.26rem;
      font-weight: 500;
      color: @white;
      line-height: 0.44rem;
      background: @blue;
      text-align: center;
      border-radius: 50%;
    }
  }

  .hm-diet-list {
    margin-top: 1rem;
    padding-bottom: 3rem;
    position: relative;
    .hm-diet-list-header {
      width: 100%;
      height: 1.84rem;
      background: @white;
      box-shadow: 0 0.04rem 0.08rem 0 @grey-7;
      border-radius: 0.1rem;
      padding: 0 0.48rem;
      position: relative;
      z-index: 111;
      input {
        width: 6.52rem;
        height: 0.72rem;
        background: rgba(142, 142, 147, 0.12);
        border-radius: 0.2rem;
        margin-top: 0.18rem;
        padding: 0 0.1rem 0 0.7rem;
        font-size: 0.34rem;
        font-weight: 400;
        color: @black;
        line-height: 0.44rem;
        background-image: url('../../assets/logo/search.png');
        background-repeat: no-repeat;
        background-size: 0.28rem;
        background-position: 0.24rem;
      }
    }
    .hm-diet-list-body {
      width: 5.56rem;
      padding: 0.1rem 0.1rem 3rem 0.1rem;
      > div {
        display: inline-block;
        margin: 0.22rem 0.1rem;
        position: relative;
        img {
          width: 1.54rem;
          height: 1.48rem;
          border-radius: 0.1rem;
        }
        span {
          width: 1.54rem;
          text-align: center;
          display: block;
          font-size: 0.22rem;
          font-weight: 400;
          color: @black;
          line-height: 0.32rem;
          margin-top: 0.1rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        > div {
          position: absolute;
          bottom: 0.52rem;
          right: 0.1rem;
          width: 0.3rem;
          height: 0.3rem;
          border: 0.02rem solid @blue;
          border-radius: 50%;
        }
        .hm-active {
          background: @blue;
        }
      }
      .hm-img-btn {
        img {
          position: absolute;
          width: 0.78rem;
          height: 0.78rem;
          left: 50%;
          top: 50%;
          margin-left: -0.39rem;
          margin-top: -0.39rem;
        }
      }
    }
  }

  .hm-img-btn {
    width: 1.58rem;
    height: 1.58rem;
    background: @grey-8;
    border-radius: 0.1rem;
    margin: 0.22rem 0.1rem;
    display: inline-block;
    position: relative;
    img {
      position: absolute;
      width: 0.78rem;
      height: 0.78rem;
      left: 50%;
      top: 50%;
      margin-left: -0.39rem;
      margin-top: -0.39rem;
    }
  }

  .hm-modal {
    width: 6.06rem;
    padding: 0.38rem 0.6rem;
    background: @white;
    border-radius: 0.3rem;
    box-shadow: 0 0.06rem 0.1rem 0 rgba(83, 83, 83, 0.16);
    text-align: center;
    /*h2{*/
    /*font-size: 0.3rem;*/
    /*font-weight: 500;*/
    /*line-height: 0.4rem;*/
    /*}*/
    h2{
      padding: 0.2rem 0;
    }
    ul {
      margin-top: 0.3rem;
    }
    ul li {
      margin: 0.1rem 0;
      padding-left: 0.3rem;
    }
    .img-size {
      max-width: 100%;
      width: 3rem;
      height: 3rem;
    }
    textarea {
      width: 100%;
      height: 2.5rem;
      outline: none;
      font-size: 0.28rem;
      font-weight: 500;
      color: @black;
      line-height: 0.4rem;
      padding: 0.05rem;
    }
  }

  .hm-flex {
    display: flex;
    display: -webkit-flex;
    justify-content: space-between;
    -webkit-justify-content: space-between;
  }
</style>
