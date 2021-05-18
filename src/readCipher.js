const fs = require('fs')
const crypto = require('crypto')
const privLocation = require('../configuration').privateKey
const priv = fs.readFileSync(privLocation)
let hiddenInfo = process.argv[2]
let locky = hiddenInfo.slice(0,7)
if ( locky === "__lock:"){
    hiddenInfo = hiddenInfo.slice(7)
}
console.log(
    crypto.privateDecrypt(priv, Buffer.from(hiddenInfo, 'hex') ).toString('latin1')
)
