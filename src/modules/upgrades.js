const modes = ["doge", "boat", "timecube", "chest", "badge"]
const paymodes = ["mempool", "bitcoin", "lightning", "channels"]

const state = {
    search: '',
    modes,
    paymodes,
    mode: modes[0],
    paymode: paymodes[1],
    showAccounts: false,
    showNodeInfo: false,
    showSettings: false,
    bird: false,
    barking: false,
    pinging: false,
    chosenDay: new Date().getDate()
}

const mutations = {
    closeAll(state){
        state.showAccounts = false;
        state.showNodeInfo = false;
        state.showSettings = false;
    },
    toggleNodeInfo(state){
        state.showNodeInfo = !state.showNodeInfo
        state.showAccounts = false
        state.showSettings = false
    },
    toggleAccounts(state){
        state.showAccounts = !state.showAccounts
        state.showSettings = false
        state.showNodeInfo = false
    },
    toggleSettings(state){
        state.showSettings = !state.showSettings
        state.showNodeInfo = false
        state.showAccounts = false
    },
    chooseDay(state, x){
        state.chosenDay = x
        if (x >= 0){
            state.mode = modes[1]
        } else {
            state.mode = modes[2]
        }
    },
    setSearch(state, x){
        console.log('setsearch called', x)
        state.search = x
    },
    toggleBird(state){
        state.bird = !state.bird
    },
    nextMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let nextIndex = (currentIndex + 1) % modes.length
        let target = modes[nextIndex]
        state.mode = target
    },
    previousMode(state) {
        let currentIndex = modes.indexOf(state.mode)
        let prevIndex = (currentIndex <= 0) ? modes.length - 1 : (currentIndex - 1)
        state.mode = modes[prevIndex]
    },
    setMode(state, index) {
        if (index === 1){
            state.chosenDay = new Date().getDate()
        } else if (index === 2){
            state.chosenDay = undefined
        }
        state.mode = modes[index]
    },
    closeUpgrades(state) {
        state.mode = modes[0]
    },
    setPayMode(state, index) {
        state.paymode = paymodes[index]
    },
    closePayMode(state) {
        state.paymode = false
    },
    bark(state) {
        state.barking = true
        state.pinging = true
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
