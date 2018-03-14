/*
 * @version : v1.0
 * @author  : 饭     
 * @update ：    new Date()
 * @fn : 弹窗提示框 ！
 */

(function($){
	$.tmDialog = function(options){
		var This = this;
		var opts = $.extend({},$.tmDialog.methods,$.tmDialog.defalutes,options);
		//opts.inits(This,opts); //初始化
		opts.inits(opts);
	}
	
	/*方法设置*/
	$.tmDialog.methods = {
		
		//初始化
		inits:function(opts){
			var _this = this;
			_this.template(opts);
		},
		
		dragMoves : function(obj,opts){
			var _this = this;
			var editTlt = obj.find(".tm_title");
			var $closeBtn = obj.find(".tm_close");
			var $sureBtn = obj.find(".tm_sure");
			var $cancleBtn = obj.find(".tm_cancel");
			$closeBtn.off("mousedown").on("mousedown",_this.cancleEvent(obj));//关闭
			$cancleBtn.off("click").on("click",_this.cancleEvent(obj));//取消
			$sureBtn.off("click").on("click",function(){ //确定
				var timer = setTimeout(function(){
					opts.success && opts.success();
					clearTimeout(timer);
				},500);
				_this.cancleEvent(obj)();
			});
			
			if(opts.isDrag){
				editTlt.on("mousedown",function(ev){
					var ev = ev || window.event;
					var oldX = ev.clientX;
					var oldY = ev.clientY;
					var _left = obj.offset().left;
					var _top = obj.offset().top;
					var width = obj.width();
					var height = obj.height();
					var scrollLeft = $(window).scrollLeft();
					var scrollTop = $(window).scrollTop();
					var dottedPanel = $("<div></div>");
					dottedPanel.css({
						"width":width,
						"height":height,
						"position":"fixed",
						"overflow":"hidden",
						"border-radius":"3px",
						"left":_left-scrollLeft-2,
						"top":_top-scrollTop-2,
						"cursor":"move",
						"zIndex":"12",
						"border":"2px dashed #ccc"
					});
					$("body").append(dottedPanel);
					
					var maxLeft = $(window).width()-width;
					var maxTop = $(window).height()-height;
					var isFlag = true;
					
					$(document).on("mousemove",dragMove);
					$(document).on("mouseup",dragUp);
					
					function dragMove(ev){ //移动
						if(isFlag){
							var e = ev || window.event;
							var newX = e.clientX;
							var newY = e.clientY;
							var newdisx = Math.abs(newX - oldX);
							var newdisy = Math.abs(newY - oldY);
							if(newdisx >=10 || newdisy >=10){
								var newLeft = newX - oldX + _left - scrollLeft; 
								var newTop = newY - oldY + _top - scrollTop;
								if(newLeft<=0)newLeft=0;
								if(newTop<=0)newTop=0;
								if(newLeft>maxLeft)newLeft = maxLeft;
								if(newTop>maxTop)newTop = maxTop;
								dottedPanel.css({"left":newLeft,"top":newTop});	
							}
						}
					}
					
					function dragUp(ev){
						var resulteLeft = dottedPanel.offset().left;
						var resulteTop = dottedPanel.offset().top;
						dottedPanel.remove();
						if(resulteLeft == _left-scrollLeft-2 && resulteTop == _top-scrollTop-2)dottedPanel.remove();
						else if(resulteLeft == 0 && resulteTop == 0)return false;
						else{
							if(resulteLeft <= 0)resulteLeft = 0;
							if(resulteTop <= 0)resulteTop = 0;
							var scrollLeft = $(window).scrollLeft();
							var scrollTop = $(window).scrollTop();
							obj.animate({"left":resulteLeft-scrollLeft+2,"top":resulteTop-scrollTop+2},300);
						}
						isFlag = false;
						$(document).off("mousedown");
						$(document).off("mouseup");
					}
					return false;
				});
			}
		},
		
		//窗口改变，继续居中
		resize:function(obj){
			var _this = this;
			$(window).on("resize",function(){
				_this.getCenter(obj,true);
			})
		},
		
		//事件取消
		cancleEvent : function(obj){
			return function(){
				obj.removeClass("animated bounceInUp").addClass("animated bounceOutUp");
				$("#tm-overlay").fadeOut();
				setTimeout(function(){
					obj.remove();
					$("#tm-overlay").remove();
				},400);
				return false;
			}
		},
		
		//居中
		getCenter:function(obj,state){
			var height = obj.height();
			var width = obj.width();
			var winW = $(window).width();
			var winH = $(window).height();
			var left = (winW - width)/2;
			var top =  (winH - height)/2;
			if(!state){
				obj.css({"left":left,"top":top});
			}else{
				obj.stop(true,true).animate({"left":left,"top":top});
			}
		},
		template : function(opts){
			
			var tm_dialog = $("#tm_dialog");
			var coverlayer = $("#tm-overlay");
			if(tm_dialog.html() === undefined){
				tm_dialog = $(
					"<div class='tm_dialog' id='tm_dialog'>"+
					"			<div class='tm_title'>"+
					"				<h2 id='tm_title'>"+opts.title+"</h2>"+
					"				<a href='javascript:void(0)' class='tm_close'></a>"+
					"			</div>"+
					"			<div class='tm_contents'>"+
					"			<p class='tips-title'>"+opts.contents+"</p>"+
					"			</div>"+
					"			<div class='tm-btns'>"+
					"				<a href='javascript:void(0)' class='tm_sure'>确认</a>"+
					"				<a href='javascript:void(0)' class='tm_cancel'>取消</a>"+
					"			</div>"+
					"</div>"
				);
				coverlayer = $("<div class='tm-overlay' id='tm-overlay'></div>");
				$("body").append(tm_dialog);
				$("body").append(coverlayer);
				this.getCenter(tm_dialog);
				coverlayer.stop().fadeIn();
				tm_dialog.show().removeClass("animated bounceOutUp").addClass("animated bounceInUp");
				this.resize(tm_dialog);
				this.dragMoves(tm_dialog,opts);
			}else{
				coverlayer.stop().fadeIn();
				tm_dialog.find("#tm_title").html(opts.title);
				tm_dialog.find(".tips-title").html(opts.contents);
				tm_dialog.show().removeClass("animated bounceOutUp").addClass("animated bounceInUp");
			}
			
			return tm_dialog;
		}
	};
	
	//可配置的信息 
	$.tmDialog.defalutes = {
		/*isDrag : true, //是否可以拖拽，默认true
		closeBtn : $(".tm_close"),//配置关闭按钮
		suerBtn : $(".tm_sure"),
		cancleBtn : $(".tm_cancel"),
		success : function(){}*/
		
		isDrag : true,
		title : "标题",
		contents : "这里是内容",
		success : function(){}
		
	};
		
})(jQuery);




