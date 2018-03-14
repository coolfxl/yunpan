/* 文件区域的单个文件夹的结构样式 start */
function fileConstruct(item){
	/*var str = "     <div class='item' data-file-id="+ item.id +">"+
				"     	<lable class='checkbox'></lable>"+
				"       <div class='file-img'>"+
				"       	<i></i>"+
				"       </div>"+
				"       <p class='file-title-box'>"+
				"           <span class='file-title'>"+ item.title +"</span>"+
				"           <span class='file-edtor'>"+
				"           	<input class='edtor' value='"+ item.title +"' type='text'/>"+
				"           </span>"+
				"       </p>"+
				"     </div>";*/
		
	var str = "     <div class='item' data-file-id="+ item.id +">"+
				"     	<lable class='checkbox'></lable>"+
				"       <div class='file-img'>"+
				"       	<i></i>"+
				"       </div>"+
				"       <p class='file-title-box'>"+
				"           <span class='file-title'>"+ item.title +"</span>"+
				"           <span class='file-edtor'>"+
				"           	<input class='edtor' value='"+ item.title +"' type='text'/>"+
				"           </span>"+
				"       </p>"+
				"     </div>";
	return str;
}
/* end  文件区域的文件夹的结构样式 */

function viewFile(item){
	var listHtml = "<div class='item' data-file-id='"+item.id+"'>"+
					"				<div class='titles'>"+
					"					<a href='javascript:void(0)' class='selectBox'></a>"+
					"					<span class='icon folderIcon'></span>"+
					"					<span class='filename'>"+ item.title +"</span>"+
					"					<input type='text' class='edtor' value='"+ item.title +"'>"+
					"				</div>"+
					"				<div class='tools'>"+
					"					<a href='javascript:void(0)' class='icon download' title='下载'></a>"+
					"					<a href='javascript:void(0)' class='icon share' title='分享'></a>"+
					"					<a href='javascript:void(0)' class='icon move' title='移动'></a>"+
					"					<a href='javascript:void(0)' class='icon cancle' title='删除'></a>"+
					"				</div>"+
					"				<div class='timer'>"+
					"					<span>"+ item.title +"</span>"+
					"				</div>	"+
					"			</div>";
		return listHtml;
}

//创建一个文件夹元素
function createFileElement(fileData){
	var newDiv = document.createElement("div");
	newDiv.className = "file-item";
	newDiv.innerHTML = fileConstruct(fileData);
	
	return newDiv;
}


/* 生成树形菜单和样式 start  */
function treeHtml(datas, treeId){
	var childs = dataControl.getChildById(datas, treeId);
	var html = "<ul>";
	childs.forEach(function(item){
		var level = dataControl.getLevelById(datas, item.id);//获取当前ID在第几层，根据层来进行缩进
		var hashChild = dataControl.hasChilds(datas, item.id);//通过ID判断当前元素是否有子元素,有true，无false
		var classNames = hashChild ? "tree-contro" : "tree-contro-none"; //通过样式进行控制是否有层前的小图标，默认有小图标,控制小图标的样式是 tree-contro-none  控制箭头朝下的样式是 tree-contro
		html += "<li>"+
		"                                <div class='tree-title "+ classNames +"' data-file-id='"+ item.id +"' style='padding-left:"+ (level*14) +"px'>"+//添加padding作用层次感
		"                                    <span>"+
		"                                        <strong class='ellipsis'>"+ item.title +"</strong>"+
		"                                        <i class='ico'></i>"+
		"                                    </span>"+
		"                                </div>"+treeHtml(datas, item.id) //递归调用	
		"                            </li>";
	})
	
	html += "</ul>";
	
	return html;
/*
 * 数据格式说明：
 * ul下面第一层如果有多个数据，那么第一层就有多个li，
 * 如果第一层下面还有多个数据，那么li下面就在嵌套ul，
 * 以此循环,查看index.html文档中的静态模板页面设置。
 * 循环的实现是以函数的递归调用来实现的
 * */
}
/* end  生成树形菜单和样式  */


/* 创建文件的时候，创建一个树形菜单的li start */
function createTreeHtml(options){
	var newLi = document.createElement("li");
	newLi.innerHTML = "<div class='tree-title tree-contro-none' data-file-id='"+ options.id +"' style='padding-left:"+ (options.level*14) +"px'>"+//添加padding作用层次感
		"              		<span>"+
		"                       <strong class='ellipsis'>"+ options.title +"</strong>"+
		"                       <i class='ico'></i>"+
		"                 	</span>"+
		"             	</div>"+
		"               <ul></ul>";
		
		return newLi;
}
/*end  创建文件的时候，创建一个树形菜单的li  */


/* 通过ID定位到树形菜单添加class start  */
function positionTreeById(positionId){
	var ele = document.querySelector(".tree-title[data-file-id='"+ positionId +"']");//获取跟定位ID相同的元素
	tools.addClass(ele, "tree-nav");//给这个元素添加背景样式
}
/* end  通过ID定位到树形菜单添加class  */

/* 文件内容区域样式展示 start  */
function filesHtml(item){
	var html = "<div class='file-item'>"+ fileConstruct(item) +
				"   </div>";

	return html;
}
/* end  文件内容区域样式展示  */

/* 根据属性菜单项的ID渲染右侧文件内容列表 start */ 
function createFilesHtml(datas,renderId){
	var childs = dataControl.getChildById(datas,renderId);
	var html = "";
	childs.forEach(function(item){
		html += filesHtml(item);
	});
	
	return html;
}
/* end 根据属性菜单项的ID渲染右侧文件内容列表  */ 

/* 通过当前ID得到当前ID所有的父级数据，得到一个结构 start */
function createPathNavHtml(datas, fileId){
	var parents = dataControl.getParents(datas, fileId).reverse();//获取特定父级ID的所有父级元素,并且从上到下的顺序
	var pathNavHtml = "";//导航栏元素内容
	var len = parents.length;//通过长度递减的原则设置导航栏箭头样式，因为是层级大小的影响

	parents.forEach(function(item,index){
		if(index == parents.length-1) return;
		pathNavHtml += "<a href='javascript:;' style='z-index:"+ (len--) +"' data-file-id='"+ item.id +"'>"+ item.title +"</a>";//这个是可以点击的
	});
	pathNavHtml += "<span class='current-path' style='z-index:"+ (len--) +"' data-file-id='"+ fileId +"'>"+ parents[parents.length-1].title +"</span>";//当前导航的内容，不可以点击
	
	return pathNavHtml;
}
/* end 通过当前ID得到当前ID所有的父级数据，得到一个结构  */