const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const accessKey = 'AKIAH9R68ZCHPB9V6BZR';
const secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ';

async function main() {
    const configs = [
        { region: null, forcePathStyle: true },
        { region: 'us-east-1', forcePathStyle: true },
        { region: 'us-east-1', forcePathStyle: false },
        { region: null, forcePathStyle: false },
    ];

    for (const config of configs) {
        try {
            const client = new S3Client({
                endpoint: 'https://s3.cstcloud.cn',
                credentials: {
                    accessKeyId: accessKey,
                    secretAccessKey: secret
                },
                region: config.region || 'us-east-1',
                forcePathStyle: config.forcePathStyle
            });

            const resp = await client.send(new ListBucketsCommand({}));
            console.log(`✅ 成功! region=${config.region}, pathStyle=${config.forcePathStyle}`);
            console.log('Buckets:', resp.Buckets.map(b => b.Name));
            
            // 检查桶 bin220797
            const bucketResp = await client.send(new ListObjectsV2Command({
                Bucket: 'bin220797'
            }));
            if (bucketResp.Contents) {
                console.log(`文件数: ${bucketResp.Contents.length}`);
                for (const obj of bucketResp.Contents.slice(0, 5)) {
                    console.log(`  - ${obj.Key} (${obj.Size})`);
                }
            } else {
                console.log('桶 bin220797 存在但为空');
            }
            return;
        } catch (e) {
            console.log(`❌ region=${config.region}, pathStyle=${config.forcePathStyle}: ${e.message}`);
        }
    }
}

main();