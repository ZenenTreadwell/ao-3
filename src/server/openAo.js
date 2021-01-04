const express = require('express')
const router = express.Router()

const state = require('./state')
const events = require('./events')
const uuidV1 = require('uuid/v1')
const validators = require('./validators')

router.get('/newaccount/:name', (req, res) => {
    let errRes = []
    if (validators.isValidName(req.params.name, errRes)){
        let token, session
        let secret = uuidV1()
        events.memberCreated(req.params.name, '', secret, (err2, res2) => {
            let session = uuidV1()
            let token = uuidV1()
            let ownerId = res2.ev.memberId
            events.sessionCreated(ownerId, session, token, (err3, res3)=>{
                res.json({token, session})
            })
        })
    }
})

module.exports = router
