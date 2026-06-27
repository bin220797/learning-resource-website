import boto3
from botocore.config import Config

access_key = 'AKIAPDZ4GSEOJIWQ9V59'
secret = 'M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2'

# CSTCloud S3 配置测试
configs = [
    # 1. 无 Region（有些 S3 兼容服务不需要 Region）
    {'region': None, 'verify': False},
    # 2. 标准 Region
    {'region': 'us-east-1', 'verify': False},
    # 3. 中国区域
    {'region': 'cn-north-1', 'verify': False},
    # 4. 无 Region + PathStyle
    {'region': None, 'verify': False},
]

for cfg in configs:
    try:
        if cfg['region']:
            s3 = boto3.client(
                's3',
                endpoint_url='https://s3.cstcloud.cn',
                aws_access_key_id=access_key,
                aws_secret_access_key=secret,
                region_name=cfg['region'],
                verify=False,
                config=Config(s3={'addressing_style': 'path'})
            )
        else:
            s3 = boto3.client(
                's3',
                endpoint_url='https://s3.cstcloud.cn',
                aws_access_key_id=access_key,
                aws_secret_access_key=secret,
                verify=False,
                config=Config(s3={'addressing_style': 'path'})
            )
        resp = s3.list_buckets()
        print(f"✅ {cfg}: 成功 - {len(resp['Buckets'])} buckets")
        for b in resp['Buckets']:
            print(f"  {b['Name']}")
        break
    except Exception as e:
        print(f"❌ {cfg}: {str(e)[:150]}")