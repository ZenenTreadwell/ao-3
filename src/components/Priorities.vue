<template lang='pug'>

.priorities(:ondrop='drop'    :ondragover="allowDrop")
    div.center(v-if='priorities.length === 0') ~task list empty~
        //- span.ptr(v-if='$store.getters.contextCard.subTasks.length > 0'  @click='pilePrioritized') , *raise all {{$store.getters.contextCard.subTasks.length}}*
    .clearboth(v-for='(t, i) of priorities'  :key='t')
      .row.priority
          .priorityContainer
              .dot(@click='refocused(t)')
              hyperpriority.fw(:taskId='t'  :inId='$store.getters.contextCard.taskId'  :c='priorities')
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
    allowDrop(ev){
        ev.preventDefault()
    },
    drop(ev){
        ev.preventDefault();
        var data = ev.dataTransfer.getData("taskId")
        this.$store.dispatch("makeEvent", {
            type: 'task-prioritized',
            inId: this.$store.getters.contextCard.taskId,
            taskId: data,
        })
        this.$store.commit("setMode", 1)
    },
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
@import '../styles/button'
@import '../styles/donut'


.dot
    font-size: 1.9em
    color: lightGrey
    // min-width: 1.3em
    min-height: 1.3em
    cursor: pointer

.dot:before
    content: "\2022";

.center
    text-align: center

.ptr
    cursor: pointer

.fw
    width: 100%

h5
    text-align: center
    opacity: 0.77

.priorities
    padding-bottom: 0.6em
    padding-top: 0.1em

button
    background: darkteal

tr
    border-color: accent4
    border-top-style: solid
    border-bottom-style: solid
    border-width: 3px
    vertical-align:middle

thead
    tr
        text-align: center

td
    vertical-align: middle
    font-size: 1.34em
    text-align: center

li
    text-align: left

img
    height: 3.9em

.padding
    padding: 1.987654321em

li
    margin-left: 1em

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}

img
    height: 3em

.ptr
    cursor: pointer

.fr
    float: right

.fl
    float: left

.clearboth
    clear: both

.onelinecard
    width: 100%
    margin-left: 3em
    padding: 0.5em

.empty
    height: 3em
    padding-top: 0.6em
    padding-bottom: 0.2em

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

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

.singleship
    position: absolute
    width: 3.3724em
    margin-left: -4em
    cursor: pointer
    top: -0.3em

.openboat
    top: 50%
    transform: translateY(-50%)

.opencard
    width: calc(100% - 4.5em)
    margin-top: 0.5em

.opensubcard
    width: calc(100% - 0.5em)
    margin-top: 0.5em

.open
    top: 36%

.boatContainer
    display: flex;
    justify-content: space-between;
    width:100%
    height:45px

.priorityContainer
    display: flex;
    justify-content: space-between;
    width:100%

.boatAll
    margin: .25em 1em 0 .55em
    height: 1.25em;
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    cursor: pointer
    margin-top:.55em

.boatR
    position: absolute
    right: 0px

.boatL
    display: block
    min-width: 0.75em

.closedcard
    padding-right:3em

.hidden
    opacity: 0

</style>
