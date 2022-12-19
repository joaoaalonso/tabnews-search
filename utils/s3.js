const S3SyncClient = require('s3-sync-client')
const { S3, S3Client } = require('@aws-sdk/client-s3')

const streamToString = require('./streamToString')

const REGION = 'us-east-1'
const BUCKET_NAME = 'tn-search'
const POSTS_FILE_NAME = 'posts.json'
const TAGS_FOLDER_NAME = 'tags'

function loadPosts() {
    const s3 = new S3({ region: REGION })

    const params = {
        Bucket: BUCKET_NAME,
        Key: POSTS_FILE_NAME
    }
    
    return new Promise((resolve, reject) => {
        s3.getObject(params, function (err, data) {
            if (err) {
                console.log(2)
                reject(err)
            } else {
                streamToString(data.Body)
                    .then(body => {
                        resolve(JSON.parse(body))
                    })
            }
        })
    })
}

async function savePosts(data) {
    const s3 = new S3({ region: REGION })
    const buffer = Buffer.from(JSON.stringify(data))
    
    const params = {
        Bucket: BUCKET_NAME,
        Key: POSTS_FILE_NAME,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'application/json'
    }

    return new Promise((resolve, reject) => {
        s3.putObject(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

async function syncTags(folderPath) {
    const s3Client = new S3Client({ region: REGION })
    const { sync } = new S3SyncClient({ client: s3Client });
    return sync(folderPath, `s3://${BUCKET_NAME}/${TAGS_FOLDER_NAME}`, { del: true });
}

module.exports = {
    savePosts,
    loadPosts,
    syncTags
}