/**
 * 工具模块
 * @author luoweiping
 * @version 2013-12-18
 * @since 2013-07-04
 */
define(function (require, exports, module) {
	function Util() {
		this.pageSize = 10;
	}

	Util.prototype.successMsg='您已预约成功！<br/>我们的客服会尽快跟您电话确认医生及具体的就诊时间。谢谢！';
	/**
	 * 返回JS文件根目录（JS目录）
	 * @return {String} JS文件根目录
	 * @author luoweiping
	 * @version 2013-08-30
	 * @since 2013-08-30
	 */
	Util.prototype.getScriptRootPath = function () {
		var seajsPath = $('#seajsFile').attr('src'),
		pathArr = [];

		pathArr = seajsPath.split('/');
		pathArr.pop();
		pathArr.pop();

		return pathArr.join('/');
	};

	/**
	 * 设置下拉框选中项（匹配第一项后返回），默认根据value值，未设置value属性则根据option文本匹配
	 * @param {Object} $selObj 下拉框对象
	 * @param {Object} val 待选中的value值或option文本
	 * @return {void}
	 * @author luoweiping
	 * @version 2013-11-28
	 * @since 2013-09-11
	 */
	Util.prototype.selectOption = function ($selObj, val) {
		$.each($selObj.find('option'), function (i, v) {
			var curOptVal = $(v).attr('value') || $(v).html();
			if (curOptVal === val) {
				$(v).get(0).selected = true;
				//.attr('selected', 'selected');
				return false;
			}
		});
	};

	/**
	 * 监听指定元素只允许其输入数字和部分控制字符，即屏蔽除数字、.(110,190)、Tab(9)、Delete(46)和退格键(8)和左右箭头外的所有输入
	 * @param {Object} cfgObj 配置对象，包括：待监听元素选择符、是否小数、是否负数
	 * @return {void}
	 * @author luoweiping
	 * @version 2013-12-19
	 * @since 2013-09-26
	 */
	Util.prototype.filterNonNumInput = function (cfgObj) {
		cfgObj = $.extend({
				srcEleStr : '',
				isFraction : false,
				isNegative : false
			}, cfgObj);

		$('body').on("keydown", cfgObj.srcEleStr, function (e) {
			var curKey = e.which;

			if (!e.shiftKey && (curKey > 95 && curKey < 106 || curKey > 47 && curKey < 58)) { //0-9
				return true;
			}
			if (curKey === 8 || curKey === 9 || curKey === 46) { //<--,Tab,Delete
				return true;
			}
			if (curKey === 37 || curKey === 39) { //<-,->
				return true;
			}
			if (curKey === 36 || curKey === 35) { //Home,End
				return true;
			}
			if (cfgObj.isFraction && (curKey === 110 || curKey === 190)) { //.
				return true;
			}
			if (cfgObj.isNegative && (curKey === 109 || curKey === 173)) { //-
				return true;
			}
			e.preventDefault();
		});
	};

	/**
	 * 截取字符串并加"..."
	 * @param {String} str 源字符串
	 * @param {Number} len 截取长度
	 * @return {String} 结果字符串
	 * @author luoweiping
	 * @version 2013-11-21
	 * @since 2013-11-21
	 */
	Util.prototype.cutStr = function (str, len) {
		return str.length > len ? str.substr(0, len) + '...' : str;
	};

	/**
	 * 计算字符串长度，ASCII大于128计为2
	 * @param {String} str 源字符串
	 * @return {Number} 字符串长度
	 * @author luoweiping
	 * @version 2013-12-16
	 * @since 2013-12-16
	 */
	Util.prototype.countStr = function (str) {
		var strLen = str.length,
		resultLen = 0;
		while (strLen-- > 0) {
			resultLen += str.charCodeAt(strLen) > 128 ? 2 : 1;
		}

		return resultLen;
	};

	/*
	 **project
	 */
	Util.prototype.getUrlParam = function (name) {
		var search = location.search.substr(1);
		var arrs = search.split("&");
		for (var i = 0, len = arrs.length; i < len; i++) {
			var arr = arrs[i].split("=");
			if (arr[0] == name) {
				return arr[1];
			}
		}
		return null;
	}

	Util.prototype.ajax = function (cfg) {
		var opts = {},
		cfgArr = ["error", "success", "complete"];
		for (var i = 0, len = cfgArr.length; i < len; i++) {
			var item = cfgArr[i];
			if (typeof cfg[item] == "function") {
				opts[item] = cfg[item];
				delete cfg[item];
			}
		}
		var config = {
			type : "post",
			dataType : "json",
			error : function (xhr) {
				typeof opts.error == "function" && opts.error(xhr);
			},
			success : function (data) {
				typeof opts.success == "function" && opts.success(data);
			},
			complete : function (xhr, ts) {
				typeof opts.complete == "function" && opts.complete(xhr, ts);
			}
		};
		$.ajax($.extend(true, config, cfg));
		return this;
	};

	Util.prototype.ajaxloading = function (art) {
		art.init({
			lock : true,
			id : "loading_id",
			content : '请求处理中...',
			cancel : false,
			ok : false
		});
		return this;
	};

	Util.prototype.ajaxloaded = function (art) {
		art.dialogClose("loading_id");
		return this;
	};

	Util.prototype.createSpan = function (obj, str, opti) {
		var offset = obj.offset();
		var span = $('<span class="tip" for="' + (obj.attr("name") || "") + '">' + str + '</span>');
		opti = opti || {};
		opti = $.extend(true, {
				top : offset.top,
				left : offset.left + 5
			}, opti);
		span.css(opti);
		$("body").append(span);
		return span;
	};

	Util.prototype.removeSpan = function (span) {
		span.remove();
		span = null;
	};

	Util.prototype.getJson = function (data) {
		if (typeof data == "string") {
			data = $.parseJSON(data);
		}
		return data;
	};
	Util.prototype.text2html = function (str, obj) {
		return str.replace(/\{\s*\{\s*([a-zA-Z0-9_]+)\s*\}\s*\}/g, "{{$1}}").replace(/\{\{[a-zA-Z0-9_]+\}\}/g, function (key) {
			var newKey = key.substr(2, key.length - 4);
			var _val = !(newKey === "introduction" && obj[newKey] == "") ? obj[newKey] : "暂无";
			return _val === undefined ? "" : _val;
		});
	};

	Util.prototype.listLoad = function (jqEle, cfg, art, scb) {
		if (jqEle.hasClass("J_LoadingJsMark")) {
			return;
		}
		var thePay = this,
		s_html = jqEle.find("script").html(),
		config = {
			url : jqEle.attr("data-ajax"),
			success : function (result) {
				result = thePay.getJson(result);
				if (result.status.errorCode == 0) {
					var conReg = /<#\s*CONTENT\s*#>([\s\S]+)<#\s*\/CONTENT\s*#>/i,
					noconReg = /<#\s*NOCONTENT\s*#>([\s\S]+)<#\s*\/NOCONTENT\s*#>/i,
					pageReg = /<#\s*PAGE\s*#>([\s\S]+)<#\s*\/PAGE\s*#>/i,
					_html = s_html,
					page = result.pageInfo;
					thePay.pageSize = page.pageSize;
					if (!!page && page.totalItems == 0) {
						//no content
						var _noContent = _html.match(noconReg)[1],
						noConStr = thePay.text2html(_noContent, {});
						jqEle.find(".J_Lists").empty().append(noConStr);
					} else {
						var str = '',
						arrs = result.bizObj,
						len = arrs instanceof Array ? arrs.length : 0,
						htmlstr = _html.match(conReg)[1];
						for (var i = 0; i < len; i++) {
							str += thePay.text2html(htmlstr, arrs[i]);
						}
						var htmlEles = $(str);
						typeof scb == "function" && scb(htmlEles); //调用外部对新加的list的处理函数

						jqEle.find(".J_Lists").empty().append(htmlEles);
					}

					if (!!page && page.totalItems > page.pageSize) {
						var _page = _html.match(pageReg);
						if (_page != null) {
							page.start_page = page.pageSize * (page.currentPage - 1) + 1;
							page.end_page = page.start_page + result.bizObj.length - 1;
							page.totalPage = Math.ceil(page.totalItems / page.pageSize);
							var pageEle = $(thePay.text2html(_page[1], page));
							//处理 disabled
							if (page.currentPage <= 1) {
								pageEle.find(".J_HeadPage,.J_PrevPage").addClass("disabled");
							} else if (page.currentPage >= page.totalPage) {
								pageEle.find(".J_NextPage,.J_FootPage").addClass("disabled");
							} else {
								pageEle.find(".disabled").removeClass("disabled");
							}
							var min = Math.max(page.currentPage - 2, 1),
							max = Math.min(page.totalPage, page.currentPage + 2);
							var str = '';
							for (var i = min; i <= max; i++) {
								str += '<a href="javascript:;" class="' + (i == page.currentPage ? "curr" : "J_PageALink") + '">' + i + '</a>';
							}
							pageEle.find(".J_PrevPage").after(str);

							jqEle.find(".J_Page").empty().append(pageEle);
						}
					} else {
						jqEle.find(".J_Page").empty();
					}
				} else {
					art.alert(result.status.errorMsg);
				}
			},
			complete : function (xhr, ts) {
				jqEle.removeClass("J_LoadingJsMark").find(".J_ListLoading").remove();
			},
			error : function (xhr) {
				art.alert("刷新列表失败");
			}
		};
		//loading
		var loadingReg = /<#\s*LOADING\s*#>([\s\S]+)<#\s*\/LOADING\s*#>/i,
		loadingCon = s_html.match(loadingReg)[1],
		loadingStr = thePay.text2html(loadingCon, {});
		jqEle.addClass("J_LoadingJsMark");
		!jqEle.find(".J_ListLoading")[0] && jqEle.find(".J_Lists").prepend($(loadingStr).addClass("J_ListLoading"));

		$.extend(true, config, cfg);
		this.ajax(config);

		return this;
	}

	module.exports = Util;
});