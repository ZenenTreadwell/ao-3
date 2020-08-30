<template lang='pug'>

.zen()
    .tooltip.fw(v-if='$store.getters.inbox.length < 1')
        img.bdoge(src='../assets/images/doge.svg')
        .tooltiptext(v-if='$store.getters.member.tooltips')
            p.suggest no mode active
    div(v-else)
        .row
            .nine.grid.offset-by-one
                hypercard(v-for='b in $store.getters.inbox'  :b='b'  :inId='$store.getters.member.memberId')
</template>

<script>
import Hypercard from "./Card"

export default {
    components:{
        Hypercard,
    },
}
</script>

<style lang='stylus' scoped>

@import '../styles/tooltips'

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

.fw
    width: 100%
    height: auto
    cursor: pointer

.gift
    display: inline
    height: 4.1em
    clear: none
    opacity: 0.41

span
    font-size: 1.321em
    padding: .5em

.tooltiptext
    position: absolute
    left: 50%

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em
    cursor: pointer

</style>
