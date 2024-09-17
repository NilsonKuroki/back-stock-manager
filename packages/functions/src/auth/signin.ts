import { failure, success } from "@backend-stock-manager/core/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { UNEXPECTED } from "@backend-stock-manager/core/errorTypes";
import {signinCognito} from "@backend-stock-manager/core/cognito"

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(_evt.body || "{}")

    const inputCognito = {
      username: body.username,
      password: body.password
    }
    const responseCognito: any = await signinCognito(inputCognito, process.env.cognitoClient)

    let response
    if(responseCognito.ChallengeName){
      response = {
        session: responseCognito.Session,
        challengeName: responseCognito.ChallengeName,
      }
    }else {
      response = responseCognito.AuthenticationResult?.IdToken
    }
    return success(_evt, {
      message: "Success signin",
      response: response
    })
  } catch (error: any) {
    return failure(_evt, UNEXPECTED)
  }
}