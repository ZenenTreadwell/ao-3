<template lang='pug'>

.upgrades
    div(v-if='$store.getters.contextCard.taskId === $store.getters.member.memberId')
        span home card
    div(v-else-if="!getMemberCard($store.getters.contextCard.taskId)")
      div(v-for='n in $store.getters.contextRelevantMembers'   :key='n')
          current-checks(:memberId='n')
      span(v-if='$store.getters.loggedIn')
          div(v-if='$store.getters.contextCard.deck.length === 0'  @click='remove')
              button.redwx remove card
          div(v-if='$store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1'  @click='drop')
              button.purplewx drop card
          div(v-else  @click='grab')
              button.greenwx grab card
</template>

<script>
import CurrentChecks from './CurrentChecks'
import MemberRow from './MemberRow'
import GuildCreate from './GuildCreate'
import Accounts from './Accounts'
import Connect from './Connect'

export default {
    components:{
        CurrentChecks, MemberRow, GuildCreate, Accounts, Connect
    },
    methods: {
        grab(){
            this.$store.dispatch("makeEvent", {
                type: 'task-grabbed',
                taskId: this.$store.getters.contextCard.taskId,
            })
        },
        drop(){
            this.$store.dispatch("makeEvent", {
                type: 'task-dropped',
                taskId: this.$store.getters.contextCard.taskId,
            })
        },
        remove(){
            this.$store.dispatch("makeEvent", {
                type: 'task-removed',
                taskId: this.$store.getters.contextCard.taskId,
            })
        },
        getMemberCard(mId){
            let card
            this.$store.state.members.some(m => {
                if (m.memberId === mId) {
                    card = m
                    return true
                }
            })
            return card
        }
    }
}

</script>

<style lang='stylus' scoped>
@import '../styles/colours'
@import '../styles/skeleton'

.upgrades
    padding: 1em

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

button
    width: 100%
    padding: 0.33em
    margin-top: 0.33em
</style>
