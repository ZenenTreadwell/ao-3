<template lang='pug'>

div
    div
        input(v-model='task.points'  type='text'  placeholder='sats'  @keypress.enter='setValue')
        button(@click.stop='setValue') *create lightning*
    .showaddr(@click='$store.commit("setPayMode", 1)' v-if='$store.state.upgrades.paymode !== "bitcoin"') *show btc address*

</template>

<script>
import calculations from '../calculations'

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: this.b.completeValue? this.b.completeValue : 1,
            }
        }
    },
    computed: {
        sats(){
            return calculations.cadToSats(1, this.$store.state.cash.spot) / 100
        },
    },
    methods: {
        setValue() {
            this.$store.commit("setMode", 3)
            this.$store.commit("setPayMode", 2)
            this.$store.dispatch("makeEvent", {
                type: 'task-valued',
                taskId: this.b.taskId,
                value: '',
            })
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/button'
@import '../styles/input'
@import '../styles/colours'

img
    height: 3em

img.lightbtn
    height: 1em

.showaddr
    width: 20%
    display: inline-block;
    cursor: pointer
    img
        display: inline-block;
.faded
    opacity: 0.23456789

button
    width: 30%
    height: 2.2em
    display: inline-block;
input
    display: inline-block;
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 40%
    color: lightGrey


</style>
