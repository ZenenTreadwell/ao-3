// const _ = require( 'lodash')

const state = []

const mutations = {
    goGo(state, x){
        state.length = 0
        x.forEach(y => state.push(y))
        window.scrollTo(0, 0);
    },
    goDeeper(state, target){
        state.push(target)
        window.scrollTo(0, 0);

    },
    goHigher(state, tId){
        let popped = false
        let i = 0
        while(state[state.length - 1] !== tId && state.length !== 1) {
            popped = state.pop()
            i ++
        }
    },
    addParent(state, tId){
        let p = state.pop()
        state.push(tId)
        state.push(p)
    }
}

const actions = {}

const getters = {}

module.exports = {
    state,
    mutations,
    actions,
    getters,
}
