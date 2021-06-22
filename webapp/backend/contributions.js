const contri       = require('../../helpers/firestorm/contributions')
const users        = require('../../helpers/firestorm/users')
const texture      = require('../../helpers/firestorm/texture')
const uses         = require('../../helpers/firestorm/texture_use')
const paths        = require('../../helpers/firestorm/texture_paths')
const firestorm    = require('../../helpers/firestorm/')
const { textureURL } = require('../../functions/textureURL')

module.exports = {
  resolutions: function() {
    return Promise.resolve(['c32', 'c64'])
  },
  authors: function() {
    return contri.read_raw()
      .then((res) => {
        const contribution_contributors = Object.values(res).map(el => el.contributors).flat()

        const occurences = {}
        contribution_contributors.forEach(d_id => {
          if(!occurences[d_id]) occurences[d_id] = 1
          else ++occurences[d_id]
        })

        return Promise.all([occurences, users.searchKeys(Object.keys(occurences))])
      }).then((values) => {
        const occurences = values[0]
        const searchResult = values[1]

        const result = []

        searchResult.forEach(user => {
          const user_d_id = user[firestorm.ID_FIELD]
          result.push({
            id: user_d_id,
            occurences: occurences[user_d_id],
            uuid: user.uuid,
            username: user.username
          })
        })

        result.sort((a, b) => b.occurences - a.occurences)

        return result
      })
  },
  search: function(contributors_arr, resolutions) {
    if(contributors_arr == undefined && resolutions == undefined)
      return Promise.reject(new Error('Search function parameters undefined'))
    
    /** @type {import('../../helpers/firestorm').SearchOption[]} */
    const searchOptions = [{
      field: 'contributors',
      criteria: 'array-contains-any',
      value: contributors_arr
    }]

    if(resolutions) {
      searchOptions.push({
        field: 'res',
        criteria: 'in',
        value: resolutions
      })
    }

    return contri.search(searchOptions)
      .then(results => {
        let texture_ids = results.map(r => r.textureID)
        texture_ids = texture_ids.filter((val, index) => index == texture_ids.indexOf(val)) // remove doublon

        let uses_promise = uses.search([{
          field: "textureID",
          criteria: "in",
          value: texture_ids
        }])

        return Promise.all([results, texture.searchKeys(texture_ids), uses_promise])
      })
      .then(results => {
        const contrib_results = results[0]
        const texture_results = results[1]
        let uses_results = results[2]

        // remove doublon
        const uses_object = uses_results.reduce((ag, cv) => {
          ag[cv.textureID] = cv
          return ag
        }, {})
        uses_results = Object.values(uses_object)

        let texture_found
        for(let i = 0; i < contrib_results.length; ++i) {
          texture_found = texture_results.filter(r => r[firestorm.ID_FIELD] == contrib_results[i].textureID)[0]

          if(texture_found && texture_found.name) {
            contrib_results[i].textureName = texture_found.name
          }
          contrib_results[i].edition = uses_object[contrib_results[i].textureID].editions[0]
          contrib_results[i].useID = uses_object[contrib_results[i].textureID][firestorm.ID_FIELD]
        }

        let uses_ids = uses_results.map(val => val[firestorm.ID_FIELD])
        let paths_promise = paths.search([{
          field: "useID",
          criteria: "in",
          value: uses_ids
        }])

        return Promise.all([contrib_results, paths_promise, uses_ids])
      })
      .then(results => {
        const contrib_results = results[0]
        const paths_results = results[1]
        const uses_ids = results[2]

        const path_object = paths_results.reduce((ag, cv) => {
          ag[cv.useID] = cv
          return ag
        }, {})
        
        let path, version
        contrib_results.forEach(contrib => {

          if (contrib.useID in path_object) {
            path = path_object[contrib.useID].path
            version = path_object[contrib.useID].versions[0]
            contrib.url = textureURL(contrib.edition, version, path, contrib.res)
          } else contrib.url = null

          delete contrib.edition
          delete contrib.useID
        })

        return contrib_results

      })
  }
}
