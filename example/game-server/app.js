'use strict';
var pomelo = require('pomelo');
var httpPlugin = require('pomelo-https-plugin');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'example');

// app configuration
app.configure('development', 'http', function () {
    app.use(httpPlugin, {
        http: {
            useSSL: false,
            keyFile: "certs/key.pem",
            certFile: "certs/cert.pem",
            statics: "static"
        }
    });
    let filter = require('./app/filters/log');
    httpPlugin.filter(filter.create());
});
// start app
app.start();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});