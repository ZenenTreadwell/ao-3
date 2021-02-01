<template lang='pug'>

.upgrades
    div(v-for='n in $store.getters.contextRelevantMembers'   :key='n')
        current-checks(:memberId='n')
    span(v-if='$store.getters.isLoggedIn  && $store.getters.member.memberId !== $store.getters.contextCard.taskId')
        div(v-if='$store.getters.contextCard.deck.length === 0'  @click='remove')
            button remove
        //- div(v-if='$store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1'  @click='drop')
        //-     button leave
        //- div(v-else  @click='grab')
        //-     button enter
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
            let target = this.$store.state.context.parent[this.$store.state.context.parent.length - 1]
            if (target){
                this.$store.dispatch('goUp', {
                    target,
                    panel: [target],
                    top: 0
                })
            } else {
                target = this.$store.getters.member.memberId
                this.$store.dispatch('goIn', {
                    target,
                    panel: [target],
                    top: 0
                })
            }
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
    background: lightGrey
    box-shadow:
        0 0 6px 3px white,
        0 0 7px 4px lightGrey,
        0 0 8px 5px main;

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
