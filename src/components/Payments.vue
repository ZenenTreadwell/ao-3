<template lang='pug'>

.upgrades
    .payreq(v-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "lightning"')
        .section {{b.bolt11}}
        tag(:d='b.bolt11'  size='5')
        a(:href='"lightning:" + b.bolt11')
            button Open Wallet
                img(src='../assets/images/lightning.svg')
    .payreq(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "bitcoin"')
        .section {{b.btcAddr}}
        tag(:d='b.btcAddr'  size='7')
        a(:href='"bitcoin:" + b.btcAddr')
            button Open Wallet
                img(src='../assets/images/bitcoin.svg')
    .section(v-else) payment node unavailable :(
    div(v-if='$store.getters.contextCard.taskId === $store.getters.member.memberId')
        lightning
</template>

<script>

import Tag from './Tag'
import Lightning from './Lightning'

export default {
    components:{
        Tag, Lightning
    },
    computed: {
        b(){
            return this.$store.getters.contextCard
        },
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours';
@import '../styles/skeleton';
@import '../styles/grid';
@import '../styles/button';
@import '../styles/tooltips';
@import '../styles/spinners';

.section
    color:lightGrey
    font-size: 0.9em
    margin-bottom: 0.9em
    overflow-wrap: break-word
    word-wrap: break-word
    word-break: break-word
.fw
    width: 100%

h5
    text-align: center

.thickborder
    background: main

.marg
    margin-right: 1.97em

.upgrades
    width: 100%

.smallbox
    width: 4em
    margin-bottom: 1em

.togglepayments
    margin: 0
    padding: 1em 0 1em 0
    text-align: center
    img
        margin: 0 3em 0 3em
        padding: 0.77em

.submode
    height: 6em
    width: 6em
    margin-bottom: 1em
    margin-top: 1em
    background-color: rgba(0, 0, 0, 0)

.max
    margin: 3em
    height: 5.3333em
    width: 5.333em

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

button
    max-width: 232px

.payreq
    text-align: center
    background-color: rgba(0,0,0,0)
    border-radius: 0.5em
    padding: 1em
    margin-bottom: 1.654321em

a
    text-decoration: none
    color: main

.box
    word-wrap:break-word
    max-width: 500px
    z-index: 100001
    padding: 1em

.paid
    color: purple
    font-size: 5em

.small
    font-size: 0.892em
    word-wrap: break-word
    word-break: break-all
    background: lightGrey
    color: main
    padding: 1em
    border-radius: 1em

button
    img
        height: 1.3em

</style>
