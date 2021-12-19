<template lang='pug'>

.preview(@click.stop   v-if='deck.length > 0 && $store.getters.contextCard.taskId !== task.taskId')
    .prev(v-if='preview') {{ preview }}
    .row
        .one.grid
            span &nbsp;
        .two.grid
            .bead( v-if='red.length > 0'   v-for="(b,i) in yellow", @click='goto(b.taskId)'  :class='{yellowwx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
        .two.grid
            .bead( v-if='blue.length > 0' v-for="(b,i) in purple", @click='goto(b.taskId)'  :class='{purplewx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
        .two.grid
            .bead( v-if='red.length === 0'  v-for="(b,i) in yellow", @click='goto(b.taskId)'  :class='{yellowwx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
            .bead( v-for="(b,i) in red"  :b="b", @click='goto(b.taskId)'  :class='{redwx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
        .two.grid
            .bead( v-for="(b,i) in green", @click='goto(b.taskId)'  :class='{greenwx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
        .two.grid
            .bead( v-if='blue.length === 0'  v-for="(b,i) in purple", @click='goto(b.taskId)'  :class='{purplewx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
            .bead( v-for="(b,i) in blue", @click='goto(b.taskId)'  :class='{bluewx: $store.getters.member.stacks === 5}'  draggable="true"  :ondragstart='dragStartWrap(b)'  @mouseenter='setPreview(b.name)'  @mouseleave='setPreview(false)')
        .one.grid
            span &nbsp;
</template>

<script>

export default {
  data(){
      return { preview: false }
  },
  props: ['task'],
  methods:{
      setPreview(x){
          if (x && x.length > 14){
              x = x.slice(0,14)
          }
          this.preview = x
      },
      dragStartWrap(b){
          return (ev) => {
              ev.dataTransfer.setData("taskId", b.taskId);
              ev.stopPropagation()
          }
      },
      getTask(taskId){
          return this.$store.state.tasks[this.$store.state.hashMap[taskId]]
      },
      goto(taskId){
          this.$store.commit("goGo", [this.$store.getters.contextCard.taskId, this.task.taskId, taskId])
      },
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
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/grid'

.prev
    position: absolute;
    top: -2.4em
    font-size: 1em
    background: lightGrey
    z-index: 200
    overflow: visible;
    width: 200%
    padding: .3em

.bead
    opacity: .7237;
    padding: 0
    margin:0
    height:.77em
    min-height: 6px
    width: 100%
    border-radius: 50%;
    border-width: 2px
    border-style: solid
    cursor: pointer
    background: lightGrey

.preview
    width: 15%;
    max-width: 5em
    position: absolute;
    bottom: 0;
    right: 11.11111%
    height: 3em

// colors on applied classes overwrite
@import '../styles/colours'
</style>
