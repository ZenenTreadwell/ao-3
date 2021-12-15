<template lang='pug'>

.priority(@click='goDeeper(taskId, inId)'  draggable="true"  :ondrop.stop="drop"  :ondragover="allowDrop"  :ondragstart='dragStart')
    .row.agedwrapper(:class='cardInputSty')
        .check()
            img.checkmark.right.front(v-if='isCompleted' src='../assets/images/completed.svg'  @click.stop='checky')
            img.checkmark.right.front(v-else-if='!isCompleted' src='../assets/images/uncompleted.svg'  @click.stop='checky')
            span(:key='updatePlz'  @click.stop='toggleActive').checkmark.right.front
                span(v-if='clockworkblue.days > 0') {{ clockworkblue.days }}:
                span(v-if='clockworkblue.hours > 0') {{ clockworkblue.hours }}:
                span(v-if='clockworkblue.minutes > 0')
                    span(v-if='clockworkblue.minutes < 10') 0
                    span {{ clockworkblue.minutes }}:
                span(v-if='clockworkblue.seconds > 0 && clockworkblue.days < 1')
                    span(v-if='clockworkblue.seconds < 10') 0
                    span {{ clockworkblue.seconds }}
            img.checkmark.right.front(:class='{notaction: $store.getters.member.action !== card.taskId}'  src='../assets/images/hourglass.svg'  @click.stop='toggleActive')
        tally.right.front.lesspadding(:b='card'  isPriority='1')
        span(v-if='isMember')
            img.left.front.darkcircle(src="../assets/images/doge.svg")
            span.downshift {{ isMember }}
        span(v-else-if='card.guild')
            img.front.nopad.darkcircle(v-if='card.guild'  src="../assets/images/badge.svg")
            span.front.nudge.downshift(v-if='card.guild')  {{ card.guild }}
        linky.cardname.front(v-else-if='!isMember'  :x='card.name')
    preview-deck(:task='card')
</template>

<script>

import Linky from './Linky'
import Tally from './Tally'
import PreviewDeck from './PreviewDeck'

export default {
    data(){
      return {
          updatePlz: 0,
          timerInterval: null,
      }
    },
    mounted(){
        if (this.$store.getters.member.action === this.card.taskId){
            this.startTimer()
        }
    },
    props: ['taskId', 'inId'],
    components: { Linky, Tally, PreviewDeck },
    methods: {
      startTimer() {
          this.timerInterval = setInterval(() => {
            if (this.$store.getters.member.action !== this.card.taskId) return clearInterval(this.timerInterval)
            this.updatePlz += 1
          }, 1000);
      },
      toggleActive(){
          let newfield = ''
          if (this.$store.getters.member.action !== this.card.taskId){
              newfield = this.card.taskId
              this.startTimer()
          } else {
              if (this.timerInterval){
                  clearInterval(this.timerInterval)
              }
          }
          this.$store.dispatch("makeEvent", {
              type: 'member-field-updated',
              field: 'action',
              memberId: this.$store.getters.member.memberId,
              newfield
          })
      },
      drop(ev){
          ev.preventDefault();
          ev.stopPropagation();
          // prioritize
          var data = ev.dataTransfer.getData("taskId")
          if (this.taskId === data){
              return
          }
          this.$store.dispatch("makeEvent", {
              type: 'task-prioritized',
              inId: this.taskId,
              fromId: this.$store.getters.contextCard.taskId,
              taskId: data,
          })
      },
      allowDrop(ev){
          ev.preventDefault()
      },
      dragStart(ev){
          ev.dataTransfer.setData("taskId", this.taskId);
      },
      checky(){
          if(!this.isCompleted) {
              this.complete()
          } else {
              this.uncheck()
          }
      },
      deaction(){
          this.$store.dispatch("makeEvent", {
              type: 'member-field-updated',
              field: 'action',
              newfield: false,
              memberId: this.$store.getters.member.memberId,
          })
      },
      goDeeper(taskId, inId){
          if (inId) this.$store.commit("goDeeper", inId);
          if (taskId) this.$store.commit("goDeeper", taskId);
      },
      complete(){
          this.$store.dispatch("makeEvent", {
              type: 'task-claimed',
              inId: this.inId || this.$store.getters.contextCard.taskId,
              taskId: this.taskId,
          })
      },
      uncheck(){
          this.$store.dispatch("makeEvent", {
              type: 'task-unclaimed',
              taskId: this.taskId,
              inId:  this.inId || this.$store.getters.contextCard.taskId,
          })
      },
      copyCardToClipboard(){
          navigator.clipboard.writeText(this.card.name).then(function() {

          }, function() {
              console.log("copy failed")
          })
      },
      setAction(){
          this.$store.dispatch("makeEvent", {
              type: 'member-field-updated',
              field: 'action',
              newfield: this.taskId,
              memberId: this.$store.getters.member.memberId,
          })
      },
    },
    computed: {
        clockworkblue(){
            let active = false
            let totalms = 0
            this.card.actions.forEach(a => {
                if (a && this.$store.getters.member.memberId === a.memberId){
                    totalms = a.total
                    if (a.isActive){
                        active = a.timestamp
                    }
                }
            })

            if (active){
                totalms += (Date.now() - active)
            }

            totalms += this.updatePlz

            let days = 0
            while (totalms > 1000 * 60 * 60 * 24){
                days ++
                totalms -= 1000 * 60 * 60 * 24
            }
            let hours = 0
            while (totalms > 1000 * 60 * 60){
                hours ++
                totalms -= 1000 * 60 * 60
            }

            let minutes = 0
            while (totalms > 1000 * 60){
                minutes ++
                totalms -= 1000 * 60
            }

            let seconds = (totalms / 1000).toFixed(0)

            return {days, hours, minutes, seconds, active}
        },
        card(){
            return this.$store.state.tasks[this.$store.state.hashMap[this.taskId]]
        },
        isMember(){
            let is = false
            this.$store.state.members.some(m => {
                if (m.memberId === this.taskId){
                    is = m.name
                    return is
                }
            })
            return is
        },
        isBounty(){
            return this.$store.getters.bounties.some( t => {
                return t.taskId === this.taskId
            })
        },
        cardInputSty() {
          if (this.$store.getters.member.stacks === 1) {
              return {
                  nowx: true
              }
          } else {
              return {
                redwx : this.card.color == 'red',
                bluewx : this.card.color == 'blue',
                greenwx : this.card.color == 'green',
                yellowwx : this.card.color == 'yellow',
                purplewx : this.card.color == 'purple',
                blackwx : this.card.color == 'black',
              }
          }
        },
        cardAge(){
          let now = Date.now()
          let msSince = now - this.card.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
        },
        isCompleted(){
          let now = Date.now()
          return this.card.claims.some(c => {
              if (this.$store.getters.member.memberId === c.memberId && now - c.timestamp < 30000) return true
          })
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

img.darkcircle
    height: 1.1em
    float: left
    padding: 0em 0.1em 0.1em 0.1em
    background: main
    border-radius: 50%
    margin-right: 0.61em

.downshift
    padding-top: 0.3em

img.checkmark.right.front.notaction
    opacity: .1773

h1
    color: blue

.opencard
    width: calc(100% - 4.5em)
    margin-top: 0.5em

.row.agedwrapper
    box-shadow: 3px 1px 7px 1px main

.priority
    clear: both

.singleship
    width: 3.3724em
    position: absolute
    margin-top: 1em
    float: right

.agedwrapper
    position: relative
    margin-top: 0.5em
    width: calc(100% - 2em)
    padding: 0.5em
    margin-right: 0.5em
    margin-left: 0.5em

.agedbackground
    background-image: url('/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none

.freshpaper
    background-image: url('/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('/paper_aged_3.png')
    opacity: 0.35

.allocated
    position: absolute
    padding-left: 0.25em
    width: 2em
    text-align: center
    font-size: 0.95em
    margin-top: 0.5em
    color: white
    text-shadow: 2px 2px 2px rgba(0.05, 0.05, 0.05, 0.5)
    font-size: 1.5em
    pointer-events: none

.cardname
    z-index: 15
    position: relative

img
    height: 1.1em
    padding-right: 0.5em

.left
    float: left

.right
    float: right

.nopad
    padding-right: 0.15em

.nudge
    top: -0.2em

.front
    position: relative
    z-index: 100
    max-width: 100%

.checkmark
    float: right
    opacity: 0.5
    cursor: pointer
    z-index: 105

img.checkmark
    height: 1.5em
    margin-top: -.15em
    margin-bottom: -0.25em
    margin-left: 0.25em

.tally.right.front.lesspadding
    padding-right: 0
</style>
