<template lang='pug'>

.upgrades(v-if='!$store.getters.contextMember')
    div.tr
        span.bg
            span(v-for='n in $store.getters.contextRelevantMembers'  :class='{dropping: dropping === n}'  :key='n'  @click.stop='toggleHighlight(n)'  @click.stop.ctrl='toggleHighlight(n, true)'   :ondrop="dropWrap(n)"  :ondragover="allowDropWrap(n)"  :ondragleave='dragLeave')
                span(:class='{highlight: isHighlighted(n), lowdark: isLowdarked(n) }') &nbsp; {{ getName(n) }} &nbsp;
            span.ptr(v-if='$store.getters.contextCard.deck.indexOf($store.getters.member.memberId) > -1'  @click.stop='leave') *leave*
            span.ptr(v-else-if='$store.getters.member.memberId !== $store.getters.contextCard.name'  @click.stop='grab') *join*
            span.ptr(v-if='$store.getters.contextCard.deck.length === 0' @click.stop='remove') &nbsp; *delete*
    span.ptr(@click.stop='tryToggle'  v-if='$store.getters.contextCard.completed.length > 0  || $store.getters.contextCard.stackView.completed')
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
    data(){
        return {
            dropping: false
        }
    },
    methods: {
        dragLeave(){
            this.dropping = false
        },
        dropWrap(memberId){
            return (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                this.dropping = false
                var data = ev.dataTransfer.getData("taskId")
                this.$store.dispatch("makeEvent", {
                  type: 'task-sub-tasked',
                  inId: memberId,
                  taskId: data,
                })

            }
        },
        allowDropWrap(memberId){
            return (ev) => {
                ev.preventDefault()
                this.dropping = memberId
            }
        },
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
        leave(){
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

.dropping
    background: blue

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
