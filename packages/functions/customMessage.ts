import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (_evt: any) => {
  if (_evt.triggerSource === "CustomMessage_AdminCreateUser") {
    const message = `
      Você foi convidado para a plataforma da ${process.env.companyName}.
      \r\n\r\n
      Use o email de login com a senha temporária a seguir: ${_evt.request.codeParameter}
      \r\n\r\n
      Código de usuário: ${_evt.request.usernameParameter}
    `;
    _evt.response.emailMessage = message;
    _evt.response.emailSubject = "Bem vindo a " + process.env.companyName;
  }
  if (_evt.triggerSource === "CustomMessage_ForgotPassword") {
    const message = `Você solicitou uma redefinição de senha, seu código é: ${_evt.request.codeParameter}`;
    _evt.response.emailMessage = message;
    _evt.response.emailSubject = `Redefinição de senha da plataforma ${process.env.companyName}`;
  }
  return _evt;
}