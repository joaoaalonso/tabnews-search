const fs = require('fs')
const path = require('path')

const { sortByDate } = require('../utils/sort')
const tagsConfig = require('../utils/tagsConfig')
const { syncTags, loadPosts } = require('../utils/s3')

function getFilteredPosts(posts, tags) {
    const filteredPosts = {}
    Object.keys(tags).map(key => {
        const tag = tags[key]
        const filtered = sortByDate(posts).filter(post => {
            return tag.owner_username.some(user => post.owner_username == user) ||
                tag.title.some(title => post.title.toLowerCase().startsWith(title))
        })
    
        if (filtered.length) {
            filteredPosts[key] = filtered
        } 
    })
    return filteredPosts
}

function writeAvailableFile(availableTags, folder) {
    const availableFilePath = path.join(folder, 'available.json')
    fs.writeFileSync(availableFilePath, JSON.stringify(availableTags))
}

function writeFiles(posts, tags, tagsFolderPath) {
    const availableTags = []
    
    Object.keys(posts).map(tag => {
        availableTags.push({ name: tags[tag].name, slug: tag })
    
        const pageSize = 30
        const folderPath = path.join(tagsFolderPath, tag)
        fs.mkdirSync(folderPath, { recursive: true })
        const pageCount = Math.ceil(posts[tag].length / pageSize)
        
        for (let i = 0; i < pageCount; i++) {
            const page = posts[tag].slice(i, i + pageSize)
            const filePath = path.join(folderPath, `${i+1}.json`)
            fs.writeFileSync(filePath, JSON.stringify(page))
        }
    })
    writeAvailableFile(availableTags, tagsFolderPath)
}

module.exports.tags = async (event) => {
    const posts = await loadPosts()
    const filteredPosts = getFilteredPosts(posts, tagsConfig)
    const folderPath = '/tmp/tags'
    writeFiles(filteredPosts, tagsConfig, folderPath)
    await syncTags(folderPath)
    fs.rmSync(folderPath, { recursive: true, force: true })
}