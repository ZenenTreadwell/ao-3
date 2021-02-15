<template lang='pug'>

.app
  auth
  router-view
</template>

<script>

import Auth from './components/Auth'

export default {
    mounted() {
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
            this.$store.dispatch("connectSocket")
            this.$store.dispatch('loadCurrent')
        }
    },
    components: {
        Auth
    },
}

</script>

<style lang="stylus">
@import "./styles/normalize";
@import "./styles/colours";

.app
    background: #404040
    min-height: 100vh;
    color: main
    font-size: 1.22334455em
    font-family: monospace

</style>
