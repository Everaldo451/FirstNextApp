import jwt from "jsonwebtoken"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { randomBytes } from "crypto"
import { cookies, headers } from "next/headers"
import { NextRequest } from "next/server"

interface tokenCookieOptions {
    cookieName:string
}

interface tokenOptions {
    lifetime: number,
    cookieOptions: tokenCookieOptions,
    type: string
}

interface globalCookieOptions {
    secure:boolean,
    httpOnly:boolean,
}

interface headerOptionsType {
    tokenHeaderName:string
}

interface csrfOptions {
    cookieName:tokenCookieOptions['cookieName'],
    headerName:string
}

interface JWTServiceConfig {
    accessTokenOptions: tokenOptions,
    refreshTokenOptions: tokenOptions,
    cookieOptions: globalCookieOptions,
    headerOptions: headerOptionsType,
    csrfOptions:csrfOptions
}

type decodedToken = jwt.JwtPayload
type tokenLocation = "cookie"|"header"
type tokenError = jwt.VerifyErrors|Error|null

class Config {
    private secretKey:jwt.Secret;
    public c:JWTServiceConfig
    private algorithm:jwt.Algorithm|undefined;

    constructor(
        accessTokenOptions: tokenOptions,
        refreshTokenOptions: tokenOptions,
        cookieOptions: globalCookieOptions,
        headerOptions: headerOptionsType,
        csrfOptions: csrfOptions
    ){

        this.c = {
            accessTokenOptions: accessTokenOptions,
            refreshTokenOptions: refreshTokenOptions,
            cookieOptions: cookieOptions,
            headerOptions: headerOptions,
            csrfOptions: csrfOptions
        }

        const secretKey = process.env.SECRET_KEY
        const algorithm = process.env.JWT_ALGORITHM

        if (!secretKey) {throw new Error("Invalid secret key")}
        this.secretKey = secretKey

        if (!(algorithm === "HS256" || algorithm === "HS384" || algorithm === "HS512" 
        || algorithm === "RS256" || algorithm === "RS384" || algorithm === "RS512" 
        || algorithm === "ES256" || algorithm === "ES384" || algorithm === "ES512" 
        || algorithm === "PS256" || algorithm === "PS384" || algorithm === "PS512" 
        || algorithm === "none")) {throw new Error("Invalid algorithm")}

        this.algorithm = algorithm
    }

    getAlgorithm() {
        return this.algorithm
    }

    getSecretKey() {
        return this.secretKey
    }
}

export const config = new Config(
    {
        lifetime: 60*15,
        cookieOptions: {
            cookieName: "access_token"
        },
        type: "access_token"
    },
    {
        lifetime: 60*60*24,
        cookieOptions: {
            cookieName: "refresh"
        },
        type: "refresh_token"
    },
    {
        secure:false,
        httpOnly:true,
    },
    {
        tokenHeaderName: "Authorization"
    },
    {
        cookieName: "csrf_token",
        headerName: "X-CSRF-Token"
    },
)

export function getAccessTokenOptions() {
    return config.c.accessTokenOptions
}

export function getRefreshTokenOptions() {
    return config.c.refreshTokenOptions
}

export function createJWT(identity:string|number, tokenOptions:tokenOptions,) {

    const payload:{[key:string]:any}={
        sub: identity,
        token_type: tokenOptions.type,
    }

    const commonOptions:jwt.SignOptions = {
        algorithm: config.getAlgorithm(),
        jwtid: crypto.randomUUID(),
        expiresIn: tokenOptions.lifetime,
    }

    return jwt.sign(payload,config.getSecretKey(),commonOptions)
}

export function createCSRFToken() {
    return randomBytes(64).toString('base64')
}

function setTokenCookie(identity:string|number, tokenOptions:tokenOptions, cookieStore:ReadonlyRequestCookies){
    const token = createJWT(identity, tokenOptions)

    cookieStore.set(tokenOptions.cookieOptions.cookieName,token,
        {maxAge: tokenOptions.lifetime, ...config.c.cookieOptions}
    )
}

export function setAccessCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
    setTokenCookie(identity, config.c.accessTokenOptions, cookieStore)
}

export function setRefreshCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
    setTokenCookie(identity, config.c.refreshTokenOptions, cookieStore)
}

export function setCSRFCookie(csrfToken:string, cookieStore:ReadonlyRequestCookies) {
    cookieStore.set(config.c.csrfOptions.cookieName,csrfToken,{
        httpOnly: true
    })
}

export function validateJWT(token:string, tokenOptions:tokenOptions):[decodedToken, tokenError] {
    const verifyOptions:jwt.VerifyOptions = {
        clockTimestamp: Date.now()/1000,
    }

    const algorithm = config.getAlgorithm()
    if (algorithm) {verifyOptions.algorithms?.push(algorithm)}

    let jwtToken:decodedToken={};
    let jwtError:tokenError=null

    jwt.verify(token, config.getSecretKey(), verifyOptions, (error, decoded) => {
        if (error) {
            jwtError=error
            return
        }
        if (typeof decoded !== "object" || !("sub" in decoded)) {
            jwtError=new Error("Internal Error")
            return
        }
    
        if (!decoded.token_type||decoded.token_type!==tokenOptions.type) {
            jwtError=new Error("Invalid token type.")
            return
        }

        jwtToken=decoded as jwt.JwtPayload
    })

    return [jwtToken, jwtError]
}

export function validateCSRFToken(csrfToken:string, cookieStore:ReadonlyRequestCookies):string|null {
    const tokenInCookie = cookieStore.get(config.c.csrfOptions.cookieName)
    if (!tokenInCookie || tokenInCookie.value!==csrfToken) {return null}
        
    return tokenInCookie.value
}

export async function validateRequest(request:NextRequest, location:tokenLocation="header", refresh:boolean=false) {
    const cookieStore = await cookies()
    const header = await headers()

    const csrfTokenInHeader = header.get(config.c.csrfOptions.headerName)
    if (!csrfTokenInHeader) {return new Error("Missing CSRF token.")}

    const csrfToken = validateCSRFToken(csrfTokenInHeader, cookieStore)
    if (!csrfToken) {return new Error("Invalid CSRF token.")}

    const tokenOptions = refresh?config.c.refreshTokenOptions:config.c.accessTokenOptions

    let jwToken, error;

    if (location=="header") {
        const jwtInHeader = header.get(config.c.headerOptions.tokenHeaderName)
        if (!jwtInHeader) {return new Error("Missing access token.")}

        [jwToken, error] = validateJWT(jwtInHeader, tokenOptions)
    } else {
        const jwtInCookie = cookieStore.get(tokenOptions.cookieOptions.cookieName)
        if (!jwtInCookie) {return new Error("Missing access token.")}

        [jwToken, error] = validateJWT(jwtInCookie.value, tokenOptions)
    }
    if (error) {return error}
    return jwToken
}

export async function getIdentity(request:NextRequest, location:tokenLocation="header", refresh:boolean=false) {
    const jwtOrError = await validateRequest(request, location, refresh)
    if (jwtOrError instanceof Error) {
        return jwtOrError
    }
    return Number(jwtOrError.sub)
}

