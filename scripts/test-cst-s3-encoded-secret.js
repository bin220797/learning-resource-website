const { S3Client, ListBucketsCommand } = require("@aws-sdk/client-s3");

const accessKey = 'AKIAH9R68ZCHPB9V6BZR';
const rawSecret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ';

// 对Secret Key进行URL编码
const encodedSecret = encodeURIComponent(rawSecret);
console.log("原始 Secret Key:", rawSecret);
console.log("URL 编码后:", encodedSecret);

// 配置1：使用原始Secret Key
const client1 = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.cstcloud.cn",
  forcePathStyle: true,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: rawSecret
  },
});

// 配置2：使用编码后的Secret Key
const client2 = new S3Client({
  region: "us-east-1",
  endpoint: "https://s3.cstcloud.cn",
  forcePathStyle: true,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: encodedSecret
  },
});

async function test(client, label) {
  try {
    const resp = await client.send(new ListBucketsCommand({}));
    console.log(`✅ ${label}: 成功!`);
    return true;
  } catch (error) {
    console.error(`❌ ${label}: ${error.message}`);
    return false;
  }
}

async function main() {
  await test(client1, "原始Secret");
  await test(client2, "编码后Secret");
}

main();