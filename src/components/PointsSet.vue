<template lang='pug'>

div
    .showaddr(@click='$store.commit("setPayMode", 1)')
        img(src='../assets/images/bitcoin.svg')
    input(v-model='task.points'  type='text'  placeholder='value'  @keypress.enter='setValue')
    button(@click.stop='setValue')
        div(v-if='sats > 0  && sats !== Infinity') 0.01 {{ $store.state.cash.currency }} ~ {{ sats.toFixed(0) }}
        img(src='../assets/images/lightning.svg')

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

img
    height: 1em

.showaddr
    width: 20%
    display: inline-block;
    cursor: pointer


button
    width: 40%
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
