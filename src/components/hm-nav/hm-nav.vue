<template>
  <div>
    <nav class="hm-nav">
      <ul>
        <li v-for="(item,index) in typeData" >
          <div @click="handleExpanded(index,item.id)">
            <p :class="item.children.length === 0 && currentId === item.id?'hm-active':''">{{item.name}}</p>
            <img v-if="item.children.length>0" :class="item.expanded?'hm-icon hm-icon-active':'hm-icon'" src="../../assets/logo/arrow.png"/>
          </div>
          <ul :class="item.expanded && item.children.length>0?'hm-visible':'hm-hover'">
            <li v-for="(item2,index2) in item.children" @click="handleSetId(item2.id)" :class="currentId === item2.id?'hm-active':''">{{item2.name}}</li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
  export default {
    name: "hm-nav",
    props:['typeData'],
    watch:{
        currentId:'emitCurrentId'
    },
    data() {
      return {
        currentId:0,
      }
    },
    methods: {
      handleExpanded(index,id) {
        if(this.typeData[index].children.length>0){
          this.typeData[index].expanded = !this.typeData[index].expanded
        }else{
          this.handleSetId(id)
        }
      },
      handleSetId(id){
        if(this.currentId !== id){
          this.$emit('handleSearchById',id)
          this.currentId = id
        }
      },
      emitCurrentId(){
        this.$emit('watchCurrentSelect',this.currentId)
      }
    }
  }
</script>

<style lang="less" scoped>
  .hm-nav {
    width: 1.94rem;
    background: rgba(236, 236, 236, 1);
    height: 10rem;
    overflow: scroll;
    padding: 0.32rem 0.1rem;
    margin-top: 0.04rem;
    border-radius: 0.05rem;
    ul, li {
      list-style: none;
    }
    > ul > li {
      width: 100%;
      padding: 0.1rem 0.05rem;
      font-size: 0.28rem;
      font-weight: 400;
      color: @black;
      line-height: 0.40rem;
      text-align: left;
      position: relative;
      .hm-icon{
        position: absolute;
        right: 0.05rem;
        top:0.23rem;
        width: 0.18rem;
        height: 0.18rem;
        transform: rotate(180deg);
        transition: all .2s ease-in-out;
      }
      .hm-icon-active{
        transform: rotate(270deg);
      }
    }
    > ul > li > ul {
      margin-top: 0.2rem;
    }
    > ul > li > ul > li {
      width: 100%;
      padding: 0.08rem 0 0.1rem 0.25rem;
      font-size: 0.26rem;
      font-weight: 400;
      color: @black;
      line-height: 0.34rem;
      text-align: left;
    }
    .hm-active{
      color: @blue;
    }
    .hm-hover{
      transition:all 0.2s ease-in-out;
      opacity: 0;
      visibility: hidden;
      height: 0;
    }
    .hm-visible{
      transition:all 0.2s ease-in-out;
      opacity: 1;
      visibility: visible;
      height: 100%;
    }
  }
</style>
