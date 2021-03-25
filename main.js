var http = require('http');
var url = require('url');
var qs = require('querystring');
var topic = require('./lib/topic');
var author = require('./lib/author');

// node.js로 접속이 들어올때마다 createServer의 callback함수를 node.js가 호출한다.
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/') {
        if(queryData.id === undefined) {
            topic.home(request, response);
        }
        else {
            topic.page(request, response, queryData);
        }
    } else if(pathname === '/create'){
        topic.create(request, response);
    } else if(pathname === '/create_process'){
        topic.create_process(request, response);
    } else if(pathname === '/update'){
        topic.update(request, response, queryData);
    } else if(pathname === '/update_process'){
        topic.update_process(request, response);
    } else if(pathname === '/delete_process'){
        topic.delete_process(request, response);
    } else if(pathname === '/author'){
        author.home(request, response);
    } else if(pathname === '/author/create_process'){
        author.create_process(request, response);
    } else if(pathname === '/author/update'){
        author.update(request, response, queryData);
    } else if(pathname === '/author/update_process'){
        author.update_process(request, response);
    } else if(pathname === '/author/delete_process'){
        author.delete_process(request, response);
    } else {
        response.writeHead(404);
        response.end("Not Found");
    }
});

app.listen(3000);