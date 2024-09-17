import { StackContext, Api, EventBus, Cognito, RDS } from "sst/constructs";
import { AccountRecovery, DateTimeAttribute } from "aws-cdk-lib/aws-cognito";
import { RemovalPolicy } from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";

export function API({ stack, app }: StackContext) {
  const cognito = new Cognito(stack, "Auth", {
    login: ["email"],
    triggers: {
      customMessage: {
        handler: "packages/functions/customMessage.handler",
        environment: { companyName: process.env.COMPANY_NAME || "" },
      }
    },
    cdk: {
      userPool: {
        userPoolName: `${app.stage}-${process.env.COMPANY_NAME}-UserPool`,
        selfSignUpEnabled: false,
        passwordPolicy: {
          minLength: 8
        },
        standardAttributes: {
          fullname: { required: true, mutable: true },
          email: { required: true, mutable: true },
          phoneNumber: { required: true, mutable: true }
        },
        customAttributes: {
          createdAt: new DateTimeAttribute()
        },
        autoVerify: {
          email: true
        },
        signInCaseSensitive: false,
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        removalPolicy: app.stage === "prod" ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      },
      userPoolClient: {
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true
        }
      }
    }
  });

  const clusterId = process.env.COMPANY_NAME + "db";

  const prodConfig: any = {
    autoPause: false,
    minCapacity: "ACU_2",
    maxCapacity: "ACU_64"
  };
  const devConfig: any = {
    autoPause: true,
    minCapacity: "ACU_2",
    maxCapacity: "ACU_2"
  };

  const cluster = new RDS(stack, clusterId, {
    engine: "postgresql13.12",
    defaultDatabaseName: "stockManager",
    migrations: "services/migrations",
    scaling: app.stage === "prod" ? prodConfig : devConfig,
  });

  const permissionCognitoIDP: any = new iam.PolicyStatement({
    actions: [ 
      'cognito-idp:CreateUserPoolClient', 
      "cognito-idp:AdminInitiateAuth", 
      "cognito-idp:AdminRespondToAuthChallenge",
      "cognito-idp:RespondToAuthChallenge",
      "cognito-idp:AdminGetUser",
      "cognito-idp:AdminCreateUser",
      "cognito-idp:GetGroup",
      "cognito-idp:CreateGroup",
      "cognito-idp:AdminAddUserToGroup"
    ],
    effect: iam.Effect.ALLOW,
    resources: [cognito.userPoolArn],
  })
  
  const client = cognito.cdk.userPool.addClient(process.env.COMPANY_NAME + "-client", {
    authFlows: {
      adminUserPassword: true,
      userPassword: true,
      userSrp: true,
    },
  });
  
  const api = new Api(stack, "api", {
    authorizers:{
      jwt: {
        type: "user_pool",
        userPool: {
          id: cognito.userPoolId,
          clientIds: [
            client.userPoolClientId
          ],
          region: process.env.REGION
        }
      }
    },
    defaults: {
      function: {
        bind: [cluster, cognito],
        environment: {
          clusterId,
          userPoolId: cognito.userPoolId,
          cognitoClient: client.userPoolClientId
        },
        permissions: [permissionCognitoIDP],
        timeout: 60
      },
      authorizer: "jwt"
    },
    routes: {
      "POST /auth/signin": {
        function: {
          handler: "packages/functions/src/auth/signin.handler"
        },
        authorizer: "none"
      },
      "POST /auth/signup": {
        function: {
          handler: "packages/functions/src/auth/signup.handler"
        },
        authorizer: "none"
      },
      "POST /auth/complete-new-password": {
        function: {
          handler: "packages/functions/src/auth/completeNewPassword.handler"
        },
        authorizer: "none"
      }
    },
  });


  stack.addOutputs({
    UserPoolId: cognito.userPoolId,
    IdentityPoolId: cognito.cognitoIdentityPoolId,
    UserPoolClientId: cognito.userPoolClientId,
    userPoolClientId: client.userPoolClientId,
    RDSClusterArn: cluster.clusterArn,
    RDSClusterEndpointHostname: cluster.clusterEndpoint.hostname,
    RDSClusterEndpointPort: cluster.clusterEndpoint.port.toFixed(0),
    RDSClusterSecretArn: cluster.secretArn,
    RDSClusterIdentifier: cluster.clusterIdentifier,
    APIURL: api.url,
  });
}
