const contri = require('../../helpers/firestorm/contributions')
const moment = require('moment')

module.exports = {
  stats: function() {
    return contri.read_raw()
      .then(res => {

        res = Object.values(res)

        let result = {
          totalTextures: 0,
          totalContributors: 0,
          totalContributions: res.length,
          contrib: []
        }

        const contributors = res.map(el => el.contributors).flat()
        const textures = res.map(el => el.textureID)
        let resolutions = res.map(el => el.res)
        resolutions.filter((el, index) => contributors.indexOf(el) === index)

        result.totalContributors = contributors.filter((el, index) => contributors.indexOf(el) === index).length
        result.totalTextures = textures.filter((el, index) => textures.indexOf(el) === index).length

        result.contrib = Object.values(res.reduce((ac, val) => {
          val.date = moment(new Date(val.date)).startOf('day').unix() * 1000

          if(!(val.date in ac)) {
            // start for date
            ac[val.date] = {
              date: val.date,
              res: {}
            }

            // start all res to 0
            resolutions.forEach(resval => {
              ac[val.date].res[resval] = 0
            })
          }

          ac[val.date].res[val.res]++

          return ac
        }, {}))

        result.contrib.sort((a, b) => a.date - b.date)

        console.log(result.contrib)

        return result
      })
  }
}