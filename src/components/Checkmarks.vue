<template lang='pug'>

.upgrades
    div(v-if='$store.getters.contextCard.taskId === $store.getters.member.memberId')
        accounts
    div(v-else)
      div(v-for='n in $store.getters.contextRelevantMembers'   :key='n')
        current-checks(:memberId='n')
</template>

<script>
import CurrentChecks from './CurrentChecks'
import MemberRow from './MemberRow'
import GuildCreate from './GuildCreate'
import Accounts from './Accounts'

export default {
    components:{
        CurrentChecks, MemberRow, GuildCreate, Accounts
    },
    methods: {
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
h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em
</style>
