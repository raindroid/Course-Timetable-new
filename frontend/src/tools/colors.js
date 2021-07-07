import * as colors from '@material-ui/core/colors';

const colorList = (colors => {
    let res = []
    for (const colorName in colors) {
        res.push({
            name: colorName,
            colors: colors[colorName]
        })
    }
    return res
}) (colors)

const getRandomColor = shade => {
    shade =  500
    return colorList[Math.floor(Math.random() * (colorList.length))].colors[shade]
}

export {
    colors,
    getRandomColor
}