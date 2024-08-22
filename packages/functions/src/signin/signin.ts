import { failure, success } from "@backend-stock-manager/core/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { UNEXPECTED } from "@backend-stock-manager/core/errorTypes";
import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(_evt.body || "{}")

    const config = {}
    const client = new CognitoIdentityProviderClient(config);

    const input: any = {
      "AuthFlow": "USER_PASSWORD_AUTH",
      "AuthParameters": {
        "PASSWORD": body.password,
        "USERNAME": body.username
      },
      "ClientId": process.env.cognitoClient
    }
    const command = new InitiateAuthCommand(input);
    
    const response = await client.send(command);
    return success(_evt, {
      message: "Success signin",
      response: response.AuthenticationResult?.IdToken
    })
  } catch (error: any) {
    return failure(_evt, UNEXPECTED)
  }
}