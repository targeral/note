const readline = require('readline')
const Log = require('./Log')

const Rl = (question, answerPrfix = '') => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve, reject) => {
        rl.question(question, answer => {
            Log(`${answerPrfix}${answer}`)
            rl.close()
            resolve(answer)
        })
    })
}

module.exports = Rl
