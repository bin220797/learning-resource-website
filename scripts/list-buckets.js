const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    endpoint: 'https://s3.cstcloud.cn',
    credentials: {
        accessKeyId: 'AKIAPDZ4GSEOJIWQ9V59',
        secretAccessKey: 'M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2'
    },
    region: 'us-east-1',
    forcePathStyle: true
});

async function main() {
    try {
        const resp = await s3.send(new ListBucketsCommand({}));
        console.log('Buckets:');
        for (const b of resp.Buckets) {
            console.log('  ' + b.Name);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

main();