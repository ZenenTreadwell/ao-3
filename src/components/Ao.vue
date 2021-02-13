<template lang='pug'>
.app
    .app2(:class='cardInputSty')
    helm
    contexts
    deck
    task-create
    .breathingroom
</template>

<script>

import EventFeed from './EventFeed'
import Helm from './Helm'
import Contexts from './Contexts'
import TaskCreate from './TaskCreate'
import Deck from './Deck'

export default {
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

<style lang="stylus"  scoped>
@import "../styles/colours";

.breathingroom
    height: 27em

.app2
    position: fixed
    top: 0
    min-height: 100vh;
    min-width: 100vw;
    pointer-events: none;
    opacity: 0.36

</style>
