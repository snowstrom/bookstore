angular.module("bookStore")
    .controller("indexCtr",['$scope', function ($scope) {
        $.get("http://127.0.0.1:3000/category",function(data,status){
			$scope.$apply(function(){
				if(data){
					$scope.products = data;
				}
			})
		})
		
		 
	}])
			
		
		
    .controller("goodsCtr",['$scope','$http','$location','$cookieStore','cart', function ($scope,$http,$location,$cookieStore,cart) {
        $scope.answer=$cookieStore.get("items");
        var address = $location.path();
        address=address.substr(1);
        $http.get(address+'.json').success(function (response) {
            $scope.goods=response;
        }).error(function () {
            alert("sorry I am lost !");
        });
        $scope.info_flag=true;
        $scope.comment_head=true;
        $scope.info_fun=function(){
            $scope.info_flag=true;
            $scope.comment_head=true;
        };
        $scope.comment_fun=function(){
            $scope.info_flag=false;
            $scope.comment_head=false;
        };
        $scope.add_cart= function () {
            var flag=0;
            for(var i=0;i<$scope.answer.length;i++){
                if($scope.answer[i].src==$scope.goods.src){
                    $scope.answer[i].num++;
                    $scope.answer[i].total=$scope.answer[i].price*$scope.answer[i].num;
                    flag=1;
                    break;
                }
            }
            if(flag==0){
                $scope.answer.push({
                    "src":$scope.goods.src,
                    "num":1,
                    "price":$scope.goods.price,
                    "total":$scope.goods.price
                });
            }
            $cookieStore.put("items",$scope.answer);
            var wh=$cookieStore.get("items");
            for(var k=0; k<wh.length;k++){
                console.log(wh[k]);
            }
        }

    }])
    .controller("navCtr", ['$scope',function ($scope) {
        $scope.a=true;
        $scope.b=false;
    }])
    .directive("myNavBtn", function () {
        return{
            restrict:"A",
            link: function (scope,iEle,iAttrs) {
                iEle.click(function () {
                    if(iAttrs.me=="info_btn"){
                        scope.$apply(function () {
                            scope.a=true;
                            scope.b=false;
                        })
                    }else if(iAttrs.me=="assess_btn"){
                        scope.$apply(function () {
                            scope.a=false;
                            scope.b=true;
                        })
                    }
                    if(scope.flag==true){
                        angular.element(window).scrollTop(726);
                    }
                })
            }
        }
    })
    .directive("myLocation",function(){
        return{
            restrict:"A",
            link: function (scope,iEle,iAttrs) {
                angular.element(window).on("scroll", function () {
                    scope.$apply(function () {
                        scope.position=iEle[0].getBoundingClientRect().top;
                        if(scope.position<0){
                            scope.flag=true;
                        }
                        if(scope.position>0){
                            scope.flag=false;
                        }
                    })
                });
            }
        }
}).factory("cart", function ($cookieStore) {
    $cookieStore.put("items",[{
        "src":"a",
        "num":2,
        "price":45,
        "total":45
    }]);
    return{
        items:[{
            "src":"a",
            "num":2,
            "price":45,
            "total":45
        },{
            "src":"b",
            "num":3,
            "price":65,
            "total":65
        }]
    }
}).controller("cartC",['$scope','$cookieStore','cart', function ($scope,$cookieStore,cart) {

}]);