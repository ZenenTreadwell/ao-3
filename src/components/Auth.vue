<template lang='pug'>

#auth(v-if='!confirmed')
  .mainbg(v-if='$store.state.loader.reqStatus === "pending"')
      img(src='../assets/images/gear.svg')
  .authbox.centertitle(v-if='err')
      .warning {{err}}
  .authbox
      h2.centertitle New Account
      .input-container
          input.input-effect(type='text', v-model='namenew', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
          label alias
          span.focus-border
      button(@click="createAccount") enter
      h2.centertitle Login
      .flexrow
          .inputhalf
              .input-container
                  input.input-effect(type='text', v-model='name', autocapitalize="none", autocomplete="username", autocorrect="off", @keyup.enter='createAccount'  :class='{"has-content":!!name}')
                  label name
                  span.focus-border
          .inputhalf
            .input-container
                input.input-effect#password(type='password', v-model='pass', autocapitalize="none", autocomplete="off", autocorrect="off", @keyup.enter='createSession'  :class='{"has-content":!!pass}')
                label password
                span.focus-border
      button(@click="createSession") login
  div.featurelist
    div.featureorbug 
      img(src='../assets/images/gear.svg')
      span account settings 
    div.featureorbug
      img(src='../assets/images/doge.svg')
      span view accounts, click to go there
    div.featureorbug
      img(src='../assets/images/clipboard.svg') 
      span click text of card to copy
    div.featureorbug
      img(src='../assets/images/hourglass.svg') 
      span mark in progress to record time
    div.featureorbug
      img(src='../assets/images/trash.svg') 
      span delete a card drag to bottom right (remove only works if single account present)  
    div.featureorbug
      img(src='../assets/images/xmark.svg') 
      img(src='../assets/images/mark.svg') 
      span cards checked multiple times keep a tally    
    div.featureorbug
      img(src='../assets/images/timecube.svg') 
      span view on calendar, accumulate recursively. Drag to day to schedule
    div.featureorbug
      img(src='../assets/images/badge.svg')
      span pin in progress things for quick access
    div.featureorbug
      img(src='../assets/images/completed.svg')
      span completing a card stores it under the completed switch
    div.featureorbug
      img(src='../assets/images/lightning.svg')
      span collect payment record and create invoices
    div.featureorbug
      img(src='../assets/images/bull.svg')
      span connect resources and trigger with fob reader, button, and payment
  div &nbsp;  
  div &nbsp;  
  div &nbsp;  
  div &nbsp;  
  div &nbsp;  
  div &nbsp;  
  img(src='../assets/images/sunglasses.svg')
  div &nbsp;  
  div &nbsp;
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
          namenew: '', 
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
          request.get('/newaccount/' + this.namenew)
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
@import '../styles/spinners'

button 
    background: #2e7232;
    width: 7.77em;

div.featurelist
    align-items: center
    justify-content: center
    display: flex
    flex-direction: row
    flex-wrap: wrap

div.featureorbug 
    background: wrexgreen 
    margin: 1em
    padding: 1em
    display: flex
    flex-direction: row
    align-items: center
    width: 240px
        
ul 
    text-align:right
    position: relative 
    right: 1em 

.authbox
    background: lightGrey
    padding: 1.3em 3em 3em 3em
    border-style: solid
    margin-bottom: 2.2em

.flexrow 
    display: flex 
.inputhalf
    flex-grow: 1
.mainbg
    background: #404040
    text-align: center

.center 
    text-align: center

.existing
    background: main
    color: lightGrey

.existing:hover span
    text-decoration: underline

.centertitle
    text-align: center
    font-weight: bolder
    font-size: 1.2em
    margin-bottom: 0

.five.grid.center
    padding: .77em
    text-align: center;

.switcher
    margin-top: 1.3em
    margin-bottom: 1.3em
    cursor: pointer
    display: flex

.five 
    flex-grow: 5

.two 
    flex-grow: 2
    text-align: center

.notethis
    margin-top: 1em

.featureorbug img
    height: 3em
    padding: 1em 

.warning
    position: absolute;
    left: 1em;

.foge 
    height: 5em
    float: left 
</style>
