<template lang='pug'>
div
    .gridbox
        #my_dataviz
    .gridbox
      .grid
          .three.grid
              label radius
              input(v-model='radius')
          .three.grid
              label charge
              input(v-model='charge')
          .three.grid
              label width
              input(v-model='width')
          .three.grid
              label height
              input(v-model='height')
    .gridbox.centerer
            button(@click='drawVis') redraw

</template>

<script>
import * as d3 from 'd3'
import forceBoundary from 'd3-force-boundary'

export default {
  mounted() {
      this.drawVis()
  },
  data(){
      return {
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
                        name: t.name
                    }
                  })
                .forEach(x => nodes.push(x))
         nodes.push({
          id: contextMemberId,
          name: this.$store.getters.contextMember.name
        })
        }
        nodes.forEach(n => {
            let t = useMap(n.id)
            let source = n.id
            let subs = t.subTasks.concat(t.priorities)
            subs.forEach(target => {
                  if (useMap(target).deck.indexOf(contextMemberId) === -1) {
                      nodes.push({id: target})
                  }
                  links.push({
                      source,
                      target
                  })
            })
        })
        return { nodes, links }
    },
  },
  methods: {
    drawVis() {
      document.getElementById("my_dataviz").innerHTML = "";
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
        .style("stroke", "#E4F1F2")
      var node = this.svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", this.radius)
        .attr("data", d => {
            return d.id
        })
        .style("fill", d => {
            let card = useMap(d.id)
            if (card.deck.indexOf(this.$store.getters.contextMember.memberId) === -1){
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
        .force("collision", d3.forceCollide(this.radius + 1.7))
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
@import '../styles/grid'

label
    color: lightGrey

.centerer
    pointer-events: none;
    text-align: center;
    button
        pointer-events: all;
        width: 69%

</style>
