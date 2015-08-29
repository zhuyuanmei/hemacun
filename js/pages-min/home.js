/**
 * 河马村官网
 * @since 2015.08.20
 */
define(function (require, exports, module) {
    var Util = require('util');
    var util = new Util();

    var Mustache = require('mustache');
    var Preview  = require('preview');

    var PREFIX = 'http://hemacun.com';
    var TOKEN  = 'e61304cd-ed31-4e2f-a87b-fd2b54621384';

    //跳转到首页路径
    var firstPageUrl = '/question/index';

    //宝宝关卡'byebye'跳转路径
    var byeUrl = '/question/report';

    //宝宝关卡'查看测试报告'跳转路径
    var testUrl = '/question/report';

    //设置Cookie的方法集合
    var Cookie = {
        add:function(name,value,expiresHours){
            var cookieString=name+"="+escape(value);
            //判断是否设置过期时间,0代表关闭浏览器时失效
            if(expiresHours>0){
                var date=new Date();
                date.setTime(date.getTime()+expiresHours*1000);
                cookieString=cookieString+";expires=" + date.toUTCString();
            }
            document.cookie=cookieString;
        },
        edit:function(name,value,expiresHours){
            var cookieString=name+"="+escape(value);
            if(expiresHours>0){
                var date=new Date();
                date.setTime(date.getTime()+expiresHours*1000); //单位是毫秒
                cookieString=cookieString+";expires=" + date.toGMTString();
            }
            document.cookie=cookieString;
        },
        get: function(name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr) {
                return window.unescape(arr[2]);
            }
            return '';
        }
    };

    var global = {
        token: Cookie.get('token'),
        prefix: '',
        kidId: '',
        optionId: '',
        answerId: '',
        babyData:{},
        init: function() {
            var self = this;

            $.ajax({
                url: PREFIX + '/api/user/getCurrentUser',
                type: 'get',
                headers: {
                    token: self.token || TOKEN
                },
                success: function(res) {
                    var data = res.body;

                    if (data.kid) {

                        // 保存当前 kid
                        self.kidId  = data.kid;
                        self.prefix = data.staticCdnUrlPrefix;

                        // 绑定答案提交事件
                        self.bind();

                        // 执行界面主要逻辑
                        main();
                    }
                }
            });
        },
        bind: function() {
            var self = this;

            // 妈妈部分
            var $contentFt = $('#J_ContentFt');

            if ($contentFt.length) {
                $contentFt.delegate('#J_CommerFooter', 'click', function() {
                    var $this      = $(this);
                    var $radioItem = $('.J_RadioItem');

                    if ($this.hasClass('nextVisible')) {
                        $radioItem.each(function(index, item) {
                            var $item = $(item);

                            if ($item.css('display') === 'block') {
                                self.optionId = $item.attr('data-id');
                                self.answerId = $item.attr('data-curvalue');
                            }
                        });

                        self.saveAnswer();
                    }
                });
            }


            // 宝宝部分
            var $mainContent = $('#J_MainContent');

            if ($mainContent.length) {
                $mainContent.delegate('.J_SubmitChoose', 'click', function() {
                    var $this = $(this);

                    if ($this.hasClass('visibleChoose')) {
                        self.optionId = $this.attr('data-option-id');
                        self.answerId = $this.attr('data-answer-id');

                        self.saveAnswer();
                    }
                });
            }
        },
        addPrefix:function(url) {
            var self = this;

            return self.prefix + url;
        },
        saveAnswer: function() {
            var self = this;

            $.ajax({
                url : PREFIX + '/api/customized/createUserAnswerResult',
                data: {
                    kidId    : self.kidId,
                    optionId: parseInt(self.optionId),
                    answerId: self.answerId
                },
                type: 'post',
                headers: {
                    token: self.token
                },
                dataType: 'json',
                success: function (res) {

                }
            });
        },
        parseBabyData: function(data) {
            var self = this;

            // 以题目 ID 为 KEY 记录数据
            data.forEach(function(item, index) {
                if (item.options.length === 2) {
                    self.babyData[item.id] = item;
                }
            });
        }
    };

    global.init();

    var rangeSelector = {
        init: function() {
            var self = this;

            self.minOffsetX  = 20;
            self.maxOffsetX  = $(window).width() - 60;
            self.rangeWidth  = (self.maxOffsetX - self.minOffsetX) / 4;

            self.bind();
        },

        bind: function() {
            var self        = this;
            var $motherInfo = $('#J_MotherInfo');

            $motherInfo.delegate('.J_RangeSelector', 'touchmove', function(event) {
                var $this   = $(this);
                var $button = $this.find('.J_RangeSelectorButton');
                var offsetX = self.fixOffsetX(event.changedTouches[0].clientX);

                event.preventDefault();

                $button.css('position', 'absolute');
                $button.css('left', offsetX);
            });

            $motherInfo.delegate('.J_RangeSelector', 'touchend', function(event) {
                var $this         = $(this);
                var $hd           = $this.find('.J_RangeSelectorHd');
                var $ft           = $this.find('.J_RangeSelectorFt');
                var $button       = $this.find('.J_RangeSelectorButton');
                var $commerFooter = $('#J_CommerFooter');
                var offsetX       = self.fixOffsetX(event.changedTouches[0].clientX);

                var range = (offsetX / self.rangeWidth).toFixed(0);

                event.preventDefault();

                $hd.find('li').addClass('hide').eq(range).removeClass('hide');
                $ft.find('li').removeClass('hide').eq(range).addClass('hide');

                var left  = range * self.rangeWidth;

                $button.css('left', left);

                // 开始赋值
                $this.parents('.J_RadioItem').attr('data-curValue', parseInt(range) + 1);

                // 点亮按钮
                $commerFooter.css('background', '#BCEF00');
                $commerFooter.addClass('nextVisible');
            });
        },

        fixOffsetX: function(offsetX) {
            var self = this;

            offsetX -= 40;

            if (offsetX < 0) {
                offsetX = 0;
            }

            if (offsetX > self.maxOffsetX) {
                offsetX = self.maxOffsetX;
            }

            return offsetX;
        }
    };

    rangeSelector.init();

    var main = function() {
        var tpl = {
            answersTpl: [
                '<div class="radio-item J_RadioItem" data-id="{{id}}" data-curValue="" style="display:none;">',
                '<header><progress value="{{id}}" max="17"></progress></header>',
                '<dl>',
                '<dt>{{id}}.</dt>',
                '<dd>',
                '<ul>',
                '<li class="question-item">{{question}}</li>',
                '{{#reply}}',
                '<li data-replyId="{{replyId}}"><input type="radio" name="{{className}}" id="J_AnswerItem_{{id}}_{{replyId}}"><label for="J_AnswerItem_{{id}}_{{replyId}}">{{description}}</label></li>',
                '{{/reply}}',
                '</ul>',
                '</dd>',
                '</dl>',
                '</div>'
            ],
            yearSelectTpl: [
                '<div class="radio-item J_RadioItem" data-id="{{id}}" data-curValue="1980" style="display:none;">',
                '<header><progress value="{{id}}" max="17"></progress></header>',
                '<dl>',
                '<dt>{{id}}.</dt>',
                '<dd>',
                '<ul>',
                '<li class="question-item">{{question}}</li>',
                '<li><input class="J_ParentBirthDay" type="text" value="1980" readonly="readonly" placeholder="请选择家长的出生年份" onfocus="javascript:this.blur();"></li>',
                '</ul>',
                '</dd>',
                '</dl>',
                '</div>'
            ],
            inputTpl: [
                '<div class="radio-item J_RadioItem" data-id="{{id}}" data-curValue="" style="display:none;">',
                '<header><progress value="{{id}}" max="17"></progress></header>',
                '<dl>',
                '<dt>{{id}}.</dt>',
                '<dd>',
                '<ul>',
                '<li class="question-item">{{question}}</li>',
                '<li><input id="J_BabyName" type="text" class="nick-name" placeholder="请填写宝宝的昵称"></li>',
                '</ul>',
                '</dd>',
                '</dl>',
                '</div>'
            ],
            dateSelectTpl: [
                '<div class="radio-item J_RadioItem" data-id="{{id}}" data-curValue="" style="display:none;">',
                '<header><progress value="{{id}}" max="17"></progress></header>',
                '<dl>',
                '<dt>{{id}}.</dt>',
                '<dd>',
                '<ul>',
                '<li class="question-item">{{question}}</li>',
                '<li><input class="J_BabyBirthDay" type="text" readonly="readonly" placeholder="请选择宝宝的出生日期" onfocus="javascript:this.blur();"></li>',
                '</ul>',
                '</dd>',
                '</dl>',
                '</div>'
            ],
            babyTreeTpl:[
                '<div class="radio-item baby-tree J_RadioItem" data-id="{{id}}" data-curValue="" style="display:none;">',
                '<header><progress value="{{id}}" max="17"></progress></header>',
                '<dl>',
                '<dt>{{id}}.</dt>',
                '<dd>',
                '<ul id="J_DisabledTree">',
                '<li class="question-item">{{question}}</li>',
                '<li>',
                '<a href="javascript:;" class="J_TreeItem" data-id="1" data-url="' + global.addPrefix('/images/tree/01_1.png') + '"><img src="' + global.addPrefix('/images/tree/01.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="2" data-url="' + global.addPrefix('/images/tree/02_1.png') + '"><img src="' + global.addPrefix('/images/tree/02.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="3" data-url="' + global.addPrefix('/images/tree/03_1.png') + '"><img src="' + global.addPrefix('/images/tree/03.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="4" data-url="' + global.addPrefix('/images/tree/04_1.png') + '"><img src="' + global.addPrefix('/images/tree/04.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="5" data-url="' + global.addPrefix('/images/tree/05_1.png') + '"><img src="' + global.addPrefix('/images/tree/05.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="6" data-url="' + global.addPrefix('/images/tree/06_1.png') + '"><img src="' + global.addPrefix('/images/tree/06.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="7" data-url="' + global.addPrefix('/images/tree/07_1.png') + '"><img src="' + global.addPrefix('/images/tree/07.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="8" data-url="' + global.addPrefix('/images/tree/08_1.png') + '"><img src="' + global.addPrefix('/images/tree/08.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="9" data-url="' + global.addPrefix('/images/tree/09_1.png') + '"><img src="' + global.addPrefix('/images/tree/09.png') + '"></a>',
                '<a href="javascript:;" class="J_TreeItem" data-id="10" data-url="' + global.addPrefix('/images/tree/10_1.png') + '"><img src="' + global.addPrefix('/images/tree/10.png') + '"></a>',
                '<li><div id="J_Tree" class="tree"><img src="' + global.addPrefix('/images/tree/tree.png') + '"></div></li>',
                '</ul>',
                '</dd>',
                '</dl>',
                '</div>'
            ],
            degreeBarTpl: [
                '<div class="radio-item J_RadioItem" data-id="{{id}}" data-curValue="" style="display:none;">',
                '<header><progress value="{{displayId}}" max="10"></progress></header>',
                '<dl>',
                '<dt>{{displayId}}.</dt>',
                '<dd>',
                '<ul>',
                '<li class="question-item slide-item">{{question}}</li>',
                '</ul>',
                '</dd>',
                '</dl>',
                '<div class="J_RangeSelector range-selector">',
                '<div class="range-selector-wrap">',
                '<div class="J_RangeSelectorHd range-selector-hd">',
                '<ul>',
                '<li class="hide">非常不符</li>',
                '<li class="hide">有点不符</li>',
                '<li class="hide">一般</li>',
                '<li class="hide">有点符合</li>',
                '<li class="hide">非常符合</li>',
                '</ul>',
                '</div>',
                '<div class="range-selector-bd">',
                '<div class="J_RangeSelectorButton range-selector-button"></div>',
                '</div>',
                '<div class="J_RangeSelectorFt range-selector-ft">',
                '<ul>',
                '<li>非常不符</li>',
                '<li>有点不符</li>',
                '<li>一般</li>',
                '<li>有点符合</li>',
                '<li>非常符合</li>',
                '</ul>',
                '</div>',
                '</div>',
                '</div>',
                '</div>'
            ],
            loginTpl: [
                '<div class="login-box">',
                '<ul>',
                '<li>',
                '<input type="text" id="J_Mobile" class="mobile" placeholder="请填写手机号码" data-url="../mockup/json/login.json">',
                '</li>',
                '<li>',
                '<input type="text" id="J_CodeNumber" class="code" placeholder="请填写短信密码">',
                '<a id="J_ValidateCode" class="get-code" data-url="../mockup/json/validateCode.json">获取短信密码</a>',
                '</li>',
                '<li id="J_ErrorTip" class="error-tip"></li>',
                '</ul>',
                '</div>'
            ],
            videoTpl:[
                '<div id="J_MediaItem{{rootId}}" class="media-item J_MediaItem current-bg" data-id="{{rootId}}" data-medioId="{{medioId}}" {{#hasAnswerId}}data-answerId="{{answerId}}"{{/hasAnswerId}} data-arrLength="{{arrLength}}" data-currentIndex="{{currentIndex}}" data-video="{{hasVideo}}" data-audio="{{hasAudio}}" style="">',
                '<img src="' + global.addPrefix('/images/bg.jpg') + '">',
                '<div class="current-medio">',
                '{{#hasVideo}}',
                '<img src="' + global.addPrefix('/images/video.png') + '">',
                '<video id="J_Video{{rootId}}" poster="" preload="auto" style="position:absolute;top:9%;left:4%;width:92%;" src="' + PREFIX + '/{{videoUrl}}">',
                '<p>Your browser does not support the video tag.</p>',
                '</video>',
                '{{/hasVideo}}',
                '{{#hasAudio}}',
                '<img src="' + global.addPrefix('/images/audio.png') + '">',
                '<audio id="J_Audio{{rootId}}" src="' + PREFIX + '/{{audioUrl}}">',
                'Your browser does not support the audio tag.',
                '</audio>',
                '{{/hasAudio}}',
                '{{#hasAnswerId}}',
                '<div class="choose">',
                '<ul>',
                '{{#answerList}}',
                '<li><a href="javascript:;" class="J_SubmitChoose" data-option-id="{{rootId}}" data-answer-id="{{id}}"><img src="' + PREFIX + '/{{imageUrl}}"></a></li>',
                '{{/answerList}}',
                '</ul>',
                '</div>',
                '{{/hasAnswerId}}',
                '</div>',
                '</div>'
            ]
        };

        //'妈妈测试'交互
        if ($('#J_MotherInfo').length) {
            var $motherInfo = $('#J_MotherInfo');
            var $motherPart1 = $('.J_MotherPart1');
            var $motherPart2 = $('.J_MotherPart2');
            var $mainContent1 = $('#J_MainContent1');
            var $mainContent2 = $('#J_MainContent2');
            var $testPart1 = $('#J_TestPart1');
            var $testPart2 = $('#J_TestPart2');
            var $contentFt = $('#J_ContentFt');
            var $commerHeader = $('#J_CommerHeader');
            var $commerFooter = $('#J_CommerFooter');
            var $startPart1 = $('#J_StartPart1');
            var $startPart2 = $('#J_StartPart2');

            //radio交互
            $motherInfo.delegate('input[type="radio"]', 'change', function () {
                var $this = $(this);
                var $curParent = $this.parents('li'),
                    curReplyId = $curParent.attr('data-replyId');

                var $curRadioItem = $this.parents('.J_RadioItem');

                $curRadioItem.attr('data-curValue', curReplyId);

                $commerFooter.css('background', '#BCEF00');
                $commerFooter.addClass('nextVisible');
            });

            //昵称交互
            $motherInfo.delegate('#J_BabyName', 'keyup', function () {
                var $this = $(this);
                var $curParent = $this.parents('.J_RadioItem');

                if ($.trim($this.val()) === '' || ($this.val().length < 2 && $this.val().length > 20)) {
                    $commerFooter.css('background', '#eee');
                    $commerFooter.removeClass('nextVisible');
                } else {
                    $commerFooter.css('background', '#BCEF00');
                    $commerFooter.addClass('nextVisible');
                }

                $curParent.attr('data-curValue', $.trim($this.val()).substr(0, 20));
            });

            //宝宝树交互
            var clickTreeNumber = 0;
            var treeArr = [];
            $motherInfo.delegate('.J_TreeItem','click',function(){
                var $this = $(this);
                var $curParent = $this.parents('.J_RadioItem');

                if(!$this.hasClass('disabled')){
                    $this.addClass('disabled');

                    if(clickTreeNumber <= 4){
                        var curTreeSrc = $this.attr('data-url');
                        var curId = $this.attr('data-id');

                        var $curImg = $this.find('img');

                        $curImg.attr('src',curTreeSrc);

                        treeArr.push(curId);

                        clickTreeNumber++;

                        //对应动画展示
                        var $babyTree = $('#J_Tree');
                        $babyTree.find('img').addClass('scale-img'+clickTreeNumber);

                        switch(clickTreeNumber){
                            case 1:
                                setTimeout(function(){
                                    $babyTree.find('img').css('width','60%');
                                },2000);
                                break;
                            case 2:
                                setTimeout(function(){
                                    $babyTree.find('img').css('width','70%');
                                },2000);
                                break;
                            case 3:
                                setTimeout(function(){
                                    $babyTree.find('img').css('width','80%');
                                },2000);
                                break;
                            case 4:
                                setTimeout(function(){
                                    $babyTree.find('img').css('width','90%');
                                },2000);
                                break;
                            case 5:
                                setTimeout(function(){
                                    $babyTree.find('img').css('width','100%');
                                },2000);
                                break;
                            default:
                                break;
                        }
                    }

                    if($('#J_DisabledTree .disabled').length === 5){
                        $commerFooter.css('background', '#BCEF00');
                        $commerFooter.addClass('nextVisible');
                    }

                    $curParent.attr('data-curValue', treeArr);
                }
            });

            //'next键'交互
            $contentFt.delegate('#J_CommerFooter', 'click', function () {
                var $this = $(this);

                if ($this.hasClass('nextVisible')) {
                    var nextId = 0;
                    var curId = '';
                    var curValue = '';

                    $('.J_RadioItem').each(function (i, n) {
                        if ($(n).css('display') !== 'none') {
                            curId = $(n).attr('data-id');
                            curValue = $(n).attr('data-curValue');

                            $(n).hide();
                        }
                    });

                    if(parseInt(curId) === $testPart1.find('.J_RadioItem').length){
                        $('.J_MotherPart2').show();

                        $mainContent1.hide();

                        $commerFooter.css('background', '#eee');
                        $commerFooter.removeClass('nextVisible');
                        $contentFt.hide();
                    }else if(parseInt(curId) === ($testPart1.find('.J_RadioItem').length + $testPart2.find('.J_RadioItem').length)){
                        $contentFt.hide();

                        //跳转到首页
                        var motherEndTpl = '<div class="mother-end"><img src="' + global.addPrefix("/images/status1.png") + '"><a href="' + firstPageUrl + '" class="mother-end-btn"></a></div>';
                        $.preview({
                            content: motherEndTpl,
                            width:'300px',
                            height:'308px',
                            lock: true,
                            setHeader:false,
                            background:'true'
                        });
                    }else{
                        nextId = parseInt(curId);
                        $($('.J_RadioItem')[nextId]).show();

                        $commerHeader.css('background', '#BCEF00');
                        $commerHeader.addClass('preVisible');

                        if ($($('.J_RadioItem')[nextId]).attr('data-curValue') !== '') {
                            if(parseInt(curId) === ($testPart1.find('.J_RadioItem').length-1) && $testPart1.find('.J_RadioItem').eq($testPart1.find('.J_RadioItem').length-1).attr('data-curValue').split(',').length < 5){
                                $commerFooter.css('background', '#eee');
                                $commerFooter.removeClass('nextVisible');
                            }else{
                                $commerFooter.css('background', '#BCEF00');
                                $commerFooter.addClass('nextVisible');
                            }
                        } else {
                            $commerFooter.css('background', '#eee');
                            $commerFooter.removeClass('nextVisible');
                        }
                    }
                }
            });

            //'pre键'交互
            $contentFt.delegate('#J_CommerHeader', 'click', function () {
                var $this = $(this);

                var preId = 0;
                var curId = '';
                var curValue = '';

                if ($this.hasClass('preVisible')) {
                    $('.J_RadioItem').each(function (i, n) {
                        if ($(n).css('display') !== 'none') {
                            curId = $(n).attr('data-id');
                            curValue = $(n).attr('data-curValue');

                            $(n).hide();
                        }
                    });

                    preId = parseInt(curId) - 2;
                    $($('.J_RadioItem')[preId]).show();

                    //获取2个测试模块的首个数据块的id
                    if (preId === 0 || preId === parseInt($($testPart2.find('.J_RadioItem')[0]).attr('data-id')) - 1) {
                        $commerHeader.css('background', '#eee');
                        $commerHeader.removeClass('preVisible');
                    } else {
                        $commerHeader.css('background', '#BCEF00');
                        $commerHeader.addClass('preVisible');
                    }

                    $commerFooter.css('background', '#BCEF00');
                    $commerFooter.addClass('nextVisible');
                } else {
                    //不能回退提示
                }
            });

            //开始模块1测试
            $startPart1.on('click', function () {
                var $this = $(this);
                $mainContent1.show();

                //获取妈妈测试模块数据
                $.ajax({
                    url: PREFIX + $this.attr('data-url'),
                    data: {
                        type: 1
                    },
                    success: function (res) {
                        if (res.returnCode == 0) {
                            $motherPart1.hide();
                            $contentFt.show();

                            var resultArr = res.body,
                                resultArrLen = resultArr.length;

                            for (var i = 0; i < resultArrLen; i++) {
                                if(resultArr[i].options[0].templateValue.currentPoint){

                                }else{
                                    if (resultArr[i].options[0].templateValue.answers) {
                                        var answersData = {};
                                        answersData.id = resultArr[i].options[0].id;
                                        answersData.question = resultArr[i].decription;

                                        answersData.reply = [];

                                        for (var j = 0; j < resultArr[i].options[0].templateValue.answers.length; j++) {
                                            answersData.reply.push({
                                                'replyId': resultArr[i].options[0].templateValue.answers[j].id,
                                                'description': resultArr[i].options[0].templateValue.answers[j].description,
                                                'className': 'setRadio' + resultArr[i].options[0].id
                                            });
                                        }

                                        var partContent = Mustache.render(tpl.answersTpl.join(''), answersData);
                                        $testPart1.append(partContent);

                                    } else if (resultArr[i].options[0].templateValue.type) {
                                        switch (resultArr[i].options[0].templateValue.type) {
                                            case 'YearSelect':
                                                var yearSelectData = {};
                                                yearSelectData.id = resultArr[i].options[0].id;
                                                yearSelectData.question = resultArr[i].decription;

                                                var partContent = Mustache.render(tpl.yearSelectTpl.join(''), yearSelectData);
                                                $testPart1.append(partContent);

                                                //家长'出生年份'选择框
                                                var $parentBirthDay = $('.J_ParentBirthDay');

                                                $parentBirthDay.mobiscroll().date({
                                                    display: 'modal',
                                                    theme: 'android-holo',
                                                    mode: 'scroller',
                                                    lang: 'zh',
                                                    dateOrder: 'yy',
                                                    setText: '确定',
                                                    cancelText: '取消',
                                                    minWidth: 240,
                                                    dateFormat: 'yy',
                                                    headerText: function (str) {
                                                        return str;
                                                    },
                                                    onSelect: function (e) {
                                                        $(this).parents('.J_RadioItem').attr('data-curValue', e);

                                                        $commerFooter.css('background', '#BCEF00');
                                                        $commerFooter.addClass('nextVisible');
                                                    }
                                                });

                                                break;
                                            case 'input':
                                                var inputData = {};
                                                inputData.id = resultArr[i].options[0].id;
                                                inputData.question = resultArr[i].decription;

                                                var partContent = Mustache.render(tpl.inputTpl.join(''), inputData);
                                                $testPart1.append(partContent);

                                                break;
                                            case 'DateSelect':
                                                var dateSelectData = {};
                                                dateSelectData.id = resultArr[i].options[0].id;
                                                dateSelectData.question = resultArr[i].decription;

                                                var partContent = Mustache.render(tpl.dateSelectTpl.join(''), dateSelectData);
                                                $testPart1.append(partContent);

                                                //宝宝'出生日期'选择框
                                                var $babyBirthDay = $('.J_BabyBirthDay');
                                                $babyBirthDay.mobiscroll().date({
                                                    display: 'modal',
                                                    theme: 'android-holo',
                                                    mode: 'scroller',
                                                    lang: 'zh',
                                                    dateOrder: 'yyMMdd',
                                                    setText: '确定',
                                                    cancelText: '取消',
                                                    minWidth: 80,
                                                    dateFormat: 'yy-mm-dd',
                                                    monthNames: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                                                    headerText: function (str) {
                                                        return str;
                                                    },
                                                    onSelect: function (e) {
                                                        $(this).parents('.J_RadioItem').attr('data-curValue', e);

                                                        $commerFooter.css('background', '#BCEF00');
                                                        $commerFooter.addClass('nextVisible');
                                                    }
                                                });

                                                break;
                                            case 'BabyTree':
                                                var babyTreeData = {};
                                                babyTreeData.id = resultArr[i].options[0].id;
                                                babyTreeData.question = resultArr[i].decription;

                                                var partContent = Mustache.render(tpl.babyTreeTpl.join(''), babyTreeData);
                                                $testPart1.append(partContent);

                                                break;
                                            case 'DegreeBar':
                                                var testPart1Arr = $testPart1.find('.J_RadioItem').length;
                                                var degreeBarData = {};
                                                degreeBarData.id = resultArr[i].options[0].id;
                                                degreeBarData.displayId = resultArr[i].options[0].id - testPart1Arr;
                                                degreeBarData.question = resultArr[i].decription;

                                                var partContent = Mustache.render(tpl.degreeBarTpl.join(''), degreeBarData);
                                                $testPart2.append(partContent);

                                                break;
                                            default:
                                                break;
                                        }
                                    }
                                }

                                $($('.J_RadioItem')[0]).show();
                            }
                        }
                    },
                    error: function (xhr, type) {
                        $.preview({
                            content: '请求服务器异常,稍后再试',
                            title: '提示',
                            lock: true,
                            okText: '确定'
                        });
                    }
                });
            });

            //开始模块2测试
            $startPart2.on('click',function(){
                var testPart1Len = $testPart1.find('.J_RadioItem').length;
                $motherPart2.hide();
                $mainContent2.show();
                $($('.J_RadioItem')[testPart1Len]).show();
                $contentFt.show();

                $commerHeader.css('background', '#eee');
                $commerHeader.removeClass('preVisible');
            });
        }

        //'宝宝测试'交互
        if ($('#J_BabyInfo').length) {
            var $babyPart1 = $('.J_BabyPart1');
            var $mainContent1 = $('#J_MainContent1');
            var $testPart1 = $('#J_TestPart1');
            var $testPart2 = $('#J_TestPart2');
            var $testPart3 = $('#J_TestPart3');
            var $testPart4 = $('#J_TestPart4');

            //medio完成后的点击交互
            $('#J_MainContent').delegate('.J_SubmitChoose','click',function(){
                var $this = $(this);
                var $curParent = $this.parents('.J_MediaItem');

                if($this.hasClass('visibleChoose') && !$this.hasClass('J_LastPage')){
                    var answerDetailId = $this.attr('data-answerId');
                    $curParent.attr('data-answerId',answerDetailId);

                    if($curParent.attr('data-arrLength') === $curParent.attr('data-currentIndex')){
                        //关卡结果浮层
                        var success2Tpl = '<div class="suc-tip" id="J_SucTip"><div><img src="' + global.addPrefix('/images/suc2.png') + '"><a href="javascript:;" id="J_Success2" class="next-answer"></a></div></div>';
                        $.preview({
                            content: success2Tpl,
                            width:'300px',
                            height:'308px',
                            lock: true,
                            setHeader:false,
                            background:'true'
                        });

                        $('.rDialog-mask').show();
                    }else{
                        //继续答题浮层
                        var success1Tpl = '<div class="suc-tip" id="J_SucTip"><div><img src="' + global.addPrefix('/images/suc1.png') + '"><a href="javascript:;" id="J_Success1" class="next-answer"></a></div></div>';
                        $.preview({
                            content: success1Tpl,
                            width:'300px',
                            height:'308px',
                            lock: true,
                            setHeader:false,
                            background:'true'
                        });

                        $('.rDialog-mask').show();

                        setTimeout(function(){
                            $('#J_Success1').trigger('click')
                        },3000);
                    }
                }
            });

            //最后关卡处理
            $('#J_MainContent').delegate('.J_LastPage','click',function(){
                var $this = $(this);

                if($this.attr('data-answer-id') === '1'){
                    var success3Tpl = '<div class="suc-tip suc-tip3" id="J_SucTip"><div><img src="' + global.addPrefix('/images/suc3.png') + '"><a href="'+ byeUrl +'" id="J_Success3" class="next-answer"></a></div></div>';
                    $.preview({
                        content: success3Tpl,
                        width:'300px',
                        height:'308px',
                        lock: true,
                        setHeader:false,
                        background:'true'
                    });

                    $('.rDialog-mask').show();
                }else{
                    var success4Tpl = '<div class="suc-tip suc-tip4" id="J_SucTip"><div><img src="' + global.addPrefix('/images/suc4.png') + '"><a href="'+ testUrl + '" id="J_Success4" class="next-answer"></a></div></div>';
                    $.preview({
                        content: success4Tpl,
                        width:'300px',
                        height:'308px',
                        lock: true,
                        setHeader:false,
                        background:'true'
                    });

                    $('.rDialog-mask').show();
                }
            });

            //点击同关下道题目的交互
            $('#J_BabyInfo').delegate('#J_Success1','click',function(){
                $('.rDialog-mask').hide();
                $('.rDialog').remove();

                var $this      = $(this);
                var $testPart  = $('#J_TestPart' + util.part);
                var partArr    = util['partArr' + util.part];
                var optionId;

                $testPart.find('.J_MediaItem').each(function(index, item) {
                    if ($(item).css('display') !== 'none') {
                        optionId = partArr.detailArr[index + 1];
                    }
                });

                showOption(util.part, optionId);

                $this.hide();
            });

            var showPart = function(part) {
                var $testPart    = $('#J_TestPart' + part);
                var $babyPart    = $('#J_BabyPart' + part);
                var $mainContent = $('#J_MainContent' + part);

                $babyPart.hide();
                $mainContent.show();

                var partsArr     = util.partsArr;
                var partArr      = util['partArr' + part];
                var currentIndex = 0;

                for (var i = 0; i < partsArr.length; i++) {
                    for (var j = 0; j < partArr.detailArr.length; j++) {
                        if (partArr.detailArr[j] === partsArr[i].id) {
                            var partData = {};

                            currentIndex++;

                            partData.arrLength = partArr.detailArr.length;
                            partData.currentIndex = currentIndex;

                            partData.rootId = partsArr[i].id;
                            partData.medioId = partsArr[i].medioId;

                            if (partsArr[i].answerId) {
                                partData.answerId = partsArr[i].answerId;
                                partData.answerList = partsArr[i].answerList;
                                partData.hasAnswerId = true;
                            } else {
                                partData.hasAnswerId = false;
                            }

                            if (partsArr[i].videoUrl) {
                                partData.videoUrl = partsArr[i].videoUrl;
                                partData.hasVideo = true;
                            } else {
                                partData.hasVideo = false;
                            }

                            if (partsArr[i].audioUrl) {
                                partData.audioUrl = partsArr[i].audioUrl;
                                partData.hasAudio = true;
                            } else {
                                partData.hasAudio = false;
                            }

                            var html = Mustache.render(tpl.videoTpl.join(''), partData);

                            $testPart.append(html);
                        }
                    }
                }

                util.part = part;

                showOption(part, partArr.detailArr[0]);
            };

            var showOption = function(part, optionId) {
                var $testPart  = $('#J_TestPart' + part);
                var $mediaItem = $('#J_MediaItem' + optionId);

                $testPart.find('.J_MediaItem').hide();
                $mediaItem.show();

                if ($mediaItem.attr('data-video') === 'true') {
                    palyVideo(optionId, '', function() {
                        $mediaItem.find('.J_SubmitChoose').addClass('visibleChoose');
                        $mediaItem.find('.J_SubmitChoose').addClass('choose-item');

                        var question = global.babyData[optionId];
                        var options  = question.options;

                        if (part === 4) {
                            $mediaItem.find('.J_SubmitChoose').addClass('J_LastPage');
                        }
                    });
                }

                if ($mediaItem.attr('data-audio') === 'true') {
                    playAudio(optionId, '', function() {
                        $mediaItem.find('.J_SubmitChoose').addClass('visibleChoose');
                        $mediaItem.find('.J_SubmitChoose').addClass('choose-item');

                        var question = global.babyData[optionId];
                        var options  = question.options;

                        if (part === 4) {
                            $mediaItem.find('.J_SubmitChoose').addClass('J_LastPage');
                        }
                    });
                }
            };

            var palyVideo = function(optionId, src, callback) {
                var $video = $('#J_Video' + optionId);

                $video.off('ended').on('ended', function() {
                    callback();
                });

                if (src !== '') {
                    $video.attr('src', src);
                }

                $video[0].play();
            };

            var playAudio = function(optionId, src, callback) {
                var $audio = $('#J_Audio' + optionId);

                $audio.off('ended').on('ended', function() {
                    callback();
                });

                if (src !== '') {
                    $audio.attr('src', src);
                }

                $audio[0].play();
            };

            //点击下关的交互
            $('#J_BabyInfo').delegate('#J_Success2','click',function(){
                $('.rDialog-mask').hide();
                $('.rDialog').remove();

                var $this = $(this);
                var curModuleIndex;

                $('.J_ModuleBd').each(function(i,n){
                    if($(n).css('display') !== 'none'){
                        curModuleIndex = i+1;
                        $(n).hide();
                    }
                });

                $this.hide();

                var nextModuleIndex = curModuleIndex + 1;

                $('#J_BabyPart'+nextModuleIndex).show();

                switch(nextModuleIndex){
                    case util.partArr2.id:

                        break;
                    case util.partArr3.id:

                        break;
                    case util.partArr4.id:

                        break;
                    default:
                        break;
                }
            });

            //开始宝宝测试
            var $mainContent = $('#J_MainContent');

            $.ajax({
                url: PREFIX + $mainContent.attr('data-url'),
                data: {
                    type: 0,
                    kidId: global.kidId
                },
                success: function (res) {
                    if (res.returnCode == 0) {

                        global.parseBabyData(res.body);

                        $babyPart1.hide();
                        $mainContent1.show();

                        var sortArr = [];
                        var partsArr = [];
                        var splitArr = [];

                        var resultArr = res.body,
                            resultArrLen = resultArr.length;

                        for (var i = 0; i < resultArrLen; i++) {
                            if (resultArr[i].options[0].templateValue.currentPoint) {
                                sortArr.push(resultArr[i].id);
                            } else {
                                if(resultArr[i].options.length === 2){
                                    partsArr.push({id:resultArr[i].id,medioId:resultArr[i].options[0].id,videoUrl:resultArr[i].options[0].templateValue.videoUrl,audioUrl:resultArr[i].options[0].templateValue.audioUrl,answerId:resultArr[i].options[1].id,answerList:resultArr[i].options[1].templateValue.answers});
                                }else if(resultArr[i].options.length === 1){
                                    partsArr.push({id:resultArr[i].id,medioId:resultArr[i].options[0].id,videoUrl:resultArr[i].options[0].templateValue.videoUrl,audioUrl:resultArr[i].options[0].templateValue.audioUrl,type:resultArr[i].options[0].type});
                                }

                                splitArr.push(resultArr[i].id);
                            }
                        }

                        //拼装每个模块的id列表
                        var part1Arr = $.grep(splitArr, function (value) {
                            return value > sortArr[0] && value < sortArr[1];
                        });

                        var part2Arr = $.grep(splitArr, function (value) {
                            return value > sortArr[1] && value < sortArr[2];
                        });

                        var part3Arr = $.grep(splitArr, function (value) {
                            return value > sortArr[2] && value < sortArr[3];
                        });

                        var part4Arr = $.grep(splitArr, function (value) {
                            return value > sortArr[3];
                        });

                        util.partsArr = partsArr;
                        util.partArr1 = {id:1,detailArr:part1Arr};
                        util.partArr2 = {id:2,detailArr:part2Arr};
                        util.partArr3 = {id:3,detailArr:part3Arr};
                        util.partArr4 = {id:4,detailArr:part4Arr};

                        $mainContent.delegate('.J_StartPart', 'click', function() {
                            var $this = $(this);
                            var part  = $this.attr('data-part');

                            showPart(parseInt(part));
                        });
                    }
                },
                error: function (xhr, type) {
                    $.preview({
                        content: '请求服务器异常,稍后再试',
                        title: '提示',
                        lock: true,
                        okText: '确定'
                    });
                }
            });
        }

        //'一键登录'交互
        //倒计时函数
        var countdown;
        var setTime = function(obj){
            countdown = Cookie.get("secondsremained");
            if (countdown == 0) {
                obj.removeClass('disabled');
                obj.text('获取短信密码');
                $('#J_ErrorTip').hide();
                return false;
            } else {
                obj.addClass('disabled');
                obj.text(countdown + 's后重新发送');
                countdown --;
                Cookie.edit("secondsremained",countdown,countdown+1);
            }
            setTimeout(function(){ setTime(obj) },1000); //每1000毫秒执行一次
        };

        if ($('#J_Login').length) {
            $('#J_LoginBtn').on('click',function(){
                $.preview({
                    content: Mustache.render(tpl.loginTpl.join('')),
                    title: '登录提示',
                    lock: true,
                    okText: '一键登录',
                    okCallBack: true,
                    ok: function () {
                        var $mobile = $('#J_Mobile');
                        var $codeNumber = $('#J_CodeNumber');
                        var $errorTip = $('#J_ErrorTip');

                        if ($.trim($mobile.val()) === '' || !(/^(13[0-9]|14[57]|15[012356789]|18[0-9]|17[0-9])\d{8}$/.test($.trim($mobile.val())))) {
                            $errorTip.text('请输入正确的手机号码');
                            $errorTip.show();
                            return false;
                        } else if ($.trim($codeNumber.val()) === '') {
                            $errorTip.text('请输入正确的短信密码');
                            $errorTip.show();
                            return false;
                        } else {
                            $errorTip.hide();
                        }

                        if (!($('.rDialog-ok').hasClass('disabled'))) {
                            $.ajax({
                                type: 'post',
                                url: $mobile.attr('data-url'),
                                data: {mobile: $mobile.val(), code: $codeNumber.val()},
                                dataType: 'json',
                                success: function (res) {
                                    if (res.flag) {
                                        $('.rDialog-ok').addClass('disabled');
                                        window.location.href = res.url;
                                    } else {
                                        $errorTip.text(res.msg);
                                        $errorTip.show();
                                    }
                                },
                                error: function (xhr, type) {
                                    $errorTip.text('请求服务器异常,稍后再试');
                                    $errorTip.show();
                                }
                            });
                        }
                    }
                });
            });

            $('#J_Login').delegate('#J_ValidateCode','click', function () {
                var $this = $(this);
                var $mobile = $('#J_Mobile');

                if(!$this.hasClass('disabled')){
                    if ($.trim($mobile.val()) === '' || !(/^(13[0-9]|14[57]|15[012356789]|18[0-9]|17[0-9])\d{8}$/.test($.trim($mobile.val())))) {
                        $('#J_ErrorTip').text('请输入正确的手机号码');
                        return false;
                    } else {
                        $('#J_ErrorTip').text('');
                    }

                    //获取短信密码ajax请求
                    $.ajax({
                        type: 'post',
                        url: $this.attr('data-url'),
                        data: {mobile: $.trim($mobile.val())},
                        dataType: 'json',
                        success: function (res) {
                            if(res.flag){
                                $('#J_ValidateCode').addClass('disabled');
                            }

                            $('#J_ErrorTip').text(res.msg);
                        },
                        error: function (xhr, type) {
                            $('#J_ErrorTip').text('请求服务器异常,稍后再试');
                        }
                    });

                    Cookie.add("secondsremained",60,60);//添加cookie记录,有效时间60s
                    setTime($('#J_ValidateCode'));//开始倒计时
                }
            });
        }
    };
});