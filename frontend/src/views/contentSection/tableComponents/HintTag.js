import { makeStyles, Typography } from "@material-ui/core"

const useStyle = makeStyles(theme => ({
    timeHint: {

    }
}))

function HintTag(props) {
    return <Typography className={classes.timeHint}>{nextHour}:00</Typography>
}

export default HintTag