import {
  CognitoIdentityProviderClient, AdminCreateUserCommand,
  AdminAddUserToGroupCommand, GetGroupCommand,
  CreateGroupCommand, AdminGetUserCommand,
  AdminDeleteUserCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { badRequest, conflict } from "@backend-stock-manager/core/src/responses";

export const signinCognito = async (value: any, cognitoClient: any) => {
  try {
    const config = {}
    const client = new CognitoIdentityProviderClient(config);

    const input: any = {
      "AuthFlow": "USER_PASSWORD_AUTH",
      "AuthParameters": {
        "USERNAME": value.username,
        "PASSWORD": value.password
      },
      "ClientId": cognitoClient
    }
    const command = new InitiateAuthCommand(input);
    
    const response = await client.send(command);

    return response
  } catch (error) {
    throw error
  }
}

export const completeNewPasswordCognito = async (value: any, cognitoClient: any) => {
  try {
    const config = {}
    const client = new CognitoIdentityProviderClient(config);

    const input: any = {
      "ChallengeName": "NEW_PASSWORD_REQUIRED",
      "ChallengeResponses": { 
        "NEW_PASSWORD": value.newPassword, 
        "USERNAME": value.username
      },
      "ClientId": cognitoClient,
      "Session": value.session,
   }
    const command = new RespondToAuthChallengeCommand(input);
    
    const response = await client.send(command);
    return response
  } catch (error) {
    throw error
  }
}

export const createUserCognito = async (_evt: any, value: any, userPoolId: string, userGroup: string) => {
  try {
    const clientCognito = new CognitoIdentityProviderClient({})
    let userCognitoExist = false
    try {
      const commandGetUser = new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: value.cpfCnpj
      });
      const userCognito = await clientCognito.send(commandGetUser);
      const userEmail: any = userCognito.UserAttributes?.find((atr) => atr.Name === "email")
      if (userEmail.Value !== value.email) {
        return conflict(_evt, { message: "conflict" })
      }
      userCognitoExist = true
    } catch (error) {
      userCognitoExist = false
    }
    let responseUserCognito: any

    if (userCognitoExist === false) {
      const command = await new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: value.cpfCnpj,
        UserAttributes: [
          {
            Name: "name",
            Value: value.name
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
          {
            Name: "email",
            Value: value.email
          },
          {
            Name: "phone_number",
            Value: `+55${value.mobilePhone}`
          },
          {
            Name: "preferred_username",
            Value: value.cpfCnpj
          }
        ],
        DesiredDeliveryMediums: ["EMAIL"],
        ForceAliasCreation: true
      })

      responseUserCognito = await clientCognito.send(command)

      let groupExist = false

      try {
        const paramsGetGroups = new GetGroupCommand({
          GroupName: userGroup,
          UserPoolId: userPoolId
        });
        await clientCognito.send(paramsGetGroups)
        groupExist = true
      } catch (error) {
        const paramsCreateGroup = new CreateGroupCommand({
          GroupName: userGroup,
          UserPoolId: userPoolId,
          Description: `group ${userGroup}`
        })
        await clientCognito.send(paramsCreateGroup)
        groupExist = true
      }
      if (groupExist) {
        const paramsAddToGroupUser = new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: responseUserCognito.User?.Username,
          GroupName: userGroup
        })
        await clientCognito.send(paramsAddToGroupUser)
      }
    }

    const subAttribute = responseUserCognito.User.Attributes.find((attribute: any) => attribute.Name === 'sub');
    const subValue = subAttribute ? subAttribute.Value : null;
    return { id: subValue }
  } catch (error: any) {
    return badRequest(_evt, { error: error })
  }
}

export async function deleteUserCognito(username: string, userPoolId: any) {
  const clientCognito = new CognitoIdentityProviderClient({})
  const paramsAddToGroupUser = new AdminDeleteUserCommand({
    UserPoolId: userPoolId,
    Username: username
  })
  await clientCognito.send(paramsAddToGroupUser)
}