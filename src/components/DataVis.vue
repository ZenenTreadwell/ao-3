<template lang='pug'>
.datavisbox
    #my_dataviz
    //  .gridbox
    //    .grid
    //        .three.grid
    //            label radius
    //            input(v-model='radius')
    //        .three.grid
    //            label charge
    //            input(v-model='charge')
    //        .three.grid
    //            label width
    //            input(v-model='width')
    //        .three.grid
    //            label height
    //            input(v-model='height')
    //.gridbox.centerer
    //        button(@click='drawVis') redraw

</template>

<script>
import * as d3 from 'd3'
import forceBoundary from 'd3-force-boundary'
import _ from 'lodash'
import { crawler } from '../calculations.js'

export default {
  mounted() {
      setInterval( () => {
         if (this.renderTarget !== this.$store.getters.contextCard.taskId) this.drawVis()
      }, 7777)
  },
  data(){
      return {
          renderTarget: null,
          height: 800,
          width: 800,
          radius: 3.33,
          charge: -5.11,
          svg: null,
      }
  },
  computed: {
    mapData(){
        let nodes = [], links = []
        let useMap = (taskId) => this.$store.state.tasks[this.$store.state.hashMap[taskId]]
        let contextMemberId = this.$store.getters.contextMember.memberId
        if (contextMemberId) {
            this.$store.state.tasks
                .filter(t => t.deck.indexOf(contextMemberId) > -1)
                .map((t) => {
                    return {
                        id:  t.taskId,
                    }
                  })
                .forEach(x => nodes.push(x))
            nodes.push({
                id: contextMemberId,
            })
        } else {
            contextMemberId = this.$store.getters.member.memberId
            let contextTaskId = this.$store.getters.contextCard.taskId
            let localcontents = crawler(this.$store.state.tasks, contextTaskId) 
            this.$store.state.tasks.forEach( t => {
                if (t.subTasks.indexOf(contextTaskId) > -1 || t.priorities.indexOf(contextTaskId) > -1 || t.completed.indexOf(contextTaskId) > 1){
                    localcontents.push(t.taskId)
                }
            })
            localcontents.push(contextTaskId)
            _.uniq(localcontents).forEach(taskId => nodes.push({id: taskId}))
        }
        nodes.forEach(n => {
            let t = useMap(n.id)
            let source = n.id
            let subs = t.subTasks.concat(t.priorities).concat(t.completed)
            subs.forEach(target => {
                  links.push({
                      source,
                      target
                  })
            })
        })
        links.forEach(l => nodes.push({id: l.target}))
        let uniqNodes = _.uniq(nodes.map(n => n.id))
        nodes = uniqNodes.map(taskId => {
            return {"id": taskId}
        })
        return { nodes, links }
    },
  },
  methods: {
    drawVis() {
      document.getElementById("my_dataviz").innerHTML = "";
      this.renderTarget = this.$store.getters.contextCard.taskId
      this.svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
      var data = this.mapData
      console.log("drawing map with" , data.nodes.length, "nodes &", data.links.length, "links")
      let useMap = (taskId) => this.$store.state.tasks[this.$store.state.hashMap[taskId]]

      var link = this.svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", d => {
            let t = useMap(d.source)
            if (t.priorities.indexOf(d.target) > -1) return "#fcccd5"
            if (t.completed.indexOf(d.target) > -1) return "#abbcff"
            return "#E4F1F2"
        })
      var node = this.svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", d => {
            if (d.id === this.$store.getters.contextCard.taskId) return this.radius * 3.3 
            return this.radius
        })
        .attr("data", d => {
            return d.id
        })
        .style("fill", d => {
            let card = useMap(d.id)
            if (card.deck.indexOf(this.$store.getters.member.memberId) === -1){
                return "#E4F1F2"
            }
            switch(card.color){
                case "red": return "#ffb3b1";
                case "yellow": return "#FFFF99";
                case "green": return "#b3ffb3";
                case "purple": return "#b39ef7";
                case "blue": return "#79aeff";
            }
        })
        .style("cursor", "pointer")
        .on("mouseover", d => {
            d3.select(d.target)
              .transition()
              .duration(100)
              .attr("r", 20)
        })
        .on("mouseout", d => {
          d3.select(d.target).transition()
            .duration(1111)
            .attr("r", this.radius)
        })
        .on("click", d => {
            let taskId = d.target.getAttribute("data")
            this.$store.commit("rollStackPush", taskId)
        })
        // don't get how this is supposed to work (thinking with joins)
        //.exit().remove()

      d3.forceSimulation(data.nodes)
        .force("boundary", forceBoundary(this.radius, this.radius , this.width - this.radius, this.height - this.radius))
        .force("link", d3.forceLink().id( d => d.id).links(data.links))
        .force("charge", d3.forceManyBody().strength(this.charge))
        .force("center", d3.forceCenter(this.width / 2, 200).strength(1.337))
        .force("collision", d3.forceCollide( d => { 
            if (d.id === this.$store.getters.contextCard.taskId) return this.radius * 3.3 
            return this.radius + 1.77
        }))
        .on("end", () => {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          node
            .attr("cx", d => d.x + 1)
            .attr("cy", d => d.y - 1);
        })
    }
  }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'
.datavisbox
    position: relative
    text-align: center
label
    color: lightGrey

.centerer
    pointer-events: none;
    text-align: center;
    button
        pointer-events: all;
        width: 69%
        opacity: 0.4

</style>
