var db = require('./db');
var template = require('./template');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');

exports.home = function(request, response){
    db.query('SELECT * FROM topic', function(error, topics){
        db.query('SELECT * FROM author', (error, authors) => {
            var title = 'author';
            var list = template.list(topics);
            var table = template.authorTable(authors);
            table += `
            <form action="/author/create_process" method="post">
                <p><input type="text" name="name" placeholder="name"></p>
                <p>
                    <textarea name="profile" cols="30" rows="5" placeholder="profile"></textarea>
                </p>
                <p>
                    <input type="submit" value="create">
                </p>
            </form>
            `
            var html = template.html(title, list, table, `<h2>${title}</h2>`);

            response.writeHead(200);
            response.end(html);
        })
    })
}

exports.create_process = function(request, response){
    var body = '';

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var name = post.name;
        var profile = post.profile;
        db.query('INSERT INTO author (name, profile) VALUES (?, ?)', [name, profile], (error, result) => {
            if(error) {
                throw error;
            }
            response.writeHead(302, {Location:'/author'});
            response.end();
        })
    });
}

exports.update = function(request, response, queryData){
    db.query('SELECT * FROM topic', function(error, topics){
        db.query('SELECT * FROM author', (error, authors) => {
            db.query('SELECT * FROM author WHERE id=?', [queryData.id], (error, author) => {
                var title = 'author';
                var list = template.list(topics);
                var table = template.authorTable(authors);
                table += `
                <form action="/author/update_process" method="post">
                    <input type="hidden" name="id" value="${author[0].id}">
                    <p><input type="text" name="name" placeholder="name" value=${sanitizeHtml(author[0].name)}></p>
                    <p>
                        <textarea name="profile" cols="30" rows="5" placeholder="profile">${sanitizeHtml(author[0].profile)}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                </form>
                `
                var html = template.html(title, list, table, `<h2>${title}</h2>`);

                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response, queryData){
    var body = '';

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var name = post.name;
        var profile = post.profile;
        var author_id = post.id;

        db.query('UPDATE author SET name=?, profile=? WHERE id=?', [name, profile, author_id], (error, results) => {
            if(error){
                throw error;
            }
            response.writeHead(302, {Location:'/author'});
            response.end();
        })
    })
}

exports.delete_process = function(request, response) {
    var body = '';

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);
        var author_id = post.id;
        // 저자를 삭제하면 저자가 작성한 글도 삭제되게 구성
        db.query('DELETE FROM topic WHERE author_id=?', [author_id], (error1, result1) => {
            if(error1) {
                throw error1;
            }
            db.query('DELETE FROM author WHERE id=?', [author_id], (error2, result2) => {
                if(error2) {
                    throw error2;
                }
                response.writeHead(302, {Location:'/author'});
                response.end();
            });
        }); 
    });
}