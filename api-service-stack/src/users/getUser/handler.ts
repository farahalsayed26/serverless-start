import { middyfy } from "../../../../libs/middleware";
//import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
    region: 'us-east-1'
})

const client = new DynamoDBClient({
  region: 'us-east-1'
})
const docClient = DynamoDBDocumentClient.from(client);

export default middyfy(async (event) => {

    const { email } = event.pathParameters;

    const command = new QueryCommand({
    TableName: process.env.TABLE_NAME!,
    KeyConditionExpression: "#pk = :pk AND #sk = :sk",
    ExpressionAttributeNames: {
        "#pk": "pk", 
        "#sk": "sk",
    },
    ExpressionAttributeValues: {
      ":pk": "user",
      ":sk": email,
    }
  })

  const response = await docClient.send(command);

  const key = `${email}.jpg`

  const s3Command = new GetObjectCommand({
    Bucket: process.env.S3Bucket,
    Key: key
  })

  console.log(`${email}.jpg`)
  const profilePhoto = await s3Client.send(s3Command)
  console.log(profilePhoto)

  const url = `https://${process.env.S3Bucket}.s3.us-east-1.amazonaws.com/${key}`

  console.log(url)

  const body = {
    response: response.Items,
    url: url
  }

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  }
});