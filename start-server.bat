@echo off
REM 启动phpstudy（后台运行，无窗口）
start /B "phpstudy" "D:\phpstudy_pro\Extensions\php\php8.2.9nts\php-cgi.exe" -b 127.0.0.1:9002 -c php.ini

REM 启动Node.js服务器（后台运行，无窗口）
start /B "node-server" "node.exe" "D:\phpstudy_pro\WWW\wordpress01\server.js"

REM 退出批处理
exit
