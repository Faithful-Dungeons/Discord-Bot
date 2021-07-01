/* global axios, d3, moment */
const ContributorModal = () => import('./contributor-modal.js')
const ContributorRemoveConfirm = () => import('./contributor-remove-confirm.js')

export default {
	name: 'contributor-page',
  components: {
    ContributorModal,
    ContributorRemoveConfirm
  },
	template: `
    <v-container>
      <div class="text-h4 py-4">
        Contributions stats
      </div>

      <div class="text-center mb-4">
        <div id="graph"></div>
      </div>

      <v-card>
        <v-container>
          <v-row class="text-center">
            <v-col>
              <h3>{{ totalTextures }}</h3>
              Textures
            </v-col>
            <v-col>
              <h3>{{ totalContributors }}</h3>
              Contributors
            </v-col>
            <v-col>
              <h3>{{ totalContributions }}</h3>
              Contributions
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-container>`,
	data() {
    return {
      totalTextures: 0,
      totalContributors: 0,
      totalContributions: 0,
      contrib: []
    }
	},
  methods: {
    getData: function() {
      axios.get('/contributions/stats')
      .then((response) => {
        const data = response.data

        this.totalTextures = data.totalTextures
        this.totalContributors = data.totalContributors
        this.totalContributions = data.totalContributions

        this.contrib = data.contrib
      })
      .catch(function (error) {
        console.error(error)
      })
      .finally(() => {
        this.buildGraph()
      })
    },

    buildGraph: function() {
      const width = 800, height = 500, spacing = 80, legendCellSize = 20

      let data = this.contrib

      // get all resolutions in provided
      const allRes = data.length === 0 ? [] : Object.keys(data[0].res).reverse()

      // flat data (because stacked data is dumb)
      data = this.contrib.map((el) => {
        allRes.forEach(res => {
          el[res] = el.res[res]
        })
        delete el.res
        el.date = new Date(el.date)
        return el
      })

      this.changeDates(data)

      // sort by date
      data.sort((a, b) => a.date - b.date)

      //first data are fucked
      data = data.slice(4)

      // Juanry first of 2021 is the Firestorm import with unknown dates to filter it too
      data = data.filter((d, index) => index != 4 && d.date != new Date('2021-01-01').getTime())

      const xScale = d3
        .scaleBand()
        .domain(data.map(d => d.date))
        .range([0, width - spacing])
        .padding(0.1)

      const yScale = d3
        .scaleLinear()
        .range([height - spacing, 0])

      // add center content inside svg
      const svg = d3.select(document.getElementById('graph')).append('svg')
        .attr('width', width).attr('height', height)
        .append("g")
          .attr("transform", "translate(" + spacing + "," + spacing / 4 + ")")

      // create default time format
      const timeFormat = d3.timeFormat("%b %d %Y")

      // add botom axis
      const domain = xScale.domain()
      const totalTicks = 8
      const diffVided = Math.round(domain.length / totalTicks)
      const values = domain.filter((el, index) =>  { return index == 0 || index == domain.length - 1 || index % diffVided == 0 })
      values.pop()
      const xAxis = d3.axisBottom(xScale)
        .tickValues(values)
        .tickFormat(timeFormat)
      
      svg.append("g")
        .attr("transform", "translate(0, " + (height - spacing) + ")")
        .call(xAxis)
        .selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.15em")
            .attr("dy", ".15em")
            .attr("transform", function() {
                return "rotate(-45)" 
            })

      // create stack data from
      const stack = d3.stack()
        .keys(allRes)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)
      
      const series = stack(data)

      // scale y
      if(series.length)
        yScale.domain([0, d3.max(series[series.length - 1], function(d) { return d[1]})])

      // add left axis
      svg.append('g')
        .call(d3.axisLeft(yScale))
      
      // const colors = ['#3a8fc5', '#76c945']
      const colors = ['#cccccc', '#333333']
      const groups = svg.selectAll("g.series")
        .data(series)
        .enter()
          .append('g')
          .attr("class", "series")
          .style("fill", (d, i) => colors[i%colors.length])

      groups.selectAll('rect')
        .data(d => d)
        .enter()
            .append("rect")
            .attr('x', d => xScale(d.data.date))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d[1]))
            .attr('height', d => height - spacing - yScale(d[1] - d[0]))

      let reverseColors = colors.reverse(); // Pour présenter les catégories dans le même sens qu'elles sont utilisées
      let reverseKeys = allRes.reverse();
  
      let legend = svg.append('g')
        .attr('transform-origin', 'top right')
        .attr('transform', 'translate(' + (width - 150) + ', 20)')
          
      // Pour chaque couleur, on ajoute un carré toujours positionné au même endroit sur l'axe X et décalé en fonction de la 
      // taille du carré et de l'indice de la couleur traitée sur l'axe Y
      legend.selectAll()
          .data(reverseColors)
          .enter().append('rect')
              .attr('height', legendCellSize + 'px')
              .attr('width', legendCellSize + 'px')
              .attr('x', 5)
              .attr('y', (d,i) => i * legendCellSize)
              .style("fill", d => d);
      
      // On procéde de la même façon sur les libellés avec un positionement sur l'axe X de la taille des carrés 
      // à laquelle on rajoute 10 px de marge
      legend.selectAll()
          .data(reverseKeys)
          .enter().append('text')
              .attr("transform", (d,i) => "translate(" + (legendCellSize + 10) + ", " + (i * legendCellSize) + ")")
              .attr("dy", legendCellSize / 1.6) // Pour centrer le texte par rapport aux carrés
              .style("font-size", "13px")
              .style("fill", "grey")
              .text(d => d);
    },

    changeDates: function(data) {
      const dayArray = []

      const lastDay = moment("2021-03-30")
      let day = moment("2020-08-01")

      const secondsPerMinute = 60
      const secondsPerHour = 60 * secondsPerMinute
      const secondsPerDay = 24 * secondsPerHour
      const secondsPerMonth = 30.146 * secondsPerDay
      const secondsPerYear = 365 * secondsPerDay

      while(day.diff(lastDay) != 0) {
        const stringDay = day.format("YYYY-DD-MM")
        const badDaySplit = stringDay.split('-').map(el => parseInt(el))
        const time = (badDaySplit[0] - 1970) *secondsPerYear + (badDaySplit[1] - 1)*secondsPerMonth + badDaySplit[2]*secondsPerDay
        dayArray.push({
          oriDate: new Date(day.unix()*1000),
          ori: day.unix(),
          final: moment(stringDay).unix() || time
        })
        day.add(1, 'day')
      }

      const now = Date.now()
      data.forEach(d => {
        if(d.date > now) {
          let m = moment(d.date).startOf('day').unix()
          let matches = dayArray.filter(el => Math.abs(el.final - m) < secondsPerMonth)
          matches.sort((a, b) => Math.abs(a.final - m) - Math.abs(b.final - m))
          if(matches.length) {
            d.date = matches[0].oriDate
          }
        }
      })
    }
  },
  mounted: function() {
    // best method to do it unfortunatley
    const d3script = document.createElement('script')
    d3script.setAttribute('src', 'https://cdn.jsdelivr.net/combine/npm/d3@7,npm/moment@2')
    document.head.appendChild(d3script)

    d3script.addEventListener('load', () => {
      this.getData()
    })
  }
}