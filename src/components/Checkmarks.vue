<template lang='pug'>

.upgrades(v-if='!$store.getters.contextMember')
    div.tr
        span.bg
            span(v-for='n in $store.getters.contextRelevantMembers'   :key='n'  @click='toggleHighlight(n)'  @click.ctrl='toggleHighlight(n, true)')
                span(:class='{highlight: isHighlighted(n), lowdark: isLowdarked(n) }') &nbsp; {{ getName(n) }} &nbsp;
            span.ptr(v-if='$store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1'  @click='drop') *leave*
            span.ptr(v-else-if='$store.getters.member.memberId !== $store.getters.contextCard.name'  @click='grab') *join*
            span.ptr(v-if='$store.getters.contextCard.deck.length === 0' @click='remove') &nbsp; *delete*
    span.ptr(@click='tryToggle'  v-if='!$store.getters.contextMember')
        span &nbsp;&nbsp;&nbsp;
        span
            img.completedcheckmark.redwx(src='../assets/images/completed.svg')
            span.num {{ $store.getters.completedByColor.red }}
        span
            img.completedcheckmark.yellowwx(src='../assets/images/completed.svg')
            span.num {{ $store.getters.completedByColor.yellow }}
        span
            img.completedcheckmark.greenwx(src='../assets/images/completed.svg')
            span.num {{ $store.getters.completedByColor.green }}
        span
            img.completedcheckmark.purplewx(src='../assets/images/completed.svg')
            span.num {{ $store.getters.completedByColor.purple }}
        span
            img.completedcheckmark.bluewx(src='../assets/images/completed.svg')
            span.num {{ $store.getters.completedByColor.blue }}
        span.witchswitch
            .switch
                input(type="checkbox"  v-model='$store.getters.contextCard.stackView.completed')
                span.slider.round
    .spacer
</template>

<script>

export default {
    methods: {
        tryToggle(){
            this.$store.dispatch("makeEvent", {
                type: "completed-toggled",
                taskId: this.$store.getters.contextCard.taskId,
            })
        },
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
        },
    }
}

</script>

<style lang='stylus' scoped>
@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/switch'

.witchswitch
    margin-top: -1em


.tr
    text-align: right

.bg
    background: lightGrey
    padding: 0.33em
    border-radius: 3%

.spacer
    height: 0.5em

.ptr
    cursor: pointer;

.highlight
    text-shadow: 0 0 20px yellow, 0 0 20px yellow, 0 0 20px yellow

.lowdark
    text-shadow: 0 0 20px red, 0 0 20px red, 0 0 20px red

img.completedcheckmark
    height: 1.5em

.num
    padding: .37em
    font-weight: bolder

</style>
