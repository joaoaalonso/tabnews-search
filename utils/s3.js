const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')

const BUCKET_NAME = 'tn-search'
const POSTS_FILE_NAME = 'posts.json'

function getS3() {
    return new AWS.S3({
        Bucket: BUCKET_NAME
    })
}

function loadDB() {
    const s3 = getS3()

    const params = {
        Bucket: BUCKET_NAME,
        Key: 'db.msp'
    }

    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, 'db.msp')
        s3.getObject(params, function (err, data) {
            if (err) {
                reject(err)
            } else {
                fs.writeFileSync(dbPath, data.Body)
                resolve(dbPath)
            }
        })
    })
}

function loadPosts() {
    const s3 = getS3()

    const params = {
        Bucket: BUCKET_NAME,
        Key: POSTS_FILE_NAME
    }

    return new Promise((resolve, reject) => {
        s3.getObject(params, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(JSON.parse(data.Body))
            }
        })
    })
}

async function savePosts(data) {
    const s3 = getS3()
    const buffer = Buffer.from(JSON.stringify(data))
    
    const params = {
        Bucket: BUCKET_NAME,
        Key: POSTS_FILE_NAME,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'application/json'
    }

    return new Promise((resolve, reject) => {
        s3.upload(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

module.exports = {
    savePosts,
    loadPosts,
    loadDB
}