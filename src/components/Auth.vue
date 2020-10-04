<template lang='pug'>

#auth.container(v-if='!confirmed')
  div(v-if='!existing')
      .input-container
          input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
          label choose name
          span.focus-border
      button(v-if='name.length > 0'  @click="createAccount") new account
  div(v-if='existing')
      .input-container
          input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="username", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
          label name
          span.focus-border
      .input-container
          input.input-effect#password(type='password', v-model='pass', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession'  :class='{"has-content":!!pass}')
          label password
          span.focus-border
      button(v-if='pass.length > 0'  @click="createSession") login
  .existing(@click='toggleExisting') existing account?
</template>

<script>

import request from 'superagent'
import uuidV1 from 'uuid/v1'
import cryptoUtils from '../crypto'

export default {
  name: 'Auth',
  data(){
      return {
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
      },
      createAccount(){
          request.get('/newaccount/' + this.name)
              .end((err, res) => {
                  if (err) {
                      return this.err = err.message
                  }
                  this.setAuth(res.body.token, res.body.session)
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

          this.$store.dispatch('loadCurrent')
      }
  }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/input'
@import '../styles/skeleton'

.existing
    text-align: right
    font-size: 0.7em
    color: lightGrey
    cursor: pointer

h1
    text-align: center

input
    border: 2px solid wrexyellow
    margin-bottom: 0.5em
    border-radius: 0.25em

.secret
    -webkit-text-fill-color: transparent; /* sets just the text color */

.red
    color: accent2
</style>
