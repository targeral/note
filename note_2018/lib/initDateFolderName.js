const initDateFolderName = () => {
    const date = new Date()
    const year = date.getFullYear()
    const _month = date.getMonth() + 1
    const _day = date.getDate()
    const month = _month > 10 ? _month : `0${_month}`
    const day = _day > 10 ? _day : `0${_day}`

    return `${year}${month}${day}`
}

module.exports = initDateFolderName
