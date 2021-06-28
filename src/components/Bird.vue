<template lang='pug'>

.bird(@click.stop)
    div(@click='toggleSend')
        img.birdy(v-if='!showSend && !b.guild' src='../assets/images/badge.svg'  :class='{hidden:!$store.getters.member.guides}')
        div.birdy.smallguild(v-else  :class='{ open : showSend }')
    guild-create(v-if='showSend'   :b='b'  :showSendOff='showSendOff')
    .theTitle(v-if='b.guild && !showSend') {{ b.guild }}
    .count
</template>

<script>
import GuildCreate from './GuildCreate'
import Tally from './Tally'

export default {
    props: ['b', 'inId'],
    components: {
        GuildCreate, Tally
    },
    data() {
        if (this.$store.getters.recentMembers.length > 0 && this.$store.getters.guilds.length > 0){
            return {
                showGuildCreate: false,
                showSend:false,
                toMember: this.$store.getters.recentMembers[0].memberId,
                toGuild: this.$store.getters.guilds[0].taskId,
                toAo:'',
            }
        } else {
          return {
              showGuildCreate: false,
              showSend:false,
              toMember: '',
              toGuild: '',
              toAo:'',
          }
        }
    },
    methods: {
        showSendOff(){
            this.showSend = false
        },
        toggleGuildCreate(){
            if(!this.showGuildCreate) {
                this.showSend = false
            }
            this.showGuildCreate = !this.showGuildCreate
            if(this.showGuildCreate) {
                setTimeout(()=>{ document.getElementById('titlebox').focus() }, 1)
            }
        },
        toggleSend(){
            if(!this.showSend) {
                this.showGuildCreate = false
            }
            this.showSend = !this.showSend
        },
    },
    computed: {
        showGive(){
            return this.showSend && this.$store.state.upgrades.mode === 'doge'
        },
        showPlay(){
            return this.showSend && (this.$store.state.upgrades.mode === 'badge' || this.$store.state.upgrades.mode === 'boat')
        },
        showRelay(){
            return this.showSend && (this.$store.state.upgrades.mode === 'chest' || this.$store.state.upgrades.mode === 'timecube')
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/donut'

.count
    float: right

.upgrade
    height: 3em

.task
    margin:10px 0
    padding:20px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em


.give
    select
        width: 61%
    button
        width: 29%


select.form-control
    color: black

select.shorten
    width: 68%

.curs
    cursor: pointer;

.birdy
    float: left
    height: 1.4777em
    cursor: pointer
    opacity:0.5

.faded
    opacity: 0.235654

.smallguild
    background-image: url('../assets/images/badge.svg')
    background-repeat: no-repeat
    background-size: contain
    background-position: top left
    height: 1.67em
    width: 1.7em
    opacity: 1
    position: relative
    z-index: 10

.give, .play, .warp
    position: relative
    top: 2em
    margin-bottom: 1em
    padding-bottom: 1em
    width: 100%

.theTitle
    color: main

.small
    display: inline-block
    height: 2.3em
    position: relative
    top: -0.07em

.hidden
    opacity: 0

</style>
