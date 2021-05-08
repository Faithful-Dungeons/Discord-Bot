const firestorm = require('.')
const texture_use = require('./texture_use')

require('./firestorm_config')()

/**
 * @typedef {Object} TexturePath
 * @property {Number} useID
 * @property {String} path
 * @property {String} edition
 * @property {String[]} versions
 * @property {Function} use
 * @property {Function} texture
 */

module.exports = firestorm.collection('users', el => {
  /** @returns {Promise<import('./texture_use').TextureUse>} */
  el.use = function() {
    return texture_use.get(el.useID)
  }

  /** @returns {Promise<import('./texture').Texture>} */
  el.texture = function() {
    return new Promise((resolve, reject) => {
      el.use()
      .then(use => {
        return resolve(use.texture())
      })
      .catch(err => {
        reject(err)
      })
    })
    
  }
  return el
})