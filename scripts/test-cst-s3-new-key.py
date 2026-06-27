import boto3
from botocore.config import Config

access_key = 'AKIAH9R68ZCHPB9V6BZR'
secret = 'FVWDKBCUKGC6RMDTY=FZ6/MFFHPQJ/+LRTLMTFTZ'

# 测试多种配置
configs = [
    {'region': None, 'verify': False},
    {'region': 'us-east-1', 'verify': False},
    {'region': 'cn-north-1', 'verify': False},
    {'region': 'ap-southeast-1', 'verify': False},
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
        print(f"✅ 成功! Region={cfg['region']}")
        print(f"  Buckets: {[b['Name'] for b in resp['Buckets']]}")
        # 检查桶 bin220797 是否有内容
        try:
            bucket_resp = s3.list_objects_v2(Bucket='bin220797')
            if 'Contents' in bucket_resp:
                print(f"  文件数: {len(bucket_resp['Contents'])}")
                for obj in bucket_resp['Contents'][:5]:
                    print(f"    - {obj['Key']} ({obj['Size']})")
        except:
            print(f"  桶 bin220797 可能不存在或为空")
        break
    except Exception as e:
        err_msg = str(e)[:100]
        print(f"❌ Region={cfg['region']}: {err_msg}")