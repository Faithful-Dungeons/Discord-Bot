const contri = require('../../helpers/firestorm/contributions')

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

        return result
      })
  }
}