function sortByRelevance(posts) {
    return posts.sort((a, b) => {
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

function sortByDate(posts) {
    return posts.sort((a, b) => {
        return new Date(b.published_at) - new Date(a.published_at)
    })
}

module.exports = {
    sortByRelevance,
    sortByDate
}