import boto3
from botocore.config import Config

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# S3 Browser 可能需要的配置
configs = [
    # 1. 不指定region，不用forcePathStyle
    {'region': None, 'verify': False, 'forcePathStyle': False},
    # 2. 不同Region + forcePathStyle
    {'region': 'us-east-1', 'verify': False, 'forcePathStyle': True},
    {'region': 'ap-southeast-1', 'verify': False, 'forcePathStyle': True},
    {'region': 'cn-north-1', 'verify': False, 'forcePathStyle': True},
    # 3. endpoint格式不同 - 可能是 bucket.region.cstcloud.cn
    {'endpoint_url': 'https://bin220797.cstcloud.cn', 'region': None, 'verify': False, 'forcePathStyle': False},
    {'endpoint_url': 'https://bin220797.s3.cstcloud.cn', 'region': None, 'verify': False, 'forcePathStyle': False},
]

for cfg in configs:
    try:
        # 构建配置
        kwargs = {
            'endpoint_url': cfg.get('endpoint_url', 'https://s3.cstcloud.cn'),
            'aws_access_key_id': access_key,
            'aws_secret_access_key': secret,
            'verify': cfg['verify']
        }
        if cfg['region']:
            kwargs['region_name'] = cfg['region']
        if not cfg.get('forcePathStyle', True):
            kwargs['config'] = Config(s3={'addressing_style': 'virtual'})
        else:
            kwargs['config'] = Config(s3={'addressing_style': 'path'})

        s3 = boto3.client('s3', **kwargs)
        resp = s3.list_buckets()
        print(f"✅ 成功! endpoint={cfg.get('endpoint_url')}, region={cfg.get('region')}")
        print(f"  Buckets: {[b['Name'] for b in resp['Buckets']]}")
        break
    except Exception as e:
        err = str(e)[:80]
        print(f"❌ endpoint={cfg.get('endpoint_url')}, region={cfg.get('region')}: {err}")