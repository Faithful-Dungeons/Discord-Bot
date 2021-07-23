const textures = require('../../helpers/firestorm/texture.js')

module.exports = {
  textures: function() {
    return textures.read_raw().catch(err => console.trace(err))
  },
  textureTypes: function () {
    return textures.read_raw()
      .then((textures) => {
        // create array type
        let types = [ "BL" ]

        for (const textureID in textures) {
          types = [ ...types, ...textures[textureID].type ]
        }

        console.log(types)

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
    const searchOptions = [{
      field: 'name',
      criteria: 'includes',
      value: texture_name
    }]

    if (texture_type) {
      searchOptions.push({
        field: 'types',
        criteria: 'array-contains-any',
        value: texture_type
      })
    }

    return textures.search(searchOptions)
  }
}