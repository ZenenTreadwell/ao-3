const configuration = require('./configParser').config
const express = require( 'express')
const path = require( 'path')
const bodyParser = require( 'body-parser')
const state = require( './state')
const spec = require( './spec')
const fobtap = require( './fobtap')
const calculations = require( '../calculations')
const { serverAuth } = require( './auth')
const { lightningRouter } = require('./lightning')
const openAo = require('./openAo')

module.exports = function applyRouter(app){
    app.use(express.static(path.join(__dirname, '../../dist')))
    app.use(express.static(path.join(__dirname, '../../public')))
    if (configuration.open === true){
        app.use(openAo)
    }
    app.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../dist/index.html'))
    })
    app.use(serverAuth)
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true
    }))
    app.use(spec)   // event creation
    app.use(fobtap) // rfid scan
    app.use(lightningRouter)
    app.post('/state', (req, res) => {
        let xd = {
            hashMap: state.pubState.hashMap,
            ao: state.pubState.ao,
            sessions: state.pubState.sessions,
            members: state.pubState.members,
            tasks: [],
            resources: state.pubState.resources,
            cash:state.pubState.cash 
        }
        res.json(xd)
    })
    app.post('/tasks/:taskId', (req, res) => {
        res.json(state.serverState.tasks)
    })
    app.post('/taskhash/:taskId', (req, res)=> {
        // dos potential (it's behind auth but still bad?)
        res.end( calculations.crawlerHash(state.serverState.tasks, req.params.taskId) )
    })
}
