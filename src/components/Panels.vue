<template lang='pug'>

.panel
    .row
      .four.columns
          stack(stack='red', :position='$store.getters.contextCard.stackView["red"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.columns
          stack(stack='green', :position='$store.getters.contextCard.stackView["green"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.columns
          stack(stack='blue', :position='$store.getters.contextCard.stackView["blue"]',  :taskId='$store.getters.contextCard.taskId')
    .row
      .two.columns
      .four.columns
          stack(stack='yellow', :position='$store.getters.contextCard.stackView["yellow"]',  :taskId='$store.getters.contextCard.taskId')
      .four.columns
          stack(stack='purple', :position='$store.getters.contextCard.stackView["purple"]',  :taskId='$store.getters.contextCard.taskId')

</template>

<script>
import Stack from './Stack'

export default {
  components:{ Stack },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'

.panel
    margin: 0 1em 1em 1em
    clear: both
    padding-bottom: 1.5em
    min-height: 5.9em
    background-size: cover
    background-position: center center
    overflow: visible

.two.columns, .stay
    height: 1em


</style>
