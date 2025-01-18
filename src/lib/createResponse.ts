export default function createJsonResponse(message:string, status:number, adicionalData?:object) {
    const jsonData = adicionalData?{
        message: message,
        ...adicionalData
    }: {message:message}

    return new Response(JSON.stringify(jsonData),{
        headers: {
            'Content-Type':'application/json'
        },
        status:status
    })
}