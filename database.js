var mongoose=require("mongoose");
//连接数据库
var mongoose=require("mongoose");
mongoose.Promise = global.Promise;
var db=mongoose.connect("mongodb://127.0.0.1:27017/bookstore");
db.connection.on("error",function(error){
	console.log("数据库连接失败："+error);
});
db.connection.on("open",function(){
	console.log("数据库连接成功");
});
var Schema =mongoose.Schema;
//存放注册好的用户的账号和密码的模具
var userSchema = new Schema({
	name:String,
	password:String
});
//存放主页中一个类别的信息
var categorySchema = new Schema({
	type:String,
	list:Array
});
//存放一个商品的信息
var goodsSchema = new Schema({
	id:String,
	name:String,
	src:String,
	price:Number,
	post:Number,
	sail:Number,
	comment:Number,
	stock:Number,
	relate:Array,
	basic:{
		title: String,
		packag:String,
		name:String,
		price:String, 
		press:String, 
		press_time:String, 
		author:String, 
		block:String,
		format:String 
	},
	book_info:String,
	catalog:String,
	rate:String,
	assess:Array
});

//存储用户的订单
var orderSchema = new Schema({
	username:String,
	user_info:{
		name:String,
		tel:String,
		address:String
	},
	list:Array
});


var users = mongoose.model("users",userSchema);
var categorys = mongoose.model("categorys",categorySchema);
var goods = mongoose.model("goods",goodsSchema);
var orders = mongoose.model("orders",orderSchema);

/*向数据库添加数据时用的函数
function ass(arr,callback){
	var flag=true;
	arr.forEach(function(item){
		var m = new categorys({
			type:item.type,
			list:item.list
		});
		m.save(function(err,m){
			if(err)
				{
					console.log("保存大类出现异常");
					flag=false;
				}
			else
				{
					console.log("保存大类成功!");
				}
		})
	})
	callback(flag);
}

function add(obj,callback){
	goods.findOne({id:obj.id},function(err,item){
		if(item){
			callback(false);	
		}else{
			var good = new goods({
				id:obj.id,
				name:obj.name,
				src:obj.src,
				price:obj.price,
				post:obj.post,
				sail:obj.sail,
				comment:obj.comment,
				stock:obj.stock,
				relate:obj.relate,
				basic:{
					title: obj.basic.title,
					packag:obj.basic.package,
					name:obj.basic.name,
					price:obj.basic.price, 
					press:obj.basic.press, 
					press_time:obj.basic.press_time, 
					author:obj.basic.author, 
					block:obj.basic.block,
					format:obj.basic.format 
				},
				book_info:obj.book_info,
				catalog:obj.catalog,
				rate:obj.rate,
				assess:obj.assess
			});
			good.save(function(err,good){
				if(err)
					console.log("保存数据出现异常")
				else
					console.log(good.id + "保存成功");
					callback(true);
			})
		}
	})
	 
}
*/
function getCategory(callback){
	categorys.find({},function(err,categorys){
		if(err){
			console.log("查询数据库获取首页JSON数据出现异常")
		}
		callback(categorys);
	})
}

function getGoods (parma,callback){
	goods.findOne({id:parma},function(err,good){
		if(err)
			console.log("查询数据库获取商品详情 出现异常");
		else
			callback(good);
	})
}


function register(obj,callback){
	users.findOne({name:obj.name},function(err,user){
		if(err)console.log("注册新用户是出现异常");
		if(user){
			callback(false);
		}else{
			var user = new users({
				name:obj.name,
				password:obj.password
			});
			user.save(function(err,user){
				if(err){
					console.log("注册新用户 出现异常");
				}else{
					console.log("注册新用户 成功");
					callback(true);
				}
			});
		}
		
	})
}
function login(user,callback){
	users.findOne({name:user.name,password:user.password},function(err,user){
		if(!user){
			callback(false);
		}else{
			callback(true);
		}
	})
}

function submit(obj,callback){
	 var order = new orders({
				username:obj.username,
				user_info:{
					name:obj.user_info.name,
					tel:obj.user_info.tel,
					address:obj.user_info.address
				},
				list:obj.list
			});
		order.save(function(err,order){
			if(err){
				console.log("订单保存失败");
				callback(false);
			}else{
				console.log("订单保存成功");
				callback(true);
			}
		});
}
function getOrder(name,callback){
	var f=true;
	orders.find({username:name},function(err,order){
		if(err){
			console.log("在数据库中查询指定订单 出现异常");
			f=false;
		}
		if(order){
			var list=[];
			order.forEach(function(item){
				list = list.concat(item.list);
			});
			console.log(list);
		}else{
			var list=[];
		}
		callback({order_list:list,flag:f});
	})
}

function confirm(index,name,callback){
	var f=true;
	orders.find({username:name},function(err,order){
		if(err){
			console.log("在数据库中查询指定订单 出现异常");
			f=false;
		}
		if(order){
			var list=[];
			var m = 1;
			order.forEach(function(item){
				list = list.concat(item.list);
				if(list.length>index && m==1){
					m=0;
					var key = item.list.length-list.length+index;
					item.list.splice(key,1);
					if(item.list.length==0){
						item.remove(function(err,i){
							console.log("确认收货成功，已删除相关订单");
						});
					}else{
						item.save(function(err,item){
							console.log("确认收货成功");
						});
					}	
				}
			});
		}else{
			console.log("没找到要确认收的货");
		}
		callback(f);
	});
}
function search(keyword,callback){
	keyword = keyword.replace(/([*.+?+$^[]()|\/])/gi,'\\$1');
	keyword = '.*'+keyword+'.*';
	
	var regex = new RegExp(keyword,'i')
	goods.find({name:regex},function(err,results){
		if(err)console.log("搜索指定关键字的商品 数据库出现异常");
		callback(results);
	})
}

//exports.add = add;
//exports.ass = ass;
exports.getCategory = getCategory;
exports.getGoods = getGoods;
exports.register = register;
exports.login = login;
exports.submit = submit;
exports.getOrder = getOrder;
exports.confirm = confirm; 
exports.search = search;



