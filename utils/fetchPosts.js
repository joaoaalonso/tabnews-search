const axios = require('axios')

function formatPosts(posts) {
    return posts.map(post => {
        return {
            id: post.id,
            slug: post.slug,
            title: post.title,
            status: post.status,
            created_at: post.created_at,
            owner_username: post.owner_username,
            tabcoins: post.tabcoins,
            children_deep_count: post.children_deep_count
        }
    })
}

function fecthPosts(page = 1, perPage = 100, strategy = 'old') {
    const url = `https://www.tabnews.com.br/api/v1/contents?page=${page}&per_page=${perPage}&strategy=${strategy}`
    return axios.get(url, { headers: { 'Accept-Encoding': 'application/json' } })
        .then(({ data }) => formatPosts(data))
}

module.exports = fecthPosts