<template lang='pug'>

.app
  .container(v-if='!$store.getters.isLoggedIn')
      helm
      auth
      panels
  router-view(v-else)

</template>

<script>
import Panels from './components/Panels'
import Auth from './components/Auth'
import Helm from './components/Helm'
export default {
    mounted() {
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
        } else {
            const params = new URLSearchParams(window.location.search)
            token = params.get('token') 
            console.log('got token from params', token)
            if (token) this.$store.commit('setAuth', {token})
        }
        this.$store.dispatch('loadCurrent')
        window.addEventListener('keypress', this.alwaysFocus)
        window.addEventListener('keydown', this.alwaysFocusDown)
    },
    components: {
        Auth, Helm, Panels 
    },
    methods: {
        alwaysFocus(anypass){
            if (anypass.target.id === "card" && !this.$store.state.upgrades.create){
                this.$store.commit('toggleCreate')
            }
            if (anypass.target.id === "card" || anypass.target.type === "text" || anypass.target.type === "password"){
                this.$store.commit('focus', '')
                return // skip focus
            }
            this.$store.commit('focus', anypass.key)
        },
        alwaysFocusDown(anypass){
            if (anypass.key === 'Backspace'){
                if (anypass.target.id === "card" || anypass.target.type === "text" || anypass.target.type === "password"){
                    return // skip focus
                }
                this.$store.commit('focus', anypass.key)
            }
        }
    }
}

</script>

<style lang="stylus">

@import "./styles/normalize";
@import "./styles/skeleton";
@import "./styles/colours";


.reqStatus
    background: blue
    color: black
    position: absolute;
    bottom: 3em
    left: 3em
    font-size: 2em

.cb
    text-align: center
    font-weight: bolder;
    font-size: 1.4em
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
    background: wrexgreen
    color: main
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
.container
    padding-top: 4em 

</style>
