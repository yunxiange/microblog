
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    MongoStore = require('connect-mongo')(express),
    settings = require('./settings'),
    partials = require('express-partials'),
    app = express();

// all environments
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.set('view options',{
	layout: true
});

app.use(express.favicon());

app.use(express.logger('dev'));

app.use(express.json());

app.use(express.urlencoded());

app.use(express.bodyParser());

app.use(express.methodOverride());

app.use(express.cookieParser());

app.use(express.session({
	secret: settings.cookieSecret,
	Store: new MongoStore({
		db: settings.db
	})
}));

app.use(function(req,res,next){
	res.locals.user=req.session.user;
	res.locals.error=req.session.error;
	res.locals.success=req.session.success;
	next();
});

app.use(partials());  //用于实现模板继承

app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
