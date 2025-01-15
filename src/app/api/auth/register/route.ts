import { NextRequest, NextResponse } from "next/server";
import { User } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashData } from "@/lib/encryptData";
import { validateDate, numberToDate } from "@/lib/parseDate";
import createJsonResponse from "@/lib/createResponse";

export default async function POST(request:NextRequest){
    const {name, password, email, birthday} = await request.json()

    if (!name || !password || !email || !birthday) {
        return createJsonResponse("Invalid credentials.",400)
    }
    const [validDate, date] = validateDate(birthday)

    if (!validDate) {
        return createJsonResponse("Invalid birthday.",400)
    }

    const dateOfBirthday = numberToDate(date)

    try {
        const hashedPassword = hashData(password)

        await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                name: name,
                birthday: dateOfBirthday
            }
        })

        return createJsonResponse("User created successfull.", 200)
    }catch(error) {
        return createJsonResponse("Internal server Error.",500)
    }
}