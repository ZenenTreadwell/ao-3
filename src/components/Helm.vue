
<template lang='pug'>

.helm
    img.gear(@click.stop='$store.commit("toggleSettings")'  src='../assets/images/gear.svg')
    img.tras(:ondrop="drop"  :ondragover="allowDropT"  :ondragleave='dragLeaveT' src='../assets/images/fire.svg' :class="{tr: !trash}")
    img.doge(@click.stop='$store.commit("toggleAccounts")'  src='../assets/images/doge.svg'  :ondragenter='toggl')
    settings(@click.stop  v-show='$store.state.upgrades.showSettings').settings
    accounts(@click.stop  v-show='$store.state.upgrades.showAccounts').accounts

</template>

<script>

import Settings from './Settings'
import Lightning from './Lightning'
import Accounts from './Accounts'
import { crawler } from '../calculations'
export default {
    data(){
        return {
            hackyToggleStopper: false,
            trash: false 
        }
    },
    components: {
        Settings, Lightning, Accounts
    },
    methods: {
        drop(ev){
            setTimeout(() => this.trash = false, 999)
            var data = ev.dataTransfer.getData("taskId")
            let history = crawler(this.$store.state.tasks, data)
            history.forEach(taskId => { 
                let task = this.$store.state.tasks[this.$store.state.hashMap[taskId]]
                if (task && task.deck.length === 0 || task.deck.length === 1 && task.deck[0] === this.$store.getters.member.memberId) {
                    this.$store.dispatch("makeEvent", {
                        type: 'task-removed',
                        taskId
                    })
                }
            })
        },
        allowDrop(ev){ ev.preventDefault() },
        allowDropT(ev){
            ev.preventDefault()
            this.trash = true
        },
        dragLeaveT(){
            this.trash = false
        },
        toggl(ev){
            ev.preventDefault()
            if (!this.hackyToggleStopper){
                this.$store.commit("toggleAccounts")
                this.hackyToggleStopper = true
                setTimeout(() => {
                  this.hackyToggleStopper = false
                }, 1000)
            }
        }
    }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours';

.tr 
    opacity: 0.4

.helm
    z-index: 9001

img
    height: 3.3em
    position: fixed
    z-index: 90010000
    cursor: pointer
    padding: .075em

.settings
    position: fixed
    z-index: 80090000
    top: 0
    right: -1em
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    padding: 1.5em
    background: linear-gradient(to bottom left, softGrey, softGrey 6em, lightGrey 6em, lightGrey )

.lightning
    position: fixed
    z-index: 80090000
    top: 0
    right: -1em
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    padding: 1.5em
    background: linear-gradient(to top left, softGrey, softGrey 6em, lightGrey 6em, lightGrey )

.accounts
    position: fixed
    z-index: 80090000
    top: 0
    left: 0
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    background: linear-gradient(to bottom right, softGrey, softGrey 6em, lightGrey 6em, lightGrey )

.gear
    top: 0
    right: 0
    height: 3.3em
    width: 2.7em
.tras
    bottom: 0
    right: 0
    height: 3.3em

.doge
    top: 0
    left: 0
    height: 3.3em

</style>
