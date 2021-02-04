<template lang='pug'>

.preview(@click.stop  v-if='deck.length > 0 && $store.getters.contextCard.taskId !== task.taskId')
    .row
        .one.grid
            span &nbsp;
        .two.grid
            .bead(v-if='red.length > 0'   v-for="(b,i) in yellow", @click='goto(b.taskId)'  :class='{yellowwx: $store.getters.member.stacks === 5}')
        .two.grid
            .bead(v-if='blue.length > 0' v-for="(b,i) in purple", @click='goto(b.taskId)'  :class='{purplewx: $store.getters.member.stacks === 5}')
        .two.grid
            .bead(v-if='red.length === 0'  v-for="(b,i) in yellow", @click='goto(b.taskId)'  :class='{yellowwx: $store.getters.member.stacks === 5}')
            .bead(v-for="(b,i) in red"  :b="b", @click='goto(b.taskId)'  :class='{redwx: $store.getters.member.stacks === 5}')
        .two.grid
            .bead(v-for="(b,i) in green", @click='goto(b.taskId)'  :class='{greenwx: $store.getters.member.stacks === 5}')
        .two.grid
            .bead(v-if='blue.length === 0'  v-for="(b,i) in purple", @click='goto(b.taskId)'  :class='{purplewx: $store.getters.member.stacks === 5}')
            .bead(v-for="(b,i) in blue", @click='goto(b.taskId)'  :class='{bluewx: $store.getters.member.stacks === 5}')
        .one.grid
            span &nbsp;
</template>

<script>

import Linky from './Linky'
import calculations from '../calculations'

export default {
  props: ['task'],
  methods:{
      getTask(taskId){
          return this.$store.state.tasks[this.$store.state.hashMap[taskId]]
      },
      goto(taskId){
          let panel = [taskId]
          let top = 0
          let parents =  [this.$store.getters.contextCard.taskId, this.task.taskId]
          this.$store.dispatch("goIn", {parents, panel, top})

          if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
              this.$store.commit("setMode", 1)
          }
      },
      card(tId) {
          return this.$store.state.tasks[this.$store.state.hashMap[tId]]
      },
      shortName(name) {
          return calculations.shortName(name)
      }
  },
  computed: {
      deck(){
          let tasks = []
          if (this.task && this.task.subTasks) {
              this.task.subTasks.forEach( tId => {
                  let task = this.getTask(tId)
                  if(task) {
                      tasks.push(task)
                  }
              })
          }
          return tasks
      },
      red(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'red' } ).reverse().slice(0, 3)
      },
      yellow(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'yellow' } ).reverse().slice(0, 3)
      },
      blue(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'blue' } ).reverse().slice(0, 3)
      },
      purple(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'purple' } ).reverse().slice(0, 3)
      },
      green(){
          return this.deck.filter( c => { if(!c) { return false } return c.color === 'green' } ).reverse().slice(0, 3)
      },
      topPriorities(){
          return this.task.priorities.slice(0, 3).reverse()
      },
  },
  components:{
      Linky,
  },
}

</script>

<style lang="stylus" scoped>
// this means the colour import overwrites
.bead
    opacity: .7237;
    padding: 0
    margin:0
    height:.77em
    min-height: 6px
    width: 100%
    border-radius: 50%;
    display: inline-block;
    border-width: 2px
    border-style: solid
    cursor: pointer
    background: lightGrey


@import '../styles/colours'
@import '../styles/grid'

.preview
    width: 15%;
    position: absolute;
    bottom: 0;
    left: 11.11111%
    height: 3em
    overflow: hidden

.tinyboat
    height: 15px
    width: 100%
    display: inline-block;
    cursor: pointer

.tooltip
    position: relative

.tooltip .tooltiptext
    font-size: 1em
    width: max-content
    max-width: 24em
</style>
