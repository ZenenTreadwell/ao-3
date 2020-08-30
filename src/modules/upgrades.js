const Vue = require( 'vue')
const modes = ["doge", "boat", "timecube", "chest", "badge"]
const payments = ["bitcoin", "lightning"]
const dimensions = ["unicorn", "sun", "bull"]

const state = {
    search: '',
    modes,
    mode: modes[0],
    dimension: dimensions[0],
    bird: false,
    barking: false,
    pinging: false,
    chosenDay: false
}

const mutations = {
    chooseDay(state, x){
        state.chosenDay = x
    },
    setSearch(state, x){
        state.search = x
    },
    toggleBird(state){
        state.bird = !state.bird
    },
    nextMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let nextIndex = (currentIndex + 1) % modes.length
        let target = modes[nextIndex]
        console.log('in nextmode current, index, target', state.mode, nextIndex, target)
        state.mode = target
    },
    previousMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let prevIndex = (currentIndex <= 0) ? modes.length - 1 : (currentIndex - 1)
        state.mode = modes[prevIndex]
    },
    setMode(state, index) {
        state.mode = modes[index]
    },
    closeUpgrades(state) {
        state.mode = modes[0]
    },
    setPayMode(state, index) {
        state.payment = payments[index]
    },
    closePayMode(state) {
        state.payment = false
    },
    setDimension(state, index) {
        state.dimension = dimensions[index]
    },
    closeDimension(state) {
        state.dimension = false
    },
    bark(state) {
        state.barking = true
        state.pinging = true
        // XXX - should be sync? Works!?
        setTimeout(()=> {
            state.barking = false
        }, 1000)
        setTimeout(()=> {
            state.pinging = false
        }, 2000)
    }
}

module.exports = {
    state,
    mutations,
}
