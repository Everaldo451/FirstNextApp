import jwt from "jsonwebtoken"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"

type decodedToken = jwt.JwtPayload|jwt.Jwt|undefined|string
interface JWTServiceConfig {
    accessTokenLifeTime:number, 
    refreshTokenLifeTime:number,
    cookieOptions: {
        accessTokenCookieName?:string,
        refreshTokenCookieName:string,
        tokenCookieSecure:boolean,
        tokenCookieHttpOnly:boolean,
    },
    headerOptions?: {
        tokenHeaderName:string
    }
}

class JWTService {
    private configs:JWTServiceConfig
    private secretKey:jwt.Secret;
    private algorithm:jwt.Algorithm|undefined;

    constructor(configs:JWTServiceConfig = {
        accessTokenLifeTime: 60*15,
        refreshTokenLifeTime: 60*60*24,
        cookieOptions: {
            accessTokenCookieName:"access_token",
            refreshTokenCookieName:"refresh_token",
            tokenCookieSecure:false,
            tokenCookieHttpOnly:false,
        },
        headerOptions: {
            tokenHeaderName: "Authorization"
        }
    }){

        if (!configs.cookieOptions && !configs.headerOptions) {
            throw new Error("cookie options or header options are required")
        }
        this.configs = configs

        const secretKey = process.env.SECRET_KEY
        const algorithm = process.env.JWT_ALGORITHM

        if (!secretKey) {throw new Error("Invalid secret key")}
        this.secretKey = secretKey

        if (!this.verifyAlgorithm(algorithm)) {throw new Error("Invalid algorithm")}
        this.algorithm = algorithm
    }

    private verifyAlgorithm(algorithm:string|undefined): algorithm is jwt.Algorithm {
        return algorithm === "HS256" || algorithm === "HS384" || algorithm === "HS512" 
        || algorithm === "RS256" || algorithm === "RS384" || algorithm === "RS512" 
        || algorithm === "ES256" || algorithm === "ES384" || algorithm === "ES512" 
        || algorithm === "PS256" || algorithm === "PS384" || algorithm === "PS512" 
        || algorithm === "none"
    }

    generateToken(identity:string|number, typ:"access"|"refresh"="access") {

        const payload:{[key:string]:any}={
            sub: identity
        }

        const commonOptions:jwt.SignOptions = {
            algorithm: this.algorithm,
            jwtid: crypto.randomUUID(),
        }

        if (typ==="access") {
            commonOptions.expiresIn = this.configs.accessTokenLifeTime
            payload.token_type = "access_token"
        } else if (typ==="refresh") {
            commonOptions.expiresIn = this.configs.refreshTokenLifeTime
            payload.token_type = "refresh_token"
        }

        return jwt.sign(payload,this.secretKey,commonOptions)
    }

    validateToken(token:string, typ:"access"|"refresh"="access"):decodedToken {
        const commonOptions:jwt.VerifyOptions = {
            clockTimestamp: Date.now(),
        }

        if (this.algorithm) {commonOptions.algorithms?.push(this.algorithm)}

        try {
            const decoded = jwt.verify(token, this.secretKey, commonOptions)

            if (typeof decoded !== "object" || !("sub" in decoded)) {
                throw new Error("Internal Error")
            }

            if (!decoded.token_type||decoded.token_type!==typ) {
                throw new Error("Invalid token type.")
            }
            return decoded as jwt.JwtPayload
        } catch(error) {
            return undefined
        }
    }

    private setTokenCookie(
        identity:string|number, 
        typ:"access"|"refresh", 
        cookieStore:ReadonlyRequestCookies
    ){
        let key;
        let lifetime;

        if (typ=="access") {
            if (!this.configs.cookieOptions.accessTokenCookieName) {return}
            key = this.configs.cookieOptions.accessTokenCookieName
            lifetime = this.configs.accessTokenLifeTime
        } else {
            key = this.configs.cookieOptions.refreshTokenCookieName
            lifetime = this.configs.refreshTokenLifeTime
        }

        const token = this.generateToken(identity, typ)

        cookieStore.set(key,token,
            {expires: Date.now() + lifetime}
        )

        return token
    }

    setAccessCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
        this.setTokenCookie(identity, "access", cookieStore)
    }

    setRefreshCookie(identity:string|number, cookieStore:ReadonlyRequestCookies) {
        this.setTokenCookie(identity, "refresh", cookieStore)
    }

    private setTokenHeader (token:string, headers:ReadonlyHeaders) {
    }

}


const jwtServiceInstance = new JWTService();
export default jwtServiceInstance