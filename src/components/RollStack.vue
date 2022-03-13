<template lang='pug'>

#tasks
  .container
    .fixedstatus(v-if='c.length > 1  && sanePosition !== -1'  ) {{ sanePosition + 1 }} of {{ c.length }}
    .ptr(ref='swipebar'  :ondrop='drop'  :ondragover="allowDrop"  :ondragleave='dragLeave')
        span.third(:class='{hidden:open}'  ref='previous')
            .donut.hidden
        span.third(ref='mandelorb')
            .donut.moonbag(v-if='!loadingAll'  :class='{pileselected:$store.state.upgrades.color===stack  && $store.state.upgrades.create, dropping:dropping}')
            img.spin(v-else  src='../assets/images/gear.svg')
        span.third(:class='{hidden:open}'  ref='next')
            .donut.hidden
    .box
        hypercard(v-if='c.length > 0'  :b="c[sanePosition]"  :inId='$store.getters.contextCard.taskId'  :key='c[sanePosition].taskId')
</template>

<script>
import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import _ from 'lodash'
import Propagating from 'propagating-hammerjs'
import Hypercard from "./Card"

//
// function rollStackMagic()

export default {
  data(){
      return {
          orbuuid: uuidv1(),
          componentKey: 0,
          dropping: false,
          reverseIndex: this.$store.state.tasks.length - 1,
          loadingAll: false
      }
  },
  mounted(){
        let orbel = this.$refs.mandelorb
        if(!orbel) return
        let orbmc = Propagating(new Hammer.Manager(orbel))

        let orbTap = new Hammer.Tap({ time: 400 })
        orbmc.add(orbTap)

        orbmc.on('tap', (e) => {
            // on click?
            let gotOne = false
            while (!gotOne){
                let potential = this.$store.state.tasks[this.reverseIndex]
                if (_.indexOf(potential.deck, this.$store.getters.contextCard.taskId) > -1){
                    gotOne = true
                    this.$store.commit("rollStackPush", potential.taskId)
                }
                this.reverseIndex --
                if (this.reverseIndex < 0){
                    gotOne = true
                    // not really but break
                }
            }
            // if (!gotOne){
            //     this.$store.commit("rollStackPush", this.$store.state.guilds[0])
            // }
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
            e.stopPropagation()
            this.$store.commit('rollStackSet')
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
  methods:{
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
        this.$store.commit("rollStackPush", data)
        this.$store.commit("setRollStackPosition", this.$store.state.upgrades.rollStack.length - 1)
    },
    first() {
        this.$store.commit("setRollStackPosition", 0)
    },
    previous(){
        let position = (this.sanePosition - 1)
        if (position <= -1){
            position = this.c.length - 1
        }
        this.$store.commit("setRollStackPosition", position)
    },
    next(){
      this.$store.commit("setRollStackPosition", (this.position + 1) % this.c.length)
    },
    last() {
        this.$store.commit("setRollStackPosition", this.c.length - 1)
    },
    orbswap(swapId1){
        // todo?
        console.log(swapId1)
    },
    swap(direction){
        // todo?
        console.log(direction)
    },
  },
  computed: {
    c(){
        return this.$store.state.upgrades.rollStack.map(x => {
            return this.$store.state.tasks[this.$store.state.hashMap[x]]
        })
    },
    position(){
        return this.$store.state.upgrades.rollStackPosition
    },
    sanePosition(){
        return Math.min(Math.max(this.position, -1), this.c.length - 1)
    },
    open(){
        return this.sanePosition === -1
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
@import '../styles/skeleton'
@import '../styles/spinners'
@import '../styles/donut'

img.spin
    height: 3em
    float: right

.donut.moonbag
      background-image: url('../assets/images/moonbag.svg')
#tasks
    width: 100%

img
    height: 3em
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;

.ptr
    cursor: pointer
    width: 100%
    margin: 0
    margin-bottom: -.6em
    margin-bottom: -.6em;

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

.donut.dropping
    border-color: blue

</style>
