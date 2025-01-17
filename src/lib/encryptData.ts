import { createHash, randomBytes } from "crypto"

function generateSalt(length:number=16) {
    return randomBytes(length).toString("hex")
}


export const hashData = (data:string, salt:string=generateSalt()) => {
    const algorithm = process.env.HASH_ALGORITHM
    
    if (!algorithm) {
        throw new Error("Invalid algorithm")
    }
    const hash = createHash(algorithm).update(salt + data).digest('base64')
    return `${salt}:${hash}`
}


export const getHashAndSalt = (data:string) => {
    try {
        const [salt, hash] = data.split(":",2)
        return [salt, hash]
    } catch(error) {
        return null
    }
}

export const validateHash = (data:string, hash:string) => {
    const hashGeneratedData = getHashAndSalt(hash)
    if (!hashGeneratedData) {
        return null
    }
    const [salt, hashValue] = hashGeneratedData

    const dataHashed = hashData(data, salt)
    if (dataHashed == hash) {return dataHashed}
    return null
}