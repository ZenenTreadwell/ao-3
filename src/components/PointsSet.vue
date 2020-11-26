<template lang='pug'>

div
    input(v-model='task.points'  type='text'  placeholder='value'  @keypress.enter='setValue')
    button(@click.stop='setValue')
        div(v-if='sats > 0  && sats !== Infinity') 0.01 {{ $store.state.cash.currency }} ~ {{ sats.toFixed(0) }}

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
                value: Number(this.task.points),
            })
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/button'
@import '../styles/input'
@import '../styles/colours'

button
    width: 50%
    float: right
    height: 2.2em

input
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 50%
    color: lightGrey


</style>
