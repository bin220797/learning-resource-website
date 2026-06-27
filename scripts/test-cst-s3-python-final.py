import boto3
from botocore.config import Config

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# 尝试各种配置
configs = [
    # 1. 最接近S3Browser的配置
    {'region': 'us-east-1', 'verify': False, 'path_style': True},
    {'region': None, 'verify': False, 'path_style': True},
    {'region': 'us-east-1', 'verify': False, 'path_style': False},
    {'region': None, 'verify': False, 'path_style': False},
    # 2. 尝试不同的签名版本
    {'region': 'us-east-1', 'verify': False, 'path_style': True, 'sig_version': 's3v4'},
    # 3. 不指定region
    {'region': None, 'verify': False, 'path_style': True, 'config': Config(s3={'addressing_style': 'path'})},
]

for cfg in configs:
    try:
        # 构建配置对象
        config_kwargs = {}
        if cfg.get('config'):
            config_kwargs['config'] = cfg['config']
        else:
            config_kwargs['config'] = Config(
                s3={'addressing_style': 'path'} if cfg['path_style'] else 'virtual',
                retries={'max_attempts': 1}
            )
        
        client_args = {
            'endpoint_url': 'https://s3.cstcloud.cn',
            'aws_access_key_id': access_key,
            'aws_secret_access_key': secret,
            'verify': cfg['verify'],
            **config_kwargs
        }
        if cfg['region']:
            client_args['region_name'] = cfg['region']
        
        s3 = boto3.client('s3', **client_args)
        resp = s3.list_buckets()
        print(f"✅ 成功! region={cfg['region']}, path_style={cfg['path_style']}")
        for b in resp['Buckets']:
            print(f"  {b['Name']}")
        break
    except Exception as e:
        print(f"❌ region={cfg['region']}, path_style={cfg['path_style']}: {str(e)[:80]}")