<template lang='pug'>

#tasks
    .fixedstatus(v-if='c.length > 1  && sanePosition !== -1'  ) {{ sanePosition + 1 }} of {{ c.length }}
    .ptr(ref='swipebar'  :ondrop='drop'  :ondragover="allowDrop")
        span.third(:class='{hidden:open}'  ref='previous')
            .donut.hidden
        span.third(ref='mandelorb')
            .donut(:class='{pileselected:$store.state.upgrades.color===stack  && $store.state.upgrades.create}')
        span.third(:class='{hidden:open}'  ref='next')
            .donut.hidden
    .open(v-if='open')
        div(v-for='(b, i) in c'  :key="b.taskId")
            .orby(v-if='i > 0'  @click='orbswap(b.taskId)'  :class='{hidden:!$store.getters.member.guides}')
                .donut.hidden
            hypercard(:b="b"  :key="b.taskId"  :inId='taskId'  :c='panelIds')
    .box(v-else)
        hypercard(:b="c[sanePosition]"  :inId='taskId'  :key='c[sanePosition].taskId')
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
            if (this.$store.state.upgrades.create && this.$store.state.upgrades.color !== this.stack){
                return this.$store.commit('setColor', this.stack)
            }
            this.$store.commit('toggleCreate')
            this.$store.commit('setColor', this.stack)

            // this.toggleOpen()
            e.stopPropagation()
        })

        let barel = this.$refs.swipebar
        if(!barel) return
        let barmc = Propagating(new Hammer.Manager(barel))

        let barSwipe = new Hammer.Swipe({ threshold: 50 })
        barmc.add(barSwipe)

        barmc.on('swipeleft', (e) => {
          this.previous()
          e.stopPropagation()
        })

        barmc.on('swiperight', (e) => {
          this.next()
          e.stopPropagation()
        })

        let orbSwipe = new Hammer.Swipe({ threshold: 50 })
        orbmc.add(orbSwipe)

        orbmc.on('swipeup', (e) => {
            this.swap(-1)
            this.previous()
            e.stopPropagation()
        })

        orbmc.on('swipedown', (e) => {
            this.swap(1)
            e.stopPropagation()
        });

        let orbPress = new Hammer.Press({ time: 400 })
        orbmc.add(orbPress)
        orbmc.on('press', (e) => {
            this.toggleOpen()
            e.stopPropagation()
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
            type: 'task-colored',
            inId: this.$store.getters.contextCard.taskId,
            taskId: data,
            color: this.stack
        })
    },
    toggleOpen(){
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
        let position = (this.sanePosition - 1)
        if (position <= -1){
            position = this.c.length - 1
        }
        let touchyBack =  {
          type: 'task-touched',
          taskId: this.$store.getters.contextCard.taskId,
          stack: this.stack,
          position,
        }
        this.$store.dispatch("makeEvent", touchyBack)
        this.$store.commit("applyEvent", touchyBack)
    },
    next(){
      let touchyForward = {
        type: 'task-touched',
        taskId: this.$store.getters.contextCard.taskId,
        stack: this.stack,
        position: (this.position + 1) % this.c.length
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
    playSound(){
      if (!this.$store.getters.member.muted){
          let flip = new Audio(require('../assets/sounds/pageturn.wav'))
          flip.play()
      }
    },
    toggleStacks(){
        let newfield = 5
        if (this.$store.getters.member.stacks === 5){
            newfield = 1
        }
        this.$store.dispatch('makeEvent', {
            type: "member-field-updated",
            field: 'stacks',
            newfield,
            memberId: this.$store.getters.member.memberId
        })
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
@import '../styles/grid'
@import '../styles/button'
@import '../styles/donut'

h3
    font-size: 0.54em
    padding-top: .5em;

.one
    cursor:pointer

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
    color: accent2
    font-size: 1.34em
    text-align: center

li
    text-align: left

table
    text-align:center
    width: 100%
th
    font-weight: lighter
    font-size: 1.1em
    color: accent1
    border-color: accent1

td
    color: accent3

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
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;

.spaceroom
    height:2.9em

.ptr
    cursor: pointer
    width: 100%
    margin: 0
    margin-bottom: -.6em
    margin-bottom: -.6em;

.fr
    float: right
    margin-left: 0.5em
    margin-top: 0.5em
    margin-right: 0.5em
    cursor: pointer

.fl
    float: left
    margin-right: 0.5em
    margin-top: 0.5em
    //margin-bottom: 0.8em
    margin-left: 0.5em
    cursor: pointer

.box
    min-height: 1em

.bar
    min-height: 1em
    background: softGrey

.verticalcenter
    margin-top: 1em

.horizcenter
    text-align: center

.mandalign
    margin-top: 5px
    cursor: pointer
    padding: 0.77em
    user-drag:none
    img
        height: 1.7em

.center
    text-align: center

.hidden
    opacity: 0

.third
    display: inline-block
    text-align: center
    width: 33%
.third .donut
    position: relative;
    left: 33%
    margin-bottom: 0.8em

.fixedstatus
    height: 0
    position: relative;
    color: lightGrey
    left: 0
    top: 2em;
    pointer-events: none;
    opacity: 0.5;

.donut.pileselected
    border-color: lightGrey

</style>
