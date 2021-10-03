<template lang='pug'>

.panel
    .row
      .four.columns
          stack(stack='red', :position='$store.getters.contextCard.stackView["red"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.columns
          stack(stack='green', :position='$store.getters.contextCard.stackView["green"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.columns
          stack(stack='blue', :position='$store.getters.contextCard.stackView["blue"]',  :taskId='$store.getters.contextCard.taskId')
    .row
      .two.columns

      .four.columns
          stack(stack='yellow', :position='$store.getters.contextCard.stackView["yellow"]',  :taskId='$store.getters.contextCard.taskId')
      .four.columns
          stack(stack='purple', :position='$store.getters.contextCard.stackView["purple"]',  :taskId='$store.getters.contextCard.taskId')

</template>

<script>
import _ from 'lodash'
import Stack from './Stack'

export default {
  components:{
      Stack
  },
  methods: {
      getArchive(){
        if (this.$store.getters.contextCard.taskId === this.$store.getters.member.memberId){
            let hodld = []
            this.$store.state.tasks.forEach( t => {
              if(t.deck.indexOf(this.$store.getters.member.memberId) > -1){
                hodld.push(t)
              }
            })
            let crawler = [this.$store.getters.memberCard.taskId].concat(this.$store.getters.guilds.map(t => t.taskId))
            let deck = []
            let history = []
            let newCards = []
            do {
              newCards = []
              crawler = _.filter(crawler, t => {
                if(deck.concat(history).indexOf(t) > -1) return false
                let task = this.$store.state.tasks[this.$store.state.hashMap[t]]
                if(task === undefined || task.subTasks === undefined || task.priorities === undefined || task.completed === undefined) return false

                if(task.deck.indexOf(this.$store.getters.member.memberId) > -1) {
                  deck.push(t)
                } else {
                  history.push(t)
                }
                newCards = newCards.concat(task.subTasks).concat(task.priorities).concat(task.completed)
                return true
              })
              crawler = newCards
            } while(crawler.length > 0)
            let archive = _.filter(hodld, st => deck.indexOf(st.taskId) === -1)
            archive = _.filter(archive, st => !archive.some(t => t.subTasks.concat(t.priorities).concat(t.completed).indexOf(st.taskId) > -1))

            let tasks = archive.map(a => a.taskId)
            this.$store.dispatch("makeEvent", {
              type: 'pile-prioritized',
              tasks,
              inId: this.$store.getters.contextCard.taskId,
            })
        }
      }
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/button'

h5.adjtooltip
    margin-top:1.2em

.two.columns, .stay
    height: 1em

.tooltiptext.correctspot
    position: absolute
    top: 50%
    left: 50%

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.panel
    margin: 0 1em 1em 1em
    clear: both
    padding-bottom: 1.5em
    min-height: 5.9em
    background-size: cover
    background-position: center center
    overflow: visible
.fullwidth
    width: 100%

.card
    padding: 2em
    text-align: center
    font-size:1.3em

#cyber
    width: 100%
    opacity: 0.5

.padonestack
    padding-top: 0.001em
    max-width: calc(100vw - 4em)
    padding-left: 1em
    padding-right: 1em
</style>
