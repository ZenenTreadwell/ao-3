<template lang='pug'>
.checkbox(@click.stop='complete'  ref='checkbox'  :id='uuid')
    span(v-if='$store.getters.contextMember.memberId === b.taskId')
    span(v-else-if='$store.getters.contextCard.taskId === b.taskId')
        img.checkmark.doge(v-if='isCompleted'  src='../assets/images/thumbsup.svg')
        img.checkmark.doge.incomplete(v-else  src='../assets/images/thumbsup.svg')
        span *check in*
    span(v-else)
        img.checkmark(v-if='isCompleted'  src='../assets/images/completed.svg')
        img.checkmark(v-else  src='../assets/images/uncompleted.svg')
</template>

<script>


export default {
    props: ['b'],
    computed: {
        isCompleted(){
            let now = Date.now()
            return this.b.claims.some(c => {
                if (this.$store.getters.member.memberId === c.memberId && now - c.timestamp < 30000) return true
            })
        },
    },
    methods: {
        complete(){
            this.$store.dispatch("makeEvent", {
              type: 'task-claimed',
              inId: this.b.taskId,
              taskId: this.b.taskId,
            })
        },
        uncheck(){
            this.$store.dispatch("makeEvent", {
              type: 'task-unclaimed',
              taskId: this.b.taskId,
              inId:  this.b.taskId,
              notes: ''
            })
        },
    }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.doge
    // background: main
    border-radius: 50%
    padding: 0.1234em
    opacity: 1

.doge.incomplete
    // background: softerGrey
    opacity: 0.4

.checkbox
    cursor: pointer
    min-width: 0.75em
    text-align: center
    position: absolute 
    bottom: 0


img.checkmark
    margin-bottom: -0.25em
    margin-left: 0.25em
    height: 1.77em


.checkmark
    z-index: 106
    height: 100%
    min-width: 0.75em
</style>
