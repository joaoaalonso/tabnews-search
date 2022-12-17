const axios = require('axios')

const { savePosts } = require('../utils/s3')
const fetchPosts = require('../utils/fetchPosts')

module.exports.fetchAll = async (event) => {
    let posts = []
    let nextPage = 1
    let lastResultCount
    const start = new Date()
    
    do {
        const partialStart = new Date()
        console.log(`Getting page ${nextPage}`)

        const results = await fetchPosts(nextPage)
        lastResultCount = results.length
        posts = posts.concat(results)

        const partialEnd = new Date()
        const partialElapsedTime = partialEnd - partialStart
        console.log(`Fetched ${results.length} results from page ${nextPage} in ${partialElapsedTime}ms\n`)
        
        nextPage++
    } while(lastResultCount == 100)
    await savePosts(posts)
    
    const end = new Date()
    const elapsedTime = (end - start) / 1000
    console.log(`\nFetched a total of ${posts.length} results in ${elapsedTime}s`)
}