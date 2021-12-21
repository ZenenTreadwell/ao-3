<template lang='pug'>

div
    .invoice
        input(v-model='task.points'  type='text'  placeholder='sats'  @keypress.enter='setValue')
        button(@click.stop='setValue') pay {{task.points}} sats
    .showaddr(@click='switchAddr' v-if='$store.state.upgrades.paymode !== "bitcoin"') *use BTC address

</template>

<script>

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: this.b.completeValue,
            }
        }
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

.showaddr
    display: inline-block;
    cursor: pointer
    img
        display: inline-block;

.invoice
    height: 2.2em
    button
        width: 50%
        display: inline-block;
        color: lightGrey
        background: softGrey
        height: 100%
        border: none
        box-shadow: 0 3px 10px #000;
    input
        display: inline-block;
        border: none
        background-color: rgba(22, 22, 22, 0.3)
        height: 2.2em
        width: 50%
        color: main
        background: lightGrey
        height: 100%
        box-shadow: 0 3px 10px #000;

</style>
