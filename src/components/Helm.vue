<template lang='pug'>

.helm
    img.gear(@click.stop='$store.commit("toggleSettings")'  src='../assets/images/gear.svg')
    img.bull(@click.stop='$store.commit("toggleNodeInfo")'  src='../assets/images/bull.svg')
    img.doge(@click.stop='$store.commit("toggleAccounts")'  src='../assets/images/doge.svg'  :ondragover='toggl')
    settings(@click.stop  v-if='$store.state.upgrades.showSettings').settings
    lightning(@click.stop  v-if='$store.state.upgrades.showNodeInfo').lightning
    accounts(@click.stop  v-if='$store.state.upgrades.showAccounts').accounts

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

.hidden
    opacity: 0

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
    padding: 1.5em
    background: linear-gradient(to top left, softGrey, softGrey 4em, lightGrey 4em, lightGrey )
.lightning
    position: fixed
    z-index: 80090000
    top: 0
    right: 0
    width: 89%
    padding: 1.5em
    background: linear-gradient(to bottom left, softGrey, softGrey 4em, lightGrey 4em, lightGrey )
.accounts
    position: fixed
    z-index: 80090000
    top: 0
    left: 0
    width: 89%
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

.quarter
    display: inline-block
    width: 33%
    font-size: 6.44em
    color: lightGrey
    max-height: 2em
    margin-top: -0.35em;

.selected
    color: wrexgreen

.quarter:before
    content: "\2022";

.upg
    height: 2em
    pointer-events: none

.topcenter
    position: fixed
    top: 0
    left: 50%
    transform: translateX(-50%)
    width: 10em
    height: 2em
    max-width: 33%
    color: main
    padding-left: 2em
    padding-right: 2em
    padding-top: .29em
    padding-bottom: .29em
    z-index: 77777
    cursor: pointer

</style>
