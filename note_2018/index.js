const initDateFolderName = require('./lib/initDateFolderName')
const initDateFolder = require('./lib/initDateFolder')
const initBlog = require('./lib/initBlog')

const dateFolderName = initDateFolderName()
const folder = initDateFolder(dateFolderName)
initBlog(folder)
