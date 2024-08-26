import { failure, success } from "@backend-stock-manager/core/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { UNEXPECTED } from "@backend-stock-manager/core/errorTypes";
import { CognitoIdentityProviderClient, RespondToAuthChallengeCommand, RespondToAuthChallengeCommandOutput } from "@aws-sdk/client-cognito-identity-provider";
import { completeNewPasswordCognito } from "@backend-stock-manager/core/cognito";

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(_evt.body || "{}")
    
    const inputCognito = {
      newPassowrd: body.newPassword,
      username: body.username,
      cognitoClient: process.env.cognitoClient
    }
    const response: any = completeNewPasswordCognito(inputCognito, process.env.cognitoClient)
    return success(_evt, {
      message: "Success signin",
      response: response.AuthenticationResult?.IdToken
    })
  } catch (error: any) {
    console.log(error)
    return failure(_evt, UNEXPECTED)
  }
}