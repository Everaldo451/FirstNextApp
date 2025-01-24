const cookieStore:{[key:string]:[string, {[key:string]:any}]} = {}
const headerStore:{[key:string]:string} = {}

jest.mock("next/headers", () => ({
    cookies: {
        set: jest.fn(
            (name:string,value:string,config:{[key:string]:any})=>{
                cookieStore[name] = [value, config]
            }
        ),
        get: jest.fn(
            (name:string) => {
                const cookie = cookieStore[name]
                if (!cookie) {return undefined}
                return cookie[0]
            }
        )
    },
    headers: {
        get: jest.fn((name:string) => headerStore[name])
    }
}))

import { GET } from "@/app/api/auth/user/route"
import { cookies, headers } from "next/headers"

describe("User Get", () => {
    test("successfull", async () => {

    })
})