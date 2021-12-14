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
        console.log('toggle completed', state.completed)
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
        commit("setPanel", pContext.panel)
        commit("setTop", pContext.top)
        commit("setParent", pContext.parents)
        window.scrollTo(0, 0);
    },
    goUp({state, commit}, pContext){
        if (state.parent.indexOf(pContext.target) === -1){
            commit("addParent", pContext.target)
        }
        commit("goToParent", pContext.target)
        commit("setPanel", pContext.panel)
        commit("setTop", pContext.top)
        window.scrollTo(0, 0);
    },
    // goDeeper({commit, state}, taskId){
    //     let p = state.parent
    //     p.push(state.panel[0])
    //     commit("setPanel", [taskId])
    //     commit("setTop", 0)
    //     commit("setParent", p)
    //     window.scrollTo(0, 0);
    // }
}

const getters = {}

module.exports = {
    state,
    mutations,
    actions,
    getters,
}
