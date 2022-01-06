const request = require('superagent')
const io = require('socket.io-client')
let socket = io()

function attachEventStream(commit, dispatch){
    socket.off('eventstream')
    socket.on('eventstream', ev => {
        dispatch('displayEvent', ev)
        commit('applyEvent', ev)
    })
}


function attachSocket(commit, dispatch, callback){
    socket = io()
    socket.off('connect')
    socket.on('connect', ()=> {
        socket.emit('authentication', {
            session: state.session,
            token: state.token
        })
    })

    socket.off('authenticated')
    socket.on('authenticated', ()=> {
        console.log('authenticated')
        attachEventStream(commit, dispatch)
        callback()
    })
}

const actions = {
    loadCurrent({ commit, dispatch, state }){
        attachSocket(commit, dispatch, () =>{
            commit("setReqStatus", "pending")
            let startTs = Date.now()
            request
                .post('/tasks/gg')
                .set("Authorization", state.token)
                .end((err, res)=> {
                  if (!(err || !res.body)) {
                      console.log('fetched ', res.body.length, 'cards')
                      if (res.body.length > 100){
                          let total = res.body.length - 1
                          let i = 0
                          while (total > 0){
                              let tasks = res.body.slice(Math.max(0, total - 100), total)
                              total -= 100
                              i ++
                              setTimeout(()=>{
                                  console.log('applying', tasks.length, 'tasks')
                                  commit('applyEvent', {
                                      type: 'tasks-received',
                                      tasks
                                  })
                              }, 4 * i)
                          }

                      } else {
                          commit('applyEvent', {
                              type: 'tasks-received',
                              tasks: res.body
                          })
                      }
                  }
                })
            request
                .post('/state')
                .set("Authorization", state.token)
                .end((err, res)=>{
                  if (!(err || !res.body)) {
                    commit('setCurrent', res.body)
                    commit("setReqStatus", Date.now() - startTs)
                    res.body.sessions.forEach(s => {
                      if (s.session === state.session){
                        commit("goGo", [ s.ownerId ])
                      }
                    })
                  }
                })

        })
    },
    makeEvent({commit, state}, newEv){
        let startTs = Date.now()
        commit("setReqStatus", "pending")
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
