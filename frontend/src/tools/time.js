const getTimeHour = time => {
    if (! time || time.indexOf(':') === -1) return 0
    const [hour, min] = time.split(':')
    return parseInt(hour) + parseInt(min) / 60.
}

export {
    getTimeHour
}