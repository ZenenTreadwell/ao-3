const config = require( '../../configuration.js')
const uuidV1 = require( 'uuid/v1')
const express = require( 'express')
const lightningRouter = express.Router()
const allEvents = require('./events')
const calculations = require( '../calculations')
const LightningClient = require( './lightning-client')
const {serverState} = require( './state')
const client = new LightningClient(config.clightning.dir, true);
const Client = require('bitcoin-core');
const bitClient = new Client(config.bitcoind)
const _ = require('lodash')
const crypto = require('../crypto')

function getDecode (rawx){
    return bitClient.getRawTransaction(rawx)
        .then((rawTransaction) => {
              return bitClient.decodeRawTransaction(rawTransaction)
        })
        .catch(console.log)
}

function newSample(){
    return { super: [], high: [], mid:[], low: [] }
}

var sampleTxns
function getMempool(){
    return bitClient.getMempoolInfo()
        .then(memPoolInfo => {
              return bitClient.getRawMempool()
                  .then(rawMemPool => {
                      sampleTxns = newSample()
                      let sample = _.sampleSize(rawMemPool, 100)
                      return sample.reduce( (prevPromise, txid) => {
                          return prevPromise.then( x => {
                              return bitClient.getMempoolEntry(txid)
                                  .then(mentry => {
                                      let satFee = mentry.fee * 100000000 / mentry.vsize
                                      if (satFee > 150){
                                          sampleTxns.super.push(txid)
                                      } else if (satFee > 50){
                                          sampleTxns.high.push(txid)
                                      } else if (satFee > 10){
                                          sampleTxns.mid.push(txid)
                                      } else {
                                          sampleTxns.low.push(txid)
                                      }
                                      return Promise.resolve()
                                  }).catch(noTx => {
                                      return Promise.resolve()
                                  })
                              })
                      } , Promise.resolve())
                          .then(x => {
                              return bitClient.estimateSmartFee(6)
                                  .then(smartFee => {
                                      memPoolInfo.smartFee = smartFee
                                      memPoolInfo.sampleTxns = sampleTxns
                                      return memPoolInfo
                                  })
                          })
                  })
        })
}

lightningRouter.post('/bitcoin/transaction',(req, res) => {
    bitClient.getMempoolEntry(req.body.txid)
        .then(memPool => {
            getDecode(req.body.txid).then(txn => {
                txn.memPool = memPool
                res.send(txn)
            })
        })
        .catch(notInMempool => {
            getDecode(req.body.txid)
                .then(txn => {
                    if (txn.vout) {
                        Promise.all(txn.vout.map((output, i) => {
                          return bitClient.getTxOut(req.body.txid, i)
                        })).then(outs => {
                          if (outs.some(x => x !== null)){
                            txn.utxo = outs
                          }
                          res.send(txn)
                        })
                    }
                }).catch(console.log)
        })
})

lightningRouter.post('/lightning/channel',(req, res) => {
    client.fundchannel(req.body.id, 'all', 'normal', true, 0)
        .then(channel => {
            console.log("channel funded", channel)
            res.send(true)
        })
        .catch(err => {
            console.log(err)
            res.send(false)
        })
})

function confirmTaskAddrs(){
    serverState.tasks.forEach(t => {
        if (!t.btcAddr){
            newAddress()
                .then(result => {
                    allEvents.addressUpdated(
                        t.taskId,
                        result['p2sh-segwit'],
                    )
                })
                .catch(err => console.log("confirm newaddr", err))
        }
    })
}

function nukePays(){
    client.listpays().then(x => {
        x.pays.reduce((pchain, p) => {
            return pchain.then( () => {
                if (p.status === 'failed'){
                    return client.delpay(p.payment_hash, p.status)
                }
            })
        }, Promise.resolve())

    }).catch(console.log)
}

function createInvoice(sat, label, description, expiresInSec){
    return client.invoice(sat * 1000, label, description, expiresInSec)
}

function newAddress(){
    return client.newaddr('p2sh-segwit')
}

function updateAll(){
    checkFunds()
    getInfo()
}

function watchOnChain(){
    confirmTaskAddrs()
    setInterval(updateAll, 1000 * 111)
    setTimeout( () => {
        updateAll()
    }, 560)
}

function checkFunds(){
    return client
        .listfunds()
        .then(result => {
            try {
                result.outputs.forEach( o => {
                    if (o.status === 'confirmed' && serverState.cash.usedTxIds.indexOf(o.txid) === -1){
                        serverState.tasks.forEach( t => {
                            if (t.btcAddr === o.address){
                                allEvents.taskBoosted(t.taskId, o.value, o.txid)
                            }
                        })
                    }
                })
            } catch (err) {console.log("lighting error; maybe lightningd (c-lightning) is not running")}
        })
        .catch(console.log)
}

function getInfo(){
    return client
        .getinfo()
        .then(mainInfo => {
            bitClient
                .getBlockStats(mainInfo.blockheight)
                .then( blockfo => {
                    mainInfo.blockfo = blockfo
                    client.listfunds()
                        .then(result => {
                            mainInfo.channels = result.channels
                            mainInfo.outputs = result.outputs
                            getMempool().then(mempool => {
                                mainInfo.mempool = mempool
                                try {
                                    allEvents.getNodeInfo(mainInfo)
                                } catch (err) {
                                    console.log('getNodeInfo error:  ', err)
                                }
                            })

                        })
                        .catch(console.log)
              })

        })
        .catch(console.log)
}

function recordEveryInvoice(start){
    client.waitanyinvoice(start)
        .then(invoice => {
            if (!invoice.payment_hash){
                return console.log('no payment hash wth?', {invoice})
            }
            serverState.tasks.forEach( t => {
                if (t.payment_hash === invoice.payment_hash){
                    allEvents.taskBoostedLightning(t.taskId, invoice.msatoshi / 1000, invoice.payment_hash, invoice.pay_index)
                }
            })
            recordEveryInvoice(start + 1) // is this recurr broken?
        })
        .catch(console.log)
}

module.exports = {
    createInvoice,
    newAddress,
    recordEveryInvoice,
    watchOnChain,
    lightningRouter
}
