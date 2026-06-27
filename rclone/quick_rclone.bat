@echo off
REM rclone 快速操作脚本 - 中国科技云数据胶囊
REM 用法：
REM   quick_rclone ls          - 列出桶内容
REM   quick_rclone up 文件     - 上传文件到桶
REM   quick_rclone down 文件   - 从桶下载文件
REM   quick_rclone sync 目录   - 同步目录

set RCLONE_CONFIG=%USERPROFILE%\.config\rclone\rclone.conf
set REMOTE=cstcloud:bin220797/

if "%1"=="ls" (
    rclone ls %REMOTE%
    goto :end
)
if "%1"=="up" (
    if "%2"=="" (
        echo 用法: quick_rclone up <文件路径>
    ) else (
        rclone copy "%2" %REMOTE% --progress
    )
    goto :end
)
if "%1"=="down" (
    if "%2"=="" (
        echo 用法: quick_rclone down <文件名>
    ) else (
        rclone copy %REMOTE%%2 ./ --progress
    )
    goto :end
)
if "%1"=="sync" (
    if "%2"=="" (
        echo 用法: quick_rclone sync <本地目录>
    ) else (
        rclone sync "%2" %REMOTE% --progress
    )
    goto :end
)

echo 用法: quick_rclone ls^|up^|down^|sync [参数]
:end