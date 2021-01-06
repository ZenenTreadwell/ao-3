<template lang='pug'>

#nodes
    .breathing
    .row
        .four.grid(v-if='$store.state.cash.info.mempool')
            .section {{ $store.state.cash.info.blockheight.toLocaleString()}} blocks
            .section() {{ ( (Date.now() - $store.state.cash.info.blockfo.time * 1000  ) / 60 / 1000).toFixed(1) }}min since tip
            .section tip's fee percentiles (sat/byte)
            .section.chain(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[4])') 90th {{ $store.state.cash.info.blockfo.feerate_percentiles[4] }}
            .section.chain(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[3])') 75th {{ $store.state.cash.info.blockfo.feerate_percentiles[3] }}
            .section.chain(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[2])') 50th {{ $store.state.cash.info.blockfo.feerate_percentiles[2] }}
            .section.chain(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[1])') 25th {{ $store.state.cash.info.blockfo.feerate_percentiles[1] }}
            .section.chain(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[0])') 10th {{ $store.state.cash.info.blockfo.feerate_percentiles[0] }}
            .section recommend {{ ($store.state.cash.info.mempool.smartFee.feerate * 10000000 / 1000).toFixed() }} sat/byte
            .section.sampler(@click='sampler') {{ $store.state.cash.info.mempool.size }} unconfirmed ({{ ($store.state.cash.info.mempool.bytes / 1000000).toFixed(1) }} MB)
        .eight.grid(v-if='$store.state.cash.info.channels')
            .section(@click='selectedPeer = false'   :class='{ptr: selectedPeer >= 0}') in channels ({{ $store.state.cash.info.channels.length }})
            .chanfo {{ $store.state.cash.info.id }}@{{ $store.state.cash.info.address[0].address }}
            .row
                .localremote(@click='selectedPeer = false'  v-if='nn')
                    .localbar.tall(:style='l(nn)')  {{ parseFloat( nn.channel_sat ).toLocaleString() }}
                    .remotebar.tall(:style='r(nn)')  {{ parseFloat( nn.channel_total_sat - nn.channel_sat ).toLocaleString() }}
                .chanfo(v-if='selectedPeer < 0') pubkey: {{ $store.state.cash.info.id }}
                .ptr(v-for='(n, i) in $store.state.cash.info.channels' :key='n.peer_id'  :class='{spacer: selectedPeer === i}')
                    .localremote(v-show='selectedPeer === i'   @click='selectedPeer = false')
                        .localbar.tall(:style='l(n)'  :class='{abnormal:n.state !== "CHANNELD_NORMAL"}')  {{ parseFloat( n.channel_sat ).toLocaleString() }}
                        .remotebar.tall(:style='r(n)'  :class='{abnormal:n.state !== "CHANNELD_NORMAL"}')  {{ parseFloat( n.channel_total_sat - n.channel_sat ).toLocaleString() }}
                    .chanfo(v-show='selectedPeer === i')
                        div pubkey: {{ n.peer_id }}
                        div(@click='checkTxid(n.funding_txid)') txid: {{ n.funding_txid }}
                        div(v-if='n.state !== "CHANNELD_NORMAL"') state: {{ n.state }}
                    .localremote(v-show='selectedPeer !== i'   @click='selectedPeer = i')
                        .localbar(:style='l(n)' :class='{abnormal:n.state !== "CHANNELD_NORMAL"}')
                        .remotebar(:style='r(n)'  :class='{abnormal:n.state !== "CHANNELD_NORMAL"}')
                //- .center(v-if='$store.state.cash.info.address.length > 0')
                //-     span {{ $store.state.cash.info.id }}
                //-     span @{{ $store.state.cash.info.address[0].address }}
                //-     span :{{ $store.state.cash.info.address[0].port}}
            .section on chain
            .outputs(@click='toggleShowOutputs')
                .chain {{ $store.getters.confirmedBalance.toLocaleString() }}
                    .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}
            .chanfo(v-if='showOutputs'  v-for='n in $store.state.cash.info.outputs'  @click='checkTxid(n.txid)') txid: {{n.txid}} : {{n.output}}
            .price(v-if='sats > 0  && sats !== Infinity') 0.01 {{ $store.state.cash.currency }} ~ {{ (sats/100).toFixed(0) }}
            .price(v-else) 1.0 BTC = 100,000,000
    .row
        .breathing1
        input(v-model='txnCheck'  type='text'  placeholder='check txid'  @keypress.enter='checkTxid(txnCheck)')
        button(v-if='txnCheck'  @click='checkTxid(txnCheck)') get transaction
        .chanfo(v-if='fetchedTxn.txid')
            div txid: {{ fetchedTxn.txid }}
            div status: {{ fetchedTxnStatus }}
            div(v-if='fetchedTxn.memPool')
                .chain(:class='getFeeColor(fetchedTxn.memPool.fee * 100000000 / fetchedTxn.memPool.vsize)') fee: {{ (fetchedTxn.memPool.fee * 100000000 / fetchedTxn.memPool.vsize).toFixed() }}
            template(v-if='fetchedTxn.utxo && fetchedTxn.utxo.length > 0'  v-for='u in fetchedTxn.utxo')
                div(v-if='u && u.value > 0 && u.scriptPubKey.addresses') {{ u.value }} : {{u.scriptPubKey.addresses}} - unspent
            div(v-for='outp in filteredOut') {{ outp.value }} : {{outp.scriptPubKey.addresses}}
        .breathing
</template>

<script>
import calculations from '../calculations'

import PointsSet from './PointsSet'

import Tag from './Tag'
import request from 'superagent'

export default {
    data(){
        return {
            showOutputs: false,
            fetchedTxn: {},
            txnCheck: '',
            selectedPeer: false,
            open: false,
            sampleIndex: 0,
        }
    },
    components:{
         Tag, PointsSet
    },
    computed: {
        filteredOut(){
            if (this.fetchedTxn.utxo){
                console.log('filtering outs becasuse there are unspents' , this.fetchedTxn.utxo.length)
                let unspents = this.fetchedTxn.utxo.filter(x => x !== null).map(x => x.txid)
                return this.fetchedTxn.vout.filter( y => {
                    return unspents.indexOf(y.txid) === -1
                })
            } else {
                console.log('returing vout?')
                return this.fetchedTxn.vout.filter(() => true)
            }
        },
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
                if (n.state === "CHANNELD_NORMAL"){
                    totals.channel_sat += n.channel_sat
                    totals.channel_total_sat += n.channel_total_sat
                }
            })
            return totals
        }
    },
    methods:{
        getFeeColor(x){
            if (x > 100) return { high : 1}
            if (x > 50) return { midhigh : 1}
            if (x > 10) return { mid: 1}
            return {low: 1}
        },
        sampler(){
            let checkId = this.$store.state.cash.info.mempool.sampleTxns[this.sampleIndex % this.$store.state.cash.info.mempool.sampleTxns.length]
            this.checkTxid(checkId)
            this.sampleIndex ++
        },
        checkTxid(x){
            request
                .post('/bitcoin/transaction')
                .send({txid : x})
                .set("Authorization", this.$store.state.loader.token)
                .end((err, res)=>{
                    console.log('setting fetched txn', err, res.body)
                    if (!err){
                        this.fetchedTxn = res.body
                    }
                })
            this.txnCheck = ''
        },
        toggleOpen(){
            this.open = !this.open
        },

        toggleShowOutputs(){
            this.showOutputs = !this.showOutputs
            console.log('toggleded' , this.showOutputs)
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

.outputs
  cursor: pointer

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

.localbar.abnormal
    background: linear-gradient(rgba(0,0,0,0), wrexred)

.remotebar
    height: 0.622em
    background: linear-gradient(rgba(0,0,0,0), wrexgreen)
    float: right

.remotebar.abnormal
    background: linear-gradient(rgba(0,0,0,0), wrexred)

.breathing
    height: 3.5em

.breathing1
    height: 1.35em
.spacer
    padding-top: 3.21em
    margin-bottom: .7654321em
.sampler
    cursor: pointer
</style>
