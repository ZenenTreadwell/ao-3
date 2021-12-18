<template lang='pug'>

span.current
    span.clickable(v-if='memberId && name'  @click='goDeeper') {{ name }}
    img.onlineicon(v-if='!memberId', src='../assets/images/lightning.svg')
</template>

<script>

export default {
  props: ['memberId'],
  methods:{
      goDeeper(){
          this.$store.dispatch('goDeeper', this.memberId)
      }
  },
  computed:{
    m(){
        let m = false
        this.$store.state.members.forEach(member => {
            if (member.memberId == this.memberId){
                m = member
            }
        })
        return m
    },
    name(){
        if (this.m) return this.m.name
        return undefined
    },
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'

.current
    font-size: 1em
    margin-left: 1em
    margin-right: 1em
    white-space: nowrap

.onlineicon
    margin-right: 0.5em
    height: 0.9em
    position: relative
    top: 0.25em

.clickable
    cursor: crosshair;
</style>
