const { request, response } = require('express');
const express = require('express')
const app = express()
const port = 3000
const fs = require('fs');
var bodyParser = require('body-parser')
var compression = require('compression');
var topicRouter = require('./routes/topic');
var indexRouter = require('./routes/index');
var helmet = require('helmet');
//security
app.use(helmet());

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
app.use('/',indexRouter);
app.use('/topic',topicRouter);

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

