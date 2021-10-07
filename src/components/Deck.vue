<template lang='pug'>
.deck(v-if='$store.getters.contextCard.taskId'   :key='$store.getters.contextCard.taskId')
    .paperwrapper.padsides
        .card.openwidth(:class='{ adjustwidth : $store.state.upgrades.mode !== "doge", closedwidth : $store.state.upgrades.mode === "doge"}')
            //- .centerer
            //-     .more(v-if='panelSplit.before.length > 5') +{{ panelSplit.before.length - 5 }}
            //- template(v-for='(n, i) in (panelSplit.before.length > 5 ? panelSplit.before.slice(-6, panelSplit.before.length - 1) : panelSplit.before)')
            //-   div(@click="goWithinPanel(n)"  :style='{ marginLeft : 0.5 + ((Math.min(panelSplit.before.length, 5) - i) * 0.25) + "em", marginRight: 1.5 + ((Math.min(panelSplit.before.length, 5) - i) * 0.25) + "em" }')
            //-     context(:taskId='n')
            member-row
            //- template(v-for='(n, i) in panelSplit.after.slice(0, 5)')
            //-   div(@click="goWithinPanel(n)"  :style='{ marginLeft: 0.25 + (i * 0.25) + "em", marginRight: 1.25 + (i * 0.25) + "em" }')
            //-     context(:taskId='n')
            //- .centerer
            //-     .more.aftermore(v-if='panelSplit.after.length > 5') +{{ panelSplit.after.length - 5 }}
            //- points-set(v-if='$store.state.upgrades.mode === "chest"'   :b='$store.getters.contextCard')
        .upgradesbar(v-show='$store.state.upgrades.mode !== "doge"'  :class='{darkmode: $store.getters.member.stacks === 1}')
            zen(v-show='$store.state.upgrades.mode === "doge" && $store.getters.inbox.length > 0')
            payments(v-show='$store.state.upgrades.mode === "chest"')
            calendar(v-show='$store.state.upgrades.mode === "boat" || $store.state.upgrades.mode === "timecube"')
    div
        panels
    pins.rell

</template>

<script>
import MemberRow from './Member'
import ResourceRow from './ResourceRow'
import ResourceBook from './ResourceBook'
import Calendar from './Calendar'
import PointsSet from './PointsSet'
import Context from './ContextRow'
import Hypercard from "./Card"
import Panels from './Panels'
import Priorities from './Priorities'
import Checkmarks from './Checkmarks'
import Payments from './Payments'
import Pins from './Pins'
import Zen from './Zen'
import Auth from './Auth'

export default {
  components:{
      Hypercard,
      Panels, MemberRow, Calendar,
      ResourceRow, Context, Priorities, ResourceBook, PointsSet,
      Checkmarks, Pins,
      Payments,
      Zen, Auth
  },
  methods:{
      pilePrioritized() {
        if (this.$store.state.upgrades.mode !== 'boat'){
            this.$store.commit('setMode', 1)
        }
        if (this.$store.getters.all.length === 0) return
        this.$store.dispatch("makeEvent", {
          type: "pile-prioritized",
          inId: this.$store.getters.contextCard.taskId,
          tasks: this.$store.getters.contextCard.subTasks
        });
      },
      pileDeSubTasked(){
          this.$store.dispatch('makeEvent', {
              type: 'pile-de-sub-tasked',
              inId: this.$store.getters.contextCard.taskId,
              tasks: this.$store.getters.contextCard.subTasks
          })
      },
      goWithinPanel(n){
          let i = this.$store.state.context.panel.indexOf(n)
          if (i > -1){
              console.log('all that should happen is set top!')
              this.$store.commit("setTop", i)
          }
      },
      toggleShowComplete(){
          this.$store.commit("toggleCompleted")
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
      }
  },
  computed: {
      requireFiveStacks(){
          let usedPiles = 0
          if (this.$store.getters.green.length > 0) usedPiles++
          if (this.$store.getters.red.length > 0) usedPiles++
          if (this.$store.getters.blue.length > 0) usedPiles++
          if (this.$store.getters.purple.length > 0) usedPiles++
          if (this.$store.getters.yellow.length > 0) usedPiles++
          return usedPiles > 1
      },
      panelSplit(){
          let before = []
          let after = []
          let top = this.$store.state.context.top
          this.$store.state.context.panel.forEach((n, i) => {
              if (i < top){
                  before.push(n)
              }
              if (i > top){
                after.push(n)
              }
          })

          return {before, after}
      },
      card(){
          return this.$store.getters.contextCard
      },
      cardAge(){
          let now = Date.now()
          let msSince = now - this.card.timestamp
          let days = msSince / (1000 * 60 * 60 * 24)
          return days
      },
  },

}

</script>

<style lang="stylus" scoped>


@import '../styles/colours';
@import '../styles/button';
@import '../styles/skeleton';

.rell
    position: fixed;
    left: 0
    bottom: 0
.ro
    transform: rotate(100deg)
    opacity: 0.11

.bluewx


.faded
    opacity: 0.6

.small
    font-size:0.8
    opacity: 0.5

.deck
    width: 100%

.card

    font-size:1.00111em
    margin-top: 1em
    display: inline-block
    margin-left: 1em
    margin-right: 1em
    flex-grow: 1

#cyber
    width: 100%
    opacity: 0.5

.upgradesbar
    height: fit-content
    margin-left: 1em
    float: right
    margin-top: 1em
    margin-right: 1em
    flex-grow: 2.77
    flex-basis: 55%
    background: softGrey
    padding: 0.07789em

.darkmode
    border-color: lightGrey

.upgrade
    height: 4em
    border: 4px solid rgba(0, 0, 0, 0.5)

.fw
    width: 100%

.fadey
    margin: 0 1em 0 1em
    min-height: 2em
    position: relative
    margin-top: 1em
    clear: both

.completedfadey
    background: repeating-radial-gradient(
      circle,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.2) 10px,
      rgba(0, 0, 0, 0.3) 10px,
      rgba(0, 0, 0, 0.3) 20px
    )

.onestack
    display: flex
    flex-wrap: wrap
    max-width: 34em
    position: relative
    left: 50%
    transform: translateX(calc(-50% - 1em))

.slide-fade-enter-active {
  transition: all .6s ease;
}
.slide-fade-leave-active {
  transition: all .4s ease;
}
.slide-fade-enter {
  // transform: translateY(-400px);
  opacity: 0;
}
.slide-fade-leave-to {
 // transform: translateY(-400px);
  opacity: 0;
}

.paperwrapper
    position: relative

.paperwrapper.padsides
    display: flex
    flex-wrap: wrap
    justify-content: center

.agedbackground
    background-image: url('/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: fixed
    width: 100%
    height: 100%
    pointer-events: none

.freshpaperbg
    background-image: url('/paper.jpg')
    opacity: 0.2
    z-index: -2

.weekoldpaperbg
    background-image: url('/paper_aged_1.png')
    opacity: 0.25
    z-index: -2

.montholdpaperbg
    background-image: url('/paper_aged_2.png')
    opacity: 0.3
    z-index: -2

.threemontholdpaperbg
    background-image: url('/paper_aged_3.png')
    opacity: 0.35
    z-index: -2

.translucent
    background-image: none
    z-index: -2
    opacity: 0.42

.completed

    float: right
    cursor: pointer
    height: 1.35em
    font-weight: bold
    position: absolute
    right: 0.5em
    bottom: 0.25em

.scuttled

    float: right
    cursor: pointer
    height: 1.35em
    font-weight: bold
    position: absolute
    right: 50% - 1em
    bottom: 0.25em

.toggleStack
    height: 1.35em
    cursor: pointer
    position: absolute
    left: 0.5em
    bottom: 0.25em
    color: main

.upgrademode
    float: left
    cursor: pointer
    font-size: 1.35em
    font-weight: bold
    padding: 0.5em
    margin-right: -0.5em

.completedtabbed
    background-color: rgba(0, 0, 0, 0.3)
    border-radius: 5px

    right: 0
    bottom: 0
    padding: 0.25em 0.5em 0.25em 0.5em

.dot
  height: 0.5em
  width: 0.5em
  border-radius: 50%
  display: inline-block
  margin-right: 0.5em

.more
    text-align: center
    background-color: rgba(22, 22, 22, 0.4)
    border-radius: 50%;
    display: inline-block;
    border-width: 2px
    //border-color: rgba(255, 255, 255, 0.68)
    //border-style: solid
    padding: 0.5em
    margin: 0em auto 0.5em auto
    font-size: 0.8em
    opacity: 0.3


.aftermore
    margin-top: 0.5em
    margin-left: 1.5em
    margin-bottom: 0

.centerer
    text-align: center
    width: 100%

.normaltopmargin
    margin-top: 0

.card.closedwidth
    width: 70%
    flex-grow: 0
    transition: width 2s;

.card.adjustwidth
    max-width: 100%
    max-width: 15em
    transition: width 2s;

.tooltiptext.correctspotmid
    position: absolute
    top: calc(100% - 1.75em)
    left: 50%

.tooltiptext.correctspottopleft
    position: absolute
    top: 1.75em
    left: 2em

.tooltiptext.correctspottop
    position: absolute
    top: 1.75em
    right: 2em

.tooltiptext.correctspotleft
    position: absolute
    top: calc(100% - 1.75em)
    left: 2em

.tooltiptext.correctspot
    position: absolute
    top: calc(100% - 1.75em)
    right: 2em

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
    margin: 0 1em 0 1em
    height: 20px;
    position: relative
    margin-top: 1em
    margin-bottom: 1em
    opacity: .3
    z-index:9999999999999
    cursor: pointer

.boatR
    position: absolute
    right: 0px
    height:20px

.hidden
    opacity: 0

</style>
