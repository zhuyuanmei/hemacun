define(function(require, exports, module) {
    // 普通页面的分发器
    var $dispatcher = $("#dispatcher");

    // 适配器
    var adapter = {
        pubMode: false, // 当前是否发布模式
        setCookie: function(name, value) {
            var exp = new Date();
            exp.setTime(exp.getTime() + 365 * 24 * 60 * 60 * 1000);
            document.cookie = name + "=" + window.escape(value) + ";expires=" + exp.toGMTString();
        },
        getCookie: function(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr) {
                return window.unescape(arr[2]);
            }
            return;
        },
        load: function(module) {
            // 设置模式
            var dir = this.pubMode ? 'js/pages-min/' : 'js/pages/';
            var prefix = $('#seajsFile').attr('src');
            prefix = prefix.split('js/');
            prefix = prefix[0] || './';
            var modulePrefix = prefix + dir;
            seajs.use(modulePrefix + module);
            this.setCookie('modulePrefix_sanye', modulePrefix);
        },
        init: function(module) {
            // 加载模块
            var params = top.location.search.substr(1).split('&');
            var last = params.length > 0 ? params[params.length - 1] : '';
            if (params.length === 0 || last.indexOf('debug') === -1) {
                // 没有调试参数
                var modulePrefix = this.getCookie('modulePrefix_sanye');
                if (modulePrefix) {
                    if (modulePrefix.indexOf('pages-min') !== -1) {
                        this.pubMode = true;
                    } else {
                        this.pubMode = false;
                    }
                    // 有缓存前缀，则直接调用
                    seajs.use(modulePrefix + module);
                } else {
                    // 默认是发布模式
                    this.pubMode = true;
                    this.load(module);
                }
            } else {
                // 有调试参数
                last = last.split('=');
                if (last.length > 0 && last[1] === "true") {
                    // 调试模式
                    this.pubMode = false;
                } else {
                    // 发布模式
                    this.pubMode = true;
                }
                this.load(module);
            }
        }
    };

    // 按需加载页面的js
    if ($dispatcher) {
//        switch ($dispatcher.val()) {
//            case 'home': // 官网首页
        if($dispatcher.val() === 'home'){
            adapter.init('home');
        }
//                break;
//            case 'doctor': // 医生介绍
//                adapter.init('doctor');
//                break;
//            case 'hospital': // 医院介绍
//                adapter.init('hospital');
//                break;
//            case 'charge': // 收费信息
//                adapter.init('charge');
//                break;
//            case 'active': // 优惠活动
//                adapter.init('active');
//                break;
//            default:
//        }
    }
});