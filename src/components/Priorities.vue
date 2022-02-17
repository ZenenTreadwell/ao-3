<template lang='pug'>

.priorities
    div.center(v-if='priorities.length === 0 && $store.getters.contextCard.subTasks.length > 0') prioritize a card by clicking it on the top right corner
    div.center(v-else-if='priorities.length === 0 && $store.getters.contextCard.subTasks.length === 0') create a card with the bar at the bottom of the page
    .clearboth(v-for='(t, i) of priorities'  :key='t')
      .row.priority
          .priorityContainer
              .dot(@click='refocused(t)')
              hyperpriority.fw(:taskId='t'  :c='priorities')
              .dot(v-if='!hasCompleted(t)'  @click='prioritized(t)')
              .dot(v-else  @click='completed(t)')
      .row.subpriority(v-for='(st, j) of getSubPriorities(t)'   :key='st')
          .clearboth.opensubcard
              hyperpriority(:taskId='st'  :inId="t"  :c='getSubPriorities(t)')
          .row.subsubpriority(v-for='(st2, k) of getSubPriorities(st)'  :key='st2')
              .clearboth.opensubcard
                  hyperpriority(:taskId='st2'  :inId="st"  :inInId='t'  :c='getSubPriorities(st)')
</template>

<script>

import Hypercard from './Card'
import Hyperpriority from './SimplePriority'
import Connect from './Connect'

export default {
  data(){
      return {
          action: false,
      }
  },
  methods:{
    hasCompleted(tId){
        let card = this.$store.state.tasks[this.$store.state.hashMap[tId]]
        if(card && card.claimed){
            return card.claimed.length > 0
        }
        return false
    },
    getSubPriorities(taskId){
      let card = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
      if(card && card.priorities){
          return card.priorities.slice().reverse()
      }
    },
    refocused(tId){
      this.$store.dispatch("makeEvent", {
        type: 'task-sub-tasked',
        inId: this.$store.getters.contextCard.taskId,
        taskId: tId,
      })
    },
    prioritized(taskId){
      this.$store.dispatch("makeEvent", {
        type: 'task-prioritized',
        inId: this.$store.getters.contextCard.taskId,
        fromId: this.$store.getters.contextCard.taskId,
        taskId,
      })
    },
    completed(taskId){
      this.$store.dispatch("makeEvent", {
        type: 'task-completed',
        inId: this.$store.getters.contextCard.taskId,
        taskId,
      })
    },
    getCard(taskId){
        return this.$store.state.tasks[this.$store.state.hashMap[taskId]]
    },
    pilePrioritized() {
      this.$store.dispatch("makeEvent", {
        type: "pile-prioritized",
        inId: this.$store.getters.contextCard.taskId,
        tasks: this.$store.getters.contextCard.subTasks
      });
    },
    pileRefocused() {
      this.$store.dispatch("makeEvent", {
        type: "pile-refocused",
        inId: this.$store.getters.contextCard.taskId
      });
    }
  },
  computed:{
      priorities(){
          return this.$store.getters.contextCard.priorities.slice().reverse()
      },
  },
  components:{
      Hyperpriority,
      Hypercard,
      Connect
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/donut'


.dot
    font-size: 1.9em
    color: lightGrey
    min-height: 1.3em
    min-width: 1.3em
    cursor: pointer
    color: main
    text-align: center
    opacity: 0.2

.dot:before
    content: "\2022";

.center
    text-align: center

.fw
    width: 100%

.priorities
    padding-bottom: 0.6em
    padding-top: 0.1em

.clearboth
    clear: both

.priority
    margin-left: 0em
    width: 100%
    position: relative

.subpriority
    margin-left: 3.3724em
    width: calc(100% - 3.3724em)

.subsubpriority
    margin-left: 3.3724em
    width: calc(100% - 3.3724em)

.opensubcard
    width: calc(100% - 0.5em)
    margin-top: 0.5em

.priorityContainer
    display: flex;
    justify-content: space-between;
    width:100%

</style>
