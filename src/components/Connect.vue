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
        label connect string
    button(v-if='ao.address.length > 0'  @click='connect') connect
    code.click(@click='showSecr') our connect string:
      span(v-show='showSecret')
        br
        label {{ $store.state.cash.address }}:{{ $store.state.loader.token }}
        img.clippy(src='../assets/images/loggedOut.svg')
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
            aoNamed: {
                type: 'ao-named',
                alias: ''
            },
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
            console.log('sending', tasks.length, 'tasks to', this.sendTo)
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
        name(){
            this.$store.dispatch('makeEvent', this.aoNamed)
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

.section
    color:lightGrey
    font-size: 0.9em
    margin-bottom: .5em
    margin-top: .5em

.fw
    width: 100%

.click
    cursor: pointer

.letter
    width: 1.7em

h1
    text-align: center
    content-align: center

h6
    text-align: center
    cursor: pointer

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task

    margin:10px 0
    padding:20px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

.birdy
    float: left
    height: .777em
    cursor: pointer

.faded
    opacity: 0.235654

.conn, .discon
    font-size: 0.8em
    margin-left: 0.5em
    margin-right: 0.5em

.discon
    cursor: pointer
    color: red

.conn
    cursor: pointer
    color: green
    word-wrap: break-word
    word-break: break-word

.clearboth
    // width: 50%
    // margin-left: 50%
    // transform: translateX(-50%)
    // clear: both
    // margin-top: 1em
    // padding-top: 0.75em

code
    word-wrap: break-word
    word-break: break-word

.padleft
    margin-left: 1em

.topspace
    margin-top: 1em

.flex
    display: flex
    flex-wrap: wrap
    flex-basis: 50%
    justify-content: center

@media all and (max-width: 600px)
    .flex
        flex-basis: 100%

.ourinfo
    background: lightGrey
    color: main
    padding: 1em
    border-radius: 1em
    h4
        text-align: center
</style>
