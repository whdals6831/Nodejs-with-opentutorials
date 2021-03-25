var template = require('./template');
var db = require('./db');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query('SELECT * FROM topic', function(error, topics){
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.html(title, list, `<h2>${title}</h2>${description}`, "<a href='/create'>create</a>");

        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(request, response, queryData){
    db.query('SELECT * FROM topic', function(error, topics){
        if(error) {
            throw error;
        }
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) {
            if(error2) {
                throw error2;
            }
            title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.html(title, list, `
            <h2>${sanitizeHtml(title)}</h2>
            ${sanitizeHtml(description)}
            <p>by ${sanitizeHtml(topic[0].name)}</p>
            `, `
                <a href='/create'>create</a> 
                <a href='/update?id=${queryData.id}'>update</a>
                <form action="/delete_process" method="post">
                    <input type="hidden" name="id" value="${queryData.id}">
                    <input type="submit" value="delete">
                </form>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create = function(request, response){
    db.query('SELECT * FROM topic', (error, topic) => {
        db.query('SELECT * FROM author', (error, authors) => {
            title = 'WEB - create';
            var list = template.list(topic);
            var html = template.html(sanitizeHtml(title), list, `
            <h2>${title}</h2>
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" cols="30" rows="10" placeholder="description"></textarea>
                </p>
                <p>
                    ${template.authorSelect(authors)}
                </p>
                <p>
                    <input type="submit">
                </p>
            </form>
            `, '')
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response){
    var body = '';
    // data가 엄청나게 많을 경우를 대비해서 data가 조각조각 들어오고
    // 수신이 완료되면 end의 callback함수를 실행한다.
    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var title = post.title;
        var description = post.description;
        // select에서 선택된 값은 option의 value값이다.
        var author_id = post.author;

        db.query('INSERT INTO topic(title, description, created, author_id) VALUES(?, ?, NOW(), ?)', [title, description, author_id], function(error, results){
            if(error) {
                throw error;
            }
            // results.inserId로 생성하는 row의 id값을 알아내 redirection한다.
            response.writeHead(302, {Location: `/?id=${results.insertId}`});
            response.end();
        })
    });
}

exports.update = function(request, response, queryData){
    db.query('SELECT * FROM topic', function(error, topics){
        if(error) {
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], 
        function(error2, topic) {
            if(error2) {
                throw error2;
            }
            db.query('SELECT * FROM author', (error3, authors) => {
                var list = template.list(topics);
                var html = template.html(sanitizeHtml(topic[0].title), list, `
                <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p><input type="text" name="title" placeholder="title" value="${sanitizeHtml(topic[0].title)}"></p>
                <p>
                    <textarea name="description" cols="30" rows="10" placeholder="description">${sanitizeHtml(topic[0].description)}</textarea>
                </p>
                <p>
                    ${template.authorSelect(authors, topic[0].author_id)}
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>`, `<a href='/create'>create</a> 
                <a href='/update?id=${topic[0].id}'>update</a>
                `);

                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response){
    var body = '';

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var id = post.id;
        var title = post.title;
        var description = post.description;
        var author_id = post.author;
        db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [title, description, author_id, id], function(error, results){
            if(error) {
                throw error;
            }

            response.writeHead(302, {Location: `/?id=${id}`});
            response.end();
        })
    });
}

exports.delete_process = function(request, response){
    var body = '';

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        db.query('DELETE FROM topic WHERE id=?', [post.id], (error, results) => {
            if(error) {
                throw error;
            }
            response.writeHead(302, {Location:'/'});
            response.end();
        })
    });
}