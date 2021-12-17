<?php

namespace Weiaibaicai\BigFileUpload;

use Dcat\Admin\Extend\ServiceProvider;
use Dcat\Admin\Form;
use Dcat\Admin\Admin;
use Weiaibaicai\BigFileUpload\Form\BigFileUpload as BigFileUploadForm;

class BigFileUploadServiceProvider extends ServiceProvider
{

    protected $js = [
        'js/bootstrap.file-input.js',
        'js/spark-md5.min.js',
        'js/big-file-upload.js',
    ];
    protected $css = [
//        'css/index.css',
    ];

	public function register()
	{
		//
	}

	public function init()
	{
        $extension = new BigFileUpload();
        if ($views = $extension->views) {
            $this->loadViewsFrom($views, BigFileUpload::NAME);
        }

        if ($lang = $extension->lang) {
            $this->loadTranslationsFrom($lang, BigFileUpload::NAME);
        }

        Form::extend('bigFileUpload', BigFileUploadForm::class);


        $this->app->booted(function () {
            Admin::app()->routes(function ($router) {
                $attributes = array_merge([
                    'prefix'     => config('admin.route.prefix'),
                    'middleware' => config('admin.route.middleware'),
                ], $this->config('route', []));

                $router->group($attributes, __DIR__ . '/Http/routes.php');
            });
        });

        $this->publishes([
            __DIR__.'/../config/big-file-upload.php' => config_path('big-file-upload.php'),
        ]);

        parent::init();
	}

	public function settingForm()
	{
		return new Setting($this);
	}
}
