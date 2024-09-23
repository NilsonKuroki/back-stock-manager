import { failure, success, UNEXPECTED } from "@backend-stock-manager/core/src/schemas/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { completeNewPasswordCognito } from "@backend-stock-manager/core/cognito";

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(_evt.body || "{}")
    
    const inputCognito = {
      newPassword: body.newPassword,
      username: body.username,
      cognitoClient: process.env.cognitoClient,
      session: body.session
    }

    const response: any = await completeNewPasswordCognito(inputCognito, process.env.cognitoClient)
    return success(_evt, {
      message: "Success signin",
      response: response.AuthenticationResult?.IdToken
    })
  } catch (error: any) {
    return failure(_evt, UNEXPECTED)
  }
}