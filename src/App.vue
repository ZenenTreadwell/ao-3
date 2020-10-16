<template lang='pug'>

.app
  .app2(:class='cardInputSty')
  helm
  contexts
  event-feed
  task-create
  deck
  .breathingroom
</template>

<script>

import EventFeed from './components/EventFeed'
import Helm from './components/Helm'
import Contexts from './components/Contexts'
import TaskCreate from './components/TaskCreate'
import Deck from './components/Deck'

export default {
    mounted() {
        let token = window.localStorage.token
        let session = window.localStorage.session
        if (token && session){
            this.$store.commit('setAuth', {token, session})
        }
        this.$store.dispatch("connectSocket")
        this.$store.dispatch('loadCurrent')
    },
    components: {
        EventFeed, Helm, TaskCreate, Contexts, Deck
    },
    computed: {
        cardInputSty(){
            if (this.$store.getters.member.stacks === 5) return {
                redwx : this.$store.getters.contextCard.color == 'red',
                bluewx : this.$store.getters.contextCard.color == 'blue',
                greenwx : this.$store.getters.contextCard.color == 'green',
                yellowwx : this.$store.getters.contextCard.color == 'yellow',
                purplewx : this.$store.getters.contextCard.color == 'purple',
                blackwx : this.$store.getters.contextCard.color == 'black',
            }
            return {
                nowx: true
            }
        },
    }
}

</script>

<style lang="stylus">
@import "./styles/normalize";
@import "./styles/colours";

.breathingroom
    height: 7em

.app
    background: main
    min-height: 100vh;
    color: lightGrey
    font-weight: lighter
    font-size: 1.23em

.app2
    position: fixed
    top: 0
    min-height: 100vh;
    min-width: 100vw;
    pointer-events: none;
    opacity: 0.36

</style>
