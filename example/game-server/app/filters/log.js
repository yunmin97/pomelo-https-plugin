'use strict';

/**
 * message route: filter.before => httpRoute => filter.after
 */

module.exports.create = function () {
    return new LogFilter();
};

var LogFilter = function (plugin) {
};

LogFilter.prototype.before = function (req, res, next) {
    console.log('[http request filter(before)]:', req.method, req.url);
    next();
};

LogFilter.prototype.after = function (req, res, next) {
    let custom_data = res.get('resp');
    console.log('[http response filter(after)]:', req.method, req.url, custom_data);
    next();
};