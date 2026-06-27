import boto3
from botocore.config import Config

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# 尝试使用 sigv2 签名（有些S3兼容服务需要）
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
    # 强制使用 sigv2
    s3.meta.client_config.signature_version = 's3'
    resp = s3.list_buckets()
    print("✅ sigv2 成功!")
except Exception as e:
    print(f"❌ sigv2: {str(e)[:80]}")

# 尝试不使用region
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
    print("✅ 无region成功!")
except Exception as e:
    print(f"❌ 无region: {str(e)[:80]}")

# 尝试检查桶bin220797（直接访问，不先list buckets）
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
    resp = s3.list_objects_v2(Bucket='bin220797')
    if 'Contents' in resp:
        print(f"✅ 桶bin220797有{len(resp['Contents'])}个文件")
    else:
        print("⚠️ 桶存在但为空")
except Exception as e:
    print(f"❌ 检查桶: {str(e)[:80]}")