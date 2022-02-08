<template lang='pug'>
div
    #my_dataviz
    button(@click='drawVis') redraw
</template>

<script>
import * as d3 from 'd3'
var margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 40
  },
  width = 800 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

export default {
  mounted() {
      this.drawVis()
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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

      // Initialize the links
      var link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .style("stroke", "#fff")

      // Initialize the nodes
      var node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 20/5)
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
        .on("mouseover", function() {
            d3.select(this).transition()
              .duration(100)
              .attr("r", 20)
        })
        .on("mouseout", function() {
          d3.select(this).transition()
            .duration(1000)
            .attr("r", 20/5)
        })
        .on("click", d => {
            let taskId = d.target.getAttribute("data")
            this.$store.commit("rollStackPush", taskId)
            this.$store.commit("rollStackPush", taskId)

        })

      // Let's list the force we wanna apply on the network
      d3.forceSimulation(data.nodes) // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink() // This force provides links between nodes
          .id(function(d) {
            return d.id;
          }) // This provide  the id of a node
          .links(data.links) // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-5)) // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2)) // This force attracts nodes to the center of the svg area
        .on("end", ticked);

      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        link
          .attr("x1", function(d) {
            return d.source.x;
          })
          .attr("y1", function(d) {
            return d.source.y;
          })
          .attr("x2", function(d) {
            return d.target.x;
          })
          .attr("y2", function(d) {
            return d.target.y;
          });

        node
          .attr("cx", function(d) {
            return d.x + 1;
          })
          .attr("cy", function(d) {
            return d.y - 1;
          });
      }
    }
  }
}
</script>

<style lang="stylus" scoped>

circle
    cursor: pointer;

</style>
