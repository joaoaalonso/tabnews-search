const fs = require('fs')
const lyra = require('@lyrasearch/lyra')
const { loadPosts } = require('./s3')

let _cachedDb
const CACHE_TIME_IN_MINUTES = 60

function getPosts() {
    const FILE_NAME = './posts.json'
    if (fs.existsSync(FILE_NAME)) {
        console.log('Loading from filesystem')
        const posts = fs.readFileSync(FILE_NAME)
        return JSON.parse(posts)
    } else {
        console.log('Loading from S3')
        return loadPosts()
    }
}

async function insertData(db) {
    const data = await getPosts()
    await lyra.insertBatch(db, data)
    return db
}

function getCachedDb() {
    if (!_cachedDb) return
    const now = (new Date()).getTime()
    if (_cachedDb.expireAt > now) {
        return _cachedDb.db
    }
}

function saveCachedDb(db) {
    const expireAt = new Date()
    expireAt.setMinutes(expireAt.getMinutes() + CACHE_TIME_IN_MINUTES)
    _cachedDb = {
        db,
        expireAt: expireAt.getTime()
    }
}

async function getInstance() {
    let cachedDb = getCachedDb()
    if (!cachedDb) {
        const db = lyra.create({
            schema: {
                id: "string",
                slug: "string",
                title: "string",
                status: "string",
                published_at: "string",
                owner_username: "string",
                tabcoins: "number",
                children_deep_count: "number"
            },
            defaultLanguage: "portuguese"
        })
        cachedDb = await insertData(db)
        saveCachedDb(cachedDb)
    }
    return cachedDb
}

module.exports = getInstance