<template lang='pug'>

#nodes
    .row
        .six.grid(v-if='$store.state.cash.info.mempool')
            span mempool sample ({{ ($store.state.cash.info.mempool.bytes / 1000000).toFixed() }} MB)
            .chain.high  {{ $store.state.cash.info.mempool.feeChart.highFee * 100 }} super 150+
            .chain.midhigh  {{ $store.state.cash.info.mempool.feeChart.midHighFee * 100 }} high 50+
            .chain.mid  {{ $store.state.cash.info.mempool.feeChart.midFee * 100 }} mid 10+
            .chain.low  {{ $store.state.cash.info.mempool.feeChart.lowFee  * 100}} low -10
            .smartfee six block estimate {{ ($store.state.cash.info.mempool.smartFee.feerate * 10000000 / 1000).toFixed() }} sat/vbyte
            input(v-model='txnCheck'  type='text'  placeholder='check txid'  @keypress.enter='checkTxid')
            button(v-if='txnCheck'  @click='checkTxid') get transaction
            div {{ fetchedTxn }}
        .six.grid(v-if='$store.state.cash.info.channels')
            span {{ $store.state.cash.info.channels.length }} channels
            .row
                .localremote(v-if='nn')
                    .localbar.tall(:style='l(nn)')  {{ parseFloat( nn.channel_sat ).toLocaleString() }}
                    .remotebar.tall(:style='r(nn)')  {{ parseFloat( nn.channel_total_sat - nn.channel_sat ).toLocaleString() }}
                .localremote(v-for='(n, i) in $store.state.cash.info.channels'  @click='selectedPeer = i')
                    .localbar(:style='l(n)')
                    .remotebar(:style='r(n)')
                .center(v-if='$store.state.cash.info.address.length > 0')
                    span {{ $store.state.cash.info.id }}
                    span @{{ $store.state.cash.info.address[0].address }}
                    span :{{ $store.state.cash.info.address[0].port}}
            .chain {{ $store.getters.confirmedBalance.toLocaleString() }}
                .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}

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
            selectedPeer: 0,
            open: false,
        }
    },
    components:{
         Tag,
    },
    computed: {
        areChannels(){
            return this.$store.state.cash.info.channels
        },
        sats(){
            return calculations.cadToSats(1, this.$store.state.cash.spot)
        },
        nn(){
            if (this.areChannels){
                return this.$store.state.cash.info.channels[this.selectedPeer]
            }
            return false
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


.localbar.tall
    height: 2em
.remotebar.tall
    height: 2em

#nodes
    color: lightGrey
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
    color:paleYellow
    width: 100%

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



</style>
