'use strict';

module.exports = function (app, http, plugin) {
    if (plugin.useSSL) {
        http.get('/testHttps', function (req, res, next) {

            let custom_data = 'custom data';
            res.set('resp', custom_data);

            res.send('https success');
            // Let the message flow down(to filer.after)
            next();
        });
    } else {
        http.get('/testHttp', function (req, res, next) {
            console.log('pid: %s', process.pid);

            let custom_data = 'custom data';
            res.set('resp', custom_data);

            res.send('http success');
            // Let the message flow down(to filer.after)
            next();
        });
    }
};