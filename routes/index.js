
/*
 * GET home page.
 */

/*exports.index = function(req, res){
  res.render('index', { title: 'Express'});
};*/
var crypto = require('crypto'),
	User = require('../models/user'),
	Post = require('../models/post');

module.exports = function(app){
	app.get('/',function(req,res){
		if(req.session.error){
			req.session.error = null;
		}
		if(req.session.success){
			req.session.success = null;
		}
		Post.get(null,function(err,posts){
			if(err){
				posts = [];
			}
			res.render('index',{title: '首页',posts: posts});
		});
	}),

	app.get('/login',checkNotLogin),
	app.get('/login',function(req,res){
		res.render('login',{title: '用户登录'});
	}),

	app.post('/login',checkNotLogin),
	app.post('/login',function(req,res){
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body.password).digest('base64');
		User.get(req.body.username,function(err,user){
			if(!user){
				req.session.error = '用户不存在';
				return res.redirect('/login');
			}
			if(user.password != password){
				req.session.error = '用户口令错误';
				return res.redirect('/login');
			}
			req.session.user = user;
			if(req.session.error){
				req.session.error = null;
			}
			req.session.success = '登陆成功';
			res.redirect('/u/'+user.name);
		});
	}),

	app.get('/logout',checkLogin),
	app.get('/logout',function(req,res){
		req.session.user = null;
		req.session.error = null;
		req.session.success = '登出成功';
		res.redirect('/');
	}),

	app.get('/reg',checkNotLogin),
	app.get('/reg',function(req,res){
		res.render('reg',{title:'用户注册'});
	}),

	app.post('/reg',checkNotLogin),
	app.post('/reg',function(req,res){
		if(req.body['password-repeat'] != req.body['password']){
			req.session.error='两次输入的口令不一致';
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body['password']).digest('base64'),
			newUer = new User({
				name: req.body.username,
				password: password
			});
		User.get(newUer.name,function(err,user){
			if(user){
				err = 'Username already exists.';
			}
			if(err){
				req.session.error=err;
				return res.redirect('/reg');
			}
			newUer.save(function(err){
				if(err){
					req.session.error=err;
					return res.redirect('/reg');
				}
				req.session.user = newUer;
				req.session.success='注册成功';
				res.redirect('/');
			});
		});
	}),

	app.post('/post',checkLogin),
	app.post('/post',function(req,res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name,req.body.post);
		post.save(function(err){
			if(err){
				req.session.error = err;
				return res.redirect('/');
			}
			req.session.success = '发表成功';
			res.redirect('/u/'+currentUser.name);
		});
	}),
	
	app.get('/u/:user',checkLogin),
	app.get('/u/:user',function(req,res){
		User.get(req.params.user,function(err,user){
			if(!user){
				req.session.error = '用户不存在';
				return res.redirect('/');
			}
			Post.get(user.name,function(err,posts){
				if(err){
					req.session.error = err;
					return res.redirect('/');
				}
				res.render('user',{
					title: user.name,
					posts: posts
				});
			});
		});
	})
};

function checkLogin(req,res,next){
	if(!req.session.user){
		req.session.error = '未登录';
		return res.redirect('/login');
	}
	next();
};

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.session.error = '已登录';
		return res.redirect('/');
	}
	next();
};