import Vue from 'vue'
import Router from 'vue-router'
import store from '@/store'
import utils from '../utils/util'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)
const LOGIN_PAGE_NAME = 'login'
const routers = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/view/login/login')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/view/login/register')
  },
  // {
  //   path: '/forget_password',
  //   name: 'forget_password',
  //   component: () => import('@/view/login/forget-password')
  // },
  {
    path: '/home',
    name: 'home',
    component: () => import('@/view/home/home')
  },
  {
    path: '/record_detail',
    name: 'record_detail',
    component: () => import('@/view/detail/record-detail')
  },
  {
    path: '/diet_record',
    name: 'diet_record',
    component: () => import('@/view/record/diet-record')
  },
  {
    path: '/diet_list',
    name: 'diet_list',
    component: () => import('@/view/record/diet-list')
  },
  {
    path: '/motion_record',
    name: 'motion_record',
    component: () => import('@/view/record/motion-record')
  },
	{
		path: '/record_bulv',
		name: '运动记录补录',
		component: () => import('@/view/record/record-bulv')
	},
  {
    path: '/msg',
    name: 'msg',
    component: () => import('@/view/msg/msg')
  },
  {
    path: '/myself',
    name: 'myself',
    component: () => import('@/view/myself/myself')
  },
  {
    path: '/myself_info',
    name: 'myself_info',
    component: () => import('@/view/myself/myself-info')
  },
  {
    path: '/sign_history',
    name: 'sign_history',
    component: () => import('@/view/record/sign-history')
  },
  {
    path: '/diet_history',
    name: 'diet_history',
    component: () => import('@/view/record/diet-history')
  },
  {
    path: '/motion_history',
    name: 'motion_history',
    component: () => import('@/view/record/motion-history')
  },
  {
    path: '/motion_detail',
    name: 'motion_detail',
    component: () => import('@/view/detail/motion-detail')
  },
  {
    path: '/diet_detail',
    name: 'diet_detail',
    component: () => import('@/view/detail/diet-detail')
  },
  {
    path: '/msg_detail',
    name: 'msg_detail',
    component: () => import('@/view/detail/msg-detail')
  },

  {
    path: '/update_password',
    name: 'update_password',
    component: () => import('@/view/myself/update-password')
  },
]

const router = new Router({
  mode: 'history', //后端支持可开
  // mode:'hash',
  routes: routers
})

router.beforeEach((to, from, next) => {
  const token = utils.getToken()
  if (!token && to.name !== LOGIN_PAGE_NAME) {
    if (to.name !== 'register') {
      document
        .querySelector('body')
        .setAttribute('style', 'background: rgba(255,255,255,1);')
      // 未登录且要跳转的页面不是登录页
      next({
        name: LOGIN_PAGE_NAME // 跳转到登录页
      })
    } else {
      next() // 跳转
    }
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    document
      .querySelector('body')
      .setAttribute('style', 'background: rgba(255,255,255,1);')
    // 未登陆且要跳转的页面是登录页
    next() // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: 'home' // 跳转到home页
    })
  } else {
    if (!store.state.hasGetInfo) {
      store.dispatch('getUserInfo')
      store.dispatch('handleSetIntake')
    }
    if (
      to.name === 'home' ||
      to.name === 'diet_record' ||
      to.name === 'motion_record' ||
      to.name === 'diet_list'
    ) {
      document
        .querySelector('body')
        .setAttribute('style', 'background: rgba(255,255,255,1);')
    } else if (to.name === 'myself') {
      document
        .querySelector('body')
        .setAttribute('style', 'background: rgb(237,237,237,1);')
    } else {
      document
        .querySelector('body')
        .setAttribute('style', 'background: rgb(249,249,249,1);')
    }
    next() // 跳转
  }
})
export default router
