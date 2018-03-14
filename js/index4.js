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
	var fileList = tools.$(".file-list")[0];//拿到文件区域
	
	//var pid = 0;//用来存储公共的pid，给导航栏点击的时候，存储当前点击的pid,这是第一种做法
	var getPidInput = tools.$("#getPidInput");//还有一种做法添加隐藏域，input type hidden
	
	tools.addEvent(fileList, "click", function(ev){
		var target = ev.target;
		if(tools.parents(target,".item")){
			target = tools.parents(target,".item");
			var fileId = target.dataset.fileId; 
			renderNavFilesTree(fileId);
		}
	});
	fileList.innerHTML = createFilesHtml(datas,0);//默认一上来就渲染这个ID下面所有的文件数据
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
	treeMenu.innerHTML = treeHtml(datas, -1);//渲染树形菜单内容，因为datas中的第一级的pid是-1开始加载，所以设置为-1，后面设置为动态的
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
	
	/*通过指定的ID渲染文件区域和文件导航区域和树形菜单区域 start */
	function renderNavFilesTree(fileId){
		pathNav.innerHTML = createPathNavHtml(datas, fileId);//追加内容
			
		var hashChild = dataControl.hasChilds(datas, fileId);//如果点击的项没有子文件，那么需要进行提示
		if(hashChild){//如果有子数据，就渲染出子数据的结构
			//找到当前这个ID下所有的子数据，渲染在文件区域中
			empty.style.display = "none";
			fileList.innerHTML = createFilesHtml(datas, fileId);//文件内容区域根据树形菜单点击的项进行展示
		}else{
			empty.style.display = "block";
			fileList.innerHTML = "";//清空fileList里面的内容，只要里面没有内容就清空
		}
		//需要给点击的div添加上样式，其余的div没有样式
		var treeNav = tools.$(".tree-nav",treeMenu)[0];//给点击的特定父级元素添加背景，结合tree-nav找到该元素，因为tree-nav只有一个
		tools.removeClass(treeNav, "tree-nav");//树形菜单点击的时候去除其他项的背景
		positionTreeById(fileId);//树形菜单点击的时候给点击的项添加背景
		
		
		getPidInput.value = fileId;//通过隐藏域记录一下当前操作的父级ID
		
		//每次重新在fileList中生成文件，那么需要给这些文件绑定样式事件
		tools.each(fileItem, function(item, index){
			fileHandle(item);
		});
		
		tools.removeClass(checkedAll, "checked");
		
	}
	/* end 通过指定的ID渲染文件区域和文件导航区域和树形菜单区域 */
	
	/* 文件区域各种事件操作的样式添加 start  */
	var fileItem = tools.$(".file-item", fileList);//找到文件区域下的单个文件项集合
	var checkboxs = tools.$(".checkbox", fileList);//找到文件区域所有的checkbox
	
	tools.each(fileItem, function(item, index){//接收数组或者类数组进行循环，有两个参数，循环的每一项和下标
		fileHandle(item);
	});
	
	function fileHandle(item){//给单独一个文件添加事件处理
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
		tools.addEvent(checkbox, "click", function(ev){
			var isaddClass = tools.toggleClass(this, "checked");
			if(isaddClass){//如果当前勾选上了，那么继续判断是否所有的checkedbox是否全部勾选了
				if(wholeSelect().length == checkboxs.length)tools.addClass(checkedAll, "checked");
			}else{//如果当前这个checkedbox没有被勾选，那么全选按钮就不能有classchecked
				tools.removeClass(checkedAll, "checked");
			}
			ev.stopPropagation();
		});
	}
	
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
	$("#rename").on("click",function(){
		if(wholeSelect().length == 0){
			tipsFn("warn","请选择一个文件");
		}
		if(wholeSelect().length > 1){
			tipsFn("warn","一次只能重命名一个文件");
		}
		if(wholeSelect().length == 1){
			var fileItem = wholeSelect()[0];
			var fileTitle = tools.$(".file-title", fileItem)[0];
			var fileEdtor = tools.$(".file-edtor", fileItem)[0];
			var edtor = tools.$(".edtor", fileItem)[0];	
			
			fileTitle.style.display = "none";
			fileEdtor.style.display = "block";
			
			edtor.select();
			tools.addEvent(edtor, "click", function(ev){
				
				//alert(4);
				ev.stopPropagation();
				tools.addEvent(document, "click", function(){
					fileTitle.style.display = "block";
					fileTitle.innerHTML = edtor.innerHTML;
					
					fileEdtor.style.display = "none";
				});
			});
			
			
			
		}
		return;
		//获取要重命名的文件
		var renameFile = "";
		var  viewMode = $("#changeView").data("view");
		if(viewMode == "view"){
			renameFile =  $("#filesView").find(".active");
			reNameOfFile(renameFile);
		}else{
			renameFile =  $("#filesLists").find(".active");
			reNameOfFile(renameFile);
		}
		
		function reNameOfFile(renameFile){
			if(!renameFile.length){
				$.tm_friendlyTips({
					content:"请选择文件",
					controls : "tm_warning",
					timer:1
				});
			}else if(renameFile.length >=2){
				$.tm_friendlyTips({
					content:"只能对单个文件重命名！",
					controls : "tm_warning",
					timer:1
				});
			}else{
				
				//重新获取，避免出错
				//renameFile = $("#filesView").find(".active");
				
				//获取文件名box
				var filename = renameFile.find(".filename");
				
				//获取重命名编辑框
				var editorInput = renameFile.find(".txt");
				
				//获取当前重名的 文件id
				var fileId = renameFile.data("file-id");
				
				//获取对应树形目录的title 
				var treeTitle = $("#treeMenu").find(".title[data-file-id='"+fileId+"']");
				
				//所有的wenjian
				var allFiles = $("#view-of-icon .details").find(".files[data-file-id='"+fileId+"']");
				
				//添加样式，【表示开始重命名，显示命名框】
				renameFile.addClass("reNameFile");
				editorInput.val(filename.html());
				editorInput.select();
				
				editorInput.on("blur",function(){
					
					var val = $(this).val();
					
					if(val.trim() == ""){
						
						$.tm_friendlyTips({
							content:"请输入文件名字",
							controls : "tm_warning"
						});
						editorInput.focus(); //重新获取焦点
						
					}else{
						
						var parentId = $("#getPidInput").val();
						var isExist = dataControl.isNameExsit(datas,parentId,val,fileId);
						
						if(isExist){ //表示文件名存在，提示
							$.tm_friendlyTips({ 
								content:"文件不能重名！",
								controls : "tm_warning"
							});
							editorInput.select();
						}else{
							
							//filename.html(val); //更新文件名
							allFiles.find(".filename").html(val);
							treeTitle.find("span").html(val); //更新树形菜单对应的名字
							
							//更新修改后的数据
							var isChangeSucc =  dataControl.changeNameById(datas,fileId,val);
							if(isChangeSucc){ //更新成功
								$.tm_friendlyTips({ 
									content:"重命名成功",
									controls : "tm_success"
								});
								renameFile.removeClass("reNameFile");
								editorInput.off("blur");//清楚当前绑定
							}else{
								$.tm_friendlyTips({ 
									content:"重命名失败，请坚持网络。。",
									controls : "tm_warning"
								});
							}
						}
					}
				});
			}
		};
	});
	
	//重命名
	$("#view-of-icon").on("mousedown",'.tools .rename',function(){
		triggerFn($(this),"只能重命名当前数据哦，其他都是浮云",function(){
			$("#rename").trigger("click");
		});
	});
	
	//删除 制作成功
	$(".delect").on("click",function(){
		//获取要删除的文件夹【即：当前选中的】
		var deleteFiles = wholeSelect();
		if(!deleteFiles.length){
			tipsFn("warn", "请选择要删除的文件");
		}else{
			
			$.tmDialog({ //删除提示
				title : "删除提示",
				contents : "确定要删除文件吗？",
				success : function(){ //确定删除
					$(deleteFiles).remove(); //删除文件列表,
					
					if(wholeSelect().length == checkboxs.length){//先清除文件列表，如果是全选，那么就出现没有文件提示，并且树形菜单中没有子菜单样式
						tools.removeClass(checkedAll, "checked");//全选意味着清空
						fileList.innerHTML = "";//清空fileList里面的内容，只要里面没有内容就清空
						empty.style.display = "block";
						$(".tree-title[data-file-id='"+(getPidInput.value)+"']").removeClass().addClass("tree-title tree-contro-none");
					}
					
					for(var i=0;i<deleteFiles.length;i++){//没有全选则说明直接删除，并且删除datas中的数据即可
						var id = deleteFiles[i].firstElementChild.dataset.fileId;//这里有id，那么就可以利用ajax去删除后台的数据了
						//获取对应的树形菜单 menu，ajax返回成功之后，再执行这下面的操作
						$(".tree-title[data-file-id='"+id+"']").closest("li").remove();
						dataControl.deleteById(datas, id);//删除数据中的数据
					}
					//提示文件删除成功
					tipsFn("ok","删除文件成功");
				}
			});
		}
	});
				
	
	function selctCurrTreeMenu(obj,currid){
		currid = currid || 0;
		var $obj = $(obj);
		var $ele = $obj.find(".title[data-file-id='"+currid+"']");
		$obj.find(".tree-title").removeClass("tree-nav"); //取消其他选中状态
		$ele.addClass("tree-nav"); //为当前的menu添加选中状态
	}
	
	//移动
	$(".move").on("click",function(){
		
		var moveFile = wholeSelect(); //获取要移动的文件,一个文件就是一个file-item对象，也就是该file-item对应的div对象
		console.log(moveFile[0]);
		if(!moveFile.length){ 
			tipsFn("warn", "请选择要移动的文件");
		}
		/*else if(moveFile.length >= 2){
			tipsFn("warn", "只提对供单个文件夹进行移动！");
		}*/
		else{
			$("#overlayout").fadeIn(); //显示遮盖层
			
			//重新渲染 目录结构
			var $treeMenu = $("#treeMenuPanel");
			var TreeMenuHtml = treeHtml(datas, -1);//文件备选区域
			$treeMenu.html(TreeMenuHtml);
			console.log($treeMenu.html());
			selctCurrTreeMenu(treeMenu,0); //默认选中第一个
			
			//为当前的树形目录绑定选中事件
			$("#treeMenuPanel").off("click").on("click",".tree-title",function(){
				$("#treeMenuPanel").find(".tree-title").removeClass("tree-nav");
				$(this).addClass("tree-nav");
			});
			// 
			
			//显示 文件移动位置选择 窗口
			$("#moveToOther").tmDrags({
				isDrag : true, //是否可以拖拽，默认true
				closeBtn : $(".close"),
				suerBtn : $(".sure"),
				cancleBtn : $(".cancle"),
				closeFn : function(){
					$("#overlayout").fadeOut(); //关闭时触发，关闭遮盖层
				},
				callback : function(){ //成功回调
					
					var currentId = moveFile.data("file-id"); //要移动的文件的 id
					
					var moveArea = $("#treeMenuPanel").find(".active"); //要移动到的目标位置
					
					var targetId = moveArea.data("file-id"); // 获取目标位置的file-id
					
					console.log("原位置id："+currentId);
					console.log("目标位置id："+targetId);
					
					if(currentId === targetId){//如果：要移动得文件与目标位置相同
						
						$.tm_friendlyTips({
							content:"文件移动失败，重新选择目标位置！",
							controls : "tm_warning",
							timer:2
						});
						
					}else{ //否则
						
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
						
						//console.log(isExist);
						
						if(!isExist){ 
							
							// 获取当前 要移动的 文件的层级 ：
							var currentLevel = dataControl.getLevelById(datas,currentId)
							
							// 获取 目标 位置文件的  子集存放的 层数 【+1的目的是需要在下一级显示】
							var targetLevel = dataControl.getLevelById(datas,targetId) + 1;
							
							console.log(currentLevel,targetLevel);
							
							if(targetId == $("#getPidInput").val()){  //如果目标位置与当前所在位置相同
								$.tm_friendlyTips({
									content:"文件移动失败，重新选择目标位置！",
									controls : "tm_warning",
									timer:3
								});
								return false;
								
							}else if((currentLevel === targetLevel && !isExist) || currentLevel != targetLevel){ // 不在同一级 或者 在同一级，单父级不同，表示可以移动
								//console.log("准备移动！！");
								
								//存放 选中文件的所有子元素【包括本身】
								var currentIdAllChilds = [];  
								
								// 获取选中文件 本身的数据
								for(var i=0;i<datas.length;i++){
									if(datas[i].id == currentId){
										datas[i].pid = targetId; //修改 parent id
										currentIdAllChilds.push(datas[i]);  
									}
								}
								
								//获取选中文件的 所有子文件数据
								function getAllChilds(data,pid){
									for(var i=0;i<data.length;i++){
										if(data[i].pid == pid){
											currentIdAllChilds.push(data[i])
											getAllChilds(data,data[i].id); //递归查找
										}
									}
								}
								getAllChilds(datas,currentId);
								
								//删除 要移动的文件 【类似复制 粘贴功能】
								moveFile = $("#filesView").find(".active");
								moveFile.remove();
								
								//删除详细列表中的对应file
								$("#filesLists").find(".files[data-file-id='"+currentId+"']").remove();
								
								if($("#filesView").html() == ""){
									$("#view-of-icon").hide();
									$("#noFileTips").addClass("noFileTipsShow");
									$("#selectAllFiles").removeClass("sel")
								}
								
								//循环更新移动的文件id,并创建新的树形目录结构【方法：类似新建文件一样，添加树形目录】
								currentIdAllChilds.forEach(function(ele){
									var newF = {
										id : new Date().getTime() + Math.floor(Math.random()*100), //避免id 重复
										title : ele.title, //文件名
										level :targetLevel++  //层级（要在第几层显示）
									}
									for(var i=0;i<datas.length;i++){
										if(datas[i].id == ele.id){
											datas[i].id =  newF.id; //更新原始数据的id
											ele.id = newF.id; //更新当前要移动的(所有)文件id
										}
										//console.log(datas[i]);
									}
								});
								
								//修改 每个元素的pid 【目的：根据这个pid来更新原始数据的pid】
								for(var i=1;i<currentIdAllChilds.length;i++){
									currentIdAllChilds[i].pid = currentIdAllChilds[i-1].id;
								}
								
								// 更新原始数据：
								for(var i=0;i<datas.length;i++){
									for(var j = 0;j<currentIdAllChilds.length;j++){
										if(datas[i].id == currentIdAllChilds[j].id){
											datas[i].pid = currentIdAllChilds[j].pid;
										}
									}
								}
								
								// 更改树形目录的各级状态
								//最简单的方式是：重新更新目录结构（不用移除，添加，判断状态等操作！暂时先这样子做吧！嘿嘿嘿。。。 ）
								var treeMenu = $("#treeMenu");
								var TreeMenuHtml = template.treeMenuTemplate(datas,-1);
								treeMenu.html(TreeMenuHtml);
								_this.selctCurrTreeMenu(treeMenu,$("#getPidInput").val()); //默认选上一次选中过的
								
							}else{
								$.tm_friendlyTips({
									content:"文件移动失败，重新选择目标位置！",
									controls : "tm_warning",
									timer:3
								});
							}
							
						}else{  //选择移动到的位置，值要移动文件的子级菜单，表示：移动失败
							$.tm_friendlyTips({
								content:"文件移动失败，重新选择目标位置！",
								controls : "tm_warning",
								timer:3
							});
						}
					}
				}
			});
		}
	});
	
	//刷新
	$(".reload").on("click",function(){
		location.reload();
	});
	
}())
