// https://api.coinbase.com/v2/prices/btc-cad/spot
// disabled config settings here, considering removing this integration
const crypto = require('crypto');
const request = require('superagent')
const events = require('./events')
const state = require('./state')
const validators = require('./validators')

function watchSpot(){
    getRecordSpot()
    setInterval( getRecordSpot, 1000 * 60 * 60 )
}

function getRecordSpot(){
    getPrice( (err, spot)=> {
        if (!err){
            events.spotUpdated(spot)
        }
    })
}

function getPrice(callback){
    request
        .get('https://api.coinbase.com/v2/prices/btc-' + state.serverState.cash.currency + '/spot')
        .end((err, res)=> {
            if (err) return callback(err);
            if ( validators.isAmount(res.body.data.amount) ) {
                callback(null, Number.parseFloat(res.body.data.amount))
            } else {
                callback('invalid res?')
            }
        })
}

module.exports = {
    getPrice,
    watchSpot
}

//success: {
//  "data": {
//    "amount": "57388.1",
//    "base": "BTC",
//    "currency": "CAD"
//  }
//}

