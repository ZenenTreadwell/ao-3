
import { createStore } from 'vuex'

import _ from 'lodash'
import modules from './modules'
import loader from './modules/loader'
import eventstream from './modules/eventstream'
import upgrades from './modules/upgrades'
import context from './modules/context'
import calculations from './calculations'

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
      selectedCheckCard(state, getters){
          let x = state.upgrades.selectedCheck
          if (getters.contextCompleted[x]){
              return getters.contextCompleted[x]
          }
          return false
      },
      bountyList(state, getters){
          return state.tasks
              .filter(t => t.completeValue >= 1 && getters.memberIds.indexOf(t.taskId) === -1)
              .sort((a,b) => b.completeValue - a.completeValue)
      },
      recentMembers(state){
          let recentMembers = []
          recentMembers = state.members.slice()
          recentMembers.sort((a, b) => {
              return b.lastUsed - a.lastUsed
          })
          return recentMembers
      },
      warpDrive(state, getters){
          return getters.liveConnections[state.upgrades.warp]
      },
      memberCard(state, getters){
          let memberCard = _.merge(calculations.blankCard('', '', ''), state.tasks[state.hashMap[getters.member.memberId]])
          return memberCard
      },
      contextCard(state){
          let contextCard = _.merge(calculations.blankCard('', '', ''), state.tasks[state.hashMap[state.context.panel[state.context.top]]])
          return contextCard
      },
      contextDeck(state, getters){
          return getters.contextCard.subTasks.slice().reverse().map(t => state.tasks[state.hashMap[t]]).filter(t => !!t && t.color )
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
      // contextGuilds(state, getters){
      //     if (getters.contextMember){
      //         return state.tasks.filter(t => t.deck.indexOf(getters.contextMember.memberId) > -1)
      //     }
      // },
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
          getters.contextCompleted.forEach(c => {
              c.claimed.forEach(mId => {
                  if (getters.contextCard.deck.indexOf(mId) > -1){
                      byCompletion.push(mId)
                  }
              })
          })
          getters.contextCard.deck.forEach(mId => {
              byCompletion.push(mId)
          })
          return _.uniq(byCompletion)
      },
      all(state, getters){
          if (state.context.completed){
              return getters.contextCompleted
          }
          return getters.contextDeck
      },
      red(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'red')
          }
          return getters.contextDeck.filter(d => d.color === 'red')
      },
      yellow(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'yellow')
          }
          return getters.contextDeck.filter(d => d.color === 'yellow')
      },
      green(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'green')
          }
          return getters.contextDeck.filter(d => d.color === 'green')
      },
      purple(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'purple')
          }
          return getters.contextDeck.filter(d => d.color === 'purple')
      },
      blue(state, getters){
          if (state.context.completed){
              return getters.contextCompleted.filter(d => d.color === 'blue')
          }
          return getters.contextDeck.filter(d => d.color === 'blue')
      },
      memberIds(state){
          return state.members.map(c => c.memberId)
      },
      presentIds(state){
          let now = Date.now()
          return state.members
              .filter(c => c.memberId && now - c.lastUsed < 3600000 * 4)
              .map(c => c.memberId)
      },
      resourceIds(state){
          return state.resources.map(c => c.resourceId)
      },
      guilds(state) {
          let gg = state.tasks
              .filter(p => p.guild)
          return gg.sort( (a, b) => b.deck.length - a.deck.length )
      },
      uniqGuilds(state, getters) {
          let uniq = []
          return getters.guilds.filter(g => {
              let baseG = g.guild.split(':')[0]
              if (baseG && uniq.indexOf(baseG) === -1){
                  uniq.push(baseG)
                  return true
              }
              return false
          })
      },
      isLoggedIn(state, getters){
          let isLoggedIn = !!getters.member.memberId
          return isLoggedIn
      },
      member(state){
          let loggedInMember = {}
          let memberId = false
          state.sessions.forEach(session => {
              if (state.loader.session === session.session){
                  memberId = session.ownerId
              }
          })

          state.members.forEach( m => {
              if (m.memberId === memberId) {
                  _.assign(loggedInMember, m)
              }
          })
          return loggedInMember
      },
      confirmedBalance(state){
          let confirmedBalance = 0
          state.cash.info.outputs.forEach(o => {
              if (o.status === "confirmed"){
                  confirmedBalance += o.value
              }
          })
          return confirmedBalance
      },
      totalLocal(state){
          let totalLocal = 0
          state.cash.channels.forEach(c => {
              totalLocal += c.channel_sat
          })
          return totalLocal
      },
      totalRemote(state){
          let totalRemote = 0
          state.cash.channels.forEach(c => {
              totalRemote += (c.channel_total_sat - c.channel_sat)
          })
          return totalRemote
      },
      totalWallet(state, getters){
          return parseInt( getters.totalLocal ) +  parseInt( getters.confirmedBalance )
      },
      satPointSpot(state){
          if (state.cash.spot > 0){
              return calculations.cadToSats(1, state.cash.spot)
          }
          return 10000
      },
      membersVouches(state){
          let members = state.members.slice()
          let vouches = []
          members.forEach(m => {
              let memberCard = state.tasks[state.hashMap[m.memberId]]
              memberCard.deck.forEach(v => {
                  let prevCount = vouches.find(c => c.memberId === v)
                  if(!prevCount) {
                      vouches.push({ memberId: v, count: 0 })
                  } else {
                      prevCount.count++
                  }
              })
          })
          return vouches
      },
      liveConnections(state){
          return state.ao.filter(r => r.state && r.state.cash && r.state.cash.alias)
      },
      weights(state, getters){
          let w = {}
          getters.memberIds.forEach(mId => {
              let member = state.tasks[state.hashMap[mId]]
              member.priorities.forEach(p => {
                  if (!w[p]) {
                      w[p] = 1 / member.priorities.length
                  } else {
                      w[p] += (1 / member.priorities.length)
                  }
              })
          })
          return w
      },
      topcard(state, getters){
          let topId
          let topW = 0
          Object.keys(getters.weights).forEach(tId => {
              if (getters.weights[tId] > topW){
                  topW = getters.weights[tId]
                  topId = tId
              }
          })
          return state.tasks[state.hashMap[topId]]
      },
  },
  middlewares: [],
  strict: process.env.NODE_ENV !== 'production'
})
