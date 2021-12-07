var BigFileUpload = {
    upload: function (name) {
        $.ajaxSetup({
            headers: {
                'Authorization': 'UpToken ' + this.upToken
            }
        });

        this.resourceDom = this.wrapperDom.find('#' + name + '-resource');
        // console.log(this.resourceDom[0]);

        this.outputDom = this.wrapperDom.find('#' + name + '-output'),
            this.progressBarDom = this.wrapperDom.find('#' + name + '-progressbar'),
            this.resource = this.resourceDom[0].files[0],
            this.resourceName = this.resource.name,
            this.resourceSize = this.resource.size,
            this.resourceType = this.resource.type,
            this.resourceTempBaseName = '',
            this.resourceExt = '',
            this.chunkSize = 5 * 1024 * 1024,
            this.chunkCount = 0,
            this.groupSubDir = '',
            this.savedPath = '',
            this.resourceHash = '',
            this.blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
            this.i = 0,
            this.messages = this.getLocalizedMessages(),
            this.parts = [],
            this.locale;

        // console.log('ggg', this.resource);

        if (!this.blobSlice) {
            this.outputDom.text(this.messages.error_unsupported_browser);
            return;
        }
        if (this.resourceSize === 0) {
            this.outputDom.text(this.messages.error_invalid_resource_size);
            return;
        }
        if (this.resourceName.substring(this.resourceName.lastIndexOf('.') + 1, this.resourceName.length) === '') {
            this.outputDom.text(this.messages.error_invalid_resource_type);
            return;
        }
        this.outputDom.text(this.messages.status_upload_begin);
        if (!('FileReader' in window) || !('File' in window) || typeof SparkMD5 === 'undefined') {
            this.preprocess();
        } else {
            this.calculateHash();
        }
    },
    calculateHash: function () {
        var _this = this,
            clientChunkSize = 4000000,
            chunks = Math.ceil(_this.resource.size / clientChunkSize),
            currentChunk = 0,
            spark = new SparkMD5.ArrayBuffer(),
            fileReader = new FileReader();
        fileReader.onload = function (e) {
            spark.append(e.target.result);
            ++currentChunk;
            _this.outputDom.text(_this.messages.status_hashing + ' ' + parseInt(currentChunk / chunks * 100) + '%');
            if (currentChunk < chunks) {
                loadNext();
            } else {
                _this.resourceHash = spark.end();
                _this.preprocess();
            }
        };
        fileReader.onerror = function () {
            _this.preprocess();
        };

        function loadNext() {
            var start = currentChunk * clientChunkSize,
                end = start + clientChunkSize >= _this.resource.size ? _this.resource.size : start + clientChunkSize;
            fileReader.readAsArrayBuffer(_this.blobSlice.call(_this.resource, start, end));
        }

        loadNext();
    },
    preprocess: function () {
        var _this = this;

        // console.log('111111 **** 333333');
        $.ajax({
            url: this.storageHost + '/buckets/' + _this.bucket + '/objects/~/uploads',
            type: 'POST',
            dataType: 'json',
            success: function (rst) {
                //第一步，获取上传的ID
                //{"uploadId":"6192662f55e9bff63d7570e4region02z2","expireAt":1637589167}
                // console.log('上传的ID: ', rst);
                if (rst.error) {
                    _this.outputDom.text(rst.error);
                    return;
                }

                _this.chunkCount = Math.ceil(_this.resourceSize / _this.chunkSize);
                _this.uploadId = rst.uploadId;
                _this.expireAt = rst.expireAt;

                //第二步，通过上传ID上传分块
                _this.uploadChunk();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                _this.outputDom.text(_this.messages.error_upload_fail);
            }
        });
    },
    uploadChunk: function () {
        var _this = this,
            start = this.i * this.chunkSize,
            end = Math.min(this.resourceSize, start + this.chunkSize),
            chunkIndex = this.i + 1,
            partContent = this.resource.slice(start, end);

        $.ajax({
            url: _this.storageHost + '/buckets/' + _this.bucket + '/objects//uploads/' + _this.uploadId + '/' + chunkIndex,
            type: 'PUT',
            processData: false,
            data:partContent,
            contentType: 'application/octet-stream',
            contentLength: end - start,
            dataType: 'JSON',
            async:true,
            success: function (rst) {
                if ((rst instanceof Object) !== true) {
                    _this.outputDom.text(_this.messages.error_invalid_server_return);
                    return;
                }
                if (rst.error === 'undefined' || rst.error) {
                    _this.outputDom.text(rst.error);
                    return;
                }
                var percent = parseInt((_this.i + 1) / _this.chunkCount * 100);
                _this.progressBarDom.css('width', percent + '%');
                _this.outputDom.text(_this.messages.status_uploading + ' ' + percent + '%');

                //第三步，调用完成接口，把图片拼接起来
                _this.parts.push({'partNumber': chunkIndex, 'etag': rst.etag});
                // console.log('所有分块数据', {'parts':_this.parts});

                if (percent === 100) {
                    $.ajax({
                        url: _this.storageHost + '/buckets/' + _this.bucket + '/objects/~/uploads/' + _this.uploadId,
                        type: 'POST',
                        dataType: 'json',
                        contentType: 'application/json',
                        data:JSON.stringify({'parts':_this.parts}),
                        success: function (rst) {
                            _this.savedPath = rst.key;
                            _this.savedPathDom.val(rst.key);
                            _this.resourceDom.attr('disabled', 'disabled');
                            _this.outputDom.text(_this.messages.status_upload_succeed);
                            _this.progressBarDom.css('width', '100%');
                            typeof (_this.callback) !== 'undefined' ? _this.callback() : null;

                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            _this.outputDom.text(_this.messages.error_upload_fail);
                        }
                    });

                } else {
                    ++_this.i;
                    _this.uploadChunk();
                }

            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.status === 0) {
                    _this.outputDom.text(_this.messages.status_retrying);
                    _this.sleep(5000);
                    _this.uploadChunk();
                } else {
                    _this.outputDom.text(_this.messages.error_upload_fail);
                }
            }
        });
    },
    sleep: function (milliSecond) {
        var wakeUpTime = new Date().getTime() + milliSecond;
        while (true) {
            if (new Date().getTime() > wakeUpTime) {
                return;
            }
        }
    },
    success: function (callback) {
        this.callback = callback;
        return this;
    },
    setStorageHost: function (storageHost) {
        this.storageHost = storageHost;
        return this;
    },

    setPreprocessRoute: function (route) {
        this.preprocessRoute = route;
        return this;
    },
    setUploadingRoute: function (route) {
        this.uploadingRoute = route;
        return this;
    },
    setSavedPathField: function (selector) {
        this.savedPathDom = $(selector);
        return this;
    },
    getLocalizedMessages: function () {
        var lang = navigator.language ? navigator.language : navigator.browserLanguage;
        var locales = Object.getOwnPropertyNames(this.text);
        for (var k in locales) {
            if (lang.indexOf(locales[k]) > -1) {
                this.locale = locales[k];
                return this.text[this.locale];
            }
        }
        this.locale = 'en';
        return this.text[this.locale];
    },
    setUpToken: function (upToken) {
        this.upToken = upToken;
        return this;
    },
    setBucket: function (bucket) {
        this.bucket = bucket;
        return this;
    },

    text: {
        en: {
            status_upload_begin: 'upload begin',
            error_unsupported_browser: 'Error: unsupported browser',
            status_hashing: 'hashing',
            status_instant_completion_success: 'upload succeed (instant completion) ',
            status_uploading: 'uploading',
            status_upload_succeed: 'upload succeed',
            status_retrying: 'network problem, retrying...',
            error_upload_fail: 'Error: upload fail',
            error_invalid_server_return: 'Error: invalid server return value',
            error_invalid_resource_size: 'Error: invalid resource size',
            error_invalid_resource_type: 'Error: invalid resource type'
        },
        zh: {
            status_upload_begin: '开始上传',
            error_unsupported_browser: '错误：上传组件不被此浏览器支持',
            status_hashing: '正在哈希',
            status_instant_completion_success: '上传成功（秒传）',
            status_uploading: '正在上传',
            status_upload_succeed: '上传成功',
            status_retrying: '网络故障，正在重试……',
            error_upload_fail: '错误：上传失败',
            error_invalid_server_return: '错误：无效的服务器返回值',
            error_invalid_resource_size: '错误：无效的文件大小',
            error_invalid_resource_type: '错误：无效的文件类型'
        }
    }
};

function bigFileUpload(name, resource) {
    var newInstance = Object.create(BigFileUpload);
    newInstance.wrapperDom = $(resource).parents('#aetherupload-wrapper-' + name);
    newInstance.savedPathDom = newInstance.wrapperDom.find('#' + name + '-savedpath');
    newInstance.storageHost = '七牛服务器域名';
    newInstance.upToken = 'myToken';
    newInstance.bucket = 'myBucket';
    return newInstance;
}