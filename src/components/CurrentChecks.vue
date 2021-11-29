linky<template lang='pug'>

.current
    span
        span &nbsp;&nbsp;&nbsp;
        span.ptr(@click='switchOpenColor("red")')
            img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty("red")' )
            span.num(:class='{highlight: colorOpenSelect === "red"}') {{ $store.getters.completedByColor.red }}
        span.ptr(@click='switchOpenColor("yellow")')
            img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty("yellow")' )
            span.num(:class='{highlight: colorOpenSelect === "yellow"}') {{ $store.getters.completedByColor.yellow }}
        span.ptr(@click='switchOpenColor("green")')
            img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty("green")' )
            span.num(:class='{highlight: colorOpenSelect === "green"}') {{ $store.getters.completedByColor.green }}
        span.ptr(@click='switchOpenColor("purple")')
            img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty("purple")' )
            span.num(:class='{highlight: colorOpenSelect === "purple"}') {{ $store.getters.completedByColor.purple }}
        span.ptr(@click='switchOpenColor("blue")')
            img.completedcheckmark( src='../assets/images/completed.svg'  :class='cardInputSty("blue")' )
            span.num(:class='{highlight: colorOpenSelect === "blue"}') {{ $store.getters.completedByColor.blue }}
    div.ptr.bg(v-if='$store.getters.contextCard.highlights.length > 0' v-for='(c) in checkmarksColor'   @click='recallCard(c.taskId)')
        img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty(c.color)' )
        span &nbsp;
        linky(:x='c.name' :class='{selectedCheckInList: c.name === $store.getters.selectedCheckCard.name}' )
    div.ptr.bg(v-else-if='colorOpenSelect' v-for='(c) in checkmarksColor'   @click='recallCard(c.taskId)')
        img.completedcheckmark(src='../assets/images/completed.svg'  :class='cardInputSty(c.color)' )
        span &nbsp;
        linky(:x='c.name' :class='{selectedCheckInList: c.name === $store.getters.selectedCheckCard.name}' )
</template>

<script>

import Linky from './Linky'
import Coin from './Coin'

export default {
  data(){
      return {
          colorOpenSelect: false
      }
  },
  components: { Linky, Coin },
  methods: {
    switchOpenColor(color){
        if (this.colorOpenSelect === color){
            return this.colorOpenSelect = false
        }
        this.colorOpenSelect = color
    },
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
            return {
                selectedCheck: this.$store.state.upgrades.selectedCheck === index
            }
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
    checkmarksColor(){
        if (!this.colorOpenSelect){
            return this.checkmarks
        }
        return this.checkmarks.filter(c => c.color === this.colorOpenSelect)
    }
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'

.num
    padding: .37em
    font-weight: bolder

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
