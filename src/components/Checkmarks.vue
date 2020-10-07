<template lang='pug'>

.upgrades
    div(v-if='$store.getters.contextCard.taskId === $store.getters.member.memberId')
        accounts
        connect
    div(v-else)
      div(v-for='n in $store.getters.contextRelevantMembers'   :key='n')
        current-checks(:memberId='n')
      div(v-if='$store.getters.contextCard.deck.length === 0 || ($store.getters.contextCard.deck.length === 1 && $store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1)'  @click='remove')
          button.purplewx remove card
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

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

button.purplewx
    padding: 0.33em
    margin-top: 0.33em
</style>
