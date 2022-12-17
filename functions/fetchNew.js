const fecthPosts = require('../utils/fetchPosts')
const { savePosts, loadPosts } = require('../utils/s3')

module.exports.fetchNew = async (event) => {
    const start = new Date()

    let posts = await loadPosts()
    let nextPage = 1
    let hasMore = true
    const lastPost = posts[posts.length - 1]

    let postsToAdd = []

    while(hasMore) {
        const partialStart = new Date()

        console.log(`Getting page ${nextPage}`)
        const recentPosts = await fecthPosts(nextPage, 100, 'new')
        const newPosts = []

        for (post of recentPosts) {
            if (post.id == lastPost.id) {
                hasMore = false
                break
            }
            newPosts.unshift(post)
        }   

        const partialEnd = new Date()
        const partialElapsedTime = partialEnd - partialStart

        if (newPosts.length) {
            console.log(`Added ${newPosts.length} new posts on page ${nextPage} in ${partialElapsedTime}ms`)
            postsToAdd = newPosts.concat(postsToAdd)
            nextPage++
        } else {
            console.log(`Nothing to add`)
        }
    }

    if (postsToAdd.length) {
        posts = posts.concat(postsToAdd)
        await savePosts(posts)

        const end = new Date()
        const elapsed = end - start
        console.log(`\nTotal: Added ${postsToAdd.length} new posts in ${elapsed}ms`)
    }
}