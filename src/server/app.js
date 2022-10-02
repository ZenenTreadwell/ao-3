const { config, readConfigs } = require('./configParser')
readConfigs(() => {
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
    
    function startDctrlAo(){
        dctrlDb.startDb( (err, conn) => {
            if (err) return console.log(chalk.bold.red('db initialize failed:', err))
    
            let start = Date.now()
            state.initialize( err => {
              if (err) return console.log(chalk.bold.red('ao state initialization failed:'), err)
    
              watchSpot()
              rent()
              link()
              // lightning.recordEveryInvoice(state.serverState.cash.pay_index)
              lightning.watchOnChain()
    
              dctrlDb.changeFeed
                  .onValue( ev => state.applyEvent(state.serverState, ev))
    
              const server = app.listen(config.port, err => {
                  console.log(chalk.blue.bold("http://localhost:" + config.port))
                  const io = socketIo(server)
                  socketProtector(io, {
                      authenticate: socketAuth,
                      timeout: 2345,
                  })
                  Kefir.merge([
                      dctrlDb.changeFeed.map(state.removeSensitive),
                      dctrlDb.shadowFeed
                  ]).onValue( ev => {
                      state.applyEvent(state.pubState, ev)
                      io.emit('eventstream', ev)
                      console.log("def happened:", ev) 
                  }).onValue(reactions)
              })
            })
        })
    }
})
