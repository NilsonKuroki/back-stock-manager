export function success(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 200, body, headers, isBase64Encoded);
}
export function failure(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 500, body, headers, isBase64Encoded);
}

export function badRequest(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 400, body, headers, isBase64Encoded);
}

export function accessDenied(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 401, body, headers, isBase64Encoded);
}

export function conflict(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 409, body, headers, isBase64Encoded);
}
export function successList(evt: any, items: any, count: any, scannedCount: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 200, { items, count, scannedCount }, headers, isBase64Encoded);
}

export function notFound(evt: any, body: any, headers: any = {}, isBase64Encoded: boolean = false) {
    return buildResponse(evt, 404, body, headers, isBase64Encoded);
}
function buildResponse(evt: any, statusCode: number, body: any, headers: any, isBase64Encoded: boolean) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            ...headers
        },
        body: JSON.stringify(body),
        isBase64Encoded
    };
}