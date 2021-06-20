const firestorm_users = require('../../helpers/firestorm/users')

module.exports = {
  userTypes: function() {
    return firestorm_users.read_raw()
      .then((users_array) => {
        // create array type
        let types = []
        Object.values(users_array).forEach(user => {
          types = [ ...types, ...(user.type || []) ]
        })

        // delete duplicates
        types = types.filter((t, index) => {
          return types.indexOf(t) == index && (types.indexOf(t.toLowerCase()) == -1 || types.indexOf(t.toLowerCase()) == index)
        })

        return types
      })
  },

  search: function(username, type) {
    /** @type{import('../../helpers/firestorm').SearchOption[]} */
    const searchOptions = [{
      field: 'username',
      criteria: 'includes',
      value: username || ''
    }]

    if(type)
      searchOptions.push({
        field: 'type',
        criteria: 'array-contains-any',
        value: [type, type.toLowerCase(), type.toUpperCase()]
      })

    return firestorm_users.search(searchOptions)
  },

  change: function(body) {
    const element_id = body.id

    const obj = {}
    const f_arr = ['username', 'type', 'uuid']
    f_arr.forEach(field_kept => {
      if(field_kept in body)
        obj[field_kept] = body[field_kept]
    })

    /** @type{import('../../helpers/firestorm').EditObject[]} */
    const edits = Object.keys(obj).map(field => {
      return {
        id: element_id,
        field: field,
        operation: 'set',
        value: obj[field]
      }
    })

    return firestorm_users.editFieldBulk(edits)
  },

  add: function(body) {
    const element_id = body.id

    const obj = {}
    const f_arr = ['username', 'type', 'uuid']
    f_arr.forEach(field_kept => {
      if(field_kept in body)
        obj[field_kept] = body[field_kept]
    })

    return firestorm_users.set(element_id, obj)
  },

  remove: function(user_id) {
    return firestorm_users.remove(user_id)
  }
}