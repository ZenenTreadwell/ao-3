<template lang='pug'>

.priorities
    div(v-if='priorities.length < 1')
        h5 empty
    .clearboth(v-for='(t, i) of priorities'  :key='t')
      .row.priority
          .priorityContainer
              checkbox.boatAll.adjtooltip(:b='getCard(t)'  :inId='$store.getters.contextCard.taskId')
              .tooltiptext.correctspotleft(v-if='$store.getters.member.tooltips')
                  p.suggest claim checkmark
              hyperpriority.closedcard.fw(:taskId='t'  :inId='$store.getters.contextCard.taskId'  :c='priorities')
              div(v-if='i > 0')
                  img.boatAll.boatR.faded.adjtooltip(src='../assets/images/upboat.svg'  @click='prioritized(t)'  :class='{hidden:!$store.getters.member.guides}')
                  .tooltiptext.correctspot(v-if='$store.getters.member.tooltips')
                      p.suggest up boat
              div(v-else-if='hasCompleted(t)')
                  img.boatAll.boatR.faded.adjtooltip(src='../assets/images/completed.svg'  @click='completed(t)')
                  .tooltiptext.correctspot(v-if='$store.getters.member.tooltips')
                      p.suggest to completed pile
              div(v-else)
                  img.boatAll.boatR.faded.adjtooltip(src='../assets/images/downboat.svg'  @click='refocused(t)'  :class='{hidden:!$store.getters.member.guides}')
                  .tooltiptext.correctspot(v-if='$store.getters.member.tooltips')
                      p.suggest return to table
      .row.subpriority(v-for='(st, j) of getSubPriorities(t)'   :key='st')
          .clearboth.opensubcard
              hyperpriority.closedcard(:taskId='st'  :inId="t"  :c='getSubPriorities(t)')
          .row.subsubpriority(v-for='(st2, k) of getSubPriorities(st)'  :key='st2')
              .clearboth.opensubcard
                  hyperpriority.closedcard(:taskId='st2'  :inId="st"  :inInId='t'  :c='getSubPriorities(st)')
    div.clearboth
    div
        img.boatAll.faded.adjtooltip(src='../assets/images/downboat.svg'  @click='pileRefocused')
        .tooltiptext.correctspot2(v-if='$store.getters.member.tooltips'  :class='{hidden:!$store.getters.member.guides}')
            p.suggest refocus all
</template>

<script>

import Hypercard from './Card'
import Hyperpriority from './SimplePriority'
import Checkbox from './Checkbox'
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
    refocused(taskId){
      this.$store.dispatch("makeEvent", {
        type: 'task-refocused',
        inId: this.$store.getters.contextCard.taskId,
        taskId,
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
      Checkbox, Connect
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/button'
@import '../styles/tooltips'

.tooltiptext.correctspot2
    position: absolute
    top: 95%
    left: 30%

.tooltiptext.correctspot
    position: absolute
    top: 1.75em
    right: 2em

.tooltiptext.correctspotleft
    position: absolute
    top: 1.75em
    left: 2em

.tooltiptext.correctspotbottomleft
    bottom: 1.75em
    left: 2em

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

.top
    z-index: 9001

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
    margin-left: calc(3.3724em * 2)
    width: calc(100% - (3.3724em* 2))

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
    margin: 0 1em 0 .55em
    height: 20px;
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    opacity: .3
    z-index:9999999999999
    cursor: pointer
    margin-top:.55em

.boatR
    position: absolute
    right: 0px
    height:20px

.faded
    opacity: 0.235654

.closedcard
    padding-right:3em

.hidden
    opacity: 0

</style>
