<?php

namespace Weiaibaicai\BigFileUpload\Form;

use Dcat\Admin\Admin;
use Dcat\Admin\Form\Field;
use Illuminate\Support\Str;

class BigFileUpload extends Field
{

    protected $view = 'weiaibaicai.big-file-upload::index';

    /**
     * @var string
     */
    protected $disk;

    /**
     *
     * @return $this
     */
    public function disk()
    {
        $disk = config('big-file-upload.disk');
        if (empty($disk)) {
            $disk = config('admin.upload.disk');
        }

        $this->disk = $disk;

        return $this;
    }

    /**
     * 初始化js
     */
    protected function setupScript()
    {
        $this->attribute('id', $id = $this->generateId());
        $this->addVariables(['id' => $id]);

        $this->disk();

        $config = config('filesystems.disks.' . $this->disk);

        $bucket      = $config['bucket'];
        $accessKey   = $config['access_key'];
        $secretKey   = $config['secret_key'];

        $auth        = new \Qiniu\Auth($accessKey, $secretKey);
        $upToken     = $auth->uploadToken($bucket);
        $storageHost = config('big-file-upload.storage_host');
        $routePrefix = config('admin.route.prefix');

        $this->script = <<<JS
(function () {
        $('#{$id}-resource').bootstrapFileInput();

         $('#{$id}-resource').change(function(){
            bigFileUpload('{$id}', this).setStorageHost('{$storageHost}').setRoutePrefix('{$routePrefix}').setUpToken('{$upToken}').setBucket('{$bucket}').setSavedPathField('#{$id}-savedpath').success().upload('{$id}')
        });
})();
JS;

    }

    protected function generateId()
    {
        return 'big-file-upload' . Str::random(8);
    }

    /**
     * @return string
     */
    public function render()
    {
        Admin::requireAssets('@weiaibaicai.big-file-upload');

        $this->setupScript();

        return parent::render();
    }

}