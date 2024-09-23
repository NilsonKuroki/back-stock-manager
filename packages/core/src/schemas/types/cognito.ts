export interface CognitoSigninParams {
    username: string,
    password: string
}

export interface CognitoCompleteNewPasswordParams {
    username: string,
    session: string,
    newPassword: string,
}

export interface CognitoSignupParams {
    name: string,
    document: string,
    email: string,
    mobilePhone: string,
}

export interface CognitoSignupSuccessResponse {
    id: string
}

export type CognitoSignupResponse = CognitoSignupSuccessResponse | Error