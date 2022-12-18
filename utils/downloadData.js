const fs = require('fs')
const { loadPosts } = require('./s3')

loadPosts()
    .then(posts => {
        fs.writeFileSync('./posts.json', JSON.stringify(posts))
    })
