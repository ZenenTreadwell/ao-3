<template lang='pug'>

#nodes
    .breathing
    .row
        .four.grid(v-if='$store.state.cash.info.mempool')
            .section mempool ({{ ($store.state.cash.info.mempool.bytes / 1000000).toFixed() }} MB)
            .chain.high  {{ $store.state.cash.info.mempool.feeChart.highFee * 103 }} super 150+
            .chain.midhigh  {{ $store.state.cash.info.mempool.feeChart.midHighFee * 103 }} high 50+
            .chain.mid  {{ $store.state.cash.info.mempool.feeChart.midFee * 103 }} mid 10+
            .chain.low  {{ $store.state.cash.info.mempool.feeChart.lowFee  * 103}} low -10
            .smartfee recommend {{ ($store.state.cash.info.mempool.smartFee.feerate * 10000000 / 1000).toFixed() }} sat/vbyte
        .eight.grid(v-if='$store.state.cash.info.channels')
            .section(@click='selectedPeer = false'   :class='{ptr: selectedPeer >= 0}') channels ({{ $store.state.cash.info.channels.length }})
            .row
                .chanfo pubkey: {{ $store.state.cash.info.id }}
                .localremote(@click='selectedPeer = false'  v-if='nn')
                    .localbar.tall(:style='l(nn)')  {{ parseFloat( nn.channel_sat ).toLocaleString() }}
                    .remotebar.tall(:style='r(nn)')  {{ parseFloat( nn.channel_total_sat - nn.channel_sat ).toLocaleString() }}
                div(v-for='(n, i) in $store.state.cash.info.channels'  @click='selectedPeer = i'  :key='n.peer_id'  :class='{ptr: selectedPeer !== i, spacer: selectedPeer === i}')
                    .localremote(v-show='selectedPeer === i')
                        .localbar.tall(:style='l(n)')  {{ parseFloat( n.channel_sat ).toLocaleString() }}
                        .remotebar.tall(:style='r(n)')  {{ parseFloat( n.channel_total_sat - n.channel_sat ).toLocaleString() }}
                    .chanfo(v-show='selectedPeer === i')
                        div  pubkey: {{ n.peer_id }}
                        div  txid: {{ n.funding_txid }}
                    .localremote(v-show='selectedPeer !== i')
                        .localbar(:style='l(n)')
                        .remotebar(:style='r(n)')
                .center(v-if='$store.state.cash.info.address.length > 0')
                    span {{ $store.state.cash.info.id }}
                    span @{{ $store.state.cash.info.address[0].address }}
                    span :{{ $store.state.cash.info.address[0].port}}
            .chain {{ $store.getters.confirmedBalance.toLocaleString() }}
                .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}
    .row
        input(v-model='txnCheck'  type='text'  placeholder='check txid'  @keypress.enter='checkTxid')
        button(v-if='txnCheck'  @click='checkTxid') get transaction
        .chanfo(v-if='fetchedTxn.txid')
            div txid: {{ fetchedTxn.txid }}
            div status: {{ fetchedTxnStatus }}
            div(v-if='fetchedTxn.utxo'  v-for='unspent in fetchedTxn.utxo')
                div(v-if='unspent')
                    div {{(unspent.value * 100000000).toLocaleString()}} : {{unspent.scriptPubKey.addresses}}
            div(v-if='fetchedTxn.memPool')
                div fee: {{ (fetchedTxn.memPool.fee * 100000000 / fetchedTxn.memPool.vsize).toFixed() }}


</template>

<script>
import calculations from '../calculations'

import Tag from './Tag'
import request from 'superagent'

export default {
    data(){
        return {
            fetchedTxn: {},
            txnCheck: '',
            selectedPeer: false,
            open: false,
        }
    },
    components:{
         Tag,
    },
    computed: {
        fetchedTxnStatus(){
            if (this.fetchedTxn.memPool){
                return 'unconfirmed'
            }
            if (this.fetchedTxn.utxo){
                return 'confirmed, unspent'
            }
            return 'confirmed, spent'
        },
        areChannels(){
            return this.$store.state.cash.info.channels
        },
        sats(){
            return calculations.cadToSats(1, this.$store.state.cash.spot)
        },
        nn(){
            let totals = {
                channel_sat: 0,
                channel_total_sat: 0,
            }
            this.$store.state.cash.info.channels.forEach(n => {
                totals.channel_sat += n.channel_sat
                totals.channel_total_sat += n.channel_total_sat
            })
            return totals
        }
    },
    methods:{
        checkTxid(){
            request
                .post('/bitcoin/transaction')
                .send({txid : this.txnCheck})
                .set("Authorization", this.$store.state.loader.token)
                .end((err, res)=>{
                    this.fetchedTxn = res.body
                })
            this.txnCheck = ''
        },
        toggleOpen(){
            this.open = !this.open
        },
        selectPeer(pId){
            if (pId === this.selectedPeer){
                return this.selectedPeer = false
            }
            this.selectedPeer = pId
        },
        requestChannel(){
            request
                .post('/lightning/channel')
                .send({id : this.selectedPeer})
                .set("Authorization", this.$store.state.loader.token)
                .end((err, res)=>{
                    console.log("response from channel", res.body)
                })
            this.selectedPeer = false
        },
        r(n){
            let local = parseFloat( n.channel_sat )
            let remote = parseFloat( n.channel_total_sat - n.channel_sat )

            let capacity = local + remote
            let remotePercent =  remote / capacity

            if (remotePercent < 0.2 && remotePercent > 0) {
                remotePercent = 0.2
            }

            let w = (remotePercent * 100).toFixed(7) + "%"
            return {
                width: w
            }
        },
        l(n){
          let local = parseFloat( n.channel_sat )
          let remote = parseFloat( n.channel_total_sat - n.channel_sat )

          let capacity = local + remote
          let localPercent =  n.channel_sat / capacity

          if (localPercent > 0.8 && localPercent < 1) {
              localPercent = 0.8
          }
          let w = (localPercent * 100).toFixed(7) + "%"
          return {
              width: w
          }
        },
    }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/input'


.section
    color:main
    font-size: 0.9em
    margin-bottom: .9em
    text-align: left

.chanfo
    word-break: break-all
    overflow-wrap: break-word;
    text-align: left
    font-size: 0.7em
.ptr
    cursor: pointer

.localbar.tall
    height: 2em
.remotebar.tall
    height: 2em

#nodes
    text-align: center

.inactive
    opacity: 0.3456

.center
    text-align: center
    word-break: break-all
    overflow-wrap: break-word;
    font-size: 0.5em

.center.nowx
    margin-top: 0.3em
    margin-bottom: 0.3em
    height: 2em

.fw
    width: 100%

.container
    content-align: center

h3
    text-align: center

a
    color: purple

h1
    text-align: center

.h
    height: 2em

label
    word-break: break-all

#nodes
    max-height: 100vh - 3.5em
    overflow: scroll

.break
    overflow-wrap: break-word;

#worf
    height: 23em

#palm
    width:110%

.setupyourown
    margin-top: 2.2345em
    padding: 2em
    color: purple
    font-size: 1.12em

.small
    font-size: .68em
    word-break: break-all

p
    text-align: center

.fl
    float: left
.fr
    float: right

.local
    margin: 0
    background: linear-gradient('up', wrexpurple, rgba(0,0,0,0))
    padding: 1em

.remote
    margin: 0
    background: linear-gradient('up', wrexgreen, rgba(0,0,0,0))
    text-align: right
    padding: 1em

.chain
    height: 2.2em
    margin: 0
    background: linear-gradient(wrexyellow, rgba(0,0,0,0))
    text-align: center
    position: relative
    padding-top: 0.6em

.chain.high
  background: linear-gradient(wrexred, rgba(0,0,0,0))
.chain.midhigh
  background: linear-gradient(wrexyellow, rgba(0,0,0,0))
.chain.mid
  background: linear-gradient(wrexblue, rgba(0,0,0,0))
.chain.low
  background: linear-gradient(wrexgreen, rgba(0,0,0,0))


.break
    overflow-wrap: break-word;

#worf
    float: right

.lim
  color: black

.block
    float: right
    font-size: .77em

h5
    text-align: center
    color: lightGrey
    opacity: 0.77

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em

.localremote
    width: 100%
    height: 0.622em

.localbar
    height: 0.622em
    background: linear-gradient(rgba(0,0,0,0), wrexpurple)
    float: left

.remotebar
    height: 0.622em
    background: linear-gradient(rgba(0,0,0,0), wrexgreen)
    float: right

.breathing
    height: 3.5em

.breathing1
    height: 1.35em
.spacer
    padding-top: 3.21em
    margin-bottom: .7654321em
</style>
