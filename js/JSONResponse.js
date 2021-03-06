// Check for jQuery
if (typeof jQuery === 'undefined') {
    throw new Error('Panda Jar requires jQuery');
}

var Panda = Panda || {};
Panda.Jar = Panda.Jar || {};

(function ($) {
    // Create JSON Response handler object
    Panda.Jar.JSONResponse = {
        request: function (serverUrl, method, requestData, sender, loading, options) {
            // Use new function
            return Panda.Jar.AsyncResponse.request(serverUrl, method, requestData, sender, loading, options).then(function (response) {
                // Parse report for actions
                return Panda.Jar.JSONResponse.parseResponseEvents(sender, response);
            });
        },
        // Parse server report actions, trigger to document
        parseResponseEvents: function (sender, response) {
            // Load body payload
            for (var key in response) {
                var responseContent = response[key];
                var payload = Panda.Jar.JSONResponse.getResponsePayload(responseContent);
                var reportType = responseContent.type;

                // Filter only actions and trigger to document
                switch (reportType) {
                    case 'action':
                    case 'event':
                        // Get event and trigger to document
                        var event = payload;
                        if ($.type(sender) != "undefined" && $.contains(document.documentElement, sender.get(0)))
                            sender.trigger(event.name, event.value);
                        else
                            $(document).trigger(event.name, event.value);
                        break;
                }
            }
            return response;
        },
        // Get the response payload
        getResponsePayload: function (responseContent) {
            return responseContent.payload;
        }
    };
})(jQuery);