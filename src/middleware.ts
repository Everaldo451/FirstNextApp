import { NextRequest, NextResponse } from 'next/server'
import createCSPHeader from './middlewares/createCSPHeader'
 
export function middleware(request: NextRequest) {

  const [CSPHeaderValue, requestHeaders] = createCSPHeader(request)
 
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set(
    'Content-Security-Policy',
    CSPHeaderValue
  )
 
  return response
}

export const config = {
    matcher: [
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        missing: [
          { type: 'header', key: 'next-router-prefetch' },
          { type: 'header', key: 'purpose', value: 'prefetch' },
        ],
      },
    ],
  }