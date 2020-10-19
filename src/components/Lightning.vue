<template lang='pug'>

#nodes
  p(@click='toggleOpen') {{ $store.state.cash.info.peers.length }} peers on block {{ $store.state.cash.info.blockheight.toLocaleString() }}
  h3(v-if='sats > 0  && sats !== Infinity') 1 {{ $store.state.cash.currency }} ~ {{ sats }}
  .container(v-if='open && $store.state.cash.info && $store.state.cash.info.blockheight')
    .row
      .localremote(v-for='n in $store.state.cash.channels')
          .localbar(:style='l(n)')  {{ parseFloat( n.channel_sat ).toLocaleString() }}
          .remotebar(:style='r(n)')  {{ parseFloat( n.channel_total_sat - n.channel_sat ).toLocaleString() }}
    p.chain
      span {{ $store.getters.confirmedBalance.toLocaleString() }}
        .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}
    .row
        button.nowx(v-if='selectedPeer'   @click='requestChannel')
            span(v-if='$store.getters.confirmedBalance > 0') Request Channel
            span.inactive Request Channel Requires On Chain Funds
        div.center.nowx(v-for='p in unchanneled' @click='selectPeer(p.id)'  :class='{bluetx: p.id === selectedPeer}') {{ p.id.slice(0,9) }}
    .center connect string
    .center
        span {{$store.state.cash.info.id }}
        span @{{ $store.state.cash.info.address[0].address }}
        span :{{ $store.state.cash.info.address[0].port}}
</template>

<script>
import calculations from '../calculations'

import Tag from './Tag'
import request from 'superagent'

export default {
    data(){
        return {
            selectedPeer: false,
            open: false,
        }
    },
    components:{
         Tag,
    },
    computed: {
        unchanneled(){
            return this.$store.state.cash.info.peers.filter(p => !p.channels)
        },
        sats(){
            return calculations.cadToSats(1, this.$store.state.cash.spot)
        }
    },
    methods:{
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

.inactive
    opacity: 0.3456

.center
    text-align: center
    word-break: break-all
    overflow-wrap: break-word;

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

option
    color: white

a
    color: purple

h1
    text-align: center

.h
    height: 2em

.j
    color: accent1
    font-size: 1.5em
    margin-bottom: 1.123em
    background-color: main

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
    background: wrexpurple
    color: white
    padding: 1em

.remote
    margin: 0
    background: wrexgreen
    color: white
    text-align: right
    padding: 1em

.chain
    margin: 0
    background: wrexyellow
    color: white
    padding: 1em
    text-align: center
    position: relative


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
    height: 2em
    margin-bottom: 0.25em

.localbar
    height: 2em
    background: wrexpurple
    float: left
    color: white
    text-align: center

.remotebar
    height: 2em
    background: wrexgreen
    float: right
    color: white
    text-align: center



</style>
