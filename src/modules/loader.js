const request = require( 'superagent')
const io = require( 'socket.io-client')
const socket = io()

var attached = false
function attachSocket(commit, dispatch){
    if (!attached){

        socket.on('unauthorized', (reason)=> {
            commit('setConnectionError', 'Unauthorized: ' + JSON.stringify(reason))
        })

        socket.on('connect', ()=> {
            commit('setConnected', 'connecting')
            socket.emit('authentication', {
                session: state.session,
                token: state.token
            })
        })

        socket.on('authenticated', ()=> {
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
            socket.on('eventstream', ev => {
                commit('applyEvent', ev)
                dispatch('displayEvent', ev)
            })
        })
        socket.on('disconnect', (reason) => {
            commit('setConnected', 'disconnected')
            commit('setConnectionError', 'disconnect: ' + reason)
        })
        socket.on('connect_error', (error)=> {
            commit('setConnectionError', error.message)
        })

        socket.on('error', (error)=> {
            commit('setConnectionError', error.message)
        })

        socket.on('connect_timeout', (timeout)=> {
            commit('setConnectionError', 'Timed out: ' + timeout + 'ms')
        })

        socket.on('reconnect_attempt', () => {
            commit('setConnected', 'connecting')
            commit('setConnectionError', 'reconnect attempt')
        })

        socket.on('reconnect', () => {
            commit('setConnected', 'connected')
            commit('setConnectionError', '')
        })

        socket.on('reconnect_error', (error)=> {
            commit('setConnectionError', error.message)
        })
        attached = true
    }
}

const actions = {
    connectSocket({commit, dispatch}){
        attachSocket(commit, dispatch)
    },
    loadCurrent({ commit, state }){
        if (state.connected !== "connected"){
            socket.connect()
        }
        commit("setReqStatus", "pending")
        commit("pendFlasher")
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
        let startTs = Date.now()
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
    connected: 'disconnected',
    connectionError: '',
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
        }, 123)
    },
    setReqStatus(loader, status){
        loader.reqStatus = status
    },
    setAuth(loader, auth){
        loader.token = auth.token
        loader.session = auth.session
    },
    setConnected(loader, connected){
        loader.connected = connected
    },
    setConnectionError(loader, error){
        if(error === '') {
            loader.connectionError = ''
            return
        }
        loader.connectionError = error
    }
}

module.exports = {
    state,
    mutations,
    actions
}
