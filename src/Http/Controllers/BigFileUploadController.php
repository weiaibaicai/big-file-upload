<?php

namespace Weiaibaicai\BigFileUpload\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;


class BigFileUploadController extends Controller
{
    public function getEncodedObjectName(Request $request)
    {
        $ext = '';
        if ($oldName = $request->get('file_name')) {
            $pathInfo = pathinfo($oldName);
            $ext = empty($pathInfo['extension']) ? '' : '.' . $pathInfo['extension'];
        }

        $fileName = time() . rand(11111,99999);
        $fullName = config('big-file-upload.prefix') . $fileName. $ext;

        $objectName = \Qiniu\base64_urlSafeEncode($fullName);

        return response()->json([
            'error' => 0,
            'data' => [
                'object_name' => $objectName
            ],
        ]);

    }

}