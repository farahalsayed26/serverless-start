import { middyfy } from "../../../../libs/middleware";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { PublishCommand, PublishCommandInput, SNSClient } from "@aws-sdk/client-sns"

const snsClient = new SNSClient({
    region: 'us-east-1'
  });

async function sendMessage() {


    const messageBody = JSON.stringify({
        message: "User Updated",
        userStatus: [ "updated" ]
    });
  
    const params: PublishCommandInput = {
        TopicArn: process.env.SNS_TOPIC,
        Message: messageBody, 
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


const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export default middyfy(async (event) => {
  const { email } = event.pathParameters;
  const { phoneNumber } = event.body;

  const command = new UpdateCommand({
    TableName: process.env.TABLE_NAME!,
    Key: { 
      "pk": "user", 
      "sk": email
    },
    UpdateExpression: "SET phoneNumber = :phoneNumber",
    ExpressionAttributeValues: {
        ":phoneNumber": phoneNumber,
    },
    ReturnValues: "UPDATED_NEW"
  })

  const response = await docClient.send(command);
  console.log({ event });

  const message = await sendMessage()

  console.log(message)
  
  return {
    statusCode: 200,
    body: JSON.stringify(response)
  }
});