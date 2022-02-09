<template lang='pug'>
div
    #my_dataviz
    .centerer
        button(@click='drawVis') redraw
    .grid
        .three.grid
            label radius
        .three.grid
            label charge
        .three.grid
            label width
        .three.grid
            label height
    .grid
        .three.grid
            input(v-model='radius')
        .three.grid
            input(v-model='charge')
        .three.grid
            input(v-model='width')
        .three.grid
            input(v-model='height')
</template>

<script>
import * as d3 from 'd3'

export default {
  mounted() {
      this.drawVis()
  },
  data(){
      return {
          height: 800,
          width: 800,
          radius: 3.33,
          charge: -1.11
      }
  },
  methods: {
    drawVis() {
      document.getElementById("my_dataviz").innerHTML = "";
      console.log('drawing from ', this.$store.state.tasks.length, this.$store.getters.member.memberId)
      var nodesX = this.$store.state.tasks
        .filter(t => t.deck.indexOf(this.$store.getters.member.memberId) > -1)
        .map((t) => {
          return {
            id:  t.taskId,
            name: t.name
          }
        })
      nodesX.push({
          id: this.$store.getters.member.memberId,
          name: this.$store.getters.member.name
      })

      var linksX = []
      nodesX.forEach(n => {
        let t = this.$store.state.tasks[this.$store.state.hashMap[n.id]]
        let source = n.id
        let subs = t.subTasks.concat(t.priorities)//.concat(t.completed)
        subs.forEach(target => {
          if (this.$store.state.tasks[this.$store.state.hashMap[target]].deck.indexOf(this.$store.getters.member.memberId) > -1){
              linksX.push({
                source,
                target
              })
          }
        })
      })

      var data = {
        nodes: nodesX,
        links: linksX
      }
      console.log(data.nodes.length, 'nodes &', data.links.length, 'links')
      var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")

      var link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#E4F1F2")

      var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", this.radius)
        .attr("data", d => {
            return d.id
        })
        .style("fill", d => {
            switch(this.$store.state.tasks[this.$store.state.hashMap[d.id]].color){
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

      d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink().id( d => d.id).links(data.links)  )
        .force("charge", d3.forceManyBody().strength(this.charge).theta(0.5)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(this.width / 2, this.height / 2).strength(0.5)) // This force attracts nodes to the center of the svg area
        .force("collision", d3.forceCollide(this.radius + 1))
        // .tick(3)
        .on("end", ticked);

      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
          link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

          node
            .attr("cx", d => d.x + 1)
            .attr("cy", d => d.y - 1);
      }
    }
  }
}
</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/grid'

label
    color: lightGrey

.centerer
    text-align: center;
    button
        width: 69%

</style>
