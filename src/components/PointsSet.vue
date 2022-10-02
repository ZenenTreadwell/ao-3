<template lang='pug'>

div
    .invoice
        input(v-model='task.points'  type='text'  placeholder='sats amount'  @keypress.enter='setValue')
        button(@click.stop='setValue') set amount

</template>

<script>

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: '',
            }
        }
    },
    methods: {
        switchAddr(){
          this.$store.commit("setPayMode", 0)
          if (!this.b.btcAddr){
              this.$store.dispatch("makeEvent", {
                  type: 'address-updated',
                  taskId: this.b.taskId
              })
          }
        },
        setValue() {
            let value
            if (this.task.points > 0){
                value = this.task.points
            } else {
                value = 0
            }
            this.$store.commit("setMode", 3)
            this.$store.commit("setPayMode", 1)
            console.log( this.b.taskId, value ) 
            this.$store.dispatch("makeEvent", {
                type: 'task-valued',
                taskId: this.b.taskId,
                value,
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
    input
        display: inline-block;
        border-top: none
        background-color: rgba(22, 22, 22, 0.3)
        height: 2.2em
        width: 50%
        color: main
        background: lightGrey
        height: 100%

</style>
