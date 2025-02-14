
import { createStore } from 'vuex'

import _ from 'lodash'
import modules from './modules'
import loader from './modules/loader'
import eventstream from './modules/eventstream'
import upgrades from './modules/upgrades'
import context from './modules/context'

export default createStore({
  modules: {
      loader, eventstream, upgrades, context,
      ao: modules.ao,
      members: modules.members,
      tasks: modules.tasks,
      resources: modules.resources,
      cash: modules.cash,
      sessions: modules.sessions,
      hashMap: modules.hashMap,
  },
  getters: {
      pinGroups(state){
          let groupings = [], uniqBase = []
          state.cash.pins.forEach(taskId => {
              let g = state.tasks[state.hashMap[taskId]]
              let baseSplit = g.guild.split(':')
              let baseG = baseSplit[0]
              let i = uniqBase.indexOf(baseG)
              if (i === -1){
                  uniqBase.push(baseG)
                  groupings.push([g.taskId])
                  return true
              } else {
                  groupings[i].push(g.taskId)
              }
              return false
          })
          return {
              uniqBase,
              groupings
          }
      },
      memberCard(state, getters){
          return state.tasks[state.hashMap[getters.member.memberId]]
      },
      contextCard(state){
          return state.tasks[state.hashMap[ state.context[state.context.length - 1]]]
      },
      contextDeck(state, getters){
          return getters.contextCard.subTasks
              .map(t => state.tasks[state.hashMap[t]])
      },
      contextCompleted(state, getters){
          let upValence = []
          let downValence = []
          getters.contextCard.highlights.forEach(h => {
              if (h.valence){
                  upValence.push(h.memberId)
              } else {
                  downValence.push(h.memberId)
              }
          })
          return getters.contextCard.completed
              .map(tId => state.tasks[state.hashMap[tId]])
              .filter(t => {
                  return (
                      upValence.every(mId => t.claimed.indexOf(mId) > -1) &&
                      downValence.every(mId => t.claimed.indexOf(mId) === -1)
                  )
              })
              .sort( (a, b) => a.lastClaimed < b.lastClaimed)
      },
      completedByColor(state, getters){
          let red = 0
          let yellow = 0
          let green = 0
          let blue = 0
          let purple = 0
          getters.contextCompleted.forEach(t => {
              switch (t.color){
                  case "red": red += t.claims.length
                      break
                  case "yellow": yellow  += t.claims.length
                      break
                  case "green": green += t.claims.length
                      break
                  case "blue": blue += t.claims.length
                      break
                  case "purple": purple += t.claims.length
                      break
              }
          })
          return {
              red, yellow, green, blue, purple
          }
      },
      contextMember(state, getters){
          let contextMem = false
          state.members.some(m => {
              if (m.memberId === getters.contextCard.taskId){
                  contextMem = m
              }
          })
          return contextMem
      },
      contextResource(state, getters){
        let contextRes = false
        state.resources.some(r => {
            if (r.resourceId === getters.contextCard.taskId){
                contextRes = r
            }
        })
        return contextRes
      },
      contextRelevantMembers(state, getters){
          let byCompletion = []
          getters.contextCard.deck.forEach(mId => {
              byCompletion.push(mId)
          })
          getters.contextCompleted.forEach(c => {
              c.claimed.forEach(mId => {
                  if (getters.contextCard.deck.indexOf(mId) > -1){
                      byCompletion.push(mId)
                  }
              })
          })
          return _.uniq(byCompletion)
      },
      // fivestack view
      red(state, getters){
          return getters.contextDeck.filter(d => d.color === 'red')
      },
      yellow(state, getters){
          return getters.contextDeck.filter(d => d.color === 'yellow')
      },
      green(state, getters){
          return getters.contextDeck.filter(d => d.color === 'green')
      },
      purple(state, getters){
          return getters.contextDeck.filter(d => d.color === 'purple')
      },
      blue(state, getters){
          return getters.contextDeck.filter(d => d.color === 'blue')
      },
      isLoggedIn(state, getters){
          return getters.member.memberId
      },
      member(state){
          let loggedInMember = {}
          let memberId = false
          state.sessions.some(session => {
              if (state.loader.session === session.session){
                  memberId = session.ownerId
                  return true
              }
          })

          state.members.some( m => {
              if (m.memberId === memberId) {
                  _.assign(loggedInMember, m)
                  return true
              }
          })
          return loggedInMember
      },
  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
