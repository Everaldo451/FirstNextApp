import { createHash, getHashes } from "crypto"


export const hashData = (data:string) => {
    const algorithm = process.env.HASH_ALGORITHM
    
    if (algorithm) {
        return createHash(algorithm).update(data).digest('base64')
    }
    throw new Error("Invalid algorithm")
}