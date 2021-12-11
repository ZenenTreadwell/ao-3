const _ = require( 'lodash')
const dctrlDb = require( './dctrlDb')
const M = require( '../mutations')
const modules = require( '../modules')
const config = require( '../../configuration')
const crypto = require('../crypto')
const chalk = require('chalk')
const fs = require('fs')

let publicKey
try {
    let filekey = fs.readFileSync(config.privateKey, {encoding:'utf8'})
    publicKey = crypto.derivePublicKey(filekey)
} catch (err){
    console.log(chalk.red('key import error from', config.privateKey), err)
}

function baseState(){
    return {
      hashMap: {},
      ao: [],
      sessions: [],
      members: [],
      tasks: [],
      resources: [],
      cash: {
        publicKey,
        address: '',
        alias: '',
        currency: 'CAD',
        spot: 0,
        rent: 0,
        cap: 75,
        pay_index: 0,
        usedTxIds: [],
        outputs: [],
        channels: [],
        info: {},
      },
    }
}

const serverState = baseState()
const pubState = baseState()

function setCurrent(state, b){
    modules.cash.mutations.setCurrent(state.cash, b)
    modules.tasks.mutations.setCurrent(state.tasks, b)
    modules.sessions.mutations.setCurrent(state.sessions, b)
    modules.ao.mutations.setCurrent(state.ao, b)
    modules.members.mutations.setCurrent(state.members, b)
    modules.resources.mutations.setCurrent(state.resources, b)
    modules.hashMap.mutations.setCurrent(state.hashMap, b)
}

function applyBackup(b){
    let b1 = Object.assign({}, b)
    setCurrent(serverState, b1)
    b.resources = b.resources.map(removeSensitive)
    b.members = b.members.map(removeSensitive)
    b.ao = b.ao.map(removeSensitive)
    b.tasks = b.tasks.map(removeSensitive)
    setCurrent(pubState, b)
}

function applyEvent(state, ev) {
    M.cashMuts(state.cash, ev)
    M.membersMuts(state.members, ev)
    M.resourcesMuts(state.resources, ev)
    M.sessionsMuts(state.sessions, ev)
    M.tasksMuts(state.tasks, ev)
    M.aoMuts(state.ao, ev)
    M.hashMapMuts(state.hashMap, ev)
}

function initialize(callback) {
    let start = Date.now()
    dctrlDb.recover((err, backup) => {
          let ts = 0
          if (backup.length > 0){
              ts = backup[0].timestamp
              console.log(chalk.green('using backup from ', Date(ts)))
              applyBackup(backup[0])
          }
          dctrlDb.getAll(ts, (err, all) => {
              if (err) return callback(err)
              all.forEach( ev => {
                  // this fix is not needed with the integrity check below
                  // if ((ev.type === 'task-created' || ev.type === 'member-created'  || ev.type === 'resource-created'  || ev.type === 'ao-outbound-connected'  || ev.type === 'ao-inbound-connected')  && ev.i !== serverState.tasks.length){
                  //     // this mismatch can occur because of manual interventions in the database
                  //     // this is required because the mutations not atomic; it is wrong
                  //     ev.i = serverState.tasks.length
                  // }
                  applyEvent(serverState, Object.assign({}, ev) )
                  applyEvent(pubState, removeSensitive( Object.assign({}, ev) ))
              })
              console.log('current state built in', Date.now() - start, 'ms with',
                  chalk.green(serverState.tasks.length), 'cards',
                  chalk.green(serverState.members.length), 'accounts and',
                  chalk.green(serverState.resources.length), 'resources'
              )

              // integrity check on hashMap (hashMap is broked)
              pubState.tasks.forEach( (t, i) => {
                  if (pubState.hashMap[t.taskId] !== i) {
                    // console.log('!! how is the map being broken???', t.name, 'fixing?')
                    pubState.hashMap[t.taskId] = i
                    serverState.hashMap[t.taskId] = i
                  }
              })

              callback(null)
          })
    })
}

function backupState(){
    dctrlDb.insertBackup(serverState)
}

function removeSensitive(ev){
      let secretStuff = ['fob', 'secret', 'token', 'email', 'payment_hash', 'inboundSecret', 'outboundSecret']
      if (ev.type === 'member-field-updated'){
          ['fob', 'secret', 'email'].forEach( str => {
              if (ev.field === str){
                  secretStuff.push('newfield')
              }
          })
      }
      return _.omit(ev, secretStuff)
}

module.exports = {
    serverState,
    pubState,
    initialize,
    applyEvent,
    removeSensitive,
    setCurrent,
}
