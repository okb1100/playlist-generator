const express = require('express');
const app = express();
var request = require('request');
var mcache = require('memory-cache');

var cache = duration => {
    return (req, res, next) => {
        req.query.sort = req.query.sort || 'hot';
        let key = 'express__' + req.params.sub + '__' + req.query.sort;
        console.log(key);
        let cachedBody = mcache.get(key);
        if (cachedBody) {
            res.setHeader('Content-Type', 'text/json');
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = body => {
                mcache.put(key, body, duration * 1000, key => {
                    console.log(key + ' is gone');
                });
                res.setHeader('Content-Type', 'text/json');
                res.sendResponse(body);
            };
            next();
        }
    };
};

var filter = () => {
    return (req, res, next) => {
        req.params.sub = req.params.sub || 'music';
        var url =
            'https://www.reddit.com/r/' +
            req.params.sub +
            '/' +
            req.query.sort +
            '/.json';
        request(url, { json: true }, (err, rsp, body) => {
            let subData = Array.from(body.data.children);
            req.links = new Array();
            body.data.children.forEach(val => {
                if (
                    val.data.domain != 'youtube.com' &&
                    val.data.domain != 'youtu.be'
                ) {
                    subData.splice(subData.indexOf(val), 1);
                }
            });
            subData.forEach(val => {
                let idFinder = 'v=';
                if (val.data.domain === 'youtu.be') idFinder = 'e/';

                req.links.push({
                    url: val.data.url.slice(
                        val.data.url.search(idFinder) + 2,
                        val.data.url.length
                    ),
                    title: val.data.title
                });
            });
            next();
        });
    };
};

app.port = 3000;
app.use(express.static('public'));

app.get('/', cache(60), (req, res) => {
    res.sendFile('public/index.html');
});

app.get('/sub/:sub', cache(60 * 10), filter(), (req, res) => {
    res.send(JSON.stringify(req.links, null, 4));
});

app.listen(app.port, () => {
    console.log('listening on ' + app.port);
});
