<template lang='pug'>
.deck(v-if='$store.getters.contextCard.taskId')
    .flex
        .card.openwidth(:class='{ adjustwidth : $store.state.upgrades.mode !== "doge", closedwidth : $store.state.upgrades.mode === "doge"}')
            active-card
        .upgradesbar(v-if='$store.state.upgrades.mode !== "doge"'  :class='{darkmode: $store.getters.member.stacks === 1}')
            payments(v-if='$store.state.upgrades.mode === "chest"')
            calendar(v-if='$store.state.upgrades.mode === "timecube"')
            div(v-if='$store.state.upgrades.mode === "boat"'  :ondrop="drop"   :ondragover="allowDrop" )
                priorities
                checkmarks
    div
        div &nbsp;
        div &nbsp;
        div &nbsp;
        panels(v-if='!$store.getters.contextCard.stackView.completed')
        .container(v-else) 
            simple-priority(v-for='n in $store.getters.contextCompleted'  :taskId='n.taskId')
        div &nbsp;
        div &nbsp;
        div &nbsp;
    //roll-stack
    //data-vis
    pins.rell

</template>

<script>
import ActiveCard from './ActiveCard'
import Payments from './Payments'
import Calendar from './Calendar'
import Priorities from './Priorities'
import Checkmarks from './Checkmarks'
import Panels from './Panels'
import Pins from './Pins'
import RollStack from './RollStack'
import DataVis from './DataVis'
import ResourceBook from './ResourceBook'
import SimplePriority from './SimplePriority'

export default {
  components:{
      ActiveCard, Payments, Calendar, Priorities,
      Checkmarks, Panels, Pins, RollStack,
      ResourceBook, DataVis, SimplePriority
  },
  methods: {
    allowDrop(ev){
        ev.preventDefault()
    },
    drop(ev){
        ev.preventDefault();
        var data = ev.dataTransfer.getData("taskId")
        this.$store.dispatch("makeEvent", {
            type: 'task-prioritized',
            inId: this.$store.getters.contextCard.taskId,
            fromId: this.$store.getters.contextCard.taskId,
            taskId: data,
        })
        this.$store.commit("setMode", 1)
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours';
@import '../styles/skeleton';

.flex
    position: relative
    flex-direction: row
    display: flex
.card
    font-size:1.00111em
    display: inline-block
    flex-grow: 1

.card.closedwidth
    width: 70%
    margin-right: 3em
    margin-left: 3em

.card.adjustwidth
    box-shadow: 1px -1px 1px main;
    max-width: 100%
    max-width: 15em

.upgradesbar
    height: fit-content
    flex-grow:3.7333
    background: #e4f1f2aa
    padding: 0.07789em
    margin-right: 1em

.darkmode
    border-color: lightGrey

.upgrade
    height: 4em
    border: 4px solid rgba(0, 0, 0, 0.5)



</style>
