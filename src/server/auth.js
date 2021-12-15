const utils = require('./utils')
const events = require('./events')
const cryptoUtils = require('../crypto')
const state = require('./state')
const chalk = require('chalk');

const getIdSecret = function(identifier){
    var ownerId, secret

    try {
        identifier = identifier.toLowerCase()
    } catch (err) {

    }

    state.serverState.members.forEach( member => {
        let name
        try {
            name = member.name.toLowerCase()
        } catch (err) {

        }
        if (name === identifier || member.memberId === identifier){
            ownerId = member.memberId
            secret = member.secret
        }
    })

    state.serverState.resources.forEach( resource => {
        if (resource.name === identifier || resource.resourceId === identifier) {
            ownerId = resource.resourceId
            secret = resource.secret
        }
    })

    return {ownerId, secret}
}

function socketAuth(socket, data, callback){
    let authorized
    state.serverState.sessions.forEach(session => {
        if (session.token === data.token){
            state.serverState.members.forEach(m => {
                if (m.memberId === session.ownerId){
                    authorized = true
                }
            })
        }
    })
    callback(null, authorized)
}

function serverAuth(req, res, next){
    const {ownerId, secret} = getIdSecret(req.headers.name)

    if (secret && req.headers.authorization && req.headers.session){
        let sessionKey = cryptoUtils.createHash(req.headers.session + secret)
        let token = cryptoUtils.hmacHex(req.headers.session, sessionKey)
        if (token === req.headers.authorization){
            events.sessionCreated(ownerId, req.headers.session, token, utils.buildResCallback(res))
        } else {
            res.status(401).end('unauthorized')
        }
    } else {
        let authorized = false
        state.serverState.sessions.forEach(session => {
            if (session.token === req.headers.authorization){
                authorized = true
                req.reqOwner = session.ownerId
            }
        })
        if (authorized){
            next()
        } else {
            res.status(401).end('unauthorized')
        }
    }
}

module.exports = {
    socketAuth,
    serverAuth
}
