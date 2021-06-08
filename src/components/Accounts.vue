<template lang='pug'>

#accounts
    .breathing
    resource-row(v-for='r in $store.state.resources'  :r='r')
    .list
        member-row(v-for="m in coreMembers"  :m='m'  :key='m.memberId')
        member-row(v-for="m in pendingDeactivations"  :m='m'  :key='m.memberId')
        member-row(v-for="m in nonMembers"  :m='m'  :key='m.memberId')
</template>

<script>
import cryptoUtils from '../crypto'
import MemberRow from './MemberRow'
import Connect from './Connect'
import ResourceRow from './ResourceRow'
import Projects from './Projects'

export default {
    components: {MemberRow, ResourceRow, Connect, Projects},
    data() {
      return {
        change: {
            field: 'secret',
            newfield: '',
            confirmNewfield: ''
        },
        member: {
          name: '',
          pass: '',
          fob: '',
        },
      }
    },
    methods: {
        toggleStacks(){
            let newfield = 5
            if (this.$store.getters.member.stacks === 5){
                newfield = 1
            }
            this.$store.dispatch('makeEvent', {
                type: "member-field-updated",
                field: 'stacks',
                newfield,
                memberId: this.$store.getters.member.memberId
            })
        },
        toggleMuted(){
            this.$store.dispatch('makeEvent', {
                type: "member-field-updated",
                field: 'muted',
                newfield: !this.$store.getters.member.muted,
                memberId: this.$store.getters.member.memberId
            })
        },
        toggleGuides(){
            this.$store.dispatch('makeEvent', {
                type: "member-field-updated",
                field: 'guides',
                newfield: !this.$store.getters.member.guides,
                memberId: this.$store.getters.member.memberId
            })
        },
        toggleTooltips(){
            this.$store.dispatch('makeEvent', {
                type: "member-field-updated",
                field: 'tooltips',
                newfield: !this.$store.getters.member.tooltips,
                memberId: this.$store.getters.member.memberId
            })
        },
        empty(){
            this.change.newfield = ''
            this.change.confirmNewfield = ''
        },
        update(){
            this.$store.dispatch('makeEvent', this.changeReq)
            this.empty()
        },
        newMember() {
            this.$store.dispatch('makeEvent', this.memberReq)
        },
    },
    computed:{
      matched(){
          if (this.change.field === "secret"){
              let x = this.change.newfield
              let y = this.change.confirmNewfield
              return x === y
          } else {
              return true
          }
      },
      changeReq(){
          if (this.change.field === 'secret'){
                return {
                    type: "member-field-updated",
                    field: this.change.field,
                    newfield: cryptoUtils.createHash( this.change.newfield),
                    memberId: this.$store.getters.member.memberId
                }
          }
          return {
              type: "member-field-updated",
              field: this.change.field,
              newfield: this.change.newfield,
              memberId: this.$store.getters.member.memberId
          }
      },
      inputType(){
          if (this.change.field === 'secret'){
              return 'password'
          } else if (this.change.field === 'muted') {
              return 'boolean'
          } else {
              return 'text'
          }
      },
      memberReq(){
          let name, secret
          name = this.member.name
          if (name){
              secret = cryptoUtils.createHash(name)
          }
          return {
              type: "member-created",
              name,
              secret,
              fob: this.member.fob,
          }
          },
      nonMembers(){
          return this.sortedMembers
            .filter(m => m.active <= 0)
      },
      coreMembers(){
          return this.sortedMembers
            .filter(m => m.active > 0 && this.$store.state.tasks[this.$store.state.hashMap[m.memberId]].boost > 0)
      },
      pendingDeactivations(){
          return this.sortedMembers
            .filter(m => m.active > 0 && this.$store.state.tasks[this.$store.state.hashMap[m.memberId]].boost <= 0)
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
      activeAccounts(){
            return this.$store.state.members.length
      }
    }
}
</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/grid'
@import '../styles/breakpoints'
@import '../styles/button'
@import '../styles/input'

#accounts
    padding : 1.5em

.section
    color:main
    font-size: 0.9em
    margin-bottom: .9em

.fw
    width: 100%
.padding
    padding: 1.987654321em
.cross
    text-decoration: line-through
.inline
    display:inline-block
    margin:15px
.menu
    color: softGrey
    font-size: 2em
h1
		margin-bottom: 1em
li
    font-size:18px
    font-family: 'Open Sans', light, sans-serif
h3
    font-family: 'Open Sans', light, sans-serif
    font-size:1.6em
a, input
		margin-top: .5em
.space
    padding-left: .654321em
.click
    cursor: pointer
img
    float: left
    height: 3em
    position: relative
    right: 0
.checkmark
    height: 1.58em
.check
    padding: 0.5em
input, select
    z-index:123123
.activelabel
    font-size: 1.2em
    margin-bottom: 1em
    clear: both
.fl
    float: left
.mt
    margin-top: -1em
li
    margin-left: 1em

.breathing
    height: 3.5em

</style>
