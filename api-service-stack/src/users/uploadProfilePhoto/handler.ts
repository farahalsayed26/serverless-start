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

    //const encodedImage = Buffer.from(image, 'binary').toString('base64');
    ///const encodedImage = Buffer.from(image, 'binary');
    //console.log(encodedImage)
    ///let imageBuffer = Buffer.from(image, 'base64');
    ///let decodedImage = encodedImage.toString('base64')
    //console.log(decodedImage)
    //let decodedImage = image.split(",")[1];
    ///console.log(decodedImage)

    // if (image.substring(0, 7) === 'base64,') {
    //     image = image.substring(7, image.length);
    // }

    
    //const fileInfo = await fileType.fileTypeFromBuffer(imageBuffer);
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

    // const upload = multer({
    //     storage: multerS3({
    //       s3: client,
    //       bucket: process.env.S3Bucket!,
    //       metadata: function (req, file, cb) {
    //         cb(null, {fieldName: "TESTING_META_DATA"});
    //       },
    //       key: function (req, file, cb) {
    //         cb(null, Date.now().toString())
    //       }
    //     })
    //   })

    //   const singleUpload = upload.single('image')

    //   router.post('/image-upload', function(req, res) {

    //     singleUpload(req, res, function(err) {
      
    //       if (err) {
    //         return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
    //       }
      
    //       return res.json({'imageUrl': req.file.location});
    //     });
    //   });

    const response = await client.send(command);

    return {
        statusCode: 201,
        body: JSON.stringify(response)
      }
})