import { prisma } from "./db"
import { User } from "@prisma/client"
import { hashData } from "./encryptData"

export default async function loginUser(email:string, password:string):Promise<User|null> {
    const user = await prisma.user.findFirst({
        where: {
            email: {
                equals: email
            }
        }
    })

    if (!user) {return null}

    const hashedPassword = hashData(password)
    if (user.password == hashedPassword) {return user}
    
    return null
}