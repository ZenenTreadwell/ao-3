<template lang='pug'>

#accounts
    resource-row(v-for='r in $store.state.resources'  :r='r')
    member-row(v-for="m in coreMembers"  :m='m'  :key='m.memberId')
    member-row(v-for="m in pendingDeactivations"  :m='m'  :key='m.memberId')
    member-row(v-for="m in nonMembers"  :m='m'  :key='m.memberId')
</template>

<script>
import MemberRow from './MemberRow'
import ResourceRow from './ResourceRow'

export default {
    components: {MemberRow, ResourceRow},
    computed:{
      coreMembers(){
          return this.sortedMembers
            .filter(m => m.active > 0 && this.$store.state.tasks[this.$store.state.hashMap[m.memberId]].boost > 0)
      },
      pendingDeactivations(){
          return this.sortedMembers
            .filter(m => m.active > 0 && this.$store.state.tasks[this.$store.state.hashMap[m.memberId]].boost <= 0)
      },
      nonMembers(){
          return this.sortedMembers
            .filter(m => m.active <= 0)
      },
      sortedMembers(){
              let sortedMembers = this.$store.state.members.slice()
              sortedMembers.sort((a, b) => {
                  let cardA = this.$store.state.tasks[this.$store.state.hashMap[a.memberId]]
                  let cardB = this.$store.state.tasks[this.$store.state.hashMap[b.memberId]]
                  if(cardA.deck.length < cardB.deck.length) return 1
                  if(cardA.deck.length === cardB.deck.length) return 0
                  return -1
              })
              return sortedMembers
        },
    }
}
</script>

<style lang='stylus' scoped>

#accounts
    padding : 1.5em
    overflow-y: scroll
    max-height: 100vh
    padding-top: 3.5em

</style>
