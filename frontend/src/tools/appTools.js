const getFirstStartup = () => {
    const first = localStorage.getItem("last-used") | false
    localStorage.setItem("last-used", Date.now())
    return !Boolean(first)
}

export {
    getFirstStartup
}