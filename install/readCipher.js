const priv = require('../configuration').privateKey
const crypto = require('crypto')
let hiddenInfo = process.argv[2]
console.log(
    crypto.privateDecrypt(priv, Buffer.from(hiddenInfo, 'hex') ).toString('latin1')
)
