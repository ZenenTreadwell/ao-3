<template lang='pug'>

.bird(@click.stop)
    div(@click='toggleSend')
        img.birdy.faded(v-if='!showSend && !b.guild' src='../assets/images/badge.svg'  :class='{hidden:!$store.getters.member.guides}')
        div.birdy.faded.smallguild(v-else  :class='{ open : showSend }')
    guild-create(v-if='showSend'   :b='b')
    div(v-if='showSend')
        .give
            select(v-model='toMember')
                option(v-for='n in $store.getters.recentMembers', :value="n.memberId") {{ n.name }}
                option(v-for='g in $store.getters.guilds'  :value="g.taskId") # {{ g.guild }}
            button.small(@click='dispatchMakeEvent') show
        //- .play(v-if='$store.getters.guilds.length > 0')
        //-     select(v-model='toGuild')
        //-         template()
        //-     button.small(@click='dispatchMakeEvent(playInfo)') send
        //- .give(v-if='$store.state.ao.length > 0')
        //-     select(v-model='toAo')
        //-         option(disabled, value='') to ao
        //-         option(v-for='n in $store.state.ao'  :value='n.address')  {{n.address}}
        //-     button.small(@click='dispatchMakeEvent(aoLink)') link
    .theTitle(v-if='b.guild && !showSend') {{ b.guild }}
    .count
</template>

<script>
import GuildCreate from './GuildCreate'

export default {
    props: ['b', 'inId'],
    components: {
        GuildCreate
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
        dispatchMakeEvent(){
            let isMem = false
            this.$store.state.members.forEach(m => {
                if (m.memberId === this.toMember){
                    isMem = true
                }
            })

            if (isMem){
              this.$store.dispatch('makeEvent', {
                  type: 'task-passed',
                  taskId: this.b.taskId,
                  fromMemberId: this.$store.getters.member.memberId,
                  toMemberId: this.toMember,
              })
            } else {
                this.$store.dispatch('makeEvent', {
                    type: 'task-sub-tasked',
                    taskId:  this.toMember,
                    subTask: this.b.taskId,
                })
            }
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
    height: .777em
    cursor: pointer

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
    position: absolute
    left: 3.3em
    top: 1.3em

.small
    display: inline-block
    height: 2.3em
    position: relative
    top: -0.07em

.hidden
    opacity: 0

</style>
