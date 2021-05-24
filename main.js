const { request, response } = require('express');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
const template = require('./lib/template.js');
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const { get } = require('http');
const qs = require('querystring');
var bodyParser = require('body-parser')
var compression = require('compression');

//bodyparser middelware
app.use(bodyParser.urlencoded({ extended: false }));

//compression
app.use(compression());

// writing middleware
app.get('*',(request,response,next)=>{
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

app.use(express.static('public'));

// Route
app.get('/', (request, response) => {

    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}
      <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">
      `
      
      ,
      `<a href="/create">create</a>`
    );
    response.send(html);

});

app.get('/page/:pageId',(request,response,next)=>{
 
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      if(err){
        next(err);
      }else{
        var title = request.params.pageId;
        var sanitizedTitle = sanitizeHtml(title);
        var sanitizedDescription = sanitizeHtml(description, {
          allowedTags:['h1']
        });
        var list = template.list(request.list);
        var html = template.HTML(sanitizedTitle, list,
          `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
          ` <a href="/create">create</a>
            <a href="/update/${sanitizedTitle}">update</a>
            <form action="/delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>`
        );
        response.send(html);
      }
    });
 
});

app.get('/create',(request,response)=>{
    var title = 'WEB - create';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <form action="/create_process" method="post">
        <p><input type="text" name="title" placeholder="title"></p>
        <p>
          <textarea name="description" placeholder="description"></textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
    `, '');
    response.send(html);
});

app.post('/create_process',(request,response)=>{
      var post = request.body;
      var title = post.title;
      var description = post.description;
      fs.writeFile(`data/${title}`, description, 'utf8', function(err){
        response.redirect('/');
  });
});

app.get('/update/:updateId',(request,response)=>{
    var filteredId = path.parse(request.params.updateId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.updateId;
      var list = template.list(request.list);
      var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
      );
      response.send(html);
    });
});

app.post('/update_process',(request,response)=>{

          var post = request.body;
          var id = post.id;
          var title = post.title;
          var description = post.description;
          fs.rename(`data/${id}`, `data/${title}`, function(error){
            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
              response.redirect('/');
            })
          });
});

app.post('/delete_process', (request,response)=>{
  
      var post = request.body;
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/');
  });
});

app.use(function(req,res,next){
  res.status(404).send('Sorry cant find that!');
});

app.use(function(err,req,res,next){
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

