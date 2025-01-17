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

type decodedToken = jwt.JwtPayload|null
type tokenLocation = "cookie"|"header"

class JWTService {
    private secretKey:jwt.Secret;
    private configs:JWTServiceConfig
    private algorithm:jwt.Algorithm|undefined;

    constructor(
        accessTokenOptions: tokenOptions = {
            lifetime: 60*15,
            cookieOptions: {
                cookieName: "access_token"
            },
            type: "access_token"
        },
        refreshTokenOptions: tokenOptions = {
            lifetime: 60*60*24,
            cookieOptions: {
                cookieName: "refresh"
            },
            type: "refresh_token"
        },
        cookieOptions: globalCookieOptions = {
            secure:false,
            httpOnly:true,
        },
        headerOptions: headerOptionsType = {
            tokenHeaderName: "Authorization"
        },
        csrfOptions: csrfOptions = {
            cookieName: "csrf_token",
            headerName: "X-CSRF-Token"
        }
    ){

        this.configs = {
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

    getAccessTokenOptions() {
        return this.configs.accessTokenOptions
    }

    getRefreshTokenOptions() {
        return this.configs.refreshTokenOptions
    }

    createJWT(identity:string|number, tokenOptions:tokenOptions,) {

        const payload:{[key:string]:any}={
            sub: identity,
            token_type: tokenOptions.type,
        }

        const commonOptions:jwt.SignOptions = {
            algorithm: this.algorithm,
            jwtid: crypto.randomUUID(),
            expiresIn: tokenOptions.lifetime,
        }

        return jwt.sign(payload,this.secretKey,commonOptions)
    }

    createCSRFToken() {
        return randomBytes(64).toString('base64')
    }

    private setTokenCookie(identity:string|number, tokenOptions:tokenOptions, cookieStore:ReadonlyRequestCookies){
        const token = this.createJWT(identity, tokenOptions)

        cookieStore.set(tokenOptions.cookieOptions.cookieName,token,
            {maxAge: tokenOptions.lifetime, ...this.configs.cookieOptions}
        )
    }

    setAccessCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
        this.setTokenCookie(identity, this.configs.accessTokenOptions, cookieStore)
    }

    setRefreshCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
        this.setTokenCookie(identity, this.configs.refreshTokenOptions, cookieStore)
    }

    setCSRFCookie(csrfToken:string, cookieStore:ReadonlyRequestCookies) {
        cookieStore.set(this.configs.csrfOptions.cookieName,csrfToken,{
            httpOnly: true
        })
    }

    validateJWT(token:string, tokenOptions:tokenOptions):decodedToken {
        const verifyOptions:jwt.VerifyOptions = {
            clockTimestamp: Date.now(),
        }

        if (this.algorithm) {verifyOptions.algorithms?.push(this.algorithm)}

        try {
            const decoded = jwt.verify(token, this.secretKey, verifyOptions)

            if (typeof decoded !== "object" || !("sub" in decoded)) {
                throw new Error("Internal Error")
            }

            if (!decoded.token_type||decoded.token_type!==tokenOptions.type) {
                throw new Error("Invalid token type.")
            }
            return decoded as jwt.JwtPayload
        } catch(error) {
            return null
        }
    }

    validateCSRFToken(csrfToken:string, cookieStore:ReadonlyRequestCookies):string|null {
        const tokenInCookie = cookieStore.get(this.configs.csrfOptions.cookieName)
        if (!tokenInCookie || tokenInCookie.value!==csrfToken) {return null}
        
        return tokenInCookie.value
    }

    async validateRequest(request:NextRequest, location:tokenLocation="header", refresh:boolean=false) {
        const cookieStore = await cookies()
        const header = await headers()

        const csrfTokenInHeader = header.get(this.configs.csrfOptions.headerName)
        if (!csrfTokenInHeader) {return null}

        const csrfToken = this.validateCSRFToken(csrfTokenInHeader, cookieStore)
        if (!csrfToken) {return null}

        const tokenOptions = refresh?this.configs.refreshTokenOptions:this.configs.accessTokenOptions

        if (location=="header") {
            const jwtInHeader = header.get(this.configs.headerOptions.tokenHeaderName)
            if (!jwtInHeader) {return null}

            return this.validateJWT(jwtInHeader, tokenOptions)
        } else {
            const jwtInCookie = cookieStore.get(tokenOptions.cookieOptions.cookieName)
            if (!jwtInCookie) {return null}

            return this.validateJWT(jwtInCookie.value, tokenOptions)
        }
    }

    async getIdentity(request:NextRequest, location:tokenLocation="header", refresh:boolean=false) {
        const jwt = await this.validateRequest(request, location, refresh)

        return !jwt?null:Number(jwt.sub)
    }
}


const JWT = new JWTService();
export default JWT