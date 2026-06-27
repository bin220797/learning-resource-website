import requests
from bs4 import BeautifulSoup

# CSTCloud WebDAV 配置
username = 'bin220797'
password = 'bin20060415'
base_url = 'https://data.cstcloud.cn/dav'

try:
    # 使用 WebDAV PROPFIND 列出目录
    resp = requests.request(
        'PROPFIND',
        base_url,
        headers={'Depth': '1'},
        auth=(username, password),
        verify=False
    )
    print(f"状态码: {resp.status_code}")
    print(f"响应头: {dict(resp.headers)}")
    print(f"响应内容前500: {resp.text[:500]}")
except Exception as e:
    print(f"错误: {str(e)}")