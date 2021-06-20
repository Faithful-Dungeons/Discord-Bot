const { ID_FIELD } = require('../../helpers/firestorm')
const contri = require('../../helpers/firestorm/contributions')
const users = require('../../helpers/firestorm/users')

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
  search: function(contributors_id, resolutions) {
    /** @type{import('../../helpers/firestorm').SearchOption[]} */
    const searchOptions = [{
      field: 'contributors',
      criteria: 'array-contains-any',
      value: contributors_id
    }]

    if(resolutions) {
      searchOptions.push({
        field: 'res',
        criteria: 'in',
        value: resolutions
      })
    }

    return contri.search(searchOptions)
  }
}
