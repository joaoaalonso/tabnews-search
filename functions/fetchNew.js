const fecthPosts = require('../utils/fetchPosts')
const { savePosts, loadPosts } = require('../utils/s3')

module.exports.fetchNew = async (event) => {
    let posts = await loadPosts()
    let nextPage = 1
    let hasMore = true
    const lastPost = posts[posts.length - 1]

    let postsToAdd = []

    while(hasMore) {
        const recentPosts = await fecthPosts(nextPage, 100, 'new')
        const newPosts = []

        for (post of recentPosts) {
            if (post.id == lastPost.id) {
                hasMore = false
                break
            }
            newPosts.unshift(post)
        }   

        if (newPosts.length) {
            postsToAdd = newPosts.concat(postsToAdd)
            nextPage++
        }
    }

    if (postsToAdd.length) {
        posts = posts.concat(postsToAdd)
        await savePosts(posts)
        console.log(`Added ${postsToAdd.length} new posts`)
    } else {
        console.log(`Nothing to add`)
    }
}