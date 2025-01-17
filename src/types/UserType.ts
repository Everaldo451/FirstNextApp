import { User } from "@prisma/client";

export type UserType = {
    name:User['name'],
    email:User['email']
}