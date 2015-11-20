/*!
*BDialog2.1
*javascript弹窗插件
*author:陆小森
*
*last update date 2015-11-19
*/
(function (window, undefined) {
    var regid = /^#([\w-]*)$/,
      regClass = /^\.([\w-]*)$/,
      regName = /^(div|a|p|ul|li|input|select|document|body|iframe|span)$/,
      regWhite = /\s*/g,
      boxList = {},
      zIndex = 100000,
      index = 0, _thisDefault, funcNameToAction = {},
      cw, ch,bodyDom=_B("body")[0];
    getWindowSize();
   
    //#id name .class
    function _B(name, doc) {
        try{
            var selector, match, result = [];
            var doctemp;
            if (doc) {
                doctemp = (typeof doc == "object" && doc.length > 0 && doc[0] && doc[0].nodeType || doc && doc.nodeType) ? doc : _B(doc);
            } else {
                doctemp = window.document;
            }
            selector = name && name.replace(regWhite, "");
            match = regid.exec(selector);
            if (match && match[1]) {
                result = document.getElementById(match[1]);
            }
            match = regClass.exec(selector);
            if (match && match[1]) {
                var elems = doctemp.getElementsByTagName("*");
                var len = elems && elems.length || 0;
                for (var i = 0; i < len; i++) {
                    var currentelem = elems[i];
                    var reg=new RegExp("\\b"+match[1]+"\\b");
                    if(reg.test(currentelem.className)){
                        result.push(currentelem);
                    }
                }
            }
            match = regName.exec(selector);
            if (match && match[1]) {
                result = doctemp.getElementsByTagName(match[1]);
            }
            return result ? result : null;
        }catch(e){
            return null;
        }
        
    }
    //内置的原生ajax请求，默认是异步
    function bAjax(type, url, data, asyn, callback, beforecallback, errorcallback) {
        var xmlreq;
        try {
            if (window.XMLHttpRequest) {
                xmlreq = new XMLHttpRequest();
            } else {
                xmlreq = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlreq.open(type, url, asyn);
            xmlreq.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlreq.onreadystatechange = function () {
                if (xmlreq.readyState == 4 && xmlreq.status == 200) {
                    callback(xmlreq);
                }
                if (xmlreq.readyState < 4) {
                    beforecallback();
                }
                if (xmlreq.status != 200) {
                    errorcallback(xmlreq.status);
                }
            }
            xmlreq.send(data);
        } catch (e) {
            errorcallback(e);
        }
    }

    function createDom(name, obj) {
        var match = regName.exec(name),
          dom;
        if (match && match[1]) {
            dom = document.createElement(match[1]);
        }
        if (dom.nodeType && dom.nodeType == 1) {
            for (var i in obj) {
                var match = i.split(/\./);
                var len = match && match.length || 0;
                if (len == 1) {
                    dom[match[0]] = obj[i];
                } else if (len == 2) {
                    dom.style[match[1]] = obj[i];
                }
            }
        }
        return dom;
    }
    var nofunc=function(){};
    function addEvent(obj, type, func) {
        if (window.addEventListener) {
            obj.addEventListener(type, func, false);
        } else {
            obj.attachEvent("on" + type, func);
        }
    }

    function delEvent(obj, type, func) {
        if (window.removeEventListener) {
            obj.removeEventListener(type, func, false);
        } else {
            obj.detachEvent("on" + type, func);
        }
    }
    function bExtend(obj1, obj2) {
        for (var i in obj2) {
            obj1[i] = obj2[i];
        }
        return obj1;
    }
    function BDialog(args) {
        return new BDialog.prototype.init(args);
    }
    //获取浏览器可视区域宽高
    function getWindowSize() {
        var obj = {};
        if (window.innerWidth) {
            obj.w = window.innerWidth;
            obj.h = window.innerHeight 
            obj.sl = document.documentElement.scrollLeft;
            obj.st=document.documentElement.scrollTop;
        } else if (document.documentElement && document.documentElement.clientWidth) {
            obj.w = document.documentElement.clientWidth;
            obj.h = document.documentElement.clientHeight;
            obj.sl = document.documentElement.scrollLeft;
            obj.st = document.documentElement.scrollTop;
        } else {
            obj.w = bodyDom.clientWidth;
            obj.h = bodyDom.clientHeight; 
            obj.sl =bodyDom.scrollLeft;
            obj.st =bodyDom.scrollTop;
        }
        cw = obj.w;
        ch = obj.h;
       
        return obj;
    }
    BDialog.prototype = BDialog.pp = {
        version: "1.0.0",
        constructor: "BDialog",
        init: function (args) {
            this.defaultpra = {
                //弹窗标题
                title: "消息",
                //弹窗内容
                content: "",
                tagImg: "",
                //页面iframe嵌套连接
                url: "",
                //宽度
                width: 300,
                //高度
                height: 130,
                //是否有遮罩层
                hasTask: true,
                //遮罩层透明度
                taskOpcity: 0.5,
                //弹窗展示形式
                showType: "normal",
                //默认确定按钮文字
                okText: "确定",
                //默认取消按钮文字
                cancleText: "取消",
                //确定按钮的回调事件
                okFunc: nofunc,
                //取消按钮的回调事件
                cancleFunc: nofunc,
                //关闭弹窗的回调事件
                closeFunc: nofunc,
                //延迟关闭时间
                delay: 1000,
                // 是否开启自动关闭
                autoClose:true,
                //是否允许拖拽
                drag: false,
                //自定义按钮
                buttonList: {
                    "自定义按钮1":{
                        func:nofunc,
                        className:""
                    }
                }
         }
            _thisDefault = this.defaultpra;
            bExtend(_thisDefault, args);
            
            //默认居中显示
            function calcInitPosition() {
                var objP = getWindowSize();
                cw = objP.w;
                ch = objP.h;
                if (args.left === undefined) {
                    _thisDefault.left = (cw - _thisDefault.width) / 2 + objP.sl;
                }
                if (args.top === undefined) {
                    _thisDefault.top = (ch - _thisDefault.height) / 2+objP.st;
                }
            }
            calcInitPosition();
            //按钮事件参数标准化
            funcNameToAction[_thisDefault.okText] = {
                func: _thisDefault.okFunc,
                className: "ok"
            };
            funcNameToAction[_thisDefault.cancleText] = {
                func: _thisDefault.cancleFunc,
                className: ""
            };
            funcNameToAction["close"] = _thisDefault.closeFunc;
            for (var i in _thisDefault.buttonList) {
                funcNameToAction[i] = _thisDefault.buttonList[i];
            }
            this.specialpra = args;
            this.currentOpen = null;
            this.mask=null;
            this.close = function (delay,callback) {
                var _this = this;
                var _delay =
                  typeof delay == "number" ? delay : 0;
                setTimeout(function () {
                    if (_this.currentOpen) {
                        _this.mask ? bodyDom.removeChild(_this.mask) : null;
                        _this.mask = null;
                         bodyDom.removeChild(_this.currentOpen);
                        delete boxList[_this.currentOpen.id];
                        _this.currentOpen = null;
                        if(typeof callback=="function"){
                            callback();
                        }
                    }
                }, _delay);

            };
            this.reposition=function(){
                calcInitPosition();
                this.currentOpen?this.currentOpen.style.cssText=this.currentOpen.style.cssText+";left:"+_thisDefault.left+"px;top:"+_thisDefault.top+"px":null;
            }
            this.shake = function (obj) {
                var _this = this;
                var f = obj && obj.range || 9;
                var direc = obj && obj.direc && (obj.direc == "top" || obj.direc == "left") && obj.direc || "left";
                var dv = _this.currentOpen.style[direc];
                var si = setInterval(function () {
                    _this.currentOpen.style[direc] = (parseFloat(dv) + f) + "px";
                    if (f < 0) {
                        f = Math.abs(f);
                        f--;
                    } else {
                        f = -f;
                    }
                    if (f == 0) {
                        clearInterval(si);
                        obj && obj.callback && obj.callback(_this);
                    }
                }, 50);
                return _this;
            };
            this.show = function (type) {
                var _this = this;
                var range = 100;
                var intype = type.replace(/-In/i, "");
                switch (type) {
                    case "normal":
                        _this.currentOpen.style.display = "block";
                        break;
                    case "left-in":
                    case "top-in":
                        var dv = _this.currentOpen.style[intype];
                        var si = setInterval(function () {
                            if (_this.currentOpen == null || range < 1) {
                                clearInterval(si);
                            }
                            _this.currentOpen.style[intype] = (parseFloat(dv) - range) + "px";
                            _this.currentOpen.style.display = "block";
                            range = range * 0.9;
                        }, 10);
                        break;
                    case "right-in":
                    case "bottom-in":
                        intype = intype == "right" ? "left" : "top";
                        var dv = _this.currentOpen.style[intype];
                        var si = setInterval(function () {
                            if (_this.currentOpen == null || range < 1) {
                                clearInterval(si);
                            }
                            _this.currentOpen.style[intype] = (parseFloat(dv) + range) + "px";
                            _this.currentOpen.style.display = "block";
                            range = range * 0.9;

                        }, 10);
                        break;
                    default:
                        _this.currentOpen.style.display = "block";
                        break;
                }
                 addEvent(window, "resize", function () {
                    _this.reposition();
                 })
            }
            this.alert = function (btnlist) {
                var _this = this;
                _this.mask = _thisDefault.hasTask ? this.createMask() : null;
                var box = this.createBox();
                var btnarr=btnlist||[_thisDefault.okText, "close"];
                if (box) {
                    this.createButtonHtml(btnarr, box);
                }
                return _this;
            };
            this.confirm = function () {
                return this.alert([_thisDefault.okText, _thisDefault.cancleText, "close"]);
            };
            this.myAlert = function () {
                var btnarr = [];
                for (var i in _thisDefault.buttonList) {
                    btnarr.push(i);
                }
                btnarr.push("close");
                return this.alert(btnarr);
            };
            this.tag = function () {
                var _this = this;
                _this.mask = _thisDefault.hasTask ? this.createMask() : null;
                var box = this.createTag();
                if(_thisDefault.autoClose){
                    var delay = +_thisDefault.delay ? _thisDefault.delay : 1000;
                    _this.close(delay,function(){
                        _thisDefault.closeFunc();
                    });
                }
                return _this;
            };
            this.prompt = function (val) {
                var _this = this;
                _thisDefault.content = "";
                _this.mask = _thisDefault.hasTask ? this.createMask() : null;
                var box = this.createBox();
                if (box) {
                    var buttondata = _thisDefault.buttonList;
                    var oFragment = document.createDocumentFragment();
                    var newdom = createDom("input", {
                        "className": "alertInput data",
                        "type": "text",
                        "value": val ? val : ""
                    });
                    oFragment.appendChild(newdom);
                    var contentDom = _B(".contenttext", box)[0];
                    contentDom.innerHTML = "";
                    contentDom.appendChild(oFragment);
                    this.createButtonHtml([_thisDefault.okText, _thisDefault.cancleText, "close"], box);
                }
                return _this;
            };
        },
        createMask: function () {
            if (this.mask) {
                return;
            }
            var maskId= "bDialog_Mask"+(+(new Date()));
            bodyDom.appendChild(createDom("div", {
                "className": "bDialog_div",
                "id": maskId,
                "style.cssText": "margin:0;padding:0;position:fixed;top:0;left:0;background-color:#000;width:100%;height:100%;filter:alpha(opacity=" + this.defaultpra.taskOpcity * 100 + ");-moz-opacity:" + this.defaultpra.taskOpcity + ";opacity:" + this.defaultpra.taskOpcity + " ;z-index:" + zIndex
            }))
            return _B("#"+maskId);
        },
        createBox: function () {
            cw = document.documentElement.clientWidth;
            ch = document.documentElement.clientHeight;
            var dialogId = "bDialog_alert" + index;
            if (_thisDefault.url != "") {
                _thisDefault.content = "<iframe class='iframe data' style='display:none;height:" + (_thisDefault.height - 110) + "px' src='" + _thisDefault.url + "'></iframe>";
            }
            if (_thisDefault.id) {
                var checkHas = boxList[_thisDefault.id];
                if (checkHas) {
                    checkHas.focus();
                    return false;
                } else {
                    dialogId = _thisDefault.id;
                }
            }
           bodyDom.appendChild(createDom("div", {
                "className": "bDialog_alert",
                "id": dialogId,
                "style.cssText": "display:none;left:" + _thisDefault.left + "px;top:" + _thisDefault.top + "px;margin:0;padding:0;position:fixed;width:" + _thisDefault.width + "px;min-height:" + _thisDefault.height + "px;z-index:" + zIndex + 1,
                "innerHTML": "<div class='title " + (_thisDefault.drag ? 'drag' : '') + "' style='draggable:false;height:30px'>"
                                  +"<a class='title_text'>&nbsp;&nbsp;&nbsp;&nbsp;" + _thisDefault.title + "</a><span class='close'>×</span>"
                            +"</div>"
                            +"<div class='content' >"
                                    +"<div class='tagimg'></div>"
                                    +"<div class='contenttext' style='min-height:" + (_thisDefault.height - 70) + "px;overflow:hidden'>"
                                          +"<table style='min-height:" + (_thisDefault.height - 70) + "px;'><tr><td>" + _thisDefault.content + "</td></tr></table>"
                                    +"</div>"
                            +"</div>"
                            +"<div class='footer' style='height:40px'>"
                                    +"<ul></ul>"
                            +"</div>"
            }));
            var contentDom=_B(".content", "#" + dialogId)[0];
            if (_thisDefault.url != "") {
                contentDom.className = "content loading";
                _B("iframe", "#" + dialogId)[0].onload = function () {
                    this.style.display = "block";
                    contentDom.className = "content";
                }
            }
            if (_thisDefault.ajax) {
                _thisDefault.content = "";
                bAjax(_thisDefault.ajax.type, _thisDefault.ajax.url, _thisDefault.data, true, function (xml) {
                    _B(".contenttext", "#" + dialogId)[0].innerHTML = xml.responseText;
                    contentDom.className = "content";
                }, function () {
                    contentDom.className = "content loading";
                }, function () {
                   contentDom.className = "content";
                })
            }
            // document.onreadystatechange
            var kl, kt, dialogobj, dragobj;
            (function () {
                dialogobj = _B("#" + dialogId);
                dragobj = _B(".drag", dialogobj)[0];
                if (dragobj) {
                    dragobj.onmousedown = function (e) {
                        var ke = e || window.event;
                        kl = ke.clientX - +dialogobj.style.left.replace("px", "");
                        kt = ke.clientY - +dialogobj.style.top.replace("px", "");
                        addEvent(document, "mousemove", mousemoveHandler);
                        if (dragobj.setCapture) {
                            dragobj.setCapture();
                        } else if (window.captureEvents) {
                            window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                        }
                    }
                    dragobj.onmouseup = function () {
                        delEvent(document, "mousemove", mousemoveHandler);
                        if (dragobj.releaseCapture) {
                            dragobj.releaseCapture();
                        } else if (window.captureEvents) {
                            window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                        }
                    }
                }
            }(index));

            function mousemoveHandler(e) {
                var re = e || window.event;
                var rx = re.clientX; //+ document.body.scrollLeft;
                var ry = re.clientY; //+ document.body.scrollTop;
                var limit = 10;
                if (rx - kl <= 0) {
                    dialogobj.style.left = 0;
                } else if (rx - kl >= cw - _thisDefault.width - limit) {
                    dialogobj.style.left = (cw - _thisDefault.width - limit) + "px";
                } else {
                    dialogobj.style.left = (rx - kl) + "px";
                }
                if (ry - kt <= 0) {
                    dialogobj.style.top = 0;
                } else if (ry - kt >= ch - _thisDefault.height - limit) {
                    dialogobj.style.top = (ch - _thisDefault.height - limit) + "px";
                } else {
                    dialogobj.style.top = (ry - kt) + "px";
                }
            }
            index++;
            this.currentOpen = _B("#" + dialogId);
            boxList[dialogId] = this.currentOpen;
            this.show(_thisDefault.showType);
            return _B("#" + dialogId);
        },
        createTag: function () {
            if (!this.specialpra.width) {
                _thisDefault.width = "auto";
            } else {
                _thisDefault.width = _thisDefault.width + "px"
            }
            if (!this.specialpra.height) {
                _thisDefault.height = "auto";
            } else {
                _thisDefault.height = _thisDefault.height + "px"
            }
           bodyDom.appendChild(createDom("div", {
                "className": "bDialog_alert bDialog_tag",
                "id": "bDialog_alert" + index,
                "style.cssText": "width:250px;display:none;left:50%;margin-left:-125px;position:absolute;z-index:" + zIndex + 1,
                "innerHTML": "<div class='content' style='padding:30px 10px;text-align:center'>" + _thisDefault.content + "</div>"
            }))
           
            this.currentOpen = _B("#bDialog_alert" + index);
            this.show(_thisDefault.showType);
            boxList["bDialog_alert" + index] = this.currentOpen;
            var _height=parseFloat(this.currentOpen.clientHeight);
            this.currentOpen.style.top=(ch-_height)/2+"px";
            index++;
            return this.currentOpen;
        },
        createButtonHtml: function (buttonList, box) {
            var oFragment = document.createDocumentFragment();
            var len = buttonList && buttonList.length || 0;
            var domlist = [];
            for (var i = 0; i < len; i++) {
                var _funcnameToAction = funcNameToAction[buttonList[i]];
                if (typeof _funcnameToAction == "object") {
                    var newdom = createDom("li", {
                        "className": _funcnameToAction.className?_funcnameToAction.className.replace(/data/, ""):"",
                        "innerHTML": buttonList[i]
                    });
                    domlist.push(newdom);
                    oFragment.appendChild(newdom);
                }
            }
            domlist.push(_B(".close", box)[0]);
            _B("ul", box)[0].appendChild(oFragment);
            this.bindButtonEvent(box, "click", buttonList, domlist);
            return oFragment;
        },
        bindButtonEvent: function (box, type, actionlist, domlist) {
            var len = actionlist && actionlist.length || 0;
            var _this = this;
            for (var i = 0; i < len; i++) {
                (function (i) {
                    var _funcnameToAction = funcNameToAction[actionlist[i]]
                    addEvent(domlist[i], type, function () {
                        var vallist = _B(".data", box), result;
                        if (typeof _funcnameToAction == "function") {
                            result = _funcnameToAction(box, vallist);
                            result === undefined ? _this.close() : null;
                        } else if (typeof _funcnameToAction.func == "function") {
                            result = _funcnameToAction.func(box, vallist);
                        }
                        result === undefined ? _this.close() : null;
                    });
                }(i))
            }
        }
    }
    BDialog.prototype.init.prototype = BDialog.prototype;
    try{
        exports.BDialog=BDialog
    }catch(e){
         window.BDialog = BDialog;
    } 
}(window))