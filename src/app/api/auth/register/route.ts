import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";
import { validateDate, numberToDate } from "@/lib/parseDate";
import { cookies } from "next/headers";
import Joi from "joi";
import createJsonResponse from "@/lib/createResponse";
import JWT from "@/services/JWTService";
import { passwordRegex } from "../regex";

const schema = Joi.object({
    name: Joi.string()
        .min(5)
    ,
    email: Joi.string()
        .email({maxDomainSegments:2})
    ,
    password: Joi.string()
        .min(8)
        .pattern(passwordRegex)
    ,
    birthday: Joi.string()
})

export async function POST(request:NextRequest){
    const formData = await request.formData()

    const data = {
        email: formData.get("email"),
        name: formData.get("name"),
        password: formData.get("password"),
        birthday: formData.get("birthday")
    }
    const {value, error} = schema.validate(data)
    if (error) {return createJsonResponse("Invalid credentials.",400)}

    const [validDate, date] = validateDate(value.birthday)
    if (!validDate) {return createJsonResponse("Invalid birthday.",400)}

    const dateOfBirthday = numberToDate(date)

    try {
        const hashedPassword = hashData(value.password)
        console.log(value)

        const user = await prisma.user.create({
            data: {
                email: value.email,
                password: hashedPassword,
                name: value.name,
                birthday: dateOfBirthday
            }
        })

        const cookieStore = await cookies()
        JWT.setAccessCookie(user.id, cookieStore)
        JWT.setRefreshCookie(user.id, cookieStore)
        JWT.setCSRFCookie(
            JWT.createCSRFToken(),
            cookieStore
        )
        return createJsonResponse("User created successfull.", 200,{
            user: {name: user.name, email: user.email}
        })
    }catch(error) {
        console.log(error)
        return createJsonResponse("Internal server error.",500)
    }
}