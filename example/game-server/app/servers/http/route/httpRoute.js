'use strict';

module.exports = function (app, http, plugin) {
    // plugin.useSSL: https/http
    http.get('/', function (req, res, next) {
        console.log('pid: %s', process.pid);

        let custom_data = 'custom data';
        res.set('resp', custom_data);

        res.send('http server work fine!');

        // Let the message flow down(to filer.after)
        next();
    });
};