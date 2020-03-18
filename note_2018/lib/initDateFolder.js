const fs = require('fs')

const initDateFolder = (dateFileName) => {
    const BLOG = 'blog'
    const dateFile = `${BLOG}/${dateFileName}`
    !fs.existsSync(dateFile) && fs.mkdirSync(dateFile)
    return dateFile
}

module.exports = initDateFolder
