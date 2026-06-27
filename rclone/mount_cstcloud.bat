@echo off
REM rclone 挂载脚本 - 中国科技云数据胶囊
REM 双击运行，将 bin220797 挂载为 Z: 盘
REM 前置条件：下载 rclone.exe 放在 D:\rclone\ 或系统 PATH 中
REM 下载地址：https://rclone.org/downloads/

set RCLONE_CONFIG=%USERPROFILE%\.config\rclone\rclone.conf
set REMOTE_NAME=cstcloud
set MOUNT_DRIVE=Z:

echo ========================================
echo  中国科技云数据胶囊 - rclone 挂载脚本
echo  挂载 %REMOTE_NAME%:%MOUNT_DRIVE%
echo ========================================
echo.

REM 确保配置目录存在
if not exist "%USERPROFILE%\.config\rclone" mkdir "%USERPROFILE%\.config\rclone"

REM 检查是否有已生成的配置文件，如果没有则提示
if not exist "%RCLONE_CONFIG%" (
    echo [WARNING] 未找到 rclone 配置文件！
    echo 请将 rclone_cstcloud.conf 复制到 %RCLONE_CONFIG%
    echo 或运行 rclone config 手动配置
    echo.
    pause
    exit /b
)

REM 检查 rclone 是否在 PATH 中
where rclone >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 未找到 rclone.exe，请确保已安装并添加到 PATH
    pause
    exit /b
)

REM 先测试连接
echo [正在测试连接...]
rclone ls %REMOTE_NAME%: --max-depth 1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 连接测试失败，请检查配置
    pause
    exit /b
)

echo [连接成功！正在挂载到 %MOUNT_DRIVE%: ...]
echo [关闭此窗口即可卸载]
echo.

rclone mount %REMOTE_NAME%: %MOUNT_DRIVE%: ^
    --vfs-cache-mode full ^
    --allow-non-empty ^
    --s3-directory-markers ^
    --dir-cache-time 5s ^
    --volume-serials "CSTCLOUD" ^
    --drive-letter %MOUNT_DRIVE%

echo.
echo 挂载已断开。
pause