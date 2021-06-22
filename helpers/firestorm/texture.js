const firestorm = require('.')
require('./firestorm_config')() 

/**
 * @typedef {Object} Texture
 * @property {String} name Texture friendly name
 * @property {Function} uses All texture uses
 * @property {Function} contributions All contributions for this texture
 * @property {Function} lastContribution Last contribution for this texture
 */

module.exports = firestorm.collection('textures', el => {
  /** @returns {Promise<import('./texture_use').TextureUse[]> */
  el.uses = function() {
    const texture_use = require('./texture_use')

    return texture_use.search([{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }])
  }
  
  /** @returns {Promise<import('./contributions').Contribution[]>} */
  el.contributions = function(res = undefined) {
    const contributions = require('./contributions')

    const s = [{
      field: 'textureID',
      criteria: '==',
      value: el[firestorm.ID_FIELD]
    }]
    
    if (res) s.push({
      field: 'res',
      criteria: '==',
      value: res
    })

    return contributions.search(s)
  }

  /** @returns {Promise<import('./contributions').Contribution>} */
  el.lastContribution = function(res) {
    return new Promise((resolve, reject) => {
      el.contributions(res)
      .then(res => {
        const contro = res.sort((a, b) => b.date - a.date)
        if(contro.length) {
          let objres = contro[0]
          resolve(objres)
        }

        resolve(undefined)
      })
      .catch(res => {
        reject(res)
      })
    })
    
  }

  /** @returns {String} */
  el.getURL = function(resolution, version = undefined) {
    return new Promise((resolve, reject) => {
      const texture_use = require('./texture_use')
      const settings    = require('../../ressources/settings')

      texture_use.search([{
        field: 'textureID',
        criteria: '==',
        value: el[firestorm.ID_FIELD]
      }]).then(res => {

        if (res.length > 0) {
          const edition = res[0].editions[0]
          res[0].paths().then(res => {
            
            let url = undefined
            if (res.length > 0) {

              if (edition == 'java') {
                if (version === undefined) version = res[0].versions[0]

                switch (resolution) {
                  case 'c32':
                    url = settings.COMPLIANCE_32X_JAVA_REPOSITORY_JAPPA + version + '/' + res[0].path
                    break
                  case 'c64':
                    url = settings.COMPLIANCE_64X_JAVA_REPOSITORY_JAPPA + version + '/' + res[0].path
                    break
                  default:
                    url = settings.DEFAULT_MC_JAVA_REPOSITORY + version + '/' + res[0].path
                    break
                }
              } else {
                if (version === undefined) version = res[0].versions[0]

                switch (resolution) {
                  case 'c32':
                    url = settings.COMPLIANCE_32X_BEDROCK_REPOSITORY_JAPPA + version + '/' + res[0].path
                    break
                  case 'c64':
                    url = settings.COMPLIANCE_64X_BEDROCK_REPOSITORY_JAPPA + version + '/' + res[0].path
                    break
                  default:
                    url = settings.DEFAULT_MC_BEDROCK_REPOSITORY + version + '/' + res[0].path
                    break
                }
              }

              resolve(url)

            } else reject('This texture does not have any path!')
            

          }).catch(res => reject(res))

        } else reject('This texture does not have any uses! ')

      }).catch(res => reject(res))
      
    })
  }

  return el
})