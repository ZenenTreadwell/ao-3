<template lang='pug'>

div
    .showaddr(@click='switchAddr' v-if='$store.state.upgrades.paymode !== "bitcoin"') *bitcoin address*
    div
        input(v-model='task.points'  type='text'  placeholder='sats'  @keypress.enter='setValue')
        button(@click.stop='setValue') *ln-invoice {{task.points}} sats*

</template>

<script>
import calculations from '../calculations'

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: this.b.completeValue,
            }
        }
    },
    computed: {
        sats(){
            return calculations.cadToSats(1, this.$store.state.cash.spot) / 100
        },
    },
    methods: {
        switchAddr(){
          this.$store.commit("setPayMode", 1)
          if (!this.b.btcAddr){
              this.$store.dispatch("makeEvent", {
                  type: 'address-updated',
                  taskId: this.b.taskId
              })
          }
        },
        setValue() {
            this.$store.commit("setMode", 3)
            this.$store.commit("setPayMode", 2)
            this.$store.dispatch("makeEvent", {
                type: 'task-valued',
                taskId: this.b.taskId,
                value: this.task.points,
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
    color: main
    background: lightGrey

input
    display: inline-block;
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 40%
    color: main
    background: lightGrey


</style>
