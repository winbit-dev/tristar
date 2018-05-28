(function($) {
    var page =  location.search?urlToObject(location.search).page:1;
    var opt = {
        'index':page,
        'pageContainer': '.item',
        'after': function() {},
        'before': function() {},
        'speed': false,
        'refresh': false,
        'useWheel': true,
        'useKeyboard':true,
        'useAnimation': true,
    };
    var after=true;
    var delay = true;
    var keyIndex = opt.index - 1;
    var defaultSpeed = 700;
    var pageCount = 1
    var windowH = window.innerHeight
    var direction=''
    var removedIndex=''
    var removedPages={}
    window.slidePage = {
        'init': function(option,callback) {
            defaultSpeed = $(opt.pageContainer).css('transition-duration').replace('s','')*1000;
            pageCount = $(opt.pageContainer).length
            $.extend(opt, option);
            initDom(opt);
            initEvent(opt);
            callback&&callback.call(this)
        },

        'index': function(index){
            if(index>0&&index!=keyIndex+1){
                index=parseInt(index)-1;
                var endheight = $(".item").eq(index).children().height();
                var offset=(endheight-windowH)>20?1:0 //-- 判断最终页如果是滚动条模式的话偏移量为1
                if(index>keyIndex){
                    for(var i= keyIndex;i<index;i++){
                        nextPage($(opt.pageContainer).eq(i));
                        isScroll(i+2,offset)
                        slideScroll(i+2)
                    }
                }else if(index<keyIndex){
                    for(var i=keyIndex;i>=index+1;i--){
                        prevPage($(opt.pageContainer).eq(i));
                        isScroll(i,offset)
                        slideScroll(i)
                    }
                }
                keyIndex=index;
            }
            return keyIndex
        },
        'next': function(){
            if(keyIndex<pageCount-1){
                var item = $(opt.pageContainer).eq(keyIndex++)
                nextPage(item)
                isScroll(item.index()+2)
                slideScroll(item.index()+2)
                delay=false
            }
        },
        'prev': function(){
            if(keyIndex>0){
                var item = $(opt.pageContainer).eq(keyIndex--)
                prevPage(item)
                isScroll(item.index())
                slideScroll(item.index())
                delay=false
            }
        },
        'fire':function(index){
            fireAnimate(index)
        },
        'remove':function(index, callback){
          if (!removedIndex.match(index)) {
            pageCount--
            if(keyIndex > index){
              keyIndex--
            }
            removedIndex = index + ',' + removedIndex
            removedPages[index] = $(opt.pageContainer).eq(index-1).remove()
            callback&&callback()
          }
        },
        'recover':function(index, callback){
          if (removedIndex.match(index)) {
            removedIndex = removedIndex.replace(index + ',', '');
            if (index >= pageCount) {
                $(opt.pageContainer).eq(pageCount-1).after(removedPages[index]);
            } else {
                $(opt.pageContainer).eq(index-1).before(removedPages[index]);
            }
            if(keyIndex > index){
              keyIndex++
            }
            pageCount++
            if (direction == 'prev') {
              obj.prevSlide(removedPages[index])
            } else {
              obj.prevSlide(removedPages[index])
            }
            callback&&callback()
          }
        },
        canNext:true,
        canPrev:true,
        isScroll:false,

    };
    var obj = {
        'nextSlide': function(item) {
            item.css({'transform':'translate3d(0px, -100%, 0px)','-webkit-transform':'translate3d(0px,-100%, 0px)'});
            var css = translate('0')
            item.next().css(css)
        },
        'prevSlide': function(item) {
            item.prev().css({'-webkit-transform': 'scale(1)','transform': 'scale(1)'});
            item.css(translate('100%'))
        },
        'showSlide': function(item) {
            item.css({'-webkit-transform': 'scale(1)','transform': 'scale(1)'});
            item.next().css(translate('100%'))
        }
    }
 
    function IsPC() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }


    function translate(y){
        return {'-webkit-transform':'translate3d(0px, '+y+' 0px)','transform':'translate3d(0px, '+y+', 0px)'}
    }


    function pageActive(){
        if(opt.refresh&&delay&&opt.useAnimation){
            $(opt.pageContainer).eq(keyIndex).find('.step').addClass('hide')
            $(opt.pageContainer).eq(keyIndex).find('.lazy').addClass('hide')
        }
    }

    function urlToObject(url){
        var urlObject = {};
        if (/\?/.test(url)) {
            var urlString = url.substring(url.indexOf("?")+1);
            var urlArray = urlString.split("&");
            for (var i=0, len=urlArray.length; i<len; i++) {
                var urlItem = urlArray[i];
                var item = urlItem.split("=");
                urlObject[item[0]] = item[1];
            }
            return urlObject;
        }
    }

    function nextPage(item) {
        direction = 'next'
        if (item.next().length) {
            currentItem = item.next();
            orderStep(item.next(),direction);
            obj.nextSlide(item);
        } else {
            obj.showSlide(item);
        }
        keyindex = $(opt.pageContainer).index(item)
        opt.before(item.index()+1,direction,item.index()+2);
        pageActive()
    }

    function prevPage(item) {
        direction = 'prev'
        if (item.prev().length) {
            currentItem = item.prev();
            orderStep(item.prev(),direction);
            obj.prevSlide(item);
            item.prev().prev().css(translate('-100%'));
        } else {
            obj.showSlide(item);
        }
        opt.before(item.index()+1,direction,item.index());
        keyindex = $(opt.pageContainer).index(item)
        pageActive()
    }

    function initDom(opt) {
        if (!!opt.speed){
            $(opt.pageContainer).css({'transition-duration':opt.speed+'ms','-webkit-transition-duration':opt.speed+'ms'});
        }
        slidePage.index(opt.index)

        if (!!opt.useAnimation) {
            var items = $(opt.pageContainer);
            items.find('.step').addClass('hide');
            items.find('.lazy').addClass('hide');
            orderStep(items.eq(opt.index - 1))
        }
    }

    function orderStep(dom,delays) {
        after=true;
        setTimeout(function(){
            delay = delays||delay;
        },opt.speed||defaultSpeed)
        var steps = $(dom).find('.step');
        steps.each(function(index,item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }

    function fireAnimate(index) {
        var item = $(opt.pageContainer).eq(index - 1);
        var lazy = item.find('.lazy')
        lazy.each(function(i,item) {
            var time = $(item).attr('data-delay') || 100;
            setTimeout(function() {
                $(item).removeClass('hide')
            }, time)
        })
    }


    function isScroll(target,offset){
        var offset = offset===0?0:false||1
        var itemheight = $(".item").eq(target - 1).children().height();
        if((itemheight-windowH)>20){
            var isNext = direction == 'next'; 
            !isNext?$(opt.pageContainer).eq(target-1).scrollTop(itemheight-windowH-offset):$(opt.pageContainer).eq(target-1).scrollTop(offset)
        }
    }

    function slideScroll(target){
        var itemheight = $(".item").eq(target - 1).children().height();
        if((itemheight-windowH)>20){
            $(opt.pageContainer).eq(target-1).on('scroll',function(e){
                var isBottom = itemheight <= this.scrollTop+windowH+1;
                var isTop = this.scrollTop==0;
                slidePage.canSlide = isBottom || isTop;
                slidePage.canPrev = isTop && !isBottom;
                slidePage.canNext = isBottom && !isTop;
                slidePage.isScroll = !(slidePage.canSlide)
            });
        }else{
            slidePage.canPrev = true;
            slidePage.canNext = true;
            slidePage.canSlide = true;
            slidePage.isScroll = false;
        }

    }


    function initEvent(opt) {
        function wheelFunc(e){
            var e = e|| window.event
            if(e.wheelDeltaY<0||e.wheelDelta<0||e.detail>0){
                slidePage.canNext&&delay&&slidePage.next();
            }else if(e.wheelDeltaY>0||e.wheelDelta>0||e.detail<0){
                slidePage.canPrev&&delay&&slidePage.prev();
            }

        }

        if(!!opt.useWheel){
            document.onmousewheel = wheelFunc
            document.addEventListener&& document.addEventListener('DOMMouseScroll',wheelFunc,false);
        }

        if(!!opt.useKeyboard){
            document.onkeydown = function(e){
                if(e.keyCode=='40'&&delay&&keyIndex<pageCount-1){
                    slidePage.canNext&&slidePage.next();
                }else if(e.keyCode == '38'&&delay&&keyIndex>0){
                    slidePage.canPrev&&slidePage.prev();
                }
            }
        }

        var touchY = 0

        document.getElementById('slidePage-container').addEventListener('touchstart',function(e){
            touchY = e.touches[0].clientY
        })

        document.getElementById('slidePage-container').addEventListener('touchmove',function(e){
            var offsetY = e.touches[0].clientY-touchY
            !slidePage.canPrev&&offsetY>5&&(slidePage.isScroll=true)
            !slidePage.canNext&&offsetY<-5&&(slidePage.isScroll=true)
            !slidePage.isScroll&&e.preventDefault()
        });

        $(opt.pageContainer).on({
            'swipeUp':  function () {
                slidePage.canNext&&slidePage.next();
            },
            'swipeDown':  function () {
                slidePage.canPrev&&slidePage.prev();
            }
        });


        $(opt.pageContainer).on('transitionend webkitTransitionEnd', function(event) {

          var removedLength = removedIndex.split(',').length
            if(after){
              if (removedLength>1) {
                opt.after(direction=='next'?keyIndex+1:keyIndex+2,direction,keyIndex+2);
              } else {
                opt.after(direction=='next'?keyIndex:keyIndex+2,direction,keyIndex+1);
              }
              after=false;
            }
        })
    }
})($);
