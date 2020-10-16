'use strict';
const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 3001;

let createExpressLogger = function (logger) {
    return morgan('short', {
        stream: {
            write: function (str) {
                logger.debug(str);
            }
        }
    })
};

let staticHandler = function (exps, val) {
    let expressStatic = function (val) {
        return express.static(val);
    };
    if (typeof val === 'string') {
        exps.use(expressStatic(val))
    } else if (Array.isArray(val)) {
        val.forEach(function (val) {
            staticHandler(exps, val);
        });
    }
};

let defaultLogger = function () {
    return {
        debug: console.log,
        info: console.log,
        warn: console.warn,
        error: console.error,
    }
};

let Http = function (app, opts) {
    /** opts fields:
     * useSSL: true/false
     * keyFile: file path(eg: "config/key.pem")
     * certFile: file path(eg: "config/crt.pem")
     * statics(path relative to package.json), eg:
     *      1: 'path'
     *      2: ['path1', 'path2']
     * logger: custom logger config
     */
    opts = opts || {};
    this.app = app;
    this.http = express();
    // self.logger.info('Http opts:', opts);
    let sc = app.getServerFromConfig(app.getServerId());
    this.host = sc.httpHost || DEFAULT_HOST;
    this.port = sc.httpPort || DEFAULT_PORT;

    this.useSSL = !!opts.useSSL;
    this.sslOpts = {};
    if (this.useSSL) {
        this.sslOpts.key = fs.readFileSync(path.join(app.getBase(), opts.keyFile));
        this.sslOpts.cert = fs.readFileSync(path.join(app.getBase(), opts.certFile));
    }

    this.logger = opts.logger || defaultLogger();

    this.http.set('port', this.port);
    this.http.set('host', this.host);
    this.http.use(createExpressLogger(this.logger));
    this.http.use(bodyParser.json());
    this.http.use(bodyParser.urlencoded({extended: true}));
    this.http.use(methodOverride());

    if (opts.statics) {
        staticHandler(this.http, opts.statics);
    }

    let self = this;
    this.app.configure(function () {
        self.http.use(errorHandler());
    });

    this.beforeFilters = require('../../index').beforeFilters;
    this.afterFilters = require('../../index').afterFilters;
    this.server = null;
};

Http.prototype.loadRoutes = function () {
    this.http.get('/', function (req, res, next) {
        res.send('pomelo-https-plugin ok!');
        next();
    });

    let routesPath = path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'route');
    // self.logger.info(routesPath);
    assert.ok(fs.existsSync(routesPath), 'Cannot find route path: ' + routesPath);

    let self = this;
    fs.readdirSync(routesPath).forEach(function (file) {
        if (/.js$/.test(file)) {
            let routePath = path.join(routesPath, file);
            // self.logger.info(routePath);
            require(routePath)(self.app, self.http, self);
        }
    });
};

Http.prototype.start = function (cb) {
    let self = this;

    this.beforeFilters.forEach(function (elem) {
        self.http.use(elem);
    });

    this.loadRoutes();

    this.afterFilters.forEach(function (elem) {
        self.http.use(elem);
    });

    if (this.useSSL) {
        this.server = https.createServer(this.sslOpts, this.http).listen(this.port, this.host, function () {
            self.logger.info('Http start', self.app.getServerId(), 'url: https://' + self.host + ':' + self.port);
            self.logger.info('Http start success');
            process.nextTick(cb);
        });
    } else {
        this.server = http.createServer(this.http).listen(this.port, this.host, function () {
            self.logger.info('Http start', self.app.getServerId(), 'url: http://' + self.host + ':' + self.port);
            self.logger.info('Http start success');
            process.nextTick(cb);
        });
    }
};

Http.prototype.afterStart = function (cb) {
    this.logger.info('Http afterStart');
    process.nextTick(cb);
};

Http.prototype.stop = function (force, cb) {
    let self = this;
    this.server.close(function () {
        self.logger.info('Http stop');
        cb();
    });
};

module.exports = function (app, opts) {
    return new Http(app, opts);
};
