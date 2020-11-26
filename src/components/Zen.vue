<template lang='pug'>

.zen()
    .fw(v-if='$store.getters.inbox.length < 1')
        img.bdoge(src='../assets/images/doge.svg')
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

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'

.fw
    width: 100%
    height: auto
    cursor: pointer

.bdoge
    width: 100%
    opacity: 0.77
    height: 5em
    margin-top: 1em
    cursor: pointer

</style>
