<template lang='pug'>

.Connect
    div(v-for='(r, i) in $store.state.ao')
        h6
            span(@click='goIn(r.address)') {{ r.address }}
            span -
            span.discon(@click='discon(r.address)') disconnect
    .section ao connect
    .input-container
        input.input-effect(v-model='ao.address' type='text'  :class='{"has-content":!!ao.address}')
        label connect to address
    .input-container(v-if='ao.address.length > 0')
        input.input-effect(v-model='ao.secret' type='text'  :class='{"has-content":!!ao.secret}')
        label.input-effect connection code
    button(v-if='ao.secret.length > 0'  @click='connect') connect
    code.click(@click='showSecr') reveal connection info:
        span(v-if='showSecret')
            div address: {{ $store.state.cash.address }}
            div code: {{ $store.state.loader.token }}
</template>

<script>
import Tag from './Tag'
export default {
    components: {Tag},
    data() {
        return {
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
        showSecr(){
            this.showSecret = true
            setTimeout(() => this.showSecret = false,25000)

        },
        showAddr(x){
            if (x === this.showAddress) return this.showAddress = false
            this.showAddress = x
        },
        goIn(taskId){
            this.$store.dispatch('goIn', {
                top: 0,
                panel: [taskId],
                parents: [this.$store.getters.member.memberId],
            })

        },
        name(){
            this.$store.dispatch('makeEvent', this.aoNamed)
        },
        connect(){
            this.$store.dispatch('makeEvent', this.ao)
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
