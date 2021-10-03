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
    goIn({state,commit}, pContext ){
        console.log('goIn called ', pContext)
        commit("setPanel", pContext.panel)
        commit("setTop", pContext.top)
        if (pContext.parents.length > 0){
            pContext.parents.forEach(p => {
              console.log('add parent called ?')
              if (state.panel[state.top] !== p){
                commit("addParent", p)
              }
            })
        } else {
            commit("setParent", pContext.parents)
        }
    },
    goUp({state, commit}, pContext){
        if (state.parent.indexOf(pContext.target) === -1){
            commit("addParent", pContext.target)
        }
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
