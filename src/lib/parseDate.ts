export const validateDate = (value:string):[boolean, number] => {
    const date = Date.parse(value)
    return [!isNaN(date), date]
}

export const numberToDate = (number:number) => {
    return new Date(number)
}