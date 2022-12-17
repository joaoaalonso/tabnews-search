const lyra = require('@lyrasearch/lyra')
const getInstance = require('../utils/db')

const resultsPerPage = 20

function formatResults(results) {
    return results.hits.map(result => result.document)
}

module.exports.search = async (event) => {
    const { term, page = 1 } = event.queryStringParameters || {}

    if (!term) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Termo inválido' }, null, 2),
          }
    }

    return getInstance()
        .then(instance => {
            return lyra.search(instance, {
                term,
                properties: ["title", "owner_username"],
                limit: resultsPerPage,
                offset: (page - 1) * resultsPerPage
            })
        })
        .then(formatResults)
        .then(results => {
            return {
                statusCode: 200,
                body: JSON.stringify(results, null, 2),
              }
        })
  }