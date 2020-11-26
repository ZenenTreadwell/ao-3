<template lang='pug'>

.upgrades
    .payreq(v-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "lightning"')
        .section {{b.bolt11}}
        a(:href='"lightning:" + b.bolt11')
            tag(:d='b.bolt11'  size='5')
        points-set(:b='$store.getters.contextCard')
    .payreq(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "bitcoin"')
        .section {{b.btcAddr}}
        a(:href='"bitcoin:" + b.btcAddr')
            tag(:d='b.btcAddr'  size='7')
        points-set(:b='$store.getters.contextCard')
    .section(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "mempool"')
    .section(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "channels"')
    .section(v-else) node unavailable :(
    br
</template>

<script>

import Tag from './Tag'
import PointsSet from './PointsSet'
import Lightning from './Lightning'

export default {
    components:{
        Tag, Lightning, PointsSet
    },
    computed: {
        b(){
            return this.$store.getters.contextCard
        },
    },
    methods: {
        scrollTop(){
          console.log('scroll top')
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
          return true
        },
        setPay(x){
            if (x === 2){
                this.$store.dispatch("makeEvent", {
                    type: 'task-valued',
                    taskId: this.b.taskId,
                    value: this.b.completeValue ,
                })
            }
            this.scrollTop()
            this.$store.commit("setPayMode", x)
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours';
@import '../styles/skeleton';
@import '../styles/grid';
@import '../styles/button';
@import '../styles/spinners';

.hidden
    opacity: 0

.quarter
    display: inline-block
    width: 25%
    font-size: 4.44em
    color: lightGrey
    max-height: 2em
    margin-top: -0.35em;
    content-align: center
    text-align: center

.quarter:before
    content: "\2022";

.selected
    color: wrexgreen

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

.payreq
    text-align: center
    background-color: rgba(0,0,0,0)
    border-radius: 0.5em

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
