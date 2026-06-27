import boto3
from botocore.config import Config

# 尝试不同配置
configs = [
    {'region': 'us-east-1', 'verify': False},
    {'region': 'cn-north-1', 'verify': False},
    {'region': 'ap-southeast-1', 'verify': False},
]

for config in configs:
    try:
        s3 = boto3.client(
            's3',
            endpoint_url='https://s3.cstcloud.cn',
            aws_access_key_id='AKIAPDZ4GSEOJIWQ9V59',
            aws_secret_access_key='M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2',
            region_name=config['region'],
            verify=config['verify'],
            config=Config(s3={'addressing_style': 'path'})
        )
        resp = s3.list_buckets()
        print(f'✅ {config["region"]}: 成功')
        for b in resp['Buckets']:
            print(f'  {b["Name"]}')
        break
    except Exception as e:
        print(f'❌ {config["region"]}: {str(e)[:100]}')