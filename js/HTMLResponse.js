var Panda = Panda || {};
Panda.Jar = Panda.Jar || {};

(function ($) {
    // Create HTML Server Report handler object, to handle html-specific server reports
    Panda.Jar.HTMLResponse = {
        request: function (serverUrl, method, requestData, sender, loading, callType, options) {
            // Use new function
            return Panda.Jar.JSONResponse.request(serverUrl, method, requestData, sender, loading, options).then(function (response) {
                return Panda.Jar.HTMLResponse.parseResponseContent(sender, response, callType);
            });
        },
        // Parse server response events, trigger to document
        parseResponseContent: function (sender, response, callType) {
            return new Promise(function (resolve, reject) {
                // Get sender data
                var senderAttributes = sender.data(callType);
                var startup = sender.attr("data-startup") || sender.data("startup");
                startup = (startup == "" && $.type(startup) != "undefined" ? true : startup);

                // Remove startup attribute
                if (startup) {
                    $(sender).data("startup", true).removeAttr("data-startup");
                }

                // Check if sender is in document, If not, reject report content
                if (startup && !$.contains(document, $(sender).get(0))) {
                    Panda.Debug.Logger.log('The sender of the report does no longer exist in the document.');
                    return reject('The sender of the report does no longer exist in the document.');
                }

                // Load body payload
                var contentModified = false;
                for (var key in response) {
                    var responseContent = response[key];
                    var payload = responseContent.payload;
                    var reportType = responseContent.type;

                    // Take action according to result type
                    switch (reportType) {
                        case "data":
                        case "html":
                            // If there is no content, trigger modification and exit
                            if ($(payload).length == 0)
                                continue;

                            // Get Report Parameters
                            var dataHolder = null;
                            // If sender is loading at startup, set default holder as sender
                            if (startup == true && dataHolder == null)
                                dataHolder = sender;
                            else if (senderAttributes != undefined)
                                dataHolder = senderAttributes.holder;

                            // If sender has no holder, get holder from payload
                            if ($.type(dataHolder) == "undefined" || dataHolder == null || dataHolder == "")
                                dataHolder = payload.holder;

                            // If no holder is given anywhere, get sender
                            if ($.type(dataHolder) == "undefined" || dataHolder == null || dataHolder == "")
                                dataHolder = sender;

                            var jqHolder = $(dataHolder, sender).first();
                            if (jqHolder.length == 0)
                                jqHolder = $(dataHolder).first();

                            // Remove old contents if replace
                            var handleDataMethod = payload.method;
                            if (handleDataMethod == "replace")
                                jqHolder.contents().remove();

                            // Append content to holder
                            $(payload.html).appendTo(jqHolder);
                            contentModified = true;

                            break;
                        case "popup":
                            $(sender).popup($(payload.html));
                            contentModified = true;
                            break;
                    }
                }

                // Trigger panda.content.modified if content actually modified
                if (contentModified) {
                    $(document).trigger("panda.content.modified");
                }

                return resolve(response);
            });
        },
        // Get the response payload's content
        getPayloadContent: function (responsePayload) {
            return responsePayload.content;
        }
    };
})(jQuery);