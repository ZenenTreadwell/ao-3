const _ = require('lodash')
const M = require( '../mutations')

const state = {}

const mutations = {
    setCurrent(hashMap, currentHashMap){
        _.assign(hashMap, currentHashMap.hashMap)
    },
    applyEvent: M.hashMapMuts
}

const actions = {}

module.exports = {
  state,
  mutations,
  actions
}
