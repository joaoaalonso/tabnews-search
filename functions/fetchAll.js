const { savePosts } = require('../utils/s3')
const fetchPosts = require('../utils/fetchPosts')

module.exports.fetchAll = async (event) => {
    let posts = []
    let nextPage = 1
    let lastResultCount
    
    do {
        const results = await fetchPosts(nextPage)
        lastResultCount = results.length
        posts = posts.concat(results)

        nextPage++
    } while(lastResultCount == 100)
    await savePosts(posts)
    console.log(`\nFetched a total of ${posts.length} results`)
}