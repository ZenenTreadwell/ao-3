<template lang='pug'>
.task(:class="cardInputSty"  @click='goDeeper'  draggable="true"  :ondrop="drop"  :ondragover="allowDrop"  :ondragstart='dragStart'   :ondragleave='dragLeave').dont-break-out.agedwrapper
    img.diamond(v-for='t in b.priorities'  src='../assets/images/uncompleted.svg'  :class='styl($store.state.tasks[$store.state.hashMap[t]].color)'  @click='$store.commit("setMode", 1)')
    pinner(:b='b', :inId='inId')
    //- tally(:b='b')
    .donut.flaggy.square.hidden(@click.stop='upboat')
    .buffertop
      .cardbody
          linky.cardhud(:x='b.name' v-if='!member'  @click.stop='copyCardToClipboard')
              img.clippy(src='../assets/images/clipboard.svg'  v-if='showCopied')
          div(v-else)
              img.send(src='../assets/images/doge.svg')
              span {{member.name}}
          span.sml
              current(v-for='n in actions'  :memberId='n')
    div
        .copiedspace
        .scrol(@click.stop='remove')
            .donut.scrolly.hidden.square
        .vine(@click.stop='pop')
            .donut.viney.hidden.square
    preview-deck(:task='b')
</template>

<script>
// import _ from 'lodash'
import Tally from './Tally'
import Linky from './Linky'
import Current from './Current'
import Pinner from './Pinner'
import PreviewDeck from './PreviewDeck'

export default {
    data(){
        return {
            showCopied: false,
            dropping: false,
        }
    },
    props: ['b', 'inId', 'c'],
    components: { PreviewDeck, Pinner, Linky, Current, Tally},
    methods: {
        dragLeave(){
            this.dropping = false
        },
        styl(color){
            if (!color  || this.$store.getters.member.stacks === 1) return
            return {
                dropping :this.dropping,
                redwx : color == 'red',
                bluewx : color == 'blue',
                greenwx : color == 'green',
                yellowwx : color == 'yellow',
                purplewx : color == 'purple',
                blackwx : color == 'black',
            }
        },
        drop(ev){
            ev.preventDefault();
            this.dropping = false
            var data = ev.dataTransfer.getData("taskId")
            if (this.b.taskId === data){
                return
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                inId: this.$store.getters.contextCard.taskId,
                taskId: data,
            })
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                inId: this.b.taskId,
                taskId: data,
            })
        },
        allowDrop(ev){
            ev.preventDefault()
            this.dropping = true
        },
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.b.taskId);
        },
        pop(){
            this.rollStackPull()
            this.$store.dispatch("makeEvent", {
                type: 'task-popped',
                taskId: this.b.taskId,
                inId: this.inId,
            })
        },
        upboat(){
            this.rollStackPull()
            this.$store.dispatch("makeEvent", {
                type: 'task-prioritized',
                taskId: this.b.taskId,
                fromId: this.b.taskId,
                inId: this.inId,
            })
        },
        remove(){
            this.rollStackPull()
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                taskId: this.b.taskId,
                inId: this.inId,
            })
        },
        setAction(){
            if (this.$store.getters.member.action === this.b.taskId){
                return this.$store.dispatch("makeEvent", {
                    type: 'member-field-updated',
                    field: 'action',
                    newfield: false,
                    memberId: this.$store.getters.member.memberId,
                })
            }

            this.$store.dispatch("makeEvent", {
                type: 'member-field-updated',
                field: 'action',
                newfield: this.b.taskId,
                memberId: this.$store.getters.member.memberId,
            })
        },
        goDeeper(){
            this.$store.commit("rollStackPull", this.b.taskId)
            this.$store.commit("goDeeper", this.b.taskId)
        },
        purge(){
          this.$store.dispatch("makeEvent", {
              type: 'task-removed',
              taskId: this.b.taskId,
          })
        },
        copyCardToClipboard(){
          if (this.showCopied){
              return this.goDeeper()
          }
          navigator.clipboard.writeText(this.b.name)
              .then(() => {
                  this.showCopied = true
              })
              .catch(err => {
                  console.log(err, 'copy attempt failed, printing to console:')
                  console.log(this.b.name)
              })
        },
        rollStackPull(){
            this.$store.commit("rollStackPull", this.b.taskId)
        }
    },
    computed: {
        actions(){
            let a = []
            this.$store.state.members.forEach(m => {
                if (m.action ===this.b.taskId) a.push(m.memberId)
            })
            return a
        },
        w(){
            return this.$store.getters.weights[this.b.taskId]
        },
        cardInputSty(){
          if(!this.b) {
            return
          }
          if (this.$store.getters.member.stacks === 1) {
              return {
                  dropping: this.dropping,
                  nowx: true
              }
          }
          return {
              dropping: this.dropping,
              redwx : this.b.color == 'red',
              bluewx : this.b.color == 'blue',
              greenwx : this.b.color == 'green',
              yellowwx : this.b.color == 'yellow',
              purplewx : this.b.color == 'purple',
              blackwx : this.b.color == 'black',
          }
        },
        member(){
          let mc = false
          this.$store.state.members.forEach( m => {
              if (this.b.name === m.memberId ){
                  mc = m
              }
          })
          return mc
        },
        fractionalReserveDoge() {
            return Math.max(Math.floor((this.w % 1) * 16), 1)
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/button'
@import '../styles/spinners'
@import '../styles/donut'

.diamond
    cursor: pointer;
    pointer-events: all
    transform: rotate(45deg)
    height: 0.7871em
    position: relative
    top: 0
    right: 0
    float: right;

.sml
    font-size: .73em

.task
    margin:10px 0
    padding:20px
    cursor: crosshair

.scrolly
    position: absolute
    left: 0
    bottom: 0
    height: 2.1em
    cursor: pointer

.vine
    width: 100%
    text-align: right
    span
        padding-right: 1.2em

img.chest
    height: 1.2em

.task
    margin:10px 0
    padding:20px

.viney
    position: absolute
    bottom: 0
    right: 0
    cursor: pointer
    height: 2.1em

.send
    height: 1.1em
    opacity: 0.64

.totop
    z-index: 1000

.pad
    margin-top: 0em
    margin-bottom: 0em

.centered
    text-align: center

.fw
    width:100%

.task
    margin:0
    margin-bottom: .25em
    padding:1em
    position: relative

.dont-break-out
  overflow-wrap: break-word
  word-wrap: break-word
  word-break: break-word
  hyphens: auto

.agedwrapper
    position: relative

.bold
    height: 1.21
    font-weight: bolder

.cardhud
    position: relative
    z-index: 14
    cursor: pointer

.buffertop
    margin-top: 2em
    clear: both
    width: 100%

.cardbody
    width: 100%

.preview
    width: 15%
    float: right
    margin-left: 0.5em
    margin-bottom: 0.5em

.tally
    position: absolute
    right: 2.5em
    top: 0.85em

.square.hidden
    opacity: 0.1234

.hidden
    opacity: 0

.clippy
    height: 1em
    display: inline-block;
    cursor: pointer

.copiedspace
    height: 1.987654em

.copied.hidden
    opacity: 0.1
    cursor: pointer

.flaggy
    position: absolute
    right: 0
    height: 2.1em
    top: 0
    cursor: pointer

.task.dropping
    background: blue

</style>
