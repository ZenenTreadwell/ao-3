<template lang="pug">

#calendar(:key='inId')
  .menu
      .thirdy.dot(@click.stop='prevMonth')
      .thirdy(@click='clickDateBar')
          .ptr {{ monthName }} - {{year}}
              span(v-if='$store.state.upgrades.chosenDay') - {{ $store.state.upgrades.chosenDay }}
      .thirdy.dot(@click.stop='nextMonth')
  .calmonth(v-if='!$store.state.upgrades.chosenDay')
      .weekday(v-for='day in DAYS_OF_WEEK') {{ day }}
      .placeholder(v-for='placeholder in firstDay')
      div.ptr(v-for='day in days'  @click='chooseDay(day)')
          day(:day="day", :month='month', :year='year'  :inId='inId'  :ev="eventsByDay[day]"  :isToday='checkToday(day, month, year)')
      .placeholder(v-for='placeholder in lastDay')
  .calmonth(v-else  :ondrop='drop'    :ondragover="allowDrop")
      .weekdayfull(@click='clickDateBar') {{ chosenWeekDay }}
      .grey
          .datenumber  {{ $store.state.upgrades.chosenDay }}
          resource-book(:chosenDay='chosenDay')
          .ptr.bg(v-for='n in selectedDaysEvs')
              span(v-if='n.type === "task-claimed"'  @click='goDeeper(n.taskId, n.inId)')
                  img.completedcheckmark(:class='styl(getCardColor(n.taskId))'  src='../assets/images/completed.svg')
                  span {{ new Date(n.timestamp).toString().slice(15,21) }} &nbsp;
                  span(v-if='n.taskId === $store.getters.contextCard.taskId')
                      img.completedcheckmark.dark(src='../assets/images/doge.svg')
                      span {{ checkIsMember(n.memberId) }}
                  span(v-else)
                      linky(:x='getFromMap(n.taskId).name')
              span(v-else-if='n.type === "resource-used"'  @click='goDeeper(n.resourceId, n.memberId)')
                  span {{ new Date(n.timestamp).toString().slice(15,21) }} &nbsp;
                  img.completedcheckmark(src='../assets/images/down.svg')
                  current(:memberId='n.memberId')
                  currentr(:resourceId='n.resourceId')
                  span - {{ n.notes }}
              span(v-else-if='checkIsMember(n.name)'  @click='goDeeper(n.taskId)')
                  span {{ new Date(n.book.startTs).toString().slice(15,21) }} - {{ checkIsMember(n.name) }}
              span(v-else  @click='goDeeper(n.taskId)')
                  img.completedcheckmark(src='../assets/images/uncompleted.svg')
                  span {{ new Date(n.book.startTs).toString().slice(15,21) }} - {{n.name}}
  .buffer
</template>

<script>
import _ from 'lodash'
import Day from './Day.vue'
import Current from './Current.vue'
import Currentr from './Currentr.vue'
import Linky from './Linky'
import ResourceBook from './ResourceBook'


function getDMY(ts){
    let d = new Date(ts)
    let day =  d.getDate()
    let month = d.getMonth()
    let year = d.getFullYear()
    return { day, month, year }
}

export default {
  components: {
    Day, Currentr, Current,
    Linky, ResourceBook
  },
  methods: {
      styl(color){
          if (!color  || this.$store.getters.member.stacks === 1) return
          return {
              redwx : color == 'red',
              bluewx : color == 'blue',
              greenwx : color == 'green',
              yellowwx : color == 'yellow',
              purplewx : color == 'purple',
              blackwx : color == 'black',
          }
      },
      getCardColor(tId){
          let task = this.$store.state.tasks[this.$store.state.hashMap[tId]]
          if (task) return task.color
          return 'red'
      },
      allowDrop(ev){
          ev.preventDefault()
      },
      drop(ev){
          ev.preventDefault();
          var data = ev.dataTransfer.getData("taskId")
          this.$store.dispatch("makeEvent", {
              type: 'task-prioritized',
              inId: this.$store.getters.contextCard.taskId,
              fromId: this.$store.getters.contextCard.taskId,
              taskId: data,
          })
      },
      checkIsMember(name){
          let mName = false
          this.$store.state.members.some(m => {
                if (m.memberId === name){
                    mName = m.name
                    return true
                }
          })
          return mName
      },
      clickDateBar(){
          if (this.$store.state.upgrades.chosenDay >= 0){
              this.chooseDay(undefined)
          } else {
              this.chooseDay(this.today.day)
              this.month = this.today.month
              this.year = this.today.year
          }
      },
      goDeeper(taskId, inId){
          if (inId) this.$store.commit("goDeeper", inId);
          if (taskId) this.$store.commit("goDeeper", taskId);
      },
      getFromMap(taskId){
          return this.$store.state.tasks[this.$store.state.hashMap[taskId]]
      },
      chooseDay(x){
          if (x === this.$store.state.upgrades.chosenDay){
              return this.$store.commit('chooseDay', undefined)
          }
          this.$store.commit('chooseDay', x)
      },
      nextMonth(){
          if (this.$store.state.upgrades.chosenDay){
              return this.$store.commit('chooseDay', this.$store.state.upgrades.chosenDay + 1)
          }
          if (this.month == 11){
            this.year++
            this.month = 0
          }
          else {
            this.month++
          }
      },
      prevMonth(){
          if (this.$store.state.upgrades.chosenDay){
              return this.$store.commit('chooseDay', this.$store.state.upgrades.chosenDay - 1)
          }
          if (this.month == 0){
              this.year--
              this.month = 11
          }
          else {
              this.month--
          }
      },
      nextYear(){
          this.year++
      },
      prevYear(){
          this.year--
      },
      checkToday(day, month, year){
          let isToday = day === this.today.day && month === this.today.month && year === this.today.year
          return isToday
      }
  },
  computed: {
    inId(){
        return this.$store.getters.contextCard.taskId
    },
    chosenDay(){
        return {
            year: this.year,
            month: this.month,
            day: this.$store.state.upgrades.chosenDay
        }
    },
    chosenWeekDay(){
        let date = new Date(this.year, this.month, this.$store.state.upgrades.chosenDay)
        let firstDay = date.getDay()
        return this.DAYS_OF_WEEK[firstDay]
    },
    selectedDaysEvs(){
        let selectDays = _.uniqBy(this.eventsByDay[this.$store.state.upgrades.chosenDay], u => (u.taskId, u.timestamp) )
        selectDays.sort((a, b) => a.timestamp - b.timestamp)
        return selectDays
    },
    today(){
        return getDMY(Date.now())
    },
    areEvs(){
        return Object.keys(this.eventsByDay).length > 0
    },
    eventsByDay(){
        let evs = {}
        if (this.inId){
            this.todaysEvents.forEach(t => {
                if (!t){
                    return console.log('bad todays event', t)
                }
                t.claims.forEach(cl => {
                    let date = getDMY(cl.timestamp)
                    if (date.month === this.month && date.year === this.year){
                        if (!evs[date.day]){
                            evs[date.day] = []
                        }
                        let noDup = evs[date.day].every(c => !_.isEqual(c, cl))
                        if (noDup){
                            evs[date.day].push(cl)
                        }
                    }
                })

                if (t && t.book && t.book.startTs){
                    let date = getDMY(t.book.startTs)
                    if (date.month === this.month && date.year === this.year){
                        if (!evs[date.day]){
                            evs[date.day] = []
                        }
                        if(evs[date.day].indexOf(t) === -1) {
                            evs[date.day].push(t)
                        }
                    }
                }
            })
        }
        return evs
    },
    card(){
        return this.$store.state.tasks[this.$store.state.hashMap[this.inId]]
    },
    todaysEvents(){
        let allTasks = []
        let level1 = []
        let level2 = []
        if (this.inId && this.card){
            level1 = this.card.subTasks.concat(this.card.priorities).concat(this.card.completed)
            level1.forEach( tId => {
                  let card = this.$store.state.tasks[this.$store.state.hashMap[tId]]
                  if (card){
                      level2 = level2.concat(card.priorities).concat(card.completed).concat(card.subTasks)
                  }
            })
            level2.forEach( tId => {
                  let card = this.$store.state.tasks[this.$store.state.hashMap[tId]]
                  if (card){
                      allTasks = allTasks.concat(card.priorities).concat(card.completed).concat(card.subTasks)
                  }
            })
            allTasks = allTasks.concat(level1).concat(level2)
        } else {
            allTasks = []
        }
        allTasks.push(this.inId)
        allTasks = _.uniq(allTasks)
        return allTasks
            .map(tId => {
                return this.$store.state.tasks[this.$store.state.hashMap[tId]]
            })
    },
    firstDay(){
      let date = new Date(this.year, this.month, 1)
      let firstDay = date.getDay()
      return firstDay
    },
    lastDay(){
        let date = new Date(this.year, this.month + 1, 0)
        let lastDay = date.getDay()
        return  6 - lastDay
    },
    days(){
      return  new Date(this.year, this.month + 1, 0).getDate()
    },
    monthName(){
        var mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return mL[this.month]
    }
  },
  data () {
    let current = new Date
    let year = current.getFullYear()
    let month = current.getMonth()
    return {
        DAYS_OF_WEEK:['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
        month,
        year,
    }
  },
}
</script>

<style lang='stylus' scoped>
@import '../styles/colours';

#calendar
    color: main

.dark
    background-color: main
    padding: .5em;
    border-radius: 50%;
    margin-right: .3em;
    height: 1.2em

.bg
    background: lightGrey
    padding: 0.33em
    border-radius: 3%

.menu
    cursor: pointer
    display: flex

.thirdy
    flex-grow: 1

.grey
    background-color: softGrey
    min-height: 500px
    color: main
    padding: 5px

.ptr
    cursor: pointer

.menu
    text-align: center
    color: main
    min-height: 3.3em
    padding-top: 1.6em

.calendar-column
    float: left
    box-sizing: border-box
    width: (100/7)%
    height: 100px
    border-style:solid
    border-width: 1px
    border-color: softGrey
.placeholder
    @extends .calendar-column
.day
    @extends .calendar-column
.weekday
    @extends .calendar-column
    height: 40px
    text-align: center
    font-weight:lighter
    font-size: 19px
    border-style:solid
    color:softGrey

.weekdayfull
    width: 100%
    height: 40px
    text-align: center
    font-weight:lighter
    font-size: 19px
    border-width: 1px
    border-style:solid
    color:softGrey
    cursor: pointer
    border-color: softGrey

.date
    background-color: white
    float: right
    font-weight: bolder
    font-size: .666em

.calmonth
    margin: 0 2% 2% 2%

.buffer
   clear: both
   height: 0.45em

.datenumber
    float: right
    font-weight: bolder
    font-size: 1.3em
    z-index: 5

.dot
    font-size: 1.9em
    color: softGrey

.dot:before
    content: "\2022";

img.completedcheckmark
    height: .99em

</style>
