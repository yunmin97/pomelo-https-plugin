# pomelo-https-plugin

## installation：npm install pomelo-https-plugin

## instructions(check out the example for more features):
#### 1. modify servers.json, add http server config:        
```js
{
  "development": {
    ...
    "http": [
      {
        "id": "http-server-0",
        "host": "127.0.0.1",
        "port": 5000,
        "httpHost": "127.0.0.1",
        "httpPort": 80
      }
    ]
  },
  "production": {...}
}
```
#### 2. modify adminServer.json, add server type config:        
```js
[
  ...
  {
    "type": "http",
    "token": "agarxhqb98rpajloaxn34ga8xrunpagkjwlaw3ruxnpaagl29w4rxn"
  }
]
```
#### 3. modify app.js       
```js
...
const httpPlugin = require('pomelo-http-plugin');
...
app.configure('development', 'http', function () {
    app.use(httpPlugin, {
        http: {
            useSSL: false
        }
    });
});
```
#### 4. create app/servers/http/route/httpRoute.js
```js
module.exports = function(app, http) {
    http.get('/test', function (req, res, next) {
        res.send('http success');
        next();
    });
};
```     
## server cluster(just like pomelo`s way), only step 1 makes a difference           
```js
{
  "development": {
    ...
    "http": [
      {
        "clusterCount": 2,
        "id": "http-server-0",
        "host": "127.0.0.1",
        "port": "5000++",
        "httpHost": "127.0.0.1",
        "httpPort": "80++"
      }
    ]
  },
  "production": {...}
}
```
## enjoy it
