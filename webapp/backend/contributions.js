const { ID_FIELD } = require('../../helpers/firestorm')
const contri = require('../../helpers/firestorm/contributions')
const users = require('../../helpers/firestorm/users')
const texture = require('../../helpers/firestorm/texture')

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
          const user_d_id = user[ID_FIELD]
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
    
    /** @type{import('../../helpers/firestorm').SearchOption[]} */
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
        const texture_ids = results.map(r => r.textureID)
        return Promise.all([results, texture.searchKeys(texture_ids)])
      })
      .then(results => {
        const contrib_results = results[0]
        const texture_result = results[1]

        let texture_found
        for(let i = 0; i < contrib_results.length; ++i) {
          texture_found = texture_result.filter(r => r[ID_FIELD] == contrib_results[i].textureID)[0]

          if(texture_found && texture_found.name) {
            contrib_results[i].textureName = texture_found.name
          }
        }

        return contrib_results
      })
  }
}
