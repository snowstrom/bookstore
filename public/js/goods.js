 angular.module("goods",['ngSanitize'])
	.controller("goodsCtr",['$scope', function ($scope) {
		$scope.goods="";
		$scope.currentUser="";
		$scope.login_flag=true;
		$scope.cart =[];
		$scope.sum=0;
		$scope.word="";
		var path = window.location.pathname;
        var index = path.lastIndexOf("/");
		var goods_id = path.substr(index+1);
		 
		$.post("http://127.0.0.1:3000/goods_info",{id:goods_id},function(data,status){
				$scope.$apply(function(){
					if(data){
						if(data.user){
							$scope.login_flag=false;
							$scope.currentUser=data.user;
						}
						$scope.goods = data.d;
						$scope.cart=data.cart;
						$scope.cart.forEach(function(item){
							item.src="../"+item.src;
							$scope.sum += item.total;  //计算总价值
						})
					}
				})
			});
		
		$scope.number=1;
		
        $scope.add_cart= function () {
			if(!$scope.currentUser){
				alert("请先登录!");
			}else{
				var addObj={
					id:$scope.goods.id,
					name:$scope.goods.name,
					price:$scope.goods.price,
					src:$scope.goods.src,
					num:$scope.number,
					total:parseFloat(($scope.goods.price*$scope.number).toFixed(2))
				}
				var ajaxObj = JSON.stringify(addObj);
				$.ajax({
					url:"http://127.0.0.1:3000/add_cart",
					type:"POST",
					data:ajaxObj,
					dataType:"json",
					contentType:"application/json",
					success:function(data,status){
						if(data){
							$scope.$apply(function(){
								var flag = false;
								$scope.cart.forEach(function(item){
									if(item.id == $scope.goods.id){
										flag=true;
										item.num+=$scope.number;
										item.total= parseFloat((item.price*item.num).toFixed(2));
										item.src="../"+item.src;
										$scope.sum += parseFloat(($scope.number*item.price).toFixed(2)) //更新总价值
										
									}
								});
								if(!flag){
									$scope.sum += addObj.total //更新总价值
									addObj.src="../"+addObj.src;
									$scope.cart.push(addObj);
								}	
							})
						}else{
							alter("网络异常，添加失败");
						}
					}	
				});	
			}
			
        }
		$scope.operate=function(index,method){
			var obj = {
				"index":index,
				"method":method
			}
			var ajaxObj = JSON.stringify(obj);
			$.ajax({
				url:"http://127.0.0.1:3000/operate",
				type:"POST",
				data:ajaxObj,
				dataType:"json",
				contentType:"application/json",
				success:function(data,status){
					if(data){
						$scope.$apply(function(){
							switch(method){
								case 'sub':{
									if($scope.cart[index].num>1){
										$scope.cart[index].num--;
										$scope.cart[index].total = parseFloat(($scope.cart[index].total-$scope.cart[index].price).toFixed(2));
										$scope.sum = parseFloat(($scope.sum - $scope.cart[index].price).toFixed(2));
									}
									}
									break;
								case 'add':{
										$scope.cart[index].num++;
										$scope.cart[index].total = parseFloat(($scope.cart[index].total+$scope.cart[index].price).toFixed(2));
										$scope.sum = parseFloat(($scope.sum + $scope.cart[index].price).toFixed(2));
									}
									break;
								case 'del':{
										$scope.cart.splice(index,1);
									}
									break;
							}
						})
					}else{
						alter("网络异常，操作失败");
					}
				}	
			});
		}
		
		
		
		$scope.info_flag=true;
		$scope.click_details = function(){
			$scope.info_flag=true;
			var top = $(".h2_wrap")[0].getBoundingClientRect().top;
			if(top<0){
				$(window).scrollTop(744);
			}		
		}
		$scope.click_comment = function(){
			$scope.info_flag=false;
			var top = $(".h2_wrap")[0].getBoundingClientRect().top;
			if(top<0){
				$(window).scrollTop(744);
			}	
		}
    }])             
    .directive("myLocation",function(){
        return{
            restrict:"A",
            link: function (scope,iEle,iAttrs) {
                angular.element(window).on("scroll", function () {
                    scope.$apply(function () {
                        var position=iEle[0].getBoundingClientRect().top;
						scope.nav_fix = position<0 ? true:false;
                    });
                });
            }
        }
	});