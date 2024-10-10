import { badRequest, failure, success, UNEXPECTED } from "@backend-stock-manager/core/schemas/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import {signinCognito} from "@backend-stock-manager/core/cognito"
import { signinSchema } from "@backend-stock-manager/core/schemas/validations/signinSchema"

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    const body = JSON.parse(_evt.body || "{}")

    const { error, value } = signinSchema.validate(body);
    if (error) {
      return badRequest(_evt, error)
    }
    
    const inputCognito = {
      username: value.username,
      password: value.password
    }
    const responseCognito = await signinCognito(inputCognito, process.env.cognitoClient)

    let response
    if(responseCognito.ChallengeName){
      response = {
        session: responseCognito.Session,
        challengeName: responseCognito.ChallengeName,
      }
    }else {
      response = { token: responseCognito.AuthenticationResult?.IdToken }
    }
    return success(_evt, {
      message: "Success signin",
      response: response
    })
  } catch (error: any) {
    return failure(_evt, UNEXPECTED)
  }
}