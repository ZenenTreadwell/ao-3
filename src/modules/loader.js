const request = require('superagent')
const io = require('socket.io-client')
const socket = io()

function attachSocket(commit, dispatch){
    socket.on('connect', ()=> {
        socket.off('eventstream')
        socket.emit('authentication', {
            session: state.session,
            token: state.token
        })
    })

    socket.on('authenticated', ()=> {
        socket.on('eventstream', ev => {
            commit('applyEvent', ev)
            dispatch('displayEvent', ev)
        })
    })
}

const actions = {
    loadCurrent({ commit, dispatch, state }){
        attachSocket(commit, dispatch)
        commit("setReqStatus", "pending")
        commit("pendFlasher")
        let startTs = Date.now()
        request
            .post('/tasks/gg')
            .set("Authorization", state.token)
            .end((err, res)=> {
                if (err || !res.body) {
                    console.log('task load post err: ', err)
                } else {
                    console.log('loaded ', res.body.length, 'cards')
                    commit('applyEvent', {
                        type: 'tasks-received',
                        tasks: res.body
                    })
                }
            })
        request
            .post('/state')
            .set("Authorization", state.token)
            .end((err, res)=>{
                if (err || !res.body) {
                    console.log('task load post err: ', err)
                } else {
                    commit('setCurrent', res.body)
                    commit("setReqStatus", Date.now() - startTs)
                    res.body.sessions.forEach(s => {
                        if (s.session === state.session){
                            console.log('penel set by seshesh')
                            commit("setPanel", [ s.ownerId ])
                        }
                    })
                }
            })
    },
    makeEvent({commit, state}, newEv){
        let startTs = Date.now()
        commit("setReqStatus", "pending")
        commit("pendFlasher")
        request
            .post('/events')
            .send(newEv)
            .set("Authorization", state.token)
            .end((err, res)=>{
                if (err || !res.body) {
                    commit("setReqStatus", "failed", res.body)
                    console.log({err, res})
                } else {
                    commit("setReqStatus", Date.now() - startTs)
                }
            })
    }
}

const state = {
    token: '',
    session: '',
    reqStatus: 'ready',
    pendingFlash: [0,0,0,0,0],
}

const mutations = {
    pendFlasher(loader){
        let i = 0
        let flasher = setInterval(()=> {
            loader.pendingFlash[i] = 0
            i = (i  + 1) % 5
            loader.pendingFlash[i] = 1
            if (loader.reqStatus !== "pending"){
                clearInterval(flasher)
                loader.pendingFlash = [0,0,0,0,0]
            }
        }, 1523)
    },
    setReqStatus(loader, status){
        loader.reqStatus = status
    },
    setAuth(loader, auth){
        loader.token = auth.token
        loader.session = auth.session
    },
}

module.exports = {
    state,
    mutations,
    actions
}
