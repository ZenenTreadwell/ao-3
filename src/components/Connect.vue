<template lang='pug'>

.Connect
    .fr latency {{$store.state.loader.reqStatus}}ms
    label.bg(@click='copyLink')  copy link to this card
        img.clippy(v-show='linkCopied'  src='../assets/images/clipboard.svg')
        span(v-if='linkCopied') {{linkCopied}}
    br
    .section(v-if='$store.state.ao.length > 0') Send card: 
    .onionlist
        .flexonion(v-for='w in $store.state.ao' @click='copyAddress(w.address, w.outboundSecret===false)') 
            input.radio(type='radio' name='aoconnect'  :value='w.address' :checked='sendTo === w.address' :disabled='w.outboundSecret===false') 
            span(:class='{faded: w.outboundSecret === false}') 
                span(v-if='w.alias') {{w.alias}} @ 
                span {{w.address}} 
    button(v-if='sendTo'  @click='trySend') send
    br
    .input-container
        input.input-effect(v-model='ao.address' type='text'  :class='{"has-content":!!ao.address}')
        label add connection
    .centerer
        button(v-if='ao.address.length > 0'  @click='connect') connect
    .ptr
        code(@click='showSecr') copy {{ $store.state.cash.alias }} connect string:
            span(v-show='showSecret')
                img.clippy(src='../assets/images/clipboard.svg')
                span &nbsp; {{$store.state.cash.address + ':' + $store.state.loader.token}}
</template>

<script>
import calcs from '../calculations'
import Tag from './Tag'
export default {
    components: {Tag},
    data() {
        return {
            linkCopied: false,
            sendTo:'',
            showAddress: false,
            showSecret: false,
            ao: {
                type: "ao-outbound-connected",
                address: '',
                secret: '',
            },
        }
    },
    methods: {
        trySend(){
            let tasks = []
            if (this.$store.getters.contextMember){
                tasks = this.$store.state.tasks.filter(t => t.deck.indexOf(this.$store.getters.contextMember.memberId) > -1)
            } else {
                let taskList = calcs.crawler(this.$store.state.tasks, this.$store.getters.contextCard.taskId)
                tasks = this.$store.state.tasks.filter(t => taskList.indexOf(t.taskId) > -1)
            }
            this.$store.dispatch('makeEvent', {
                type: 'ao-relay',
                address: this.sendTo,
                ev:{
                    type: 'tasks-received',
                    tasks
                }
            })

        },
        copyLink(){
            let lnk = window.location.href + this.$store.getters.contextCard.taskId
            console.log('copied:', lnk)
            navigator.clipboard.writeText(lnk)
                .then(() => {
                    this.linkCopied = lnk
                    setTimeout( () => this.linkCopied = false, 7777)
                })
                .catch(err => {
                    console.log(err, 'copy attempt failed, printing to console:')
                    console.log(lnk)
                })
        },
        showSecr(){
            this.showSecret = true
            setTimeout(() => this.showSecret = false,25000)
            let secr = this.$store.state.cash.address + ':' + this.$store.state.loader.token
            navigator.clipboard.writeText(secr)
                .then(() => {
                    //
                })
                .catch(err => {
                    console.log(err, 'copy attempt failed, printing to console:')
                    console.log(secr)
                })

        },
        copyAddress(addr, disabled){
          if (!disabled){
              this.sendTo = addr
          }
          navigator.clipboard.writeText(addr)
              .then(() => {
                  //
              })
              .catch(err => {
                  console.log(err, 'copy attempt failed, printing to console:')
                  console.log(addr)
              })
        },
        showAddr(x){
            if (x === this.showAddress) return this.showAddress = false
            this.showAddress = x
        },
        connect(){
            let split = this.ao.address.split(':')
            if (this.$store.state.ao.some(a => a.address === split[0] && split.length === 1 ) ){
                this.$store.dispatch('makeEvent', {
                    type: "ao-disconnected",
                    address: split[0],
                })
            } else {
                this.$store.dispatch('makeEvent', {
                    type: "ao-outbound-connected",
                    address: split[0],
                    secret: split[1],
                })
            }
            this.ao.address = ''
            this.ao.secret = ''
        },
        discon(address){
            console.log("try diconnection", address)
            this.$store.dispatch("makeEvent", {
                type: 'ao-disconnected',
                address,
            })
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/input'
input.radio 
    width: auto
label.bg
    cursor:pointer
.section 
    font-weight: bold 
code label
    font-size: 0.678em
.onionlist 
    max-height: 6em 
    overflow-y: scroll
    margin-bottom: 0.4321em

.flexonion
    display: flex 
    input
        flex: 1 1 1em 
    span 
        flex 7 7 auto
.clippy
    height: 1em
    display: inline-block;
    cursor: pointer

.centerer 
    text-align: center

span
    overflow-wrap: break-word
    word-wrap: break-word

.ptr
    cursor: pointer
    margin: .9em

select
    background-color: lightteal

select.form-control
    color: black

code
    word-wrap: break-word
    word-break: break-word
button
    background: softGrey
    color: white
    max-width: 13em

.faded
    opacity: 0.3

.fr 
    float: right

</style>
