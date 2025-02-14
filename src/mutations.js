const _ = require('lodash')
const calculations = require('./calculations')

let inAddressConnect, outAddressConnect, color, colors

function aoMuts(aos, ev) {
  switch (ev.type) {
    case "ao-inbound-connected":
      inAddressConnect = aos.some(a => {
        if (a.address === ev.address) {
          a.alias = ev.alias
          a.inboundSecret = ev.secret
          a.lastContact = Date.now()
          return true
        }
      })
      if (!inAddressConnect) {
        let newEv = {
          alias: ev.alias,
          address: ev.address,
          outboundSecret: false,
          inboundSecret: ev.secret,
          lastContact: Date.now(),
        }
        aos.push(newEv)
      }
      break
    case "ao-outbound-connected":
      outAddressConnect = aos.some(a => {
        if (a.address === ev.address) {
          a.outboundSecret = ev.secret
          a.lastContact = Date.now()
          return true
        }
      })
      if (!outAddressConnect) {
        let newEv = {
          address: ev.address,
          outboundSecret: ev.secret,
          inboundSecret: false,
          lastContact: Date.now(),
          alias: 'ao',
        }
        aos.push(newEv)
      }
      break
    case "ao-disconnected":
      aos.some((ao, i) => {
        if (ao.address === ev.address) {
          aos.splice(i, 1)
          return true
        }
      })
      break
  }
}

function cashMuts(cash, ev) {
  switch (ev.type) {
    case "spot-updated":
      cash.spot = ev.spot
      break
    case "currency-switched":
      cash.currency = ev.currency
      break
    case "rent-set":
      cash.rent = parseFloat(ev.amount)
      break
    case "cap-set":
      cash.cap = ev.amount
      break
    case "task-boosted": // keep on card?
      cash.usedTxIds.push(ev.txid)
      break
    case "task-boosted-lightning":
      cash.pay_index = ev.pay_index
      break
    case "get-node-info":
      cash.info = ev.info
      break
    case "task-guilded":
      cash.pins = _.filter(cash.pins, p => p !== ev.taskId)
      if (ev.guild && ev.guild.split(':')[0]){
          cash.pins.push(ev.taskId)
      }
      break
    case "task-removed": 
      cash.pins = _.filter(cash.pins, p => p !== ev.taskId)
      break 
    case "tasks-received":
      ev.tasks.forEach(t => {
         cash.pins = _.filter(cash.pins, p => p !== t.taskId)
      })
      ev.tasks.forEach(t => {
        if (t.guild && t.guild.split(':')[0]){
          cash.pins.push(t.taskId)
        }
      })
      break
  }
}

function membersMuts(members, ev) {
  switch (ev.type) {
    case "task-claimed":
        members.forEach(member => {
            if (member.memberId === ev.memberId  && member.action === ev.taskId) {
                member.action = false
            }
        })
        break
    case "ao-outbound-connected":
      break
    case "ao-disconnected":
      break
    case "member-created":
      members.push(calculations.blankMember(ev.memberId, ev.name, ev.fob, ev.secret, ev.timestamp))
      break
    case "member-activated":
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case "task-boosted":
      members.forEach(member => {
        if (member.memberId === ev.taskId) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case "task-boosted-lightning":
      members.forEach(member => {
        if (member.memberId === ev.taskId) {
          if (member.active < 0) {
            member.active = -1 * member.active
          } else {
            member.active++
          }
        }
      })
      break
    case "member-deactivated":
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          if (member.active > 0) {
            member.active = -1 * member.active - 1
          }
        }
      })
      break
    case "member-purged":
      members.forEach((member, i) => {
        if (member.memberId === ev.memberId) {
          members.splice(i, 1)
        }
      })
      break
    case "member-field-updated":
      members.forEach(member => {
        if (member.memberId === ev.memberId) {
          member[ev.field] = ev.newfield
        }
      })
      break
  }
  members.forEach(member => {
      if (member.memberId === ev.memberId  || ev.blame === member.memberId) {
          member.lastUsed = ev.timestamp
      }
  })
}
let resourceIds
function resourcesMuts(resources, ev) {
  switch (ev.type) {
    case "resource-created":
      resourceIds = resources.map(r => r.resourceId)
      if (resourceIds.indexOf(ev.resourceId) === -1) {
        resources.push(ev)
      } else {
        console.log("BAD data duplicate resource rejected in mutation, dup resource task likely created")
      }
      break
    case "resource-used":
      resources.forEach(resource => {
        if (resource.resourceId == ev.resourceId) {
          resource.stock -= parseInt(ev.amount)
        }
      })
      break
    case "resource-purged":
      resources.forEach((r, i) => {
        if (r.resourceId === ev.resourceId) {
          resources.splice(i, 1)
        }
      })
      break
    case "resource-stocked":
      resources.forEach(resource => {
        if (resource.resourceId == ev.resourceId) {
          resource.stock += parseInt(ev.amount)
        }
      })
      break
  }
}

let idHasSession
function sessionsMuts(sessions, ev) {
  switch (ev.type) {
    case "session-created":
      idHasSession = sessions.some(session => {
        // replace that sessions creds,
        let match = false
        if (session.ownerId === ev.ownerId) {
          match = true
          _.merge(session, ev)
        }
        return match // true terminates the some loop & idHasSession->true too
      })

      if (idHasSession) {
        // edited in session
      } else {
        // id didn't previously have session
        sessions.push(ev)
      }
      break
    case "session-killed":
      sessions.forEach((s, i) => {
        if (s.session == ev.session) {
          _.pullAt(sessions, i)
        }
      })
      break
    case "ao-outbound-connected":
      sessions.push({
        ownerId: ev.address,
        token: ev.secret,
        session: ev.address,
      })
      break
    case "member-purged": 
      sessions.forEach((s, i) => {
        if (s.ownerId == ev.memberId) {
          _.pullAt(sessions, i)
        }
      })
      break 
    case "ao-disconnected": 
      sessions.forEach((s, i) => {
        if (s.ownerId == ev.address) {
          _.pullAt(sessions, i)
        }
      })
      break 
  }
}

function hashMapMuts(hashMap, ev){
    let i
    switch(ev.type){
        case "ao-outbound-connected":
            if (!hashMap[ev.address]) {
                hashMap[ev.address] = ev.i
            }
            break
        case "ao-inbound-connected":
            if (!hashMap[ev.address]) {
                hashMap[ev.address] = ev.i
            }
            break
        case "task-created":
            hashMap[ev.taskId] = ev.i
            break
        case "member-created":
            hashMap[ev.memberId] = ev.i
            break
        case "resource-created":
            hashMap[ev.resourceId] = ev.i
            break
        case "tasks-received":{
            i = 0
            ev.tasks.forEach(t => {
                if (!(hashMap[t.taskId] >= 0)){
                    hashMap[t.taskId] = ev.i + i
                    i ++
                }
            })
            }break
        case "task-removed":
            delete hashMap[ev.taskId]
            Object.keys(hashMap).forEach(tId => {
                if (hashMap[tId] > ev.i){
                    hashMap[tId] --
                }
            })
            break
        case "ao-disconnected":
            i = hashMap[ev.address]
            delete hashMap[ev.address]
            Object.keys(hashMap).forEach(tId => {
                if (hashMap[tId] > i){
                    hashMap[tId] --
                }
            })
            break
        case "member-purged":
            i = hashMap[ev.memberId]
            delete hashMap[ev.memberId]
            Object.keys(hashMap).forEach(tId => {
                if (hashMap[tId] > i){
                    hashMap[tId] --
                }
            })
            break
        case "resource-purged":
            i =  hashMap[ev.resourceId]
            delete hashMap[ev.resourceId]
            Object.keys(hashMap).forEach(tId => {
                if (hashMap[tId] > i){
                    hashMap[tId] --
                }
            })
            break
    }
}

let explodingTask, absorbingTask, pirate, task, isExist, isExisting
function tasksMuts(tasks, ev) {
  switch (ev.type) {
    case "task-colored":
        tasks.forEach(task => {
            if (task.taskId === ev.taskId) {
                task.color = ev.color
            }
            if (task.taskId === ev.inId){
                if (task.stackView[ev.color] !== -1){
                    task.stackView[ev.color] = task.subTasks.length
                }
                task.subTasks = _.filter(task.subTasks, tId => tId !== ev.taskId)
                task.priorities = _.filter(task.priorities, tId => tId !== ev.taskId)
                task.subTasks.push(ev.taskId)
                tasks.forEach( taskLoop2 => { // dirty O(n^2)  ??
                    if ( task.priorities.indexOf(taskLoop2.taskId) >= 0){
                        taskLoop2.priorities = _.filter(taskLoop2.priorities, tId => tId !== ev.taskId)
                    }
                })
            }
        })
        break
    case "ao-outbound-connected":
        isExist = tasks.some(x => {
            if (x.taskId === ev.address){
                return true
            }
        })
        if (!isExist){
            tasks.push(calculations.blankCard(ev.address, ev.address, 'blue', ev.timestamp))
        }
        break
    case "ao-inbound-connected":
        isExisting = tasks.some(x => {
            if (x.taskId === ev.address){
                return true
            }
        })
        if (!isExisting){
            tasks.push(calculations.blankCard(ev.address, ev.address, 'red', ev.timestamp))
        }
        break
    case "member-field-updated":
      if (ev.field === 'action') {
        tasks.forEach(task => {
          if (task.taskId === ev.newfield) {
            let editInline = task.actions.some(a => {
              if (a.memberId === ev.memberId) {
                a.isActive = true
                a.timestamp = ev.timestamp
                return true
              }
            })
            if (!editInline) {
              task.actions.push({
                memberId: ev.memberId,
                timestamp: ev.timestamp,
                isActive: true,
                total: 0
              })
            }
          } else {
            task.actions.forEach(a => {
              if (a.memberId === ev.memberId && a.isActive) {
                a.isActive = false
                a.total += (ev.timestamp - a.timestamp)
              }
            })
          }
        })
      }
      break
    case "task-seized":

      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          pirate = task.priorities[task.priorities.indexOf(ev.taskId) + 1]
          task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
        }
      })
      if (!pirate) pirate = ev.inId
      tasks.forEach(task => {
        if (task.taskId === pirate) {
          task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
          task.priorities.push(ev.taskId)
        }
      })
      break
    case "task-touched":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          task.stackView[ev.stack] = ev.position
        }
      })
      break
    case "task-valued":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          task.completeValue = Number(ev.value)
        }
      })
      break
    case "task-popped":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          explodingTask = task
        }
        if (task.taskId === ev.inId) {
          absorbingTask = task
        }
      })

      colors = []
      tasks.forEach(task => { // im sorry
          if (explodingTask.subTasks.indexOf(task.taskId) > -1){
              colors.push(task.color)
          }
      })
      if (explodingTask, absorbingTask) {
        absorbingTask.priorities = _.filter(absorbingTask.priorities, taskId => taskId !== ev.taskId)
        absorbingTask.subTasks = _.filter(absorbingTask.subTasks, taskId => taskId !== ev.taskId)
        absorbingTask.completed = _.filter(absorbingTask.completed, taskId => taskId !== ev.taskId)
        absorbingTask.subTasks = _.uniq(absorbingTask.subTasks.concat(explodingTask.subTasks))
        absorbingTask.priorities = _.uniq(absorbingTask.priorities.concat(explodingTask.priorities))
        // absorbingTask.completed = _.uniq(absorbingTask.completed.concat(explodingTask.completed))
        colors.forEach(c => {
            absorbingTask.stackView[c] = absorbingTask.subTasks.length - 1
        })
      }
      break
    case "pile-prioritized":
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          ev.tasks.forEach(tId => {
              task.priorities.push(tId)
          })
          task.priorities = _.uniq(task.priorities)
        }
      })
      break
    case "pile-refocused":
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          task.priorities.forEach(stId => {
            tasks.forEach(st => {
              if (st.taskId === stId) {
                task.subTasks.push(stId)
              }
            })
            task.priorities = []
          })
        }
      })
      break
    case "pile-de-sub-tasked":
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
            task.subTasks = _.filter(task.subTasks, tId => ev.tasks.indexOf(tId) === -1)
            task.priorities = _.filter(task.priorities, tId => ev.tasks.indexOf(tId) === -1)
        }
      })
      break
    case "pile-sub-tasked":
      colors = []
      tasks.forEach(task => {
          if (ev.tasks.indexOf(task.taskId) >= 0){
              colors.push(task.color)
          }
      })
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          task.subTasks = _.filter(task.subTasks, tId => ev.tasks.indexOf(tId) === -1)
          task.priorities = _.filter(task.priorities, tId => ev.tasks.indexOf(tId) === -1)
          task.subTasks = task.subTasks.concat(ev.tasks)
          colors.forEach( c => {
              task.stackView[c] = task.subTasks.length - 1
          })
        }
      })
      break
    case "completed-toggled":
        tasks.forEach(task => {
            if (task.taskId === ev.taskId) {
                if (task.stackView.completed){
                    task.highlights = []
                }
                task.stackView.completed = !task.stackView.completed
            }
        })
        break
    case "highlighted":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
            let didUpdateInline = false
            task.highlights.forEach((h, i) => {
              if (h.memberId === ev.memberId) {
                didUpdateInline = true
                if (h.valence === ev.valence) {
                  task.highlights.splice(i, 1)
                } else {
                  h.valence = ev.valence
                }
              }
            })
            if (!didUpdateInline) {
              task.highlights.push({
                memberId: ev.memberId,
                valence: ev.valence
              })
            }
            if (task.highlights.length > 0){
                task.stackView.completed = true
            } 
        }
      })
      break
    case "resource-created":
      tasks.push(calculations.blankCard(ev.resourceId, ev.resourceId, 'red', ev.timestamp, [ev.memberId], [ev.resourceId]))
      break
    case "member-created":
      tasks.push(calculations.blankCard(ev.memberId, ev.memberId, 'purple', ev.timestamp))
      break
    case "task-created":
      tasks.push(calculations.blankCard(ev.taskId, ev.name, ev.color, ev.timestamp, ev.deck))
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          task.subTasks = _.filter(task.subTasks, tId => tId !== ev.taskId)
          task.subTasks.push(ev.taskId)
          if (task.deck.indexOf(ev.memberId) === -1){
              task.deck.push(ev.memberId)
          }
          task.stackView.completed = false
          if (task.stackView[ev.color] > -1){
              task.stackView[ev.color] = task.subTasks.length - 1
          }
        }
      })
      break
    case "address-updated":
      tasks.forEach(t => {
        if (t.taskId === ev.taskId) {
          t.btcAddr = ev.btcAddr
        }
      })
      break
    case "task-grabbed":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          if (task.deck.indexOf(ev.memberId) === -1) {
            if (ev.taskId !== ev.memberId && ev.memberId) {
              task.deck.push(ev.memberId)
            }
          }
        }
      })
      break
    case "pile-grabbed":
      if (!ev.memberId) { // what?
          break
      }
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          let crawler = [ev.taskId]
          let history = []
          let newCards = []
          do {
            newCards = []
            crawler = crawler.forEach(t => {
              if (history.indexOf(t) >= 0) return
              let subTask = tasks.filter(pst => pst.taskId === t)
              if (subTask.length < 1) {
                console.log("missing subtask, this is messy", t)
                return
              }
              if (subTask.length > 1) {
                console.log("duplicate task found, this is very bad")
              }
              subTask = subTask[0]
              if (subTask === undefined || subTask.subTasks === undefined || subTask.priorities === undefined || subTask.completed === undefined) {
                console.log("invalid task data found, this is very bad")
                return
              }

              history.push(t)

              if (subTask.deck.indexOf(ev.memberId) === -1 && ev.taskId !== ev.memberId) {
                subTask.deck.push(ev.memberId)
              }
              newCards = newCards.concat(subTask.subTasks).concat(subTask.priorities).concat(subTask.completed)
            })
            crawler = newCards
          } while (crawler.length > 0)
        }
      })
      break
    case "task-dropped":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          task.deck = _.filter(task.deck, d => d !== ev.memberId)
        }
      })
      break
    case "pile-dropped":
      if (!ev.memberId) {
        break
      }
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          let crawler = [ev.taskId]
          let history = []
          let newCards = []
          do {
            newCards = []
            crawler = crawler.forEach(t => {
              if (history.indexOf(t) >= 0) return
              let subTask = tasks.filter(pst => pst.taskId === t)
              if (subTask.length < 1) {
                console.log('missing subtask, this is messy', t)
                return
              }
              if (subTask.length > 1) {
                console.log('duplicate task found, this is very bad')
              }
              subTask = subTask[0]
              if (subTask === undefined || subTask.subTasks === undefined || subTask.priorities === undefined || subTask.completed === undefined) {
                console.log('invalid task data found, this is very bad')
                return
              }

              history.push(t)

              if (subTask.deck.indexOf(ev.memberId) >= 0 && ev.taskId !== ev.memberId) {
                subTask.deck = _.filter(subTask.deck, d => d !== ev.memberId)
              }
              newCards = newCards.concat(subTask.subTasks).concat(subTask.priorities).concat(subTask.completed)
            })
            crawler = newCards
          } while (crawler.length > 0)
        }
      })
      break
    case "ao-disconnected":
      tasks.forEach((task, i) => {
        if (task.taskId === ev.address) {
          tasks.splice(i, 1)
        }
      })
      tasks.forEach(t => {
          t.subTasks = _.filter(t.subTasks, st => st !== ev.address)
          t.priorities = _.filter(t.priorities, st => st !== ev.address)
          t.completed = _.filter(t.completed, st => st !== ev.address)
          t.claimed = _.filter(t.claimed, st => st !== ev.address)
          t.claims = _.filter(t.claims, cl => cl.memberId !== ev.address)
          t.deck = _.filter(t.deck, st => st !== ev.address)
          if (t.book & (t.book.resourceId === ev.address || t.book.memberId === ev.address)) t.book = {}
      })
      break
    case "member-purged":
      tasks.forEach((task, i) => {
        if (task.taskId === ev.memberId) {
          tasks.splice(i, 1)
        }
      })
      tasks.forEach(t => {
          t.subTasks = _.filter(t.subTasks, st => st !== ev.memberId)
          t.priorities = _.filter(t.priorities, st => st !== ev.memberId)
          t.completed = _.filter(t.completed, st => st !== ev.memberId)
          t.claimed = _.filter(t.claimed, st => st !== ev.memberId )
          t.claims = _.filter(t.claims, cl => cl.memberId !== ev.memberId)
          t.deck = _.filter(t.deck, st => st !== ev.memberId)
          if (t.book & (t.book.resourceId === ev.memberId || t.book.memberId === ev.memberId)) t.book = {}
      })
      break
    case "task-removed":
      tasks.forEach((task, i) => {
        if (task.taskId === ev.taskId) {
          tasks.splice(i, 1)
        }
      })
      tasks.forEach(t => {
        t.subTasks = _.filter(t.subTasks, st => st !== ev.taskId)
        t.priorities = _.filter(t.priorities, st => st !== ev.taskId)
        t.completed = _.filter(t.completed, st => st !== ev.taskId)
        t.claims = _.filter(t.claims, cl => cl.taskId !== ev.taskId)
      })
      break
    case "task-prioritized":
      tasks.forEach(task => {
        if (task.taskId === ev.fromId){
            task.subTasks = _.filter(task.subTasks, taskId => taskId !== ev.taskId)
            task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
            tasks.forEach( taskLoop2 => {
                if ( task.priorities.indexOf(taskLoop2.taskId) >= 0){
                    taskLoop2.priorities = _.filter(taskLoop2.priorities, tId => tId !== ev.taskId)
                }
            })
        }
        if (task.taskId === ev.inId) {
          task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
          task.subTasks = _.filter(task.subTasks, taskId => taskId !== ev.taskId)
          task.priorities.push(ev.taskId)
        }
        if (task.taskId === ev.taskId && task.deck.indexOf(ev.blame) === -1){
            task.deck.push(ev.blame)
        }
      })
      break
    case "task-completed":
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
          task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
          task.subTasks = _.filter(task.subTasks, taskId => taskId !== ev.taskId)
          task.completed = _.filter(task.completed, taskId => taskId !== ev.taskId)
          task.completed.push(ev.taskId)
        }
      })
      break
    case "task-sub-tasked":
      color = false
      tasks.forEach(task => { // sorry need hashmap
        if (task.taskId === ev.taskId){
            color = task.color
        }
      })
      tasks.forEach(task => {
        if (task.taskId === ev.taskId && task.deck.indexOf(ev.blame) === -1){
              task.deck.push(ev.blame)
        }
        if (task.taskId === ev.inId) {
          task.priorities = _.filter(task.priorities, taskId => taskId !== ev.taskId)
          task.subTasks = _.filter(task.subTasks, tId => tId !== ev.taskId)
          task.subTasks.push(ev.taskId)
          if (color){
              task.stackView[color] = task.subTasks.length - 1
          }
        }
      })
      break
    case "task-de-sub-tasked":
      tasks.forEach(task => {
        if (task.taskId === ev.inId) {
            task.priorities = _.filter(task.priorities, tId => tId !== ev.taskId)
            task.subTasks = _.filter(task.subTasks, tId => tId !== ev.taskId)
        }
      })
      break
    case "task-guilded":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          task.guild = ev.guild
        }
      })
      break
    case "task-claimed":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          if (task.deck.indexOf(ev.memberId) === -1) {
            if (ev.taskId !== ev.memberId && ev.memberId) {
              task.deck.push(ev.memberId)
            }
          }
          if (task.claimed.indexOf(ev.memberId) === -1) {
            task.claimed.push(ev.memberId)
          }
          task.claims.push(ev)
          task.lastClaimed = ev.timestamp
        }

        if (ev.inId !== ev.taskId && task.taskId === ev.inId) {
            if (task.completed.indexOf(ev.taskId) === -1){
                task.completed.push(ev.taskId)
                if (task.deck.indexOf(ev.memberId) === -1) {
                    task.deck.push(ev.memberId)
                }
            }
        }

      })
      break
    case "task-unclaimed":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
            task.claimed = task.claimed.filter(mId => mId !== ev.memberId)
        }
        if (task.taskId === ev.inId){
            task.completed = task.completed.filter(taskId => taskId !== ev.taskId)
        }
      })
      break
    case "task-boosted":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          let amount = Number(ev.amount)
          let boost = Number(task.boost)
          if (amount + boost > 0) {
            task.boost = amount + boost
          }
          task.payments.push(ev)
        }
      })
      break
    case "task-boosted-lightning":
      tasks.forEach(task => {
        if (task.payment_hash === ev.payment_hash  && ev.taskId === task.taskId) {
          let amount = parseFloat(ev.amount)
          let boost = parseFloat(task.boost)
          if (amount > 0) {
            task.boost = amount + boost
            task.bolt11 = ""
            task.payment_hash = ""
          }
          task.payments.push(ev)
        }
      })
      break
    case "resource-booked":
      tasks.forEach(task => {
        if (task.taskId === ev.resourceId) {
          task.book = ev
        }
      })
      break
    case "resource-used":
      tasks.forEach(task => {
        let charged = parseFloat(ev.charged)
        if (task.taskId === ev.memberId) {
          if (charged > 0) {
            task.boost -= charged
          }
          task.claims.push(ev) //
        }
        if (task.taskId === ev.resourceId) {
            task.claims.push(ev) //
        }
      })
      break
    case "invoice-created":
      tasks.forEach(task => {
        if (task.taskId === ev.taskId) {
          task.payment_hash = ev.payment_hash
          task.bolt11 = ev.bolt11
        }
      })
      break
    case "task-swapped":
      tasks.forEach((t) => {
        if (t.taskId === ev.taskId) {
          task = t
        }
      })

      if (task) {
        let originalIndex = task.subTasks.indexOf(ev.swapId1)
        let swapIndex = task.subTasks.indexOf(ev.swapId2)
        let originalIndexCompleted = task.completed.indexOf(ev.swapId1)
        let swapIndexCompleted = task.completed.indexOf(ev.swapId2)

        if (originalIndex > -1 && swapIndex > -1 && originalIndex > swapIndex) {
          let newST = task.subTasks.slice()
          newST[originalIndex] = ev.swapId2
          newST[swapIndex] = ev.swapId1
          task.subTasks = newST
        }

        if (originalIndexCompleted > -1 && swapIndexCompleted > -1 && originalIndexCompleted > swapIndexCompleted) {
          let newCompleted = task.completed.slice()
          newCompleted[originalIndexCompleted] = ev.swapId2
          newCompleted[swapIndexCompleted] = ev.swapId1
          task.completed = newCompleted
        }
      }
      break
    case "tasks-received":
      ev.tasks.forEach(newT => {
        if (!tasks.some(cur => {
            if (cur.taskId === newT.taskId) {
              calculations.safeMerge(cur, newT)
              return true
            }
          })) {
          tasks.push(newT)
        }
      })
      break
    case "member-charged":
      tasks.forEach(task => {
        if (task.taskId === ev.memberId) {
          task.boost -= parseFloat(ev.charged)
          if (task.boost < 0) {
            task.boost = 0
          }
        }
      })
      break
  }
  tasks.forEach( t => {
      if (t.taskId === ev.inId) {
          t.lastUsed = ev.timestamp
      }
  })
}

module.exports = {
  aoMuts,
  cashMuts,
  membersMuts,
  resourcesMuts,
  sessionsMuts,
  tasksMuts,
  hashMapMuts,
}
