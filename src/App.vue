<template lang='pug'>

.app
  div(v-if='!$store.getters.isLoggedIn')
      auth
      .statement
          div Thank you to everyone to supported Taylor Singleton-Fookes and the PPC in Vancouver Centre. I am humbled by your support.
          div The result is expected but disappointing nonetheless because the foundation of our democracy is being lost.
          div I learned much from this experience. The PPC must be proud of its growth across the country. I was hesitant to put myself forward as a public figure, but am proud of standing up for the message of the People's Party of Canada and over the next few years I will try to build awareness of the PPC.
          div Welcome to an &nbsp;
              a(href='https://github.com/autonomousorganization/ao-3'  target="_blank") ao.
              span &nbsp; Make an account above to contact me, explore ideas, coordinate activism, test bitcoin lightning, and get ready for the next election.
          div Take care,
          div - Taylor Singleton-Fookes
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
            if (anypass.target.id === "card" || anypass.target.type === "text"){
                return // skip focus
            }
            this.$store.commit('focus', anypass.key)
        }
    }
}

</script>

<style lang="stylus">
@import "./styles/normalize";
@import "./styles/colours";

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



</style>
