const fs = require('fs')
const readline = require('readline')
const aoDir = process.env.AODIR || process.env.HOME + '/.ao'
const rd = readline.createInterface({
    input: fs.createReadStream(aoDir + '/config'),
    console: false
});

var config = {
    alias: '',
    port: '',
    bitcoindir: '',
    bitcoinrpcpass: '',
    lightningdir: '',
    aodir: '',
    open: ''
}
const readConfigs = callback => {
    rd.on('line', line => {
       let l = line.split('=')
       config[l[0]] = l[1]
    })
    rd.on('close', () => {
        config.alias= process.env.ALIAS || config.alias || 'AO', 
        config.port= process.env.PORT || config.port || 8003,
        config.bitcoindir= process.env.BITCOINDIR || config.bitcoindir || process.env.HOME + '/.bitcoin',
        config.bitcoinrpcpass= config.bitcoinrpcpass + '=',
        config.lightningdir= process.env.LIGHTNINGDIR || config.lightningdir || process.env.HOME + '/.lightning/bitcoin',
        config.aodir= process.env.AODIR || config.aodir || process.env.HOME + '/.ao',
        config.open= process.env.OPEN || config.open || true
        console.log('using config: ', config)
        callback()
    })
}
module.exports = {config, readConfigs}
