const M = require('../mutations')

const state = []

const mutations = {
    applyEvent: M.tasksMuts,
    loadCards(state, ev){
        console.log("loading cards", ev.length, state.length)
        ev.forEach(x => {
            state.push(x)
        })
    }
}

const actions = {

}

module.exports = {
  state,
  mutations,
  actions
}
