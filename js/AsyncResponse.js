// Check for jQuery
if (typeof jQuery === 'undefined') {
    throw new Error('Panda Jar requires jQuery');
}

var Panda = Panda || {};
Panda.Jar = Panda.Jar || {};

(function ($) {
    // Create Server Report Object for Async Communication based on Panda Async Object
    Panda.Jar.AsyncResponse = {
        request: function (serverUrl, method, requestData, sender, loading, options) {
            // Set ajax extra options
            var ajaxOptions = {};
            ajaxOptions.dataType = 'json';
            ajaxOptions.loading = loading;
            ajaxOptions.withCredentials = true;

            // Extend options
            ajaxOptions = $.extend(ajaxOptions, options);

            // Use new function
            return Panda.Http.Async.request(serverUrl, method, requestData, sender, ajaxOptions).then(function (response) {
                return Panda.Jar.AsyncResponse.handleResponse(response);
            });
        },
        downloadRequest: function (downloadUrl) {
            // Create HTMLFrame to download content
            var frameID = 'dlfi' + Math.round(Math.random() * 10000000);
            var jqFrame = Panda.Ui.HTMLFrame.create(downloadUrl, '', frameID, 'dl_frame', null);
            jqFrame.css('display', 'none').appendTo('body');
        },
        handleResponse: function (response) {
            // Check if report is not null
            if (!response) {
                Panda.Debug.Logger.log('The server report is empty. Aborting content parsing.');
                return reject('The server report is empty. Aborting content parsing.');
            }

            // Check report integrity
            if (response.headers == undefined) {
                Panda.Debug.Logger.log('Server Report does not contain a header element. Aborting content parsing.');
                return reject('Server Report does not contain a header element. Aborting content parsing.');
            }
            return response.content;
        }
    };
})(jQuery);