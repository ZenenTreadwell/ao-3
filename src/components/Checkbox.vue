<template lang='pug'>
// this component logic is overloaded because it is used as checkbox on priorities and on current card
.checkbox(ref='checkbox'  :id='uuid')
    span(v-if='$store.getters.contextMember.memberId === b.taskId')
    span(v-else-if='$store.getters.contextCard.taskId === b.taskId')
        img.checkmark.doge(v-if='isCompleted'  src='../assets/images/doge.svg')
        img.checkmark.doge.incomplete(v-else  src='../assets/images/doge.svg')
    span(v-else)
        img.checkmark(v-if='isCompleted'  src='../assets/images/completed.svg')
        img.checkmark(v-else  src='../assets/images/uncompleted.svg')
</template>

<script>

import uuidv1 from 'uuid/v1'
import Hammer from 'hammerjs'
import Propagating from 'propagating-hammerjs'

export default {
    props: ['b', 'inId'],
    data() {
        return {
            uuid:  uuidv1(),
        }
    },
    mounted() {
        let checkel = document.getElementById(this.uuid)
        if(!checkel) return
        let checkmc = Propagating(new Hammer.Manager(checkel))
        let checkTap = new Hammer.Tap({ event: 'singletap', time: 400 })
        let checkDoubleTap = new Hammer.Tap({ event: 'doubletap', taps: 2, time: 400, interval: 400 })
        checkmc.add([checkDoubleTap, checkTap])
        checkDoubleTap.recognizeWith(checkTap)
        checkTap.requireFailure(checkDoubleTap)
        checkmc.on('singletap', (e) => {
            if(!this.isCompleted) {
                this.complete()
            } else {
                this.uncheck()
            }
            e.stopPropagation()
        })
        checkmc.on('doubletap', (e) => {
            e.stopPropagation()
        })
    },
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
              inId: this.inId,
              taskId: this.b.taskId,
            })
        },
        uncheck(){
            this.$store.dispatch("makeEvent", {
              type: 'task-unclaimed',
              taskId: this.b.taskId,
              inId:  this.inId,
              notes: ''
            })
        },
    }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.doge
    background: main
    border-radius: 50%
    padding: 0.1234em

.doge.incomplete
    background: softerGrey

.checkbox
    // opacity: 0.9
    cursor: pointer
    // z-index: 105
    // position: absolute
    // right: 0.25em
    // top: 0.15em
    // display: block
    min-width: 0.75em
    text-align: center

img.checkmark
    margin-bottom: -0.25em
    margin-left: 0.25em
    height: 1.77em


.checkmark
    z-index: 106
    height: 100%
    min-width: 0.75em
</style>
