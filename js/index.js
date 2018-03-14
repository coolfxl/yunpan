(function(){
	
	/* 头部部分高度自适应操作 start */
	var header = tools.$(".header")[0];//头部容器
	var headerH = header.offsetHeight;//头部高度
	var weiyunContent = tools.$(".weiyun-content")[0];//内容容器
	changeH();//内容高度
	function changeH(){
		var viewHeight = document.documentElement.clientHeight;
		weiyunContent.style.height = viewHeight - headerH + "px";
	}
	window.onresize = changeH;//窗口变化时候的高度自适应
	/* end  头部部分高度自适应操作  */
	
	
	/*  渲染文件区域数据 start  */
	var datas = data.files;//拿到渲染的数据
	var renderId = 0;
	var childs = dataControl.getChildById(datas,renderId);
	var fileList = tools.$(".file-list")[0];//拿到文件区域容器，为下面添加事件绑定做基础
	
	//var pid = 0;//用来存储公共的pid，给导航栏点击的时候，存储当前点击的pid,这是第一种做法
	var getPidInput = tools.$("#getPidInput");//还有一种做法添加隐藏域，input type hidden
	
	tools.addEvent(fileList, "click", fileListClick);
	function fileListClick(ev){//每个文件项的点击事件
		var target = ev.target;
		if(tools.parents(target,".item")){
			target = tools.parents(target,".item");
			var fileId = target.dataset.fileId; 
			renderNavFilesTree(fileId);
		}
	}
	fileList.innerHTML = createFilesHtml(datas,0);//默认一上来就渲染这个ID下面所有的文件数据，根据ID渲染文件列表下的内容
	//移动、删除、重名的时候也要重新渲染该ID下的所有数据,因为三种操作都是在该ID下的操作，这个时候的ID就是getPidInput的value
	/*  end 渲染文件区域数据  */
	
	
	/*  渲染树形菜单区域数据 start  */
	var treeMenu = tools.$(".tree-menu")[0];//获取树形菜单容器
	var pathNav = tools.$(".path-nav")[0];//获取文件导航栏的容器
	tools.addEvent(pathNav, "click", function(ev){
		var target = ev.target;
		if(tools.parents(target, "a")){
			var fileId = target.dataset.fileId;
			renderNavFilesTree(fileId);
		}
	});
	
	var empty = tools.$(".g-empty")[0];//项目中没有文件提醒的内容  无文件
	treeMenu.innerHTML = treeHtml(datas, -1);//渲染树形菜单内容，根据pid渲染树形菜单的内容
	//因为datas中的第一级的pid是-1开始加载，所以设置为-1，后面设置为动态的
	pathNav.innerHTML = createPathNavHtml(datas, 0);//页面加载时候初始化追加内容
	positionTreeById(0)//通过ID定位到树形菜单添加class,使得当前菜单有背景样式
	tools.addEvent(treeMenu, "click", function(ev){//通过点击树形菜单渲染导航栏，利用事件委托冒泡的特性
		var target = ev.target;//找到当前点击的HTML元素
		if(tools.parents(target, ".tree-title")){//找到当前元素的特定的父节点div class="tree-title"
			target = tools.parents(target, ".tree-title");//获取父级元素
			//console.dir(target)查看对象身上的属性
			var fileId = target.dataset.fileId;//获取特定父级元素的ID
			renderNavFilesTree(fileId);
			
			getPidInput.value = fileId;//通过隐藏域记录当前操作的父级ID，也就是点击的瞬间的文件的ID
		}
	});
	/*  end 渲染菜单区域数据  */
	
	/*通过指定的ID渲染文件区域和文件导航区域和树形菜单区域 start *///什么时候触发和执行这个操作要知道
	function renderNavFilesTree(fileId){
		//文件导航上的操作：导航上追加内容或者减少内容
		pathNav.innerHTML = createPathNavHtml(datas, fileId);
		//文件列表上的操作：显示文件具体的文件子元素或者显示没有文件提示
		var hashChild = dataControl.hasChilds(datas, fileId);//如果点击的单文件项下面没有子文件，那么需要进行提示
		if(hashChild){//如果有子数据，就渲染出子数据的结构
			//找到当前这个ID下所有的子数据，渲染在文件区域中
			empty.style.display = "none";
			fileList.innerHTML = createFilesHtml(datas, fileId);//文件内容区域根据树形菜单点击的项进行展示
		}else{
			empty.style.display = "block";
			fileList.innerHTML = "";//清空fileList里面的内容，只要里面没有内容就清空
		}
		//树形菜单上的操作：需要给点击的树形菜单上的div添加上样式，其余的div没有样式
		var treeNav = tools.$(".tree-nav",treeMenu)[0];//给点击的特定父级元素添加背景，结合tree-nav找到该元素，因为tree-nav只有一个
		tools.removeClass(treeNav, "tree-nav");//树形菜单点击的时候去除其他项的背景
		positionTreeById(fileId);//树形菜单点击的时候给点击的项添加选中背景
		
		
		getPidInput.value = fileId;//通过隐藏域记录一下当前操作的父级ID
		
		//最后：文件列表区域重新绑定上鼠标移入移出以及单选框点击事件
		//每次重新在fileList中生成文件，那么需要给这些文件绑定样式事件
		tools.each(fileItem, function(item, index){
			fileHandle(item);
		});
		//去除全选框
		tools.removeClass(checkedAll, "checked");
		
	}
	/* end 通过指定的ID渲染文件区域和文件导航区域和树形菜单区域 */
	
	/* 文件区域各种事件操作的样式添加 start  */
	var fileItem = tools.$(".file-item", fileList);//找到文件区域下的单个文件项集合
	var checkboxs = tools.$(".checkbox", fileList);//找到文件区域所有的checkbox
	
	tools.each(fileItem, function(item, index){//接收数组或者类数组进行循环，有两个参数，循环的每一项和下标
		fileHandle(item);
	});
	
	function fileHandle(item){//给单独一个文件添加鼠标移入移出以及单选框单击事件，同时判断是否有全选
		var checkbox = tools.$(".checkbox", item)[0];
		tools.addEvent(item, "mouseenter", function(){//鼠标移入显示样式，这在开发过程中是一种很实用的技巧，直接将样式赋在某个元素上
			tools.addClass(this, "file-checked");//添加选中样式
		});
		tools.addEvent(item, "mouseleave", function(){//以后要多使用这样的方式，如果需要某种样式，直接定义成css样式，要的时候添加，不用的时候去掉即可
			if(!tools.hasClass(checkbox, "checked")){//如果有了选中样式则不添加
				tools.removeClass(this, "file-checked");
			}
		});
		/**
		 * return false是阻止添加在on事件上的默认事件和冒泡
		 * 阻止冒泡是添加在没有on事件上的阻止冒泡
		 */
		tools.addEvent(checkbox, "click", function(ev){//给单选框绑定点击事件
			var isaddClass = tools.toggleClass(this, "checked");
			if(isaddClass){//如果当前勾选上了，那么继续判断是否所有的checkedbox是否全部勾选了
				if(wholeSelect().length == checkboxs.length)tools.addClass(checkedAll, "checked");
			}else{//如果当前这个checkedbox没有被勾选，那么全选按钮就不能有classchecked
				tools.removeClass(checkedAll, "checked");
			}
			ev.stopPropagation();
		});
	}
	
	//全选按钮的单击事件
	var checkedAll = tools.$(".checked-all")[0];//获取全选按钮
	tools.addEvent(checkedAll, "click", function(){//全选按钮绑定事件
		var isAddClass = tools.toggleClass(this, "checked");//判断是否有全选样式
		if(isAddClass){//如果已经勾选了全选，那么
			tools.each(fileItem, function(item, index){
				tools.addClass(item,"file-checked");//将文件区域内所有文件全部选中，添加背景
				tools.addClass(checkboxs[index], "checked");//将文件区域所有文件的勾选框进行勾选
			});
		}else{//如果没有勾选这个样式，那么就循环全部清除这个样式
			tools.each(fileItem, function(item, index){
				tools.removeClass(item, "file-checked");
				tools.removeClass(checkboxs[index], "checked");
			})
		}
	});
	/* end 文件区域各种事件操作的样式添加  */
	
	function wholeSelect(){//找到所有checkbox勾选的文件
		var arr = [];//找到checkbox，如果有class为checked，那么就放在数组中
		tools.each(checkboxs, function(checkbox, index){
			if(tools.hasClass(checkbox, "checked")){
				arr.push(fileItem[index]);//如果当前checkbox有class checked，那么就将他的父级fileitem存下来，方便后面做删除的时候用
			}
		});
		return arr;		
	}
	
	//文件区域新建文件的功能，添加新文件
	var create = tools.$(".create")[0];
	tools.addEvent(create, "mouseup", function(){//鼠标抬起的时候创建一个新文件
		//需要把为空的提示背景给隐藏起来
		empty.style.display = "none";
		
		var newElement = createFileElement({
			title:"",
			id:new Date().getTime()
		})
		fileList.insertBefore(newElement, fileList.firstElementChild);
		
		var fileTitle = tools.$(".file-title", newElement)[0];//获取标题
		var fileEditor = tools.$(".file-edtor", newElement)[0];//获取编写的输入框
		
		var edtor = tools.$(".edtor", newElement)[0];
		
		fileTitle.style.display = "none";
		fileEditor.style.display = "block";
		
		edtor.select();//自动获取光标
		create.isCreate = true;//创建文件的标志位
	});
	
	tools.addEvent(document, "mousedown", function(){//判断一下新创建的元素中的输入框是否有内容，如果有内容就创建，没有内容就removeChild
		if(create.isCreate){
			var firstElement = fileList.firstElementChild;//获取到创建出来的第一个元素
			var edtor = tools.$(".edtor", firstElement)[0];
			var value = edtor.value.trim();
			
			if(value == ""){
				fileList.removeChild(firstElement);
				//要看一下fileList里面是否有内容
				if(fileList.innerHTML == ""){//或者判断当前ID里面有没有子元素即可
					empty.style.display = "block";
				}
			}else{
				var fileTitle = tools.$(".file-title", firstElement)[0];
				var fileEdtor = tools.$(".file-edtor", firstElement)[0];
				fileTitle.style.display = "block";
				fileEdtor.style.display = "none";
				fileTitle.innerHTML = value;
				
				fileHandle(firstElement);//给新创建的文件添加事件处理
				//至此文件区域添加文件的操作完成了
				
				//接下来就是树形菜单区域如何动态添加刚刚新创建的文件
				//当前文件创建的title，在哪一个文件创建的
				var pid = getPidInput.value;
				var fileId = tools.$(".item",firstElement)[0].dataset.fileId;//当前元素的ID
				//如果有后台，这时候，就要把fileId放置到后台，这时候没有后台，就利用data来存储
				
				//把新创建的元素的结构，放在数据中
				var newFileData = {
					id:fileId,
					pid:pid,
					title:value,
					type:"file"
				}
				datas.unshift(newFileData);//如果有后台，这时候应该利用ajax将数据传到后台
				
				//通过pid，找到属性菜单中的div元素
				var element = document.querySelector(".tree-title[data-file-id='"+ pid +"']");//获取跟定位ID相同的元素   重要
				var nextElementUl = element.nextElementSibling;//找到当前元素的下一个元素
				//只需要找到指定的ul，append一个li元素即可
				var level = dataControl.getLevelById(datas, fileId);
				nextElementUl.appendChild(createTreeHtml({
					title:value,
					id:fileId,
					level:level
				}));
				
				if(nextElementUl.innerHTML != ""){
					tools.addClass(element, "tree-contro");//添加图标样式，说明里面有子元素
					tools.removeClass(element, "tree-contro-none");
				}
				//创建成功提示
				tipsFn("ok", "新建文件成功");
				
			}
			create.isCreate = false;//无论创建是否成功，状态都要设置为false。
		}
	});
	
	
	//封装小提示
	var fullTipBox = tools.$(".full-tip-box")[0];
	var tipText = tools.$(".text", fullTipBox)[0];
	function tipsFn(cls, title){
		//每次调用的时候，都要从-32px开始向0的位置运动
		fullTipBox.style.top = "-32px";
		fullTipBox.style.transition = "none";
		
		//给样式一个缓冲效果
		setTimeout(function(){
			fullTipBox.className = "full-tip-box";
			fullTipBox.style.top = 0;
			fullTipBox.style.transition = ".3s";
			tools.addClass(fullTipBox, cls);
			tipText.innerHTML = title;
		}, 0);
		
		//保证定时器只有一个在开着
		clearTimeout(fullTipBox.timer);	
		fullTipBox.timer = setTimeout(function(){
			fullTipBox.style.top = "-32px";
		}, 2000);
	}
	
	
	//框选的功能
	var newDiv = null;
	var disX = 0, disY = 0;
	tools.addEvent(document, "mousedown", function(ev){
		
		//如果事件源元素是在.nav-a这些元素身上， 就没有框选效果
		var target = ev.target;
		if(tools.parents(target, ".nav-a")){
			return;
		}
		
		disX = ev.clientX;
		disY = ev.clientY;

		tools.addEvent(document, "mousemove", moveFn);
		tools.addEvent(document, "mouseup", upFn);
		
		//去掉默认行为,不框选文字
		ev.preventDefault();
	});
	
	
	function moveFn(ev){
		//在移动的过程中的位置 - 鼠标点击的位置 > 5的时候，再显示框
		if(Math.abs(ev.clientX - disX) > 5 || Math.abs(ev.clientY - disY) > 5){
			
			if(!newDiv){
				newDiv = document.createElement("div");
				newDiv.className = "selectTab";
				document.body.appendChild(newDiv);
			}
			newDiv.style.width = 0;
			newDiv.style.height = 0;
			newDiv.style.display = "block";
			newDiv.style.left = disX + "px";
			newDiv.style.top = disY + "px";
			
			var w = ev.clientX - disX;
			var h = ev.clientY - disY;
			
			newDiv.style.width = Math.abs(w) + "px";
			newDiv.style.height = Math.abs(h) + "px";
			//鼠标懂的过程中的clientX和爱鼠标摁下的disX，哪一个值小就把这个值赋给睡
		
			newDiv.style.left = Math.min(ev.clientX, disX) + "px";
			newDiv.style.top = Math.min(ev.clientY, disY) + "px";
			
			//做一个碰撞检测
			//拖拽的newdiv和哪些文件碰上，如果碰上的文件添加样式，没有碰上的取消样式
			tools.each(fileItem, function(item, index){
				if(tools.collisionRect(newDiv, item)){//这个时候就碰撞上了
					tools.addClass(item,"file-checked");
					tools.addClass(checkboxs[index], "checked");
				}else{
					tools.removeClass(item, "file-checked");
					tools.removeClass(checkboxs[index], "checked");
				}
			});
			
			if(wholeSelect().length == checkboxs.length){
				tools.addClass(checkedAll, "checked");
			}else{
				tools.removeClass(checkedAll, "checked");
			}
			
		}
	}
	
	function upFn(){
		tools.removeEvent(document, "mousemove", moveFn);
		tools.removeEvent(document, "mouseup", upFn);
		if(newDiv) newDiv.style.display = "none";
	}
	
	
	
	
	
	
	
	
	/**
	 * 新增
	 * 2017/10/13
	 */
	
	//下载  制作成功
	$(".download").on("click",function(){
		if(wholeSelect().length == 0){
			tipsFn("warn", "请选择文件");	
		}else{
			tipsFn("warn", "无法生成下载链接");
		}
		
	});
	
	
	//分享 制作成功
	$("#share").on("click",function(){
		if(wholeSelect().length == 0){
			tipsFn("warn","请选择文件！");
		}else{
			$("#overlayout").fadeIn();
			$("#shareS").tmDrags({
					isDrag : true, //是否可以拖拽，默认true
					closeBtn : $(".close"),
					cancleBtn : $(".cancle"),
					closeFn : function(){
						$("#overlayout").fadeOut(); //关闭时触发，关闭遮盖层
					}
			});
			$("#shareS").find(".bdsharebuttonbox > a").on("click",function(){
				$("#overlayout").fadeOut();
				$("#shareS").fadeOut();
			});
		}
	});
	
	
	// 重命名
	$("#rename").on("click",function(ev){
		if(wholeSelect().length == 0){
			tipsFn("warn","请选择一个文件");
		}
		if(wholeSelect().length > 1){
			tipsFn("warn","一次只能重命名一个文件");
		}
		if(wholeSelect().length == 1){
			ev.stopPropagation();
			//获取操作元素
			var fileItem = wholeSelect()[0];
			var fileTitle = tools.$(".file-title", fileItem)[0];
			var fileEdtor = tools.$(".file-edtor", fileItem)[0];
			var edtor = tools.$(".edtor", fileItem)[0];	
			var fileId = tools.$(".item", fileItem)[0].dataset.fileId;
			//样式显示
			fileTitle.style.display = "none";
			fileEdtor.style.display = "block";
			edtor.select();
			//找到树形菜单当前选中的对象
			var currMenuId = getPidInput.value;
			var currItem = document.querySelector(".tree-title[data-file-id='"+fileId+"']");
			var pastName = tools.$(".ellipsis",currItem)[0].innerHTML;
			//console.log(currMenuId,currItem,pastName);
			edtor.onclick = function(ev){
				ev.stopPropagation();
			}
			/*$(edtor).on("focus",function(){
				// Does the element have focus:
				var hasFocus = $('input').is(':focus');
			});*/
			$(document).on("click", function(){
				var hasFocus = $(edtor).is(':focus');//这一步很关键
				if(hasFocus){
					var val = edtor.value.trim();
					if(val == ""){
						tipsFn("warn", "文件名不能为空");
						return;
					}else{
						var isExist = dataControl.isNameExsit(datas,currMenuId,val,fileId);
						if(isExist){
							tipsFn("err","重命名失败，已经存在该名");
							return;
						}else{
							tools.$(".ellipsis",currItem)[0].innerHTML = val;//改树形菜单
							fileTitle.innerHTML = val;//改文件列表
							edtor.value = val;//改文件列表
							var flag = dataControl.changeNameById(datas,fileId,val);
							console.log(flag);
							fileTitle.style.display = "block";
							fileEdtor.style.display = "none";
							tipsFn("ok","重命名成功!");
						}
					}
				}
				
			});
		}
	});
	
	
	//删除 制作成功
	$(".delect").on("click",function(){
		//获取要删除的文件夹【即：当前选中的】
		var deleteFiles = wholeSelect();
		if(!deleteFiles.length){
			tipsFn("warn", "请至少选择一个要删除的文件");
		}else{
			
			$.tmDialog({ //删除提示
				title : "删除提示",
				contents : "确定要删除文件吗？",
				success : function(){ //确定删除
					for(var i=0;i<deleteFiles.length;i++){//没有全选则说明直接删除，并且删除datas中的数据即可
						var id = deleteFiles[i].firstElementChild.dataset.fileId;//这里有id，那么就可以利用ajax去删除后台的数据了
						//获取对应的树形菜单 menu，ajax返回成功之后，再执行这下面的操作
						$(".tree-title[data-file-id='"+id+"']").closest("li").remove();
						dataControl.deleteById(datas, id);//删除数据中的数据
					}
					/*
					 * 学到一个东西，就是当前后台不需要频繁交互的时候，应该一次性把后台所有数据都传出来，
					 * 放入浏览器或者本地缓存中，利用工前台做增删改查，这样用户只有真正的重新登录或者刷新页面的时候
					 * 才会再一次想服务器请求数据，当然其中一些重要的过程和操作还是要立即和服务器通讯的
					 */
					renderAfterAll();
					//提示文件删除成功treeMenu.innerHTML = treeHtml(datas, -1);
					tipsFn("ok","删除文件成功");
				}
			});
		}
	});
				
	
	function selctCurrTreeMenu(obj,currid){
		currid = currid || 0;
		var $obj = $(obj);
		var $ele = $obj.find(".tree-title[data-file-id='"+currid+"']");
		$obj.find(".tree-title").removeClass("tree-nav"); //取消其他选中状态
		$ele.addClass("tree-nav"); //为当前的menu添加选中状态
	}
	
	//移动
	$(".move").on("click",function(){
		
		var moveFile = wholeSelect(); //获取要移动的文件,一个文件就是一个file-item对象，也就是该file-item对应的div对象
		if(!moveFile.length){ 
			tipsFn("warn", "请选择要移动的文件");
		}
		else if(moveFile.length >= 2){
			tipsFn("warn", "暂时只能单个文件进行移动！");
		}
		else{
			$("#overlayout").fadeIn(); //显示遮盖层
			
			//为显示的移动目录做准备
			//重新渲染 目录结构
			var $treeMenu = $("#treeMenuPanel");
			var TreeMenuHtml = treeHtml(datas, -1);//文件备选区域
			$treeMenu.html(TreeMenuHtml);
			selctCurrTreeMenu($treeMenu,0); //默认选中第一个，这样就默认为选中的文件分配了一个目标位置
			
			//为当前的树形目录绑定选中事件
			$("#treeMenuPanel").off("click").on("click",".tree-title",function(){
				$("#treeMenuPanel").find(".tree-title").removeClass("tree-nav");
				$(this).addClass("tree-nav");
			});
			
			//显示 文件移动位置选择 窗口
			$("#moveToOther").tmDrags({
				isDrag : true, //是否可以拖拽，默认true
				closeBtn : $(".close"),
				suerBtn : $(".sure"),
				cancleBtn : $(".cancle"),
				closeFn : function(){
					$("#overlayout").fadeOut(); //关闭时触发，关闭遮盖层     renderNavFilesTree(fileId);
				},
				callback : function(){ //成功回调
					var treeMenuList = tools.$("#treeMenuPanel");//获取移动插件树形菜单
					var targetId = tools.$(".tree-nav",treeMenuList)[0].dataset.fileId; // 获取目标位置的file-id
					var currentId = tools.$(".item", moveFile[0])[0].dataset.fileId;//获取当前ID
					var currentPid = dataControl.getPidById(datas, currentId);
					console.log(currentPid);
					/**
					 * 接下来的操作就是判断，是否可以移动
					 */
					//1.自己不鞥呢移动到自己身上
					if(currentId == targetId){
						tipsFn("err","移动失败，当前文件就是被移动文件");
						return;
					}else{
						//获取当前要移动的目标位置的所有父级【目的：父级 不能 移动到 子集】
						var parents =  dataControl.getParents(datas,targetId);
						// 去除本身元素 ： 
						for(var i=0;i<parents.length;i++){
							if(parents[i].id == targetId){
								parents.splice(i,1);
							}
						}
						//判断要移动到的目标位子 是不是要移动文件的子文件
						var isExist = dataControl.isChildsOfCurrent(parents,currentId);
						console.log(parents,isExist);
						if(isExist){//如果移动的文件是目标文件的父亲，则不能移动
							tipsFn("err","移动失败，该文件是移动文件的子文件");
							return;
						}else if(currentPid == targetId){//如果移动文件和目标文件一致，则不能移动
							tipsFn("warn","该文件已经在该目录下了");
							return;
						}else{//否则说明移动的文件和目标文件不在同一级，或者在同一级的不同目录下
							tipsFn("ok","移动成功");
							for(var i=0;i<datas.length;i++){
								if(datas[i].id == currentId){
									datas[i].pid = targetId; //修改 parent id
								}
							}
							renderAfterAll();
						}
					}
					
					/*
					 * 以下操作是没有判断的时候也可以正确执行的操作
					 */
					/*for(var i=0;i<datas.length;i++){
						if(datas[i].id == currentId){
							datas[i].pid = targetId; //修改 parent id
						}
					}
					renderAfterAll();*/
				}
			});
		}
	});
	
	function renderAfterAll(){
		renderNavFilesTree($("#getPidInput").val());//根据当前操作元素的父级ID进行渲染
		fileList.innerHTML = createFilesHtml(datas,$("#getPidInput").val());//文件列表区域重新渲染该pid下的数据
		treeMenu.innerHTML = treeHtml(datas, -1);//渲染树形菜单内容，根据pid渲染树形菜单的内容
		selctCurrTreeMenu(treeMenu,$("#getPidInput").val()); //默认选上一次选中过的
		tools.each(fileItem, function(item, index){//接收数组或者类数组进行循环，有两个参数，循环的每一项和下标
			fileHandle(item);
		});
	}
	
	//刷新
	$(".reload").on("click",function(){
		location.reload();
	});
	
}())
