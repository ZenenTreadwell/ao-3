const _ = require( 'lodash')
const dctrlDb = require( './dctrlDb')
const M = require( '../mutations')
const modules = require( '../modules')
const config = require( './configParser').config
const crypto = require('../crypto')
const chalk = require('chalk')
const fs = require('fs')
const torControl = require('./torControl')
let ALIAS = process.env.ALIAS || config.alias || 'AO'

let publicKey
try {
    let filekey = fs.readFileSync(config.aodir + '/key', {encoding:'utf8'})
    //publicKey = crypto.derivePublicKey(filekey)
} catch (err){
    console.log(chalk.red('key import error from', config.aodir + '/key'), err)
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
        alias: ALIAS,
        currency: 'CAD',
        spot: 0,
        rent: 0,
        cap: 75,
        pay_index: 0,
        usedTxIds: [],
        outputs: [],
        channels: [],
        pins: [],
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
    torControl( (err, onion) => {
      if (onion) onion = onion.trim()
      serverState.cash.address = onion
      pubState.cash.address = onion
      dctrlDb.recover((err, backup) => {
            let ts = 0
            if (backup.length > 0){
                ts = backup[0].timestamp
                console.log(chalk.green('backup from ', Date(ts)))
                applyBackup(backup[0])
            }
            dctrlDb.getAll(ts, (err, all) => {
                if (err) return callback(err)
                all.forEach( ev => {
                    applyEvent(serverState, Object.assign({}, ev) )
                    applyEvent(pubState, removeSensitive( Object.assign({}, ev) ))
                })
                console.log(
                    chalk.bold.green(serverState.tasks.length, 'cards'),
                    chalk.bold.magenta(serverState.members.length, 'accounts'),
                    chalk.bold.red(serverState.resources.length, 'resources'),
                    chalk.bold.cyan('from', all.length, 'events')
                )

                // integrity check on hashMap (hashMap is broked)
                pubState.tasks.forEach( (t, i) => {
                    if (pubState.hashMap[t.taskId] !== i) {
                      console.log(i, 'map retro fixed!!?', t.name.slice(0,7))
                      pubState.hashMap[t.taskId] = i
                      serverState.hashMap[t.taskId] = i
                    }
                })

                console.log(chalk.bold.blue('http://' + onion))
                callback(null)
            })
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
