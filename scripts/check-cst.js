const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: 'https://s3.cstcloud.cn',
    credentials: {
        accessKeyId: 'AKIAPDZ4GSEOJIWQ9V59',
        secretAccessKey: 'M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2'
    },
    region: 'us-east-1',
    forcePathStyle: true
});

const bucketNames = ['EB703bafa4094538ac85250c6F3F5621', 'eb703bafa4094538ac85250c6f3f5621'];

async function main() {
    for (const bucket of bucketNames) {
        try {
            console.log('Checking bucket: ' + bucket);
            const resp = await s3.send(new ListObjectsV2Command({
                Bucket: bucket,
                MaxKeys: 50
            }));
            if (resp.Contents) {
                console.log('Found ' + resp.Contents.length + ' files:');
                for (const obj of resp.Contents) {
                    console.log('  ' + obj.Key + ' - ' + obj.Size + ' bytes');
                }
            } else {
                console.log('Bucket exists but is empty');
            }
        } catch (e) {
            console.log('Error for ' + bucket + ': ' + e.name + ' - ' + e.message);
        }
    }
}

main();