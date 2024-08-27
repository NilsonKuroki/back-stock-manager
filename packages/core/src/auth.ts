import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

export const verifyUserAccess = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<boolean>  => {
    try {
        const groups: any = _evt.requestContext.authorizer.jwt.claims["cognito:groups"]
        if (groups && groups.includes("superAdministrators")) {
            return true
        }else {
            return false
        }
    } catch (error) {
        return false
    }
}