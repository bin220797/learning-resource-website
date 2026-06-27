const { S3Client, ListBucketsCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const accessKey = 'AKIAH9R68ZCHPB9V6BZR';
const secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ';

// 严格按用户提供的配置
const s3Client = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.cstcloud.cn",
  forcePathStyle: true,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secret
  },
});

async function main() {
  try {
    console.log("正在测试 ListBuckets...");
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log("✅ ListBuckets 成功!");
    console.log("Buckets:", response.Buckets.map(b => b.Name));
    
    // 检查桶 bin220797
    console.log("\n正在检查桶 bin220797...");
    const listCommand = new ListObjectsV2Command({
      Bucket: 'bin220797'
    });
    const listResp = await s3Client.send(listCommand);
    if (listResp.Contents) {
      console.log(`桶 bin220797 有 ${listResp.Contents.length} 个文件`);
      for (const obj of listResp.Contents.slice(0, 10)) {
        console.log(`  - ${obj.Key} (${obj.Size})`);
      }
    } else {
      console.log("桶 bin220797 存在但为空");
    }
  } catch (error) {
    console.error("❌ 错误!");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.Code);
    console.error("Error type:", error.__type__);
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}

main();