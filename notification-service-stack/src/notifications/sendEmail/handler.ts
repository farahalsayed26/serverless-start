export default async (event, context) => {
    event.Records.forEach(record => {
        const { body } = record;
        console.log("This is from email:  ", record.messageId);
        console.log(body);
    });
    return {}
}