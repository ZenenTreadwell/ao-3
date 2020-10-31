<template lang='pug'>

div(:class='{unavailable: !this.$store.state.cash.info.alias}')
    .paymodeswitcher
        button(@click='$store.commit("setPayMode", 0)'  :class='{chain: $store.state.upgrades.paymode === "bitcoin"}') chain
        button(@click='$store.commit("setPayMode", 1)'  :class='{light: $store.state.upgrades.paymode === "lightning"}') lightning
    .pointsset(v-if="$store.state.upgrades.paymode === 'lightning'")
        input(v-model='task.points'  type='text'  placeholder='value'  @keypress.enter='setValue')
        button(@click.stop='setValue') invoice
</template>

<script>

export default {
    props: ['b'],
    data() {
        return {
            task: {
                points: this.b.completeValue? this.b.completeValue : 1,
            }
        }
    },
    methods: {
        setValue() {
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

.unavailable
    opacity: 0.24

button
    width: 90%

.valueset
    background: transparent
    padding: 0
    color: white
    height: 2.2em

.pointsset
    margin-top: 0.39em

.pointsset button
    width: 50%
    height: 2.2em
    padding: 0

.pointsset input
    border-color: rgba(22, 22, 22, 1)
    border-width: 1px
    background-color: rgba(22, 22, 22, 0.3)
    height: 2.2em
    width: 50%
    color: lightGrey

.paymodeswitcher
    button
        width: 50%

.chain
    background: linear-gradient(wrexyellow, rgba(0,0,0,0))
.light
    background: linear-gradient(wrexpurple, rgba(0,0,0,0))
</style>
