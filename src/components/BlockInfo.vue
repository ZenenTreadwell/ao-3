<template lang='pug'>
div
    .boxy(v-if='!$store.state.cash.info.initialdownload && $store.state.cash.info.feepercentiles')
        .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}
        .section block: {{ $store.state.cash.info.bitcoinblocks}}
        .section fee percentiles (sat/byte):
        .section
            .grid
                .five.grid
                    p 90th
                .six.grid
                    .chain  {{ $store.state.cash.info.feepercentiles[4] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.feepercentiles[4])')
        .section
            .grid
                .five.grid
                    p 75th
                .six.grid
                    .chain  {{ $store.state.cash.info.feepercentiles[3] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.feepercentiles[3])')
        .section
            .grid
                .five.grid
                    p 50th
                .six.grid
                    .chain  {{ $store.state.cash.info.feepercentiles[2] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.feepercentiles[2])')
        .section
            .grid
                .five.grid
                    p 25th
                .six.grid
                    .chain  {{ $store.state.cash.info.feepercentiles[1] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.feepercentiles[1])')
        .section
            .grid
                .five.grid
                    p 10th
                .six.grid
                    .chain  {{ $store.state.cash.info.feepercentiles[0] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.feepercentiles[0])')
        //.section
        //    .grid
        //        .five.grid
        //            p recommend
        //        .six.grid
        //            .chain  {{ Math.min(1, $store.state.cash.info.smartfee * 1000) }}
        //        .one.grid(:class='getFeeColor($store.state.cash.info.smartfee * 10000)')
    .boxy(v-else) node syncing 
        span(v-if='!$store.state.cash.info.verificationprogress') false
        span(v-else) {{Math.round($store.state.cash.info.verificationprogress * 10000) / 100 }}% 

</template>

<script> 
export default {
    methods: {
        getFeeColor(x){
            if (this.$store.getters.member.stacks === 1) return
            if (x > 100) return { redwx : 1}
            if (x > 50) return { yellowwx : 1}
            if (x > 10) return { bluewx: 1}
            return {greenwx: 1}
        },
    }
}

</script>

<style lang='stylus' scoped>
@import '../styles/colours'

.boxy
    box-shadow: 0 3px 10px rgb(0 0 0 / 0.2)
    padding: .378em
    margin-bottom: 1em

.grid 
    display: flex 

.five 
    flex: 5 5 3em
.six 
    flex: 6 6 3em
.one 
    min-height:1em
    flex: 1 1 3em

</style>

