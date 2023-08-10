import { middyfy } from "../../../../libs/middleware";
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminInitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns"

const dbClient = new DynamoDBClient({
  region: 'us-east-1'
})
const docClient = DynamoDBDocumentClient.from(dbClient);

const cognitoClient = new CognitoIdentityProviderClient({
  region: 'us-east-1'
})

const snsClient = new SNSClient({
  region: 'us-east-1'
});

async function sendMessage() {


  const messageBody = JSON.stringify({
      message: "User Created",
      userStatus: [ "created" ]
  });

  const params: PublishCommandInput = {
      TopicArn: process.env.SNS_TOPIC,
      Message: messageBody, 
      // MessageAttributes: {
      //   userStatus: {
      //     DataType: 'String', 
      //     StringValue: "created"
      //   }
      // }
  }

  const message = new PublishCommand(params)

  if (message) {
      console.log("worked")
  }else {
      console.log("didnt work")
  }

  const response = await snsClient.send(message)
  console.log("This is response message id: ", response.MessageId)

  return {
      response
  }
}

export default middyfy(async (event) => {
  const { name, email, phoneNumber, password } = event.body;

  const dbCommand = new PutCommand({
    TableName: process.env.TABLE_NAME!,
    Item: {
      "pk": "user",
      "sk": email,
      "email": email,
      "name": name,
      "password": password,
      "phoneNumber": phoneNumber
    },
  })

  const response = await docClient.send(dbCommand);

  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: process.env.USER_POOL,
    Username: email, 
    UserAttributes: [
      {
        Name: "email",
        Value: email
      },
      {
        Name: "email_verified",
        Value: "true",
      },
    ],
    MessageAction: "SUPPRESS",
  })

  const setPassCommand = new AdminSetUserPasswordCommand({
    Password: password,
    UserPoolId: process.env.USER_POOL,
    Username: email, 
    Permanent: true,
  })

  const cognitoSend = await cognitoClient.send(createUserCommand);
  const userCreatedMessage = await sendMessage()

  console.log("This is message:",userCreatedMessage)

  if (cognitoSend) {
    await cognitoClient.send(setPassCommand);
  }
  console.log('This is result from cognito send', cognitoSend)

  const authCommand = new AdminInitiateAuthCommand({
    AuthFlow: "ADMIN_NO_SRP_AUTH",
    UserPoolId: process.env.USER_POOL,
    ClientId: process.env.USER_POOL_CLIENT,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  })

  const login = await cognitoClient.send(authCommand)
  console.log("This is login:", login)

  return {
    statusCode: 201,
    body: JSON.stringify(login)
  }
});