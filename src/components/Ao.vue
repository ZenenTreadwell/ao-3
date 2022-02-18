<template lang='pug'>
.app(@click='$store.commit("closeAll")')
    .app2(:class='cardInputSty')
    helm
    contexts
    deck
    task-create
    event-feed
</template>

<script>

import EventFeed from './EventFeed'
import Helm from './Helm'
import Contexts from './Contexts'
import TaskCreate from './TaskCreate'
import Deck from './Deck'

export default {
    mounted(){
      for (const move in this.$route.params) {
          let taskId = this.$route.params[move]
          if (taskId && this.$store.state.tasks.some(t => t.taskId === taskId)){
              this.$store.commit("goDeeper", taskId)
          }
      }
    },
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

.app2
    position: fixed
    top: 0
    min-height: 100vh;
    min-width: 100vw;
    pointer-events: none;

.redwxd
    background: #44292f
.bluewxd
    background: #33334E
.greenwxd
    background: #28432C
.yellowwxd
    background: #444129
.purplewxd
    background: #483357
.blackwxd
    background: #1d082c
.nowx
    background: #404040

</style>
