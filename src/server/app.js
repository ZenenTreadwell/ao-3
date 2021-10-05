let PORT = process.env.PORT || 8003
const conf = require('../../configuration')
const Kefir = require('kefir')
const express = require('express')
const path = require("path")
const socketIo = require('socket.io')
const socketProtector = require('socketio-auth')
const dctrlDb = require('./dctrlDb')
const state = require('./state')
const reactions = require('./reactions')
const { socketAuth } = require('./auth')
const { watchSpot } = require('./exchangeRate')
const rent = require('./rent')
const link = require('./link')
const lightning = require('./lightning')
const applyRouter = require('./router')
const chalk = require('chalk');
const connector = require('./connector')

const app = express()
applyRouter(app)
startDctrlAo()

let mostRecentAccount = null


function startDctrlAo(){
    dctrlDb.startDb( (err, conn) => {
        if (err) return console.log(chalk.bold.red('db initialize failed:', err))

        let start = Date.now()
        state.initialize( err => {
          if (err) return console.log(chalk.bold.red('ao state initialization failed:'), err)

          watchSpot()
          rent()
          link()
          lightning.recordEveryInvoice(state.serverState.cash.pay_index)
          lightning.watchOnChain()

          const serverReactions = dctrlDb.changeFeed
              .onValue( ev => state.applyEvent(state.serverState, ev))
              .onValue(reactions)

          const server = app.listen(PORT, err => {
              console.log("ao available at", chalk.blue.bold("http://localhost:" + PORT))

              connector.checkHash(conf.tor.hostname, 'wrong', 'wrroonng', (err, resulthash) => {
                  if (err === 'unauthorized'){
                      console.log("ao available at", chalk.blue.bold(conf.tor.hostname))
                  }
              })

              const io = socketIo(server)
              socketProtector(io, {
                  authenticate: socketAuth,
                  timeout: 2345,
              })
              const filteredStream = dctrlDb.changeFeed.map(state.removeSensitive)
              const fullEvStream = Kefir.merge([filteredStream, dctrlDb.shadowFeed])
              let channelSatTotalTracker = 0
              let outputSatTotalTracker = 0
              let priceTracker = 0
              fullEvStream.onValue( ev => {
                    state.applyEvent(state.pubState, ev)
                    io.emit('eventstream', ev)
                    switch (ev.type) {
                        case 'get-node-info':
                            let channelReducer = (accumulator,current) => accumulator + current.channel_sat
                            let outputReducer = (accumulator,current) => {
                                if (current.status !== "confirmed"){
                                    return accumulator
                                }
                                return accumulator + current.value
                            }
                            let totalInChannels = ev.info.channels.reduce(channelReducer, 0)
                            let totalInOutputs = ev.info.outputs.reduce(outputReducer, 0)
                            if (channelSatTotalTracker < totalInChannels){
                                console.log(chalk.yellow(totalInChannels.toLocaleString()), "local channel balance", chalk.bold.green('+', totalInChannels - channelSatTotalTracker ))
                            } else if (channelSatTotalTracker > totalInChannels){
                                console.log(chalk.yellow(totalInChannels.toLocaleString()), "local channel balance", chalk.bold.red('-', channelSatTotalTracker - totalInChannels))
                            }
                            if (outputSatTotalTracker < totalInOutputs){
                                console.log(chalk.yellow(totalInOutputs.toLocaleString()), "on chain balance", chalk.bold.green('+',totalInOutputs - outputSatTotalTracker))
                            } else if (outputSatTotalTracker > totalInOutputs){
                                console.log(chalk.yellow(totalInOutputs.toLocaleString()), "on chain balance", chalk.bold.red('-',outputSatTotalTracker - totalInOutputs))
                            }
                            outputSatTotalTracker = totalInOutputs
                            channelSatTotalTracker = totalInChannels
                            break
                        case 'spot-updated':
                            if (priceTracker < ev.spot){
                                console.log(ev.spot.toLocaleString(), state.serverState.cash.currency, chalk.bold.magenta('+', (ev.spot - priceTracker).toFixed(2)))
                            } else if (priceTracker > ev.spot){
                                console.log(ev.spot.toLocaleString(), state.serverState.cash.currency, chalk.bold.magenta('-', (priceTracker - ev.spot).toFixed(2)))
                            }
                            priceTracker = ev.spot
                            break
                        default:
                            let name = '~'
                            state.serverState.members.some(m => {
                                if (m.memberId === ev.memberId  || ev.blame === m.memberId){
                                    name = m.name
                                }
                            })
                            if (mostRecentAccount !== name){
                                mostRecentAccount = name
                                console.log(chalk.bold.magenta(name), 'active', ev.type)
                            }
                            break
                    }
              })
          })
        })
    })
}
