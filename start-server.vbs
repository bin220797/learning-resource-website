' VBScript 包装器 - 完全隐藏窗口运行命令

' 启动 phpstudy
Set objShell = CreateObject("WScript.Shell")
objShell.Run "D:\phpstudy_pro\Extensions\php\php8.2.9nts\php-cgi.exe -b 127.0.0.1:9002 -c php.ini", 0, False

' 启动 Node.js 服务器
objShell.Run "node D:\phpstudy_pro\WWW\wordpress01\server.js", 0, False

' 退出脚本
WScript.Quit