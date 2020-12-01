<template lang='pug'>

.memberrow.membershipcard(v-if='card'  @dblclick='goIn')
    label.hackername {{ r.name }}
    .container
        div(v-for='o in optionList'  :class='{faded: cantAfford}')
            button(@click='use(o[0])'  :class='cardInputSty(o[2])') {{ o[1] }}
                span(v-if='r.charged > 0') (-{{r.charged}})
    .clearboth
</template>

<script>

export default {
    props: ['r'],
    components: { },
    computed:{
        cantAfford(){
            return this.$store.getters.memberCard.boost < this.r.charged
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
                    return [split[0], split[1], option.color] // notes, name, color
                } else {
                    return ['A', option.name, option.color]
                }
            })
            return ol.filter(list => {
                return !!list
            })
        },
    },
    methods: {
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
        use(letter){
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
        goIn(){
            let top = this.$store.getters.resourceIds.indexOf(this.r.resourceId)
            if (top > -1){
                this.$store.dispatch("goIn", {
                    parents: [this.$store.getters.contextCard.taskId],
                    panel: this.$store.getters.resourceIds,
                    top,
                })
                if(this.$store.state.upgrades.mode === 'doge' && this.$store.getters.contextCard.priorities.length > 0) {
                    this.$store.commit("setMode", 1)
                }
                if (this.$store.getters.resourceIdsard.boost > 0){
                    this.$store.commit("setMode", 3)
                }
            }
        },
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

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
.smallguild
    height: 2em

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
    cursor: pointer

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
    opacity: 0.39

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
