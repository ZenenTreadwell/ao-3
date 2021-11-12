linky<template lang='pug'>

.current
    span#swipechecks(v-if='$store.getters.contextCard.highlights.length <= 0')
        span(v-for='(c, index) in checkmarks'  :key='c.taskId ')
            span.plain.completedcheckmark(@click='$store.commit("selectCheck", index)'  @mouseenter='$store.commit("selectCheck", index)')
                img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty(c.color, index)' )
    //- span.ptr(v-if='checkmarks.length > 0'  @click='relist') *all up*
    div.ptr.bg(v-if='$store.getters.contextCard.highlights.length > 0 ' v-for='(c, index) in checkmarks'   @click='recallCard(c.taskId)')
        img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty(c.color, index)' )
        span &nbsp;
        linky(:x='c.name' :class='{selectedCheckInList: c.name === $store.getters.selectedCheckCard.name}' )
    div.ptr.bg(v-else-if='$store.getters.selectedCheckCard.name'  @click='recallCard(checkmarks[$store.state.upgrades.selectedCheck].taskId)')
        img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty($store.getters.selectedCheckCard.color)')
        span &nbsp;
        linky(v-if='$store.getters.selectedCheckCard.name'  :x='$store.getters.selectedCheckCard.name')
        span.smaller(v-for='mId in $store.getters.selectedCheckCard.claimed') &nbsp; - {{ getMemberName(mId) }}
</template>

<script>

import Linky from './Linky'
import Coin from './Coin'
import Hammer from 'hammerjs'

export default {

  mounted(){
      var el = document.getElementById('swipechecks')
      var mc = new Hammer.Manager(el)
      var Swipe = new Hammer.Swipe()
      mc.add(Swipe)
      let newCheck
      mc.on('swipeleft', () => {
          newCheck = (this.$store.state.upgrades.selectedCheck - 1) % this.$store.getters.contextCompleted.length
          if (newCheck < 0) newCheck = this.$store.getters.contextCompleted.length - 1
          this.$store.commit('selectCheck', newCheck)
      });

      mc.on('swiperight', () => {
          newCheck =  (this.$store.state.upgrades.selectedCheck + 1) % this.$store.getters.contextCompleted.length
          this.$store.commit('selectCheck', newCheck)
      })
  },
  components: { Linky, Coin },
  methods: {
    getMemberName(mId){
        let name
        this.$store.state.members.some(m => {
            if (m.memberId === mId){
                name = m.name
            }
        })
        return name
    },
    recallCard(taskId){
        this.$store.dispatch("makeEvent", {
            type: 'task-sub-tasked',
            inId: this.$store.getters.contextCard.taskId,
            taskId
        })
        this.$store.commit('selectCheck', false)
    },
    relist(){
        this.$store.dispatch("makeEvent", {
            type: "pile-prioritized",
            tasks: this.$store.getters.contextCard.completed,
            inId: this.$store.getters.contextCard.taskId
        })
    },
    toggleActive(){
        let newfield = this.$store.getters.contextCard.taskId
        if (this.$store.getters.member.action === this.$store.getters.contextCard.taskId){
            newfield = false
        }
        this.$store.dispatch("makeEvent", {
            type: 'member-field-updated',
            field: 'action',
            memberId: this.$store.getters.member.memberId,
            newfield
        })
    },
    goIn(taskId){
        let parents = [this.memberId, this.$store.getters.contextCard.taskId]
        let panel = [taskId]
        let top = 0
        this.$store.dispatch("goIn", {panel, top, parents})
    },
    complete(){
        this.$store.dispatch("makeEvent", {
            type: 'task-claimed',
            taskId: this.$store.getters.contextCard.taskId,
            inId: this.$store.getters.contextCard.taskId,
            notes: 'checked by ' + this.$store.getters.member.memberId
        })
    },
    uncheck(){
        this.$store.dispatch("makeEvent", {
            type: 'task-unclaimed',
            taskId: this.$store.getters.contextCard.taskId,
            inId: this.$store.getters.contextCard.taskId,
            notes: ''
        })
    },
    cardInputSty(c, index){
        if (this.$store.getters.member.stacks === 1) {
            return { selectedCheck: this.$store.state.upgrades.selectedCheck === index }
        }

        return {
            selectedCheck: this.$store.state.upgrades.selectedCheck === index,
            redwx : c === 'red',
            bluewx : c === 'blue',
            greenwx : c === 'green',
            yellowwx : c === 'yellow',
            purplewx : c === 'purple',
            blackwx : c === 'black',
        }
    },
    toggleHighlight(invert = false) {
        this.$store.dispatch("makeEvent", {
            type: 'highlighted',
            taskId: this.$store.getters.contextCard.taskId,
            memberId: this.memberId,
            valence: !invert
        })
    },
  },
  computed:{
    member(){
        let memberId = this.memberId
        let name = false
        this.$store.state.members.forEach(member => {
            if (member.memberId == memberId){
                name = member
            }
        })
        return name
    },
    isCompleted(){
        return this.$store.getters.contextCard.claimed.indexOf(this.memberId) > -1
    },

    isHighlighted() {
        return this.$store.getters.contextCard.highlights.some(h => {
            return (h.valence && h.memberId === this.memberId)
        })
    },
    isLowdarked() {
        return this.$store.getters.contextCard.highlights.some(h => {
            return (!h.valence && h.memberId === this.memberId)
        })
    },
    checkmarks() {
        return this.$store.getters.contextCompleted
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'

.smaller
    font-size: .777em

.selectedCheckInList
    font-size: 1.69em

.bg
    background: lightGrey
    padding: 0.33em
    border-radius: 3%

.ptr
    cursor: pointer;

.upboat
  display:block
  width: 35px
  height: 35px
  padding-top: .5em
  padding-bottom: .5em

.current
    width: 100%

img
    height: 0.7em


.name
    font-size: 1.2em
    margin-right: 1em
    padding-bottom: .321em
    position: relative
    user-select: none

.checkmark
    margin-right: 0.25em

img.checkmark
    height: 2em

img.completedcheckmark
    height: 1.5em

img.completedcheckmark.selectedCheck
    height: 2.2em
    display: none
    // transform: rotate(90deg)

.completedcheckmarks
    min-height: 1.5em

.clickable
    cursor: pointer


.plain
    text-decoration: none
    margin-right: 0.13em
    height: 1.5em


.tooltiptext.bigger
    z-index: 153
    font-size: 1.2em

.highlight
    text-shadow: 0 0 20px yellow, 0 0 20px yellow, 0 0 20px yellow

.lowdark
    text-shadow: 0 0 20px red, 0 0 20px red, 0 0 20px red

.lilypad
    text-shadow: 0 0 20px green, 0 0 20px green, 0 0 20px green

.workblue
    cursor: pointer
    img
        height: 1.654321em
    span
        font-size: 0.7em
</style>
