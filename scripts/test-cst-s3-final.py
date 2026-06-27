import boto3
from botocore.config import Config

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# S3 Browser 可能需要的配置
# 尝试：不指定region，使用path-style，不验证证书
try:
    s3 = boto3.client(
        's3',
        endpoint_url='https://s3.cstcloud.cn',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret,
        verify=False,
        config=Config(
            s3={'addressing_style': 'path'},
            retries={'max_attempts': 1}
        )
    )
    resp = s3.list_buckets()
    print("✅ 成功! path-style, no region")
    for b in resp['Buckets']:
        print(f"  {b['Name']}")
except Exception as e:
    print(f"❌ 失败: {str(e)[:100]}")

# 尝试：不指定region，使用virtual-style
try:
    s3 = boto3.client(
        's3',
        endpoint_url='https://s3.cstcloud.cn',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret,
        verify=False,
        config=Config(
            s3={'addressing_style': 'virtual'},
            retries={'max_attempts': 1}
        )
    )
    resp = s3.list_buckets()
    print("✅ 成功! virtual-style, no region")
    for b in resp['Buckets']:
        print(f"  {b['Name']}")
except Exception as e:
    print(f"❌ virtual-style 失败: {str(e)[:100]}")

# 尝试：指定 region=us-east-1，path-style
try:
    s3 = boto3.client(
        's3',
        endpoint_url='https://s3.cstcloud.cn',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret,
        region_name='us-east-1',
        verify=False,
        config=Config(
            s3={'addressing_style': 'path'},
            retries={'max_attempts': 1}
        )
    )
    resp = s3.list_buckets()
    print("✅ 成功! us-east-1, path-style")
    for b in resp['Buckets']:
        print(f"  {b['Name']}")
except Exception as e:
    print(f"❌ us-east-1 path-style 失败: {str(e)[:100]}")

# 尝试：检查桶 bin220797 是否有内容
try:
    s3 = boto3.client(
        's3',
        endpoint_url='https://s3.cstcloud.cn',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret,
        verify=False,
        config=Config(s3={'addressing_style': 'path'})
    )
    resp = s3.list_objects_v2(Bucket='bin220797')
    if 'Contents' in resp:
        print(f"✅ 桶 bin220797 有 {len(resp['Contents'])} 个文件")
        for obj in resp['Contents'][:10]:
            print(f"  - {obj['Key']} ({obj['Size']})")
    else:
        print("⚠️ 桶 bin220797 存在但为空")
except Exception as e:
    print(f"❌ 检查桶失败: {str(e)[:100]}")