const fs = require('fs')
const Rl = require('./Rl')
const Log = require('./Log')
let {
    isUndefined, 
    isFalse
} = require('./utils')

const createBlog = (dir, blogName) => {
    const blogFile = `${dir}/readme.md`
    const blogContent = `# ${blogName}`

    fs.mkdirSync(dir)
    fs.writeFileSync(blogFile, blogContent)
}

const initBlog = async (dir) => {
    const YOUR_BLOG_NAME = 'Your blog`s name is? '
    const INIT_YOUR_BLOG = 'Init blog folder —— '
    const BLOG_FOLDER_EXIST = 'The folder is existed'
    const blogName = await Rl(YOUR_BLOG_NAME, INIT_YOUR_BLOG)
    const blogFolderName = `${dir}/${blogName}`
    const isExist = fs.existsSync(blogFolderName) && Log(BLOG_FOLDER_EXIST)
    !isUndefined(isExist) && isFalse(isExist) && createBlog(blogFolderName, blogName)
}

module.exports = initBlog
