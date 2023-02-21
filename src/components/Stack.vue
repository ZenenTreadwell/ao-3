<template lang='pug'>

#tasks
    img.oodd(draggable='false'  src='../assets/images/open.svg', ref='swipebar'  :ondrop='drop'  :ondragover="allowDrop"  :ondragleave='dragLeave')
    .ptr(:ondrop='drop'  :ondragover="allowDrop"  :ondragleave='dragLeave')
        span.third.dot(:class='{hidden:open || c.length <= 1}'  ref='previous')
        span.third(ref='mandelorb' draggable="true" :ondragstart='dragStart')
            .donut(:class='{pileselected: $store.state.upgrades.color === stack, pileopen: $store.getters.contextCard.stackView[stack] === -1, dropping:dropping}')
            .fixedstatus(v-if='c.length > 1  && sanePosition !== -1'  ) {{ sanePosition + 1 }} of {{ c.length }}
            .fixedstatus(v-else-if='c.length === 1') 1 
            .fixedstatus(v-else-if='c.length === 0') -
            .fixedstatus(v-else-if='sanePosition === -1') {{c.length}}
        span.third.dot(:class='{hidden:open || c.length <= 1}'  ref='next')
    .open(v-if='open')
        div(v-for='(b, i) in c'  :key="b.taskId")
            .orby(v-if='i > 0'  @click='orbswap(b.taskId)'  :class='{hidden:!$store.getters.member.guides}')
                .donut.hidden
            hypercard(:b="b"  :key="b.taskId"  :inId='taskId'  :c='panelIds')
    .box(v-else)
        hypercard(:b="c[sanePosition]"  :inId='taskId'  :key='c[sanePosition].taskId')
    .piledrop(v-if='c.length < 1'  :ondrop='drop'  :ondragover="allowDrop"  :ondragleave='dragLeave' :class='{dropping:dropping}'  @click='stackTap')


</template>

<script>
import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'
import Hypercard from "./Card"

export default {
  props: ['stack', 'position', 'taskId'],
  mounted(){
        let orbel = this.$refs.mandelorb
        if(!orbel) return
        let orbmc = Propagating(new Hammer.Manager(orbel))

        let orbTap = new Hammer.Tap({ time: 400 })
        orbmc.add(orbTap)
        orbmc.on('tap', (e) => {
            this.stackTap()
            e.stopPropagation()
        })

        let barel = this.$refs.swipebar
        if(!barel) return
        let barmc = Propagating(new Hammer.Manager(barel))

        let barSwipe = new Hammer.Swipe({ threshold: 50 })
        barmc.add(barSwipe)
        
        barmc.add(orbTap)    
            
        barmc.on('tap', (e) => {
            this.stackTap()
            e.stopPropagation()
        })


        barmc.on('swipeleft', (e) => {
          this.previous()
          e.stopPropagation()
        })

        barmc.on('swiperight', (e) => {
          this.next()
          e.stopPropagation()
        })

        barmc.on('swipeup', (e) => {
            this.$store.dispatch("makeEvent" , {
                type: "task-prioritized",
                taskId: this.topCard.taskId,
                inId: this.$store.getters.contextCard.taskId,
                fromId: this.topCard.taskId
            }) 
            e.stopPropagation()
        })

        barmc.on('swipedown', (e) => {
            this.$store.dispatch("makeEvent" , { 
                type: "task-de-sub-tasked",
                inId: this.$store.getters.contextCard.taskId,
                taskId: this.topCard.taskId
            })
            e.stopPropagation()
        });

        let orbPress = new Hammer.Press({ time: 400 })
        orbmc.add(orbPress)
        orbmc.on('press', (e) => {
            e.stopPropagation()
            this.stackTap()
        })

        let prevel = this.$refs.previous
        if(!prevel) return
        let prevmc = Propagating(new Hammer.Manager(prevel))

        let prevTap = new Hammer.Tap({ time: 400 })
        prevmc.add(prevTap)
        prevmc.on('tap', (e) => {
            this.previous()
            e.stopPropagation()
        })

        let prevPress = new Hammer.Press({ time: 400 })
        prevmc.add(prevPress)
        prevmc.on('press', (e) => {

            this.first()
            e.stopPropagation()
        })

        let nextel = this.$refs.next
        if(!nextel) return
        let nextmc = Propagating(new Hammer.Manager(nextel))

        let nextTap = new Hammer.Tap({ time: 400 })
        nextmc.add(nextTap)
        nextmc.on('tap', (e) => {
            this.next()
            e.stopPropagation()
        })

        let nextPress = new Hammer.Press({ time: 400 })
        nextmc.add(nextPress)
        nextmc.on('press', (e) => {

        this.last()
        e.stopPropagation()
        })
        
  },
  data(){
      return {
          orbuuid: uuidv1(),
          componentKey: 0,
          dropping: false,
      }
  },
  methods:{
    dragStart(ev){
        ev.dataTransfer.setData("taskId", this.c.map(t => t.taskId))
    },
    stackTap(){
        if (this.c.length > 1){
            this.toggleOpen()
        }
        this.$store.commit('setColor', this.stack)
    },
    dragLeave(){
        this.dropping = false
    },
    allowDrop(ev){
        ev.preventDefault()
        this.dropping = true
    },
    drop(ev){
        ev.preventDefault();
        var data = ev.dataTransfer.getData("taskId")
        this.$store.commit('rollStackPull', data)
        this.$store.dispatch("makeEvent", {
            type: 'task-colored',
            inId: this.$store.getters.contextCard.taskId,
            taskId: data,
            color: this.stack
        })
        setTimeout(() => this.dropping = false, 444)
    },
    toggleOpen(){
        this.$store.commit('setColor', this.stack)
        if (this.position !== -1){
            let touchyOpen = {
              type: 'task-touched',
              taskId: this.$store.getters.contextCard.taskId,
              stack: this.stack,
              position: -1
            }
            this.$store.dispatch("makeEvent", touchyOpen)
            this.$store.commit("applyEvent", touchyOpen)
        } else {
            this.first()
        }
    },
    first() {
        let touchyTop = {
            type: 'task-touched',
            taskId: this.$store.getters.contextCard.taskId,
            stack: this.stack,
            position: 0
        }
        this.$store.dispatch("makeEvent", touchyTop)
        this.$store.commit("applyEvent", touchyTop)

    },
    previous(){
        if (this.position <= 0){
            return this.last()
        }
        let touchyBack =  {
          type: 'task-touched',
          taskId: this.$store.getters.contextCard.taskId,
          stack: this.stack,
          position:this.sanePosition - 1,
        }
        this.$store.dispatch("makeEvent", touchyBack)
        this.$store.commit("applyEvent", touchyBack)
    },
    next(){
      if (this.position + 1 >= this.c.length){
          return this.first()
      }
      let touchyForward = {
        type: 'task-touched',
        taskId: this.$store.getters.contextCard.taskId,
        stack: this.stack,
        position: this.sanePosition + 1 
      }
        
      this.$store.dispatch("makeEvent", touchyForward)
      this.$store.commit("applyEvent", touchyForward)
    },
    last() {
      let touchyLast = {
        type: 'task-touched',
        taskId: this.$store.getters.contextCard.taskId,
        stack: this.stack,
        position: this.c.length - 1
      }
      this.$store.dispatch("makeEvent", touchyLast)
      this.$store.commit("applyEvent", touchyLast)
    },
    orbswap(swapId1){
        let swapId2 = this.panelIds[ this.panelIds.indexOf(swapId1) - 1 ]
        let touchyOrby = {
            type: 'task-swapped',
            taskId: this.taskId,
            swapId1,
            swapId2,
        }
        this.$store.dispatch("makeEvent", touchyOrby)
        this.$store.commit("applyEvent", touchyOrby)  // causes doubleback

    },
    swap(direction){
        let cardIndex
        this.c.forEach((t, i) => {
          if(t.taskId === this.topCard.taskId) {
            cardIndex = i
          }
        })
        let swapIndex = (cardIndex + direction) % this.c.length
        if (swapIndex === -1) {
            swapIndex = this.c.length - 1
        } else if (swapIndex > this.c.length - 1) {
            swapIndex = 0
        }
        let touchySwap = {
            type: 'task-swapped',
            taskId: this.taskId,
            swapId1: this.topCard.taskId,
            swapId2: this.c[swapIndex].taskId,
        }
        this.$store.dispatch("makeEvent", touchySwap)
        this.$store.commit("applyEvent", touchySwap) // causes doubleback

    },
  },
  computed: {
    sanePosition(){
        return Math.min(Math.max(this.position, -1), this.c.length - 1)
    },
    c(){
        let c = this.$store.getters[this.stack]
        if (!c){
            return []
        }
        return c
    },
    open(){
        return this.sanePosition === -1
    },
    topCard(){
        let end = this.c.length - 1
        if (!this.c || end < 0){
            console.log('no top?')
            return false
        } else{
            return this.c[this.sanePosition]
        }
    },
    panelIds() {
        return this.c.map(g => g.taskId)
    }
  },
  components:{
      Hypercard,
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/donut'

.oodd
    float: right
    position: relative
    margin-bottom:-5em
    width: 100%   


.dot
    font-size: 1.9em
    color: softGrey
    z-index: 1
    content-align: center 
    text-align: center 
    padding-top: 0.3em

.dot:before
    content: "\2022"

.piledrop
    min-height: 7.987em

.orby
    height: 2.72em
    margin-top: -0.41em
    margin-bottom: -0.41em
    cursor: pointer
.orby .donut
    position: relative;
    left: 33%

#tasks
    width: 100%

.spaceroom
    height:2.9em

.ptr
    cursor: pointer
    width: 100%
    margin: 0
    margin-bottom: -.6em
    margin-bottom: -.6em;
    display: flex

.box
    min-height: 1em

.center
    text-align: center

.hidden
    opacity: 0

.third
    flex-grow: 1
    text-align: center
.third .donut
    position: relative;
    left: calc(50% - 1.7em)

.fixedstatus
    color: lightGrey
    pointer-events: none;
    opacity: 0.5;
    font-size: 0.81em;
    text-align: center 
    position: absolute 
    padding-bottom: 1.5em;
    height: 0;
    position: relative;
    top: -2.7em;
.donut.pileselected
    border-color: lightGrey

.donut.pileopen 
    border-bottom-style: none

.donut.dropping
    border-color: blue

</style>
