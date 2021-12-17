<?php

use Weiaibaicai\BigFileUpload\Http\Controllers\BigFileUploadController;
use Illuminate\Support\Facades\Route;

Route::post('weiaibaicai/big-file-upload/encoded-object-name', [BigFileUploadController::class,'getEncodedObjectName']);
