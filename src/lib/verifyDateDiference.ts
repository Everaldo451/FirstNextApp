const dayTimeStamp = 60*60*24*1000
const weekTimeStamp = 7*dayTimeStamp
const monthTimeStamp = 30*dayTimeStamp

interface dateVerifier {
    timestamp: number,
    singular: string,
    plural: string
}

export function genericVerifyDateDiference(date:Date, verifier:dateVerifier, upVerifier:dateVerifier):[boolean, string|undefined] {

    const timestampDiference = Date.now() - date.getTime()

    const posteriorDiference = timestampDiference/upVerifier.timestamp
    if (posteriorDiference == 1) {
        return [true, `1 ${upVerifier.singular} ago.`]
    }
    if (posteriorDiference > 1) {
        return [false, undefined]
    }
    const dateDiference = Math.floor(timestampDiference/verifier.timestamp)
    return [true, `${dateDiference} ${verifier.plural} ago.`]
}

export function verifyDayDiference(date:Date):[boolean, string|undefined] {
    const [bool, value] = genericVerifyDateDiference(date, {
        timestamp: dayTimeStamp,
        singular: "day",
        plural: "days"
    },{
        timestamp: weekTimeStamp,
        singular: "week",
        plural: "weeks"
    })

    return [bool, value]
}

export function verifyWeekDiference(date:Date):[boolean, string|undefined] {
    
    const [bool, value] = genericVerifyDateDiference(date, {
        timestamp: weekTimeStamp,
        singular: "week",
        plural: "weeks"
    },{
        timestamp: monthTimeStamp,
        singular: "month",
        plural: "months"
    })

    return [bool, value]
}