<template lang='pug'>

.app
  .container(v-if='!$store.getters.isLoggedIn')
      div &nbsp;
      auth
      .statement
          .row Each card can:
          div &nbsp;
          .row
              .four.columns.plac(@click='toBoat'  :class='{activationsequence: $store.state.upgrades.mode === "boat"}')
                  img.placmage(src='./assets/images/completed.svg')
                  div Create a todolist, create checkmarks.
              .four.columns.plac(@click='toTimeCube'  :class='{activationsequence: $store.state.upgrades.mode === "timecube"}')
                  img.placmage(src='./assets/images/timecube.svg')
                  div View a calendar, view past checkmarks, schedule upcoming events.
              .four.columns.plac(@click='toChest'  :class='{activationsequence: $store.state.upgrades.mode === "chest"}')
                  img.placmage(src='./assets/images/bitcoin.svg')
                  div Send bitcoin into ao's lightning node, see past gifts.
      .statement.dark
          .row Each server has:
          div &nbsp;
          .row
              .four.columns.plac(@click='toBoat'  :class='{activationsequence: $store.state.upgrades.mode === "boat"}')
                  img.placmage(src='./assets/images/doge.svg')
                  div List of all users created.
              .four.columns.plac(@click='toTimeCube'  :class='{activationsequence: $store.state.upgrades.mode === "timecube"}')
                  img.placmage(src='./assets/images/bull.svg')
                  div Bitcoin node information for the blockchain (bitcoind) and lightning (lightningd).
              .four.columns.plac(@click='toChest'  :class='{activationsequence: $store.state.upgrades.mode === "chest"}')
                  img.placmage(src='./assets/images/gear.svg')
                  div Controls to change name and password, logout, etc.
  router-view(v-else)
</template>

<script>

import Auth from './components/Auth'

export default {
    mounted() {
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
            this.$store.dispatch('loadCurrent')
        }
        window.addEventListener('keypress', this.alwaysFocus)
    },
    components: {
        Auth
    },
    methods: {
        alwaysFocus(anypass){
            if (anypass.target.id === "card" && !this.$store.state.upgrades.create){
                this.$store.commit('toggleCreate')
            }
            if (anypass.target.id === "card" || anypass.target.type === "text" || anypass.target.type === "password"){
                console.log('skipping', anypass.target.id)
                this.$store.commit('focus', '')
                return // skip focus
            }
            console.log(
              'always focus', anypass.key
            )
            this.$store.commit('focus', anypass.key)
        }
    }
}

</script>

<style lang="stylus">

@import "./styles/normalize";
@import "./styles/skeleton";
@import "./styles/colours";

p
    display: inline
    margin: 0
    padding: 0
    img
        max-width: 100%
iframe
    max-width: 100%

.four.columns.plac
    text-align: center
    .placmage
        height: 3em

.app
    background: #404040
    color: main
    font-size: 1.12334455em
    font-family: ubuntu
    min-height: 100vh

.statement
    margin: 2em
    padding: 2em
    background: lightGrey
    div
        margin-bottom: 0.987em

.statement.dark
    background: main
    color: lightGrey

</style>
