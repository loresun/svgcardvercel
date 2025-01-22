#!/bin/bash

# 初始化 Git 仓库
git init

# 添加所有文件到暂存区
git add .

# 提交初始版本
git commit -m "Initial commit"

# 添加远程仓库
git remote add origin https://github.com/loresun/svgcardvercel.git

# 推送到远程仓库的 main 分支
git push -u origin main

echo "Git repository initialized and pushed to remote branch 'main' successfully." 