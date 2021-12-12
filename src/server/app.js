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
              // .onValue(reactions)

          const server = app.listen(PORT, err => {
              console.log(chalk.blue.bold("http://localhost:" + PORT))
              const io = socketIo(server)
              socketProtector(io, {
                  authenticate: socketAuth,
                  timeout: 2345,
              })
              const fullEvStream = Kefir.merge([
                  dctrlDb.changeFeed.map(state.removeSensitive),
                  dctrlDb.shadowFeed
              ])

              fullEvStream
                  .onValue( ev => {
                        state.applyEvent(state.pubState, ev)
                        io.emit('eventstream', ev)
                  })
                  .onValue(reactions)
          })
        })
    })
}
