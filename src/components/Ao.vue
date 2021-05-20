<template lang='pug'>
.app(@click='$store.commit("closeAll")')
    .app2(:class='cardInputSty')
    helm
    contexts
    deck
    task-create
    .breathingroom
    //- event-feed
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
                redwxd : this.$store.getters.contextCard.color == 'red',
                bluewxd : this.$store.getters.contextCard.color == 'blue',
                greenwxd : this.$store.getters.contextCard.color == 'green',
                yellowwxd : this.$store.getters.contextCard.color == 'yellow',
                purplewxd : this.$store.getters.contextCard.color == 'purple',
                blackwxd : this.$store.getters.contextCard.color == 'black',
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

.redwxd
    background: #22070d
.bluewxd
    background: #070722
.greenwxd
    background: #07220b
.yellowwxd
    background: #221f07
.purplewxd
    background: #1d082c
.blackwxd
    background: #1d082c

</style>
