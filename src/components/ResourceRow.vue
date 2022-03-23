<template lang='pug'>

.memberrow.membershipcard(v-if='card'  @dblclick='goDeeper')
    label.hackername {{ r.name }} ({{r.charged}})
    .container
        div(v-for='o in optionList')
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
            this.$store.commit("setPayMode", 1)
            this.$store.commit("goDeeper", this.r.resourceId)
            this.$store.commit("goDeeper", taskId)
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
            this.$store.commit("goDeeper", this.r.resourceId)
            this.$store.commit("toggleAccounts")
        },
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/button'

.startright
    text-align: right

.memberrow
    box-shadow: 3px 1px 7px 1px main
    margin-bottom: 8px
    min-height: 37px
    background: lightGrey

button
    margin-bottom: .7321em

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

.paytrigger
    position: absolute;
    right: 0
    height: 2em
    cursor: pointer;

.clearboth
    clear: both

.faded
    opacity: 0.29

.notfaded
    opacity: 1

</style>
