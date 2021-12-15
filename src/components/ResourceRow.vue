<template lang='pug'>

.memberrow.membershipcard(v-if='card'  @dblclick='goDeeper')
    label.hackername {{ r.name }} ({{r.charged}})
        span(v-if='cantAfford') ! inactive account !
    .container
        div(v-for='o in optionList')
            img.paytrigger.notfaded(v-if='r.charged > 0'   src='../assets/images/bitcoin.svg'  @click.stop='payPlz(o[3])')
            button(:class='{faded: cantAfford}'  @click.stop='use(o[0], o[3])')
                span(v-if='getResourceName(o[1])') {{getResourceName(o[1])}}
                span(v-else) {{ o[1] }}
    .clearboth
    .startright
        span(v-for='m in recentlyUsed')
            img.paytrigger(v-if='m === "lightning"'  src='../assets/images/lightning.svg')
            current(v-else  :memberId='m')
</template>

<script>
import Current from './Current'

export default {
    props: ['r'],
    components: { Current },
    computed:{
        recentlyUsed(){
            let now = Date.now()
            let memberlist = []
            this.$store.state.tasks[this.$store.state.hashMap[[this.r.resourceId]]].claims.forEach(used => {
                if (now - used.timestamp < (1000 * 60 * 60 * 2)) {
                    memberlist.push(used.memberId)
                }
            })
            return memberlist
        },
        cantAfford(){
            return this.$store.getters.memberCard.boost < this.r.charged || this.$store.getters.memberCard.boost <= 0
        },
        isAnyOptions(){
            return this.optionList.length > 0
        },
        card(){
            return this.$store.state.tasks[this.$store.state.hashMap[this.r.resourceId]]
        },
        optionList(){
            let ol = this.card.priorities.map(taskId => {
                let option = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
                let split = option.name.split(':')
                if (split.length >= 2){
                    return [split[0], split[1], option.color, option.taskId] // notes, name, color
                } else {
                    return ['A', option.name, option.color, option.taskId]
                }
            })
            return ol.filter(list => {
                return !!list
            })
        },
    },
    methods: {
        getResourceName(name){
            let rname = false
            this.$store.state.resources.some(r => {
                if (r.resourceId === name){
                    rname = r.name
                    return true
                }
            })
            return rname
        },
        payPlz(taskId){
            this.$store.commit("setMode", 3)
            this.$store.commit("toggleAccounts")
            this.$store.commit("setPayMode", 2)
            this.$store.commit("goDeeper", this.r.resourceId)
            this.$store.dispatch("makeEvent", {
                type: 'task-valued',
                taskId: taskId,
                value: this.r.charged,
            })
        },
        cardInputSty(color){
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
        },
        resourcePurged(){
            let newEv = {
                type: 'resource-purged',
                resourceId: this.r.resourceId,
            }
            this.$store.dispatch("makeEvent", newEv)
        },
        use(letter, taskId){
            if(this.cantAfford){
                return this.payPlz(taskId)
            }
            let newEv = {
                type: 'resource-used',
                resourceId: this.r.resourceId,
                memberId: this.$store.getters.member.memberId,
                amount: 1,
                charged:this.r.charged,
                notes:letter,
            }
            this.$store.dispatch("makeEvent", newEv)
        },
        goDeeper(){
            this.$store.commit("goDeeper", this.$store.getters.resourceIds)
        },
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

.startright
    text-align: right

.memberrow
    box-shadow: 3px 1px 7px 1px main
    margin-bottom: 8px
    min-height: 37px
    background: lightGrey

.redtx
    font-size: 0.6em

.smallguild
    height: 2em

.stash
    display: inline
    margin-left: 0.5em
    position: relative
    top: -0.35em

button
    margin-bottom: .7321em

code
    margin-top: 1em
    border-radius: 5px
    padding: .4321em

img
    height: 2em

label
    font-weight: normal;
    margin: 1em
    display: block

.hackername
    font-family: monospace
    font-size: 1.3em
    padding: 0.25em
.smallguild
    height: 2em

.paytrigger
    position: absolute;
    right: 0
    height: 2em
    cursor: pointer;

.bottomleft, .bottomright
    width: fit-content
    position: relative
    bottom: 0

.bottomleft
    float: left
    left: 0

.bottomright
    right: 0
    cursor:pointer
    float: right

.stash
    display: inline
    margin-left: 0.5em
    position: relative
    top: -0.35em

.clearboth
    clear: both

.gui
    font-size: 1.7em
    cursor: pointerd

.title
    text-align: center
    font-size: 1.8em
    margin-top: 0.5em
    font-weight: bold

.help
    font-size: 1.3em

.suggest
    font-style: italic
    font-size: 1.3em

.dogecoin
    width: 3em
    height: 3em
    cursor: pointer

.faded
    opacity: 0.29

.notfaded
    opacity: 1

.tooltiptext.membertooltip
    width: 20em
    z-index: 151
    left: 7em
    top: -11em

ul.left
    text-align: left

.goodbye
    height: 2em
</style>
