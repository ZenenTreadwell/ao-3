const _ = require( 'lodash')

const state = {
    parent: [],
    panel: [],
    top: 0,
    completed: false,
}

const mutations = {
    toggleCompleted(state){
        state.completed = !state.completed
    },
    setParent(state, p){
        state.parent = p
    },
    setPanel(state, panel){
          state.panel = panel
    },
    setTop(state, top){
          state.top = top
    },
    addParent(state, pId){
        state.parent = _.filter(state.parent, p => p !== pId)
        state.parent.push(pId)
    },
    goToParent(state, tId){
        let popped = false
        while (popped !== tId && state.parent.length !== 0){
            popped = state.parent.pop()
        }
    },
}

const actions = {
    goIn({commit}, pContext ){
        console.log('goIn hit')
        commit("setMode", 0)
        commit("setPanel", pContext.panel)
        commit("setTop", pContext.top)
        pContext.parents.forEach(p => {
            commit("addParent", p)
        })
    },
    goUp({commit}, pContext){
        console.log('goUp hit')
        commit("setMode", 0)
        commit("goToParent", pContext.target)
        commit("setPanel", pContext.panel)
        commit("setTop", pContext.top)
    },
}

const getters = {}

module.exports = {
    state,
    mutations,
    actions,
    getters,
}
