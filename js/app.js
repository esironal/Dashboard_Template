FunctionHelper = {
    debounce: function (c, e, b) {
        var d, a;
        return function () {
            var j = this,
                h = arguments;
            var g = function () {
                d = null;
                if (!b) {
                    a = c.apply(j, h)
                }
            };
            var f = b && !d;
            clearTimeout(d);
            d = setTimeout(g, e);
            if (f) {
                a = c.apply(j, h)
            }
            return a
        }
    }
};
window._requestAnimationFrame = Modernizr.prefixed("requestAnimationFrame", window) || function (a) {
    window.setTimeout(a, 1000 / 60)
};
AnimationHelper = {
    tween: function (l, h, d, b, e, k) {
        var f, g, j, c, a;
        f = {};
        f[h] = parseInt(l.css(h), 10);
        g = {};
        g[h] = d;
        if (f[h] === g[h]) {
            if (k) {
                k()
            }
            return
        }
        j = new TWEEN.Tween(f).to(g, b).easing(e).onUpdate(function () {
            l.css(this)
        }).onComplete(function () {
            j.done = true
        });
        c = function (m) {
            m = (new Date()).getTime();
            j.update(m);
            if (!j.done) {
                window._requestAnimationFrame(c)
            } else {
                if (k) {
                    k()
                }
            }
        };
        j.start();
        window._requestAnimationFrame(c)
    }
};

String.prototype.stripTags = function () {
    return this.replace(/<.*?>/g, "")
};
String.prototype.removeHTMLEntities = function () {
    return this.replace(/&[^\s]*;/g, "")
};
String.prototype.makeKeySafe = function () {
    return $.trim(this.stripTags().removeHTMLEntities()).replace(/ /g, "_").replace(/__/g, "_").toLowerCase()
};

function Scroller(b) {
    var a = this;
    this.$el = b;
    this.pages = b.find(".page");
    this.pageThresholds = [];
    this.activePage = 0;
    this.totalPages = this.pages.length;
    this.animating = false;
    this.setPosition = $.proxy(this, "setPosition");
    this.resize = $.proxy(this, "resize");
    this.debouncedMousewheel = $.proxy(this, "debouncedMousewheel");
    $(window).on("resize", FunctionHelper.debounce(this.resize, 200)).on("mousewheel", this.debouncedMousewheel);
    $(document).keyup($.proxy(this, "keyUp"));
    if (Modernizr.hasEvent("touchstart")) {
        this.touchStart = $.proxy(this, "touchStart");
        this.touchMove = $.proxy(this, "touchMove");
        this.touchEnd = $.proxy(this, "touchEnd");
        $(window).on("touchstart", this.touchStart)
    }
    this.measure();
    this.layoutPageChildren()
}
Scroller.prototype = {
    measure: function () {
        var d, c, b, a;
        d = [];
        this.pageHeight = $(this.pages[0]).height();
        for (c = 0; c < this.totalPages; c++) {
            b = $(this.pages[c]);
            a = b.position();
            d.push({
                top: a.top,
                bottom: a.top + b.height()
            })
        }
        this.pageThresholds = d
    },
    mousewheel: function (c, f, b, a) {
        this.animateTo(this.constrainPage(this.activePage + (a > 0 ? -1 : 1)))
    },
    debouncedMousewheel: (function () {
        var c, d, b, a;
        c = function () {
            b = true
        };
        b = true;
        a = 1;
        return function (l, m, g, f) {
            var j, h, k;
            j = this;
            h = arguments;
            k = Math.round(Math.abs(f));
            if (k >= a) {
                clearTimeout(d);
                d = setTimeout(c, 300)
            }
            if (!this.animating && b && k >= a) {
                this.mousewheel.apply(j, h);
                b = false
            }
        }
    }()),
    touchStart: function (a) {
        if (a.originalEvent.touches.length !== 1) {
            return
        }
        this.touchStartY = a.originalEvent.touches[0].pageY;
        this.touchDiffY = 0;
        if (this.animating) {
            a.preventDefault();
            return
        }
        $(window).on({
            touchend: this.touchEnd,
            touchmove: this.touchMove
        })
    },
    touchMove: function (b) {
        var a, c;
        b.preventDefault();
        this.touchDiffY = b.originalEvent.touches[0].pageY - this.touchStartY
    },
    touchEnd: function (b) {
        var a, c;
        $(window).off({
            touchmove: this.touchMove,
            touchend: this.touchEnd
        });
        a = Math.abs(this.touchDiffY);
        if (a > 10) {
            c = (this.touchDiffY / a) * -1;
            this.animateTo(this.activePage + c)
        } else {}
    },
    keyUp: function (a) {
        if (a.keyCode == 32 || a.keyCode == 40) {
            this.next()
        }
        if (a.keyCode == 38) {
            this.prev()
        }
    },
    animateTo: function (h, c) {
        var a, f, g, b, e;
        if (h < 0) {
            return
        }
        if (h === this.activePage && !c) {
            return
        }
        if (this.animating) {
            return
        }
        a = this;
        f = this.pageThresholds[h].top * -1;
        g = (this.activePage < h) ? 1 : -1;
        $(this.pages[this.activePage]).trigger("exit.scroller", (g === 1) ? "down" : "up");
        this.animating = true;
        AnimationHelper.tween(this.$el, "top", f, 1500, TWEEN.Easing.Exponential.InOut, function () {
            a.animating = false;
            $(a.pages[h]).trigger("enter.scroller", (g === 1) ? "down" : "up")
        });
        this.layoutPageChildren(h, true);
        this.activePage = h
    },
    jumpTo: function (a) {
        if (this.activePage !== 0) {
            return
        }
        if (a === this.activePage) {
            $(this.pages[0]).trigger("enter.scroller", "down")
        } else {
            this.animateTo(a)
        }
    },
    layoutPageChildren: function (e, b) {
        var h, c, g, a, f, k, l;
        if (e === undefined) {
            e = this.activePage
        }
        for (h = 0; h < this.totalPages; h++) {
            c = $(this.pages[h]).children();
            for (g = 0; g < c.length; g++) {
                a = $(c[g]);
                f = a.data("scale") || 1;
                k = h - e;
                l = ((this.pageHeight * f) - this.pageHeight) * k;
                if (!b) {
                    a.css("margin-top", l)
                } else {
                    AnimationHelper.tween(a, "margin-top", l, 1500, TWEEN.Easing.Exponential.InOut)
                }
            }
        }
    },
    resize: function () {
        this.measure();
        this.layoutPageChildren();
        this.animateTo(this.activePage, true)
    },
    next: function () {
        this.animateTo(this.constrainPage(this.activePage + 1))
    },
    prev: function () {
        this.animateTo(this.constrainPage(this.activePage - 1))
    },
    constrainPage: function (a) {
        return Math.max(0, Math.min(this.pages.length - 1, a))
    }
};
Main = function () {
    if ($("#mobile").is(":visible")) {
        return
    }
    window.app.lang = $("html").attr("lang");
    this.init();
    this.addHdImages()
};
Main.prototype = {
    init: function () {
        // new PageChartView($("#page-more-more-and-more"), $("#page-more-more-and-more div.canvas div"), MoreMoreAndMoreData, "Crops", 200);
        // new PageConnectionsView($("#page-new-interdependencies"), $("#page-new-interdependencies div.canvas div"), NewDependenciesData, "%s: $%sbn");
        // new PageConnectionsView($("#page-policy-matters"), $("#page-policy-matters div.canvas div"), PolicyMattersData, "%s: %s million metric tons");
        // new PageChartView($("#page-major-producers"), $("#page-major-producers div.canvas div"), MajorProducersData, "Crops", 200);
        // new PageChartView($("#page-emerging-producers"), $("#page-emerging-producers div.canvas div"), EmergingProducersData, "Crops", 300, "+");
        // new PageChartView($("#page-emerging-consumers"), $("#page-emerging-consumers div.canvas div"), EmergingConsumersData, "Crops", 300, "+");
        // new PageHotspotsView($("#page-flashpoints"), $("#page-flashpoints div.canvas div"), FlashpointsData, "Water Scarcity");
        // new PageHotspotsView($("#page-instabilities"), $("#page-instabilities div.canvas div"), InstabilitiesData, "Conflict");
        window.app.scroller = new Scroller($("#pages"));
        new NavView($("#nav"), $("#pages"));
        new UpDownButtonView($("#next-button"), "DOWN");
        new UpDownButtonView($("#prev-button"), "UP");
        new Router($("#pages"))
    },
    addHdImages: function () {
        if (window.devicePixelRatio === undefined || window.devicePixelRatio <= 1) {
            return
        }
        $("img").each(function () {
            var a = $(this).attr("data-hd");
            if (a) {
                $(this).prop("src", a)
            }
        })
    }
};
$(window).load(function () {
    window.app = {};
    new Main()
});
Router = function (a) {
    a.on("enter.scroller", $.proxy(this, "update"));
    this.init()
};
Router.prototype = {
    init: function () {
        var b, a;
        if (window.navigator.standalone) {
            window.app.scroller.jumpTo(0);
            return
        }
        b = window.location.hash.substring(3);
        a = $("#page-" + b).index();
        if (a < 1) {
            window.app.scroller.jumpTo(0)
        } else {
            window.setTimeout(function () {
                window.app.scroller.jumpTo(a)
            }, 800)
        }
    },
    update: function (a) {
        var b;
        b = a.target.id.replace("page-", "");
        window.location.hash = "!/" + b
    }
};
NavView = function (a, b) {
    this.$el = a;
    this.$pages = b;
    this.$tooltip = null;
    this.$el.on("click", "button", $.proxy(this, "click"));
    if (!Modernizr.hasEvent("touchstart")) {
        this.$el.on("mouseover mouseout", "button", $.proxy(this, "hover"))
    }
    b.on("enter.scroller", $.proxy(this, "update"));
    this.render()
};
NavView.prototype = {
    render: function () {
        var d, a, c, b;
        d = "";
        a = this.$pages.children();
        for (c = 0; c < a.length; c++) {
            b = $(a[c]);
            d += '<li class="nav-item"><button data-id="' + b.attr("id") + '" data-reversed="' + (b.hasClass("blue") ? "true" : "false") + '"><i></i><span>' + b.find("h2:first").text() + "</span></button></li>"
        }
        this.$el.html("<ul>" + d + "</ul>");
        this.renderTooltip()
    },
    renderTooltip: function () {
        var a;
        a = '<div class="nav-tooltip"><p></p></div>';
        this.$tooltip = $(a).appendTo("body")
    },
    click: function (a) {
        var c, b;
        c = $(a.currentTarget).data("id");
        b = this.$pages.find("#" + c).index();
        window.app.scroller.animateTo(b);
        this.$tooltip.addClass("is-hidden")
    },
    update: function (b) {
        var d, a, c;
        d = b.target.id;
        a = this.$el.find('button[data-id="' + d + '"]');
        this.$el.find("button.is-active").removeClass("is-active");
        a.addClass("is-active");
        c = a.data("reversed");
        this.$el.toggleClass("nav-reversed", c);
        this.$tooltip.toggleClass("nav-tooltip-reversed", c)
    },
    hover: function (b) {
        var a, c;
        if (!b) {
            return
        }
        if (b.type === "mouseover" && b.target.nodeName.toLowerCase() === "i") {
            a = $(b.currentTarget);
            c = a.offset();
            c.top += a.height() / 2;
            this.$tooltip.find("p").text(a.find("span").text());
            this.$tooltip.css(c).removeClass("is-hidden")
        }
        if (b.type === "mouseout" && b.relatedTarget.nodeName.toLowerCase() !== "i") {
            this.$tooltip.addClass("is-hidden")
        }
    }
};
UpDownButtonView = function (e, g) {
    var b = this;
    var f = e;
    var d = g;
    var h = function () {
        f.click(b.click);
        $(".pages .page:last").on("exit.scroller", a);
        $(".pages .page:last").on("enter.scroller", c);


    };
    b.click = function () {
        if (d == "UP") {
            window.app.scroller.prev()
            }
            else {
            window.app.scroller.next()
        }
    };
    var a = function (j) {
        f.toggleClass("is-hiddenprev")
    };
    var c = function () {
        f.toggleClass("is-hiddennext")
    };
    h()
};
