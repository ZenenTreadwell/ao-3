<template lang='pug'>

.Connect
    label.bg card id: {{ $store.getters.contextCard.taskId }}
    select(v-model='sendTo')
        option(value='') send
        option(v-for='w in $store.state.ao' :value='w.address'  :disabled='w.outboundSecret===false')
            span(@click='copyAddress(w.address)') {{w.address}}
    br
    button(v-if='sendTo'  @click='trySend') send
    .input-container
        input.input-effect(v-model='ao.address' type='text'  :class='{"has-content":!!ao.address}')
        label target ao connect string
    button(v-if='ao.address.length > 0'  @click='connect') connect
    code.ptr(@click='showSecr') {{ $store.state.cash.alias }} connect string:
      span(v-show='showSecret')
        br
        label {{ $store.state.cash.address }}:{{ $store.state.loader.token }}
        img.clippy(src='../assets/images/clipboard.svg')
</template>

<script>
import calcs from '../calculations'
import Tag from './Tag'
export default {
    components: {Tag},
    data() {
        return {
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
        copyAddress(addr){
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
            if (this.$store.state.ao.some(a => ( a.address === split[0] && a.outboundSecret !== false) ) ){
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
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/input'

code label
    font-size: 0.678em

.clippy
    height: 1em
    display: inline-block;
    cursor: pointer

span
    text-align: center
    overflow-wrap: break-word
    word-wrap: break-word

.ptr
    cursor: pointer

select
    background-color: lightteal

select.form-control
    color: black

code
    word-wrap: break-word
    word-break: break-word

</style>
