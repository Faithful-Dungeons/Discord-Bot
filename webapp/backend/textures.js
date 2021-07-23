const textures = require('../../helpers/firestorm/texture.js')

module.exports = {
  textures: function() {
    return textures.read_raw().catch(err => console.trace(err))
  },
  textureTypes: function () {
    return textures.read_raw()
      .then((textures) => {
        // create array type
        let types = []

        for (const textureID in textures) {
          if (Array.isArray(textures[textureID].type)) types = [ ...types, ...textures[textureID].type ]
        }

        // delete duplicates
        types = types.filter((t, index) => {
          return types.indexOf(t) == index && (types.indexOf(t.toLowerCase()) == -1 || types.indexOf(t.toLowerCase()) == index)
        })

        return types
      })
  },
  search: function(texture_name, texture_type) {
    if (!texture_name && !texture_type) return Promise.reject(new Error('Search function parameters undefined'))

    /** @type {import('../../helpers/firestorm').SearchOption[]} */
    const searchOptions = []

    if (texture_name != undefined) {
      searchOptions.push({
        field: 'name',
        criteria: 'includes',
        value: texture_name
      })
    }

    if (texture_type != undefined) {
      searchOptions.push({
        field: 'type',
        criteria: 'array-contains',
        value: texture_type
      })
    }

    return textures.search(searchOptions)
  }
}