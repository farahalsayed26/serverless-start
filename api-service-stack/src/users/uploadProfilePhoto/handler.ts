import { middyfy } from "../../../../libs/middleware";
import { fileTypeFromBuffer } from "file-type";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

//const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];

const client = new S3Client({
    region: 'us-east-1'
})
export default middyfy(async (event) => {
    let { image } = event.body
    let { email } = event.pathParameters


    console.log("This is image: ", image)

    let imageData: string = image;
    if (image.substring(0, 7) === 'base64,') {
        imageData = image.substring(7, image.length);
    }

    console.log("This is image Data", imageData)

    const buffer = Buffer.from(imageData, 'base64');
    const fileInfo = await fileTypeFromBuffer(buffer);

    let detectedExt = 'jpg'
    let detectedMime = "image/jpeg";

    console.log("This is file info: ", fileInfo)

    if (fileInfo){
        detectedExt = fileInfo.ext;
        detectedMime = fileInfo.mime;
    }

    const command = new PutObjectCommand({
        Bucket: process.env.S3Bucket,
        Key: `${email}.${detectedExt}`,
        Body: buffer,
        ContentType: detectedMime
    })

    const response = await client.send(command);

    return {
        statusCode: 201,
        body: JSON.stringify(response)
      }
})