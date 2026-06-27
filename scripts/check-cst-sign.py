import boto3
from botocore.config import Config
import urllib.parse

secret = 'M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2'

# Secret Key 中的特殊字符需要 URL 编码
enc_secret = urllib.parse.quote(secret, safe='')
print(f'原始 Secret Key: {secret}')
print(f'URL 编码后: {enc_secret}')

configs = [
    {'region': 'us-east-1', 'verify': False, 'secret': secret},
    {'region': 'us-east-1', 'verify': False, 'secret': enc_secret},
]

for config in configs:
    try:
        s3 = boto3.client(
            's3',
            endpoint_url='https://s3.cstcloud.cn',
            aws_access_key_id='AKIAPDZ4GSEOJIWQ9V59',
            aws_secret_access_key=config['secret'],
            region_name=config['region'],
            verify=config['verify'],
            config=Config(s3={'addressing_style': 'path'})
        )
        resp = s3.list_buckets()
        print(f'✅ {config["region"]}: 成功 - 找到 {len(resp["Buckets"])} 个 Bucket')
        for b in resp['Buckets']:
            print(f'  {b["Name"]}')
        break
    except Exception as e:
        print(f'❌ {config["region"]}: {str(e)[:200]}')