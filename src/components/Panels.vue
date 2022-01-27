<template lang='pug'>

.panel
    .row
      .four.grid
          stack(stack='red', :position='$store.getters.contextCard.stackView["red"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.grid
          stack(stack='green', :position='$store.getters.contextCard.stackView["green"]',  :taskId='$store.getters.contextCard.taskId')
          span &nbsp;
      .four.grid
          stack(stack='blue', :position='$store.getters.contextCard.stackView["blue"]',  :taskId='$store.getters.contextCard.taskId')
    .row
      .two.grid
      .four.grid
          stack(stack='yellow', :position='$store.getters.contextCard.stackView["yellow"]',  :taskId='$store.getters.contextCard.taskId')
      .four.grid
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
@import '../styles/grid'

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
