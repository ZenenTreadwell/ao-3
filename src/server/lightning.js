const config = require( './configParser').config
const chalk = require('chalk');
const _ = require('lodash')
const uuidV1 = require( 'uuid/v1')
const express = require( 'express')
const lightningRouter = express.Router()
const allEvents = require('./events')
const LightningClient = require( './lightning-client')
const {serverState} = require( './state')
const client = new LightningClient(config.lightningdir, true);
const Client = require('bitcoin-core');
const bitClient = new Client({
    network: 'mainnet',
    username: 'ao',
    password: config.bitcoinrpcpass 
}) 
var nodeInfo = { 
    id: '',
    alias: '',
    address: [],
    bitcoinblocks: 0,
    lightningblocks: 0,
    initialblockdownload: true, 
    verificationprogress: null,
    channels: [],
    outputs: [],
    smartfee: 0,
    feepercentiles: []
}
function updateNodeInfo(){ 
    allEvents.getNodeInfo(nodeInfo)
}
bitClient.getBlockchainInfo().then(x => {
    if (x.initialblockdownload){
        console.log('Initial bitcoin sync detected', chalk.red((100 * x.verificationprogress).toFixed(2)), '% complete')
        nodeInfo.initialblockdownload = x.initialblockdownload
        nodeInfo.verificationprogress = x.verificationprogress
    } else {
        let sats = 100000000
        let halving = 210000
        let supply = 0
        let blocks = x.blocks
        let reward = 50
        while(blocks > halving){
            supply += halving * reward
            reward /= 2
            blocks -= halving
        }
        supply += reward * blocks
        console.log(
            chalk.bold.yellow( (supply * sats).toLocaleString(), 'supply'),
            chalk.bold.cyan('+' + (reward * sats).toLocaleString() + '/block'),
            chalk.bold.green(Math.round((halving - blocks) * 10 / 60 / 24).toString() , 'days to halving')
        )
    }
}).catch( err => {
    console.log(chalk.red('cannot connect to bitcoind'))
})

function getDecode (rawx){
    return bitClient.getRawTransaction(rawx)
        .then((rawTransaction) => {
              return bitClient.decodeRawTransaction(rawTransaction)
        })
        .catch(err => {})
}
function peerInfo(){
    return {
        nodeid:'',
        alias: '',
        channel: null,
        address:null
    }
}
lightningRouter.post('/lightning/peer', (req,res) => {
    client.listpeers(req.body.pubkey).then(x => {
        let pinfo = peerInfo()    
        // should only send what is used
        pinfo.channel = x.peers[0].channels[0]
        client.listnodes(req.body.pubkey).then(y => {
            pinfo.alias = y.alias
            pinfo.nodeid = y.nodeid
            pinfo.address = y.address[0]
            res.send(pinfo)
        })
    })
    .catch(err => {
        res.status(400).end()
    })
})

function createInvoice(sat, label, description, expiresInSec){
    let numSat = Number(sat)
    let msat
    if (numSat > 0){
        msat = numSat * 1000
    } else {
        msat = "any"
    }
    return client.invoice(msat, label, description, expiresInSec)
}

function newAddress(){
    return client.newaddr()
}

function updateAll(){
    checkFunds()
    checkLightning()
    checkBitcoin()
    setTimeout(updateNodeInfo, 10456)
}

function watchOnChain(){
    setInterval(updateAll, 1000 * 60 * 60)
    setTimeout( () => {
        updateAll()
    }, 560)
}

function checkFunds(){
    return client
        .listfunds()
        .then(result => {
            nodeInfo.channels = result.channels
            nodeInfo.outputs = result.outputs
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
        .catch(err => {})
}

function checkLightning(){
    return client
        .getinfo()
        .then(mainInfo => {
            nodeInfo.alias = mainInfo.alias
            nodeInfo.id = mainInfo.id
            nodeInfo.lightningblocks = mainInfo.blockheight
            nodeInfo.address = mainInfo.address[0].address
        }).catch(console.log)
}

function checkBitcoin(){
    return bitClient.getBlockchainInfo()
        .then(x => {
            nodeInfo.bitcoinblocks = x.blocks
            nodeInfo.initialblockdownload = x.initialblockdownload
            nodeInfo.verificationprogress = x.verificationprogress
            return bitClient
                .getBlockStats(nodeInfo.bitcoinblocks, ["feerate_percentiles"])
                .then( blockfo => {
                    nodeInfo.feepercentiles = blockfo.feerate_percentiles
                    bitClient.estimateSmartFee(5).then(y => {
                        nodeInfo.smartfee = y.feerate
                    })
                })  
        }).catch(console.log)  
}

function recordEveryInvoice(start){
    client.waitanyinvoice(start)
        .then(invoice => {
            serverState.tasks.forEach( t => {
                if (t.payment_hash === invoice.payment_hash){
                    allEvents.taskBoostedLightning(t.taskId, invoice.msatoshi / 1000, invoice.payment_hash, invoice.pay_index)
                }
            })
            recordEveryInvoice(start + 1) // is this recurr broken?
        })
        .catch(err => {})
}

module.exports = {
    createInvoice,
    newAddress,
    recordEveryInvoice,
    watchOnChain,
    lightningRouter
}
