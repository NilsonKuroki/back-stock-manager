import { accessDenied, badRequest, failure, success } from "@backend-stock-manager/core/responses"
import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from "aws-lambda";
import { UNEXPECTED } from "@backend-stock-manager/core/errorTypes";
import { signupUserCognito } from "@backend-stock-manager/core/cognito";
import { signupSchema } from "@backend-stock-manager/core/schemas/signup"
import { verifyUserAccess } from "@backend-stock-manager/core/auth"

export const handler = async (_evt: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  try {
    // const userCanAccess = await verifyUserAccess(_evt)
    // if (!userCanAccess) {
    //   return accessDenied(_evt, "Not authorized")
    // }

    const body = JSON.parse(_evt.body || "{}")
    const { error, value } = signupSchema.validate(body);
    if (error) {
      return badRequest(_evt, error)
    }
    const inputCognito = {
      name: value.name,
      password: value.password,
      document: value.document,
      email: value.email,
      phoneNumber: value.phoneNumber,
      group: value.group
    }
    
    const response = await signupUserCognito(_evt, inputCognito, process.env.userPoolId)
    return success(_evt, {
      message: "Success signup",
      response: response
    })
  } catch (error: any) {
    return failure(_evt, UNEXPECTED)
  }
}