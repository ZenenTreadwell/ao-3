<template lang='pug'>

.app
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
}

</script>

<style lang="stylus">
@import "./styles/normalize";
@import "./styles/colours";

.breathingroom
    margin-bottom: 7em

.app
    background: main
    min-height: 100vh;
    color: accent1
    font-weight: lighter
    font-size: 1.33em
</style>
