const fs = require('fs')
const net = require('net');
const PORT = process.env.PORT || 8003
const uuidV1 = require('uuid/v1')

if (process.env.ONESHOT) {
    ogre((err, onion) => {
        if (err) return console.log(err);
        console.log("Port",PORT, 'exposed @', onion)
    })
}

module.exports = ogre
function ogre(callback){
    var i = -1
    let hiddenServicePortSplit, hiddenServiceDirSplit, onion
	try {
		var cookieBuff = fs.readFileSync(process.env.HOME + '/.tor/control_auth_cookie')
		var cookie = Buffer.from(cookieBuff).toString('hex')
	} catch { 
		console.log("Couldn't access", process.env.HOME + '/.tor/control_auth_cookie')
		return callback("ERR: failed to access cookie")	
	}
	let controlClient = net.connect({host: '127.0.0.1', port: 9051}, () => {
	    controlClient.write('AUTHENTICATE ' + cookie + '\r\n');
	});
    controlClient.on('data', (x) => {
        i ++
        if (i ===0){
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 1) {
          hiddenServicePortSplit = splitFromBuffer(x)
          hiddenServicePortSplit = hiddenServicePortSplit.filter(x => x !== 'HiddenServicePort')
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 2){
          hiddenServiceDirSplit = splitFromBuffer(x)
          hiddenServiceDirSplit = hiddenServiceDirSplit.filter(x => x !== 'HiddenServiceDir')
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          if (!onion){
            let newConf = buildNewConfString(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
            controlClient.write("SETCONF " + newConf + " \r\n")
          } else {
            controlClient.write("QUIT \r\n" )
            callback(null, onion)
          }
        } else if (i === 3){
            controlClient.write("SAVECONF \r\n" )
        } else if (i === 4){
          controlClient.write("GETCONF HiddenServicePort \r\n")
        } else if (i === 5) {
          hiddenServicePortSplit = splitFromBuffer(x)
          controlClient.write("GETCONF HiddenServiceDir \r\n")
        } else if (i === 6){
          hiddenServiceDirSplit = splitFromBuffer(x)
          onion = checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, PORT)
          if (!onion){
              console.log('guess we failed')
              callback('sorry')
          } else {
              controlClient.write("QUIT \r\n" )
              callback(null, onion)
          }
        }
    })

}

function splitFromBuffer(x){
    return Buffer.from(x)
        .toString()
        .split(/\r?\n/)
        .filter(x => x)
        .map(x => x.slice(4));
}

function buildNewConfString(hiddenServicePortSplit, hiddenServiceDirSplit, port){
    let targetDir = process.env.HOME + '/.tor/' + uuidV1()
    try {
        fs.mkdirSync(targetDir, '0700')
    } catch (err){
        console.log(err)
    }

    hiddenServicePortSplit = hiddenServicePortSplit.map(noQuotes => {
        return noQuotes.slice(0, 18) + "\"" + noQuotes.slice(18) + "\""
    })

    let alternate = []
    hiddenServiceDirSplit.forEach((x, i) => {
        alternate.push(x)
        alternate.push(hiddenServicePortSplit[i])
    })
    let conffy = ''
    conffy += alternate.join(' ')
    conffy += " HiddenServiceDir=" + targetDir + " "
    conffy += " HiddenServicePort=\"80 127.0.0.1:" + port + "\""
    return conffy
}

function checkCurrentPortHasConfigAndReturnOnion(hiddenServicePortSplit, hiddenServiceDirSplit, port=8003){
    let onion = false

    hiddenServicePortSplit.forEach((x, i) => {
        if (x.indexOf(port) > -1){
            let directory = hiddenServiceDirSplit[i].slice(17)
            onion = fs.readFileSync(directory + '/hostname', {encoding:'utf8'})
        }
    })

    return onion
}
