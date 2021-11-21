<template lang='pug'>

#auth(v-if='!confirmed')
  .mainbg(v-if='$store.state.loader.reqStatus === "pending"')
      img.spin(src='../assets/images/gear.svg')
  .centertitle(v-else) Welcome, choose name or login:
  div(v-if='!existing')
      .input-container
          input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
          label name
          span.focus-border
      button(@click="createAccount") create
  div(v-if='existing')
      .input-container
          input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="username", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
          label name
          span.focus-border
      .input-container
          input.input-effect#password(type='password', v-model='pass', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession'  :class='{"has-content":!!pass}')
          label password
          span.focus-border
      button(@click="createSession") login
  .switcher.grid(@click='toggleExisting')
      .five.grid.center(:class='{existing: !existing}') new
      .two.grid
          .switch
              input(@click.stop  type="checkbox"  v-model='existing')
              span.slider.round
      .five.grid.center(:class='{existing}') login
  .grid
  .warning(v-if='err') {{err}}
  .notethis New accounts will be created with a random password and your browser session will be saved for later. If you would like to set a custom password use the gear at the bottom right after creating.

</template>

<script>

import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'


export default {
  name: 'Auth',
  data(){
      return {
          waitingLogin: false,
          existing: false,
          name: '',
          pass: '',
          err: ''
      }
  },
  computed: {
      confirmed(){
          return this.$store.getters.isLoggedIn
      },
  },
  methods: {
      toggleExisting(){
          this.existing = !this.existing
          this.err = ''
      },
      createAccount(){
          request.get('/newaccount/' + this.name)
              .end((err, res) => {
                  console.log({err,res})
                  if (err) {
                      return this.err = err.message
                  }
                  this.setAuth(res.body.token, res.body.session)
                  setTimeout(()=> window.location.reload(true), 101)
              })
      },
      createSession(){
          let session = uuidV1()
          let sessionKey = cryptoUtils.createHash(session + cryptoUtils.createHash(this.pass))
          let token = cryptoUtils.hmacHex(session, sessionKey)
          request
              .post('/session')
              .set('authorization', token)
              .set('session', session)
              .set('name', this.name)
              .end( err =>{
                  if (err) {
                      this.pass = ''
                      return this.err = err.message
                  }
                  this.setAuth(token, session)
                  setTimeout(()=> window.location.reload(true), 101)
              })
      },
      setAuth(token, session){
          this.pass = ""
          this.$store.commit('setAuth', {
              token,
              session,
          })

          window.localStorage.setItem("token", token)
          window.localStorage.setItem("session", session)

          if (token && session){
              this.waitingLogin = true
              this.$store.dispatch('loadCurrent')
          }
      }
  }
}
</script>

<style lang='stylus' scoped>


@import '../styles/colours'
@import '../styles/button'
@import '../styles/switch'
@import '../styles/input'
@import '../styles/grid'
@import '../styles/spinners'

.mainbg
    background: #404040
    text-align: center
.spin
    height: 3em

.notethis
    margin-top: 9em

.switcher
    margin-top: 1.3em
    margin-bottom: 1.3em
    cursor: pointer

.five.grid.center
    padding: .77em
    text-align: center;
//
// //     cursor: pointer
//     min-height: 3em
//     margin-top: 1.1em

//     min-height: 1.5em

.centertitle
    text-align: center
    font-weight: bolder;
    font-size: 1.2em

h3 span
    cursor:pointer

#auth
    background: lightGrey
    padding: 3em
    border-style: solid
    min-height: 22em

.existing
    text-align: center
    background: main
    color: lightGrey

.existing:hover span
    text-decoration: underline;

h1
    text-align: center

// input
//     font-size: 16px
//     margin-bottom: 0.5em
//     border-radius: 0.25em
// input:focus
//     -webkit-text-size-adjust: 100%
//     font-size: 16px
//     -moz-transform: scale(1)

.secret
    -webkit-text-fill-color: transparent; /* sets just the text color */

.red
    color: accent2
</style>
