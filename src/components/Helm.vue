<template lang='pug'>

.helm
    img.gear(@click.stop='$store.commit("toggleSettings")'  src='../assets/images/gear.svg')
    img.bull(@click.stop='$store.commit("toggleNodeInfo")'  src='../assets/images/bull.svg')
    img.doge(@click.stop='$store.commit("toggleAccounts")'  src='../assets/images/doge.svg'  :ondragover='toggl')
    settings(@click.stop  v-show='$store.state.upgrades.showSettings').settings
    lightning(@click.stop  v-show='$store.state.upgrades.showNodeInfo').lightning
    accounts(@click.stop  v-show='$store.state.upgrades.showAccounts').accounts

</template>

<script>

import Settings from './Settings'
import Lightning from './Lightning'
import Accounts from './Accounts'

export default {
    data(){
        return {hackyToggleStopper: false }
    },
    components: {
        Settings, Lightning, Accounts
    },
    methods: {
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

@import '../styles/grid';
@import '../styles/colours';

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
    bottom: 0
    right: 0
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    padding: 1.5em
    background: linear-gradient(to top left, softGrey, softGrey 4em, lightGrey 4em, lightGrey )
.lightning
    position: fixed
    z-index: 80090000
    top: 0
    right: 0
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    padding: 1.5em
    background: linear-gradient(to bottom left, softGrey, softGrey 4em, lightGrey 4em, lightGrey )
.accounts
    position: fixed
    z-index: 80090000
    top: 0
    left: 0
    width: 89%
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    background: linear-gradient(to bottom right, softGrey, softGrey 4em, lightGrey 4em, lightGrey )

.gear
    bottom: 0
    right: 0

.bull
    top: 0
    right: 0
    height: 3.3em

.doge
    top: 0
    left: 0
    height: 3.3em

</style>
