const fs = require('fs')
const lyra = require('@lyrasearch/lyra')
const { loadPosts, loadDB } = require('./s3')
const { importInstance, restoreFromFile } = require('@lyrasearch/plugin-data-persistence')
const { hasUncaughtExceptionCaptureCallback } = require('process')

let _cachedDb
const CACHE_TIME_IN_MINUTES = 90

async function insertData(db) {
    const startA = new Date()
    const data = await loadPosts()
    const endA = new Date()
    console.log(`Data loaded in ${endA - startA}ms`)
    const startB = new Date()
    await lyra.insertBatch(db, data)
    const endB = new Date()
    console.log(`Data inserted in ${endB - startB}ms`)
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
        const startA = new Date()
        const dbData = await loadDB()
        const endA = new Date()
        console.log(`Data loaded in ${endA - startA}ms`)
        const startB = new Date()
        cachedDb = restoreFromFile('binary', dbData)
        const endB = new Date()
        console.log(`DB created in ${endB - startB}ms`)
        // const db = lyra.create({
        //     schema: {
        //         id: "string",
        //         slug: "string",
        //         title: "string",
        //         status: "string",
        //         published_at: "string",
        //         owner_username: "string",
        //         tabcoins: "number",
        //         children_deep_count: "number"
        //     },
        //     defaultLanguage: "portuguese"
        // })
        // cachedDb = await insertData(db)
        saveCachedDb(cachedDb)
    }
    return cachedDb
}

module.exports = getInstance