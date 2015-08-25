/**
 * js预览浮层模块
 * @author zym
 * @version 1.0
 * @since 2015-02-08
 */

define(function(require, exports, module) {
        var win = $(window),
            doc = $(document),
            count = 1,
            isIE6 = !-[1,] && !window.XMLHttpRequest,
            isLock = false;

        var Preview = function(options) {
            this.settings = $.extend({}, Preview.defaults, options);
            this.init();
        }

        Preview.prototype = {
            /**
             * 初始化
             */
            init : function() {
                this.create();

                if (this.settings.lock) {
                    this.lock();
                }

                if (this.settings.time) {
                    this.time();
                }
            },

            /**
             * 创建
             */
            create : function() {
                // HTML模板
                var templates = '';

                if(this.settings.setHeader){
                    templates = '<div class="rDialog-wrap">' +
                        '<a href="javascript:;" class="rDialog-close" title="关闭">x</a>' +
                        '<div class="rDialog-header">'+ this.settings.title +'</div>' +
                        '<div class="rDialog-content">'+ this.settings.content +'</div>' +
                        '<div class="rDialog-footer"></div>' +
                        '</div>';
                }else{
                    templates = '<div class="rDialog-wrap">' +
                        '<div class="rDialog-content">'+ this.settings.content +'</div>' +
                        '<div class="rDialog-footer"></div>' +
                        '</div>';
                }

                // 追回到body
                this.preview = $('<div>').addClass('rDialog').css({ zIndex : this.settings.zIndex + (count++) }).html(templates);
                this.preview.prependTo('body');

                //设置弹框头部背景色
                if($('.rDialog-header').length && this.settings.headerBackground){
                    $('.rDialog-header').css('backgroundColor',this.settings.headerBackground);
                }

                // 设置ok按钮
                if ($.isFunction(this.settings.ok) && this.settings.okText !== '') {
                    this.ok();
                }

                // 设置cancel按钮
                if ($.isFunction(this.settings.cancel) && this.settings.cancelText !== '') {
                    this.cancel();
                }

                // 设置大小
                this.size();

                // 设置位置
                this.position();

                // 事件绑定
                this.bindEvent();

                if(this.settings.background !== ''){
                    $('.rDialog').css('top',5);
                    win.on('resize',function(){
                        $('.rDialog').css('top',5);
                    });
                    $('.rDialog-wrap').css({'background':'none','border':'none'});
                }
            },

            /**
             * ok
             */
            ok : function() {
                var _this = this,
                    footer = this.preview.find('.rDialog-footer')[0];

                var closeBtn = $('<a href="javascript:;" class="rDialog-ok">'+this.settings.okText+'</a>');

                closeBtn.prependTo(footer);

                if(this.settings.okSize){
                    closeBtn.css({'width':'80%','background':'#a4269e'});
                }

                closeBtn.on('click',function(){
                    if(_this.settings.okCallBack){
                        _this.settings.ok();
                    }else{
                        _this.close();
                    }
                });
            },

            /**
             * cancel
             */
            cancel : function() {
                var _this = this,
                    footer = this.preview.find('.rDialog-footer')[0];

                var closeBtn = $('<a href="javascript:;" class="rDialog-cancel">'+this.settings.cancelText+'</a>');

                closeBtn.prependTo(footer);

                closeBtn.on('click',function(){
                    _this.close();
                });
            },

            /**
             * 设置大小
             */
            size : function() {
                var content = this.preview.find('.rDialog-content'),
                    wrap = this.preview.find('.rDialog-wrap');

                content.css({
                    width : this.settings.width,
                    height : this.settings.height
                });

                wrap.css('width',content.width());
            },

            /**
             * 设置位置
             */
            position : function() {
                var _this = this,
                    winWidth = win.width(),
                    winHeight = win.height(),
                    scrollTop = 0;

                this.preview.css({
                    left : (winWidth - _this.preview.width()) / 2,
                    top : (winHeight - _this.preview.height()) / 2 + scrollTop
                });
            },

            /**
             * 设置锁屏
             */
            lock : function() {
                if (isLock) return;

                this.lock = $('<div>').css({ zIndex : this.settings.zIndex }).addClass('rDialog-mask');
                this.lock.appendTo('body');

                if (isIE6) {
                    this.lock.css({ height : $('body').height() });

                    // 兼容ie6/防止select遮盖
                    this.lock.html('<iframe style="position:absolute;left:0;top:0;width:100%;height:100%;z-index:-1;border:0 none;filter:alpha(opacity=0)"></iframe>');
                }

                isLock = true;
            },

            /**
             * 关闭锁屏
             */
            unLock : function() {
                if (this.settings.lock) {
                    if (isLock) {
                        this.lock.remove();
                        isLock = false;
                    }
                }
            },

            /**
             * 关闭方法
             */
            close : function() {
                this.preview.remove();
                this.unLock();
            },

            /**
             * 定时关闭
             */
            time : function() {
                var _this = this;

                this.closeTimer = setTimeout(function() {
                    _this.close();
                }, this.settings.time);
            },

            /**
             * 事件绑定
             */
            bindEvent : function() {
                var _this = this,
                    close = this.preview.find('.rDialog-close');

                // 关闭事件
                close.on('click', function() {
                    _this.close();
                });

                // resize
                win.on('resize', function() {
                    _this.position();
                });

                // scroll
                if (isIE6) {
                    win.on('scroll', function() {
                        _this.position();
                    });
                }
            }
        }

        /**
         * 默认配置
         */
        Preview.defaults = {
            // 内容
            content: '请稍等...',

            // 标题
            title: '提示',

            // 宽度
            width: 'auto',

            // 高度
            height: 'auto',

            // 确定按钮回调函数
            ok: function(){},

            // 取消按钮回调函数
            cancel: function(){},

            // 确定按钮文字
            okText: '',

            // ok的callback函数标示符
            okCallBack: false,

            //设置确定按钮尺寸
            okSize:false,

            // 取消按钮文字
            cancelText: '',

            // 自动关闭时间(毫秒)
            time: null,

            // 是否锁屏
            lock: false,

            //是否可以拖拽
            isDrag: true,

            // z-index值
            zIndex: 9,

            //设置弹框背景
            background:'',

            //设置是否去掉头部内容,默认存在头部信息
            setHeader:true,

            //设置弹框头部背景色
            headerBackground: ''
        }

        var rPreview = function(options) {
            new Preview(options);
        }

        window.rPreview = $.rPreview = $.preview = rPreview;
});