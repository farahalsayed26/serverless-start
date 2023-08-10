import { middyfy } from "../../../../libs/middleware";
//import { SQS } from "aws-sdk"
// import { ReceiveMessageCommand, SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"

// const sqs = new SQSClient({
//     region: 'us-east-1'
// });

export default async (event, context) => {
    event.Records.forEach(record => {
        const { body } = record;
        console.log("This is from slack:  ", record.messageId);
        console.log(body);
    });
    return {}
}
