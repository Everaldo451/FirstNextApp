const numbersInPassword = /(?=\D*\d)/
const lettersInPassword = /(?=([^a-zA-Z]*[a-zA-Z]){5,})/
const upperCaseLettersInPassword = /(?=[^A-Z]*[A-Z])/
const nonAlfaNumericInPassword = /(?=[\w]*[\W])/
const nonBackSpaceInPassword = /(?=\S{8,})/

export const passwordRegex = new RegExp(
    numbersInPassword.source + 
    lettersInPassword.source + 
    upperCaseLettersInPassword.source +
    nonAlfaNumericInPassword.source +
    nonBackSpaceInPassword.source
)