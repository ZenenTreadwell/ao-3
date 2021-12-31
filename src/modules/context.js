// const _ = require( 'lodash')
const state = []

const mutations = {
    goGo(state, x){
        state.length = 0
        x.forEach(y => state.push(y))
        window.scrollTo(0, 0);
    },
    goDeeper(state, target){
        let targetIndex = state.indexOf(target)
        if (targetIndex === -1){
            state.push(target)
        } else if (targetIndex !== state.length - 1){
            let swapy = state[state.length - 1]
            state[state.length - 1] = target
            state[targetIndex] = swapy
        }
        window.scrollTo(0, 0);
    },
    goHigher(state, tId){
        let popped = false
        let i = 0
        popped, i
        while(state[state.length - 1] !== tId && state.length !== 1) {
            popped = state.pop()
            i ++
        }
    },
    addParent(state, tId){
        let p = state.pop()
        state.push(tId)
        state.push(p)
    },
    applyEvent(state, ev){
        if (ev.type === 'task-removed' && ev.taskId === state[state.length - 1]){
            state.pop()
        }
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
