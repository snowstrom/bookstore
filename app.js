var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var db = require('./database');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('etag');
//app.use('/', routes);
//app.use('/users', users);

app.use(session({
secret:'12345',
name:'testSession',
cookie:{maxAge:3600000}, //设置有效时间为1小时
resave:false,
saveUninitialized:true,
}));

app.get('/',function(req,res){
	res.sendFile(__dirname+'/views/index.html');
});
app.get('/login',function(req,res){
	res.sendFile(__dirname+'/views/login.html');
});
app.get('/register',function(req,res){
	res.sendFile(__dirname+'/views/register.html');
});
app.get('/logout',function(req,res){
	req.session.user="";
	req.session.cart=[];
	res.sendFile(__dirname+'/views/login.html');
});
app.get('/goods/:a',function(req,res){
	res.sendFile(__dirname+'/views/goods.html');
});
app.get('/cart',function(req,res){
	if(req.session.user){
		res.sendFile(__dirname+'/views/cart.html');
	}else{
		 res.redirect('/login');
	}
})
app.get('/cart_list',function(req,res){
	res.send({user:req.session.user,cart:req.session.cart});
})
app.get('/order',function(req,res){
	if(req.session.user){
		res.sendFile(__dirname+'/views/order.html');
	}else{
		 res.redirect('/login');
	}
})
app.get('/search',function(req,res){
	res.sendFile(__dirname+'/views/search.html');
})	

app.get('/category',function(req,res){
	db.getCategory(function(data){
		if(data){
			res.send({user:req.session.user,d:data});
		}
	})
});
app.post('/goods_info',function(req,res){
	if(!req.session.cart)
		req.session.cart=[];
	db.getGoods(req.body.id,function(data){
		if(data){
			res.send({user:req.session.user,cart:req.session.cart,d:data});
		}
	})
})
app.post('/search',function(req,res){
	db.search(req.body.keyword,function(results){
		res.send({user:req.session.user,d:results});
	})
})
app.post('/login',function(req,res){
	db.login(req.body,function(flag){
		if(flag){
			req.session.user=req.body.name;
			res.send({flag:true,lastPage:req.session.lastPage});
		}else{
			res.send({flag:false});
		}
	})
});
app.post('/register',function(req,res){
	db.register(req.body,function(flag){
		if(flag){
			req.session.user=req.body.name;
			res.send({flag:true});
		}else{
			res.send({flag:false});
		}
	});
});
app.post('/add_cart',function(req,res){
	var flag=false;
	req.session.cart.forEach(function(item){
		if(item.id==req.body.id){
			flag=true;
			item.num+=req.body.num;
			item.total = parseFloat((item.price*item.num).toFixed(2));
		}
	});
	if(!flag){
		req.session.cart.push(req.body);
	}
	res.send(true);
})
app.post('/operate',function(req,res){
	switch(req.body.method){
		case 'sub':{
				if(req.session.cart[req.body.index].num>1){
					req.session.cart[req.body.index].num--;
					req.session.cart[req.body.index].total = parseFloat((req.session.cart[req.body.index].total-req.session.cart[req.body.index].price).toFixed(2));
				}
			}
			break;
		case 'add':{
				req.session.cart[req.body.index].num++;
				req.session.cart[req.body.index].total = parseFloat((req.session.cart[req.body.index].total+req.session.cart[req.body.index].price).toFixed(2));
			}
			break;
		case 'del':{
				req.session.cart.splice(req.body.index,1);
			}
			break;
	}
	res.send(true);
	
})
app.post('/submit',function(req,res){
	db.submit(req.body,function(flag){
		if(flag){
			req.session.cart=[];
			res.send(true);
		}else{
			res.send(false);
		}
		
	});
});
app.get('/order_list',function(req,res){
	db.getOrder(req.session.user,function(obj){
		obj.user= req.session.user;
		res.send(obj);
	})
})
app.post('/confirm',function(req,res){
	console.log(req.body.index);
	db.confirm(req.body.index,req.session.user,function(flag){
		res.send(flag);
	})
})	
	
	
/*	向服务器输入数据时用的
app.get('/a',function(req,res){
	res.sendFile(__dirname+'/public/add.html');
})
app.post('/add',function(req,res){
	console.log(req.body);
	db.add(req.body,function(flag){
		if(flag){
			res.send(true);
		}else{
			res.send(false);
		}
	})
})
app.post('/ass',function(req,res){
	console.log(req.body);
	db.ass(req.body,function(flag){
		if(flag){
			res.send(true);
		}else{
			res.send(false);
		}
	})
})
*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
