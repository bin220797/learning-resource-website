import boto3
from botocore.config import Config
import urllib.parse
import hashlib

access_key = 'AKIAPDZ4GSEOJIWQ9V59'
secret = 'M8E=CPVH/IKX1D3IT9DD7QS++F2L0J/S6ETFOAE2'

print(f"Secret Key: {secret}")
print(f"Length: {len(secret)}")
print(f"Chars: {[(c, ord(c)) for c in secret]}")

# 尝试不同方式编码 Secret Key
enc1 = urllib.parse.quote(secret, safe='')
enc2 = urllib.parse.quote(secret, safe='')
enc3 = secret.replace('+', '%2B').replace('/', '%2F').replace('=', '%3D')

print(f"\n编码方式 1 (quote): {enc1}")
print(f"编码方式 2 (quote): {enc2}")
print(f"编码方式 3 (手动): {enc3}")

# 测试不同的配置
configs = [
    {'region': None, 'verify': False},
    {'region': 'cn-north-1', 'verify': False},
    {'region': 'us-east-1', 'verify': False},
    {'region': 'ap-southeast-1', 'verify': False},
]

for cfg in configs:
    for secret_var in [secret, enc1, enc2, enc3]:
        try:
            if cfg['region']:
                s3 = boto3.client(
                    's3',
                    endpoint_url='https://s3.cstcloud.cn',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_var,
                    region_name=cfg['region'],
                    verify=False,
                    config=Config(s3={'addressing_style': 'path'})
                )
            else:
                s3 = boto3.client(
                    's3',
                    endpoint_url='https://s3.cstcloud.cn',
                    aws_access_key_id=access_key,
                    aws_secret_access_key=secret_var,
                    verify=False,
                    config=Config(s3={'addressing_style': 'path'})
                )
            resp = s3.list_buckets()
            print(f"\n✅ 成功! Region={cfg['region']}, Secret={secret_var[:10]}...")
            print(f"  Buckets: {[b['Name'] for b in resp['Buckets']]}")
            exit(0)
        except Exception as e:
            err_msg = str(e)[:80]
            print(f"❌ Region={cfg['region']}, Secret={secret_var[:10]}...: {err_msg}")

print("\n所有配置都失败了。")