import boto3
from botocore.config import Config
import logging

# 开启详细日志
logging.basicConfig(level=logging.DEBUG)

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# S3 Browser 可能使用的配置
# 尝试不指定region + 虚拟路径风格
s3 = boto3.client(
    's3',
    endpoint_url='https://s3.cstcloud.cn',
    aws_access_key_id=access_key,
    aws_secret_access_key=secret,
    verify=False,
    config=Config(
        s3={'addressing_style': 'virtual'},  # 虚拟路径风格
        retries={'max_attempts': 1}
    )
)

try:
    resp = s3.list_buckets()
    print("✅ 成功!")
    for b in resp['Buckets']:
        print(f"  {b['Name']}")
except Exception as e:
    print(f"❌ 失败: {e}")
    # 尝试不同的配置
    print("\n尝试 path-style...")
    s3_path = boto3.client(
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
    try:
        resp = s3_path.list_buckets()
        print("✅ path-style 成功!")
    except Exception as e2:
        print(f"❌ path-style 也失败: {e2}")