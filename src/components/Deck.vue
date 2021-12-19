<template lang='pug'>
.deck(v-if='$store.getters.contextCard.taskId'   :key='$store.getters.contextCard.taskId')
    .paperwrapper.padsides
        .card.openwidth(:class='{ adjustwidth : $store.state.upgrades.mode !== "doge", closedwidth : $store.state.upgrades.mode === "doge"}')
            member-row
            resource-book(v-if='$store.state.upgrades.mode === "timecube"')
        .upgradesbar(v-show='$store.state.upgrades.mode !== "doge"'  :class='{darkmode: $store.getters.member.stacks === 1}')
            payments(v-show='$store.state.upgrades.mode === "chest"')
            calendar(v-show='$store.state.upgrades.mode === "timecube"')
            div(v-show='$store.state.upgrades.mode === "boat"')
                priorities
                checkmarks
    div
        panels
    .container
        roll-stack(v-if='$store.getters.memberIds.indexOf($store.getters.contextCard.taskId) > -1')
    pins.rell

</template>

<script>
import MemberRow from './Member'
import Payments from './Payments'
import Calendar from './Calendar'
import Priorities from './Priorities'
import Checkmarks from './Checkmarks'
import Panels from './Panels'
import Pins from './Pins'
import RollStack from './RollStack'
import ResourceBook from './ResourceBook'

export default {
  components:{
      MemberRow, Payments, Calendar, Priorities,
      Checkmarks, Panels, Pins, RollStack,
      ResourceBook,
  },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours';
@import '../styles/skeleton';

.deck
    width: 100%

.rell
    position: fixed;
    left: 0
    bottom: 0

.card
    font-size:1.00111em
    margin-top: 0.061em
    display: inline-block
    margin-left: 3em
    margin-right: 3em
    flex-grow: 1

.upgradesbar
    height: fit-content
    margin-left: 1em
    float: right
    margin-top: 1em
    margin-right: 1em
    flex-grow: 2.77
    flex-basis: 55%
    background: lightGrey
    padding: 0.07789em

.darkmode
    border-color: lightGrey

.upgrade
    height: 4em
    border: 4px solid rgba(0, 0, 0, 0.5)

.paperwrapper
    position: relative

.paperwrapper.padsides
    display: flex
    flex-wrap: wrap
    justify-content: center

.card.closedwidth
    width: 70%
    transition: width 2s;

.card.adjustwidth
    box-shadow: 0 3px 10px #000;
    margin-right: -1em
    max-width: 100%
    max-width: 15em
    transition: width 2s;

</style>
