<template lang='pug'>

.upgrades
    .paddy
        div(v-for='p in b.payments') {{ getDateString(p.timestamp) }} ~ {{p.amount.toLocaleString()}}
    .payreq.ptr(v-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "lightning"'  @click='copy(b.bolt11, true)')
        tag(:d='b.bolt11'  size='5')
        .section.ptr {{b.bolt11}}
            img(src='../assets/images/loggedOut.svg'  v-if='showCopiedBolt ')
        points-set(:b='$store.getters.contextCard')
    .payreq.ptr(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "bitcoin"'  @click='copy(b.btcAddr)')
        tag(v-if='b.btcAddr'  :d='b.btcAddr'  size='7')
        .ptr.mh(v-else  @click='getAddr') *show bitcoin address*
        .section.ptr(v-if='b.btcAddr'  ) {{b.btcAddr}}
            img(src='../assets/images/loggedOut.svg'  v-if='showCopiedAddr ')
        points-set(:b='$store.getters.contextCard')
    .section(v-else) node unavailable :(
    br
</template>

<script>

import Tag from './Tag'
import PointsSet from './PointsSet'
import Lightning from './Lightning'

export default {
    data(){
        return {
            showCopiedBolt: false,
            showCopiedAddr: false,
        }
    },
    components:{
        Tag, Lightning, PointsSet
    },
    computed: {
        b(){
            return this.$store.getters.contextCard
        },
    },
    methods: {
        copy(x, isBolt){
          if (x){
              navigator.clipboard.writeText(x)
                  .then(() => {
                    if (isBolt){
                      this.showCopiedBolt = true
                      this.showCopiedAddr = false
                    } else {
                      this.showCopiedBolt = false
                      this.showCopiedAddr = true
                    }
                  })
                  .catch(err => {
                    console.log(err, 'copy attempt failed, printing to console:')
                  })
          }

        },
        getAddr(){
            this.$store.dispatch("makeEvent", {
                type: 'address-updated',
                taskId: this.b.taskId
            })
        },
        getDateString(ts){
            let d = new Date(ts)
            return d.toString().slice(0,15)
        },
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours';
@import '../styles/skeleton';
@import '../styles/grid';
@import '../styles/button';
@import '../styles/spinners';

.paddy
    padding: 0.789em

.mh
    min-height: 3em

.ptr
    cursor: pointer

.section
    img
        height: 1.9em
.bg
    background: lightGrey
    border-radius: 3%

.hidden
    opacity: 0

.quarter
    display: inline-block
    width: 25%
    font-size: 4.44em
    max-height: 2em
    margin-top: -0.35em;
    content-align: center
    text-align: center

.quarter:before
    content: "\2022";

.selected
    color: wrexgreen

.section
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
