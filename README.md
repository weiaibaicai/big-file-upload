# Dcat Admin Extension  大文件上传（分片，目前仅支持七牛）


## 依赖

- php  | >= 7.4.0
- dcat/laravel-admin  | >= ~2.0
- overtrue/laravel-filesystem-qiniu": "^1.0


## 安装

### composer 安装

```
composer require weiaibaicai/big-file-upload
```

### 启用插件
```
开发工具 -> 扩展 -> weiaibaicai.big-file-upload -> 升级 -> 启用
```

### 发布配置 big-file-upload.php

```
php artisan vendor:publish --provider="Weiaibaicai\BigFileUpload\BigFileUploadServiceProvider"
```

## 方法使用
```
$form->bigFileUpload('video', '视频')->help('备注备注');
```

## 安装问题
1. 发布文件时可能存在权限问题，记得给足权限。可在项目根目录执行 `chmod -R 755 public/vendor`
2. 读取不到已经发布的配置，可清空一下缓存 `php artisan config:clear`


## 安装问题
1. 发布文件时可能存在权限问题，记得给足权限。可在项目根目录执行 `chmod -R 755 public/vendor`
2. 读取不到已经发布的配置，可清空一下缓存 `php artisan config:clear`