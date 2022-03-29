<template lang='pug'>
div
    .boxy(v-if='$store.state.cash.info.mempool && $store.state.cash.info.blockfo')
        .lim(v-if='$store.getters.limbo > 0') limbo  {{ $store.getters.limbo.toLocaleString() }}
        .section block: {{ $store.state.cash.info.blockheight.toLocaleString()}}
        .section age: {{ ((Date.now() - ($store.state.cash.info.blockfo.time * 1000)) / 60 / 1000).toFixed(1) }} minutes 
        //.section.sampler(@click='sampler') {{ ($store.state.cash.info.mempool.bytes / 1000000).toFixed(1) }} MB unconfirmed transactions
        .section fee percentiles (sat/byte):
        .section
            .grid
                .five.grid
                    p 90th
                .six.grid
                    .chain  {{ $store.state.cash.info.blockfo.feerate_percentiles[4] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[4])')
        .section
            .grid
                .five.grid
                    p 75th
                .six.grid
                    .chain  {{ $store.state.cash.info.blockfo.feerate_percentiles[3] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[3])')
        .section
            .grid
                .five.grid
                    p 50th
                .six.grid
                    .chain  {{ $store.state.cash.info.blockfo.feerate_percentiles[2] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[2])')
        .section
            .grid
                .five.grid
                    p 25th
                .six.grid
                    .chain  {{ $store.state.cash.info.blockfo.feerate_percentiles[1] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[1])')
        .section
            .grid
                .five.grid
                    p 10th
                .six.grid
                    .chain  {{ $store.state.cash.info.blockfo.feerate_percentiles[0] }}
                .one.grid(:class='getFeeColor($store.state.cash.info.blockfo.feerate_percentiles[0])')
        .section
            .grid
                .five.grid
                    p recommend
                .six.grid
                    .chain  {{ ($store.state.cash.info.mempool.smartFee.feerate * 10000).toFixed() }}
                .one.grid(:class='getFeeColor($store.state.cash.info.mempool.smartFee.feerate * 10000)')
    .four.gridi(v-else) node syncing
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
        sampler(){
            // let checkId = this.$store.state.cash.info.mempool.sampleTxns[this.sampleIndex % this.$store.state.cash.info.mempool.sampleTxns.length]
            // this.checkTxid(checkId)
            this.sampleIndex ++
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

