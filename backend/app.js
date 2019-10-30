var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session');
var mysql=require('mysql');

var db = mysql.createConnection({
	user:'root',
	password:'logiclab',
	database:'vomit',
  port:3000,
  charset  : 'utf8',
  socketPath: '/tmp/mysql.sock'
});


db.connect(function(err) {              // The server is either down
  if(err) {                                     // or restarting (takes a while sometimes).
    console.log('error when connecting to db:', err);
    //setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
  } 
  else{
    console.log("MySQL connected");
  }                                    // to avoid a hot loop, and to allow our node script to
});



var movieRouter = require("./routes/movie");

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({			//세션의 객체정보를 저장
	secret: '(($%)gj43ufd**',
	cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
 	},
	resave: false,
	saveUninitialized: true
}));

//router
app.use("/", movieRouter);
// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');


app.post('/login',function(req,res){
  
  var id=req.body.loginInfo.id;
  var pw=req.body.loginInfo.pw;
  
  db.query(`select * from user where user_id="${id}" and user_pw="${pw}"`,function(err,data){
    if(err){
      console.log("err");
      res.send("fail");
    }
    else if(data.length==0){
      // console.log("not found");
      res.send("fail");
    }
    else{
      // console.log(data[0].user_name);
      req.session.pk=data[0].user_pk;
      console.log(`session : ${req.session.pk}`);
      res.send("success");
    }
    
  });
});

app.post('/session',function(req,res){
  console.log("/session");
  if(req.session.id!=null){
    db.query(`select * from user where user_pk="${req.session.pk}"`,function(err,data){
      if(err){
        
        console.log(err);
      }
      else{
        if(data.length!=0){
          res.send("success");
        }
        else{
          res.send("fail");
        }
        
      }

    });
  }
  else{

  }

});

app.post('/logout',function(req,res){
  console.log("/logout");
  req.session.destroy(function(err){
    //res.redirect('/');
    res.end();
  });
});

app.post('/confID',function(req,res){
  var id=req.body.id; 
  db.query(`select * from user where user_id="${id}" COLLATE utf8_general_ci `,function(err,data){
    if(err){
      console.log(err);  
    }
    else{
      if(data.length != 0){
        res.send("fail");
      }
      else{
        res.send("success");
      }
    }
  });
});

app.post('/register',function(req,res){
  console.log("/register");

  db.query(`insert into user (user_id, user_pw, user_name, user_email) values("${req.body.user.id}","${req.body.user.pw}","${req.body.user.name}","${req.body.user.email}")`,function(err,data){
    if(err){
      console.log(err);
      res.send("fail");
    }
    else{
      res.send("success");
    }

  });
  
});




















// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
module.exports = app;
