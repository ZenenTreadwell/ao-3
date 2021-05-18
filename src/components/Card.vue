<template lang='pug'>
.task(:class="cardInputSty"  @click='goIn'  draggable="true"  :ondrop="drop"  :ondragover="allowDrop"  :ondragstart='dragStart').dont-break-out.agedwrapper
    bird(:b='b', :inId='inId')
    .donut.flaggy(@click.stop='upboat'  :class='{hidden:!$store.getters.member.guides}')
    .buffertop
      .cardbody
          linky.cardhud(:x='b.name' v-if='!member')
          span.sml
              current(v-for='n in actions'  :memberId='n')
          div(v-if='b.taskId !== $store.getters.contextCard.taskId')
              simple(:taskId="b.taskId")
    .passed
        div.totop(v-if='b.passed.length > 0  && $store.state.upgrades.bird')
            div(@click='toggleBird')
                template(v-for='n in b.passed')
                    .row.pad.centered
                        current(:memberId='n[0]')
                        img.send(src='../assets/images/send.svg')
                        current(:memberId='n[1]')
    div
        .copydiv
            img.copied(src='../assets/images/loggedOut.svg'  :class='{hidden:!showCopied}'  @click.stop='copyCardToClipboard')
        .scrol(@click.stop='remove')
            .donut.scrolly(:class='{hidden:!$store.getters.member.guides}')
        .vine(@click.stop='pop')
            .donut.viney(:class='{hidden:!$store.getters.member.guides}')
        .singlebird(v-if='b.passed.length > 0'  @click.stop='toggleBird'  v-show='!$store.state.upgrades.bird')
            .row.pad.centered()
                span(v-if='b.passed.length > 0'  :class='{faded:!$store.state.upgrades.bird}')
                    img.send(src='../assets/images/send.svg')
                    span {{ b.passed.length}}
    preview-deck(:task='b')
</template>

<script>
import _ from 'lodash'
import Tally from './Tally'
import Linky from './Linky'
import Current from './Current'
import Bird from './Bird'
import PreviewDeck from './PreviewDeck'
import Simple from './SimplePriorities'

export default {
    data(){
        return {
            showCopied: false
        }
    },
    props: ['b', 'inId', 'c'],
    components: { PreviewDeck, Bird, Linky, Simple, Current, Tally},
    methods: {
        drop(ev){
            ev.preventDefault();
            var data = ev.dataTransfer.getData("taskId")
            if (this.b.taskId === data){
                return
            }
            this.$store.dispatch("makeEvent", {
                type: 'task-de-sub-tasked',
                taskId: this.$store.getters.contextCard.taskId,
                subTask: data,
            })
            this.$store.dispatch("makeEvent", {
                type: 'task-sub-tasked',
                taskId: this.b.taskId,
                subTask: data,
            })
        },
        allowDrop(ev){
            ev.preventDefault()
        },
        dragStart(ev){
            ev.dataTransfer.setData("taskId", this.b.taskId);
        },
        pop(){
            this.$store.dispatch("makeEvent", {
                type: 'task-popped',
                taskId: this.b.taskId,
                inId: this.inId,
            })
        },
        upboat(){
            if (this.$store.getters.contextCard.taskId === this.b.taskId){
                let target = this.$store.getters.member.memberId
                this.$store.dispatch("goUp", {
                    target,
                    panel: [target],
                    top: 0
                })
                this.$store.dispatch("makeEvent", {
                    type: 'task-prioritized',
                    taskId: this.b.taskId,
                    inId: target,
                })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-prioritized',
                    taskId: this.b.taskId,
                    inId: this.inId,
                })

            }
            this.$store.commit('setMode', 1)
        },
        remove(){
            if (this.$store.getters.contextCard.taskId === this.b.taskId){
              let target = this.$store.state.context.parent[this.$store.state.context.parent.length -1]
              this.$store.dispatch("goUp", {
                  target,
                  panel: [target],
                  top: 0
              })
            } else {
                this.$store.dispatch("makeEvent", {
                    type: 'task-de-sub-tasked',
                    subTask: this.b.taskId,
                    taskId: this.inId,
                })
            }
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
        toggleBird(){
            this.$store.commit('toggleBird')
        },
        goIn(){
            let panel = this.c
            if (panel && panel.length && panel.length > 0){
                //
            } else {
                panel = _.uniq( [this.b.taskId].concat(this.$store.state.context.panel) )
            }

            let top = panel.indexOf(this.b.taskId)

            if (top > -1){
                //
            } else {
                top = 0
            }

            let parents = []

            parents.push(this.$store.getters.contextCard.taskId)
            if (this.inId && parents.indexOf(this.inId) < 0){
                parents.push(this.inId)
            }
            this.$store.dispatch("goIn", {
                parents,
                top,
                panel,
            })
        },
        purge(){
          this.$store.dispatch("makeEvent", {
              type: 'task-removed',
              taskId: this.b.taskId,
          })
        },
        copyCardToClipboard(){
          navigator.clipboard.writeText(this.b.name)
              .then(() => {
                  this.showCopied = true
              })
              .catch(err => {
                  console.log(err, 'copy attempt failed, printing to console:')
                  console.log(this.b.name)
              })
        },
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
                  nowx: true
              }
          }
          return {
              redwx : this.b.color == 'red',
              bluewx : this.b.color == 'blue',
              greenwx : this.b.color == 'green',
              yellowwx : this.b.color == 'yellow',
              purplewx : this.b.color == 'purple',
              blackwx : this.b.color == 'black',
          }
        },
        member(){
          let mc
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
@import '../styles/skeleton'
@import '../styles/grid'
@import '../styles/button'
@import '../styles/spinners'
@import '../styles/donut'

.sml
    font-size: .73em

.faded
    opacity: .1

.tooltiptext.correctspot
    position: absolute
    top: calc(100% - 1.75em)
    right: 2em
    z-index: 9000

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    margin:10px 0
    padding:20px
    cursor: crosshair
    // border-radius: 2%
.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.scrolly
    position: absolute
    left: 0.5em
    bottom: 0.5em
    height: 1.3em
    cursor: pointer

.vine
    width: 100%
    text-align: right
    span
        padding-right: 1.2em


img.chest
    height: 1.2em

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    margin:10px 0
    padding:20px

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.viney
    height: 1.3em
    position: absolute
    bottom: 0.5em
    right: 0.5em
    cursor: pointer

.row
    width: 100%

.send
    height: 1.1em
    opacity: 0.64

.accept, .dontaccept
    width: 100%
    background: accent5
    padding: .789em
    border-style: none
    img
        background: white
        padding: .1em
        border-radius: 3px

.arrow
    height: 3.35em

.fl
    float: left
.fr
    float: right

.totop
    z-index: 1000

.pad
    margin-top: 0em
    margin-bottom: 0em

.centered
    text-align: center

.fw
    width:100%

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    margin:0
    margin-bottom: .25em
    padding:1em
    //border-radius: 12px
    // box-shadow: -7px 7px 7px 1px rgba(21, 21, 21, 0.5)
    position: relative

.dont-break-out
  overflow-wrap: break-word
  word-wrap: break-word
  word-break: break-word
  hyphens: auto

.brder
    label
        text-align: center

.tooltip .tooltiptext
    font-size: 1em
    padding-bottom: 1em

.arrow
    height: 3.35em

.thumbnail-container {
  width: calc(1440px * 0.19)
  height: calc(900px * 0.19)
  display: inline-block
  overflow: hidden
  position: relative
}

.thumbnail {
  width: calc(1440px)
  height: calc(900px)
  position: relative
  -ms-zoom: 0.19
  -moz-transform: scale(0.19)
  -moz-transform-origin: 0 0
  -o-transform: scale(0.19)
  -o-transform-origin: 0 0
  -webkit-transform: scale(0.19)
  -webkit-transform-origin: 0 0
}

.thumbnail iframe {
  width: 1440px
  height: 900px
}

.thumbnail:after {
  content: ""
  display: block
  position: absolute
  top: 0
  left: 0
  right: 0
  bottom: 0
}

.faded
    opacity: 0.235654

.agedwrapper
    position: relative

.agedbackground
    background-image: url('/paper.jpg')
    background-repeat: no-repeat
    background-position: center center
    background-size: cover
    top: 0
    left: 0
    bottom: 0
    right: 0
    position: absolute
    width: 100%
    height: 100%
    pointer-events: none

.freshpaper
    background-image: url('/paper.jpg')
    opacity: 0.2

.weekoldpaper
    background-image: url('/paper_aged_1.png')
    opacity: 0.25

.montholdpaper
    background-image: url('/paper_aged_2.png')
    opacity: 0.3

.threemontholdpaper
    background-image: url('/paper_aged_3.png')
    opacity: 0.35

.smallguild
    height: 1.67em

.bold
    height: 1.21
    font-weight: bolder

.cardhud
    margin-bottom: 1em
    position: relative
    z-index: 14

.cardheader
    margin: 0 auto
    font-size: 1.2em

.cardname
    z-index: 15
    position: relative

.dogecoin
    position: absolute
    top:0
    left: 50%
    transform: translateX(-50%)
    z-index: 154

.dogecoin .tooltiptext
    left: 3em

.dogecoin img
    width: 1.3em

.sixteenth1
    clip-path: polygon(50% 50%, 50% 0, 25% 0)

.sixteenth2
    clip-path: polygon(50% 50%, 50% 0, 0 0)

.sixteenth3
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 25%)

.sixteenth4
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 50%)

.sixteenth5
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 75%)

.sixteenth6
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%)

.sixteenth7
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 25% 100%)

.sixteenth8
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 50% 100%)

.sixteenth9
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 75% 100%)

.sixteenth10
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%)

.sixteenth11
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100 75%)

.sixteenth12
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 50%)

.sixteenth13
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 25%)

.sixteenth14
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0)

.sixteenth15
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0, 75% 0)

.sixteenth16
    clip-path: polygon(50% 50%, 50% 0, 0 0, 0 100%, 100% 100%, 100% 0, 50% 0)

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

.hidden
    opacity: 0

.copied
    height: 2em

.copied.hidden
    opacity: 0.1
    cursor: pointer

.copydiv
    padding-left: 50% - 2em

.flaggy
    position: absolute
    right: 0.5em
    top: 0.5em
    height: 1em
    cursor: pointer

</style>
