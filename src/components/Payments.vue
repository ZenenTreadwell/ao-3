<template lang='pug'>

.upgrades
    points-set(:b='$store.getters.contextCard')
    .payreq.ptr(v-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "lightning"'  @click='copy(b.bolt11, true)')
        tag(v-if='b.bolt11'  :d='b.bolt11'  size='5')
        .section.ptr
            img(src='../assets/images/clipboard.svg'  v-if='showCopiedBolt ')
            span(v-if='b.bolt11') {{b.bolt11}}
    .payreq.ptr(v-else-if='$store.state.cash.info.alias && $store.state.upgrades.paymode === "bitcoin"'  @click='copy(b.btcAddr)')
        tag(v-if='b.btcAddr'  :d='b.btcAddr'  size='7')
        .section.ptr(v-if='b.btcAddr'  )
            img(src='../assets/images/clipboard.svg'  v-if='showCopiedAddr ')
            span(v-if='b.btcAddr') {{b.btcAddr}}
    .section(v-else) node unavailable :(
    .paddy
        div(v-for='p in b.payments') {{ getDateString(p.timestamp) }} ~ {{p.amount.toLocaleString()}}
    //.ptr.mh(v-if='$store.state.upgrades.paymode === "lightning" || !b.btcAddr' @click='getAddr') *use bitcoin address*
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
            this.$store.commit('setPayMode', 0)	
            if (!this.b.btcAddr) {
                this.$store.dispatch("makeEvent", {
                    type: 'address-updated',
                    taskId: this.b.taskId
                })
            }
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

.paddy
    padding: 0.789em

.mh
    min-height: 3em

.ptr
    cursor: pointer

.section
    img
        height: 1.9em

.section
    font-size: 0.9em
    margin-bottom: 0.9em
    overflow-wrap: break-word
    word-wrap: break-word
    word-break: break-word

.upgrades
    width: 100%

.payreq
    text-align: center
    background-color: rgba(0,0,0,0)
    border-radius: 0.5em

.ptr.mh 
    float: right 
    
</style>
