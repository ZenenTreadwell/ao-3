<template lang='pug'>

.upgrades(v-if='!$store.getters.contextMember')
    img.doge(src='../assets/images/doge.svg')
    span.bg
        span(v-for='n in $store.getters.contextRelevantMembers'   :key='n'  @click='toggleHighlight(n)'  @click.ctrl='toggleHighlight(n, true)')
            span(:class='{highlight: isHighlighted(n), lowdark: isLowdarked(n) }') &nbsp; {{ getName(n) }} &nbsp;
        span.ptr(v-if='$store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1'  @click='drop') *leave*
        span.ptr(v-else-if='$store.getters.member.memberId !== $store.getters.contextCard.name'  @click='grab') *join*
        span.ptr(v-if='$store.getters.contextCard.deck.length === 0' @click='remove') &nbsp; *delete*
    .spacer
    current-checks
    //- span(v-if='$store.getters.isLoggedIn  && $store.getters.member.memberId !== $store.getters.contextCard.taskId')
    //-     div(v-if='$store.getters.contextCard.deck.length === 0'  @click='remove')
    //-         button remove
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
        getName(x){
            let name
            this.$store.state.members.forEach(m => {
                if (m.memberId === x){
                    name = m.name
                }
            })
            return name
        },
        toggleHighlight(x, invert = false) {
            this.$store.dispatch("makeEvent", {
                type: 'highlighted',
                taskId: this.$store.getters.contextCard.taskId,
                memberId:x,
                valence: !invert
            })
        },
        isHighlighted(x) {
            return this.$store.getters.contextCard.highlights.some(h => {
                return (h.valence && h.memberId === x)
            })
        },
        isLowdarked(x) {
            return this.$store.getters.contextCard.highlights.some(h => {
                return (!h.valence && h.memberId === x)
            })
        },
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

.bg
    background: lightGrey
    padding: 0.33em
    border-radius: 3%

.spacer
    height: 0.5em

.doge
    height: 1.789em
    display: inline-block

.ptr
    cursor: pointer;

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

button
    width: 100%
    padding: 0.33em
    margin-top: 0.33em

.highlight
    text-shadow: 0 0 20px yellow, 0 0 20px yellow, 0 0 20px yellow

.lowdark
    text-shadow: 0 0 20px red, 0 0 20px red, 0 0 20px red


</style>
