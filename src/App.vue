<template lang='pug'>

.app
  .container(v-if='!$store.getters.isLoggedIn')
      div &nbsp;
      auth
      .statement
          div Welcome to AO, a shared recursive notepad for persistent, constructive, human collaboration.
          div Make an account above to contribute your ideas, explore the calendar, plan what needs doing, and see who has been doing it. I'm working on making AO better, but I'm also ready to coordinate other types of activism.
          div Each card is a landing pad for other cards, has a task list & calendar, can accept bitcoin (which is a gift to the AO operator, feel free to try that out :p). Read more about the app on &nbsp;
              a(href='https://github.com/autonomousorganization/ao-3'  target="_blank") github. &nbsp;
              span Accounts are open. They represent a unique connection. Make one from every device you intend to connect from. All connections can see all others. A tutorial video that explains more is in the works.
          div Experiment, you can't break anything. Make a note, move a note into a note, navigate through the structure, make a checkmark. Don't forget to have fun. Write down what is important to you, not to get lost in a feed, but to return to, develop, expand upon, and most importantly, act on.
          div Together we must protect what is most important.
          div Take care,
          div - Taylor Singleton-Fookes, PPC Candidate of Record in Vancouver Centre
      .whatis
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
            if (anypass.target.id === "card" || anypass.target.type === "text" || anypass.target.type === "password"){
                return // skip focus
            }
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
