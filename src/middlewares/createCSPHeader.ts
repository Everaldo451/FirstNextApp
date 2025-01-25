import { NextRequest } from "next/server";

export default function createCSPHeader(request:NextRequest):[string, Headers] {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    const NODE_ENV = process.env.NODE_ENV
    const CSPHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${NODE_ENV!="production"?"'unsafe-eval'":""};
        style-src 'self' 'nonce-${nonce}';
        font-src 'self';
        object-src 'none';
        base-uri 'self';
    `
  
    const CSPHeaderValue = CSPHeader
        .replace(/\s{2,}/g, ' ')
        .trim()
 
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
 
    requestHeaders.set(
        'Content-Security-Policy',
        CSPHeaderValue
    )
    return [CSPHeaderValue, requestHeaders]
}