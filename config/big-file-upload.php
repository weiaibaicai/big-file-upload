<?php

return [
    "storage_host" => "https://upload-z2.qiniup.com", //七牛的分片上传域名
    "disk"         => '',//Filesystem Disk,默认值取 config('admin.upload.disk') 的值
    'prefix'       => 'bigfile/', //文件访问路径前缀
];
