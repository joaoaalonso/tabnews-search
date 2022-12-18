const lyra = require('@lyrasearch/lyra')
const getInstance = require('../utils/db')

const resultsPerPage = 20

function formatResults(results) {
    return results.hits.map(result => result.document)
}

function sortResults(results) {
    return results.sort((a, b) => {
        if (b.tabcoins > a.tabcoins) {
            return 1
        } else if (b.tabcoins < a.tabcoins) {
            return -1
        } else if (b.children_deep_count > a.children_deep_count) {
            return 1
        } else if (b.children_deep_count < a.children_deep_count) {
            return -1
        } else {
            return 0
        }
    })
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
        .then(sortResults)
        .then(results => {
            return {
                statusCode: 200,
                body: JSON.stringify(results, null, 2),
              }
        })
  }