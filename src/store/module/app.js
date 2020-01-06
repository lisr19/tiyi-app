export default {
  state:{
    hmAppIntake: localStorage.getItem('hmAppIntake'),
    intake:0
  },
  mutations: {
    setIntake(state, intake) {
      state.intake = intake
    },
  },
  getters: {
  },
  actions: {
    // 设置摄入能量
    handleSetIntake({ state, commit }) {
      const intake = localStorage.getItem('hmAppIntake')
      commit('setIntake', intake)
    },
  }
}
