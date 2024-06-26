(function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++)s(r[o]); return s })({
    1: [function (require, module, exports) {
        'use strict';




        var $ = require('jquery'),
            WebFont = require('webfontloader'),
            MinimalClass = require('./MinimalClass'),
            ContentFix = require('./ContentFix'),
            ScrollActionSimple = require('./ScrollActionSimple'),
            PopupRequestForm = require('../public/PopupRequestForm'),
            PopupEmailForm = require('../public/PopupEmailForm'),
            PopupPolicy = require('../public/PopupPolicy'),
            MainMenu = require('../public/MainMenu'),
            IndexFooter = require('../public/IndexFooter'),
            BarkliLoader = require('../public/BarkliLoader'),
            BarkliIndexLoader = require('../public/BarkliIndexLoader'),
            Weborama = require('../public/Weborama');

        require('smoothscroll-polyfill').polyfill();

        module.exports = MinimalClass.extend({
            __className: 'App',
            _resizable: [],
            _scrollable: [],
            pre: function () {
                this.lang = $('html').attr('lang');
                this.fonts_loaded = false;
                this.inited = false;
            },
            create: function () {
                var self = this;

                window.app = this;
                this.update_window_size();

                this.weborama = new Weborama();

                this.ww = 0;
                this.wh = 0;
                this.page_height = 0;
                this.scrollTop = 0;
                this.previousScrollTop = 0;
                this.scrollDir = true;

                WebFont.load({
                    custom: {
                        families: ['History', 'Open Sans']
                    },
                    active: function () {
                        self.fonts_loaded = true;
                        self.resize();
                    }
                });

                this.cfix = new ContentFix();
                this.sas = new ScrollActionSimple();

                $(window).resize(function (e) {
                    self.resize(e);
                });
                $(window).scroll(function (e) {
                    self.scroll(e);
                });

                $(document).ready(function (e) {
                    self.resize(e);
                    self.scroll(e);
                });

                if (!window.md.phone() && !window.md.tablet()) {
                    $(document.body).addClass('is-desktop');
                }

                this.resize();
                this.scroll();

                this.setup_loader();

                setTimeout(function () {
                    self.setup();
                }, 10);
            },
            setup_loader: function () {
                var self = this;
                var onLoaderLoaded = function () {
                    $(document.body).removeClass('loading').addClass('loaded');
                },
                    onLoaderFullyLoaded = function () {
                        self.cfix.setFixedContent(false);
                    };

                var loader = $('.js-barkli-index-loader');
                if (loader.length) {
                    this.loader = new BarkliIndexLoader({ element: loader, delegate: this, _onLoad: onLoaderLoaded, _onFullyLoad: onLoaderFullyLoaded });
                } else {
                    loader = $('.js-barkli-loader');
                    if (loader.length) {
                        this.loader = new BarkliLoader({ element: loader, delegate: this, _onLoad: onLoaderLoaded, _onFullyLoad: onLoaderFullyLoaded });
                    } else {
                        this.loader = false;
                        onLoaderLoaded();
                        onLoaderFullyLoaded();
                    }
                }

                if (this.loader) {
                    window.scrollTo(0, 0);
                    this.cfix.setFixedContent(true);
                }
            },
            setup: function () {
                var self = this,
                    main_menu = document.getElementById('main-menu');

                this.main_menu = main_menu ? new MainMenu({ element: main_menu, delegate: self }) : false;

                $('.js-popup-request-form').each(function (i, elm) {
                    self.popup_request_form = new PopupRequestForm({ element: elm, delegate: self });
                });

                $('.js-popup-email-form').each(function (i, elm) {
                    self.popup_email_form = new PopupEmailForm({ element: elm, delegate: self });
                });

                $('.js-popup-policy-trigger').each(function (i, elm) {
                    self.popup_policy_form = new PopupPolicy({ element: elm, delegate: self });
                });

                $('.js-index-footer').each(function (i, elm) {
                    self.index_footer = new IndexFooter({ element: elm, delegate: self });
                });

                if (this.loader) {
                    this.loader.load();
                }
            },
            add_resize: function (instance) {
                for (var i = 0; i < this._resizable.length; i++) {
                    if (this._resizable[i] == instance) {
                        return;
                    }
                }

                this._resizable.push(instance);
                if (this.ww && this.wh) {
                    instance.resize(this.ww, this.wh);
                }
            },
            remove_resize: function (instance) {
                var newResizable = [],
                    found = false;
                for (var i = 0; i < this._resizable.length; i++) {
                    if (this._resizable[i] == instance) {
                        found = true;
                    } else {
                        newResizable.push(instance);
                    }
                }
                if (found) {
                    this._resizable = newResizable;
                }
            },
            add_scroll: function (instance) {
                for (var i = 0; i < this._scrollable.length; i++) {
                    if (this._scrollable[i] == instance) {
                        return;
                    }
                }

                this._scrollable.push(instance);
                instance.scroll(this.scrollTop);
            },
            remove_scroll: function (instance) {
                var newScrollable = [],
                    found = false;
                for (var i = 0; i < this._scrollable.length; i++) {
                    if (this._scrollable[i] == instance) {
                        found = true;
                    } else {
                        newScrollable.push(instance);
                    }
                }
                if (found) {
                    this._scrollable = newScrollable;
                }
            },
            update_window_size: function () {
                this.ww = $(window).width();
                this.wh = $(window).height();
            },
            resize: function () {
                this.update_window_size();

                for (var i = 0; i < this._resizable.length; i++) {
                    this._resizable[i].resize(this.ww, this.wh);
                }

                this.update_page_height(true);
            },
            update_page_height: function (auto) {
                this.page_height = $('#content').outerHeight(true);
                if (!auto && this.index_footer) {
                    this.index_footer.resize(this.ww, this.wh);
                    this.index_footer.scroll(this.scrollTop);
                }
            },
            scroll: function () {
                this.scrollTop = $(window).scrollTop();
                this.scrollDir = this.scrollTop > this.previousScrollTop;
                this.previousScrollTop = this.scrollTop;
                for (var i = 0; i < this._scrollable.length; i++) {
                    this._scrollable[i].scroll(this.scrollTop, this.scrollDir);
                }
            }
        });

    }, { "../public/BarkliIndexLoader": 17, "../public/BarkliLoader": 18, "../public/IndexFooter": 29, "../public/MainMenu": 33, "../public/PopupEmailForm": 35, "../public/PopupPolicy": 36, "../public/PopupRequestForm": 37, "../public/Weborama": 45, "./ContentFix": 2, "./MinimalClass": 11, "./ScrollActionSimple": 12, "jquery": 52, "smoothscroll-polyfill": 53, "webfontloader": 54 }], 2: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            Class = require('class.extend');

        module.exports = Class.extend({
            __className: 'ContentFix',
            contentFixed: false,
            contentFixedAt: 0,
            init: function () {
                var self = this;

                this.screen = $('#screen');
                this.content = this.screen.find('#content');

                window.setFixedContent = function (dir) {
                    return self.setFixedContent(dir);
                };
            },
            setFixedContent: function (dir) {
                if (this.contentFixed == dir) return false;

                if (dir) {
                    this.contentFixedAt = $(window).scrollTop();
                    this.screen.addClass('contentFixed');
                    this.content.css({ top: -this.contentFixedAt });
                    window.contentFixed = this.contentFixed = true;
                    window.scrollTo(0, 0);
                } else {
                    this.screen.removeClass('contentFixed');
                    this.content.css({ top: 'auto' });
                    window.scrollTo(0, this.contentFixedAt);
                    window.contentFixed = this.contentFixed = false;
                    this.contentFixedAt = 0;
                }

                $(window).trigger('contentFixed', [this.contentFixed]);

                return true;
            }
        });

    }, { "class.extend": 50, "jquery": 52 }], 3: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceValidable = require('./ForceValidable');

        module.exports = ForceValidable.extend({
            __className: 'ForceCheckbox',
            create: function () {
                var self = this,
                    inputs = this.element.find('input[type=checkbox]');

                inputs.attr('data-evt', 1);

                this.inp = inputs[0];
                this.name = this.inp.name;
                this.css_target = this.element;
                this.validator = this.get_validator(this.inp);

                $(this.inp).change(function () {
                    self.value = this.checked ? this.value : '';
                    self.validate('change');
                });
            },
            reset: function () {
                this.value = 0;
                this.inp.checked = false;
                this.element.removeClass('full success');
                this.validate('init');
            }
        });

    }, { "./ForceValidable": 9, "jquery": 52 }], 4: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceValidable = require('./ForceValidable');

        module.exports = ForceValidable.extend({
            __className: 'ForceField',
            create: function () {
                var self = this;

                this.inp = this.element[0];
                this.name = this.inp.name;
                this.value = this.element.val();
                this.label = this.element.parent();
                this.is_phone = this.inp.name === 'phone' || this.inp.type === 'tel';
                this.focused = false;
                this.is_valid = false;
                this.css_target = this.label;

                this.placeholder = this.label.find('.placeholder');
                this.placeholder.click(function (e) {
                    self.element.trigger('focus');
                });

                this.validator = this.get_validator(this.inp);

                if (this.inp.value.length > 0) {
                    this.label.addClass('focused');
                    this.label.addClass('full');
                }

                this.element.bind('change keyup keydown focus blur', function (e) {
                    self.handle(e);
                });
                this.element.attr('data-evt', 1);

                this.autofocused = true;
                this.autofocus_interval = false;
                if (this.inp.name == 'login' || this.inp.type == 'password') {
                    this.autofocused = false;
                    this.autofocus_interval = setInterval(function () {
                        if (self.inp.value.length > 0) {
                            self.handle({ type: 'focus', keyCode: 0, shiftKey: false, ctrlKey: false });
                            self.autofocused = true;
                            clearInterval(self.autofocus_interval);
                            self.autofocus_interval = null;
                        }
                    }, 1000);
                }
            },
            reset: function () {
                if (this.inp.type === 'hidden') {
                    return;
                }

                this.value = this.inp.value = '';
                this.label.removeClass('full success');
                this.focus(false);
                this.validate('init');
            },
            focus: function (dir) {
                if (dir !== this.focused) {
                    (this.focused = dir) ? this.label.addClass('focused') : this.label.removeClass('focused');
                }
            },
            handle: function (event) {
                var type = event.type,
                    should_focus = this.inp === document.activeElement || type === 'focus' || this.inp.value.length > 0;

                if (type === 'blur' && this.is_phone && this.inp.value.length < 2) {
                    this.label.removeClass('focus');
                    return this.reset();
                }
                if (type === 'focus') {
                    this.label.addClass('focus');
                }
                if (type === 'change' || type === 'keydown' || type === 'keyup') {
                    if (this.inp.value.length > 0) {
                        this.label.addClass('full');
                    } else {
                        this.label.removeClass('full');
                    }
                }
                if (type === 'blur') {
                    this.label.removeClass('focus');
                    if (this.inp.value.length < 1) {
                        this.label.removeClass('full');
                    }
                }
                this.validate(type, event);

                var is_empty = !this.inp.value.length;

                if (!this.focused && type !== 'focus' && is_empty) {
                    should_focus = false;
                }

                this.focus(should_focus);

                if (!this.is_valid && (type === 'keydown' || is_empty)) {
                    this.label.removeClass('has-error');
                }

                this.value = this.inp.value;
            }
        });

    }, { "./ForceValidable": 9, "jquery": 52 }], 5: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('./MinimalClass'),
            ForceField = require('./ForceField'),
            ForceSelect = require('./ForceSelect'),
            ForceRadio = require('./ForceRadio'),
            ForceCheckbox = require('./ForceCheckbox');

        module.exports = MinimalClass.extend({
            __className: 'ForceForm',
            _enableComagic: true,
            create: function () {
                var self = this;

                this.submit_button = false;
                this.mode = this.element.attr('data-mode');

                if (this.element[0].tagName === 'FORM') {
                    this.form = this.element;
                } else {
                    this.form = this.element.find('form');
                }

                this.fields = [];
                this.is_ajax = true;
                this.ajax_busy = false;

                this.is_valid = false;
                this.valid_fields = [];
                this.invalid_fields = [];
                this._validation_skip_fields = [];

                this.form.submit(function (e) {
                    if (self.is_ajax) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    self.submit(e);
                });

                this._create();

                this.setup_fields();

                this.validate('init');
                this.field_validity_changed();
            },
            _create: function () { },
            setup_fields: function () {
                var self = this;

                this.element.find('.js-select').each(function (i, elm) {
                    var select = new ForceSelect({ element: elm, delegate: self });
                    if (select.name) {
                        self.fields[select.name] = select;
                    }
                });

                this.element.find('.js-radio').each(function (i, elm) {
                    var radio = new ForceRadio({ element: elm, delegate: self });
                    if (radio.name) {
                        self.fields[radio.name] = radio;
                    }
                });

                this.element.find('.js-checkbox').each(function (i, elm) {
                    var checkbox = new ForceCheckbox({ element: elm, delegate: self });
                    if (checkbox.name) {
                        self.fields[checkbox.name] = checkbox;
                    }
                });

                this.element.find('input, textarea').each(function (i, inp) {
                    if (inp.type === 'checkbox' || inp.type === 'radio' || inp.type === 'submit' || !inp.name.length || parseInt(inp.getAttribute('data-evt') || 0)) {
                        return;
                    }
                    self.fields[inp.name] = new ForceField({ element: inp, delegate: self });
                });
            },
            get_url: function () {
                return this.url || this.form.attr('action');
            },
            get_method: function () {
                return this.method || this.form.attr('method');
            },
            gather_data: function () {
                var data = {},
                    form = this.form[0];

                for (var k in this.fields) {
                    data[this.fields[k].name] = this.fields[k].value;
                }

                if (typeof random_value !== 'undefined') {
                    data.random_value = random_value;
                }

                if (typeof form['agree'] !== 'undefined') {
                    data.agree = form['agree'].checked ? 1 : 0;
                }

                return this._gather_data(data);
            },
            _gather_data: function (data) {
                return data;
            },
            validation_skip_fields: function (fields) {
                this._validation_skip_fields = fields ? fields : [];
            },
            field_validity_changed: function (field) {
                this.validate('revalidate');

                this.form.attr('data-valid', this.is_valid ? 1 : 0);
                this.is_valid ? this.form.removeClass('invalid-form') : this.form.addClass('invalid-form');
            },
            count_valid_fields: function (fields, target) {
                var left = fields.length;
                for (var k in fields) {
                    if (this.in_array(fields[k], this.valid_fields)) {
                        left--;
                    }
                }

                target.html(left);
            },
            validate: function (type) {
                if (typeof type === 'undefined') {
                    type = 'check';
                }
                var total = 0,
                    valid = 0,
                    is_valid,
                    valid_field;
                this.invalid_fields = [];
                this.valid_fields = [];
                for (var k in this.fields) {
                    if (this.in_array(k, this._validation_skip_fields)) {
                        continue;
                    }

                    valid_field = this.fields[k].validate(type);
                    if (valid_field) {
                        valid++;
                        this.valid_fields.push(k);
                    } else {
                        this.invalid_fields.push(k);
                    }

                    total++;
                }

                is_valid = valid >= total;
                this.is_valid = this._validate(is_valid, type);
                return this.is_valid;
            },
            _validate: function (is_valid, type) {
                return is_valid;
            },
            reset: function () {
                for (var k in this.fields) {
                    if (typeof this.fields[k].reset !== 'function') {
                        this.log_error('Field ' + k + ' has no reset() function.');
                        continue;
                    }
                    this.fields[k].reset();
                }
                this._reset();
            },
            _reset: function () { },
            submit: function (e) {
                if (!this.validate('check')) {
                    this.log('Invalid data');
                    return false;
                }

                return this.ajax();
            },
            ajax: function (cb) {
                if (this.ajax_busy || this.submit_button && this.submit_button.busy) {
                    return false;
                }

                var data = this.gather_data();

                if (!data) {
                    return false;
                }

                this.ajax_busy = true;

                $.ajax({
                    url: this.get_url(),
                    type: this.get_method(),
                    dataType: 'json',
                    data: data,
                    context: this,
                    beforeSend: function () {
                        this.on_send(data);
                    }
                }).done(function (resp) {
                    if (resp.error) {
                        this.on_error(resp);
                        return;
                    }

                    this.on_success(resp);

                    var comagic_data = {};

                    if (data.name) {
                        comagic_data.name = data.name;
                    }
                    if (data.email) {
                        comagic_data.email = data.email;
                    }
                    if (data.phone) {
                        comagic_data.phone = data.phone;
                    }
                    if (data.message) {
                        comagic_data.message = data.message;
                    }

                    if (this._enableComagic) {
                        try {
                            if (typeof window.Comagic !== 'undefined' && typeof window.Comagic.addOfflineRequest === 'function') {
                                this.log('Comagic: ', comagic_data);
                                window.Comagic.addOfflineRequest(comagic_data);
                            }
                        } catch (e) {
                            this.log(e);
                        }
                    }

                    if (typeof cb === 'function') {
                        cb(resp, this);
                    }
                }).fail(function () {
                    this.on_fail();
                }).always(function () {
                    this.ajax_busy = false;
                    this.on_complete();
                });

                return true;
            },
            on_send: function (data) { },
            on_error: function (resp) {
                alert(resp.message);
            },
            on_fail: function () {
                this.log(this.fail_message);
            },
            on_success: function (data) { },
            on_complete: function () { }
        });

    }, { "./ForceCheckbox": 3, "./ForceField": 4, "./ForceRadio": 7, "./ForceSelect": 8, "./MinimalClass": 11, "jquery": 52 }], 6: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('./MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'ForceLoader',
            pre: function () {
                this.stuck_timer_time = 5;
            },
            create: function () {
                var self = this;

                this.images = [];
                this.videos = [];
                this.loaded = false;

                if (!this.source || !this.source.length) {
                    this.source = $(document.body);
                }

                this.loaded_items = 0;
                this.total_items = 0;
                this.progress = 0;

                this.stuck_timer = false;

                this.LZ = $('#LZ');
                if (!this.LZ.length) {
                    this.LZ = $('<div></div>', { id: 'LZ' }).addClass('LZ').appendTo(document.body);
                }

                this.gather_items();
            },
            add_item: function () {
                this.total_items++;
            },
            load: function () {
                this.preload_items();
            },
            gather_items: function () {
                this.gather_images();
                this.gather_videos();
            },
            gather_images: function () {
                var self = this;
                var everything = this.source.find("*:not(script,video,source)").each(function (i, elm) {
                    var url = "";

                    if ($(this).css("background-image") != "none") {
                        url = $(this).css("background-image");
                    } else if (typeof $(this).attr("src") != "undefined") {
                        url = $(this).attr("src");
                    }

                    url = url.replace("url(\"", "");
                    url = url.replace("url(", "");
                    url = url.replace("\")", "");
                    url = url.replace(")", "");

                    if (url.length > 0 && /(gif|jpeg|jpg|png)$/.test(url)) {
                        self.images.push(url);
                    }
                });
            },
            gather_videos: function () {
                var self = this;
                this.source.find('video').each(function (i, elm) {
                    var poster = elm.getAttribute('poster') || false;
                    if (poster && poster.length > 0 && /(gif|jpeg|jpg|png)$/.test(poster)) {
                        self.images.push(poster);
                    }

                    if (typeof elm.getAttribute('preload') != 'undefined') {
                        self.videos.push(elm);
                    }
                });
            },
            preload_items: function () {
                var self = this;
                this.total_items = this.images.length + this.videos.length;

                if (!this.total_items) {
                    this.update_progress();
                    return;
                }

                this.preload_videos();
                this.preload_images();
            },
            refresh_stuck_timer: function () {
                if (this.stuck_timer) {
                    clearTimeout(this.stuck_timer);
                    this.stuck_timer = null;
                }

                if (this.loaded_items >= this.total_items) {
                    return;
                }

                var self = this;
                this.stuck_timer = setTimeout(function () {
                    self.loaded_items++;
                    self.update_progress();
                }, this.stuck_timer_time * 10);
            },
            preload_images: function () {
                var self = this,
                    count = this.images.length;

                for (var i = 0; i < count; i++) {
                    var img = $("<img></img>");
                    $(img).attr("src", this.images[i]);
                    $(img).unbind("load");
                    $(img).bind("load error", function () {
                        self.image_loaded();
                    });
                    $(img).appendTo(this.LZ);
                }
            },
            preload_videos: function () {
                var self = this;
                $(this.videos).each(function (i, elm) {
                    $(elm).bind('loadedmetadata', function () {
                        self.video_loaded();
                    });
                });
            },
            image_loaded: function () {
                this.loaded_items++;
                this.update_progress();
            },
            video_loaded: function () {
                this.loaded_items++;
                this.update_progress();
            },
            update_progress: function () {
                this.refresh_stuck_timer();
                if (this.loaded) {
                    return;
                }
                this.progress = this.total_items ? Math.round(this.loaded_items / this.total_items * 100) : 100;
                if (this.progress >= 100) {
                    this.loaded = true;
                    this.loading_complete();
                } else {
                    $(window).trigger('onLoaderProgress', [this, this.progress]);
                }
            },
            loading_complete: function () {
                clearTimeout(this.timeout);
                this.timeout = false;

                if (typeof this.onLoad === 'function') this.onLoad(this);
                this.after_loading_complete();
            },
            after_loading_complete: function () {
                this.loader_fully_complete();
            },
            loader_fully_complete: function () {
                if (typeof this.onFullyLoad === 'function') this.onFullyLoad(this);
                $(window).trigger('onLoaderLoaded', [this]);
            },
            remove: function () {
                this.element.remove();
            }
        });

    }, { "./MinimalClass": 11, "jquery": 52 }], 7: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceValidable = require('./ForceValidable');

        module.exports = ForceValidable.extend({
            __className: 'ForceRadio',
            create: function () {
                var self = this;
                this.name = false;
                this.inp = this;
                this.value = 0;
                this.css_target = this.element;
                this.element.find('input[type=radio]').each(function (i, elm) {
                    if (elm.checked) {
                        self.value = elm.value;
                    }

                    if (!self.name) {
                        self.name = elm.name;
                    }

                    $(elm).change(function (e) {
                        self.value = this.value;
                        self.validate('change');
                    });

                    $(elm).attr('data-evt', 1);
                });
            }
        });

    }, { "./ForceValidable": 9, "jquery": 52 }], 8: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceValidable = require('./ForceValidable');

        module.exports = ForceValidable.extend({
            __className: 'ForceSelect',
            create: function () {
                var self = this,
                    input = this.element.find('input[type=hidden]');

                if (!input.length) {
                    this.name = this.inp = this.input = false;
                } else {
                    this.inp = input[0];
                    this.input = $(this.inp);
                    this.name = this.inp.name;
                    this.validator = this.get_validator(this.inp);
                    this.css_target = this.element;
                    this.input.attr('data-evt', 1);
                }

                this.selected = this.element.find('div.select-val');
                this.selected_span = this.selected.find('span');
                this.options = this.element.find('ul.select-list');

                this.value = this.selected.attr('data-value') || '';
                this.selected_item = false;
                this.mouseover = false;
                this.opened = false;

                if (this.int) {
                    this.value = parseInt(this.value);
                }

                this.items = [];

                this.options.find('li').each(function (i, elm) {
                    var obj = $(elm),
                        item = {
                            obj: $(elm),
                            value: obj.attr('data-value') || '',
                            text: obj.text(),
                            active: false,
                            activate: function (dir) {
                                if (this.active === dir) {
                                    return;
                                }
                                if (dir) {
                                    this.obj.css({ display: 'none' });
                                } else {
                                    this.obj.css({ display: 'block' });
                                }
                                this.active = dir;
                                return this;
                            }
                        };

                    if (self.int) {
                        item.value = parseInt(item.value);
                    }

                    if (self.value === item.value) {
                        self.selected_item = item.activate(true);
                    }

                    self.items.push(item);

                    item.obj.click(function (e) {
                        self.pick(i, true);
                    });
                });

                this.element.bind('mouseenter mouseleave', function (e) {
                    self.mouseover = e.type === 'mouseenter';
                });

                this.element.click(function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.toggle();
                });

                $(window).click(function (e) {
                    if (!self.mouseover && self.opened) {
                        self.toggle(false);
                    }
                });
            },
            toggle: function (dir) {

                if (typeof dir === 'undefined') {
                    dir = !this.opened;
                } else if (dir === this.opened) {
                    return;
                }

                var self = this;
                if (dir) {
                    $('.js-select.open').removeClass('open').find('ul').slideUp();
                    this.element.addClass('open');
                    this.options.slideDown();
                } else {
                    this.options.slideUp();
                    setTimeout(function () {
                        self.element.removeClass('open');
                    }, 300);
                }

                this.opened = dir;
            },
            pick: function (i, from_user) {
                var item = this.items[i];

                if (item.value === this.value) {
                    return;
                }

                var previous_value = this.value;

                this.selected_span.empty().text(item.text);
                this.selected.attr('data-value', item.value);
                if (this.input) {
                    this.input.val(item.value);
                }
                this.value = item.value;

                this.value ? this.element.addClass('valued') : this.element.removeClass('valued');

                this.validate('change');

                if (this.selected_item) {
                    this.selected_item.activate(false);
                }
                this.selected_item = item.activate(true);

                if (from_user && typeof this.onChange === 'function') {
                    this.onChange(this, previous_value);
                }
            },
            set_value: function (value) {
                if (this.int) {
                    value = parseInt(value);
                }
                for (var i = 0; i < this.items.length; i++) {
                    if (this.items[i].value === value.toString()) {
                        this.pick(i);
                    }
                }
            }
        });

    }, { "./ForceValidable": 9, "jquery": 52 }], 9: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('./MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'ForceValidable',
            pre: function () {
                this.name = false;
                this.value = false;
                this.css_target = false;
                this.validator = false;
                this.is_valid = false;
            },
            get_validator: function (elm) {
                var validator = $(elm).attr('data-validator');
                if (validator && typeof this.validators[validator] !== 'undefined') {
                    return this.validators[validator];
                } else {
                    return false;
                }
            },
            validate: function (type, event) {
                if (typeof this.validator !== 'function') {
                    this.is_valid = true;
                    return this.is_valid;
                }

                if (typeof type === 'undefined') {
                    type = 'check';
                }

                var is_valid = this.validator.apply(this, [this.inp, type, event]);

                if (this.css_target && type !== 'revalidate') {
                    if (is_valid) {
                        this.css_target.removeClass('has-error');
                        this.css_target.addClass('success');
                    } else if (type === 'change' || type === 'check') {
                        this.css_target.removeClass('success');
                        this.css_target.addClass('has-error');
                    } else {
                        this.css_target.removeClass('success');
                    }
                }

                this.element.attr('data-valid', is_valid ? 1 : 0);

                var validity_changed = this.is_valid !== is_valid;
                this.is_valid = is_valid;

                if (validity_changed) {
                    if (typeof this.delegate !== 'undefined' && typeof this.delegate.field_validity_changed === 'function') {
                        this.delegate.field_validity_changed(this);
                    }
                }

                return this.is_valid;
            },
            validators: {
                control_key_code: function (keyCode) {
                    return keyCode >= 35 && keyCode <= 40 || keyCode >= 16 && keyCode <= 18 || keyCode == 13 || keyCode == 27 || keyCode == 46 || keyCode == 9 || keyCode == 8;
                },
                num_key_code: function (keyCode, with_control) {
                    return keyCode >= 48 && keyCode <= 57 || with_control && this.control_key_code(keyCode);
                },
                no_numbers: function (t, e) {
                    if (t === 'keydown' && typeof e !== 'undefined') {
                        if (!e.shiftKey && this.num_key_code(e.keyCode, false)) {
                            e.preventDefault();
                        }
                    }
                },
                only_numbers: function (t, e) {
                    if (t === 'keydown' && typeof e !== 'undefined') {
                        if (e.shiftKey || !this.num_key_code(e.keyCode, true) && !e.ctrlKey) {
                            e.preventDefault();
                        }
                    }
                },
                phone: function (i, t, e) {
                    this.validators.only_numbers(t, e);

                    switch (t) {
                        case 'focus':
                            if (i.value.length === 0) {
                                i.value = '+';
                            }
                            break;
                        case 'blur':
                            if (i.value.length === 1) {
                                i.value = '';
                            }
                            break;
                        case 'keydown':
                        case 'keyup':
                            if (i.value !== '+' && !/^\+[0-9]*$/.test(i.value)) {
                                i.value = '+' + i.value.replace(/[^0-9]/g, '');
                            }
                            break;
                    }

                    this.value = i.value;
                    return i.value.length > 7;
                },
                nums: function (i, t, e) {
                    this.validators.only_numbers(t, e);

                    switch (t) {
                        case 'keydown':
                        case 'keyup':
                            if (i.value !== '+' && !/^[0-9]*$/.test(i.value)) {
                                i.value = i.value.replace(/[^0-9]/g, '');
                            }
                            break;
                    }

                    this.value = i.value;
                    return true;
                },
                name: function (i, t, e) {
                    this.validators.no_numbers(t, e);

                    switch (t) {
                        case 'keydown':
                        case 'keyup':
                            if (i.value !== '+' && !/[0-9]*$/.test(i.value)) {
                                i.value = i.value.replace(/[0-9]/g, '');
                            }
                            break;
                    }

                    this.value = i.value;
                    return i.value.length > 1;
                },
                street: function () {
                    this.value = i.value;
                    return i.value.length > 3;
                },
                title: function (i, t, e) {
                    return i.value.length >= 5;
                },
                empty: function (i, t, e) {
                    return typeof i.value !== 'undefined' && i.value.length > 0;
                },
                bik: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{9}$/.test(i.value)
                    );
                },
                inn: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{10,12}$/.test(i.value)
                    );
                },
                kpp: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{9}$/.test(i.value)
                    );
                },
                zipcode: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return i.value.length === 6;
                },
                ogrn: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{13}$/.test(i.value)
                    );
                },
                correspondent_account: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{20}$/.test(i.value)
                    );
                },
                checking_account: function (i, t, e) {
                    this.validators.only_numbers(t, e);
                    return (/^[\d]{20}$/.test(i.value)
                    );
                },
                password: function (i, t, e) {
                    return i.value.length >= 5;
                },
                message: function (i, t, e) {
                    return i.value.length > 0;
                },
                login: function (i, t, e) {
                    return i.value.length > 0;
                },
                email: function (i, t, e) {
                    var ret = /^[a-zA-Z0-9\.\-_]{1,}\@([a-zA-Z0-9\-_]{1,}\.){1,2}[a-zA-Z]{2,4}$/.test(i.value);
                    return ret ? i.value : false;
                },
                agree: function (i, t, e) {
                    return i.checked;
                }
            }
        });

    }, { "./MinimalClass": 11, "jquery": 52 }], 10: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'Loader',
            loaderSVG: '<svg class="circular" viewBox="0 0 50 50">' + '<circle cx="25" cy="25" r="20" stroke="#4B575C" stroke-width="1" opacity=".2" fill="none"/>' + '<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>' + '</svg>',
            loaderSVG_big: '<svg class="circular" viewBox="0 0 70 70">' + '<circle cx="35" cy="35" r="30" stroke="#4B575C" stroke-width="1" opacity=".2" fill="none"/>' + '<circle class="path" cx="35" cy="35" r="30" fill="none" stroke-width="2" stroke-miterlimit="10"/>' + '</svg>',
            create: function () {
                var self = this;
                this.element = $('<div>').addClass('loader');

                if (this.css) {
                    this.element.addClass(this.css);
                }

                if (this.big) {
                    this.element.addClass('big');
                }

                this.caption = this.text ? $('<div>').addClass('caption').html(this.text) : false;

                if (this.fixed) {
                    this.element.addClass('fixed');
                }

                if (this.target) {
                    this.appendTo(this.target);
                }
            },
            show: function () {
                this.element.addClass('show');
            },
            hide: function () {
                this.element.removeClass('show');
            },
            appendTo: function (target) {
                this.target = $(target);
                this.element.appendTo(this.target);
                this.element.html(this.big ? this.loaderSVG_big : this.loaderSVG);
                if (this.caption) this.element.append(this.caption);
            },
            remove: function () {
                this.element.remove();
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 11: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            bezierEasing = require('bezier-easing'),
            Class = require('class.extend');

        module.exports = Class.extend({
            __className: 'MinimalClass',
            __nativeMode: false,
            init: function (opt) {
                this.delegate = false;
                this.element = false;
                this.opt = {};
                this.pre(opt);
                if (typeof this._pre == 'function') {
                    this._pre(opt);
                }
                this.setOptions(opt);
                this.create();
            },
            create: function () { },
            pre: function (opt) { },
            _pre: null,
            log_buffer: [],
            log_log_buffer: function () {
                for (var i = 0; i < this.log_buffer.length; i++) {
                    window.console.log.apply(this, this.log_buffer[i]);
                }
                this.log_buffer = [];
                return 'End of log buffer.';
            },
            log: function () {
                if (typeof window.console !== 'undefined' && typeof window.console.log === 'function') {
                    window.console.log.apply(window.console, arguments);
                } else {
                    alert(arguments.join("\n"));
                }
            },
            setOptions: function (opt) {
                if (typeof opt === 'undefined') {
                    return;
                }
                for (var key in opt) {
                    this.setOption(key, opt[key]);
                }
            },
            setOption: function (key, val) {
                if (key === 'element') {
                    this.element = this.__nativeMode ? val : $(val);
                    return;
                } else if (key === 'delegate') {
                    this.delegate = val;
                    return;
                } else if (key.substr(0, 1) === '_') {
                    key = key.substr(1);
                    this[key] = val;
                    return;
                }

                this.opt[key] = val;
            },
            mouseWheelLocked: false,
            onMouseWheelLock: function (e) {
                e.preventDefault();
            },
            toggleMouseWheelLock: function (dir) {
                if (dir !== this.mouseWheelLocked) {
                    dir ? $(document).bind('mousewheel', this.onMouseWheelLock) : $(document).unbind('mousewheel', this.onMouseWheelLock);
                    this.mouseWheelLocked = dir;
                }
                return this.mouseWheelLocked;
            },
            in_array: function (needle, haystack) {
                var length = haystack.length;
                for (var i = 0; i < length; i++) {
                    if (haystack[i] == needle) {
                        return true;
                    }
                }
                return false;
            },
            is_touch_device: function () {
                return 'ontouchstart' in window // works on most browsers 
                    || window.navigator.maxTouchPoints; // works on IE10/11 and Surface
            },
            setCaretPosition: function (elem, caretPos) {
                if (elem != null) {
                    if (elem.createTextRange) {
                        var range = elem.createTextRange();
                        range.move('character', caretPos);
                        range.select();
                    } else {
                        if (elem.selectionStart) {
                            elem.focus();
                            elem.setSelectionRange(caretPos, caretPos);
                        } else elem.focus();
                    }
                }
            },
            transitionEndEventName: function () {
                var i,
                    undefined,
                    el = document.createElement('div'),
                    eventNames = {
                        'transition': 'transitionend',
                        'OTransition': 'otransitionend',
                        'MozTransition': 'transitionend',
                        'WebkitTransition': 'webkitTransitionEnd',
                        'msTransition': 'MSTransitionEnd'
                    };

                for (i in eventNames) {
                    if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
                        return eventNames[i];
                    }
                }
            },
            animationEndEventName: function () {
                var i,
                    undefined,
                    el = document.createElement('div'),
                    eventNames = {
                        'animation': 'animationend',
                        'OAnimation': 'oAnimationEnd',
                        'WebkitAnimation': 'webkitAnimationEnd',
                        'MozAnimation': 'mozAnimationRnd',
                        'msAnimation': 'MSAnimationEnd'
                    };

                for (i in eventNames) {
                    if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
                        return eventNames[i];
                    }
                }
            },
            xlink: function (xlink, className) {
                var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.innerHTML = '<use xlink:href="#' + xlink + '"></use>';
                if (className) svg.setAttribute('class', className);
                return svg;
            },
            calculate_animated_value: function (current, target, speed) {
                var dir = target > current,
                    diff = dir ? target - current : current - target,
                    step = (dir ? 1 : -1) * Math.max(0.001, diff / speed),
                    value = dir ? Math.min(target, current + step) : Math.max(target, current + step);
                return value;
            },
            lz: function (obj) {
                var lz = document.getElementById('LZ');
                if (!lz) {
                    lz = document.createElement('DIV');
                    lz.id = 'LZ'; lz.className = 'LZ';
                    document.body.appendChild(lz);
                }
                lz.appendChild(obj);
            },
            preload_image: function (url, cb) {
                var image = new Image();
                image.src = url;
                image.onload = function () {
                    if (typeof cb === 'function') {
                        cb(image);
                    }
                };
                this.lz(image);
            },
            fullscreen: function (needState) {
                var isInFullScreen = document.fullscreenElement && document.fullscreenElement !== null || document.webkitFullscreenElement && document.webkitFullscreenElement !== null || document.mozFullScreenElement && document.mozFullScreenElement !== null || document.msFullscreenElement && document.msFullscreenElement !== null;

                var docElm = document.documentElement;

                isInFullScreen = isInFullScreen || false;

                if (isInFullScreen == needState) {
                    return false;
                }

                if (!isInFullScreen) {
                    if (docElm.requestFullscreen) {
                        docElm.requestFullscreen();
                    } else if (docElm.mozRequestFullScreen) {
                        docElm.mozRequestFullScreen();
                    } else if (docElm.webkitRequestFullScreen) {
                        docElm.webkitRequestFullScreen();
                    } else if (docElm.msRequestFullscreen) {
                        docElm.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }

                return true;
            },
            calc_element_scroll_prc: function (element) {
                if (typeof element === 'undefined' || typeof element.getBoundingClientRect !== 'function') return 0;

                var rect = element.getBoundingClientRect();
                var prc = 0,
                    total = window.innerHeight + rect.height;

                if (rect.top > window.innerHeight) prc = 0; else if (rect.top < -rect.height) prc = 1; else prc = 1 - (rect.top + rect.height) / total;

                return prc;
            },
            animate: function (speed, easing, callback) {
                var startTime = Date.now(),
                    ease = bezierEasing(easing[0], easing[1], easing[2], easing[3]),
                    raf;

                (function loop() {
                    var now = Date.now(),
                        diff = now - startTime,
                        percent = diff / speed;

                    if (percent > 1) {
                        callback(1);
                        cancelAnimationFrame(raf);
                    } else {
                        callback(ease(percent));
                        raf = requestAnimationFrame(loop.bind(this));
                    }
                })();
            },
            measure_distance: function (a, b) {
                var distance;
                if (a >= 0 && b >= 0 || a <= 0 && b <= 0) {
                    distance = a < b ? a - b : b - a;
                } else {
                    distance = (Math.abs(b) + Math.abs(a)) * (b < 0 ? -1 : 0);
                }
                return distance;
            },
            setTouchEvent: function (touchOptions) {
                var touchSurface = touchOptions.touchSurface;

                $(touchSurface).bind('touchstart', function (e) {
                    var touchEvent = e.originalEvent;

                    touchOptions.distanceX = 0;
                    touchOptions.distanceY = 0;

                    touchOptions.locked = false;

                    if (touchEvent.touches.length != 1) return false;

                    if (touchOptions.prevent || touchOptions.preventStart || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
                        touchEvent.preventDefault();
                        touchEvent.stopPropagation();
                    }

                    var windowWidthHalf = Math.round($(window).width() / 2);

                    var currentTouchPosition,
                        startTouchPosition,
                        startTime = new Date().getTime();

                    currentTouchPosition = startTouchPosition = { top: touchEvent.touches[0].clientY, left: touchEvent.touches[0].clientX };

                    if (typeof touchOptions.onStart == 'function') {
                        touchOptions.onStart(touchOptions, touchEvent);
                    }

                    $(touchSurface).bind('touchmove', function (e) {
                        touchEvent = e.originalEvent;
                        if (touchEvent.touches.length != 1) return false;

                        if (touchOptions.prevent || touchOptions.preventMove || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
                            touchEvent.preventDefault();
                            touchEvent.stopPropagation();
                        }

                        currentTouchPosition = { top: touchEvent.touches[0].clientY, left: touchEvent.touches[0].clientX };

                        touchOptions.prevDistanceX = touchOptions.distanceX;
                        touchOptions.prevDistanceY = touchOptions.distanceY;
                        touchOptions.distanceX = currentTouchPosition.left - startTouchPosition.left;
                        touchOptions.distanceY = currentTouchPosition.top - startTouchPosition.top;
                        touchOptions.movedX = touchOptions.distanceX - touchOptions.prevDistanceX;
                        touchOptions.movedY = touchOptions.distanceY - touchOptions.prevDistanceY;

                        if (touchOptions.onMove) touchOptions.onMove(touchOptions, touchEvent);
                    });

                    $(touchSurface).bind('touchend', function (e) {
                        touchEvent = e.originalEvent;

                        if (touchOptions.prevent || touchOptions.preventEnd || Math.abs(touchOptions.movedX) < Math.abs(touchOptions.movedY)) {
                            touchEvent.preventDefault();
                            touchEvent.stopPropagation();
                        }

                        var newTime = new Date().getTime();
                        if (touchOptions.onEnd) {
                            touchOptions.dTime = newTime - startTime;
                            touchOptions.prevDistanceX = touchOptions.distanceX || 0;
                            touchOptions.prevDistanceY = touchOptions.distanceY || 0;
                            touchOptions.distanceX = currentTouchPosition.left - startTouchPosition.left;
                            touchOptions.distanceY = currentTouchPosition.top - startTouchPosition.top;
                            touchOptions.movedX = touchOptions.distanceX - touchOptions.prevDistanceX;
                            touchOptions.movedY = touchOptions.distanceY - touchOptions.prevDistanceY;

                            touchOptions.maxDTime = touchOptions.maxDTime || 1200;
                            touchOptions.minDistanceX = touchOptions.minDistanceX || 100;
                            touchOptions.minDistanceY = touchOptions.minDistanceY || 100;

                            touchOptions.moved = false;
                            touchOptions.click = false;
                            touchOptions.clickWH = false;

                            if (touchOptions.dTime < touchOptions.maxDTime) {
                                if (touchOptions.distanceX < -touchOptions.minDistanceX) {
                                    touchOptions.moved = 'left';
                                } else if (touchOptions.distanceX > touchOptions.minDistanceX) {
                                    touchOptions.moved = 'right';
                                } else if (touchOptions.distanceY < -touchOptions.minDistanceY) {
                                    touchOptions.moved = 'up';
                                } else if (touchOptions.distanceY > touchOptions.minDistanceY) {
                                    touchOptions.moved = 'down';
                                } else if (Math.abs(touchOptions.distanceY) < touchOptions.minDistanceY && Math.abs(touchOptions.distanceX) < touchOptions.minDistanceX) {
                                    touchOptions.clickWH = startTouchPosition.left > windowWidthHalf ? 1 : -1;
                                }
                            }

                            if (touchOptions.preventEndIfMoved && touchOptions.moved) {
                                touchEvent.preventDefault();
                                touchEvent.stopPropagation();
                            }

                            touchOptions.onEnd(touchOptions, touchEvent);
                        }

                        $(touchSurface).unbind('touchmove');
                        $(touchSurface).unbind('touchend');

                        touchOptions.distanceX = 0;
                        touchOptions.distanceY = 0;
                    });
                });
            }
        });

    }, { "bezier-easing": 49, "class.extend": 50, "jquery": 52 }], 12: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('./MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'ScrollActionSimple',
            create: function () {
                var self = this;

                this.onScrollFunctions = [];

                window.addSimpleScrollAction = function (elm, callback, trigger_prc) {
                    self.addElement(elm, callback, trigger_prc);
                };

                $(window).scroll(function () {
                    self.scroll();
                });

                $('.js-scroll-action').each(function (elm, i) {
                    this.addElement(elm);
                });
            },
            addElement: function (elm, callback, trigger_prc) {
                if (typeof callback !== 'function') {
                    callback = false;
                }
                if (typeof trigger_prc === 'undefined') {
                    trigger_prc = .1;
                }

                obj = $(elm);
                elm = obj[0];

                var obj = $(elm),
                    activated = false,
                    onScroll = function () {
                        if (activated) return 0;

                        var rect = elm.getBoundingClientRect();
                        var prc = 0,
                            total = window.innerHeight + rect.height;

                        if (rect.top > window.innerHeight) prc = 0; else if (rect.top < -rect.height) prc = 1; else prc = 1 - (rect.top + rect.height) / total;

                        if (prc > trigger_prc) {
                            if (callback) {
                                callback();
                            } else {
                                obj.addClass('atscroll');
                            }
                            activated = true;
                        }
                    };

                this.onScrollFunctions.push(onScroll);
            },
            scroll: function () {
                this.onScrollFunctions.forEach(function (func, i) {
                    func();
                });
            }
        });

    }, { "./MinimalClass": 11, "jquery": 52 }], 13: [function (require, module, exports) {
        'use strict';

        var lib = require('./index.js'),
            $ = require('jquery'),
            MinimalClass = require('./MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'Slider',
            __nativeMode: true,
            pre: function (opt) {
                this.loaded = false;
                this.loading = false;
                this.loadedItems = 0;

                this.stagetRect = false;

                this.switching = true;
                this.pos = 0;
                this.item = [];

                this.autoplay = false;
                this.autoplayTimer = false;

                this.stageRect = false;

                this.autoload = true;
                this.loadOnDemand = false;
                this.loadInSequence = false;

                this.isUserInteracted = false;

                this.itemSetupMode = 'background';

                this.clickableStage = true;
            },
            create: function () {
                var self = this;

                this.stage = this.element.querySelector('.stage');
                if (!this.stage) return;

                this.stageRect = this.stage.getBoundingClientRect();
                this.pos_view = this.element.querySelector('.js-pos');

                this.arrl = this.element.querySelector('.js-prev');
                this.arrr = this.element.querySelector('.js-next');

                var items = lib.querySelectorAll('.item', this.stage);

                items.forEach(function (elm, i) {
                    var item = {
                        id: i,
                        obj: elm,
                        src: elm.getAttribute('data-src'),
                        image: elm.querySelector('.image'),
                        active: lib.hasClass(elm, 'active'),
                        width: 0,
                        height: 0,
                        w: 0,
                        h: 0,
                        loaded: false,
                        loading: false,
                        error: false
                    };

                    if (item.active) self.pos = i; // needs to be corrected below if someone crashed by loading error when loadOnDemand = false

                    self.item.push(item);
                });

                if (this.autoload) {
                    if (this.loadOnDemand) {
                        this.loadItem(this.pos, function (item) {
                            self.prepareSlider();
                            self.switching = false;
                        });
                    } else {
                        this.load();
                    }
                }

                if (typeof this._create === 'function') {
                    this._create();
                }

                window.addEventListener('onresize', function () {
                    self.resize();
                });
                this.resize();
            },
            resize: function () {
                this.stageRect = this.stage.getBoundingClientRect();
            },
            startAutoplay: function () {
                if (!this.autoplay) return;
                this.stopAutoplay();

                var self = this;
                this.autoplayTimer = setTimeout(function () {
                    self.next();
                }, this.autoplay);
            },
            stopAutoplay: function (stopForever) {
                if (this.autoplayTimer) {
                    clearTimeout(this.autoplayTimer);
                    this.autoplayTimer = false;
                }

                if (stopForever) this.autoplay = false;
            },
            setLoading: function (dir) {
                if (this.loading == dir) return;

                if (dir) {
                    lib.addClass(this.element, 'loading');
                } else {
                    lib.removeClass(this.element, 'loading');
                }

                this.loading = dir;
            },
            load: function (cb) {
                if (this.loading) return false;
                if (this.loaded) return lib.cb(cb);

                var self = this;
                if (this.loadInSequence) this.loadItem(0, cb); else this.item.forEach(function (el, i) {
                    self.loadItem(i, cb);
                });

                return true;
            },
            loadItem: function (i, cb) {
                var item = this.item[i],
                    self = this,
                    lz = document.getElementById('LZ'),
                    img;

                if (!lz) {
                    lz = lib.create('LZ', document.body);
                    lz.id = 'LZ';
                }

                item.loading = true;
                item.img = lib.create(false, lz, 'IMG');
                lib.bindEvent(item.img, 'load', function (e) {
                    self.itemLoaded(e, i, cb);
                });
                lib.bindEvent(item.img, 'error', function (e) {
                    self.itemLoaded(e, i, cb);
                });
                item.img.src = item.src;
            },
            itemLoaded: function (e, i, cb) {
                var item = this.item[i];

                switch (e.type) {
                    case 'load':
                        item.width = item.img.width || 0;
                        item.height = item.img.height || 0;
                        this.setupItem(item);
                        break;
                    case 'error':
                        item.error = true;
                        break;
                }

                this.loadedItems++;
                item.loading = true;
                item.loaded = true;

                if (this.loadOnDemand) {
                    this.setLoading(false);
                    lib.cb(item);
                } else {
                    if (this.loadedItems >= this.item.length) this.everythigLoaded(cb); else if (i < this.item.length - 1 && this.loadInSequence) this.loadItem(i + 1, cb);
                }
            },
            setupItem: function (item) {
                switch (this.itemSetupMode) {
                    case 'background.image':
                        var image = document.createElement('DIV');
                        image.className = 'image';
                        image.style.backgroundImage = 'url(' + item.src + ')';
                        item.obj.appendChild(image);
                        item.image = image;
                        break;
                    case 'background':
                    default:
                        item.obj.style.backgroundImage = 'url(' + item.src + ')';
                        break;
                }
            },
            everythigLoaded: function (cb) {
                this.loading = false;
                this.loaded = true;

                this.setLoading(false);
                this.switching = false;
                this.loaded = true;

                this.removeItemsWithErrors();
                this.prepareSlider();

                this.startAutoplay();

                lib.cb(cb);
            },
            prepareSlider: function () {
                var item = this.item[this.pos];
                lib.addClass(item.obj, 'active');
                item.active = true;
                this.setupEvents();
            },
            setupEvents: function () {
                var self = this;

                if (this.arrl) lib.bindEvent(this.arrl, 'click', function (e) {
                    self.userInteracted();
                    self.prev();

                    if (typeof self.onClick === 'function') {
                        self.onClick(self);
                    }
                });

                if (this.arrr) lib.bindEvent(this.arrr, 'click', function (e) {
                    self.userInteracted();
                    self.next();

                    if (typeof self.onClick === 'function') {
                        self.onClick(self);
                    }
                });

                if (this.stage && this.clickableStage && this.item.length > 1) lib.bindEvent(this.stage, 'click', function (e) {
                    self.userInteracted();
                    var rect = self.stage.getBoundingClientRect();
                    e.pageX > rect.left + rect.width / 2 ? self.next() : self.prev();

                    if (typeof self.onClick === 'function') {
                        self.onClick(self);
                    }
                });

                // var cur, prv, nxt, curpos, prvpos, nxtpos;
                // this.setTouchEvent({
                // 	touchSurface: this.stage,
                // 	onStart: function(options,touchEvent){
                // 		self.stopAutoplay();
                // 		self.stopTimer();
                //
                // 		curpos = self.pos;
                // 		prvpos = self.pos - 1;
                // 		nxtpos = self.pos + 1;
                //
                // 		if( prvpos < 0 ){ prvpos = self.item.length - 1; }
                // 		if( nxtpos > self.item.length - 1 ){ nxtpos = 0; }
                //
                // 		cur = self.item[curpos];
                // 		prv = self.item[prvpos];
                // 		nxt = self.item[nxtpos];
                // 	},
                // 	onMove: function(options,touchEvent){
                // 		var distance = options.distanceX,
                // 			negative_distance = -1 * options.distanceX;
                //
                // 		if( distance <= 0 ) {
                // 			prv.obj.style.transform = 'translateX(-100%)';
                // 			prv.image.style.transform = 'translateX(100%)';
                //
                // 			nxt.obj.style.transform = 'translateX(' + ( self.stageRect.width + distance ) + 'px)';
                // 			nxt.image.style.transform = 'translateX(' + ( negative_distance - self.stageRect.width ) + 'px)';
                // 		}
                //
                // 		if( distance >= 0 ) {
                // 			nxt.obj.style.transform = 'translateX(100%)';
                // 			nxt.image.style.transform = 'translateX(-100%)';
                //
                // 			prv.obj.style.transform = 'translateX(' + ( distance - self.stageRect.width ) + 'px)';
                // 			prv.image.style.transform = 'translateX(' + ( negative_distance + self.stageRect.width ) + 'px)';
                // 		}
                //
                // 		cur.obj.style.transform = 'translateX(' + ( distance ) + 'px)';
                // 		cur.image.style.transform = 'translateX(' + ( negative_distance ) + 'px)';
                // 	},
                // 	onEnd: function(options,touchEvent){
                // 		var distance = options.distanceX,
                // 			negative_distance = -1 * options.distanceX;
                //
                // 		if( Math.abs(distance) > ( self.stageRect.width / 2 ) ) {
                // 			var dir;
                // 			if( distance < 0 ) {
                // 				// next
                // 				dir = true;
                // 				nxt.obj.style.transition = 'transform .2s ease';
                // 				nxt.image.style.transition = 'transform .2s ease';
                //
                // 				nxt.obj.style.transform = 'translateX(0)';
                // 				nxt.image.style.transform = 'translateX(0)';
                // 			}else{
                // 				// prev
                // 				dir = false;
                // 				prv.obj.style.transition = 'transform .2s ease';
                // 				prv.image.style.transition = 'transform .2s ease';
                //
                // 				prv.obj.style.transform = 'translateX(0)';
                // 				prv.image.style.transform = 'translateX(0)';
                // 			}
                //
                // 			cur.obj.style.transition = 'transform .2s ease';
                // 			cur.image.style.transition = 'transform .2s ease';
                //
                // 			cur.obj.style.transform = 'translateX(' + ( dir ? -100 : 100 ) + '%)';
                // 			cur.image.style.transform = 'translateX(' + ( dir ? 100 : -100 ) + '%)';
                //
                // 			self.pos = dir ? nxtpos : prvpos;
                //
                // 			setTimeout(function(){
                // 				nxt.obj.style.transition = '';
                // 				nxt.image.style.transition = '';
                // 				nxt.obj.style.transform = '';
                // 				nxt.image.style.transform = '';
                // 				prv.obj.style.transition = '';
                // 				prv.image.style.transition = '';
                // 				prv.obj.style.transform = '';
                // 				prv.image.style.transform = '';
                // 				cur.obj.style.transition = '';
                // 				cur.image.style.transition = '';
                // 				cur.obj.style.transform = '';
                // 				cur.image.style.transform = '';
                //
                // 				if( dir ) {
                // 					nxt.obj.className = 'item fxRollX active';
                // 					prv.obj.className = 'item fxRollX';
                // 				}else{
                // 					prv.obj.className = 'item fxRollX active';
                // 					nxt.obj.className = 'item fxRollX';
                // 				}
                //
                // 				cur.obj.className = 'item fxRollX';
                //
                // 			},200);
                //
                // 		}else{
                // 			prv.obj.style.transform = '';
                // 			prv.image.style.transform = '';
                // 			nxt.obj.style.transform = '';
                // 			nxt.image.style.transform = '';
                // 			cur.obj.style.transform = '';
                // 			cur.image.style.transform = '';
                // 		}
                // 	}
                // });
            },
            startTimer: function () { },
            stopTimer: function () { },
            userInteracted: function () {
                this.isUserInteracted = true;
                this.stopAutoplay(true);
                this.stopTimer();
            },
            removeItemsWithErrors: function () {
                var good = [],
                    errors = 0,
                    id = 0;
                for (var i = 0; i < this.item.length; i++) {
                    if (!this.item[i].error) {
                        this.item[i].id = id++;
                        good.push(this.item[i]);
                    } else {
                        this.stage.removeChild(this.item[i].obj);
                        errors++;
                    }
                }

                if (errors) this.item = good;
            },
            prev: function (cb, quick) {
                var pos = this.pos - 1;
                if (pos < 0) pos = this.item.length - 1;
                this.switchSlide(pos, false, cb, quick);
            },
            next: function (cb, quick) {
                var pos = this.pos + 1;
                if (pos >= this.item.length) pos = 0;
                this.switchSlide(pos, true, cb, quick);
            },
            switchSlide: function (pos, dir, cb, quick, force, not_user_initiated) {
                if (this.loading || !force && (this.pos == pos || this.switching)) return false;
                if (typeof quick == 'undefined') quick = false;
                if (typeof dir === 'undefined') {
                    dir = pos > this.pos;
                }
                this.switching = true;

                var self = this,
                    cur = this.item[this.pos],
                    nxt = this.item[pos],
                    dirExp = dir ? 'Next' : 'Prev',
                    aEvt = lib.animationEndEventName(),
                    tEvt = lib.transitionEndEventName(),
                    waitingFor = 2,
                    completes = 0,
                    onComplete = function () {
                        if (!quick) {
                            lib.removeClasses(cur.obj, ['navOut' + dirExp, 'flyOut' + dirExp]);
                            lib.removeClasses(nxt.obj, ['navIn' + dirExp, 'flyIn' + dirExp, 'fly' + dirExp]);
                        }

                        lib.removeClass(cur.obj, 'active');
                        lib.addClass(nxt.obj, 'active');
                        cur.active = false;
                        nxt.active = true;

                        self.pos = pos;
                        if (self.pos_view) {
                            self.pos_view.innerHTML = pos + 1 + ' из ' + self.item.length;
                        }

                        self.switching = false;

                        self.startAutoplay();

                        if (typeof self.onSwitch === 'function') {
                            self.onSwitch(self, not_user_initiated);
                        }
                    },
                    onTransitionComplete = function (e) {
                        this.removeEventListener(tEvt, onTransitionComplete, false);
                        if (++completes >= waitingFor) onComplete();
                    },
                    onAnimationComplete = function (e) {
                        this.removeEventListener(aEvt, onAnimationComplete, false);
                        if (++completes >= waitingFor) onComplete();
                    };

                if (this.loadOnDemand && !nxt.loaded) {
                    this.loadItem(nxt.id, function () {
                        self.switchSlide(pos, dir, cb, quick, true);
                    });

                    return true;
                }

                if (typeof this.dots !== 'undefined' && typeof this.dots.activate === 'function') {
                    this.dots.activate(pos);
                }

                // aEvt = false;

                if (!quick && aEvt) {
                    cur.obj.addEventListener(aEvt, onAnimationComplete, false);
                    nxt.obj.addEventListener(aEvt, onAnimationComplete, false);
                    lib.addClass(cur.obj, 'navOut' + dirExp);
                    lib.addClass(nxt.obj, 'navIn' + dirExp);
                } else if (!quick && tEvt) {
                    cur.obj.addEventListener(tEvt, onTransitionComplete, false);
                    nxt.obj.addEventListener(tEvt, onTransitionComplete, false);
                    lib.addClass(nxt.obj, 'fly' + dirExp);
                    setTimeout(function () {
                        lib.addClass(cur.obj, 'flyOut' + dirExp);
                        lib.addClass(nxt.obj, 'flyIn' + dirExp);
                    }, 10);
                } else {
                    quick = true;
                    onComplete();
                }

                return true;
            }
        });

    }, { "./MinimalClass": 11, "./index.js": 16, "jquery": 52 }], 14: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            VimeoPlayer = require('@vimeo/player'),
            Loader = require('./Loader'),
            MinimalClass = require('./MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'VimeoPlayer',

            _players: [],
            _pause_other_players: function () {
                var self = this;
                this._players.forEach(function (elm, i) {
                    if (elm != self) {
                        elm.pause();
                    }
                });
            },

            pre: function (opt) {
                this.id = 0;

                this.player_options = { byline: false, portrait: false, title: false, loop: false };

                this.onOpen = false;
                this.onClose = false;
                this.onPlay = false;
                this.onEnded = false;
                this.onReady = false;
                this.onLoaded = false;

                this.width = 0;
                this.height = 0;
                this.video_width = 0;
                this.video_height = 0;
                this.resizeMode = 'fs';

                this.ready = false;
                this.playing = false;
                this.opened = false;
                this.is_loaded = false;

                this.autoplay = true;
                this.autoopen = false;

                this.css_class = false;

                this.closeBtn = false;
            },
            create: function () {
                var self = this;
                this._players.push(this);

                if (!this.element) {
                    this.element = $('<div>').addClass('vimeo-player');
                    if (this.id) {
                        this.element.appendTo(document.body);
                    }

                    this.closeBtn = $('<div>').addClass('arr close js-close');
                    this.closeBtn.append('<svg class="circle"><use xlink:href="#circle"></use></svg>');
                    this.closeBtn.append('<svg class="icon"><use xlink:href="#close"></use></svg>');
                    this.closeBtn.appendTo(this.element);

                    this.loader = new Loader({
                        _target: this.element,
                        _css: 'white',
                        _big: typeof this.loader_text != 'undefined',
                        _text: this.loader_text
                    });
                } else {
                    this.closeBtn = this.find('.js-close');
                    if (!this.closeBtn.length) this.closeBtn = false;
                    if (!this.id) {
                        this.id = this.element.attr('vimeo-id') || 0;
                    }
                }

                if (this.id) {
                    this.player_options.id = this.id;
                } else {
                    this.log('Unable to create vimeo player: no id');
                    return;
                }

                if (this.closeBtn) {
                    this.closeBtn.click(function (e) {
                        self.close(e);
                    });
                }

                this.player_box = $('<div>').addClass('player-box').appendTo(this.element);

                if (this.css_class) {
                    this.element.addClass(this.css_class);
                }

                if (this.auto_create_player) {
                    this.create_player();
                }

                this._create();

                window.app.add_resize(this);

                if (this.scalable_circle_css_class) {
                    this.closeBtn.addClass(this.scalable_circle_css_class);
                }
            },
            create_player: function () {
                var self = this;

                this.player = new VimeoPlayer(this.player_box[0], this.player_options);
                this.player.setLoop(false);

                this.player.on('loaded', function () {
                    self.player.getVideoWidth().then(function (width) {
                        self.video_width = width; self.resize();
                    }).catch(function (error) { });
                    self.player.getVideoHeight().then(function (height) {
                        self.video_height = height; self.resize();
                    }).catch(function (error) { });
                    self.is_loaded = true;
                    self.loaded();
                });

                this.player.on('play', function () {
                    self.playing = true;
                    if (typeof self.onPlay === 'function') {
                        self.onPlay(this);
                    }
                });

                this.player.on('pause', function () {
                    self.playing = false;
                    if (typeof self.onPause === 'function') {
                        self.onPause(this);
                    }
                });

                this.player.on('ended', function () {
                    self.playing = false;
                    if (typeof self.onEnded === 'function') {
                        self.onEnded(this);
                    }
                });

                this.element.bind('click', function (e) {
                    if (e.target != this) return;
                    self.close();
                });
            },
            _create: function () { },
            resize: function () {
                var ww = this.element.width(),
                    wh = this.element.height();

                switch (this.resizeMode) {
                    case 'fs':
                        this.width = ww;
                        this.height = wh;
                        break;
                    default:
                        if (!this.video_width || !this.video_height) {
                            return false;
                        }

                        this.width = Math.round(ww * .8);
                        this.height = Math.round(this.width / this.video_width * this.video_height);

                        if (this.height > wh * .8) {
                            this.height = Math.round(wh * .8);
                            this.width = Math.round(this.height / this.video_height * this.video_width);
                        }
                        break;
                }

                this.player_box.find('iframe').css({
                    width: 960,
                    height: 540
                });

                if (!this.ready) {
                    this.ready = true;
                    this.element.trigger('ready', [this]);
                    if (typeof self.onReady === 'function') {
                        self.onReady(this);
                    }
                }
            },
            loaded: function () {
                this.resize();
                if (this.autoopen) {
                    this.open();
                } else if (this.autoplay && this.opened) {
                    this.play();
                    this.element.addClass('show');
                }

                if (typeof this.onLoaded === 'function') {
                    this.onLoaded(this);
                }
            },
            play: function () {
                this._pause_other_players();
                this.loader.hide();

                if (!this.player) {
                    return this.create_player();
                }

                if (this.playing) return;
                this.player.play();
            },
            pause: function () {
                if (!this.playing) return;
                this.player.pause();
            },
            open: function (e) {
                this.element.addClass('open show');
                this.opened = true;

                this.openingComplete(e);
            },
            openingComplete: function (e) {
                if (this.autoplay) {
                    this.play();
                }

                if (typeof this.onOpen === 'function') {
                    this.onOpen(this, e);
                }
            },
            close: function (e) {
                this.element.removeClass('show open');
                this.opened = false;

                this.pause();

                this.closingComplete(e);
            },
            closingComplete: function (e) {
                if (typeof this.onClose === 'function') {
                    this.onClose(this, e);
                }
            },
            remove: function () {
                var self = this,
                    newPlayers = [];
                this._players.forEach(function (elm, i) {
                    if (elm !== self) {
                        newPlayers.push(elm);
                    }
                });
                this._players = newPlayers;
                this.player.unload();
                this.element.remove();
            }
        });

    }, { "./Loader": 10, "./MinimalClass": 11, "@vimeo/player": 48, "jquery": 52 }], 15: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            VimeoPlayer = require('./VimeoPlayer');

        module.exports = VimeoPlayer.extend({
            __className: 'VimeoPlayerPopper',
            _create: function () {
                var self = this;
                this.shouldUnfixContent = false;
                this.vimeo_player_loaded = false;

                this.element.addClass('popper');
                this.scalable_circle = $('<div>').addClass('scalable-circle').appendTo(this.element);
                if (this.scalable_circle_css_class) {
                    this.scalable_circle.addClass(this.scalable_circle_css_class);
                }

                this.loading_timer = false;

                this.onEnded = function () {
                    if (self.fullscreen(false)) {
                        self.close(null, true);
                    } else {
                        self.close();
                    }
                };

                this.pageX = 0;
                this.pageY = 0;

                if (this.autoopen) {
                    this.open();
                }
            },
            loaded: function () {
                this.vimeo_player_loaded = true;
                if (this.loading_timer) {
                    return;
                }

                this.resize();
                this.element.removeClass('loading');

                if (this.autoplay && this.opened) {
                    this.play();
                    this.element.addClass('show');
                }

                if (typeof this.onLoaded === 'function') {
                    this.onLoaded(this);
                }
            },
            delay_loaded: function () {
                clearTimeout(this.loading_timer);
                this.loading_timer = false;

                if (this.vimeo_player_loaded) {
                    this.loaded();
                }
            },
            open: function (e) {
                this.element.addClass('open');
                this.opened = true;

                var self = this,
                    pos = this.trigger[0].getBoundingClientRect(),
                    width = Math.max(pos.width, 60),
                    height = Math.max(pos.height, 60),
                    top = pos.top,
                    left = pos.left;

                if (width < 60 || height < 60) {
                    height = width = 60;
                    top = Math.round(top - (height - pos.height) / 2);
                    left = Math.round(left - (width - pos.width) / 2);
                }

                if (typeof e !== 'undefined') {
                    this.pageX = e.pageX;
                    this.pageY = e.pageY;
                }

                this.scalable_circle.css({
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    transform: 'scale(0)'
                }).animate({ scale: 45 }, {
                    duration: 1000,
                    easing: 'swing',
                    step: function (now, fx) {
                        self.scalable_circle.css({ transform: 'scale(' + now + ')' });
                    },
                    complete: function () {
                        self.loader.show();
                        self.element.addClass('loading');

                        self.shouldUnfixContent = window.setFixedContent(true);

                        if (self.player) {
                            self.player.setCurrentTime(0);
                            self.play();
                            self.element.addClass('show');
                        } else {
                            if (typeof self.loader_text !== 'undefined' && self.loader_text.length) {
                                self.loading_timer = setTimeout(function () {
                                    self.delay_loaded();
                                }, 3000);
                            }
                            self.create_player();
                        }

                        if (typeof self.onOpen === 'function') {
                            self.onOpen(this, e);
                        }
                    }
                });
            },
            close: function (e, quick) {
                var self = this,
                    pos = this.trigger[0].getBoundingClientRect(),
                    width = Math.max(pos.width, 60),
                    height = Math.max(pos.height, 60),
                    top = pos.top,
                    left = pos.left;

                if (width < 60 || height < 60) {
                    height = width = 60;
                    top = Math.round(top - (height - pos.height) / 2);
                    left = Math.round(left - (width - pos.width) / 2);
                }

                if (typeof e == 'undefined') {
                    e = { pageX: this.pageX, pageY: this.pageY };
                }

                this.pause();

                this.element.removeClass('loading show');
                this.loader.hide();
                this.opened = false;

                if (this.shouldUnfixContent) {
                    window.setFixedContent(false);
                }

                if (quick) {
                    this.scalable_circle.css({ transform: 'scale(0)' });
                    this.element.removeClass('open');

                    if (typeof this.onClose === 'function') {
                        this.onClose(this, e);
                    }
                } else {
                    this.scalable_circle.css({
                        top: pos.top,
                        left: pos.left,
                        width: Math.max(60, pos.width),
                        height: Math.max(60, pos.height)
                    }).animate({ scale: 0 }, {
                        duration: 1000,
                        easing: 'swing',
                        step: function (now, fx) {
                            self.scalable_circle.css({ transform: 'scale(' + now + ')' });
                        },
                        complete: function () {
                            self.element.removeClass('open');

                            if (typeof self.onClose === 'function') {
                                self.onClose(self, e);
                            }
                        }
                    });
                }
            }
        });

    }, { "./VimeoPlayer": 14, "jquery": 52 }], 16: [function (require, module, exports) {
        'use strict';

        var __slice = Array.prototype.slice;

        module.exports.querySelectorAll = function (val, el) {
            return el ? __slice.call(el.querySelectorAll(val)) : __slice.call(document.querySelectorAll(val));
        };

        module.exports.bindEvent = function (elm, evt, callback) {
            evt = evt.split(' ');
            evt.map(function (evt) {
                if (elm.addEventListener) {
                    elm.addEventListener(evt, callback, false);
                } else {
                    elm.attachEvent("on" + evt, callback);
                }
            });
        };

        module.exports.unbindEvent = function (elm, evt, callback) {
            evt = evt.split(' ');
            evt.map(function (evt) {
                if (elm.removeEventListener) {
                    elm.removeEventListener(evt, callback, false);
                } else {
                    elm.detachEvent("on" + evt, callback);
                }
            });
        };

        module.exports.create = function (className, appendTo, tagName) {
            if (typeof className === 'undefined') {
                className = false;
            }
            if (typeof appendTo === 'undefined') {
                appendTo = false;
            }
            if (typeof tagName === 'undefined') {
                tagName = 'DIV';
            }
            var elm = document.createElement(tagName);
            if (className) elm.className = className;
            if (appendTo) appendTo.appendChild(elm);
            return elm;
        };

        module.exports.transitionEndEventName = function () {
            var i,
                undefined,
                el = document.createElement('div'),
                eventNames = {
                    'transition': 'transitionend',
                    'OTransition': 'otransitionend',
                    'MozTransition': 'transitionend',
                    'WebkitTransition': 'webkitTransitionEnd',
                    'msTransition': 'MSTransitionEnd'
                };

            for (i in eventNames) {
                if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
                    return eventNames[i];
                }
            }
        };

        module.exports.animationEndEventName = function () {
            var i,
                undefined,
                el = document.createElement('div'),
                eventNames = {
                    'animation': 'animationend',
                    'OAnimation': 'oAnimationEnd',
                    'WebkitAnimation': 'webkitAnimationEnd',
                    'MozAnimation': 'mozAnimationRnd',
                    'msAnimation': 'MSAnimationEnd'
                };

            for (i in eventNames) {
                if (eventNames.hasOwnProperty(i) && el.style[i] !== undefined) {
                    return eventNames[i];
                }
            }
        };

        module.exports.hasClass = function (el, className) {
            return el.className.indexOf(className) === -1 ? false : true;
        };

        module.exports.addClass = function (el, className) {
            if (!this.hasClass(el, className)) el.className += ' ' + className;
        };

        module.exports.removeClass = function (el, className, accurate) {
            if (typeof accurate === 'undefined') {
                accurate = true;
            }
            if (!this.hasClass(el, className)) return;
            if (!accurate) {
                el.className = el.className.replace(className, '');
            } else {
                var newClassNames = [],
                    classNames = el.className.split(' ');
                classNames.forEach(function (item, i) {
                    if (item.length && item != className) newClassNames.push(item);
                });
                el.className = newClassNames.join(' ');
            }
        };

        module.exports.addClasses = function (el, classNames) {
            var self = this;
            classNames.forEach(function (className, i) {
                self.addClass(el, className);
            });
        };

        module.exports.removeClasses = function (el, classNames) {
            var self = this;
            classNames.forEach(function (className, i) {
                self.removeClass(el, className);
            });
        };

        module.exports.cb = function (cb, data) {
            if (typeof cb != 'function') return false;
            if (typeof data == 'undefined') data = false;
            return cb(data);
        };

    }, {}], 17: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            BarkliLoader = require('./BarkliLoader'),
            PxLine = require('./PxLine');

        module.exports = BarkliLoader.extend({
            __className: 'BarkliIndexLoader',
            create: function () {
                this._super();

                var self = this;

                this.minimal_joker_width = 325;
                this.minimal_joker_height = 500;

                this.original_joker_width = 1371;
                this.original_joker_height = 2110;

                this.joker_container = this.element.find('.joker-container');
                this.joker = this.joker_container.find('.joker');
                this.loader_joker_color = this.element.find('.color');
                this.loader_joker_color_image = this.loader_joker_color.find('.image');

                this.px_line_element = this.element.find('.px-line');
                if (this.px_line_element.length) {
                    var tEvt = this.transitionEndEventName(),
                        onPxLineComplete = function (e) {
                            if (e.target != this) return;
                            switch (e.originalEvent.propertyName) {
                                case 'height':
                                    $(this).unbind(tEvt, onPxLineComplete);
                                    new PxLine({ element: this, _prc_source: self.element });
                                    break;
                            }
                        };
                    this.px_line_element.bind(tEvt, onPxLineComplete);
                }
            },
            update_progress: function () {
                this._super();

                var progress = 100 - this.progress;
                this.loader_joker_color.css({ transform: 'translateY(' + progress + '%)' });
                this.loader_joker_color_image.css({ transform: 'translateY(-' + progress + '%)' });
            },
            after_loading_complete: function () {
                var self = this;
                setTimeout(function () {
                    self.expand_joker();
                }, 500);
            },
            expand_joker: function () {
                var self = this,
                    joker_width = this.width < 1150 ? 1150 : this.width,
                    joker_height = Math.round(joker_width / this.original_joker_width * this.original_joker_height),
                    scale = joker_width / this.minimal_joker_width,
                    top_y = joker_height * 0.13 + this.padding,
                    translateY = -(this.height / 2 + top_y) + 'px';

                this.joker.css({
                    width: joker_width,
                    height: joker_height,
                    transform: 'translate(-50%,-50%) scale(' + 1 / scale + ')'
                });

                setTimeout(function () {
                    self.show_on_screen_elements();
                }, 2000);

                setTimeout(function () {
                    self.joker.addClass('animated');
                    setTimeout(function () {
                        self.joker.css({
                            transform: 'translate(-50%,' + translateY + ') scale(1)'
                        });
                        self.element.addClass('loaded');

                        setTimeout(function () {
                            self.loader_fully_complete();
                        }, 3000);
                    }, 50);
                }, 50);
            }
        });

    }, { "./BarkliLoader": 18, "./PxLine": 38, "jquery": 52 }], 18: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceLoader = require('../lib/ForceLoader'),
            PxLine = require('./PxLine');

        module.exports = ForceLoader.extend({
            __className: 'BarkliLoader',
            create: function () {
                this._super();

                var self = this;

                this.ww = 0;
                this.wh = 0;
                this.width = 0;
                this.height = 0;

                this.loader_line = this.element.find('.js-loader-line');

                window.app.add_resize(this);
            },
            update_progress: function () {
                this._super();

                this.loader_line.css({ width: this.progress + '%' });
            },
            resize: function (ww, wh) {
                this.ww = ww;
                this.wh = wh;
                this.padding = this.ww >= 1440 ? 88 : 72;

                this.width = this.ww - this.padding * 2;
                this.height = this.wh - this.padding * 2;

                this.element.css({
                    width: ww,
                    height: wh
                });
            },
            show_on_screen_elements: function () {
                $('.main-menu-toggler').addClass('on-screen');
                $('.request-form-toggler').addClass('on-screen');
                $('.phone-toggler').addClass('on-screen');
                $('.js-bg-floater').addClass('on-screen');

                setTimeout(function () {
                    $('.main-menu-toggler').addClass('ready');
                }, 1200);
            },
            after_loading_complete: function () {
                var self = this;
                setTimeout(function () {
                    self.show_on_screen_elements();
                    self.element.animate({ opacity: 0 }, 500, 'swing', function () {
                        self.loader_fully_complete();
                        self.remove();
                    });
                }, 500);
            }
            // after_loading_complete: function(){
            // 	var self = this;
            // 	setTimeout(function(){
            // 		self.joker_container.css({ backgroundColor: '#fff' });
            // 		self.joker.addClass('animated-fast').css({ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 });
            // 		setTimeout(function(){
            // 			self.show_on_screen_elements();
            // 			self.element.delay(500).animate({ opacity: 0 },500,'swing',function(){
            // 				self.loader_fully_complete();
            // 				self.remove();
            // 			});
            // 		},500);
            // 	},500);
            // }
        });

    }, { "../lib/ForceLoader": 6, "./PxLine": 38, "jquery": 52 }], 19: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            BarkliMapDot = require('./BarkliMapDot');

        module.exports = MinimalClass.extend({
            __className: 'BarkliMap',
            create: function () {
                var self = this;

                this.width = 0;
                this.height = 0;

                this.with_animation = 0;

                this.is_on_screen = false;
                this.in_activity_radius = false;
                this.blinkin_animating = false;

                this.parent = this.element.parent();
                this.map_layers = this.element.find('.js-map-layers');
                this.map_overlay = this.parent.find('.js-map-overlay');
                this.map_width = 1440;
                this.map_height = 780;

                this.blinkin_animation_delay = 1000;
                this.blinkin_animation_time = 2000;

                this.map_pos = {
                    xprc: 0.66
                };

                this.dots = [];
                this.map_overlay.find('.js-dot').each(function (i, elm) {
                    self.dots.push(new BarkliMapDot({
                        _id: i,
                        element: $(elm),
                        delegate: self
                    }));
                });

                $(window).bind('mousemove', function (e) {
                    var in_activity_radius = false;

                    self.dots.forEach(function (elm) {
                        if (elm.set_target_scale(e)) {
                            in_activity_radius = true;
                        }
                    });

                    self.in_activity_radius = in_activity_radius;
                    self.update_blinkin_animation_state(in_activity_radius);
                });

                window.app.add_resize(this);
                window.app.add_scroll(this);

                // $(window).bind('click',function(e){
                // 	var o = self.map_overlay.offset();
                // 	console.log(
                // 		( e.pageX - o.left ) / self.width,
                // 		( e.pageY - o.top ) / self.height
                // 	);
                // });
            },
            update_blinkin_animation_state: function () {
                var dir = this.is_on_screen && !this.in_activity_radius;
                if (this.blinkin_animating === dir) {
                    return;
                }

                if (dir) {
                    this.dots.forEach(function (elm) {
                        elm.start_blinkin_animation();
                    });
                } else {
                    this.dots.forEach(function (elm) {
                        elm.stop_blinkin_animation();
                    });
                }

                this.blinkin_animating = dir;
            },
            scroll: function (scrollTop, scrollDir) {
                var prc = this.calc_element_scroll_prc(this.element[0]);

                if (prc >= .3) {
                    this.element.parent().addClass('s-a-a');
                }

                this.is_on_screen = prc >= .1 && prc <= .9;
                this.update_blinkin_animation_state();
            },
            resize: function (ww, wh) {
                this.height = this.element.parent().outerHeight(true);
                this.width = Math.round(this.height / this.map_height * this.map_width);

                var width = Math.round(Math.min(this.width, this.width - Math.round(this.width * (1 - this.map_pos.xprc) - ww / 12 * 2) + Math.max(0, ww - 1800))),
                    css = { width: width, height: this.height };

                this.element.css(css);
                this.map_overlay.css(css);
                this.map_layers.css({ width: this.width, height: this.height });

                var offset = this.map_overlay.offset();
                for (var i = 0; i < this.dots.length; i++) {
                    this.dots[i].repos(this.width, this.height, offset);
                }

                if (window.md.tablet() || window.md.phone()) {
                    this.stop_animation();
                } else {
                    this.start_animation();
                }
            },
            start_animation: function () {
                if (this.with_animation === true) {
                    return;
                }

                this.with_animation = true;
                this.dots.forEach(function (elm) {
                    elm.start_animation();
                });
            },
            stop_animation: function () {
                if (this.with_animation === false) {
                    return;
                }

                this.with_animation = false;
                this.dots.forEach(function (elm) {
                    elm.stop_animation();
                });
            },
            mousedot: function (e, id) {
                switch (e.type) {
                    case 'mouseenter':
                        this.dots.forEach(function (elm, i) {
                            if (i == id) {
                                elm.set_target_scale(e, 1);
                            } else {
                                elm.set_target_scale(e, -1);
                            }
                        });
                        break;
                    case 'mouseleave':
                        this.dots.forEach(function (elm) {
                            elm.set_target_scale(e, 0);
                        });
                        break;
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./BarkliMapDot": 20, "jquery": 52 }], 20: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            VimeoPlayerPopper = require('../lib/VimeoPlayerPopper'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'BarkliMapDot',
            create: function () {
                var self = this;

                this.x = 0;
                this.y = 0;
                this.scale = 0;
                this.target_scale = 0;

                this.play = this.element.find('.js-play');
                this.vimeo_id = this.element.attr('vimeo-id');
                this.player = false;

                this.page = { x: 0, y: 0 };

                this.prc = {
                    x: parseInt(this.element.attr('data-x')) / this.delegate.map_width,
                    y: parseInt(this.element.attr('data-y')) / this.delegate.map_height
                };

                this.radius = 40;
                this.speed = 10;
                this.activity_radius = parseInt(this.element.attr('data-rad'));

                this.opened = false;
                this.mo = 0;
                this.timer = false;

                this.locked = false;
                this.changing_scale = false;
                this.imageHidden = false;
                this.onCompleteChangingScale = false;

                this.blinkin_dot = false;
                this.blinkin_timer = false;
                this.with_animation = false;

                this.element.bind('click mouseenter mouseleave', function (e) {
                    switch (e.type) {
                        case 'click':
                            self.set_target_scale(e, 2);
                            break;
                        default:
                            self.delegate.mousedot(e, self.id);
                            break;
                    }
                });

                this.blinkin_dot = $('<div>').addClass('blinkin-dot').html('<svg><use xlink:href="#play"></use></svg>').css({ display: 'none' }).appendTo(this.delegate.map_overlay);
                this.blinkin_dot.bind(self.transitionEndEventName(), function (e) {
                    if (e.target !== this) return;
                    var elm = $(this);
                    switch (e.originalEvent.propertyName) {
                        case 'transform':
                            if (!elm.hasClass('state2')) {
                                elm.addClass('state2');
                            } else {
                                elm.removeClass('state1 state2');
                                self.blinkin_timer = setTimeout(function () {
                                    elm.addClass('state1');
                                }, self.delegate.dots.length * self.delegate.blinkin_animation_delay - self.delegate.blinkin_animation_time);
                            }
                            break;
                    }
                });
            },
            start_timer: function () {
                var self = this;
                this.timer = setInterval(function () {
                    self.update_scale();
                }, 1000 / 50);
                this.blinkin_dot.css({ display: 'block' });
            },
            stop_timer: function () {
                if (this.timer) {
                    clearInterval(this.timer);
                    this.timer = null;
                }

                this.blinkin_dot.css({ display: 'none' });
            },
            load_vimeo_player: function (open) {
                if (!this.vimeo_id) return false;

                if (!this.player) {
                    var self = this;
                    this.player = new VimeoPlayerPopper({
                        _id: this.vimeo_id,
                        _scalable_circle_css_class: 'white',
                        _autoopen: open,
                        _trigger: this.element,
                        _loader_text: this.element.attr('data-loader-text'),
                        _onClose: function (player, e) {
                            self.set_target_scale(e, 2, true);
                        }
                    });
                } else {
                    this.player.open();
                }

                return true;
            },
            set_target_scale: function (e, mo, unlock) {
                var in_activity_radius = false;

                if (this.locked && !unlock) {
                    return false;
                }

                if (typeof mo != 'undefined') {
                    this.mo = mo;
                }

                switch (this.mo) {
                    case -1:
                        this.target_scale = 0;
                        break;
                    case 1:
                        this.target_scale = 2;
                        break;
                    case 2:
                        if (!mo) {
                            return false;
                        }

                        if (!this.opened) {
                            var x = Math.max(this.page.x, $(window).width() - this.page.x),
                                y = Math.max(this.page.y - $(window).scrollTop(), $(window).scrollTop() + $(window).height() - this.page.y);
                            this.target_scale = 1; //Math.ceil(Math.sqrt(Math.pow(x,2) + Math.pow(y,2)) / 40);
                            this.element.addClass('open');
                            this.locked = this.opened = true;
                            this.onCompleteChangingScale = function (dot) {
                                // window.setFixedContent(true);
                                // dot.load_vimeo_player(true);
                            };

                            this.load_vimeo_player(true);
                            break;
                        } else {
                            // window.setFixedContent(false);
                            this.locked = this.opened = false;
                            this.element.removeClass('open');
                            this.mo = 0;
                        }
                    default:
                        var x = Math.round(e.pageX - this.page.x),
                            y = Math.round(e.pageY - this.page.y),
                            distance = Math.round(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))),
                            scale = 0;

                        if (distance <= this.activity_radius) {
                            scale = (this.activity_radius - distance) / this.activity_radius;
                            in_activity_radius = true;
                        }

                        this.target_scale = scale;
                        break;
                }

                return in_activity_radius;
            },
            calc_play_opacity: function () {
                if (this.scale < 0.2) return 0;
                if (this.scale > 0.8) return 1;
                return (this.scale - 0.2) / 0.6;
            },
            calc_play_scale: function () {
                if (this.scale <= 1) return 1;
                var scale = 1 / this.scale;
                return scale;
            },
            update_scale: function () {
                if (this.target_scale == this.scale) {
                    if (this.changing_scale) {
                        this.changing_scale = false;
                        if (typeof this.onCompleteChangingScale === 'function') {
                            this.onCompleteChangingScale(this);
                            this.onCompleteChangingScale = false;
                        }
                    }
                    return;
                }

                this.changing_scale = true;
                this.scale = this.delegate.calculate_animated_value(this.scale, this.target_scale, this.speed);

                if (this.scale > 2 && !this.imageHidden) {
                    this.element.addClass('hide-image');
                    this.imageHidden = true;
                } else if (this.scale < 2 && this.imageHidden) {
                    this.element.removeClass('hide-image');
                    this.imageHidden = false;
                }

                // console.log(this.target_scale, this.scale);

                this.play.css({ opacity: this.calc_play_opacity(), transform: 'translate(-50%,-50%) scale(' + this.calc_play_scale() + ')' });
                this.element.css({ transform: 'translate(-50%,-50%) scale(' + this.scale + ')' });
            },
            repos: function (w, h, offset) {
                this.x = Math.round(this.prc.x * w);
                this.y = Math.round(this.prc.y * h);

                this.page.x = offset.left + this.x;
                this.page.y = offset.top + this.y;

                var pos = { left: this.x, top: this.y };

                this.element.css(pos);
                this.blinkin_dot.css(pos);
            },
            start_blinkin_animation: function () {
                if (!this.blinkin_dot || !this.with_animation) return;

                if (this.blinkin_timer) {
                    clearTimeout(this.blinkin_timer);
                    this.blinkin_timer = null;
                }

                var self = this;
                this.blinkin_timer = setTimeout(function () {
                    self.blinkin_dot.addClass('state1');
                    clearTimeout(self.blinkin_timer);
                    self.blinkin_timer = null;
                }, this.id * self.delegate.blinkin_animation_delay);
            },
            stop_blinkin_animation: function () {
                if (!this.blinkin_dot || !this.with_animation) return;

                if (this.blinkin_timer) {
                    clearTimeout(this.blinkin_timer);
                    this.blinkin_timer = null;
                }

                this.blinkin_dot.removeClass('state1 state2');
            },
            start_animation: function () {
                this.with_animation = true;

                this.play.css({ opacity: 0, transform: 'translate(-50%,-50%) scale(0)' });
                this.element.css({ transform: 'translate(-50%,-50%) scale(0)' });

                this.start_timer();
            },
            stop_animation: function () {
                this.with_animation = false;
                this.stop_timer();

                this.play.css({ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' });
                this.element.css({ transform: 'translate(-50%,-50%) scale(1)' });
            }
        });

    }, { "../lib/MinimalClass": 11, "../lib/VimeoPlayerPopper": 15, "jquery": 52 }], 21: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            CircleTimer = require('./CircleTimer'),
            Slider = require('../lib/Slider'),
            Dots = require('./Dots');

        module.exports = Slider.extend({
            __className: 'BarkliSlider',
            _create: function () {
                var self = this;

                this.autotimer_active = false;
                this.user_interaction_timeout_timer = false;

                this.itemSetupMode = 'background.image';
                this.resizeMode = this.element.getAttribute('data-resize-mode');

                if (this.arrr && this.autotimer) {
                    this.timer = new CircleTimer({
                        element: this.arrr,
                        _time: 5,
                        _autorestart: true,
                        _onComplete: function () {
                            self.next();
                        }
                    });

                    window.app.add_scroll(this);
                }

                this.dots_element = $(this.element).find('.js-dots');
                if (this.dots_element.length) {
                    this.dots = new Dots({
                        element: this.dots_element,
                        delegate: self,
                        _onChange: function (pos) {
                            self.switchSlide(pos);
                        }
                    });
                }

                if (typeof this.__create === 'function') {
                    this.__create();
                }

                window.app.add_resize(this);
            },
            resize: function (ww, wh) {
                switch (this.resizeMode) {
                    case 'wide-slider':
                        var width = ww;
                        if (ww > 1600) {
                            width -= (ww >= 1440 ? 88 : 72) * 2;
                        }
                        this.element.style.width = Math.min(1600, width) + 'px';
                        break;
                }

                this._super();
            },
            userInteracted: function () {
                this.isUserInteracted = true;
                this.stopAutoplay(true);
                this.stopTimer();

                var self = this;
                this.clearUserInteractionTimeout();
                this.user_interaction_timeout_timer = setTimeout(function () {
                    self.isUserInteracted = false;
                    self.startTimer();
                }, 5000);
            },
            clearUserInteractionTimeout: function () {
                if (this.user_interaction_timeout_timer) {
                    clearTimeout(this.user_interaction_timeout_timer);
                    this.user_interaction_timeout_timer = null;
                }
            },
            scroll: function (scrollTop, scrollDir) {
                var rect = this.element.getBoundingClientRect();
                var prc = 0,
                    total = window.innerHeight + rect.height;

                if (rect.top > window.innerHeight) prc = 0; else if (rect.top < -rect.height) prc = 1; else prc = 1 - (rect.top + rect.height) / total;

                if (prc >= .1 && prc <= .9) {
                    if (prc >= .3 && !this.isUserInteracted) {
                        this.startTimer();
                    }
                } else {
                    this.clearUserInteractionTimeout();
                    this.isUserInteracted = false;
                    this.pauseTimer();
                }
            },
            startTimer: function () {
                if (this.autotimer_active) return;
                if (this.autotimer && this.timer) {
                    this.timer.start();
                    this.autotimer_active = true;
                }
            },
            pauseTimer: function () {
                if (!this.autotimer_active) return;
                if (this.autotimer && this.timer) {
                    this.timer.stop();
                }
                this.autotimer_active = false;
            },
            stopTimer: function () {
                if (this.autotimer && this.timer) {
                    this.timer.stop();
                }
                this.autotimer_active = false;
            }
        });

    }, { "../lib/Slider": 13, "./CircleTimer": 26, "./Dots": 27, "jquery": 52 }], 22: [function (require, module, exports) {
        'use strict';

        var lib = require('../lib/index.js'),
            $ = require('jquery'),
            BarkliSlider = require('./BarkliSlider');

        module.exports = BarkliSlider.extend({
            __className: 'BarkliSliderHouse',
            __create: function () {
                var self = this;

                this.additional_stage = this.element.querySelector('.js-additional-stage');
                if (this.additional_stage) {
                    lib.querySelectorAll('.item', this.additional_stage).forEach(function (elm, i) {
                        self.item[i].additional_obj = elm;
                    });
                }

                window.app.add_resize(this);
            },
            resize: function (ww, wh) {
                this._super();
                this.element.style.height = Math.round(this.stageRect.width / 1598 * 871) + 'px';

                var additional_stage_height = Math.round(this.stageRect.width / 1598 * 111);
                this.additional_stage.style.height = additional_stage_height + 'px';
                this.additional_stage.style.top = -additional_stage_height + 'px';
            },
            switchSlide: function (pos, dir, cb, quick, force, not_user_initiated) {
                if (this.loading || !force && (this.pos == pos || this.switching)) return false;
                if (typeof quick == 'undefined') quick = false;
                this.switching = true;

                var self = this,
                    cur = this.item[this.pos],
                    nxt = this.item[pos],
                    dirExp = dir ? 'Next' : 'Prev',
                    aEvt = lib.animationEndEventName(),
                    tEvt = lib.transitionEndEventName(),
                    waitingFor = 2,
                    completes = 0,
                    onComplete = function () {
                        if (!quick) {
                            lib.removeClasses(cur.obj, ['navOut' + dirExp, 'flyOut' + dirExp]);
                            lib.removeClasses(nxt.obj, ['navIn' + dirExp, 'flyIn' + dirExp, 'fly' + dirExp]);
                            lib.removeClasses(cur.additional_obj, ['navOut' + dirExp, 'flyOut' + dirExp]);
                            lib.removeClasses(nxt.additional_obj, ['navIn' + dirExp, 'flyIn' + dirExp, 'fly' + dirExp]);
                        }

                        lib.removeClass(cur.obj, 'active');
                        lib.removeClass(cur.additional_obj, 'active');
                        lib.addClass(nxt.obj, 'active');
                        lib.addClass(nxt.additional_obj, 'active');
                        cur.active = false;
                        nxt.active = true;

                        self.pos = pos;
                        if (self.pos_view) self.pos_view.innerHTML = pos + 1 + ' из ' + self.item.length;

                        self.switching = false;

                        self.startAutoplay();

                        if (typeof self.onSwitch === 'function') {
                            self.onSwitch(self, not_user_initiated);
                        }
                    },
                    onTransitionComplete = function (e) {
                        this.removeEventListener(tEvt, onTransitionComplete, false);
                        if (++completes >= waitingFor) onComplete();
                    },
                    onAnimationComplete = function (e) {
                        this.removeEventListener(aEvt, onAnimationComplete, false);
                        if (++completes >= waitingFor) onComplete();
                    };

                if (this.loadOnDemand && !nxt.loaded) {
                    this.loadItem(nxt.id, function () {
                        self.switchSlide(pos, dir, cb, quick, true);
                    });
                    return true;
                }

                if (!quick && aEvt) {
                    cur.obj.addEventListener(aEvt, onAnimationComplete, false);
                    nxt.obj.addEventListener(aEvt, onAnimationComplete, false);
                    lib.addClass(cur.obj, 'navOut' + dirExp);
                    lib.addClass(nxt.obj, 'navIn' + dirExp);
                    lib.addClass(cur.additional_obj, 'navOut' + dirExp);
                    lib.addClass(nxt.additional_obj, 'navIn' + dirExp);
                } else if (!quick && tEvt) {
                    cur.obj.addEventListener(tEvt, onTransitionComplete, false);
                    nxt.obj.addEventListener(tEvt, onTransitionComplete, false);
                    lib.addClass(nxt.obj, 'fly' + dirExp);
                    lib.addClass(nxt.additional_obj, 'fly' + dirExp);
                    setTimeout(function () {
                        lib.addClass(cur.obj, 'flyOut' + dirExp);
                        lib.addClass(nxt, 'flyIn' + dirExp);
                        lib.addClass(cur.additional_obj, 'flyOut' + dirExp);
                        lib.addClass(nxt.additional_obj, 'flyIn' + dirExp);
                    }, 30);
                } else {
                    quick = true;
                    onComplete();
                }

                return true;
            }
        });

    }, { "../lib/index.js": 16, "./BarkliSlider": 21, "jquery": 52 }], 23: [function (require, module, exports) {
        'use scrict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'Building',
            create: function () {
                var self = this;

                this.top = 0;
                this.left = 0;

                this.mode = this.element.attr('data-mode');

                this.width = this.original_width = 850;
                this.height = this.original_height = 680;

                this.hint = this.element.find('.js-building-hint');
                this.hint_floor_text = this.hint.find('.js-floor-text');
                this.hint_flats_text = this.hint.find('.js-flats-text');
                this.mousemovehint = function (e) {
                    self.update_hint_position(e);
                };

                $('.zone').bind('click touchstart mouseenter mouseleave', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var floor = $(this).attr('data-floor'),
                        floor_id = $(this).attr('data-floor-id'),
                        elements = self.element.find('svg.hover[data-floor=' + floor + ']'),
                        flats_text = typeof building_flats !== 'undefined' ? building_flats[floor_id] : null;

                    switch (e.type) {
                        case 'click':
                        case 'touchstart':
                            window.location = '/public/visual/' + $(this).attr('data-floor-id');
                            break;
                        case 'mouseenter':
                            elements.addClass('active');
                            self.hint.addClass('active');
                            self.hint_floor_text.empty().html(floor);
                            self.hint_flats_text.empty().html(flats_text);
                            $(window).bind('mousemove', self.mousemovehint);
                            self.update_hint_position(e);
                            break;
                        case 'mouseleave':
                            elements.removeClass('active');
                            self.hint.removeClass('active');
                            $(window).unbind('mousemove', self.mousemovehint);
                            break;
                    }
                });

                window.app.add_resize(this);
            },
            update_hint_position: function (e) {
                var posx = e.pageX - this.left,
                    posy = e.pageY - this.top;

                this.hint.css({
                    top: posy - 10,
                    left: posx
                });
            },
            resize: function (ww, wh) {
                switch (this.mode) {
                    case 'floors':
                        // this.width = Math.round(ww / 12 * 8);
                        // this.height = Math.round(this.width / this.original_width * this.original_height);
                        this.element.parent().css({ width: Math.round(ww / 12 * 8) });
                        this.height = Math.max(300, $(window).height() - this.element.offset().top - 64);
                        this.width = Math.round(this.height / this.original_height * this.original_width);
                        break;
                    default:
                        this.width = Math.round(Math.min(700, ww / 12 * 5.5));
                        this.height = Math.round(this.width / this.original_width * this.original_height);
                        break;
                }

                this.element.css({
                    width: this.width,
                    height: this.height
                });

                if (this.mode === 'index') {

                    var padding = ww > 1440 ? 88 : 72;
                    if (ww > 1600) {
                        padding += Math.round((ww - 1600) / 2);
                    }

                    this.element.css({
                        marginRight: padding
                    });
                }

                var offset = this.element.offset();
                this.left = offset.left;
                this.top = offset.top;
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 24: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            VimeoPlayerPopper = require('../lib/VimeoPlayerPopper');

        module.exports = MinimalClass.extend({
            __className: 'CardsCard',
            create: function () {
                var self = this;

                this.arrow_direction = true;

                this.active = false;
                this.opened = false;
                this.is_previous = false;
                this.setpos_animated_callback = null;

                this.vimeo_id = this.element.attr('vimeo-id') || false;
                this.player = null;

                this.video = this.element.find('video');

                this.visual = this.element.find('.js-visual');
                this.content = this.element.find('.js-content');
                this.content_box = this.element.find('.js-content-box');
                this.arrow = this.element.find('.js-arrow');
                this.visual.bind('click', function (e) {
                    if (self.delegate && typeof self.delegate.enableTimer === 'function') {
                        self.delegate.enableTimer(false);
                    }
                    self.mouse_visual(e);
                });

                if (this.vimeo_id) {
                    this.visual.addClass('with-video');
                }

                this.element.bind(this.transitionEndEventName(), function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'transform':
                            self.setpos_complete(e);
                            break;
                    }
                });

                this.content_box.bind(this.transitionEndEventName(), function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'transform':
                            if (!self.opened) {
                                self.element.removeClass('expand');
                            }
                            break;
                    }
                });
            },
            load_vimeo_player: function (open) {
                if (!this.vimeo_id) return false;

                if (!this.player) {
                    var self = this;
                    this.player = new VimeoPlayerPopper({
                        _id: this.vimeo_id, _autoopen: open, _trigger: this.arrow, _onClose: function () {
                            self.delegate.lock_current_item(false);
                        }
                    });
                } else {
                    this.player.open();
                }

                return true;
            },
            mouse_visual: function (e) {
                switch (e.type) {
                    case 'click':
                        if (this.delegate && this.delegate.busy) {
                            return;
                        }

                        if (this.active) {
                            if (this.load_vimeo_player(true)) {
                                this.delegate.lock_current_item(true);
                            } else {
                                this.log('There is no player');
                            }
                        } else {
                            if (this.delegate && typeof this.delegate.switch_card === 'function') {
                                this.delegate.switch_card(this.id, null, true);
                            }
                        }
                        break;
                }
            },
            setpos: function (x, animated, cb) {
                if (animated) {
                    this.element.addClass('animated');
                }
                this.element.css({ transform: 'translateX(' + x + 'px)' });
                this.setpos_animated_callback = null;
                if (typeof cb === 'function') {
                    if (animated) {
                        this.setpos_animated_callback = cb;
                    } else {
                        cb(this);
                    }
                }
            },
            setpos_complete: function () {
                this.element.removeClass('animated');
                if (typeof this.setpos_animated_callback === 'function') {
                    this.setpos_animated_callback(this);
                }
            },
            set_previous: function (is_previous) {
                this.is_previous = is_previous;
                if (is_previous) {
                    this.element.addClass('right');
                } else {
                    this.element.removeClass('right');
                }
            },
            resize: function (w, h) {
                var size = { width: w, height: h };
                this.element.css(size);
                this.visual.css(size);
                this.content.css(size);
            },
            open: function () {
                if (!this.opened) {
                    this.element.addClass('expand open');
                    this.opened = true;
                }
            },
            close: function () {
                if (this.opened) {
                    this.element.removeClass('open');
                    this.opened = false;
                }
            },
            activate: function (x, animated, cb) {
                this.element.addClass('active');
                this.active = true;
                this.setpos(x, animated, cb);
                if (this.video.length) {
                    this.video[0].play();
                }
                this.open();
            },
            deactivate: function () {
                this.element.removeClass('active');
                if (this.video.length) {
                    this.video[0].pause();
                }
                this.active = false;
            }
        });

    }, { "../lib/MinimalClass": 11, "../lib/VimeoPlayerPopper": 15, "jquery": 52 }], 25: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            Dots = require('./Dots'),
            CardsCard = require('./CardsCard'),
            PxLine = require('./PxLine');

        module.exports = MinimalClass.extend({
            __className: 'CardsSlider',
            create: function () {
                var self = this;

                this.busy = false;

                this.isUserInteracted = false;
                this.autotimer_active = false;
                this.user_interaction_timeout_timer = false;
                this.current_item_locked = false;

                this.cards_type = this.element.attr('data-cards-type');

                this.cards = [];
                this.cards_order = [];
                this.cards_order_prev = [];
                this.cards_order_next = [];
                this.dots = false;

                this.autotimer_active = false;
                this.user_interaction_timeout_timer = false;
                this.scrolled_into_viewport = true;

                this.pos = -1;
                this.width = 0;
                this.height = 0;

                this.initial_position_x = 0;
                this.active_position_x = 0;

                this.centered = false;
                this.carouseled = false;

                this.card_min_width = 380;
                this.card_max_width = 480;

                this.min_screen_width = 1280;
                this.max_screen_width = 1920;

                var px_line = this.element.find('.js-px-line');
                if (px_line.length) {
                    new PxLine({ element: px_line, _prc_source: this.element });
                }

                this.cards_element = this.element.find('.js-cards');
                if (this.cards_element.length) {

                    this.scrolled_into_viewport = !this.element.hasClass('js-should-scroll-into-viewport');

                    this.cards_element.find('.js-card').each(function (i, elm) {
                        self.cards.push(new CardsCard({ _id: i, element: elm, delegate: self }));
                    });

                    this.dots_element = this.element.find('.js-dots');
                    if (this.dots_element.length) {
                        this.dots = new Dots({
                            element: this.dots_element, delegate: self, _onChange: function (pos, dir, fromUser) {
                                self.switch_card(pos, dir, fromUser);
                            }
                        });
                    }

                    this.back2first = this.cards_element.find('.js-back2first');
                    if (this.back2first.length) {
                        this.back2first.click(function (e) {
                            self.userInteracted();
                            self.switch_card(self.dots.with_zero ? -1 : 0);
                        });
                    }
                }

                window.app.add_resize(this);
                window.app.add_scroll(this);
            },
            next: function () {
                var pos = this.pos + 1;
                if (pos >= this.cards.length) {
                    pos = 0;
                }
                this.switch_card(pos, true);
            },
            prev: function () {
                var pos = this.pos - 1;
                if (pos < 0) {
                    pos = this.cards.length - 1;
                }
                this.switch_card(pos, false);
            },
            switch_card: function (pos, dir, fromUser, animated) {

                if (fromUser) {
                    this.userInteracted();
                }
                if (this.busy || this.pos == pos) {
                    return false;
                }
                if (typeof animated === 'undefined') {
                    animated = true;
                }

                if (typeof dir === 'undefined') {
                    dir = 0;
                }

                pos >= 0 ? this.element.find('.js-hide-text').addClass('hide') : this.element.find('.js-hide-text').removeClass('hide');

                if (this.pos >= 0) {
                    // close current card if there is active card
                    this.cards[this.pos].close();
                }

                this.dots.activate(pos);

                this.repos(pos, animated);

                return true;
            },
            enableTimer: function (dir) {
                if (this.dots && typeof this.dots.enableTimer === 'function') {
                    this.dots.enableTimer(dir);
                }
            },
            userInteracted: function () {
                if (this.current_item_locked) return;

                this.isUserInteracted = true;
                this.stopTimer();

                var self = this;
                this.clearUserInteractionTimeout();
                this.user_interaction_timeout_timer = setTimeout(function () {
                    self.isUserInteracted = false;
                    self.startTimer();
                }, 5000);
            },
            clearUserInteractionTimeout: function () {
                if (this.user_interaction_timeout_timer) {
                    clearTimeout(this.user_interaction_timeout_timer);
                    this.user_interaction_timeout_timer = null;
                }
            },
            scroll: function (scrollTop, scrollDir) {
                if (!this.scrolled_into_viewport) {
                    var rect = this.cards_element[0].getBoundingClientRect();
                    if (window.app.wh - (rect.top + rect.height) > 0) {
                        this.element.addClass('scrolled_into_viewport');
                        this.scrolled_into_viewport = true;
                    }
                }

                if (this.current_item_locked) return;

                var prc = this.calc_element_scroll_prc(this.element[0]);
                if (prc >= .4 && prc <= .9) {
                    if (!this.isUserInteracted) {
                        this.startTimer();
                    }
                } else {
                    this.clearUserInteractionTimeout();
                    this.isUserInteracted = false;
                    this.pauseTimer();
                }
            },
            startTimer: function () {
                if (this.autotimer_active) return;
                this.enableTimer(true);
                this.autotimer_active = true;
            },
            pauseTimer: function () {
                if (!this.autotimer_active) return;
                this.enableTimer(false);
                this.autotimer_active = false;
            },
            stopTimer: function () {
                this.enableTimer(false);
                this.autotimer_active = false;
            },
            lock_current_item: function (dir) {
                if (dir) {
                    this.current_item_locked = true;
                    this.stopTimer();
                    this.clearUserInteractionTimeout();
                } else {
                    this.current_item_locked = false;
                    this.userInteracted();
                }
            },
            recalc: function () {
                var ww = $(window).width(),
                    wh = this.cards_element.height(),
                    active_position_x = Math.round(ww / 12 * 2),
                    card_padding = Math.round(ww * (ww <= this.max_screen_width ? 0.1 : 0.05)),
                    card_width_add_range = this.card_max_width - this.card_min_width,
                    card_width_multiplier = Math.min(1, (ww - this.min_screen_width) / (this.max_screen_width - this.min_screen_width)),
                    card_width = Math.max(this.card_min_width, Math.min(this.card_max_width, Math.round(this.card_min_width + card_width_add_range * card_width_multiplier))),
                    initial_position_x = Math.round(ww - card_width * .66),
                    count = this.cards.length,
                    all_cards_width = (count + 1) * (card_width + card_padding),
                    // "+ 1" to add additional side padding and 1 opened card content

                    centered = ww >= all_cards_width,
                    carouseled = !centered && ww < all_cards_width - (card_width + card_padding + (card_width - (initial_position_x - card_padding)));

                // setting to "this" is separeted from calculations
                // to be able to change something or react to some flags changes
                // in some conditions after initial calculations and before setting to "this"

                this.card_width = card_width;
                this.card_padding = card_padding;

                this.initial_position_x = initial_position_x;
                this.active_position_x = active_position_x;

                if (this.carouseled != carouseled) {
                    this.reorder(this.pos);
                }

                this.centered = centered;
                this.carouseled = carouseled;

                this.width = ww;
                this.height = wh;
            },
            resize: function (ww, wh) {

                this.recalc();

                this.cards_element.css({ width: this.width });

                var self = this;
                $(this.cards).each(function (i, elm) {
                    elm.resize(self.card_width, self.height);
                });

                this.repos(this.pos, false);

                if (!this.inited) {
                    this.inited = true;

                    if (!this.dots.with_zero) {
                        this.switch_card(0, null, null, false);
                    }
                }
            },
            reorder: function (pos) {

                var i;

                this.cards_order = [];
                this.cards_order_prev = [];
                this.cards_order_next = [];

                for (i = 0; i < this.cards.length; i++) {
                    if (pos > i) {
                        this.cards_order_prev.push(i);
                    } else if (pos < i) {
                        this.cards_order_next.push(i);
                    }
                }

                this.cards_order_prev.reverse();

                if (this.carouseled) {
                    // card.setpos(left, animated);
                }

                for (i = 0; i < this.cards_order_prev.length; i++) {
                    this.cards_order.push(this.cards_order_prev[i]);
                }

                if (pos >= 0) this.cards_order.push(pos);

                for (i = 0; i < this.cards_order_next.length; i++) {
                    this.cards_order.push(this.cards_order_next[i]);
                }
            },
            repos: function (pos, animated) {

                var self = this,
                    left = 0,
                    card_with_padding = this.card_width + this.card_padding;

                if (pos < 0 && !animated) {
                    // put all cards to zero position
                    left = this.initial_position_x;
                    $(this.cards).each(function (i, elm) {
                        elm.setpos(left);
                        left += card_with_padding;
                    });
                    this.pos = pos;
                } else {

                    this.reorder(pos);

                    if (pos >= this.cards.length - 1) {
                        this.back2first.css({ display: 'block' });
                    } else {
                        this.back2first.css({ display: 'none' });
                    }

                    // working with non-zero position
                    if (this.busy) {
                        return;
                    }
                    this.busy = true;

                    var i,
                        card,
                        card_id,
                        onComplete = animated ? function (card) {
                            self.pos = pos;
                            self.busy = false;
                        } : null;

                    left = this.active_position_x - card_with_padding;
                    for (i = 0; i < this.cards_order_prev.length; i++) {
                        card_id = this.cards_order_prev[i];
                        card = this.cards[card_id];

                        card.set_previous(true);
                        card.deactivate();
                        card.setpos(left, animated);

                        left -= card_with_padding;
                    }

                    if (pos >= 0) {
                        this.cards[pos].activate(this.active_position_x, animated, onComplete);
                    } else {
                        setTimeout(onComplete, 1000);
                    }

                    left = this.active_position_x + card_with_padding + this.card_width;
                    for (i = 0; i < this.cards_order_next.length; i++) {
                        card_id = this.cards_order_next[i];
                        card = this.cards[card_id];

                        card.set_previous(false);
                        card.deactivate();
                        card.setpos(left, animated);

                        left += card_with_padding;
                    }

                    if (!animated) {
                        self.pos = pos;
                        self.busy = false;
                    }
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./CardsCard": 24, "./Dots": 27, "./PxLine": 38, "jquery": 52 }], 26: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'CircleTimer',
            pre: function () {
                this.autorestart = false;
                this.mode = 'jquery';
            },
            create: function () {
                var self = this;
                this.tmr = false;
                this.timer = this.element.find('.js-circle-timer');

                if (!this.time) {
                    this.time = parseInt(this.timer.attr('data-time')) || 5;
                }

                if (this.mode == 'css') {
                    this.timer.bind(this.transitionEndEventName(), function (e) {
                        if (e.target !== this) return;
                        switch (e.originalEvent.propertyName) {
                            case 'stroke-dashoffset':
                                self.complete(e);
                                break;
                        }
                    });
                }
            },
            start: function () {
                switch (this.mode) {
                    case 'jquery':
                        var self = this;
                        this.timer.css({ strokeDashoffset: 190 }).animate({ strokeDashoffset: 0 }, this.time * 1000, 'linear', function () {
                            self.complete();
                        });
                        break;
                    case 'css':
                        this.timer.addClass('timer' + this.time);
                        break;
                }
            },
            stop: function () {
                if (this.tmr) {
                    clearTimeout(this.tmr);
                    this.tmr = null;
                }

                switch (this.mode) {
                    case 'jquery':
                        this.timer.stop().css({ strokeDashoffset: 190 });
                        break;
                    case 'css':
                        this.timer.removeClass('timer' + this.time);
                        break;
                }
            },
            complete: function (e) {
                this.stop();

                if (typeof this.onComplete === 'function') {
                    this.onComplete(this);
                }

                if (this.autorestart) {
                    var self = this;
                    this.tmr = setTimeout(function () {
                        self.start();
                    }, 10);
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 27: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            CircleTimer = require('./CircleTimer');

        module.exports = MinimalClass.extend({
            __className: 'Dots',
            create: function () {
                var self = this;
                this.dots = [];

                this.timer_dot = false;
                this.timers_enabled = false;

                this.active = -1;
                this.with_zero = false;

                this.element.find('.dot').each(function (i, elm) {
                    var obj = $(elm),
                        circle = obj.find('.js-circle-timer'),
                        item = {
                            id: i,
                            obj: obj,
                            timer: new CircleTimer({
                                element: obj,
                                _time: 10,
                                _autorestart: false,
                                _onComplete: function (e) {
                                    self.next_item();
                                }
                            }),
                            active: obj.hasClass('active'),
                            activate: function (dir, start_timer) {
                                if (this.active == dir) {
                                    return;
                                }

                                if (dir) {
                                    this.obj.addClass('active');
                                    if (start_timer) {
                                        this.start_timer();
                                    }
                                } else {
                                    this.obj.removeClass('active');
                                    this.cancel_timer();
                                }

                                this.active = dir;
                            },
                            start_timer: function () {
                                this.timer && self.timers_enabled && this.timer.start();
                            },
                            cancel_timer: function () {
                                this.timer && this.timer.stop();
                            }
                        };

                    if (item.active) {
                        self.active = item.id;
                    }

                    if (item.obj.hasClass('zero')) {
                        self.with_zero = true;
                    }

                    item.obj.bind('click', function (e) {
                        self.switch_item(item.id, null, true);
                    });

                    self.dots.push(item);
                });
            },
            activate: function (pos) {
                var id = pos + (this.with_zero ? 1 : 0);

                if (this.active == id) {
                    return;
                }

                if (this.active >= 0) {
                    this.dots[this.active].activate(false);
                }

                this.active = id;
                this.dots[this.active].activate(true, this.timers_enabled);
            },
            enableTimer: function (dir) {
                var self = this;
                this.timers_enabled = dir;

                if (dir) {
                    if (this.active < 0) {
                        this.active = 0;
                        this.dots[this.active].activate(true);
                    }

                    this.dots[this.active].start_timer();
                } else if (this.active >= 0) {
                    this.dots[this.active].cancel_timer();
                }
            },
            next_item: function () {
                var nxt = this.active + 1;
                if (nxt >= this.dots.length) {
                    nxt = 0;
                }
                this.switch_item(nxt);
            },
            prev_item: function () {
                var nxt = this.active - 1;
                if (nxt < 0) {
                    nxt = this.dots.length - 1;
                }
                this.switch_item(nxt);
            },
            switch_item: function (id, skip_callback, fromUser) {
                var cur = this.active >= 0 ? this.dots[this.active] : false,
                    nxt = this.dots[id];

                if (!skip_callback && nxt && typeof this.onChange === 'function') {
                    if (!this.onChange(nxt.id + (this.with_zero ? -1 : 0), null, fromUser)) {
                        return;
                    }
                }

                if (cur && cur.id == nxt.id) {
                    return;
                }

                cur.activate(false);
                nxt.activate(true);
                this.active = nxt.id;

                if (this.timers_enabled) {
                    nxt.start_timer();
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./CircleTimer": 26, "jquery": 52 }], 28: [function (require, module, exports) {
        'use sctrict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'FloatingTitleBox',
            create: function () {
                var self = this;

                this.with_parallax = typeof window.parallax_enabled !== 'undefined' ? window.parallax_enabled : false;

                this.offset = 0;
                this.current_offset = this.offset;
                this.scrollStartAt = 0;

                var floating_title = this.element.find('.js-floating-title');
                this.floating_title = floating_title.length ? new FloatingTitle({ element: floating_title }) : false;
                this.floating_layers = this.element.find('.js-floating-layer');

                this.floating_title.setoffset(this.offset);
                this.floating_layers.css({ transform: 'translateY(' + this.offset * 4 + 'px)' });

                window.app.add_resize(this);
                window.app.add_scroll(this);
            },
            resize: function (ww, wh) {
                this.scrollStartAt = this.element.offset().top - wh;
                if (this.floating_title) {
                    this.floating_title.resize(ww, wh);
                }
                if (window.parallax_enabled) {
                    this.offset = Math.round(wh * .08);
                }
            },
            scroll: function (scrollTop) {
                if (window.contentFixed || scrollTop < this.scrollStartAt) {
                    return;
                }

                var offset = Math.max(0, this.offset - (scrollTop - this.scrollStartAt) / 8);
                this.floating_title.setoffset(offset);
                this.floating_layers.css({ transform: 'translateY(' + offset * 4 + 'px)' });

                var ppx = Math.max(0, this.floating_title.element.offset().top + this.floating_title.element.outerHeight(true) - $(this.floating_layers[0]).offset().top);
                this.floating_title.setpx(ppx);
            }
        });

        var FloatingTitle = MinimalClass.extend({
            __className: 'FloatingTitle',
            create: function () {
                var self = this;
                this.px = 0;

                this.top = this.element.find('.js-top');
                this.top_span = this.top.find('span');
                this.bottom = this.element.find('.js-bottom');
                this.bottom_span = this.bottom.length ? this.bottom.find('span') : false;

                this.setpx(this.px);
            },
            resize: function () {
                this.height = this.element.outerHeight(true);
                this.setpx(this.px);
            },
            setpx: function (px) {
                if (!this.bottom_span) {
                    return false;
                }

                this.px = Math.min(px, this.height);
                var top = this.height - this.px;

                this.bottom.css({ top: top, height: this.px });
                this.bottom_span.css({ transform: 'translateY(-' + top + 'px)' });
            },
            setoffset: function (offset) {
                this.element.css({ transform: 'translateY(-' + offset + 'px)' });
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 29: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'IndexFooter',
            create: function () {
                var self = this;

                this.cloned_footer = this.element.clone().removeClass('js-index-footer').appendTo($('#content')).addClass('clone');

                if (this.is_touch_device() && (window.md.tablet() || window.md.phone())) {
                    return;
                }

                this.wh = 0;

                this.height = 0;
                this.visible = false;
                this.element.css({ visibility: 'visible' });

                window.app.add_resize(this);
                window.app.add_scroll(this);
            },
            resize: function (ww, wh) {
                this.wh = wh;
                this.height = this.element.outerHeight(true);
            },
            scroll: function (scrollTop) {
                var shoudBeVisible = scrollTop + this.wh >= window.app.page_height - 100;
                if (shoudBeVisible != this.visible) {
                    this.element.css({ visibility: shoudBeVisible ? 'visible' : 'visible' });
                    this.visible = shoudBeVisible;
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 30: [function (require, module, exports) {
        'use sctrict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            PxLine = require('./PxLine');

        module.exports = MinimalClass.extend({
            __className: 'IndexScreen',
            create: function () {
                var self = this;

                this.blocks = this.element.find('.js-block');
                this.jocker_block = this.element.find('.js-jocker-container');
                this.joker = this.element.find('.js-joker-block');
                this.target = this.element.find('.js-jocker-target');

                this.original_joker_width = 3057;
                this.original_joker_height = 4705;

                var px_line = this.element.find('.js-px-line');
                if (px_line.length) new PxLine({ element: px_line, _prc_source: this.element });

                window.app.add_resize(this);
            },
            resize: function (ww, wh) {
                wh = Math.max(wh, 500);
                this.element.css({ height: wh });

                var padding = ww >= 1440 ? 88 : 72;

                this.blocks.css({
                    width: Math.round(ww - padding * 2),
                    height: Math.round(wh - padding * 2)
                });

                this.joker.css({ width: null, height: null });

                var block_height = this.jocker_block.height(),
                    joker_width = this.joker.width(),
                    joker_height = this.joker.height();

                if (joker_width < 1150) {
                    joker_width = 1150;
                    joker_height = Math.round(joker_width / this.original_joker_width * this.original_joker_height);
                    this.target.css({
                        width: joker_width,
                        hegiht: joker_height
                    });
                }

                if (block_height < 700) {
                    block_height = 700;
                }

                var translated = joker_height * 0.13,
                    top = joker_height * .49 - block_height - translated;

                this.target.css({ top: -top });

                if (wh > 0 && !this.inited) {
                    this.inited = true;
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./PxLine": 38, "jquery": 52 }], 31: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            Slider = require('../lib/Slider'),
            InteriorsMenu = require('./InteriorsMenu');

        module.exports = MinimalClass.extend({
            __className: 'Interiors',
            create: function () {
                var self = this;

                this.isUserInteracted = false;
                this.autotimer_active = false;
                this.user_interaction_timeout_timer = false;
                this.current_item_locked = false;

                this.slider = false;
                var slider = this.element.find('.js-slider');
                if (slider.length) {
                    this.slider = new Slider({
                        element: slider[0],
                        delegate: this,
                        _itemSetupMode: 'background.image',
                        _onClick: function () {
                            if (self.menu && typeof self.menu.stop_timer === 'function') {
                                self.menu.stop_timer();
                            }
                        },
                        _onSwitch: function (slider, not_user_initiated) {
                            if (!not_user_initiated) {
                                self.switch_menu(slider.pos);
                            }
                        }
                    });
                }

                var menu = this.element.find('.js-interiors-menu');
                this.menu = menu.length ? new InteriorsMenu({
                    element: menu,
                    delegate: this
                }) : false;

                window.app.add_scroll(this);
            },
            switch_menu: function (slide_id) {
                if (this.menu) {
                    this.menu.switch_option_by_option_id(slide_id, true);
                }
            },
            switch_slide: function (slide_id) {
                if (this.slider) {
                    return this.slider.switchSlide(slide_id, true, null, null, null, true);
                }
                return true;
            },
            userInteracted: function () {
                if (this.current_item_locked) return;

                this.isUserInteracted = true;
                this.stopTimer();

                var self = this;
                this.clearUserInteractionTimeout();
                this.user_interaction_timeout_timer = setTimeout(function () {
                    self.isUserInteracted = false;
                    self.startTimer();
                }, 5000);
            },
            clearUserInteractionTimeout: function () {
                if (this.user_interaction_timeout_timer) {
                    clearTimeout(this.user_interaction_timeout_timer);
                    this.user_interaction_timeout_timer = null;
                }
            },
            scroll: function (scrollTop, scrollDir) {
                var rect = this.slider.element.getBoundingClientRect();
                var prc = 0,
                    total = window.innerHeight + rect.height;

                if (rect.top > window.innerHeight) prc = 0; else if (rect.top < -rect.height) prc = 1; else prc = 1 - (rect.top + rect.height) / total;

                if (prc >= .1 && prc <= .9) {
                    if (prc >= .3 && !this.isUserInteracted) {
                        this.startTimer();
                    }
                } else {
                    this.clearUserInteractionTimeout();
                    this.isUserInteracted = false;
                    this.pauseTimer();
                }
            },
            startTimer: function () {
                if (this.autotimer_active) return;
                this.menu.start_timer();
                this.autotimer_active = true;
            },
            pauseTimer: function () {
                if (!this.autotimer_active) return;
                this.menu.stop_timer();
                this.autotimer_active = false;
            },
            stopTimer: function () {
                this.menu.stop_timer();
                this.autotimer_active = false;
            }
        });

    }, { "../lib/MinimalClass": 11, "../lib/Slider": 13, "./InteriorsMenu": 32, "jquery": 52 }], 32: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            CircleTimer = require('./CircleTimer'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'IneriorsMenu',
            create: function () {
                var self = this;
                this.blocks = [];

                this.active = -1;
                this.element.find('.js-block').each(function (i, elm) {
                    var obj = $(elm),
                        title = obj.find('.js-title'),
                        options_box = obj.find('.js-options-box'),
                        options = obj.find('.js-options');

                    var block = {
                        id: i,
                        obj: obj,
                        title: title,
                        options_box: options_box,
                        options_element: options,
                        options_height: 0,
                        options: [],
                        active_option: -1,
                        active: obj.hasClass('active'),
                        activate: function (dir) {
                            if (this.active == dir) return;

                            if (dir) {
                                this.options_box.css({ height: this.options_element.outerHeight(true) });
                                this.obj.addClass('active');
                            } else {
                                this.obj.removeClass('active');
                                this.options_box.css({ height: 0 });
                            }

                            this.active = dir;
                        }
                    };

                    if (block.active) {
                        self.active = block.id;
                        block.options_box.css({ height: block.options_element.outerHeight(true) });
                    }

                    options.find('li').each(function (j, elm) {
                        var opt = $(elm);
                        var item = {
                            id: j,
                            block_id: i,
                            obj: opt,
                            option_id: parseInt(opt.attr('data-option')),
                            active: opt.hasClass('active'),
                            activate: function (dir) {
                                if (this.active == dir) return;
                                dir ? this.obj.addClass('active') : this.obj.removeClass('active');
                                this.active = dir;
                            }
                        };

                        if (item.active) {
                            block.active_option = item.id;
                        }

                        item.obj.bind('click', function (e) {
                            self.stop_timer(); self.switch_option(item.id, item.block_id);
                        });
                        block.options.push(item);
                    });

                    title.bind('click', function (e) {
                        self.stop_timer(); self.switch_block(block.id);
                    });

                    self.blocks.push(block);
                });

                this.position = this.element.find('.js-position');
                this.number = this.position.find('.js-number');

                this.timer = new CircleTimer({
                    element: this.position,
                    _time: 5,
                    _autorestart: true,
                    _onComplete: function (e) {
                        self.next();
                    }
                });
            },
            updatePositionPosition: function () {
                var top = (this.active <= 0 ? 0 : this.active) * 108;
                this.position.css({ transform: 'translateY(' + top + 'px)' });
            },
            start_timer: function () {
                this.timer.start();
            },
            stop_timer: function () {
                this.timer.stop();
            },
            next: function () {
                if (this.active < 0) {
                    this.switch_option_by_option_id(0);
                } else {
                    if (this.blocks[this.active].active_option < this.blocks[this.active].options.length - 1) {
                        this.switch_option_by_option_id(this.blocks[this.active].options[this.blocks[this.active].active_option + 1].option_id);
                    } else if (this.active < this.blocks.length - 1) {
                        this.switch_option_by_option_id(this.blocks[this.active + 1].options[0].option_id);
                    } else {
                        this.switch_option_by_option_id(0);
                    }
                }
            },
            prev: function () { },
            switch_option_by_option_id: function (option_option_id, skip_callback) {
                for (var block_id in this.blocks) {
                    for (var option_id in this.blocks[block_id].options) {
                        if (this.blocks[block_id].options[option_id].option_id == option_option_id) {
                            this.switch_option(option_id, block_id, skip_callback);
                            return true;
                        }
                    }
                }
                return false;
            },
            switch_option: function (option_id, block_id, skip_callback) {
                var block = this.blocks[block_id];

                var cur = block.active_option >= 0 ? block.options[block.active_option] : false,
                    nxt = typeof block.options[option_id] != 'undefined' ? block.options[option_id] : false;

                if (nxt && !skip_callback && this.delegate && typeof this.delegate.switch_slide === 'function') {
                    if (!this.delegate.switch_slide(nxt.option_id)) {
                        return false;
                    }
                }

                if (cur) {
                    cur.activate(false);
                    block.active_option = -1;
                }

                if (nxt) {
                    nxt.activate(true);
                    block.active_option = nxt.id;

                    var number = nxt.option_id + 1;
                    number = number < 10 ? '0' + number : number;
                    this.number.html(number);

                    if (this.active != block_id) {
                        this.switch_block(block_id, true);
                    }
                }
            },
            switch_block: function (block_id, skip_callback) {
                var cur = this.active >= 0 ? this.blocks[this.active] : false,
                    nxt = typeof this.blocks[block_id] != 'undefined' ? this.blocks[block_id] : false;

                if (nxt && !skip_callback && this.delegate && typeof this.delegate.switch_slide === 'function') {
                    if (!this.delegate.switch_slide(nxt.options[nxt.active_option].option_id)) {
                        return;
                    }
                }

                if (cur) {
                    cur.activate(false);
                    this.active = -1;

                    if (cur === nxt) {
                        return;
                    }
                }

                if (nxt) {
                    nxt.activate(true);
                    this.active = nxt.id;
                    this.updatePositionPosition();

                    var number = nxt.options[nxt.active_option].option_id + 1;
                    number = number < 10 ? '0' + number : number;
                    this.number.html(number);
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./CircleTimer": 26, "jquery": 52 }], 33: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            SearchBox = require('./SearchBox');

        module.exports = MinimalClass.extend({
            __className: 'MainMenu',
            pre: function () {
                this.busy = false;
                this.opened = false;
            },
            create: function () {
                var self = this;

                this.busy = false;

                this.screen_width = 0;
                this.screen_height = 0;
                this.screen_padding = 72;
                this.scrollTop = 0;

                this.site_width = 0;
                this.site_height = 0;
                this.site_padding = 48;

                this.menu_box = this.element.find('.js-menu-box');
                this.site_box = this.element.find('.js-site-box');

                this.screen = $('#screen');
                this.content = this.screen.find('#content');

                this.screen.bind(this.transitionEndEventName(), function (e) {
                    self.screen_animation_complete(e);
                });

                this.bg_floater = $('.js-bg-floater');
                this.bg_floater_active = false;
                this.bg_floater_hidden = false;
                $('.js-main-menu-trigger').click(function (e) {
                    self.toggle(e);
                });

                var search_box = this.element.find('.js-search-box');
                this.search_box = search_box.length ? new SearchBox({ element: search_box }) : false;

                this.on_toggle = function () {
                    self.toggle();
                };

                $(document).ready(function () {
                    window.app.add_resize(self);
                    window.app.add_scroll(self);
                });
            },
            resize: function (ww, wh) {
                this.screen_width = ww;
                this.screen_height = wh;
                this.screeen_aspect = ww / wh;

                this.screen_padding = ww >= 1440 ? 88 : 72;

                this.site_width = this.site_box.outerWidth(true) - this.site_padding * 2;
                this.site_height = this.screen_height - this.site_padding * 2;

                this.site_box.css({
                    top: this.screen_padding,
                    right: this.screen_padding,
                    height: this.site_height - this.site_padding * 2
                });

                this.site_width_scale = this.site_width / ww;
                this.site_height_scale = this.site_height / (this.site_width_scale * wh);

                this.menu_box.css({
                    width: Math.round(ww - this.site_box.outerWidth(true) - ww / 12 * 2 - this.screen_padding - 32),
                    top: this.screen_padding,
                    height: wh - this.screen_padding * 2
                });

                this.scroll();
            },
            scroll: function (scrollTop) {
                if (window.contentFixed) {
                    return;
                }

                this.scrollTop = scrollTop;
                this.set_bg_floater(this.opened || this.screen_height > 0 && scrollTop > this.screen_height / 2);
            },
            toggle: function () {
                this.opened ? this.close() : this.open();
            },
            screen_animation_complete: function (e) {
                if (e.target !== this.screen[0]) return;
                if (e.originalEvent.propertyName === 'transform') {
                    this.busy = false;
                }
            },
            open: function () {
                if (this.busy) return;
                this.busy = true;

                this.element.addClass('open');
                $('.main-menu-toggler').addClass('menu-open');
                window.setFixedContent(true);
                if (typeof window.app.index_footer != 'undefined') window.app.index_footer.element.css({ display: 'none' });
                this.transform_site(true);
                this.set_bg_floater(true);
                this.opened = true;

                window.weborama.add(4);
            },
            close: function () {
                if (this.busy) return;
                this.busy = true;

                var self = this;
                this.opened = false;
                this.transform_site(false);

                this.set_bg_floater(this.screen_height > 0 && this.scrollTop > this.screen_height / 2);

                $('.main-menu-toggler').removeClass('menu-open');

                setTimeout(function () {
                    self.element.removeClass('open');
                    if (typeof window.app.index_footer != 'undefined') {
                        window.app.index_footer.cloned_footer.css({ height: 0 });
                        window.app.index_footer.element.css({ display: 'block' });
                    }
                    window.setFixedContent(false);
                }, 500);
            },
            transform_site: function (dir) {
                if (dir) {
                    var height = Math.round(this.site_height * this.site_height_scale - this.site_padding * 2 - this.screen_padding * 2 - 36),
                        top = Math.round((this.screen_padding + this.site_padding) / this.site_width_scale),
                        left = -Math.round((this.screen_padding + this.site_padding) / this.site_width_scale);

                    this.screen.addClass('scale-down').css({
                        transform: 'scale(' + this.site_width_scale + ') translate(' + left + 'px,' + top + 'px)',
                        height: height
                    }).bind('click', this.on_toggle);

                    var cfh = Math.abs(Math.min(0, this.content.height() - (this.scrollTop + this.screen_height)));
                    if (typeof window.app.index_footer != 'undefined') window.app.index_footer.cloned_footer.css({ height: cfh });
                } else {
                    this.screen.removeClass('scale-down').css({ height: '', transform: '' }).unbind('click', this.on_toggle);
                }
            },
            set_bg_floater: function (dir) {
                if (this.bg_floater_active == dir) {
                    return;
                }

                if (dir) {
                    this.bg_floater.addClass('active');
                } else {
                    this.bg_floater.removeClass('active');
                }

                this.bg_floater_active = dir;
            },
            hide_bg_floater: function (dir) {
                if (this.bg_floater_hidden == dir) {
                    return;
                }

                if (dir) {
                    this.bg_floater.addClass('hidden');
                } else {
                    this.bg_floater.removeClass('hidden');
                }

                this.bg_floater_hidden = dir;
            }
        });

    }, { "../lib/MinimalClass": 11, "./SearchBox": 40, "jquery": 52 }], 34: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            GoogleMapsLoader = require('google-maps'),
            map_styles = require('./map_styles');

        module.exports = MinimalClass.extend({
            __className: 'Office',
            create: function () {
                var self = this;

                this.current_transform = 'translateY(-80px)';
                this.startScrollAt = 0;
                this.finishScrollAt = 0;
                this.scrollLength = 0;

                this.original_video_width = 1210;
                this.original_video_height = 700;

                this.form = this.element.parent().find('form');
                this.video = this.element.find('video');
                this.video = this.video.length ? this.video[0] : false;
                this.video_playing = false;

                this.office_box = this.element.find('.js-office-box');
                this.office_box_width = 367;
                this.show_on_map = this.element.find('.js-show-on-map');
                this.show_form = this.element.find('.js-show-form');

                this.contacts_map = this.element.find('.js-contacts-map');
                this.map = this.contacts_map.find('.js-map');

                this.contacts_map_width = 0;
                this.animationBusy = false;

                window.app.add_resize(this);
                window.app.add_scroll(this);

                GoogleMapsLoader.KEY = 'AIzaSyAU-Chry2C0CR1eyBloTo96nkqytDc9MfY';
                GoogleMapsLoader.LANGUAGE = window.app.lang;

                this.google_map = false;
                this.marker = false;
                this.map_position = {
                    lat: 55.741244,
                    lng: 37.622892
                };

                GoogleMapsLoader.load(function (google) {
                    self.google_map = new google.maps.Map(self.map[0], {
                        center: self.map_position,
                        zoom: 16,
                        styles: map_styles()
                    });

                    self.marker = new google.maps.Marker({
                        position: self.map_position,
                        map: self.google_map,
                        title: 'Barkli Gallery',
                        icon: 'assets/images/home.svg'
                    });
                });

                this.map_opened = false;
                this.show_on_map.click(function (e) {
                    self.toggleMap(e);
                });
                this.show_form.click(function (e) {
                    self.toggleMap(e);
                });

                this.contacts_map.bind(this.transitionEndEventName(), function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'width':
                            self.mapAnimationComplete();
                            break;
                    }
                });
            },
            resize: function (ww, wh) {
                var pad = ww > 1440 ? 60 : 48;

                var max_video_width = Math.floor(670 / 700 * this.original_video_width);
                this.office_box_width = Math.min(max_video_width, Math.round((ww - this.form.offset().left - this.form.width() - 60 - pad) * (ww > 1600 ? .95 : 1)));
                this.office_box.css({ width: this.office_box_width });

                this.element.css({ transform: null });
                // this.startScrollAt = this.element.offset().top - $(window).height() + 80;
                // this.finishScrollAt = this.startScrollAt + this.element.outerHeight(true);
                // this.scrollLength = this.finishScrollAt - this.startScrollAt;
                // this.element.css({ transform: this.current_transform });
                this.scroll();

                this.contacts_map_width = ww - this.office_box_width - 120;
                this.map.css({ width: this.contacts_map_width });
            },
            scroll: function (scrollTop) {

                var prc = this.calc_element_scroll_prc(this.element[0]);

                if (prc >= .1 && prc <= .9) {
                    if (!this.video_playing) {
                        this.video && this.video.play();
                        this.video_playing = true;
                    }
                } else if (this.video_playing) {
                    this.video && this.video.pause();
                    this.video_playing = false;
                }

                // if( scrollTop < this.startScrollAt ) {
                // 	return;
                // }

                // var translateY = Math.min(0,-80 + ( 80 * ((scrollTop - this.startScrollAt) / this.scrollLength)) );
                // this.current_transform = 'translateY('+translateY+'px)';
                // this.element.css({ transform: this.current_transform });
            },
            toggleMap: function () {
                var dir = !this.map_opened;

                if (this.animationBusy) {
                    return false;
                }

                this.animationBusy = true;

                if (dir) {
                    this.contacts_map.css({ width: this.contacts_map_width });
                    this.element.parent().addClass('map-opened');
                    this.show_on_map.find('.caption').fadeOut('fast', function () {
                        $(this).html(window.i18n.close_map).fadeIn('fast');
                    });
                    this.show_form.addClass('show');
                    window.app.main_menu.hide_bg_floater(true);
                } else {
                    this.contacts_map.css({ width: 0 });
                    window.app.main_menu.hide_bg_floater(false);
                    this.show_form.removeClass('show');
                    this.element.parent().addClass('map-closing').removeClass('map-opened');
                    this.show_on_map.find('.caption').fadeOut('fast', function () {
                        $(this).html(window.i18n.show_map).fadeIn('fast');
                    });
                }

                this.map_opened = dir;
            },
            mapAnimationComplete: function () {
                if (this.map_opened) {
                    window.app.main_menu.hide_bg_floater(true);
                } else {
                    this.element.parent().removeClass('map-closing');
                }

                this.animationBusy = false;
            }
        });

    }, { "../lib/MinimalClass": 11, "./map_styles": 47, "google-maps": 51, "jquery": 52 }], 35: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            RequestForm = require('./RequestForm');

        module.exports = RequestForm.extend({
            __className: 'PopupEmailForm',
            __create: function () {
                var self = this;

                this.shouldUnfixContent = false;
                this.opened = false;

                $('.js-email-form-trigger').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.open();
                    });
                });

                this.element.find('.js-close').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.close();
                    });
                });
            },
            open: function (flat_id) {
                this.flat_id = flat_id;
                this.element.addClass('open');
                this.shouldUnfixContent = window.setFixedContent(true);
                this.opened = true;
            },
            close: function () {
                if (this.shouldUnfixContent) {
                    window.setFixedContent(false);
                }
                this.element.removeClass('open');
                this.opened = false;
            },
            resize: function () { }
        });

    }, { "./RequestForm": 39, "jquery": 52 }], 36: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            RequestForm = require('./RequestForm');

        module.exports = RequestForm.extend({
            __className: 'PopupPolicy',
            __create: function () {
                var self = this;
                this.opened = false;

                $('.button-accept').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.accept($(this).attr('data-accept'));
                    });
                });

                $('.js-popup-policy-trigger').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.open($(this).attr('data-accept'));
                    });
                });

                $('#popup-policy').find('.js-close').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.close();
                    });
                });
            },
            accept: function (data) {
                $('form .' + data + '').addClass('success');
                $('form .' + data + '').attr('data-valid', 1);
                $('form .' + data + '').addClass('success');
                $('form .' + data + ' input').prop('checked', true);
                window.setFixedContent(false);
                $('#popup-policy').removeClass('open');
                this.opened = false;
            },
            open: function (data) {
                $('#popup-policy').addClass('open');
                $('.button-accept').attr('data-accept', data);
                window.setFixedContent(true);
                this.opened = true;
            },
            close: function () {
                window.setFixedContent(false);
                $('#popup-policy').removeClass('open');
                this.opened = false;
            },
            resize: function () { }
        });

    }, { "./RequestForm": 39, "jquery": 52 }], 37: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            RequestForm = require('./RequestForm');

        module.exports = RequestForm.extend({
            __className: 'PopupRequestForm',
            __create: function () {
                var self = this;

                this.shouldUnfixContent = false;
                this.opened = false;

                $('.js-popup-request-form-trigger').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.open();
                    });
                });

                this.element.find('.js-close').each(function (i, elm) {
                    $(elm).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        self.close();
                    });
                });
            },
            open: function (flat_id) {
                this.flat_id = flat_id;
                this.element.addClass('open');
                this.shouldUnfixContent = window.setFixedContent(true);
                this.opened = true;

                window.weborama.add(2);
            },
            close: function () {
                if (this.shouldUnfixContent) {
                    window.setFixedContent(false);
                }
                this.element.removeClass('open');
                this.opened = false;
            },
            resize: function () { },
            on_success: function () {
                window.weborama.add(3);
            }
        });

    }, { "./RequestForm": 39, "jquery": 52 }], 38: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            create: function () {
                var self = this;

                this.mode = this.element.attr('data-mode');

                this.element.addClass('reset-transitions');

                window.app.add_resize(this);
                window.app.add_scroll(this);
            },
            resize: function (ww, wh) { },
            scroll: function (scrollTop, scrollDir) {
                var prc = this.calc_element_scroll_prc(this.prc_source);
                switch (this.mode) {
                    case 'index-screen':
                        this.element.css({ height: 66 + Math.min(scrollTop / 3, 84) });
                        break;
                    case 'names-collection':
                        if (prc >= .4 && prc <= .7) {
                            var px_line_prc = (prc - .4) / .3;
                            this.element.css({ height: Math.round(px_line_prc * 216) });
                        }
                        break;
                    case 'wide-slider':
                        if (prc >= .1 && prc <= .3) {
                            var px_line_prc = (prc - .1) / .2;
                            this.element.css({ height: Math.round(px_line_prc * 122) });
                        }
                        break;
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 39: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            ForceForm = require('../lib/ForceForm'),
            SuperSubmitButton = require('./SuperSubmitButton');

        module.exports = ForceForm.extend({
            __className: 'RequestForm',
            _create: function () {
                this.flat_id = 0;

                var submit_button = this.element.find('button.submit');
                this.submit_button = submit_button.length ? new SuperSubmitButton({ element: submit_button }) : false;
                if (typeof this.__create === 'function') {
                    this.__create();
                }
            },
            on_send: function (data) {
                this.submit_button.start_animation();
                this.element.addClass('show-sending-form');
            },
            on_error: function (resp) {
                this.element.removeClass('show-sending-form');
                this.submit_button.back_to_initial_state(true);
                this.log(resp.message);
            },
            on_fail: function () {
                this.element.removeClass('show-sending-form');
                this.submit_button.back_to_initial_state(true);
                this.log(this.fail_message);
            },
            on_success: function () {
                var self = this;
                this.submit_button.stop_animation(function () {
                    self.element.removeClass('show-sending-form').addClass('show-form-success');

                    setTimeout(function () {
                        self.reset();
                        self.element.removeClass('show-form-success');
                        self.submit_button.back_to_initial_state();
                    }, 4000);
                });
            },
            _gather_data: function (data) {
                data.flat_id = this.flat_id;
                return data;
            },
            on_complete: function () {
                window.weborama.add(3);
            }
        });

    }, { "../lib/ForceForm": 5, "./SuperSubmitButton": 42, "jquery": 52 }], 40: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'SearchBox',
            create: function () {
                var self = this;

                this.is_active = false;

                this.iText = this.element.find('input[name=text]');
                this.trigger = this.element.find('.js-search-trigger');

                this.trigger.click(function () {
                    self.is_active = true;
                    self.element.addClass('active');
                    self.iText.focus();
                });

                this.iText.bind('focus blur', function (e) {
                    self.handle_input(e);
                });

                this.element.bind('submit', function (e) {
                    self.submit(e);
                });
            },
            handle_input: function (e) {
                switch (e.type) {
                    case 'focus':
                        this.is_active = true;
                        this.element.addClass('active');
                        break;
                    case 'blur':
                        // this.is_active = false;
                        // this.element.removeClass('active');
                        // this.iText.val('');
                        break;
                }
            },
            submit: function () {
                // in fact there is nothing to do here
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 41: [function (require, module, exports) {
        'use sctrict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'SideJoker',
            create: function () {
                var self = this;

                this.with_parallax = typeof window.parallax_enabled !== 'undefined' ? window.parallax_enabled : false;

                this.current_transform = 'translateY(0)';
                this.scrollStartAt = 0;
                this.max_translateY = 0;

                this.joker_box = this.element.find('.js-joker-box');
                this.joker = this.joker_box.find('img');

                if (this.with_parallax) {
                    window.app.add_resize(this);
                    window.app.add_scroll(this);
                }
            },
            resize: function () {
                this.element.css({ transform: null });
                this.scrollStartAt = this.element.offset().top - $(window).height();
                this.max_translateY = $(window).height() * 0.5;
                this.element.css({ transform: this.current_transform });
            },
            scroll: function (scrollTop) {
                if (window.contentFixed || scrollTop < this.scrollStartAt) {
                    return;
                }

                var translateY = Math.min(this.max_translateY, Math.round((scrollTop - this.scrollStartAt) / 10));
                this.current_transform = 'translateY(' + translateY + 'px)';
                this.element.css({ transform: this.current_transform });
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 42: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass');

        module.exports = MinimalClass.extend({
            __className: 'SuperSubmitButton',
            lang: {
                ru: {
                    checks: 'ГОТОВО'
                },
                en: {
                    checks: 'DONE'
                }
            },
            create: function () {
                var self = this;

                this.shoudStop = false;
                this.step = false;
                this.busy = false;

                var tEvt = this.transitionEndEventName();

                this.element.addClass('idle');

                this.caption = this.element.find('.js-caption');
                this.line = this.element.find('.js-line');
                this.check = this.element.find('.js-check');
                this.check.append($('<div>').addClass('done').html(this.lang[$('html').attr('lang')].checks));

                this.caption.addClass('animated').find('span').bind(tEvt, function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'transform':
                            if (self.step == 1) {
                                self.caption.removeClass('animated');
                                setTimeout(function () {
                                    self.caption.removeClass('hide').addClass('on-the-left');
                                    setTimeout(function () {
                                        self.caption.addClass('animated');
                                    }, 50);
                                }, 50);

                                self.set_step(2);
                                self.line.addClass('cycle-line');
                            } else if (self.step == 6) {
                                self.returned_to_initial_state();
                            }
                            break;
                    }
                });

                this.line.find('.line').bind(tEvt, function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'transform':
                            self.line.removeClass('cycle-line');
                            if (self.step == 2) {
                                setTimeout(function () {
                                    self.line.addClass('cycle-line');
                                }, 10);
                                if (self.shoudStop) {
                                    setTimeout(function () {
                                        self.set_step(4);
                                        self.check.addClass('show');
                                    }, 250);
                                }
                            }
                            break;
                    }
                });

                this.check.find('svg').bind(tEvt, function (e) {
                    if (e.target !== this) return;
                    switch (e.originalEvent.propertyName) {
                        case 'stroke-dashoffset':
                            if (self.step == 4) {
                                self.complete();
                            }
                            break;
                    }
                });
            },
            set_step: function (step) {
                this.step = step;
                // console.log(step);
            },
            back_to_initial_state: function (quick, cb) {
                this.set_step(6);
                this.onReturn = cb;

                if (quick) {
                    this.check.removeClass('show');
                    this.line.removeClass('cycle-line');
                    this.element.removeClass('hide-lines').addClass('idle');
                    this.caption.removeClass('hide on-the-left').addClass('animated');
                } else {
                    this.check.removeClass('show');
                    this.element.removeClass('hide-lines').addClass('idle');
                    this.caption.removeClass('on-the-left');
                }
            },
            returned_to_initial_state: function () {
                this.set_step(7);
                this.busy = false;
                if (typeof this.onReturn === 'function') {
                    this.onReturn(this);
                }
            },
            stop_animation: function (cb) {
                this.shoudStop = true;
                this.onComplete = cb;
            },
            start_animation: function () {
                this.shoudStop = false;
                this.set_step(1);
                this.busy = true;
                this.element.removeClass('idle').addClass('hide-lines');
                this.caption.addClass('hide');
            },
            complete: function () {
                this.set_step(5);
                if (typeof this.onComplete === 'function') {
                    this.onComplete(this);
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "jquery": 52 }], 43: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            TTKVideoBox = require('./TTKVideoBox'),
            PxLine = require('./PxLine');

        module.exports = MinimalClass.extend({
            __className: 'TTKVideoBox',
            create: function () {
                var self = this;

                var video_box = this.element.find('.js-ttk-video-box');
                if (video_box.length) {
                    this.video_box = new TTKVideoBox({ element: video_box });
                }

                // var px_line = $(this.element).find('.js-px-line');
                // if( px_line.length ) { new PxLine({ element: px_line, _prc_source: this.element }); }

                window.app.add_resize(this);
                window.app.add_scroll(this);
            },
            resize: function () { },
            scroll: function (scrollTop, scrollDir) {
                var rect = this.element[0].getBoundingClientRect();
                var prc = 0,
                    total = window.innerHeight + rect.height;

                if (rect.top > window.innerHeight) prc = 0; else if (rect.top < -rect.height) prc = 1; else prc = 1 - (rect.top + rect.height) / total;

                if (prc >= .1) {
                    this.element.addClass('s-a-a');
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "./PxLine": 38, "./TTKVideoBox": 44, "jquery": 52 }], 44: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            MinimalClass = require('../lib/MinimalClass'),
            VimeoPlayerPopper = require('../lib/VimeoPlayerPopper');

        module.exports = MinimalClass.extend({
            __className: 'TTKVideoBox',
            create: function () {
                var self = this;

                this.opened = false;

                this.video = this.element.find('video');
                this.video = this.video.length ? this.video[0] : false;
                this.video_playing = false;

                this.video_box = this.element.find('.js-video');
                this.play = this.element.find('.js-video-play');
                this.vimeo_id = this.element.attr('vimeo-id');

                this.video_box.click(function () {
                    self.open();
                });

                window.app.add_scroll(this);
            },
            load_vimeo_player: function (open) {
                if (!this.vimeo_id) return false;

                if (!this.player) {
                    var self = this;
                    this.player = new VimeoPlayerPopper({
                        _id: this.vimeo_id, _trigger: this.play, _autoopen: open, _onClose: function (player, e) {
                            self.close();
                        }
                    });
                } else {
                    this.player.open();
                }

                return true;
            },
            open: function () {
                if (!this.vimeo_id) {
                    this.log(this.__className + ': no video player');
                    return false;
                }

                this.load_vimeo_player(true);
                this.opened = true;
                return true;
            },
            close: function () {
                this.opened = false;
            },
            scroll: function (scrollTop) {

                var prc = this.calc_element_scroll_prc(this.element[0]);

                if (prc >= .1 && prc <= .9) {
                    if (!this.video_playing) {
                        this.video && this.video.play();
                        this.video_playing = true;
                    }
                } else if (this.video_playing) {
                    this.video && this.video.pause();
                    this.video_playing = false;
                }
            }
        });

    }, { "../lib/MinimalClass": 11, "../lib/VimeoPlayerPopper": 15, "jquery": 52 }], 45: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            Class = require('class.extend');

        module.exports = Class.extend({
            init: function () {
                this.lz = false;
                window.weborama = this;
            },
            add: function (id) {
                if (!this.lz) {
                    this.lz = $('#LZ');
                    if (!this.lz.length) {
                        this.lz = $('<div></div>', { id: 'LZ' }).addClass('LZ').appendTo($(document.body));
                    }
                }


            }
        });

    }, { "class.extend": 50, "jquery": 52 }], 46: [function (require, module, exports) {
        'use strict';

        var $ = require('jquery'),
            lib = require('../lib/index.js'),
            App = require('../lib/App'),
            RequestForm = require('./RequestForm'),
            CardsSlider = require('./CardsSlider'),
            Interiors = require('./Interiors'),
            BarkliSlider = require('./BarkliSlider'),
            BarkliSliderHouse = require('./BarkliSliderHouse'),
            BarkliMap = require('./BarkliMap'),
            FloatingTitleBox = require('./FloatingTitleBox'),
            IndexScreen = require('./IndexScreen'),
            SideJoker = require('./SideJoker'),
            Office = require('./Office'),
            VimeoPlayer = require('../lib/VimeoPlayer'),
            TTKGallery = require('./TTKGallery'),
            Building = require('./Building'),
            Loader = require('../lib/Loader');

        (function () {

            window.parallax_enabled = false;
            if (window.parallax_enabled) {
                $(document.body).addClass('with-animation');
            }

            new App();

            $('.js-scroll-down').each(function (i, elm) {
                $(elm).click(function (e) {
                    $('html, body').animate({ scrollTop: $(window).height() }, 'slow');
                });
            });

            $('.js-side-joker').each(function (i, elm) {
                new SideJoker({ element: elm });
            });

            $('.js-index-request-form').each(function (i, elm) {
                new RequestForm({ element: elm });
            });

            $('.js-interiors').each(function (i, elm) {
                new Interiors({ element: elm });
            });

            $('.js-ttk-gallery').each(function (i, elm) {
                new TTKGallery({ element: elm });
            });
            $('.js-barkli-map').each(function (i, elm) {
                new BarkliMap({ element: elm });
            });

            $('.js-floating-title-box').each(function (i, elm) {
                new FloatingTitleBox({ element: elm });
            });

            $('.js-wide-slider').each(function (i, elm) {
                new BarkliSlider({ element: elm, _autotimer: true });
            });

            $('.js-renders-slider').each(function (i, elm) {
                new BarkliSliderHouse({ element: elm, _autotimer: true });
            });

            $('.js-office').each(function (i, elm) {
                new Office({ element: elm });
            });

            $('.js-cards-slider').each(function (i, elm) {
                new CardsSlider({ element: elm });
            });

            $('.js-building').each(function (i, elm) {
                new Building({ element: elm });
            });

            // $('.ko-link').css('left', $('.ko-js').offset().left);

            // $(window).resize(function () {
            //     $('.ko-link').css('left', $('.ko-js').offset().left);
            // });

            $('.js-bg-floater').click(function (e) {
                e.preventDefault();
            });
        })();

    }, { "../lib/App": 1, "../lib/Loader": 10, "../lib/VimeoPlayer": 14, "../lib/index.js": 16, "./BarkliMap": 19, "./BarkliSlider": 21, "./BarkliSliderHouse": 22, "./Building": 23, "./CardsSlider": 25, "./FloatingTitleBox": 28, "./IndexScreen": 30, "./Interiors": 31, "./Office": 34, "./RequestForm": 39, "./SideJoker": 41, "./TTKGallery": 43, "jquery": 52 }], 47: [function (require, module, exports) {
        'use strict';

        module.exports = function (opt) {
            var styles = [{
                "featureType": "landscape",
                "elementType": "all",
                "stylers": [{
                    "saturation": "-44"
                }, {
                    "lightness": "-6"
                }, {
                    "gamma": "3.31"
                }, {
                    "visibility": "simplified"
                }, {
                    "weight": "1.61"
                }]
            }, {
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#e1e9e9"
                }]
            }, {
                "featureType": "poi",
                "elementType": "geometry.fill",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "color": "#ededed"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{
                    "lightness": 100
                }, {
                    "visibility": "simplified"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels",
                "stylers": [{
                    "visibility": "on"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text",
                "stylers": [{
                    "color": "#b6b6b6"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{
                    "visibility": "on"
                }, {
                    "lightness": 700
                }]
            }, {
                "featureType": "water",
                "elementType": "all",
                "stylers": [{
                    "color": "#ceeded"
                }]
            }];

            if (opt && opt.nopoi) {
                styles.push({
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                });
            }

            return styles;
        };

    }, {}], 48: [function (require, module, exports) {
        (function (global) {
            /*! @vimeo/player v2.1.0 | (c) 2017 Vimeo | MIT License | https://github.com/vimeo/player.js */
            (function (global, factory) {
                typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
                    typeof define === 'function' && define.amd ? define(factory) :
                        (global.Vimeo = global.Vimeo || {}, global.Vimeo.Player = factory());
            }(this, (function () {
                'use strict';

                var arrayIndexOfSupport = typeof Array.prototype.indexOf !== 'undefined';
                var postMessageSupport = typeof window.postMessage !== 'undefined';

                if (!arrayIndexOfSupport || !postMessageSupport) {
                    throw new Error('Sorry, the Vimeo Player API is not available in this browser.');
                }

                var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





                function createCommonjsModule(fn, module) {
                    return module = { exports: {} }, fn(module, module.exports), module.exports;
                }

                var index = createCommonjsModule(function (module, exports) {
                    (function (exports) {
                        'use strict';
                        //shared pointer

                        var i;
                        //shortcuts
                        var defineProperty = Object.defineProperty,
                            is = function is(a, b) {
                                return a === b || a !== a && b !== b;
                            };

                        //Polyfill global objects
                        if (typeof WeakMap == 'undefined') {
                            exports.WeakMap = createCollection({
                                // WeakMap#delete(key:void*):boolean
                                'delete': sharedDelete,
                                // WeakMap#clear():
                                clear: sharedClear,
                                // WeakMap#get(key:void*):void*
                                get: sharedGet,
                                // WeakMap#has(key:void*):boolean
                                has: mapHas,
                                // WeakMap#set(key:void*, value:void*):void
                                set: sharedSet
                            }, true);
                        }

                        if (typeof Map == 'undefined' || typeof new Map().values !== 'function' || !new Map().values().next) {
                            exports.Map = createCollection({
                                // WeakMap#delete(key:void*):boolean
                                'delete': sharedDelete,
                                //:was Map#get(key:void*[, d3fault:void*]):void*
                                // Map#has(key:void*):boolean
                                has: mapHas,
                                // Map#get(key:void*):boolean
                                get: sharedGet,
                                // Map#set(key:void*, value:void*):void
                                set: sharedSet,
                                // Map#keys(void):Iterator
                                keys: sharedKeys,
                                // Map#values(void):Iterator
                                values: sharedValues,
                                // Map#entries(void):Iterator
                                entries: mapEntries,
                                // Map#forEach(callback:Function, context:void*):void ==> callback.call(context, key, value, mapObject) === not in specs`
                                forEach: sharedForEach,
                                // Map#clear():
                                clear: sharedClear
                            });
                        }

                        if (typeof Set == 'undefined' || typeof new Set().values !== 'function' || !new Set().values().next) {
                            exports.Set = createCollection({
                                // Set#has(value:void*):boolean
                                has: setHas,
                                // Set#add(value:void*):boolean
                                add: sharedAdd,
                                // Set#delete(key:void*):boolean
                                'delete': sharedDelete,
                                // Set#clear():
                                clear: sharedClear,
                                // Set#keys(void):Iterator
                                keys: sharedValues, // specs actually say "the same function object as the initial value of the values property"
                                // Set#values(void):Iterator
                                values: sharedValues,
                                // Set#entries(void):Iterator
                                entries: setEntries,
                                // Set#forEach(callback:Function, context:void*):void ==> callback.call(context, value, index) === not in specs
                                forEach: sharedForEach
                            });
                        }

                        if (typeof WeakSet == 'undefined') {
                            exports.WeakSet = createCollection({
                                // WeakSet#delete(key:void*):boolean
                                'delete': sharedDelete,
                                // WeakSet#add(value:void*):boolean
                                add: sharedAdd,
                                // WeakSet#clear():
                                clear: sharedClear,
                                // WeakSet#has(value:void*):boolean
                                has: setHas
                            }, true);
                        }

                        /**
                         * ES6 collection constructor
                         * @return {Function} a collection class
                         */
                        function createCollection(proto, objectOnly) {
                            function Collection(a) {
                                if (!this || this.constructor !== Collection) return new Collection(a);
                                this._keys = [];
                                this._values = [];
                                this._itp = []; // iteration pointers
                                this.objectOnly = objectOnly;

                                //parse initial iterable argument passed
                                if (a) init.call(this, a);
                            }

                            //define size for non object-only collections
                            if (!objectOnly) {
                                defineProperty(proto, 'size', {
                                    get: sharedSize
                                });
                            }

                            //set prototype
                            proto.constructor = Collection;
                            Collection.prototype = proto;

                            return Collection;
                        }

                        /** parse initial iterable argument passed */
                        function init(a) {
                            var i;
                            //init Set argument, like `[1,2,3,{}]`
                            if (this.add) a.forEach(this.add, this);
                            //init Map argument like `[[1,2], [{}, 4]]`
                            else a.forEach(function (a) {
                                this.set(a[0], a[1]);
                            }, this);
                        }

                        /** delete */
                        function sharedDelete(key) {
                            if (this.has(key)) {
                                this._keys.splice(i, 1);
                                this._values.splice(i, 1);
                                // update iteration pointers
                                this._itp.forEach(function (p) {
                                    if (i < p[0]) p[0]--;
                                });
                            }
                            // Aurora here does it while Canary doesn't
                            return -1 < i;
                        }

                        function sharedGet(key) {
                            return this.has(key) ? this._values[i] : undefined;
                        }

                        function has(list, key) {
                            if (this.objectOnly && key !== Object(key)) throw new TypeError("Invalid value used as weak collection key");
                            //NaN or 0 passed
                            if (key != key || key === 0) for (i = list.length; i-- && !is(list[i], key);) { } else i = list.indexOf(key);
                            return -1 < i;
                        }

                        function setHas(value) {
                            return has.call(this, this._values, value);
                        }

                        function mapHas(value) {
                            return has.call(this, this._keys, value);
                        }

                        /** @chainable */
                        function sharedSet(key, value) {
                            this.has(key) ? this._values[i] = value : this._values[this._keys.push(key) - 1] = value;
                            return this;
                        }

                        /** @chainable */
                        function sharedAdd(value) {
                            if (!this.has(value)) this._values.push(value);
                            return this;
                        }

                        function sharedClear() {
                            (this._keys || 0).length = this._values.length = 0;
                        }

                        /** keys, values, and iterate related methods */
                        function sharedKeys() {
                            return sharedIterator(this._itp, this._keys);
                        }

                        function sharedValues() {
                            return sharedIterator(this._itp, this._values);
                        }

                        function mapEntries() {
                            return sharedIterator(this._itp, this._keys, this._values);
                        }

                        function setEntries() {
                            return sharedIterator(this._itp, this._values, this._values);
                        }

                        function sharedIterator(itp, array, array2) {
                            var p = [0],
                                done = false;
                            itp.push(p);
                            return {
                                next: function next() {
                                    var v,
                                        k = p[0];
                                    if (!done && k < array.length) {
                                        v = array2 ? [array[k], array2[k]] : array[k];
                                        p[0]++;
                                    } else {
                                        done = true;
                                        itp.splice(itp.indexOf(p), 1);
                                    }
                                    return { done: done, value: v };
                                }
                            };
                        }

                        function sharedSize() {
                            return this._values.length;
                        }

                        function sharedForEach(callback, context) {
                            var it = this.entries();
                            for (; ;) {
                                var r = it.next();
                                if (r.done) break;
                                callback.call(context, r.value[1], r.value[0], this);
                            }
                        }
                    })('object' != 'undefined' && typeof commonjsGlobal != 'undefined' ? commonjsGlobal : window);
                });

                var npo_src = createCommonjsModule(function (module) {
                    var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

                    /*! Native Promise Only
                        v0.8.1 (c) Kyle Simpson
                        MIT License: http://getify.mit-license.org
                    */

                    (function UMD(name, context, definition) {
                        // special form of UMD for polyfilling across evironments
                        context[name] = context[name] || definition();
                        if ('object' != "undefined" && module.exports) {
                            module.exports = context[name];
                        } else if (typeof undefined == "function" && undefined.amd) {
                            undefined(function $AMD$() {
                                return context[name];
                            });
                        }
                    })("Promise", typeof commonjsGlobal != "undefined" ? commonjsGlobal : commonjsGlobal, function DEF() {
                        /*jshint validthis:true */
                        "use strict";

                        var builtInProp,
                            cycle,
                            scheduling_queue,
                            ToString = Object.prototype.toString,
                            timer = typeof setImmediate != "undefined" ? function timer(fn) {
                                return setImmediate(fn);
                            } : setTimeout;

                        // dammit, IE8.
                        try {
                            Object.defineProperty({}, "x", {});
                            builtInProp = function builtInProp(obj, name, val, config) {
                                return Object.defineProperty(obj, name, {
                                    value: val,
                                    writable: true,
                                    configurable: config !== false
                                });
                            };
                        } catch (err) {
                            builtInProp = function builtInProp(obj, name, val) {
                                obj[name] = val;
                                return obj;
                            };
                        }

                        // Note: using a queue instead of array for efficiency
                        scheduling_queue = function Queue() {
                            var first, last, item;

                            function Item(fn, self) {
                                this.fn = fn;
                                this.self = self;
                                this.next = void 0;
                            }

                            return {
                                add: function add(fn, self) {
                                    item = new Item(fn, self);
                                    if (last) {
                                        last.next = item;
                                    } else {
                                        first = item;
                                    }
                                    last = item;
                                    item = void 0;
                                },
                                drain: function drain() {
                                    var f = first;
                                    first = last = cycle = void 0;

                                    while (f) {
                                        f.fn.call(f.self);
                                        f = f.next;
                                    }
                                }
                            };
                        }();

                        function schedule(fn, self) {
                            scheduling_queue.add(fn, self);
                            if (!cycle) {
                                cycle = timer(scheduling_queue.drain);
                            }
                        }

                        // promise duck typing
                        function isThenable(o) {
                            var _then,
                                o_type = typeof o === "undefined" ? "undefined" : _typeof(o);

                            if (o != null && (o_type == "object" || o_type == "function")) {
                                _then = o.then;
                            }
                            return typeof _then == "function" ? _then : false;
                        }

                        function notify() {
                            for (var i = 0; i < this.chain.length; i++) {
                                notifyIsolated(this, this.state === 1 ? this.chain[i].success : this.chain[i].failure, this.chain[i]);
                            }
                            this.chain.length = 0;
                        }

                        // NOTE: This is a separate function to isolate
                        // the `try..catch` so that other code can be
                        // optimized better
                        function notifyIsolated(self, cb, chain) {
                            var ret, _then;
                            try {
                                if (cb === false) {
                                    chain.reject(self.msg);
                                } else {
                                    if (cb === true) {
                                        ret = self.msg;
                                    } else {
                                        ret = cb.call(void 0, self.msg);
                                    }

                                    if (ret === chain.promise) {
                                        chain.reject(TypeError("Promise-chain cycle"));
                                    } else if (_then = isThenable(ret)) {
                                        _then.call(ret, chain.resolve, chain.reject);
                                    } else {
                                        chain.resolve(ret);
                                    }
                                }
                            } catch (err) {
                                chain.reject(err);
                            }
                        }

                        function resolve(msg) {
                            var _then,
                                self = this;

                            // already triggered?
                            if (self.triggered) {
                                return;
                            }

                            self.triggered = true;

                            // unwrap
                            if (self.def) {
                                self = self.def;
                            }

                            try {
                                if (_then = isThenable(msg)) {
                                    schedule(function () {
                                        var def_wrapper = new MakeDefWrapper(self);
                                        try {
                                            _then.call(msg, function $resolve$() {
                                                resolve.apply(def_wrapper, arguments);
                                            }, function $reject$() {
                                                reject.apply(def_wrapper, arguments);
                                            });
                                        } catch (err) {
                                            reject.call(def_wrapper, err);
                                        }
                                    });
                                } else {
                                    self.msg = msg;
                                    self.state = 1;
                                    if (self.chain.length > 0) {
                                        schedule(notify, self);
                                    }
                                }
                            } catch (err) {
                                reject.call(new MakeDefWrapper(self), err);
                            }
                        }

                        function reject(msg) {
                            var self = this;

                            // already triggered?
                            if (self.triggered) {
                                return;
                            }

                            self.triggered = true;

                            // unwrap
                            if (self.def) {
                                self = self.def;
                            }

                            self.msg = msg;
                            self.state = 2;
                            if (self.chain.length > 0) {
                                schedule(notify, self);
                            }
                        }

                        function iteratePromises(Constructor, arr, resolver, rejecter) {
                            for (var idx = 0; idx < arr.length; idx++) {
                                (function IIFE(idx) {
                                    Constructor.resolve(arr[idx]).then(function $resolver$(msg) {
                                        resolver(idx, msg);
                                    }, rejecter);
                                })(idx);
                            }
                        }

                        function MakeDefWrapper(self) {
                            this.def = self;
                            this.triggered = false;
                        }

                        function MakeDef(self) {
                            this.promise = self;
                            this.state = 0;
                            this.triggered = false;
                            this.chain = [];
                            this.msg = void 0;
                        }

                        function Promise(executor) {
                            if (typeof executor != "function") {
                                throw TypeError("Not a function");
                            }

                            if (this.__NPO__ !== 0) {
                                throw TypeError("Not a promise");
                            }

                            // instance shadowing the inherited "brand"
                            // to signal an already "initialized" promise
                            this.__NPO__ = 1;

                            var def = new MakeDef(this);

                            this["then"] = function then(success, failure) {
                                var o = {
                                    success: typeof success == "function" ? success : true,
                                    failure: typeof failure == "function" ? failure : false
                                };
                                // Note: `then(..)` itself can be borrowed to be used against
                                // a different promise constructor for making the chained promise,
                                // by substituting a different `this` binding.
                                o.promise = new this.constructor(function extractChain(resolve, reject) {
                                    if (typeof resolve != "function" || typeof reject != "function") {
                                        throw TypeError("Not a function");
                                    }

                                    o.resolve = resolve;
                                    o.reject = reject;
                                });
                                def.chain.push(o);

                                if (def.state !== 0) {
                                    schedule(notify, def);
                                }

                                return o.promise;
                            };
                            this["catch"] = function $catch$(failure) {
                                return this.then(void 0, failure);
                            };

                            try {
                                executor.call(void 0, function publicResolve(msg) {
                                    resolve.call(def, msg);
                                }, function publicReject(msg) {
                                    reject.call(def, msg);
                                });
                            } catch (err) {
                                reject.call(def, err);
                            }
                        }

                        var PromisePrototype = builtInProp({}, "constructor", Promise,
        /*configurable=*/false);

                        // Note: Android 4 cannot use `Object.defineProperty(..)` here
                        Promise.prototype = PromisePrototype;

                        // built-in "brand" to signal an "uninitialized" promise
                        builtInProp(PromisePrototype, "__NPO__", 0,
        /*configurable=*/false);

                        builtInProp(Promise, "resolve", function Promise$resolve(msg) {
                            var Constructor = this;

                            // spec mandated checks
                            // note: best "isPromise" check that's practical for now
                            if (msg && (typeof msg === "undefined" ? "undefined" : _typeof(msg)) == "object" && msg.__NPO__ === 1) {
                                return msg;
                            }

                            return new Constructor(function executor(resolve, reject) {
                                if (typeof resolve != "function" || typeof reject != "function") {
                                    throw TypeError("Not a function");
                                }

                                resolve(msg);
                            });
                        });

                        builtInProp(Promise, "reject", function Promise$reject(msg) {
                            return new this(function executor(resolve, reject) {
                                if (typeof resolve != "function" || typeof reject != "function") {
                                    throw TypeError("Not a function");
                                }

                                reject(msg);
                            });
                        });

                        builtInProp(Promise, "all", function Promise$all(arr) {
                            var Constructor = this;

                            // spec mandated checks
                            if (ToString.call(arr) != "[object Array]") {
                                return Constructor.reject(TypeError("Not an array"));
                            }
                            if (arr.length === 0) {
                                return Constructor.resolve([]);
                            }

                            return new Constructor(function executor(resolve, reject) {
                                if (typeof resolve != "function" || typeof reject != "function") {
                                    throw TypeError("Not a function");
                                }

                                var len = arr.length,
                                    msgs = Array(len),
                                    count = 0;

                                iteratePromises(Constructor, arr, function resolver(idx, msg) {
                                    msgs[idx] = msg;
                                    if (++count === len) {
                                        resolve(msgs);
                                    }
                                }, reject);
                            });
                        });

                        builtInProp(Promise, "race", function Promise$race(arr) {
                            var Constructor = this;

                            // spec mandated checks
                            if (ToString.call(arr) != "[object Array]") {
                                return Constructor.reject(TypeError("Not an array"));
                            }

                            return new Constructor(function executor(resolve, reject) {
                                if (typeof resolve != "function" || typeof reject != "function") {
                                    throw TypeError("Not a function");
                                }

                                iteratePromises(Constructor, arr, function resolver(idx, msg) {
                                    resolve(msg);
                                }, reject);
                            });
                        });

                        return Promise;
                    });
                });

                /**
                 * @module lib/callbacks
                 */

                var callbackMap = new WeakMap();

                /**
                 * Store a callback for a method or event for a player.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {Player} player The player object.
                 * @param {string} name The method or event name.
                 * @param {(function(this:Player, *): void|{resolve: function, reject: function})} callback
                 *        The callback to call or an object with resolve and reject functions for a promise.
                 * @return {void}
                 */
                function storeCallback(player, name, callback) {
                    var playerCallbacks = callbackMap.get(player.element) || {};

                    if (!(name in playerCallbacks)) {
                        playerCallbacks[name] = [];
                    }

                    playerCallbacks[name].push(callback);
                    callbackMap.set(player.element, playerCallbacks);
                }

                /**
                 * Get the callbacks for a player and event or method.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {Player} player The player object.
                 * @param {string} name The method or event name
                 * @return {function[]}
                 */
                function getCallbacks(player, name) {
                    var playerCallbacks = callbackMap.get(player.element) || {};
                    return playerCallbacks[name] || [];
                }

                /**
                 * Remove a stored callback for a method or event for a player.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {Player} player The player object.
                 * @param {string} name The method or event name
                 * @param {function} [callback] The specific callback to remove.
                 * @return {boolean} Was this the last callback?
                 */
                function removeCallback(player, name, callback) {
                    var playerCallbacks = callbackMap.get(player.element) || {};

                    if (!playerCallbacks[name]) {
                        return true;
                    }

                    // If no callback is passed, remove all callbacks for the event
                    if (!callback) {
                        playerCallbacks[name] = [];
                        callbackMap.set(player.element, playerCallbacks);

                        return true;
                    }

                    var index = playerCallbacks[name].indexOf(callback);

                    if (index !== -1) {
                        playerCallbacks[name].splice(index, 1);
                    }

                    callbackMap.set(player.element, playerCallbacks);
                    return playerCallbacks[name] && playerCallbacks[name].length === 0;
                }

                /**
                 * Return the first stored callback for a player and event or method.
                 *
                 * @param {Player} player The player object.
                 * @param {string} name The method or event name.
                 * @return {function} The callback, or false if there were none
                 */
                function shiftCallbacks(player, name) {
                    var playerCallbacks = getCallbacks(player, name);

                    if (playerCallbacks.length < 1) {
                        return false;
                    }

                    var callback = playerCallbacks.shift();
                    removeCallback(player, name, callback);
                    return callback;
                }

                /**
                 * Move callbacks associated with an element to another element.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {HTMLElement} oldElement The old element.
                 * @param {HTMLElement} newElement The new element.
                 * @return {void}
                 */
                function swapCallbacks(oldElement, newElement) {
                    var playerCallbacks = callbackMap.get(oldElement);

                    callbackMap.set(newElement, playerCallbacks);
                    callbackMap.delete(oldElement);
                }

                /**
                 * @module lib/functions
                 */

                /**
                 * Get the name of the method for a given getter or setter.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {string} prop The name of the property.
                 * @param {string} type Either “get” or “set”.
                 * @return {string}
                 */
                function getMethodName(prop, type) {
                    if (prop.indexOf(type.toLowerCase()) === 0) {
                        return prop;
                    }

                    return '' + type.toLowerCase() + prop.substr(0, 1).toUpperCase() + prop.substr(1);
                }

                /**
                 * Check to see if the object is a DOM Element.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {*} element The object to check.
                 * @return {boolean}
                 */
                function isDomElement(element) {
                    return element instanceof window.HTMLElement;
                }

                /**
                 * Check to see whether the value is a number.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @see http://dl.dropboxusercontent.com/u/35146/js/tests/isNumber.html
                 * @param {*} value The value to check.
                 * @param {boolean} integer Check if the value is an integer.
                 * @return {boolean}
                 */
                function isInteger(value) {
                    // eslint-disable-next-line eqeqeq
                    return !isNaN(parseFloat(value)) && isFinite(value) && Math.floor(value) == value;
                }

                /**
                 * Check to see if the URL is a Vimeo url.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {string} url The url string.
                 * @return {boolean}
                 */
                function isVimeoUrl(url) {
                    return (/^(https?:)?\/\/((player|www).)?vimeo.com(?=$|\/)/.test(url)
                    );
                }

                /**
                 * Get the Vimeo URL from an element.
                 * The element must have either a data-vimeo-id or data-vimeo-url attribute.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {object} oEmbedParameters The oEmbed parameters.
                 * @return {string}
                 */
                function getVimeoUrl() {
                    var oEmbedParameters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    var id = oEmbedParameters.id;
                    var url = oEmbedParameters.url;
                    var idOrUrl = id || url;

                    if (!idOrUrl) {
                        throw new Error('An id or url must be passed, either in an options object or as a data-vimeo-id or data-vimeo-url attribute.');
                    }

                    if (isInteger(idOrUrl)) {
                        return '' + idOrUrl;
                    }

                    if (isVimeoUrl(idOrUrl)) {
                        return idOrUrl.replace('http:', 'https:');
                    }

                    if (id) {
                        throw new TypeError('\u201C' + id + '\u201D is not a valid video id.');
                    }

                    throw new TypeError('\u201C' + idOrUrl + '\u201D is not a vimeo.com url.');
                }

                /**
                 * @module lib/embed
                 */

                var oEmbedParameters = ['id', 'url', 'width', 'maxwidth', 'height', 'maxheight', 'portrait', 'title', 'byline', 'color', 'autoplay', 'autopause', 'loop', 'responsive'];

                /**
                 * Get the 'data-vimeo'-prefixed attributes from an element as an object.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {HTMLElement} element The element.
                 * @param {Object} [defaults={}] The default values to use.
                 * @return {Object<string, string>}
                 */
                function getOEmbedParameters(element) {
                    var defaults = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                    return oEmbedParameters.reduce(function (params, param) {
                        var value = element.getAttribute('data-vimeo-' + param);

                        if (value || value === '') {
                            params[param] = value === '' ? 1 : value;
                        }

                        return params;
                    }, defaults);
                }

                /**
                 * Make an oEmbed call for the specified URL.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {string} videoUrl The vimeo.com url for the video.
                 * @param {Object} [params] Parameters to pass to oEmbed.
                 * @return {Promise}
                 */
                function getOEmbedData(videoUrl) {
                    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                    return new Promise(function (resolve, reject) {
                        if (!isVimeoUrl(videoUrl)) {
                            throw new TypeError('\u201C' + videoUrl + '\u201D is not a vimeo.com url.');
                        }

                        var url = '' + encodeURIComponent(videoUrl);

                        for (var param in params) {
                            if (params.hasOwnProperty(param)) {
                                url += '&' + param + '=' + encodeURIComponent(params[param]);
                            }
                        }

                        var xhr = 'XDomainRequest' in window ? new XDomainRequest() : new XMLHttpRequest();
                        xhr.open('GET', url, true);

                        xhr.onload = function () {
                            if (xhr.status === 404) {
                                reject(new Error('\u201C' + videoUrl + '\u201D was not found.'));
                                return;
                            }

                            if (xhr.status === 403) {
                                reject(new Error('\u201C' + videoUrl + '\u201D is not embeddable.'));
                                return;
                            }

                            try {
                                var json = JSON.parse(xhr.responseText);
                                resolve(json);
                            } catch (error) {
                                reject(error);
                            }
                        };

                        xhr.onerror = function () {
                            var status = xhr.status ? ' (' + xhr.status + ')' : '';
                            reject(new Error('There was an error fetching the embed code from Vimeo' + status + '.'));
                        };

                        xhr.send();
                    });
                }

                /**
                 * Create an embed from oEmbed data inside an element.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {object} data The oEmbed data.
                 * @param {HTMLElement} element The element to put the iframe in.
                 * @return {HTMLIFrameElement} The iframe embed.
                 */
                function createEmbed(_ref, element) {
                    var html = _ref.html;

                    if (!element) {
                        throw new TypeError('An element must be provided');
                    }

                    if (element.getAttribute('data-vimeo-initialized') !== null) {
                        return element.querySelector('iframe');
                    }

                    var div = document.createElement('div');
                    div.innerHTML = html;

                    element.appendChild(div.firstChild);
                    element.setAttribute('data-vimeo-initialized', 'true');

                    return element.querySelector('iframe');
                }

                /**
                 * Initialize all embeds within a specific element
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {HTMLElement} [parent=document] The parent element.
                 * @return {void}
                 */
                function initializeEmbeds() {
                    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

                    var elements = [].slice.call(parent.querySelectorAll('[data-vimeo-id], [data-vimeo-url]'));

                    var handleError = function handleError(error) {
                        if ('console' in window && console.error) {
                            console.error('There was an error creating an embed: ' + error);
                        }
                    };

                    elements.forEach(function (element) {
                        try {
                            // Skip any that have data-vimeo-defer
                            if (element.getAttribute('data-vimeo-defer') !== null) {
                                return;
                            }

                            var params = getOEmbedParameters(element);
                            var url = getVimeoUrl(params);

                            getOEmbedData(url, params).then(function (data) {
                                return createEmbed(data, element);
                            }).catch(handleError);
                        } catch (error) {
                            handleError(error);
                        }
                    });
                }

                /**
                 * Resize embeds when messaged by the player.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {HTMLElement} [parent=document] The parent element.
                 * @return {void}
                 */
                function resizeEmbeds() {
                    var parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

                    var onMessage = function onMessage(event) {
                        if (!isVimeoUrl(event.origin)) {
                            return;
                        }

                        if (!event.data || event.data.event !== 'spacechange') {
                            return;
                        }

                        var iframes = parent.querySelectorAll('iframe');

                        for (var i = 0; i < iframes.length; i++) {
                            if (iframes[i].contentWindow !== event.source) {
                                continue;
                            }

                            var space = iframes[i].parentElement;

                            if (space && space.className.indexOf('vimeo-space') !== -1) {
                                space.style.paddingBottom = event.data.data[0].bottom + 'px';
                            }

                            break;
                        }
                    };

                    if (window.addEventListener) {
                        window.addEventListener('message', onMessage, false);
                    } else if (window.attachEvent) {
                        window.attachEvent('onmessage', onMessage);
                    }
                }

                /**
                 * @module lib/postmessage
                 */

                /**
                 * Parse a message received from postMessage.
                 *
                 * @param {*} data The data received from postMessage.
                 * @return {object}
                 */
                function parseMessageData(data) {
                    if (typeof data === 'string') {
                        data = JSON.parse(data);
                    }

                    return data;
                }

                /**
                 * Post a message to the specified target.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {Player} player The player object to use.
                 * @param {string} method The API method to call.
                 * @param {object} params The parameters to send to the player.
                 * @return {void}
                 */
                function postMessage(player, method, params) {
                    if (!player.element.contentWindow || !player.element.contentWindow.postMessage) {
                        return;
                    }

                    var message = {
                        method: method
                    };

                    if (params !== undefined) {
                        message.value = params;
                    }

                    // IE 8 and 9 do not support passing messages, so stringify them
                    var ieVersion = parseFloat(navigator.userAgent.toLowerCase().replace(/^.*msie (\d+).*$/, '$1'));
                    if (ieVersion >= 8 && ieVersion < 10) {
                        message = JSON.stringify(message);
                    }

                    player.element.contentWindow.postMessage(message, player.origin);
                }

                /**
                 * Parse the data received from a message event.
                 *
                 * @author Brad Dougherty <brad@vimeo.com>
                 * @param {Player} player The player that received the message.
                 * @param {(Object|string)} data The message data. Strings will be parsed into JSON.
                 * @return {void}
                 */
                function processData(player, data) {
                    data = parseMessageData(data);
                    var callbacks = [];
                    var param = void 0;

                    if (data.event) {
                        if (data.event === 'error') {
                            var promises = getCallbacks(player, data.data.method);

                            promises.forEach(function (promise) {
                                var error = new Error(data.data.message);
                                error.name = data.data.name;

                                promise.reject(error);
                                removeCallback(player, data.data.method, promise);
                            });
                        }

                        callbacks = getCallbacks(player, 'event:' + data.event);
                        param = data.data;
                    } else if (data.method) {
                        var callback = shiftCallbacks(player, data.method);

                        if (callback) {
                            callbacks.push(callback);
                            param = data.value;
                        }
                    }

                    callbacks.forEach(function (callback) {
                        try {
                            if (typeof callback === 'function') {
                                callback.call(player, param);
                                return;
                            }

                            callback.resolve(param);
                        } catch (e) {
                            // empty
                        }
                    });
                }

                var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

                function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

                var playerMap = new WeakMap();
                var readyMap = new WeakMap();

                var Player = function () {
                    /**
                    * Create a Player.
                    *
                    * @author Brad Dougherty <brad@vimeo.com>
                    * @param {(HTMLIFrameElement|HTMLElement|string|jQuery)} element A reference to the Vimeo
                    *        player iframe, and id, or a jQuery object.
                    * @param {object} [options] oEmbed parameters to use when creating an embed in the element.
                    * @return {Player}
                    */
                    function Player(element) {
                        var _this = this;

                        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                        _classCallCheck(this, Player);

                        /* global jQuery */
                        if (window.jQuery && element instanceof jQuery) {
                            if (element.length > 1 && window.console && console.warn) {
                                console.warn('A jQuery object with multiple elements was passed, using the first element.');
                            }

                            element = element[0];
                        }

                        // Find an element by ID
                        if (typeof element === 'string') {
                            element = document.getElementById(element);
                        }

                        // Not an element!
                        if (!isDomElement(element)) {
                            throw new TypeError('You must pass either a valid element or a valid id.');
                        }

                        // Already initialized an embed in this div, so grab the iframe
                        if (element.nodeName !== 'IFRAME') {
                            var iframe = element.querySelector('iframe');

                            if (iframe) {
                                element = iframe;
                            }
                        }

                        // iframe url is not a Vimeo url
                        if (element.nodeName === 'IFRAME' && !isVimeoUrl(element.getAttribute('src') || '')) {
                            throw new Error('The player element passed isn’t a Vimeo embed.');
                        }

                        // If there is already a player object in the map, return that
                        if (playerMap.has(element)) {
                            return playerMap.get(element);
                        }

                        this.element = element;
                        this.origin = '*';

                        var readyPromise = new npo_src(function (resolve, reject) {
                            var onMessage = function onMessage(event) {
                                if (!isVimeoUrl(event.origin) || _this.element.contentWindow !== event.source) {
                                    return;
                                }

                                if (_this.origin === '*') {
                                    _this.origin = event.origin;
                                }

                                var data = parseMessageData(event.data);
                                var isReadyEvent = 'event' in data && data.event === 'ready';
                                var isPingResponse = 'method' in data && data.method === 'ping';

                                if (isReadyEvent || isPingResponse) {
                                    _this.element.setAttribute('data-ready', 'true');
                                    resolve();
                                    return;
                                }

                                processData(_this, data);
                            };

                            if (window.addEventListener) {
                                window.addEventListener('message', onMessage, false);
                            } else if (window.attachEvent) {
                                window.attachEvent('onmessage', onMessage);
                            }

                            if (_this.element.nodeName !== 'IFRAME') {
                                var params = getOEmbedParameters(element, options);
                                var url = getVimeoUrl(params);

                                getOEmbedData(url, params).then(function (data) {
                                    var iframe = createEmbed(data, element);
                                    _this.element = iframe;

                                    swapCallbacks(element, iframe);
                                    playerMap.set(_this.element, _this);

                                    return data;
                                }).catch(function (error) {
                                    return reject(error);
                                });
                            }
                        });

                        // Store a copy of this Player in the map
                        readyMap.set(this, readyPromise);
                        playerMap.set(this.element, this);

                        // Send a ping to the iframe so the ready promise will be resolved if
                        // the player is already ready.
                        if (this.element.nodeName === 'IFRAME') {
                            postMessage(this, 'ping');
                        }

                        return this;
                    }

                    /**
                     * Get a promise for a method.
                     *
                     * @author Brad Dougherty <brad@vimeo.com>
                     * @param {string} name The API method to call.
                     * @param {Object} [args={}] Arguments to send via postMessage.
                     * @return {Promise}
                     */


                    _createClass(Player, [{
                        key: 'callMethod',
                        value: function callMethod(name) {
                            var _this2 = this;

                            var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                            return new npo_src(function (resolve, reject) {
                                // We are storing the resolve/reject handlers to call later, so we
                                // can’t return here.
                                // eslint-disable-next-line promise/always-return
                                return _this2.ready().then(function () {
                                    storeCallback(_this2, name, {
                                        resolve: resolve,
                                        reject: reject
                                    });

                                    postMessage(_this2, name, args);
                                });
                            });
                        }

                        /**
                         * Get a promise for the value of a player property.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} name The property name
                         * @return {Promise}
                         */

                    }, {
                        key: 'get',
                        value: function get(name) {
                            var _this3 = this;

                            return new npo_src(function (resolve, reject) {
                                name = getMethodName(name, 'get');

                                // We are storing the resolve/reject handlers to call later, so we
                                // can’t return here.
                                // eslint-disable-next-line promise/always-return
                                return _this3.ready().then(function () {
                                    storeCallback(_this3, name, {
                                        resolve: resolve,
                                        reject: reject
                                    });

                                    postMessage(_this3, name);
                                });
                            });
                        }

                        /**
                         * Get a promise for setting the value of a player property.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} name The API method to call.
                         * @param {mixed} value The value to set.
                         * @return {Promise}
                         */

                    }, {
                        key: 'set',
                        value: function set(name, value) {
                            var _this4 = this;

                            return npo_src.resolve(value).then(function (val) {
                                name = getMethodName(name, 'set');

                                if (val === undefined || val === null) {
                                    throw new TypeError('There must be a value to set.');
                                }

                                return _this4.ready().then(function () {
                                    return new npo_src(function (resolve, reject) {
                                        storeCallback(_this4, name, {
                                            resolve: resolve,
                                            reject: reject
                                        });

                                        postMessage(_this4, name, val);
                                    });
                                });
                            });
                        }

                        /**
                         * Add an event listener for the specified event. Will call the
                         * callback with a single parameter, `data`, that contains the data for
                         * that event.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} eventName The name of the event.
                         * @param {function(*)} callback The function to call when the event fires.
                         * @return {void}
                         */

                    }, {
                        key: 'on',
                        value: function on(eventName, callback) {
                            if (!eventName) {
                                throw new TypeError('You must pass an event name.');
                            }

                            if (!callback) {
                                throw new TypeError('You must pass a callback function.');
                            }

                            if (typeof callback !== 'function') {
                                throw new TypeError('The callback must be a function.');
                            }

                            var callbacks = getCallbacks(this, 'event:' + eventName);
                            if (callbacks.length === 0) {
                                this.callMethod('addEventListener', eventName).catch(function () {
                                    // Ignore the error. There will be an error event fired that
                                    // will trigger the error callback if they are listening.
                                });
                            }

                            storeCallback(this, 'event:' + eventName, callback);
                        }

                        /**
                         * Remove an event listener for the specified event. Will remove all
                         * listeners for that event if a `callback` isn’t passed, or only that
                         * specific callback if it is passed.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} eventName The name of the event.
                         * @param {function} [callback] The specific callback to remove.
                         * @return {void}
                         */

                    }, {
                        key: 'off',
                        value: function off(eventName, callback) {
                            if (!eventName) {
                                throw new TypeError('You must pass an event name.');
                            }

                            if (callback && typeof callback !== 'function') {
                                throw new TypeError('The callback must be a function.');
                            }

                            var lastCallback = removeCallback(this, 'event:' + eventName, callback);

                            // If there are no callbacks left, remove the listener
                            if (lastCallback) {
                                this.callMethod('removeEventListener', eventName).catch(function (e) {
                                    // Ignore the error. There will be an error event fired that
                                    // will trigger the error callback if they are listening.
                                });
                            }
                        }

                        /**
                         * A promise to load a new video.
                         *
                         * @promise LoadVideoPromise
                         * @fulfill {number} The video with this id successfully loaded.
                         * @reject {TypeError} The id was not a number.
                         */
                        /**
                         * Load a new video into this embed. The promise will be resolved if
                         * the video is successfully loaded, or it will be rejected if it could
                         * not be loaded.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {number} id The id of the video.
                         * @return {LoadVideoPromise}
                         */

                    }, {
                        key: 'loadVideo',
                        value: function loadVideo(id) {
                            return this.callMethod('loadVideo', id);
                        }

                        /**
                         * A promise to perform an action when the Player is ready.
                         *
                         * @todo document errors
                         * @promise LoadVideoPromise
                         * @fulfill {void}
                         */
                        /**
                         * Trigger a function when the player iframe has initialized. You do not
                         * need to wait for `ready` to trigger to begin adding event listeners
                         * or calling other methods.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {ReadyPromise}
                         */

                    }, {
                        key: 'ready',
                        value: function ready() {
                            var readyPromise = readyMap.get(this);
                            return npo_src.resolve(readyPromise);
                        }

                        /**
                         * A promise to add a cue point to the player.
                         *
                         * @promise AddCuePointPromise
                         * @fulfill {string} The id of the cue point to use for removeCuePoint.
                         * @reject {RangeError} the time was less than 0 or greater than the
                         *         video’s duration.
                         * @reject {UnsupportedError} Cue points are not supported with the current
                         *         player or browser.
                         */
                        /**
                         * Add a cue point to the player.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {number} time The time for the cue point.
                         * @param {object} [data] Arbitrary data to be returned with the cue point.
                         * @return {AddCuePointPromise}
                         */

                    }, {
                        key: 'addCuePoint',
                        value: function addCuePoint(time) {
                            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                            return this.callMethod('addCuePoint', { time: time, data: data });
                        }

                        /**
                         * A promise to remove a cue point from the player.
                         *
                         * @promise AddCuePointPromise
                         * @fulfill {string} The id of the cue point that was removed.
                         * @reject {InvalidCuePoint} The cue point with the specified id was not
                         *         found.
                         * @reject {UnsupportedError} Cue points are not supported with the current
                         *         player or browser.
                         */
                        /**
                         * Remove a cue point from the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} id The id of the cue point to remove.
                         * @return {RemoveCuePointPromise}
                         */

                    }, {
                        key: 'removeCuePoint',
                        value: function removeCuePoint(id) {
                            return this.callMethod('removeCuePoint', id);
                        }

                        /**
                         * A representation of a text track on a video.
                         *
                         * @typedef {Object} VimeoTextTrack
                         * @property {string} language The ISO language code.
                         * @property {string} kind The kind of track it is (captions or subtitles).
                         * @property {string} label The human‐readable label for the track.
                         */
                        /**
                         * A promise to enable a text track.
                         *
                         * @promise EnableTextTrackPromise
                         * @fulfill {VimeoTextTrack} The text track that was enabled.
                         * @reject {InvalidTrackLanguageError} No track was available with the
                         *         specified language.
                         * @reject {InvalidTrackError} No track was available with the specified
                         *         language and kind.
                         */
                        /**
                         * Enable the text track with the specified language, and optionally the
                         * specified kind (captions or subtitles).
                         *
                         * When set via the API, the track language will not change the viewer’s
                         * stored preference.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} language The two‐letter language code.
                         * @param {string} [kind] The kind of track to enable (captions or subtitles).
                         * @return {EnableTextTrackPromise}
                         */

                    }, {
                        key: 'enableTextTrack',
                        value: function enableTextTrack(language, kind) {
                            if (!language) {
                                throw new TypeError('You must pass a language.');
                            }

                            return this.callMethod('enableTextTrack', {
                                language: language,
                                kind: kind
                            });
                        }

                        /**
                         * A promise to disable the active text track.
                         *
                         * @promise DisableTextTrackPromise
                         * @fulfill {void} The track was disabled.
                         */
                        /**
                         * Disable the currently-active text track.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {DisableTextTrackPromise}
                         */

                    }, {
                        key: 'disableTextTrack',
                        value: function disableTextTrack() {
                            return this.callMethod('disableTextTrack');
                        }

                        /**
                         * A promise to pause the video.
                         *
                         * @promise PausePromise
                         * @fulfill {void} The video was paused.
                         */
                        /**
                         * Pause the video if it’s playing.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {PausePromise}
                         */

                    }, {
                        key: 'pause',
                        value: function pause() {
                            return this.callMethod('pause');
                        }

                        /**
                         * A promise to play the video.
                         *
                         * @promise PlayPromise
                         * @fulfill {void} The video was played.
                         */
                        /**
                         * Play the video if it’s paused. **Note:** on iOS and some other
                         * mobile devices, you cannot programmatically trigger play. Once the
                         * viewer has tapped on the play button in the player, however, you
                         * will be able to use this function.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {PlayPromise}
                         */

                    }, {
                        key: 'play',
                        value: function play() {
                            return this.callMethod('play');
                        }

                        /**
                         * A promise to unload the video.
                         *
                         * @promise UnloadPromise
                         * @fulfill {void} The video was unloaded.
                         */
                        /**
                         * Return the player to its initial state.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {UnloadPromise}
                         */

                    }, {
                        key: 'unload',
                        value: function unload() {
                            return this.callMethod('unload');
                        }

                        /**
                         * A promise to get the autopause behavior of the video.
                         *
                         * @promise GetAutopausePromise
                         * @fulfill {boolean} Whether autopause is turned on or off.
                         * @reject {UnsupportedError} Autopause is not supported with the current
                         *         player or browser.
                         */
                        /**
                         * Get the autopause behavior for this player.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetAutopausePromise}
                         */

                    }, {
                        key: 'getAutopause',
                        value: function getAutopause() {
                            return this.get('autopause');
                        }

                        /**
                         * A promise to set the autopause behavior of the video.
                         *
                         * @promise SetAutopausePromise
                         * @fulfill {boolean} Whether autopause is turned on or off.
                         * @reject {UnsupportedError} Autopause is not supported with the current
                         *         player or browser.
                         */
                        /**
                         * Enable or disable the autopause behavior of this player.
                         *
                         * By default, when another video is played in the same browser, this
                         * player will automatically pause. Unless you have a specific reason
                         * for doing so, we recommend that you leave autopause set to the
                         * default (`true`).
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {boolean} autopause
                         * @return {SetAutopausePromise}
                         */

                    }, {
                        key: 'setAutopause',
                        value: function setAutopause(autopause) {
                            return this.set('autopause', autopause);
                        }

                        /**
                         * A promise to get the color of the player.
                         *
                         * @promise GetColorPromise
                         * @fulfill {string} The hex color of the player.
                         */
                        /**
                         * Get the color for this player.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetColorPromise}
                         */

                    }, {
                        key: 'getColor',
                        value: function getColor() {
                            return this.get('color');
                        }

                        /**
                         * A promise to set the color of the player.
                         *
                         * @promise SetColorPromise
                         * @fulfill {string} The color was successfully set.
                         * @reject {TypeError} The string was not a valid hex or rgb color.
                         * @reject {ContrastError} The color was set, but the contrast is
                         *         outside of the acceptable range.
                         * @reject {EmbedSettingsError} The owner of the player has chosen to
                         *         use a specific color.
                         */
                        /**
                         * Set the color of this player to a hex or rgb string. Setting the
                         * color may fail if the owner of the video has set their embed
                         * preferences to force a specific color.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {string} color The hex or rgb color string to set.
                         * @return {SetColorPromise}
                         */

                    }, {
                        key: 'setColor',
                        value: function setColor(color) {
                            return this.set('color', color);
                        }

                        /**
                         * A representation of a cue point.
                         *
                         * @typedef {Object} VimeoCuePoint
                         * @property {number} time The time of the cue point.
                         * @property {object} data The data passed when adding the cue point.
                         * @property {string} id The unique id for use with removeCuePoint.
                         */
                        /**
                         * A promise to get the cue points of a video.
                         *
                         * @promise GetCuePointsPromise
                         * @fulfill {VimeoCuePoint[]} The cue points added to the video.
                         * @reject {UnsupportedError} Cue points are not supported with the current
                         *         player or browser.
                         */
                        /**
                         * Get an array of the cue points added to the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetCuePointsPromise}
                         */

                    }, {
                        key: 'getCuePoints',
                        value: function getCuePoints() {
                            return this.get('cuePoints');
                        }

                        /**
                         * A promise to get the current time of the video.
                         *
                         * @promise GetCurrentTimePromise
                         * @fulfill {number} The current time in seconds.
                         */
                        /**
                         * Get the current playback position in seconds.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetCurrentTimePromise}
                         */

                    }, {
                        key: 'getCurrentTime',
                        value: function getCurrentTime() {
                            return this.get('currentTime');
                        }

                        /**
                         * A promise to set the current time of the video.
                         *
                         * @promise SetCurrentTimePromise
                         * @fulfill {number} The actual current time that was set.
                         * @reject {RangeError} the time was less than 0 or greater than the
                         *         video’s duration.
                         */
                        /**
                         * Set the current playback position in seconds. If the player was
                         * paused, it will remain paused. Likewise, if the player was playing,
                         * it will resume playing once the video has buffered.
                         *
                         * You can provide an accurate time and the player will attempt to seek
                         * to as close to that time as possible. The exact time will be the
                         * fulfilled value of the promise.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {number} currentTime
                         * @return {SetCurrentTimePromise}
                         */

                    }, {
                        key: 'setCurrentTime',
                        value: function setCurrentTime(currentTime) {
                            return this.set('currentTime', currentTime);
                        }

                        /**
                         * A promise to get the duration of the video.
                         *
                         * @promise GetDurationPromise
                         * @fulfill {number} The duration in seconds.
                         */
                        /**
                         * Get the duration of the video in seconds. It will be rounded to the
                         * nearest second before playback begins, and to the nearest thousandth
                         * of a second after playback begins.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetDurationPromise}
                         */

                    }, {
                        key: 'getDuration',
                        value: function getDuration() {
                            return this.get('duration');
                        }

                        /**
                         * A promise to get the ended state of the video.
                         *
                         * @promise GetEndedPromise
                         * @fulfill {boolean} Whether or not the video has ended.
                         */
                        /**
                         * Get the ended state of the video. The video has ended if
                         * `currentTime === duration`.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetEndedPromise}
                         */

                    }, {
                        key: 'getEnded',
                        value: function getEnded() {
                            return this.get('ended');
                        }

                        /**
                         * A promise to get the loop state of the player.
                         *
                         * @promise GetLoopPromise
                         * @fulfill {boolean} Whether or not the player is set to loop.
                         */
                        /**
                         * Get the loop state of the player.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetLoopPromise}
                         */

                    }, {
                        key: 'getLoop',
                        value: function getLoop() {
                            return this.get('loop');
                        }

                        /**
                         * A promise to set the loop state of the player.
                         *
                         * @promise SetLoopPromise
                         * @fulfill {boolean} The loop state that was set.
                         */
                        /**
                         * Set the loop state of the player. When set to `true`, the player
                         * will start over immediately once playback ends.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {boolean} loop
                         * @return {SetLoopPromise}
                         */

                    }, {
                        key: 'setLoop',
                        value: function setLoop(loop) {
                            return this.set('loop', loop);
                        }

                        /**
                         * A promise to get the paused state of the player.
                         *
                         * @promise GetLoopPromise
                         * @fulfill {boolean} Whether or not the video is paused.
                         */
                        /**
                         * Get the paused state of the player.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetLoopPromise}
                         */

                    }, {
                        key: 'getPaused',
                        value: function getPaused() {
                            return this.get('paused');
                        }

                        /**
                         * A promise to get the text tracks of a video.
                         *
                         * @promise GetTextTracksPromise
                         * @fulfill {VimeoTextTrack[]} The text tracks associated with the video.
                         */
                        /**
                         * Get an array of the text tracks that exist for the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetTextTracksPromise}
                         */

                    }, {
                        key: 'getTextTracks',
                        value: function getTextTracks() {
                            return this.get('textTracks');
                        }

                        /**
                         * A promise to get the embed code for the video.
                         *
                         * @promise GetVideoEmbedCodePromise
                         * @fulfill {string} The `<iframe>` embed code for the video.
                         */
                        /**
                         * Get the `<iframe>` embed code for the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoEmbedCodePromise}
                         */

                    }, {
                        key: 'getVideoEmbedCode',
                        value: function getVideoEmbedCode() {
                            return this.get('videoEmbedCode');
                        }

                        /**
                         * A promise to get the id of the video.
                         *
                         * @promise GetVideoIdPromise
                         * @fulfill {number} The id of the video.
                         */
                        /**
                         * Get the id of the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoIdPromise}
                         */

                    }, {
                        key: 'getVideoId',
                        value: function getVideoId() {
                            return this.get('videoId');
                        }

                        /**
                         * A promise to get the title of the video.
                         *
                         * @promise GetVideoTitlePromise
                         * @fulfill {number} The title of the video.
                         */
                        /**
                         * Get the title of the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoTitlePromise}
                         */

                    }, {
                        key: 'getVideoTitle',
                        value: function getVideoTitle() {
                            return this.get('videoTitle');
                        }

                        /**
                         * A promise to get the native width of the video.
                         *
                         * @promise GetVideoWidthPromise
                         * @fulfill {number} The native width of the video.
                         */
                        /**
                         * Get the native width of the currently‐playing video. The width of
                         * the highest‐resolution available will be used before playback begins.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoWidthPromise}
                         */

                    }, {
                        key: 'getVideoWidth',
                        value: function getVideoWidth() {
                            return this.get('videoWidth');
                        }

                        /**
                         * A promise to get the native height of the video.
                         *
                         * @promise GetVideoHeightPromise
                         * @fulfill {number} The native height of the video.
                         */
                        /**
                         * Get the native height of the currently‐playing video. The height of
                         * the highest‐resolution available will be used before playback begins.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoHeightPromise}
                         */

                    }, {
                        key: 'getVideoHeight',
                        value: function getVideoHeight() {
                            return this.get('videoHeight');
                        }

                        /**
                         * A promise to get the vimeo.com url for the video.
                         *
                         * @promise GetVideoUrlPromise
                         * @fulfill {number} The vimeo.com url for the video.
                         * @reject {PrivacyError} The url isn’t available because of the video’s privacy setting.
                         */
                        /**
                         * Get the vimeo.com url for the video.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVideoUrlPromise}
                         */

                    }, {
                        key: 'getVideoUrl',
                        value: function getVideoUrl() {
                            return this.get('videoUrl');
                        }

                        /**
                         * A promise to get the volume level of the player.
                         *
                         * @promise GetVolumePromise
                         * @fulfill {number} The volume level of the player on a scale from 0 to 1.
                         */
                        /**
                         * Get the current volume level of the player on a scale from `0` to `1`.
                         *
                         * Most mobile devices do not support an independent volume from the
                         * system volume. In those cases, this method will always return `1`.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @return {GetVolumePromise}
                         */

                    }, {
                        key: 'getVolume',
                        value: function getVolume() {
                            return this.get('volume');
                        }

                        /**
                         * A promise to set the volume level of the player.
                         *
                         * @promise SetVolumePromise
                         * @fulfill {number} The volume was set.
                         * @reject {RangeError} The volume was less than 0 or greater than 1.
                         */
                        /**
                         * Set the volume of the player on a scale from `0` to `1`. When set
                         * via the API, the volume level will not be synchronized to other
                         * players or stored as the viewer’s preference.
                         *
                         * Most mobile devices do not support setting the volume. An error will
                         * *not* be triggered in that situation.
                         *
                         * @author Brad Dougherty <brad@vimeo.com>
                         * @param {number} volume
                         * @return {SetVolumePromise}
                         */

                    }, {
                        key: 'setVolume',
                        value: function setVolume(volume) {
                            return this.set('volume', volume);
                        }
                    }]);

                    return Player;
                }();

                initializeEmbeds();
                resizeEmbeds();

                return Player;

            })));


        }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    }, {}], 49: [function (require, module, exports) {
        /**
         * https://github.com/gre/bezier-easing
         * BezierEasing - use bezier curve for transition easing function
         * by Gaëtan Renaudeau 2014 - 2015 – MIT License
         */

        // These values are established by empiricism with tests (tradeoff: performance VS precision)
        var NEWTON_ITERATIONS = 4;
        var NEWTON_MIN_SLOPE = 0.001;
        var SUBDIVISION_PRECISION = 0.0000001;
        var SUBDIVISION_MAX_ITERATIONS = 10;

        var kSplineTableSize = 11;
        var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

        var float32ArraySupported = typeof Float32Array === 'function';

        function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
        function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
        function C(aA1) { return 3.0 * aA1; }

        // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
        function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

        // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
        function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

        function binarySubdivide(aX, aA, aB, mX1, mX2) {
            var currentX, currentT, i = 0;
            do {
                currentT = aA + (aB - aA) / 2.0;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0.0) {
                    aB = currentT;
                } else {
                    aA = currentT;
                }
            } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
            return currentT;
        }

        function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
            for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
                var currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0.0) {
                    return aGuessT;
                }
                var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        }

        module.exports = function bezier(mX1, mY1, mX2, mY2) {
            if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
                throw new Error('bezier x values must be in [0, 1] range');
            }

            // Precompute samples table
            var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
            if (mX1 !== mY1 || mX2 !== mY2) {
                for (var i = 0; i < kSplineTableSize; ++i) {
                    sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
                }
            }

            function getTForX(aX) {
                var intervalStart = 0.0;
                var currentSample = 1;
                var lastSample = kSplineTableSize - 1;

                for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                    intervalStart += kSampleStepSize;
                }
                --currentSample;

                // Interpolate to provide an initial guess for t
                var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
                var guessForT = intervalStart + dist * kSampleStepSize;

                var initialSlope = getSlope(guessForT, mX1, mX2);
                if (initialSlope >= NEWTON_MIN_SLOPE) {
                    return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
                } else if (initialSlope === 0.0) {
                    return guessForT;
                } else {
                    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
                }
            }

            return function BezierEasing(x) {
                if (mX1 === mY1 && mX2 === mY2) {
                    return x; // linear
                }
                // Because JavaScript number are imprecise, we should guarantee the extremes are right.
                if (x === 0) {
                    return 0;
                }
                if (x === 1) {
                    return 1;
                }
                return calcBezier(getTForX(x), mY1, mY2);
            };
        };

    }, {}], 50: [function (require, module, exports) {
        (function () {
            var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

            // The base Class implementation (does nothing)
            this.Class = function () { };

            // Create a new Class that inherits from this class
            Class.extend = function (className, prop) {
                if (prop == undefined) {
                    prop = className;
                    className = "Class";
                }

                var _super = this.prototype;

                // Instantiate a base class (but only create the instance,
                // don't run the init constructor)
                initializing = true;
                var prototype = new this();
                initializing = false;

                // Copy the properties over onto the new prototype
                for (var name in prop) {
                    // Check if we're overwriting an existing function
                    prototype[name] = typeof prop[name] == "function" &&
                        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                        (function (name, fn) {
                            return function () {
                                var tmp = this._super;

                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this._super = _super[name];

                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);
                                this._super = tmp;

                                return ret;
                            };
                        })(name, prop[name]) :
                        prop[name];
                }

                // The dummy class constructor
                function Class() {
                    // All construction is actually done in the init method
                    if (!initializing && this.init)
                        this.init.apply(this, arguments);
                }

                // Populate our constructed prototype object
                Class.prototype = prototype;

                // Enforce the constructor to be what we expect
                var func = new Function(
                    "return function " + className + "(){ }"
                )();
                Class.prototype.constructor = func;

                // And make this class extendable
                Class.extend = arguments.callee;

                return Class;
            };

            //I only added this line
            module.exports = Class;
        })();

    }, {}], 51: [function (require, module, exports) {
        (function (root, factory) {

            if (root === null) {
                throw new Error('Google-maps package can be used only in browser');
            }

            if (typeof define === 'function' && define.amd) {
                define(factory);
            } else if (typeof exports === 'object') {
                module.exports = factory();
            } else {
                root.GoogleMapsLoader = factory();
            }

        })(typeof window !== 'undefined' ? window : null, function () {


            'use strict';


            var googleVersion = '3.18';

            var script = null;

            var google = null;

            var loading = false;

            var callbacks = [];

            var onLoadEvents = [];

            var originalCreateLoaderMethod = null;


            var GoogleMapsLoader = {};


            GoogleMapsLoader.URL = '';

            GoogleMapsLoader.KEY = null;

            GoogleMapsLoader.LIBRARIES = [];

            GoogleMapsLoader.CLIENT = null;

            GoogleMapsLoader.CHANNEL = null;

            GoogleMapsLoader.LANGUAGE = null;

            GoogleMapsLoader.REGION = null;

            GoogleMapsLoader.VERSION = googleVersion;

            GoogleMapsLoader.WINDOW_CALLBACK_NAME = '';


            GoogleMapsLoader._googleMockApiObject = {};


            GoogleMapsLoader.load = function (fn) {
                if (google === null) {
                    if (loading === true) {
                        if (fn) {
                            callbacks.push(fn);
                        }
                    } else {
                        loading = true;

                        window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] = function () {
                            ready(fn);
                        };

                        GoogleMapsLoader.createLoader();
                    }
                } else if (fn) {
                    fn(google);
                }
            };


            GoogleMapsLoader.createLoader = function () {
                script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = GoogleMapsLoader.createUrl();

                document.body.appendChild(script);
            };


            GoogleMapsLoader.isLoaded = function () {
                return google !== null;
            };


            GoogleMapsLoader.createUrl = function () {
                var url = GoogleMapsLoader.URL;

                url += '?callback=' + GoogleMapsLoader.WINDOW_CALLBACK_NAME;

                if (GoogleMapsLoader.KEY) {
                    url += '&key=' + GoogleMapsLoader.KEY;
                }

                if (GoogleMapsLoader.LIBRARIES.length > 0) {
                    url += '&libraries=' + GoogleMapsLoader.LIBRARIES.join(',');
                }

                if (GoogleMapsLoader.CLIENT) {
                    url += '&client=' + GoogleMapsLoader.CLIENT + '&v=' + GoogleMapsLoader.VERSION;
                }

                if (GoogleMapsLoader.CHANNEL) {
                    url += '&channel=' + GoogleMapsLoader.CHANNEL;
                }

                if (GoogleMapsLoader.LANGUAGE) {
                    url += '&language=' + GoogleMapsLoader.LANGUAGE;
                }

                if (GoogleMapsLoader.REGION) {
                    url += '&region=' + GoogleMapsLoader.REGION;
                }

                return url;
            };


            GoogleMapsLoader.release = function (fn) {
                var release = function () {
                    GoogleMapsLoader.KEY = null;
                    GoogleMapsLoader.LIBRARIES = [];
                    GoogleMapsLoader.CLIENT = null;
                    GoogleMapsLoader.CHANNEL = null;
                    GoogleMapsLoader.LANGUAGE = null;
                    GoogleMapsLoader.REGION = null;
                    GoogleMapsLoader.VERSION = googleVersion;

                    google = null;
                    loading = false;
                    callbacks = [];
                    onLoadEvents = [];

                    if (typeof window.google !== 'undefined') {
                        delete window.google;
                    }

                    if (typeof window[GoogleMapsLoader.WINDOW_CALLBACK_NAME] !== 'undefined') {
                        delete window[GoogleMapsLoader.WINDOW_CALLBACK_NAME];
                    }

                    if (originalCreateLoaderMethod !== null) {
                        GoogleMapsLoader.createLoader = originalCreateLoaderMethod;
                        originalCreateLoaderMethod = null;
                    }

                    if (script !== null) {
                        script.parentElement.removeChild(script);
                        script = null;
                    }

                    if (fn) {
                        fn();
                    }
                };

                if (loading) {
                    GoogleMapsLoader.load(function () {
                        release();
                    });
                } else {
                    release();
                }
            };


            GoogleMapsLoader.onLoad = function (fn) {
                onLoadEvents.push(fn);
            };


            GoogleMapsLoader.makeMock = function () {
                originalCreateLoaderMethod = GoogleMapsLoader.createLoader;

                GoogleMapsLoader.createLoader = function () {
                    window.google = GoogleMapsLoader._googleMockApiObject;
                    window[GoogleMapsLoader.WINDOW_CALLBACK_NAME]();
                };
            };


            var ready = function (fn) {
                var i;

                loading = false;

                if (google === null) {
                    google = window.google;
                }

                for (i = 0; i < onLoadEvents.length; i++) {
                    onLoadEvents[i](google);
                }

                if (fn) {
                    fn(google);
                }

                for (i = 0; i < callbacks.length; i++) {
                    callbacks[i](google);
                }

                callbacks = [];
            };


            return GoogleMapsLoader;

        });

    }, {}], 52: [function (require, module, exports) {
        /*!
         * jQuery JavaScript Library v3.2.1
         * https://jquery.com/
         *
         * Includes Sizzle.js
         * https://sizzlejs.com/
         *
         * Copyright JS Foundation and other contributors
         * Released under the MIT license
         * https://jquery.org/license
         *
         * Date: 2017-03-20T18:59Z
         */
        (function (global, factory) {

            "use strict";

            if (typeof module === "object" && typeof module.exports === "object") {

                // For CommonJS and CommonJS-like environments where a proper `window`
                // is present, execute the factory and get jQuery.
                // For environments that do not have a `window` with a `document`
                // (such as Node.js), expose a factory as module.exports.
                // This accentuates the need for the creation of a real `window`.
                // e.g. var jQuery = require("jquery")(window);
                // See ticket #14549 for more info.
                module.exports = global.document ?
                    factory(global, true) :
                    function (w) {
                        if (!w.document) {
                            throw new Error("jQuery requires a window with a document");
                        }
                        return factory(w);
                    };
            } else {
                factory(global);
            }

            // Pass this if window is not defined yet
        })(typeof window !== "undefined" ? window : this, function (window, noGlobal) {

            // Edge <= 12 - 13+, Firefox <=18 - 45+, IE 10 - 11, Safari 5.1 - 9+, iOS 6 - 9.1
            // throw exceptions when non-strict code (e.g., ASP.NET 4.5) accesses strict mode
            // arguments.callee.caller (trac-13335). But as of jQuery 3.0 (2016), strict mode should be common
            // enough that all such attempts are guarded in a try block.
            "use strict";

            var arr = [];

            var document = window.document;

            var getProto = Object.getPrototypeOf;

            var slice = arr.slice;

            var concat = arr.concat;

            var push = arr.push;

            var indexOf = arr.indexOf;

            var class2type = {};

            var toString = class2type.toString;

            var hasOwn = class2type.hasOwnProperty;

            var fnToString = hasOwn.toString;

            var ObjectFunctionString = fnToString.call(Object);

            var support = {};



            function DOMEval(code, doc) {
                doc = doc || document;

                var script = doc.createElement("script");

                script.text = code;
                doc.head.appendChild(script).parentNode.removeChild(script);
            }
            /* global Symbol */
            // Defining this global in .eslintrc.json would create a danger of using the global
            // unguarded in another place, it seems safer to define global only for this module



            var
                version = "3.2.1",

                // Define a local copy of jQuery
                jQuery = function (selector, context) {

                    // The jQuery object is actually just the init constructor 'enhanced'
                    // Need init if jQuery is called (just allow error to be thrown if not included)
                    return new jQuery.fn.init(selector, context);
                },

                // Support: Android <=4.0 only
                // Make sure we trim BOM and NBSP
                rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

                // Matches dashed string for camelizing
                rmsPrefix = /^-ms-/,
                rdashAlpha = /-([a-z])/g,

                // Used by jQuery.camelCase as callback to replace()
                fcamelCase = function (all, letter) {
                    return letter.toUpperCase();
                };

            jQuery.fn = jQuery.prototype = {

                // The current version of jQuery being used
                jquery: version,

                constructor: jQuery,

                // The default length of a jQuery object is 0
                length: 0,

                toArray: function () {
                    return slice.call(this);
                },

                // Get the Nth element in the matched element set OR
                // Get the whole matched element set as a clean array
                get: function (num) {

                    // Return all the elements in a clean array
                    if (num == null) {
                        return slice.call(this);
                    }

                    // Return just the one element from the set
                    return num < 0 ? this[num + this.length] : this[num];
                },

                // Take an array of elements and push it onto the stack
                // (returning the new matched element set)
                pushStack: function (elems) {

                    // Build a new jQuery matched element set
                    var ret = jQuery.merge(this.constructor(), elems);

                    // Add the old object onto the stack (as a reference)
                    ret.prevObject = this;

                    // Return the newly-formed element set
                    return ret;
                },

                // Execute a callback for every element in the matched set.
                each: function (callback) {
                    return jQuery.each(this, callback);
                },

                map: function (callback) {
                    return this.pushStack(jQuery.map(this, function (elem, i) {
                        return callback.call(elem, i, elem);
                    }));
                },

                slice: function () {
                    return this.pushStack(slice.apply(this, arguments));
                },

                first: function () {
                    return this.eq(0);
                },

                last: function () {
                    return this.eq(-1);
                },

                eq: function (i) {
                    var len = this.length,
                        j = +i + (i < 0 ? len : 0);
                    return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
                },

                end: function () {
                    return this.prevObject || this.constructor();
                },

                // For internal use only.
                // Behaves like an Array's method, not like a jQuery method.
                push: push,
                sort: arr.sort,
                splice: arr.splice
            };

            jQuery.extend = jQuery.fn.extend = function () {
                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;

                // Handle a deep copy situation
                if (typeof target === "boolean") {
                    deep = target;

                    // Skip the boolean and the target
                    target = arguments[i] || {};
                    i++;
                }

                // Handle case when target is a string or something (possible in deep copy)
                if (typeof target !== "object" && !jQuery.isFunction(target)) {
                    target = {};
                }

                // Extend jQuery itself if only one argument is passed
                if (i === length) {
                    target = this;
                    i--;
                }

                for (; i < length; i++) {

                    // Only deal with non-null/undefined values
                    if ((options = arguments[i]) != null) {

                        // Extend the base object
                        for (name in options) {
                            src = target[name];
                            copy = options[name];

                            // Prevent never-ending loop
                            if (target === copy) {
                                continue;
                            }

                            // Recurse if we're merging plain objects or arrays
                            if (deep && copy && (jQuery.isPlainObject(copy) ||
                                (copyIsArray = Array.isArray(copy)))) {

                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && Array.isArray(src) ? src : [];

                                } else {
                                    clone = src && jQuery.isPlainObject(src) ? src : {};
                                }

                                // Never move original objects, clone them
                                target[name] = jQuery.extend(deep, clone, copy);

                                // Don't bring in undefined values
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }

                // Return the modified object
                return target;
            };

            jQuery.extend({

                // Unique for each copy of jQuery on the page
                expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),

                // Assume jQuery is ready without the ready module
                isReady: true,

                error: function (msg) {
                    throw new Error(msg);
                },

                noop: function () { },

                isFunction: function (obj) {
                    return jQuery.type(obj) === "function";
                },

                isWindow: function (obj) {
                    return obj != null && obj === obj.window;
                },

                isNumeric: function (obj) {

                    // As of jQuery 3.0, isNumeric is limited to
                    // strings and numbers (primitives or objects)
                    // that can be coerced to finite numbers (gh-2662)
                    var type = jQuery.type(obj);
                    return (type === "number" || type === "string") &&

                        // parseFloat NaNs numeric-cast false positives ("")
                        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
                        // subtraction forces infinities to NaN
                        !isNaN(obj - parseFloat(obj));
                },

                isPlainObject: function (obj) {
                    var proto, Ctor;

                    // Detect obvious negatives
                    // Use toString instead of jQuery.type to catch host objects
                    if (!obj || toString.call(obj) !== "[object Object]") {
                        return false;
                    }

                    proto = getProto(obj);

                    // Objects with no prototype (e.g., `Object.create( null )`) are plain
                    if (!proto) {
                        return true;
                    }

                    // Objects with prototype are plain iff they were constructed by a global Object function
                    Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
                    return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
                },

                isEmptyObject: function (obj) {

                    /* eslint-disable no-unused-vars */
                    // See https://github.com/eslint/eslint/issues/6125
                    var name;

                    for (name in obj) {
                        return false;
                    }
                    return true;
                },

                type: function (obj) {
                    if (obj == null) {
                        return obj + "";
                    }

                    // Support: Android <=2.3 only (functionish RegExp)
                    return typeof obj === "object" || typeof obj === "function" ?
                        class2type[toString.call(obj)] || "object" :
                        typeof obj;
                },

                // Evaluates a script in a global context
                globalEval: function (code) {
                    DOMEval(code);
                },

                // Convert dashed to camelCase; used by the css and data modules
                // Support: IE <=9 - 11, Edge 12 - 13
                // Microsoft forgot to hump their vendor prefix (#9572)
                camelCase: function (string) {
                    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
                },

                each: function (obj, callback) {
                    var length, i = 0;

                    if (isArrayLike(obj)) {
                        length = obj.length;
                        for (; i < length; i++) {
                            if (callback.call(obj[i], i, obj[i]) === false) {
                                break;
                            }
                        }
                    } else {
                        for (i in obj) {
                            if (callback.call(obj[i], i, obj[i]) === false) {
                                break;
                            }
                        }
                    }

                    return obj;
                },

                // Support: Android <=4.0 only
                trim: function (text) {
                    return text == null ?
                        "" :
                        (text + "").replace(rtrim, "");
                },

                // results is for internal usage only
                makeArray: function (arr, results) {
                    var ret = results || [];

                    if (arr != null) {
                        if (isArrayLike(Object(arr))) {
                            jQuery.merge(ret,
                                typeof arr === "string" ?
                                    [arr] : arr
                            );
                        } else {
                            push.call(ret, arr);
                        }
                    }

                    return ret;
                },

                inArray: function (elem, arr, i) {
                    return arr == null ? -1 : indexOf.call(arr, elem, i);
                },

                // Support: Android <=4.0 only, PhantomJS 1 only
                // push.apply(_, arraylike) throws on ancient WebKit
                merge: function (first, second) {
                    var len = +second.length,
                        j = 0,
                        i = first.length;

                    for (; j < len; j++) {
                        first[i++] = second[j];
                    }

                    first.length = i;

                    return first;
                },

                grep: function (elems, callback, invert) {
                    var callbackInverse,
                        matches = [],
                        i = 0,
                        length = elems.length,
                        callbackExpect = !invert;

                    // Go through the array, only saving the items
                    // that pass the validator function
                    for (; i < length; i++) {
                        callbackInverse = !callback(elems[i], i);
                        if (callbackInverse !== callbackExpect) {
                            matches.push(elems[i]);
                        }
                    }

                    return matches;
                },

                // arg is for internal usage only
                map: function (elems, callback, arg) {
                    var length, value,
                        i = 0,
                        ret = [];

                    // Go through the array, translating each of the items to their new values
                    if (isArrayLike(elems)) {
                        length = elems.length;
                        for (; i < length; i++) {
                            value = callback(elems[i], i, arg);

                            if (value != null) {
                                ret.push(value);
                            }
                        }

                        // Go through every key on the object,
                    } else {
                        for (i in elems) {
                            value = callback(elems[i], i, arg);

                            if (value != null) {
                                ret.push(value);
                            }
                        }
                    }

                    // Flatten any nested arrays
                    return concat.apply([], ret);
                },

                // A global GUID counter for objects
                guid: 1,

                // Bind a function to a context, optionally partially applying any
                // arguments.
                proxy: function (fn, context) {
                    var tmp, args, proxy;

                    if (typeof context === "string") {
                        tmp = fn[context];
                        context = fn;
                        fn = tmp;
                    }

                    // Quick check to determine if target is callable, in the spec
                    // this throws a TypeError, but we will just return undefined.
                    if (!jQuery.isFunction(fn)) {
                        return undefined;
                    }

                    // Simulated bind
                    args = slice.call(arguments, 2);
                    proxy = function () {
                        return fn.apply(context || this, args.concat(slice.call(arguments)));
                    };

                    // Set the guid of unique handler to the same of original handler, so it can be removed
                    proxy.guid = fn.guid = fn.guid || jQuery.guid++;

                    return proxy;
                },

                now: Date.now,

                // jQuery.support is not used in Core but other projects attach their
                // properties to it so it needs to exist.
                support: support
            });

            if (typeof Symbol === "function") {
                jQuery.fn[Symbol.iterator] = arr[Symbol.iterator];
            }

            // Populate the class2type map
            jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
                function (i, name) {
                    class2type["[object " + name + "]"] = name.toLowerCase();
                });

            function isArrayLike(obj) {

                // Support: real iOS 8.2 only (not reproducible in simulator)
                // `in` check used to prevent JIT error (gh-2145)
                // hasOwn isn't used here due to false negatives
                // regarding Nodelist length in IE
                var length = !!obj && "length" in obj && obj.length,
                    type = jQuery.type(obj);

                if (type === "function" || jQuery.isWindow(obj)) {
                    return false;
                }

                return type === "array" || length === 0 ||
                    typeof length === "number" && length > 0 && (length - 1) in obj;
            }
            var Sizzle =
                /*!
                 * Sizzle CSS Selector Engine v2.3.3
                 * https://sizzlejs.com/
                 *
                 * Copyright jQuery Foundation and other contributors
                 * Released under the MIT license
                 * http://jquery.org/license
                 *
                 * Date: 2016-08-08
                 */
                (function (window) {

                    var i,
                        support,
                        Expr,
                        getText,
                        isXML,
                        tokenize,
                        compile,
                        select,
                        outermostContext,
                        sortInput,
                        hasDuplicate,

                        // Local document vars
                        setDocument,
                        document,
                        docElem,
                        documentIsHTML,
                        rbuggyQSA,
                        rbuggyMatches,
                        matches,
                        contains,

                        // Instance-specific data
                        expando = "sizzle" + 1 * new Date(),
                        preferredDoc = window.document,
                        dirruns = 0,
                        done = 0,
                        classCache = createCache(),
                        tokenCache = createCache(),
                        compilerCache = createCache(),
                        sortOrder = function (a, b) {
                            if (a === b) {
                                hasDuplicate = true;
                            }
                            return 0;
                        },

                        // Instance methods
                        hasOwn = ({}).hasOwnProperty,
                        arr = [],
                        pop = arr.pop,
                        push_native = arr.push,
                        push = arr.push,
                        slice = arr.slice,
                        // Use a stripped-down indexOf as it's faster than native
                        // https://jsperf.com/thor-indexof-vs-for/5
                        indexOf = function (list, elem) {
                            var i = 0,
                                len = list.length;
                            for (; i < len; i++) {
                                if (list[i] === elem) {
                                    return i;
                                }
                            }
                            return -1;
                        },

                        booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

                        // Regular expressions

                        // http://www.w3.org/TR/css3-selectors/#whitespace
                        whitespace = "[\\x20\\t\\r\\n\\f]",

                        // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
                        identifier = "(?:\\\\.|[\\w-]|[^\0-\\xa0])+",

                        // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
                        attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
                            // Operator (capture 2)
                            "*([*^$|!~]?=)" + whitespace +
                            // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
                            "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
                            "*\\]",

                        pseudos = ":(" + identifier + ")(?:\\((" +
                            // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
                            // 1. quoted (capture 3; capture 4 or capture 5)
                            "('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
                            // 2. simple (capture 6)
                            "((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
                            // 3. anything else (capture 2)
                            ".*" +
                            ")\\)|)",

                        // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
                        rwhitespace = new RegExp(whitespace + "+", "g"),
                        rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),

                        rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
                        rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),

                        rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),

                        rpseudo = new RegExp(pseudos),
                        ridentifier = new RegExp("^" + identifier + "$"),

                        matchExpr = {
                            "ID": new RegExp("^#(" + identifier + ")"),
                            "CLASS": new RegExp("^\\.(" + identifier + ")"),
                            "TAG": new RegExp("^(" + identifier + "|[*])"),
                            "ATTR": new RegExp("^" + attributes),
                            "PSEUDO": new RegExp("^" + pseudos),
                            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
                                "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
                                "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
                            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
                            // For use in libraries implementing .is()
                            // We use this for POS matching in `select`
                            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
                                whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
                        },

                        rinputs = /^(?:input|select|textarea|button)$/i,
                        rheader = /^h\d$/i,

                        rnative = /^[^{]+\{\s*\[native \w/,

                        // Easily-parseable/retrievable ID or TAG or CLASS selectors
                        rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

                        rsibling = /[+~]/,

                        // CSS escapes
                        // http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
                        runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
                        funescape = function (_, escaped, escapedWhitespace) {
                            var high = "0x" + escaped - 0x10000;
                            // NaN means non-codepoint
                            // Support: Firefox<24
                            // Workaround erroneous numeric interpretation of +"0x"
                            return high !== high || escapedWhitespace ?
                                escaped :
                                high < 0 ?
                                    // BMP codepoint
                                    String.fromCharCode(high + 0x10000) :
                                    // Supplemental Plane codepoint (surrogate pair)
                                    String.fromCharCode(high >> 10 | 0xD800, high & 0x3FF | 0xDC00);
                        },

                        // CSS string/identifier serialization
                        // https://drafts.csswg.org/cssom/#common-serializing-idioms
                        rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\0-\x1f\x7f-\uFFFF\w-]/g,
                        fcssescape = function (ch, asCodePoint) {
                            if (asCodePoint) {

                                // U+0000 NULL becomes U+FFFD REPLACEMENT CHARACTER
                                if (ch === "\0") {
                                    return "\uFFFD";
                                }

                                // Control characters and (dependent upon position) numbers get escaped as code points
                                return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
                            }

                            // Other potentially-special ASCII characters get backslash-escaped
                            return "\\" + ch;
                        },

                        // Used for iframes
                        // See setDocument()
                        // Removing the function wrapper causes a "Permission Denied"
                        // error in IE
                        unloadHandler = function () {
                            setDocument();
                        },

                        disabledAncestor = addCombinator(
                            function (elem) {
                                return elem.disabled === true && ("form" in elem || "label" in elem);
                            },
                            { dir: "parentNode", next: "legend" }
                        );

                    // Optimize for push.apply( _, NodeList )
                    try {
                        push.apply(
                            (arr = slice.call(preferredDoc.childNodes)),
                            preferredDoc.childNodes
                        );
                        // Support: Android<4.0
                        // Detect silently failing push.apply
                        arr[preferredDoc.childNodes.length].nodeType;
                    } catch (e) {
                        push = {
                            apply: arr.length ?

                                // Leverage slice if possible
                                function (target, els) {
                                    push_native.apply(target, slice.call(els));
                                } :

                                // Support: IE<9
                                // Otherwise append directly
                                function (target, els) {
                                    var j = target.length,
                                        i = 0;
                                    // Can't trust NodeList.length
                                    while ((target[j++] = els[i++])) { }
                                    target.length = j - 1;
                                }
                        };
                    }

                    function Sizzle(selector, context, results, seed) {
                        var m, i, elem, nid, match, groups, newSelector,
                            newContext = context && context.ownerDocument,

                            // nodeType defaults to 9, since context defaults to document
                            nodeType = context ? context.nodeType : 9;

                        results = results || [];

                        // Return early from calls with invalid selector or context
                        if (typeof selector !== "string" || !selector ||
                            nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {

                            return results;
                        }

                        // Try to shortcut find operations (as opposed to filters) in HTML documents
                        if (!seed) {

                            if ((context ? context.ownerDocument || context : preferredDoc) !== document) {
                                setDocument(context);
                            }
                            context = context || document;

                            if (documentIsHTML) {

                                // If the selector is sufficiently simple, try using a "get*By*" DOM method
                                // (excepting DocumentFragment context, where the methods don't exist)
                                if (nodeType !== 11 && (match = rquickExpr.exec(selector))) {

                                    // ID selector
                                    if ((m = match[1])) {

                                        // Document context
                                        if (nodeType === 9) {
                                            if ((elem = context.getElementById(m))) {

                                                // Support: IE, Opera, Webkit
                                                // TODO: identify versions
                                                // getElementById can match elements by name instead of ID
                                                if (elem.id === m) {
                                                    results.push(elem);
                                                    return results;
                                                }
                                            } else {
                                                return results;
                                            }

                                            // Element context
                                        } else {

                                            // Support: IE, Opera, Webkit
                                            // TODO: identify versions
                                            // getElementById can match elements by name instead of ID
                                            if (newContext && (elem = newContext.getElementById(m)) &&
                                                contains(context, elem) &&
                                                elem.id === m) {

                                                results.push(elem);
                                                return results;
                                            }
                                        }

                                        // Type selector
                                    } else if (match[2]) {
                                        push.apply(results, context.getElementsByTagName(selector));
                                        return results;

                                        // Class selector
                                    } else if ((m = match[3]) && support.getElementsByClassName &&
                                        context.getElementsByClassName) {

                                        push.apply(results, context.getElementsByClassName(m));
                                        return results;
                                    }
                                }

                                // Take advantage of querySelectorAll
                                if (support.qsa &&
                                    !compilerCache[selector + " "] &&
                                    (!rbuggyQSA || !rbuggyQSA.test(selector))) {

                                    if (nodeType !== 1) {
                                        newContext = context;
                                        newSelector = selector;

                                        // qSA looks outside Element context, which is not what we want
                                        // Thanks to Andrew Dupont for this workaround technique
                                        // Support: IE <=8
                                        // Exclude object elements
                                    } else if (context.nodeName.toLowerCase() !== "object") {

                                        // Capture the context ID, setting it first if necessary
                                        if ((nid = context.getAttribute("id"))) {
                                            nid = nid.replace(rcssescape, fcssescape);
                                        } else {
                                            context.setAttribute("id", (nid = expando));
                                        }

                                        // Prefix every selector in the list
                                        groups = tokenize(selector);
                                        i = groups.length;
                                        while (i--) {
                                            groups[i] = "#" + nid + " " + toSelector(groups[i]);
                                        }
                                        newSelector = groups.join(",");

                                        // Expand context for sibling selectors
                                        newContext = rsibling.test(selector) && testContext(context.parentNode) ||
                                            context;
                                    }

                                    if (newSelector) {
                                        try {
                                            push.apply(results,
                                                newContext.querySelectorAll(newSelector)
                                            );
                                            return results;
                                        } catch (qsaError) {
                                        } finally {
                                            if (nid === expando) {
                                                context.removeAttribute("id");
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // All others
                        return select(selector.replace(rtrim, "$1"), context, results, seed);
                    }

                    /**
                     * Create key-value caches of limited size
                     * @returns {function(string, object)} Returns the Object data after storing it on itself with
                     *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
                     *	deleting the oldest entry
                     */
                    function createCache() {
                        var keys = [];

                        function cache(key, value) {
                            // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
                            if (keys.push(key + " ") > Expr.cacheLength) {
                                // Only keep the most recent entries
                                delete cache[keys.shift()];
                            }
                            return (cache[key + " "] = value);
                        }
                        return cache;
                    }

                    /**
                     * Mark a function for special use by Sizzle
                     * @param {Function} fn The function to mark
                     */
                    function markFunction(fn) {
                        fn[expando] = true;
                        return fn;
                    }

                    /**
                     * Support testing using an element
                     * @param {Function} fn Passed the created element and returns a boolean result
                     */
                    function assert(fn) {
                        var el = document.createElement("fieldset");

                        try {
                            return !!fn(el);
                        } catch (e) {
                            return false;
                        } finally {
                            // Remove from its parent by default
                            if (el.parentNode) {
                                el.parentNode.removeChild(el);
                            }
                            // release memory in IE
                            el = null;
                        }
                    }

                    /**
                     * Adds the same handler for all of the specified attrs
                     * @param {String} attrs Pipe-separated list of attributes
                     * @param {Function} handler The method that will be applied
                     */
                    function addHandle(attrs, handler) {
                        var arr = attrs.split("|"),
                            i = arr.length;

                        while (i--) {
                            Expr.attrHandle[arr[i]] = handler;
                        }
                    }

                    /**
                     * Checks document order of two siblings
                     * @param {Element} a
                     * @param {Element} b
                     * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
                     */
                    function siblingCheck(a, b) {
                        var cur = b && a,
                            diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
                                a.sourceIndex - b.sourceIndex;

                        // Use IE sourceIndex if available on both nodes
                        if (diff) {
                            return diff;
                        }

                        // Check if b follows a
                        if (cur) {
                            while ((cur = cur.nextSibling)) {
                                if (cur === b) {
                                    return -1;
                                }
                            }
                        }

                        return a ? 1 : -1;
                    }

                    /**
                     * Returns a function to use in pseudos for input types
                     * @param {String} type
                     */
                    function createInputPseudo(type) {
                        return function (elem) {
                            var name = elem.nodeName.toLowerCase();
                            return name === "input" && elem.type === type;
                        };
                    }

                    /**
                     * Returns a function to use in pseudos for buttons
                     * @param {String} type
                     */
                    function createButtonPseudo(type) {
                        return function (elem) {
                            var name = elem.nodeName.toLowerCase();
                            return (name === "input" || name === "button") && elem.type === type;
                        };
                    }

                    /**
                     * Returns a function to use in pseudos for :enabled/:disabled
                     * @param {Boolean} disabled true for :disabled; false for :enabled
                     */
                    function createDisabledPseudo(disabled) {

                        // Known :disabled false positives: fieldset[disabled] > legend:nth-of-type(n+2) :can-disable
                        return function (elem) {

                            // Only certain elements can match :enabled or :disabled
                            // https://html.spec.whatwg.org/multipage/scripting.html#selector-enabled
                            // https://html.spec.whatwg.org/multipage/scripting.html#selector-disabled
                            if ("form" in elem) {

                                // Check for inherited disabledness on relevant non-disabled elements:
                                // * listed form-associated elements in a disabled fieldset
                                //   https://html.spec.whatwg.org/multipage/forms.html#category-listed
                                //   https://html.spec.whatwg.org/multipage/forms.html#concept-fe-disabled
                                // * option elements in a disabled optgroup
                                //   https://html.spec.whatwg.org/multipage/forms.html#concept-option-disabled
                                // All such elements have a "form" property.
                                if (elem.parentNode && elem.disabled === false) {

                                    // Option elements defer to a parent optgroup if present
                                    if ("label" in elem) {
                                        if ("label" in elem.parentNode) {
                                            return elem.parentNode.disabled === disabled;
                                        } else {
                                            return elem.disabled === disabled;
                                        }
                                    }

                                    // Support: IE 6 - 11
                                    // Use the isDisabled shortcut property to check for disabled fieldset ancestors
                                    return elem.isDisabled === disabled ||

                                        // Where there is no isDisabled, check manually
                                        /* jshint -W018 */
                                        elem.isDisabled !== !disabled &&
                                        disabledAncestor(elem) === disabled;
                                }

                                return elem.disabled === disabled;

                                // Try to winnow out elements that can't be disabled before trusting the disabled property.
                                // Some victims get caught in our net (label, legend, menu, track), but it shouldn't
                                // even exist on them, let alone have a boolean value.
                            } else if ("label" in elem) {
                                return elem.disabled === disabled;
                            }

                            // Remaining elements are neither :enabled nor :disabled
                            return false;
                        };
                    }

                    /**
                     * Returns a function to use in pseudos for positionals
                     * @param {Function} fn
                     */
                    function createPositionalPseudo(fn) {
                        return markFunction(function (argument) {
                            argument = +argument;
                            return markFunction(function (seed, matches) {
                                var j,
                                    matchIndexes = fn([], seed.length, argument),
                                    i = matchIndexes.length;

                                // Match elements found at the specified indexes
                                while (i--) {
                                    if (seed[(j = matchIndexes[i])]) {
                                        seed[j] = !(matches[j] = seed[j]);
                                    }
                                }
                            });
                        });
                    }

                    /**
                     * Checks a node for validity as a Sizzle context
                     * @param {Element|Object=} context
                     * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
                     */
                    function testContext(context) {
                        return context && typeof context.getElementsByTagName !== "undefined" && context;
                    }

                    // Expose support vars for convenience
                    support = Sizzle.support = {};

                    /**
                     * Detects XML nodes
                     * @param {Element|Object} elem An element or a document
                     * @returns {Boolean} True iff elem is a non-HTML XML node
                     */
                    isXML = Sizzle.isXML = function (elem) {
                        // documentElement is verified for cases where it doesn't yet exist
                        // (such as loading iframes in IE - #4833)
                        var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                        return documentElement ? documentElement.nodeName !== "HTML" : false;
                    };

                    /**
                     * Sets document-related variables once based on the current document
                     * @param {Element|Object} [doc] An element or document object to use to set the document
                     * @returns {Object} Returns the current document
                     */
                    setDocument = Sizzle.setDocument = function (node) {
                        var hasCompare, subWindow,
                            doc = node ? node.ownerDocument || node : preferredDoc;

                        // Return early if doc is invalid or already selected
                        if (doc === document || doc.nodeType !== 9 || !doc.documentElement) {
                            return document;
                        }

                        // Update global variables
                        document = doc;
                        docElem = document.documentElement;
                        documentIsHTML = !isXML(document);

                        // Support: IE 9-11, Edge
                        // Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
                        if (preferredDoc !== document &&
                            (subWindow = document.defaultView) && subWindow.top !== subWindow) {

                            // Support: IE 11, Edge
                            if (subWindow.addEventListener) {
                                subWindow.addEventListener("unload", unloadHandler, false);

                                // Support: IE 9 - 10 only
                            } else if (subWindow.attachEvent) {
                                subWindow.attachEvent("onunload", unloadHandler);
                            }
                        }

                        /* Attributes
                        ---------------------------------------------------------------------- */

                        // Support: IE<8
                        // Verify that getAttribute really returns attributes and not properties
                        // (excepting IE8 booleans)
                        support.attributes = assert(function (el) {
                            el.className = "i";
                            return !el.getAttribute("className");
                        });

                        /* getElement(s)By*
                        ---------------------------------------------------------------------- */

                        // Check if getElementsByTagName("*") returns only elements
                        support.getElementsByTagName = assert(function (el) {
                            el.appendChild(document.createComment(""));
                            return !el.getElementsByTagName("*").length;
                        });

                        // Support: IE<9
                        support.getElementsByClassName = rnative.test(document.getElementsByClassName);

                        // Support: IE<10
                        // Check if getElementById returns elements by name
                        // The broken getElementById methods don't pick up programmatically-set names,
                        // so use a roundabout getElementsByName test
                        support.getById = assert(function (el) {
                            docElem.appendChild(el).id = expando;
                            return !document.getElementsByName || !document.getElementsByName(expando).length;
                        });

                        // ID filter and find
                        if (support.getById) {
                            Expr.filter["ID"] = function (id) {
                                var attrId = id.replace(runescape, funescape);
                                return function (elem) {
                                    return elem.getAttribute("id") === attrId;
                                };
                            };
                            Expr.find["ID"] = function (id, context) {
                                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                                    var elem = context.getElementById(id);
                                    return elem ? [elem] : [];
                                }
                            };
                        } else {
                            Expr.filter["ID"] = function (id) {
                                var attrId = id.replace(runescape, funescape);
                                return function (elem) {
                                    var node = typeof elem.getAttributeNode !== "undefined" &&
                                        elem.getAttributeNode("id");
                                    return node && node.value === attrId;
                                };
                            };

                            // Support: IE 6 - 7 only
                            // getElementById is not reliable as a find shortcut
                            Expr.find["ID"] = function (id, context) {
                                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                                    var node, i, elems,
                                        elem = context.getElementById(id);

                                    if (elem) {

                                        // Verify the id attribute
                                        node = elem.getAttributeNode("id");
                                        if (node && node.value === id) {
                                            return [elem];
                                        }

                                        // Fall back on getElementsByName
                                        elems = context.getElementsByName(id);
                                        i = 0;
                                        while ((elem = elems[i++])) {
                                            node = elem.getAttributeNode("id");
                                            if (node && node.value === id) {
                                                return [elem];
                                            }
                                        }
                                    }

                                    return [];
                                }
                            };
                        }

                        // Tag
                        Expr.find["TAG"] = support.getElementsByTagName ?
                            function (tag, context) {
                                if (typeof context.getElementsByTagName !== "undefined") {
                                    return context.getElementsByTagName(tag);

                                    // DocumentFragment nodes don't have gEBTN
                                } else if (support.qsa) {
                                    return context.querySelectorAll(tag);
                                }
                            } :

                            function (tag, context) {
                                var elem,
                                    tmp = [],
                                    i = 0,
                                    // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
                                    results = context.getElementsByTagName(tag);

                                // Filter out possible comments
                                if (tag === "*") {
                                    while ((elem = results[i++])) {
                                        if (elem.nodeType === 1) {
                                            tmp.push(elem);
                                        }
                                    }

                                    return tmp;
                                }
                                return results;
                            };

                        // Class
                        Expr.find["CLASS"] = support.getElementsByClassName && function (className, context) {
                            if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
                                return context.getElementsByClassName(className);
                            }
                        };

                        /* QSA/matchesSelector
                        ---------------------------------------------------------------------- */

                        // QSA and matchesSelector support

                        // matchesSelector(:active) reports false when true (IE9/Opera 11.5)
                        rbuggyMatches = [];

                        // qSa(:focus) reports false when true (Chrome 21)
                        // We allow this because of a bug in IE8/9 that throws an error
                        // whenever `document.activeElement` is accessed on an iframe
                        // So, we allow :focus to pass through QSA all the time to avoid the IE error
                        // See https://bugs.jquery.com/ticket/13378
                        rbuggyQSA = [];

                        if ((support.qsa = rnative.test(document.querySelectorAll))) {
                            // Build QSA regex
                            // Regex strategy adopted from Diego Perini
                            assert(function (el) {
                                // Select is set to empty string on purpose
                                // This is to test IE's treatment of not explicitly
                                // setting a boolean content attribute,
                                // since its presence should be enough
                                // https://bugs.jquery.com/ticket/12359
                                docElem.appendChild(el).innerHTML = "<a id='" + expando + "'></a>" +
                                    "<select id='" + expando + "-\r\\' msallowcapture=''>" +
                                    "<option selected=''></option></select>";

                                // Support: IE8, Opera 11-12.16
                                // Nothing should be selected when empty strings follow ^= or $= or *=
                                // The test attribute must be unknown in Opera but "safe" for WinRT
                                // https://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
                                if (el.querySelectorAll("[msallowcapture^='']").length) {
                                    rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")");
                                }

                                // Support: IE8
                                // Boolean attributes and "value" are not treated correctly
                                if (!el.querySelectorAll("[selected]").length) {
                                    rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                                }

                                // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
                                if (!el.querySelectorAll("[id~=" + expando + "-]").length) {
                                    rbuggyQSA.push("~=");
                                }

                                // Webkit/Opera - :checked should return selected option elements
                                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                                // IE8 throws error here and will not see later tests
                                if (!el.querySelectorAll(":checked").length) {
                                    rbuggyQSA.push(":checked");
                                }

                                // Support: Safari 8+, iOS 8+
                                // https://bugs.webkit.org/show_bug.cgi?id=136851
                                // In-page `selector#id sibling-combinator selector` fails
                                if (!el.querySelectorAll("a#" + expando + "+*").length) {
                                    rbuggyQSA.push(".#.+[+~]");
                                }
                            });

                            assert(function (el) {
                                el.innerHTML = "<a href='' disabled='disabled'></a>" +
                                    "<select disabled='disabled'><option/></select>";

                                // Support: Windows 8 Native Apps
                                // The type and name attributes are restricted during .innerHTML assignment
                                var input = document.createElement("input");
                                input.setAttribute("type", "hidden");
                                el.appendChild(input).setAttribute("name", "D");

                                // Support: IE8
                                // Enforce case-sensitivity of name attribute
                                if (el.querySelectorAll("[name=d]").length) {
                                    rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                                }

                                // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
                                // IE8 throws error here and will not see later tests
                                if (el.querySelectorAll(":enabled").length !== 2) {
                                    rbuggyQSA.push(":enabled", ":disabled");
                                }

                                // Support: IE9-11+
                                // IE's :disabled selector does not pick up the children of disabled fieldsets
                                docElem.appendChild(el).disabled = true;
                                if (el.querySelectorAll(":disabled").length !== 2) {
                                    rbuggyQSA.push(":enabled", ":disabled");
                                }

                                // Opera 10-11 does not throw on post-comma invalid pseudos
                                el.querySelectorAll("*,:x");
                                rbuggyQSA.push(",.*:");
                            });
                        }

                        if ((support.matchesSelector = rnative.test((matches = docElem.matches ||
                            docElem.webkitMatchesSelector ||
                            docElem.mozMatchesSelector ||
                            docElem.oMatchesSelector ||
                            docElem.msMatchesSelector)))) {

                            assert(function (el) {
                                // Check to see if it's possible to do matchesSelector
                                // on a disconnected node (IE 9)
                                support.disconnectedMatch = matches.call(el, "*");

                                // This should fail with an exception
                                // Gecko does not error, returns false instead
                                matches.call(el, "[s!='']:x");
                                rbuggyMatches.push("!=", pseudos);
                            });
                        }

                        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
                        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));

                        /* Contains
                        ---------------------------------------------------------------------- */
                        hasCompare = rnative.test(docElem.compareDocumentPosition);

                        // Element contains another
                        // Purposefully self-exclusive
                        // As in, an element does not contain itself
                        contains = hasCompare || rnative.test(docElem.contains) ?
                            function (a, b) {
                                var adown = a.nodeType === 9 ? a.documentElement : a,
                                    bup = b && b.parentNode;
                                return a === bup || !!(bup && bup.nodeType === 1 && (
                                    adown.contains ?
                                        adown.contains(bup) :
                                        a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16
                                ));
                            } :
                            function (a, b) {
                                if (b) {
                                    while ((b = b.parentNode)) {
                                        if (b === a) {
                                            return true;
                                        }
                                    }
                                }
                                return false;
                            };

                        /* Sorting
                        ---------------------------------------------------------------------- */

                        // Document order sorting
                        sortOrder = hasCompare ?
                            function (a, b) {

                                // Flag for duplicate removal
                                if (a === b) {
                                    hasDuplicate = true;
                                    return 0;
                                }

                                // Sort on method existence if only one input has compareDocumentPosition
                                var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                                if (compare) {
                                    return compare;
                                }

                                // Calculate position if both inputs belong to the same document
                                compare = (a.ownerDocument || a) === (b.ownerDocument || b) ?
                                    a.compareDocumentPosition(b) :

                                    // Otherwise we know they are disconnected
                                    1;

                                // Disconnected nodes
                                if (compare & 1 ||
                                    (!support.sortDetached && b.compareDocumentPosition(a) === compare)) {

                                    // Choose the first element that is related to our preferred document
                                    if (a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                                        return -1;
                                    }
                                    if (b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                                        return 1;
                                    }

                                    // Maintain original order
                                    return sortInput ?
                                        (indexOf(sortInput, a) - indexOf(sortInput, b)) :
                                        0;
                                }

                                return compare & 4 ? -1 : 1;
                            } :
                            function (a, b) {
                                // Exit early if the nodes are identical
                                if (a === b) {
                                    hasDuplicate = true;
                                    return 0;
                                }

                                var cur,
                                    i = 0,
                                    aup = a.parentNode,
                                    bup = b.parentNode,
                                    ap = [a],
                                    bp = [b];

                                // Parentless nodes are either documents or disconnected
                                if (!aup || !bup) {
                                    return a === document ? -1 :
                                        b === document ? 1 :
                                            aup ? -1 :
                                                bup ? 1 :
                                                    sortInput ?
                                                        (indexOf(sortInput, a) - indexOf(sortInput, b)) :
                                                        0;

                                    // If the nodes are siblings, we can do a quick check
                                } else if (aup === bup) {
                                    return siblingCheck(a, b);
                                }

                                // Otherwise we need full lists of their ancestors for comparison
                                cur = a;
                                while ((cur = cur.parentNode)) {
                                    ap.unshift(cur);
                                }
                                cur = b;
                                while ((cur = cur.parentNode)) {
                                    bp.unshift(cur);
                                }

                                // Walk down the tree looking for a discrepancy
                                while (ap[i] === bp[i]) {
                                    i++;
                                }

                                return i ?
                                    // Do a sibling check if the nodes have a common ancestor
                                    siblingCheck(ap[i], bp[i]) :

                                    // Otherwise nodes in our document sort first
                                    ap[i] === preferredDoc ? -1 :
                                        bp[i] === preferredDoc ? 1 :
                                            0;
                            };

                        return document;
                    };

                    Sizzle.matches = function (expr, elements) {
                        return Sizzle(expr, null, null, elements);
                    };

                    Sizzle.matchesSelector = function (elem, expr) {
                        // Set document vars if needed
                        if ((elem.ownerDocument || elem) !== document) {
                            setDocument(elem);
                        }

                        // Make sure that attribute selectors are quoted
                        expr = expr.replace(rattributeQuotes, "='$1']");

                        if (support.matchesSelector && documentIsHTML &&
                            !compilerCache[expr + " "] &&
                            (!rbuggyMatches || !rbuggyMatches.test(expr)) &&
                            (!rbuggyQSA || !rbuggyQSA.test(expr))) {

                            try {
                                var ret = matches.call(elem, expr);

                                // IE 9's matchesSelector returns false on disconnected nodes
                                if (ret || support.disconnectedMatch ||
                                    // As well, disconnected nodes are said to be in a document
                                    // fragment in IE 9
                                    elem.document && elem.document.nodeType !== 11) {
                                    return ret;
                                }
                            } catch (e) { }
                        }

                        return Sizzle(expr, document, null, [elem]).length > 0;
                    };

                    Sizzle.contains = function (context, elem) {
                        // Set document vars if needed
                        if ((context.ownerDocument || context) !== document) {
                            setDocument(context);
                        }
                        return contains(context, elem);
                    };

                    Sizzle.attr = function (elem, name) {
                        // Set document vars if needed
                        if ((elem.ownerDocument || elem) !== document) {
                            setDocument(elem);
                        }

                        var fn = Expr.attrHandle[name.toLowerCase()],
                            // Don't get fooled by Object.prototype properties (jQuery #13807)
                            val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ?
                                fn(elem, name, !documentIsHTML) :
                                undefined;

                        return val !== undefined ?
                            val :
                            support.attributes || !documentIsHTML ?
                                elem.getAttribute(name) :
                                (val = elem.getAttributeNode(name)) && val.specified ?
                                    val.value :
                                    null;
                    };

                    Sizzle.escape = function (sel) {
                        return (sel + "").replace(rcssescape, fcssescape);
                    };

                    Sizzle.error = function (msg) {
                        throw new Error("Syntax error, unrecognized expression: " + msg);
                    };

                    /**
                     * Document sorting and removing duplicates
                     * @param {ArrayLike} results
                     */
                    Sizzle.uniqueSort = function (results) {
                        var elem,
                            duplicates = [],
                            j = 0,
                            i = 0;

                        // Unless we *know* we can detect duplicates, assume their presence
                        hasDuplicate = !support.detectDuplicates;
                        sortInput = !support.sortStable && results.slice(0);
                        results.sort(sortOrder);

                        if (hasDuplicate) {
                            while ((elem = results[i++])) {
                                if (elem === results[i]) {
                                    j = duplicates.push(i);
                                }
                            }
                            while (j--) {
                                results.splice(duplicates[j], 1);
                            }
                        }

                        // Clear input after sorting to release objects
                        // See https://github.com/jquery/sizzle/pull/225
                        sortInput = null;

                        return results;
                    };

                    /**
                     * Utility function for retrieving the text value of an array of DOM nodes
                     * @param {Array|Element} elem
                     */
                    getText = Sizzle.getText = function (elem) {
                        var node,
                            ret = "",
                            i = 0,
                            nodeType = elem.nodeType;

                        if (!nodeType) {
                            // If no nodeType, this is expected to be an array
                            while ((node = elem[i++])) {
                                // Do not traverse comment nodes
                                ret += getText(node);
                            }
                        } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                            // Use textContent for elements
                            // innerText usage removed for consistency of new lines (jQuery #11153)
                            if (typeof elem.textContent === "string") {
                                return elem.textContent;
                            } else {
                                // Traverse its children
                                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                    ret += getText(elem);
                                }
                            }
                        } else if (nodeType === 3 || nodeType === 4) {
                            return elem.nodeValue;
                        }
                        // Do not include comment or processing instruction nodes

                        return ret;
                    };

                    Expr = Sizzle.selectors = {

                        // Can be adjusted by the user
                        cacheLength: 50,

                        createPseudo: markFunction,

                        match: matchExpr,

                        attrHandle: {},

                        find: {},

                        relative: {
                            ">": { dir: "parentNode", first: true },
                            " ": { dir: "parentNode" },
                            "+": { dir: "previousSibling", first: true },
                            "~": { dir: "previousSibling" }
                        },

                        preFilter: {
                            "ATTR": function (match) {
                                match[1] = match[1].replace(runescape, funescape);

                                // Move the given value to match[3] whether quoted or unquoted
                                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);

                                if (match[2] === "~=") {
                                    match[3] = " " + match[3] + " ";
                                }

                                return match.slice(0, 4);
                            },

                            "CHILD": function (match) {
                                /* matches from matchExpr["CHILD"]
                                    1 type (only|nth|...)
                                    2 what (child|of-type)
                                    3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
                                    4 xn-component of xn+y argument ([+-]?\d*n|)
                                    5 sign of xn-component
                                    6 x of xn-component
                                    7 sign of y-component
                                    8 y of y-component
                                */
                                match[1] = match[1].toLowerCase();

                                if (match[1].slice(0, 3) === "nth") {
                                    // nth-* requires argument
                                    if (!match[3]) {
                                        Sizzle.error(match[0]);
                                    }

                                    // numeric x and y parameters for Expr.filter.CHILD
                                    // remember that false/true cast respectively to 0/1
                                    match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                                    match[5] = +((match[7] + match[8]) || match[3] === "odd");

                                    // other types prohibit arguments
                                } else if (match[3]) {
                                    Sizzle.error(match[0]);
                                }

                                return match;
                            },

                            "PSEUDO": function (match) {
                                var excess,
                                    unquoted = !match[6] && match[2];

                                if (matchExpr["CHILD"].test(match[0])) {
                                    return null;
                                }

                                // Accept quoted arguments as-is
                                if (match[3]) {
                                    match[2] = match[4] || match[5] || "";

                                    // Strip excess characters from unquoted arguments
                                } else if (unquoted && rpseudo.test(unquoted) &&
                                    // Get excess from tokenize (recursively)
                                    (excess = tokenize(unquoted, true)) &&
                                    // advance to the next closing parenthesis
                                    (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {

                                    // excess is a negative index
                                    match[0] = match[0].slice(0, excess);
                                    match[2] = unquoted.slice(0, excess);
                                }

                                // Return only captures needed by the pseudo filter method (type and argument)
                                return match.slice(0, 3);
                            }
                        },

                        filter: {

                            "TAG": function (nodeNameSelector) {
                                var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                                return nodeNameSelector === "*" ?
                                    function () { return true; } :
                                    function (elem) {
                                        return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                                    };
                            },

                            "CLASS": function (className) {
                                var pattern = classCache[className + " "];

                                return pattern ||
                                    (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) &&
                                    classCache(className, function (elem) {
                                        return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                                    });
                            },

                            "ATTR": function (name, operator, check) {
                                return function (elem) {
                                    var result = Sizzle.attr(elem, name);

                                    if (result == null) {
                                        return operator === "!=";
                                    }
                                    if (!operator) {
                                        return true;
                                    }

                                    result += "";

                                    return operator === "=" ? result === check :
                                        operator === "!=" ? result !== check :
                                            operator === "^=" ? check && result.indexOf(check) === 0 :
                                                operator === "*=" ? check && result.indexOf(check) > -1 :
                                                    operator === "$=" ? check && result.slice(-check.length) === check :
                                                        operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 :
                                                            operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" :
                                                                false;
                                };
                            },

                            "CHILD": function (type, what, argument, first, last) {
                                var simple = type.slice(0, 3) !== "nth",
                                    forward = type.slice(-4) !== "last",
                                    ofType = what === "of-type";

                                return first === 1 && last === 0 ?

                                    // Shortcut for :nth-*(n)
                                    function (elem) {
                                        return !!elem.parentNode;
                                    } :

                                    function (elem, context, xml) {
                                        var cache, uniqueCache, outerCache, node, nodeIndex, start,
                                            dir = simple !== forward ? "nextSibling" : "previousSibling",
                                            parent = elem.parentNode,
                                            name = ofType && elem.nodeName.toLowerCase(),
                                            useCache = !xml && !ofType,
                                            diff = false;

                                        if (parent) {

                                            // :(first|last|only)-(child|of-type)
                                            if (simple) {
                                                while (dir) {
                                                    node = elem;
                                                    while ((node = node[dir])) {
                                                        if (ofType ?
                                                            node.nodeName.toLowerCase() === name :
                                                            node.nodeType === 1) {

                                                            return false;
                                                        }
                                                    }
                                                    // Reverse direction for :only-* (if we haven't yet done so)
                                                    start = dir = type === "only" && !start && "nextSibling";
                                                }
                                                return true;
                                            }

                                            start = [forward ? parent.firstChild : parent.lastChild];

                                            // non-xml :nth-child(...) stores cache data on `parent`
                                            if (forward && useCache) {

                                                // Seek `elem` from a previously-cached index

                                                // ...in a gzip-friendly way
                                                node = parent;
                                                outerCache = node[expando] || (node[expando] = {});

                                                // Support: IE <9 only
                                                // Defend against cloned attroperties (jQuery gh-1709)
                                                uniqueCache = outerCache[node.uniqueID] ||
                                                    (outerCache[node.uniqueID] = {});

                                                cache = uniqueCache[type] || [];
                                                nodeIndex = cache[0] === dirruns && cache[1];
                                                diff = nodeIndex && cache[2];
                                                node = nodeIndex && parent.childNodes[nodeIndex];

                                                while ((node = ++nodeIndex && node && node[dir] ||

                                                    // Fallback to seeking `elem` from the start
                                                    (diff = nodeIndex = 0) || start.pop())) {

                                                    // When found, cache indexes on `parent` and break
                                                    if (node.nodeType === 1 && ++diff && node === elem) {
                                                        uniqueCache[type] = [dirruns, nodeIndex, diff];
                                                        break;
                                                    }
                                                }

                                            } else {
                                                // Use previously-cached element index if available
                                                if (useCache) {
                                                    // ...in a gzip-friendly way
                                                    node = elem;
                                                    outerCache = node[expando] || (node[expando] = {});

                                                    // Support: IE <9 only
                                                    // Defend against cloned attroperties (jQuery gh-1709)
                                                    uniqueCache = outerCache[node.uniqueID] ||
                                                        (outerCache[node.uniqueID] = {});

                                                    cache = uniqueCache[type] || [];
                                                    nodeIndex = cache[0] === dirruns && cache[1];
                                                    diff = nodeIndex;
                                                }

                                                // xml :nth-child(...)
                                                // or :nth-last-child(...) or :nth(-last)?-of-type(...)
                                                if (diff === false) {
                                                    // Use the same loop as above to seek `elem` from the start
                                                    while ((node = ++nodeIndex && node && node[dir] ||
                                                        (diff = nodeIndex = 0) || start.pop())) {

                                                        if ((ofType ?
                                                            node.nodeName.toLowerCase() === name :
                                                            node.nodeType === 1) &&
                                                            ++diff) {

                                                            // Cache the index of each encountered element
                                                            if (useCache) {
                                                                outerCache = node[expando] || (node[expando] = {});

                                                                // Support: IE <9 only
                                                                // Defend against cloned attroperties (jQuery gh-1709)
                                                                uniqueCache = outerCache[node.uniqueID] ||
                                                                    (outerCache[node.uniqueID] = {});

                                                                uniqueCache[type] = [dirruns, diff];
                                                            }

                                                            if (node === elem) {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            // Incorporate the offset, then check against cycle size
                                            diff -= last;
                                            return diff === first || (diff % first === 0 && diff / first >= 0);
                                        }
                                    };
                            },

                            "PSEUDO": function (pseudo, argument) {
                                // pseudo-class names are case-insensitive
                                // http://www.w3.org/TR/selectors/#pseudo-classes
                                // Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
                                // Remember that setFilters inherits from pseudos
                                var args,
                                    fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] ||
                                        Sizzle.error("unsupported pseudo: " + pseudo);

                                // The user may use createPseudo to indicate that
                                // arguments are needed to create the filter function
                                // just as Sizzle does
                                if (fn[expando]) {
                                    return fn(argument);
                                }

                                // But maintain support for old signatures
                                if (fn.length > 1) {
                                    args = [pseudo, pseudo, "", argument];
                                    return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ?
                                        markFunction(function (seed, matches) {
                                            var idx,
                                                matched = fn(seed, argument),
                                                i = matched.length;
                                            while (i--) {
                                                idx = indexOf(seed, matched[i]);
                                                seed[idx] = !(matches[idx] = matched[i]);
                                            }
                                        }) :
                                        function (elem) {
                                            return fn(elem, 0, args);
                                        };
                                }

                                return fn;
                            }
                        },

                        pseudos: {
                            // Potentially complex pseudos
                            "not": markFunction(function (selector) {
                                // Trim the selector passed to compile
                                // to avoid treating leading and trailing
                                // spaces as combinators
                                var input = [],
                                    results = [],
                                    matcher = compile(selector.replace(rtrim, "$1"));

                                return matcher[expando] ?
                                    markFunction(function (seed, matches, context, xml) {
                                        var elem,
                                            unmatched = matcher(seed, null, xml, []),
                                            i = seed.length;

                                        // Match elements unmatched by `matcher`
                                        while (i--) {
                                            if ((elem = unmatched[i])) {
                                                seed[i] = !(matches[i] = elem);
                                            }
                                        }
                                    }) :
                                    function (elem, context, xml) {
                                        input[0] = elem;
                                        matcher(input, null, xml, results);
                                        // Don't keep the element (issue #299)
                                        input[0] = null;
                                        return !results.pop();
                                    };
                            }),

                            "has": markFunction(function (selector) {
                                return function (elem) {
                                    return Sizzle(selector, elem).length > 0;
                                };
                            }),

                            "contains": markFunction(function (text) {
                                text = text.replace(runescape, funescape);
                                return function (elem) {
                                    return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                                };
                            }),

                            // "Whether an element is represented by a :lang() selector
                            // is based solely on the element's language value
                            // being equal to the identifier C,
                            // or beginning with the identifier C immediately followed by "-".
                            // The matching of C against the element's language value is performed case-insensitively.
                            // The identifier C does not have to be a valid language name."
                            // http://www.w3.org/TR/selectors/#lang-pseudo
                            "lang": markFunction(function (lang) {
                                // lang value must be a valid identifier
                                if (!ridentifier.test(lang || "")) {
                                    Sizzle.error("unsupported lang: " + lang);
                                }
                                lang = lang.replace(runescape, funescape).toLowerCase();
                                return function (elem) {
                                    var elemLang;
                                    do {
                                        if ((elemLang = documentIsHTML ?
                                            elem.lang :
                                            elem.getAttribute("xml:lang") || elem.getAttribute("lang"))) {

                                            elemLang = elemLang.toLowerCase();
                                            return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                                        }
                                    } while ((elem = elem.parentNode) && elem.nodeType === 1);
                                    return false;
                                };
                            }),

                            // Miscellaneous
                            "target": function (elem) {
                                var hash = window.location && window.location.hash;
                                return hash && hash.slice(1) === elem.id;
                            },

                            "root": function (elem) {
                                return elem === docElem;
                            },

                            "focus": function (elem) {
                                return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
                            },

                            // Boolean properties
                            "enabled": createDisabledPseudo(false),
                            "disabled": createDisabledPseudo(true),

                            "checked": function (elem) {
                                // In CSS3, :checked should return both checked and selected elements
                                // http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
                                var nodeName = elem.nodeName.toLowerCase();
                                return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
                            },

                            "selected": function (elem) {
                                // Accessing this property makes selected-by-default
                                // options in Safari work properly
                                if (elem.parentNode) {
                                    elem.parentNode.selectedIndex;
                                }

                                return elem.selected === true;
                            },

                            // Contents
                            "empty": function (elem) {
                                // http://www.w3.org/TR/selectors/#empty-pseudo
                                // :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
                                //   but not by others (comment: 8; processing instruction: 7; etc.)
                                // nodeType < 6 works because attributes (2) do not appear as children
                                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                                    if (elem.nodeType < 6) {
                                        return false;
                                    }
                                }
                                return true;
                            },

                            "parent": function (elem) {
                                return !Expr.pseudos["empty"](elem);
                            },

                            // Element/input types
                            "header": function (elem) {
                                return rheader.test(elem.nodeName);
                            },

                            "input": function (elem) {
                                return rinputs.test(elem.nodeName);
                            },

                            "button": function (elem) {
                                var name = elem.nodeName.toLowerCase();
                                return name === "input" && elem.type === "button" || name === "button";
                            },

                            "text": function (elem) {
                                var attr;
                                return elem.nodeName.toLowerCase() === "input" &&
                                    elem.type === "text" &&

                                    // Support: IE<8
                                    // New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
                                    ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
                            },

                            // Position-in-collection
                            "first": createPositionalPseudo(function () {
                                return [0];
                            }),

                            "last": createPositionalPseudo(function (matchIndexes, length) {
                                return [length - 1];
                            }),

                            "eq": createPositionalPseudo(function (matchIndexes, length, argument) {
                                return [argument < 0 ? argument + length : argument];
                            }),

                            "even": createPositionalPseudo(function (matchIndexes, length) {
                                var i = 0;
                                for (; i < length; i += 2) {
                                    matchIndexes.push(i);
                                }
                                return matchIndexes;
                            }),

                            "odd": createPositionalPseudo(function (matchIndexes, length) {
                                var i = 1;
                                for (; i < length; i += 2) {
                                    matchIndexes.push(i);
                                }
                                return matchIndexes;
                            }),

                            "lt": createPositionalPseudo(function (matchIndexes, length, argument) {
                                var i = argument < 0 ? argument + length : argument;
                                for (; --i >= 0;) {
                                    matchIndexes.push(i);
                                }
                                return matchIndexes;
                            }),

                            "gt": createPositionalPseudo(function (matchIndexes, length, argument) {
                                var i = argument < 0 ? argument + length : argument;
                                for (; ++i < length;) {
                                    matchIndexes.push(i);
                                }
                                return matchIndexes;
                            })
                        }
                    };

                    Expr.pseudos["nth"] = Expr.pseudos["eq"];

                    // Add button/input type pseudos
                    for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
                        Expr.pseudos[i] = createInputPseudo(i);
                    }
                    for (i in { submit: true, reset: true }) {
                        Expr.pseudos[i] = createButtonPseudo(i);
                    }

                    // Easy API for creating new setFilters
                    function setFilters() { }
                    setFilters.prototype = Expr.filters = Expr.pseudos;
                    Expr.setFilters = new setFilters();

                    tokenize = Sizzle.tokenize = function (selector, parseOnly) {
                        var matched, match, tokens, type,
                            soFar, groups, preFilters,
                            cached = tokenCache[selector + " "];

                        if (cached) {
                            return parseOnly ? 0 : cached.slice(0);
                        }

                        soFar = selector;
                        groups = [];
                        preFilters = Expr.preFilter;

                        while (soFar) {

                            // Comma and first run
                            if (!matched || (match = rcomma.exec(soFar))) {
                                if (match) {
                                    // Don't consume trailing commas as valid
                                    soFar = soFar.slice(match[0].length) || soFar;
                                }
                                groups.push((tokens = []));
                            }

                            matched = false;

                            // Combinators
                            if ((match = rcombinators.exec(soFar))) {
                                matched = match.shift();
                                tokens.push({
                                    value: matched,
                                    // Cast descendant combinators to space
                                    type: match[0].replace(rtrim, " ")
                                });
                                soFar = soFar.slice(matched.length);
                            }

                            // Filters
                            for (type in Expr.filter) {
                                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] ||
                                    (match = preFilters[type](match)))) {
                                    matched = match.shift();
                                    tokens.push({
                                        value: matched,
                                        type: type,
                                        matches: match
                                    });
                                    soFar = soFar.slice(matched.length);
                                }
                            }

                            if (!matched) {
                                break;
                            }
                        }

                        // Return the length of the invalid excess
                        // if we're just parsing
                        // Otherwise, throw an error or return tokens
                        return parseOnly ?
                            soFar.length :
                            soFar ?
                                Sizzle.error(selector) :
                                // Cache the tokens
                                tokenCache(selector, groups).slice(0);
                    };

                    function toSelector(tokens) {
                        var i = 0,
                            len = tokens.length,
                            selector = "";
                        for (; i < len; i++) {
                            selector += tokens[i].value;
                        }
                        return selector;
                    }

                    function addCombinator(matcher, combinator, base) {
                        var dir = combinator.dir,
                            skip = combinator.next,
                            key = skip || dir,
                            checkNonElements = base && key === "parentNode",
                            doneName = done++;

                        return combinator.first ?
                            // Check against closest ancestor/preceding element
                            function (elem, context, xml) {
                                while ((elem = elem[dir])) {
                                    if (elem.nodeType === 1 || checkNonElements) {
                                        return matcher(elem, context, xml);
                                    }
                                }
                                return false;
                            } :

                            // Check against all ancestor/preceding elements
                            function (elem, context, xml) {
                                var oldCache, uniqueCache, outerCache,
                                    newCache = [dirruns, doneName];

                                // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
                                if (xml) {
                                    while ((elem = elem[dir])) {
                                        if (elem.nodeType === 1 || checkNonElements) {
                                            if (matcher(elem, context, xml)) {
                                                return true;
                                            }
                                        }
                                    }
                                } else {
                                    while ((elem = elem[dir])) {
                                        if (elem.nodeType === 1 || checkNonElements) {
                                            outerCache = elem[expando] || (elem[expando] = {});

                                            // Support: IE <9 only
                                            // Defend against cloned attroperties (jQuery gh-1709)
                                            uniqueCache = outerCache[elem.uniqueID] || (outerCache[elem.uniqueID] = {});

                                            if (skip && skip === elem.nodeName.toLowerCase()) {
                                                elem = elem[dir] || elem;
                                            } else if ((oldCache = uniqueCache[key]) &&
                                                oldCache[0] === dirruns && oldCache[1] === doneName) {

                                                // Assign to newCache so results back-propagate to previous elements
                                                return (newCache[2] = oldCache[2]);
                                            } else {
                                                // Reuse newcache so results back-propagate to previous elements
                                                uniqueCache[key] = newCache;

                                                // A match means we're done; a fail means we have to keep checking
                                                if ((newCache[2] = matcher(elem, context, xml))) {
                                                    return true;
                                                }
                                            }
                                        }
                                    }
                                }
                                return false;
                            };
                    }

                    function elementMatcher(matchers) {
                        return matchers.length > 1 ?
                            function (elem, context, xml) {
                                var i = matchers.length;
                                while (i--) {
                                    if (!matchers[i](elem, context, xml)) {
                                        return false;
                                    }
                                }
                                return true;
                            } :
                            matchers[0];
                    }

                    function multipleContexts(selector, contexts, results) {
                        var i = 0,
                            len = contexts.length;
                        for (; i < len; i++) {
                            Sizzle(selector, contexts[i], results);
                        }
                        return results;
                    }

                    function condense(unmatched, map, filter, context, xml) {
                        var elem,
                            newUnmatched = [],
                            i = 0,
                            len = unmatched.length,
                            mapped = map != null;

                        for (; i < len; i++) {
                            if ((elem = unmatched[i])) {
                                if (!filter || filter(elem, context, xml)) {
                                    newUnmatched.push(elem);
                                    if (mapped) {
                                        map.push(i);
                                    }
                                }
                            }
                        }

                        return newUnmatched;
                    }

                    function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
                        if (postFilter && !postFilter[expando]) {
                            postFilter = setMatcher(postFilter);
                        }
                        if (postFinder && !postFinder[expando]) {
                            postFinder = setMatcher(postFinder, postSelector);
                        }
                        return markFunction(function (seed, results, context, xml) {
                            var temp, i, elem,
                                preMap = [],
                                postMap = [],
                                preexisting = results.length,

                                // Get initial elements from seed or context
                                elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),

                                // Prefilter to get matcher input, preserving a map for seed-results synchronization
                                matcherIn = preFilter && (seed || !selector) ?
                                    condense(elems, preMap, preFilter, context, xml) :
                                    elems,

                                matcherOut = matcher ?
                                    // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
                                    postFinder || (seed ? preFilter : preexisting || postFilter) ?

                                        // ...intermediate processing is necessary
                                        [] :

                                        // ...otherwise use results directly
                                        results :
                                    matcherIn;

                            // Find primary matches
                            if (matcher) {
                                matcher(matcherIn, matcherOut, context, xml);
                            }

                            // Apply postFilter
                            if (postFilter) {
                                temp = condense(matcherOut, postMap);
                                postFilter(temp, [], context, xml);

                                // Un-match failing elements by moving them back to matcherIn
                                i = temp.length;
                                while (i--) {
                                    if ((elem = temp[i])) {
                                        matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem);
                                    }
                                }
                            }

                            if (seed) {
                                if (postFinder || preFilter) {
                                    if (postFinder) {
                                        // Get the final matcherOut by condensing this intermediate into postFinder contexts
                                        temp = [];
                                        i = matcherOut.length;
                                        while (i--) {
                                            if ((elem = matcherOut[i])) {
                                                // Restore matcherIn since elem is not yet a final match
                                                temp.push((matcherIn[i] = elem));
                                            }
                                        }
                                        postFinder(null, (matcherOut = []), temp, xml);
                                    }

                                    // Move matched elements from seed to results to keep them synchronized
                                    i = matcherOut.length;
                                    while (i--) {
                                        if ((elem = matcherOut[i]) &&
                                            (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1) {

                                            seed[temp] = !(results[temp] = elem);
                                        }
                                    }
                                }

                                // Add elements to results, through postFinder if defined
                            } else {
                                matcherOut = condense(
                                    matcherOut === results ?
                                        matcherOut.splice(preexisting, matcherOut.length) :
                                        matcherOut
                                );
                                if (postFinder) {
                                    postFinder(null, results, matcherOut, xml);
                                } else {
                                    push.apply(results, matcherOut);
                                }
                            }
                        });
                    }

                    function matcherFromTokens(tokens) {
                        var checkContext, matcher, j,
                            len = tokens.length,
                            leadingRelative = Expr.relative[tokens[0].type],
                            implicitRelative = leadingRelative || Expr.relative[" "],
                            i = leadingRelative ? 1 : 0,

                            // The foundational matcher ensures that elements are reachable from top-level context(s)
                            matchContext = addCombinator(function (elem) {
                                return elem === checkContext;
                            }, implicitRelative, true),
                            matchAnyContext = addCombinator(function (elem) {
                                return indexOf(checkContext, elem) > -1;
                            }, implicitRelative, true),
                            matchers = [function (elem, context, xml) {
                                var ret = (!leadingRelative && (xml || context !== outermostContext)) || (
                                    (checkContext = context).nodeType ?
                                        matchContext(elem, context, xml) :
                                        matchAnyContext(elem, context, xml));
                                // Avoid hanging onto element (issue #299)
                                checkContext = null;
                                return ret;
                            }];

                        for (; i < len; i++) {
                            if ((matcher = Expr.relative[tokens[i].type])) {
                                matchers = [addCombinator(elementMatcher(matchers), matcher)];
                            } else {
                                matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches);

                                // Return special upon seeing a positional matcher
                                if (matcher[expando]) {
                                    // Find the next relative operator (if any) for proper handling
                                    j = ++i;
                                    for (; j < len; j++) {
                                        if (Expr.relative[tokens[j].type]) {
                                            break;
                                        }
                                    }
                                    return setMatcher(
                                        i > 1 && elementMatcher(matchers),
                                        i > 1 && toSelector(
                                            // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                                            tokens.slice(0, i - 1).concat({ value: tokens[i - 2].type === " " ? "*" : "" })
                                        ).replace(rtrim, "$1"),
                                        matcher,
                                        i < j && matcherFromTokens(tokens.slice(i, j)),
                                        j < len && matcherFromTokens((tokens = tokens.slice(j))),
                                        j < len && toSelector(tokens)
                                    );
                                }
                                matchers.push(matcher);
                            }
                        }

                        return elementMatcher(matchers);
                    }

                    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
                        var bySet = setMatchers.length > 0,
                            byElement = elementMatchers.length > 0,
                            superMatcher = function (seed, context, xml, results, outermost) {
                                var elem, j, matcher,
                                    matchedCount = 0,
                                    i = "0",
                                    unmatched = seed && [],
                                    setMatched = [],
                                    contextBackup = outermostContext,
                                    // We must always have either seed elements or outermost context
                                    elems = seed || byElement && Expr.find["TAG"]("*", outermost),
                                    // Use integer dirruns iff this is the outermost matcher
                                    dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
                                    len = elems.length;

                                if (outermost) {
                                    outermostContext = context === document || context || outermost;
                                }

                                // Add elements passing elementMatchers directly to results
                                // Support: IE<9, Safari
                                // Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
                                for (; i !== len && (elem = elems[i]) != null; i++) {
                                    if (byElement && elem) {
                                        j = 0;
                                        if (!context && elem.ownerDocument !== document) {
                                            setDocument(elem);
                                            xml = !documentIsHTML;
                                        }
                                        while ((matcher = elementMatchers[j++])) {
                                            if (matcher(elem, context || document, xml)) {
                                                results.push(elem);
                                                break;
                                            }
                                        }
                                        if (outermost) {
                                            dirruns = dirrunsUnique;
                                        }
                                    }

                                    // Track unmatched elements for set filters
                                    if (bySet) {
                                        // They will have gone through all possible matchers
                                        if ((elem = !matcher && elem)) {
                                            matchedCount--;
                                        }

                                        // Lengthen the array for every element, matched or not
                                        if (seed) {
                                            unmatched.push(elem);
                                        }
                                    }
                                }

                                // `i` is now the count of elements visited above, and adding it to `matchedCount`
                                // makes the latter nonnegative.
                                matchedCount += i;

                                // Apply set filters to unmatched elements
                                // NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
                                // equals `i`), unless we didn't visit _any_ elements in the above loop because we have
                                // no element matchers and no seed.
                                // Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
                                // case, which will result in a "00" `matchedCount` that differs from `i` but is also
                                // numerically zero.
                                if (bySet && i !== matchedCount) {
                                    j = 0;
                                    while ((matcher = setMatchers[j++])) {
                                        matcher(unmatched, setMatched, context, xml);
                                    }

                                    if (seed) {
                                        // Reintegrate element matches to eliminate the need for sorting
                                        if (matchedCount > 0) {
                                            while (i--) {
                                                if (!(unmatched[i] || setMatched[i])) {
                                                    setMatched[i] = pop.call(results);
                                                }
                                            }
                                        }

                                        // Discard index placeholder values to get only actual matches
                                        setMatched = condense(setMatched);
                                    }

                                    // Add matches to results
                                    push.apply(results, setMatched);

                                    // Seedless set matches succeeding multiple successful matchers stipulate sorting
                                    if (outermost && !seed && setMatched.length > 0 &&
                                        (matchedCount + setMatchers.length) > 1) {

                                        Sizzle.uniqueSort(results);
                                    }
                                }

                                // Override manipulation of globals by nested matchers
                                if (outermost) {
                                    dirruns = dirrunsUnique;
                                    outermostContext = contextBackup;
                                }

                                return unmatched;
                            };

                        return bySet ?
                            markFunction(superMatcher) :
                            superMatcher;
                    }

                    compile = Sizzle.compile = function (selector, match /* Internal Use Only */) {
                        var i,
                            setMatchers = [],
                            elementMatchers = [],
                            cached = compilerCache[selector + " "];

                        if (!cached) {
                            // Generate a function of recursive functions that can be used to check each element
                            if (!match) {
                                match = tokenize(selector);
                            }
                            i = match.length;
                            while (i--) {
                                cached = matcherFromTokens(match[i]);
                                if (cached[expando]) {
                                    setMatchers.push(cached);
                                } else {
                                    elementMatchers.push(cached);
                                }
                            }

                            // Cache the compiled function
                            cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));

                            // Save selector and tokenization
                            cached.selector = selector;
                        }
                        return cached;
                    };

                    /**
                     * A low-level selection function that works with Sizzle's compiled
                     *  selector functions
                     * @param {String|Function} selector A selector or a pre-compiled
                     *  selector function built with Sizzle.compile
                     * @param {Element} context
                     * @param {Array} [results]
                     * @param {Array} [seed] A set of elements to match against
                     */
                    select = Sizzle.select = function (selector, context, results, seed) {
                        var i, tokens, token, type, find,
                            compiled = typeof selector === "function" && selector,
                            match = !seed && tokenize((selector = compiled.selector || selector));

                        results = results || [];

                        // Try to minimize operations if there is only one selector in the list and no seed
                        // (the latter of which guarantees us context)
                        if (match.length === 1) {

                            // Reduce context if the leading compound selector is an ID
                            tokens = match[0] = match[0].slice(0);
                            if (tokens.length > 2 && (token = tokens[0]).type === "ID" &&
                                context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {

                                context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                                if (!context) {
                                    return results;

                                    // Precompiled matchers will still verify ancestry, so step up a level
                                } else if (compiled) {
                                    context = context.parentNode;
                                }

                                selector = selector.slice(tokens.shift().value.length);
                            }

                            // Fetch a seed set for right-to-left matching
                            i = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
                            while (i--) {
                                token = tokens[i];

                                // Abort if we hit a combinator
                                if (Expr.relative[(type = token.type)]) {
                                    break;
                                }
                                if ((find = Expr.find[type])) {
                                    // Search, expanding context for leading sibling combinators
                                    if ((seed = find(
                                        token.matches[0].replace(runescape, funescape),
                                        rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                                    ))) {

                                        // If seed is empty or no tokens remain, we can return early
                                        tokens.splice(i, 1);
                                        selector = seed.length && toSelector(tokens);
                                        if (!selector) {
                                            push.apply(results, seed);
                                            return results;
                                        }

                                        break;
                                    }
                                }
                            }
                        }

                        // Compile and execute a filtering function if one is not provided
                        // Provide `match` to avoid retokenization if we modified the selector above
                        (compiled || compile(selector, match))(
                            seed,
                            context,
                            !documentIsHTML,
                            results,
                            !context || rsibling.test(selector) && testContext(context.parentNode) || context
                        );
                        return results;
                    };

                    // One-time assignments

                    // Sort stability
                    support.sortStable = expando.split("").sort(sortOrder).join("") === expando;

                    // Support: Chrome 14-35+
                    // Always assume duplicates if they aren't passed to the comparison function
                    support.detectDuplicates = !!hasDuplicate;

                    // Initialize against the default document
                    setDocument();

                    // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
                    // Detached nodes confoundingly follow *each other*
                    support.sortDetached = assert(function (el) {
                        // Should return 1, but returns 4 (following)
                        return el.compareDocumentPosition(document.createElement("fieldset")) & 1;
                    });

                    // Support: IE<8
                    // Prevent attribute/property "interpolation"
                    // https://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
                    if (!assert(function (el) {
                        el.innerHTML = "<a href='#'></a>";
                        return el.firstChild.getAttribute("href") === "#";
                    })) {
                        addHandle("type|href|height|width", function (elem, name, isXML) {
                            if (!isXML) {
                                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
                            }
                        });
                    }

                    // Support: IE<9
                    // Use defaultValue in place of getAttribute("value")
                    if (!support.attributes || !assert(function (el) {
                        el.innerHTML = "<input/>";
                        el.firstChild.setAttribute("value", "");
                        return el.firstChild.getAttribute("value") === "";
                    })) {
                        addHandle("value", function (elem, name, isXML) {
                            if (!isXML && elem.nodeName.toLowerCase() === "input") {
                                return elem.defaultValue;
                            }
                        });
                    }

                    // Support: IE<9
                    // Use getAttributeNode to fetch booleans when getAttribute lies
                    if (!assert(function (el) {
                        return el.getAttribute("disabled") == null;
                    })) {
                        addHandle(booleans, function (elem, name, isXML) {
                            var val;
                            if (!isXML) {
                                return elem[name] === true ? name.toLowerCase() :
                                    (val = elem.getAttributeNode(name)) && val.specified ?
                                        val.value :
                                        null;
                            }
                        });
                    }

                    return Sizzle;

                })(window);



            jQuery.find = Sizzle;
            jQuery.expr = Sizzle.selectors;

            // Deprecated
            jQuery.expr[":"] = jQuery.expr.pseudos;
            jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
            jQuery.text = Sizzle.getText;
            jQuery.isXMLDoc = Sizzle.isXML;
            jQuery.contains = Sizzle.contains;
            jQuery.escapeSelector = Sizzle.escape;




            var dir = function (elem, dir, until) {
                var matched = [],
                    truncate = until !== undefined;

                while ((elem = elem[dir]) && elem.nodeType !== 9) {
                    if (elem.nodeType === 1) {
                        if (truncate && jQuery(elem).is(until)) {
                            break;
                        }
                        matched.push(elem);
                    }
                }
                return matched;
            };


            var siblings = function (n, elem) {
                var matched = [];

                for (; n; n = n.nextSibling) {
                    if (n.nodeType === 1 && n !== elem) {
                        matched.push(n);
                    }
                }

                return matched;
            };


            var rneedsContext = jQuery.expr.match.needsContext;



            function nodeName(elem, name) {

                return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();

            };
            var rsingleTag = (/^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i);



            var risSimple = /^.[^:#\[\.,]*$/;

            // Implement the identical functionality for filter and not
            function winnow(elements, qualifier, not) {
                if (jQuery.isFunction(qualifier)) {
                    return jQuery.grep(elements, function (elem, i) {
                        return !!qualifier.call(elem, i, elem) !== not;
                    });
                }

                // Single element
                if (qualifier.nodeType) {
                    return jQuery.grep(elements, function (elem) {
                        return (elem === qualifier) !== not;
                    });
                }

                // Arraylike of elements (jQuery, arguments, Array)
                if (typeof qualifier !== "string") {
                    return jQuery.grep(elements, function (elem) {
                        return (indexOf.call(qualifier, elem) > -1) !== not;
                    });
                }

                // Simple selector that can be filtered directly, removing non-Elements
                if (risSimple.test(qualifier)) {
                    return jQuery.filter(qualifier, elements, not);
                }

                // Complex selector, compare the two sets, removing non-Elements
                qualifier = jQuery.filter(qualifier, elements);
                return jQuery.grep(elements, function (elem) {
                    return (indexOf.call(qualifier, elem) > -1) !== not && elem.nodeType === 1;
                });
            }

            jQuery.filter = function (expr, elems, not) {
                var elem = elems[0];

                if (not) {
                    expr = ":not(" + expr + ")";
                }

                if (elems.length === 1 && elem.nodeType === 1) {
                    return jQuery.find.matchesSelector(elem, expr) ? [elem] : [];
                }

                return jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
                    return elem.nodeType === 1;
                }));
            };

            jQuery.fn.extend({
                find: function (selector) {
                    var i, ret,
                        len = this.length,
                        self = this;

                    if (typeof selector !== "string") {
                        return this.pushStack(jQuery(selector).filter(function () {
                            for (i = 0; i < len; i++) {
                                if (jQuery.contains(self[i], this)) {
                                    return true;
                                }
                            }
                        }));
                    }

                    ret = this.pushStack([]);

                    for (i = 0; i < len; i++) {
                        jQuery.find(selector, self[i], ret);
                    }

                    return len > 1 ? jQuery.uniqueSort(ret) : ret;
                },
                filter: function (selector) {
                    return this.pushStack(winnow(this, selector || [], false));
                },
                not: function (selector) {
                    return this.pushStack(winnow(this, selector || [], true));
                },
                is: function (selector) {
                    return !!winnow(
                        this,

                        // If this is a positional/relative selector, check membership in the returned set
                        // so $("p:first").is("p:last") won't return true for a doc with two "p".
                        typeof selector === "string" && rneedsContext.test(selector) ?
                            jQuery(selector) :
                            selector || [],
                        false
                    ).length;
                }
            });


            // Initialize a jQuery object


            // A central reference to the root jQuery(document)
            var rootjQuery,

                // A simple way to check for HTML strings
                // Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
                // Strict HTML recognition (#11290: must start with <)
                // Shortcut simple #id case for speed
                rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,

                init = jQuery.fn.init = function (selector, context, root) {
                    var match, elem;

                    // HANDLE: $(""), $(null), $(undefined), $(false)
                    if (!selector) {
                        return this;
                    }

                    // Method init() accepts an alternate rootjQuery
                    // so migrate can support jQuery.sub (gh-2101)
                    root = root || rootjQuery;

                    // Handle HTML strings
                    if (typeof selector === "string") {
                        if (selector[0] === "<" &&
                            selector[selector.length - 1] === ">" &&
                            selector.length >= 3) {

                            // Assume that strings that start and end with <> are HTML and skip the regex check
                            match = [null, selector, null];

                        } else {
                            match = rquickExpr.exec(selector);
                        }

                        // Match html or make sure no context is specified for #id
                        if (match && (match[1] || !context)) {

                            // HANDLE: $(html) -> $(array)
                            if (match[1]) {
                                context = context instanceof jQuery ? context[0] : context;

                                // Option to run scripts is true for back-compat
                                // Intentionally let the error be thrown if parseHTML is not present
                                jQuery.merge(this, jQuery.parseHTML(
                                    match[1],
                                    context && context.nodeType ? context.ownerDocument || context : document,
                                    true
                                ));

                                // HANDLE: $(html, props)
                                if (rsingleTag.test(match[1]) && jQuery.isPlainObject(context)) {
                                    for (match in context) {

                                        // Properties of context are called as methods if possible
                                        if (jQuery.isFunction(this[match])) {
                                            this[match](context[match]);

                                            // ...and otherwise set as attributes
                                        } else {
                                            this.attr(match, context[match]);
                                        }
                                    }
                                }

                                return this;

                                // HANDLE: $(#id)
                            } else {
                                elem = document.getElementById(match[2]);

                                if (elem) {

                                    // Inject the element directly into the jQuery object
                                    this[0] = elem;
                                    this.length = 1;
                                }
                                return this;
                            }

                            // HANDLE: $(expr, $(...))
                        } else if (!context || context.jquery) {
                            return (context || root).find(selector);

                            // HANDLE: $(expr, context)
                            // (which is just equivalent to: $(context).find(expr)
                        } else {
                            return this.constructor(context).find(selector);
                        }

                        // HANDLE: $(DOMElement)
                    } else if (selector.nodeType) {
                        this[0] = selector;
                        this.length = 1;
                        return this;

                        // HANDLE: $(function)
                        // Shortcut for document ready
                    } else if (jQuery.isFunction(selector)) {
                        return root.ready !== undefined ?
                            root.ready(selector) :

                            // Execute immediately if ready is not present
                            selector(jQuery);
                    }

                    return jQuery.makeArray(selector, this);
                };

            // Give the init function the jQuery prototype for later instantiation
            init.prototype = jQuery.fn;

            // Initialize central reference
            rootjQuery = jQuery(document);


            var rparentsprev = /^(?:parents|prev(?:Until|All))/,

                // Methods guaranteed to produce a unique set when starting from a unique set
                guaranteedUnique = {
                    children: true,
                    contents: true,
                    next: true,
                    prev: true
                };

            jQuery.fn.extend({
                has: function (target) {
                    var targets = jQuery(target, this),
                        l = targets.length;

                    return this.filter(function () {
                        var i = 0;
                        for (; i < l; i++) {
                            if (jQuery.contains(this, targets[i])) {
                                return true;
                            }
                        }
                    });
                },

                closest: function (selectors, context) {
                    var cur,
                        i = 0,
                        l = this.length,
                        matched = [],
                        targets = typeof selectors !== "string" && jQuery(selectors);

                    // Positional selectors never match, since there's no _selection_ context
                    if (!rneedsContext.test(selectors)) {
                        for (; i < l; i++) {
                            for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {

                                // Always skip document fragments
                                if (cur.nodeType < 11 && (targets ?
                                    targets.index(cur) > -1 :

                                    // Don't pass non-elements to Sizzle
                                    cur.nodeType === 1 &&
                                    jQuery.find.matchesSelector(cur, selectors))) {

                                    matched.push(cur);
                                    break;
                                }
                            }
                        }
                    }

                    return this.pushStack(matched.length > 1 ? jQuery.uniqueSort(matched) : matched);
                },

                // Determine the position of an element within the set
                index: function (elem) {

                    // No argument, return index in parent
                    if (!elem) {
                        return (this[0] && this[0].parentNode) ? this.first().prevAll().length : -1;
                    }

                    // Index in selector
                    if (typeof elem === "string") {
                        return indexOf.call(jQuery(elem), this[0]);
                    }

                    // Locate the position of the desired element
                    return indexOf.call(this,

                        // If it receives a jQuery object, the first element is used
                        elem.jquery ? elem[0] : elem
                    );
                },

                add: function (selector, context) {
                    return this.pushStack(
                        jQuery.uniqueSort(
                            jQuery.merge(this.get(), jQuery(selector, context))
                        )
                    );
                },

                addBack: function (selector) {
                    return this.add(selector == null ?
                        this.prevObject : this.prevObject.filter(selector)
                    );
                }
            });

            function sibling(cur, dir) {
                while ((cur = cur[dir]) && cur.nodeType !== 1) { }
                return cur;
            }

            jQuery.each({
                parent: function (elem) {
                    var parent = elem.parentNode;
                    return parent && parent.nodeType !== 11 ? parent : null;
                },
                parents: function (elem) {
                    return dir(elem, "parentNode");
                },
                parentsUntil: function (elem, i, until) {
                    return dir(elem, "parentNode", until);
                },
                next: function (elem) {
                    return sibling(elem, "nextSibling");
                },
                prev: function (elem) {
                    return sibling(elem, "previousSibling");
                },
                nextAll: function (elem) {
                    return dir(elem, "nextSibling");
                },
                prevAll: function (elem) {
                    return dir(elem, "previousSibling");
                },
                nextUntil: function (elem, i, until) {
                    return dir(elem, "nextSibling", until);
                },
                prevUntil: function (elem, i, until) {
                    return dir(elem, "previousSibling", until);
                },
                siblings: function (elem) {
                    return siblings((elem.parentNode || {}).firstChild, elem);
                },
                children: function (elem) {
                    return siblings(elem.firstChild);
                },
                contents: function (elem) {
                    if (nodeName(elem, "iframe")) {
                        return elem.contentDocument;
                    }

                    // Support: IE 9 - 11 only, iOS 7 only, Android Browser <=4.3 only
                    // Treat the template element as a regular one in browsers that
                    // don't support it.
                    if (nodeName(elem, "template")) {
                        elem = elem.content || elem;
                    }

                    return jQuery.merge([], elem.childNodes);
                }
            }, function (name, fn) {
                jQuery.fn[name] = function (until, selector) {
                    var matched = jQuery.map(this, fn, until);

                    if (name.slice(-5) !== "Until") {
                        selector = until;
                    }

                    if (selector && typeof selector === "string") {
                        matched = jQuery.filter(selector, matched);
                    }

                    if (this.length > 1) {

                        // Remove duplicates
                        if (!guaranteedUnique[name]) {
                            jQuery.uniqueSort(matched);
                        }

                        // Reverse order for parents* and prev-derivatives
                        if (rparentsprev.test(name)) {
                            matched.reverse();
                        }
                    }

                    return this.pushStack(matched);
                };
            });
            var rnothtmlwhite = (/[^\x20\t\r\n\f]+/g);



            // Convert String-formatted options into Object-formatted ones
            function createOptions(options) {
                var object = {};
                jQuery.each(options.match(rnothtmlwhite) || [], function (_, flag) {
                    object[flag] = true;
                });
                return object;
            }

            /*
             * Create a callback list using the following parameters:
             *
             *	options: an optional list of space-separated options that will change how
             *			the callback list behaves or a more traditional option object
             *
             * By default a callback list will act like an event callback list and can be
             * "fired" multiple times.
             *
             * Possible options:
             *
             *	once:			will ensure the callback list can only be fired once (like a Deferred)
             *
             *	memory:			will keep track of previous values and will call any callback added
             *					after the list has been fired right away with the latest "memorized"
             *					values (like a Deferred)
             *
             *	unique:			will ensure a callback can only be added once (no duplicate in the list)
             *
             *	stopOnFalse:	interrupt callings when a callback returns false
             *
             */
            jQuery.Callbacks = function (options) {

                // Convert options from String-formatted to Object-formatted if needed
                // (we check in cache first)
                options = typeof options === "string" ?
                    createOptions(options) :
                    jQuery.extend({}, options);

                var // Flag to know if list is currently firing
                    firing,

                    // Last fire value for non-forgettable lists
                    memory,

                    // Flag to know if list was already fired
                    fired,

                    // Flag to prevent firing
                    locked,

                    // Actual callback list
                    list = [],

                    // Queue of execution data for repeatable lists
                    queue = [],

                    // Index of currently firing callback (modified by add/remove as needed)
                    firingIndex = -1,

                    // Fire callbacks
                    fire = function () {

                        // Enforce single-firing
                        locked = locked || options.once;

                        // Execute callbacks for all pending executions,
                        // respecting firingIndex overrides and runtime changes
                        fired = firing = true;
                        for (; queue.length; firingIndex = -1) {
                            memory = queue.shift();
                            while (++firingIndex < list.length) {

                                // Run callback and check for early termination
                                if (list[firingIndex].apply(memory[0], memory[1]) === false &&
                                    options.stopOnFalse) {

                                    // Jump to end and forget the data so .add doesn't re-fire
                                    firingIndex = list.length;
                                    memory = false;
                                }
                            }
                        }

                        // Forget the data if we're done with it
                        if (!options.memory) {
                            memory = false;
                        }

                        firing = false;

                        // Clean up if we're done firing for good
                        if (locked) {

                            // Keep an empty list if we have data for future add calls
                            if (memory) {
                                list = [];

                                // Otherwise, this object is spent
                            } else {
                                list = "";
                            }
                        }
                    },

                    // Actual Callbacks object
                    self = {

                        // Add a callback or a collection of callbacks to the list
                        add: function () {
                            if (list) {

                                // If we have memory from a past run, we should fire after adding
                                if (memory && !firing) {
                                    firingIndex = list.length - 1;
                                    queue.push(memory);
                                }

                                (function add(args) {
                                    jQuery.each(args, function (_, arg) {
                                        if (jQuery.isFunction(arg)) {
                                            if (!options.unique || !self.has(arg)) {
                                                list.push(arg);
                                            }
                                        } else if (arg && arg.length && jQuery.type(arg) !== "string") {

                                            // Inspect recursively
                                            add(arg);
                                        }
                                    });
                                })(arguments);

                                if (memory && !firing) {
                                    fire();
                                }
                            }
                            return this;
                        },

                        // Remove a callback from the list
                        remove: function () {
                            jQuery.each(arguments, function (_, arg) {
                                var index;
                                while ((index = jQuery.inArray(arg, list, index)) > -1) {
                                    list.splice(index, 1);

                                    // Handle firing indexes
                                    if (index <= firingIndex) {
                                        firingIndex--;
                                    }
                                }
                            });
                            return this;
                        },

                        // Check if a given callback is in the list.
                        // If no argument is given, return whether or not list has callbacks attached.
                        has: function (fn) {
                            return fn ?
                                jQuery.inArray(fn, list) > -1 :
                                list.length > 0;
                        },

                        // Remove all callbacks from the list
                        empty: function () {
                            if (list) {
                                list = [];
                            }
                            return this;
                        },

                        // Disable .fire and .add
                        // Abort any current/pending executions
                        // Clear all callbacks and values
                        disable: function () {
                            locked = queue = [];
                            list = memory = "";
                            return this;
                        },
                        disabled: function () {
                            return !list;
                        },

                        // Disable .fire
                        // Also disable .add unless we have memory (since it would have no effect)
                        // Abort any pending executions
                        lock: function () {
                            locked = queue = [];
                            if (!memory && !firing) {
                                list = memory = "";
                            }
                            return this;
                        },
                        locked: function () {
                            return !!locked;
                        },

                        // Call all callbacks with the given context and arguments
                        fireWith: function (context, args) {
                            if (!locked) {
                                args = args || [];
                                args = [context, args.slice ? args.slice() : args];
                                queue.push(args);
                                if (!firing) {
                                    fire();
                                }
                            }
                            return this;
                        },

                        // Call all the callbacks with the given arguments
                        fire: function () {
                            self.fireWith(this, arguments);
                            return this;
                        },

                        // To know if the callbacks have already been called at least once
                        fired: function () {
                            return !!fired;
                        }
                    };

                return self;
            };


            function Identity(v) {
                return v;
            }
            function Thrower(ex) {
                throw ex;
            }

            function adoptValue(value, resolve, reject, noValue) {
                var method;

                try {

                    // Check for promise aspect first to privilege synchronous behavior
                    if (value && jQuery.isFunction((method = value.promise))) {
                        method.call(value).done(resolve).fail(reject);

                        // Other thenables
                    } else if (value && jQuery.isFunction((method = value.then))) {
                        method.call(value, resolve, reject);

                        // Other non-thenables
                    } else {

                        // Control `resolve` arguments by letting Array#slice cast boolean `noValue` to integer:
                        // * false: [ value ].slice( 0 ) => resolve( value )
                        // * true: [ value ].slice( 1 ) => resolve()
                        resolve.apply(undefined, [value].slice(noValue));
                    }

                    // For Promises/A+, convert exceptions into rejections
                    // Since jQuery.when doesn't unwrap thenables, we can skip the extra checks appearing in
                    // Deferred#then to conditionally suppress rejection.
                } catch (value) {

                    // Support: Android 4.0 only
                    // Strict mode functions invoked without .call/.apply get global-object context
                    reject.apply(undefined, [value]);
                }
            }

            jQuery.extend({

                Deferred: function (func) {
                    var tuples = [

                        // action, add listener, callbacks,
                        // ... .then handlers, argument index, [final state]
                        ["notify", "progress", jQuery.Callbacks("memory"),
                            jQuery.Callbacks("memory"), 2],
                        ["resolve", "done", jQuery.Callbacks("once memory"),
                            jQuery.Callbacks("once memory"), 0, "resolved"],
                        ["reject", "fail", jQuery.Callbacks("once memory"),
                            jQuery.Callbacks("once memory"), 1, "rejected"]
                    ],
                        state = "pending",
                        promise = {
                            state: function () {
                                return state;
                            },
                            always: function () {
                                deferred.done(arguments).fail(arguments);
                                return this;
                            },
                            "catch": function (fn) {
                                return promise.then(null, fn);
                            },

                            // Keep pipe for back-compat
                            pipe: function ( /* fnDone, fnFail, fnProgress */) {
                                var fns = arguments;

                                return jQuery.Deferred(function (newDefer) {
                                    jQuery.each(tuples, function (i, tuple) {

                                        // Map tuples (progress, done, fail) to arguments (done, fail, progress)
                                        var fn = jQuery.isFunction(fns[tuple[4]]) && fns[tuple[4]];

                                        // deferred.progress(function() { bind to newDefer or newDefer.notify })
                                        // deferred.done(function() { bind to newDefer or newDefer.resolve })
                                        // deferred.fail(function() { bind to newDefer or newDefer.reject })
                                        deferred[tuple[1]](function () {
                                            var returned = fn && fn.apply(this, arguments);
                                            if (returned && jQuery.isFunction(returned.promise)) {
                                                returned.promise()
                                                    .progress(newDefer.notify)
                                                    .done(newDefer.resolve)
                                                    .fail(newDefer.reject);
                                            } else {
                                                newDefer[tuple[0] + "With"](
                                                    this,
                                                    fn ? [returned] : arguments
                                                );
                                            }
                                        });
                                    });
                                    fns = null;
                                }).promise();
                            },
                            then: function (onFulfilled, onRejected, onProgress) {
                                var maxDepth = 0;
                                function resolve(depth, deferred, handler, special) {
                                    return function () {
                                        var that = this,
                                            args = arguments,
                                            mightThrow = function () {
                                                var returned, then;

                                                // Support: Promises/A+ section 2.3.3.3.3
                                                // https://promisesaplus.com/#point-59
                                                // Ignore double-resolution attempts
                                                if (depth < maxDepth) {
                                                    return;
                                                }

                                                returned = handler.apply(that, args);

                                                // Support: Promises/A+ section 2.3.1
                                                // https://promisesaplus.com/#point-48
                                                if (returned === deferred.promise()) {
                                                    throw new TypeError("Thenable self-resolution");
                                                }

                                                // Support: Promises/A+ sections 2.3.3.1, 3.5
                                                // https://promisesaplus.com/#point-54
                                                // https://promisesaplus.com/#point-75
                                                // Retrieve `then` only once
                                                then = returned &&

                                                    // Support: Promises/A+ section 2.3.4
                                                    // https://promisesaplus.com/#point-64
                                                    // Only check objects and functions for thenability
                                                    (typeof returned === "object" ||
                                                        typeof returned === "function") &&
                                                    returned.then;

                                                // Handle a returned thenable
                                                if (jQuery.isFunction(then)) {

                                                    // Special processors (notify) just wait for resolution
                                                    if (special) {
                                                        then.call(
                                                            returned,
                                                            resolve(maxDepth, deferred, Identity, special),
                                                            resolve(maxDepth, deferred, Thrower, special)
                                                        );

                                                        // Normal processors (resolve) also hook into progress
                                                    } else {

                                                        // ...and disregard older resolution values
                                                        maxDepth++;

                                                        then.call(
                                                            returned,
                                                            resolve(maxDepth, deferred, Identity, special),
                                                            resolve(maxDepth, deferred, Thrower, special),
                                                            resolve(maxDepth, deferred, Identity,
                                                                deferred.notifyWith)
                                                        );
                                                    }

                                                    // Handle all other returned values
                                                } else {

                                                    // Only substitute handlers pass on context
                                                    // and multiple values (non-spec behavior)
                                                    if (handler !== Identity) {
                                                        that = undefined;
                                                        args = [returned];
                                                    }

                                                    // Process the value(s)
                                                    // Default process is resolve
                                                    (special || deferred.resolveWith)(that, args);
                                                }
                                            },

                                            // Only normal processors (resolve) catch and reject exceptions
                                            process = special ?
                                                mightThrow :
                                                function () {
                                                    try {
                                                        mightThrow();
                                                    } catch (e) {

                                                        if (jQuery.Deferred.exceptionHook) {
                                                            jQuery.Deferred.exceptionHook(e,
                                                                process.stackTrace);
                                                        }

                                                        // Support: Promises/A+ section 2.3.3.3.4.1
                                                        // https://promisesaplus.com/#point-61
                                                        // Ignore post-resolution exceptions
                                                        if (depth + 1 >= maxDepth) {

                                                            // Only substitute handlers pass on context
                                                            // and multiple values (non-spec behavior)
                                                            if (handler !== Thrower) {
                                                                that = undefined;
                                                                args = [e];
                                                            }

                                                            deferred.rejectWith(that, args);
                                                        }
                                                    }
                                                };

                                        // Support: Promises/A+ section 2.3.3.3.1
                                        // https://promisesaplus.com/#point-57
                                        // Re-resolve promises immediately to dodge false rejection from
                                        // subsequent errors
                                        if (depth) {
                                            process();
                                        } else {

                                            // Call an optional hook to record the stack, in case of exception
                                            // since it's otherwise lost when execution goes async
                                            if (jQuery.Deferred.getStackHook) {
                                                process.stackTrace = jQuery.Deferred.getStackHook();
                                            }
                                            window.setTimeout(process);
                                        }
                                    };
                                }

                                return jQuery.Deferred(function (newDefer) {

                                    // progress_handlers.add( ... )
                                    tuples[0][3].add(
                                        resolve(
                                            0,
                                            newDefer,
                                            jQuery.isFunction(onProgress) ?
                                                onProgress :
                                                Identity,
                                            newDefer.notifyWith
                                        )
                                    );

                                    // fulfilled_handlers.add( ... )
                                    tuples[1][3].add(
                                        resolve(
                                            0,
                                            newDefer,
                                            jQuery.isFunction(onFulfilled) ?
                                                onFulfilled :
                                                Identity
                                        )
                                    );

                                    // rejected_handlers.add( ... )
                                    tuples[2][3].add(
                                        resolve(
                                            0,
                                            newDefer,
                                            jQuery.isFunction(onRejected) ?
                                                onRejected :
                                                Thrower
                                        )
                                    );
                                }).promise();
                            },

                            // Get a promise for this deferred
                            // If obj is provided, the promise aspect is added to the object
                            promise: function (obj) {
                                return obj != null ? jQuery.extend(obj, promise) : promise;
                            }
                        },
                        deferred = {};

                    // Add list-specific methods
                    jQuery.each(tuples, function (i, tuple) {
                        var list = tuple[2],
                            stateString = tuple[5];

                        // promise.progress = list.add
                        // promise.done = list.add
                        // promise.fail = list.add
                        promise[tuple[1]] = list.add;

                        // Handle state
                        if (stateString) {
                            list.add(
                                function () {

                                    // state = "resolved" (i.e., fulfilled)
                                    // state = "rejected"
                                    state = stateString;
                                },

                                // rejected_callbacks.disable
                                // fulfilled_callbacks.disable
                                tuples[3 - i][2].disable,

                                // progress_callbacks.lock
                                tuples[0][2].lock
                            );
                        }

                        // progress_handlers.fire
                        // fulfilled_handlers.fire
                        // rejected_handlers.fire
                        list.add(tuple[3].fire);

                        // deferred.notify = function() { deferred.notifyWith(...) }
                        // deferred.resolve = function() { deferred.resolveWith(...) }
                        // deferred.reject = function() { deferred.rejectWith(...) }
                        deferred[tuple[0]] = function () {
                            deferred[tuple[0] + "With"](this === deferred ? undefined : this, arguments);
                            return this;
                        };

                        // deferred.notifyWith = list.fireWith
                        // deferred.resolveWith = list.fireWith
                        // deferred.rejectWith = list.fireWith
                        deferred[tuple[0] + "With"] = list.fireWith;
                    });

                    // Make the deferred a promise
                    promise.promise(deferred);

                    // Call given func if any
                    if (func) {
                        func.call(deferred, deferred);
                    }

                    // All done!
                    return deferred;
                },

                // Deferred helper
                when: function (singleValue) {
                    var

                        // count of uncompleted subordinates
                        remaining = arguments.length,

                        // count of unprocessed arguments
                        i = remaining,

                        // subordinate fulfillment data
                        resolveContexts = Array(i),
                        resolveValues = slice.call(arguments),

                        // the master Deferred
                        master = jQuery.Deferred(),

                        // subordinate callback factory
                        updateFunc = function (i) {
                            return function (value) {
                                resolveContexts[i] = this;
                                resolveValues[i] = arguments.length > 1 ? slice.call(arguments) : value;
                                if (!(--remaining)) {
                                    master.resolveWith(resolveContexts, resolveValues);
                                }
                            };
                        };

                    // Single- and empty arguments are adopted like Promise.resolve
                    if (remaining <= 1) {
                        adoptValue(singleValue, master.done(updateFunc(i)).resolve, master.reject,
                            !remaining);

                        // Use .then() to unwrap secondary thenables (cf. gh-3000)
                        if (master.state() === "pending" ||
                            jQuery.isFunction(resolveValues[i] && resolveValues[i].then)) {

                            return master.then();
                        }
                    }

                    // Multiple arguments are aggregated like Promise.all array elements
                    while (i--) {
                        adoptValue(resolveValues[i], updateFunc(i), master.reject);
                    }

                    return master.promise();
                }
            });


            // These usually indicate a programmer mistake during development,
            // warn about them ASAP rather than swallowing them by default.
            var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

            jQuery.Deferred.exceptionHook = function (error, stack) {

                // Support: IE 8 - 9 only
                // Console exists when dev tools are open, which can happen at any time
                if (window.console && window.console.warn && error && rerrorNames.test(error.name)) {
                    window.console.warn("jQuery.Deferred exception: " + error.message, error.stack, stack);
                }
            };




            jQuery.readyException = function (error) {
                window.setTimeout(function () {
                    throw error;
                });
            };




            // The deferred used on DOM ready
            var readyList = jQuery.Deferred();

            jQuery.fn.ready = function (fn) {

                readyList
                    .then(fn)

                    // Wrap jQuery.readyException in a function so that the lookup
                    // happens at the time of error handling instead of callback
                    // registration.
                    .catch(function (error) {
                        jQuery.readyException(error);
                    });

                return this;
            };

            jQuery.extend({

                // Is the DOM ready to be used? Set to true once it occurs.
                isReady: false,

                // A counter to track how many items to wait for before
                // the ready event fires. See #6781
                readyWait: 1,

                // Handle when the DOM is ready
                ready: function (wait) {

                    // Abort if there are pending holds or we're already ready
                    if (wait === true ? --jQuery.readyWait : jQuery.isReady) {
                        return;
                    }

                    // Remember that the DOM is ready
                    jQuery.isReady = true;

                    // If a normal DOM Ready event fired, decrement, and wait if need be
                    if (wait !== true && --jQuery.readyWait > 0) {
                        return;
                    }

                    // If there are functions bound, to execute
                    readyList.resolveWith(document, [jQuery]);
                }
            });

            jQuery.ready.then = readyList.then;

            // The ready event handler and self cleanup method
            function completed() {
                document.removeEventListener("DOMContentLoaded", completed);
                window.removeEventListener("load", completed);
                jQuery.ready();
            }

            // Catch cases where $(document).ready() is called
            // after the browser event has already occurred.
            // Support: IE <=9 - 10 only
            // Older IE sometimes signals "interactive" too soon
            if (document.readyState === "complete" ||
                (document.readyState !== "loading" && !document.documentElement.doScroll)) {

                // Handle it asynchronously to allow scripts the opportunity to delay ready
                window.setTimeout(jQuery.ready);

            } else {

                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", completed);

                // A fallback to window.onload, that will always work
                window.addEventListener("load", completed);
            }




            // Multifunctional method to get and set values of a collection
            // The value/s can optionally be executed if it's a function
            var access = function (elems, fn, key, value, chainable, emptyGet, raw) {
                var i = 0,
                    len = elems.length,
                    bulk = key == null;

                // Sets many values
                if (jQuery.type(key) === "object") {
                    chainable = true;
                    for (i in key) {
                        access(elems, fn, i, key[i], true, emptyGet, raw);
                    }

                    // Sets one value
                } else if (value !== undefined) {
                    chainable = true;

                    if (!jQuery.isFunction(value)) {
                        raw = true;
                    }

                    if (bulk) {

                        // Bulk operations run against the entire set
                        if (raw) {
                            fn.call(elems, value);
                            fn = null;

                            // ...except when executing function values
                        } else {
                            bulk = fn;
                            fn = function (elem, key, value) {
                                return bulk.call(jQuery(elem), value);
                            };
                        }
                    }

                    if (fn) {
                        for (; i < len; i++) {
                            fn(
                                elems[i], key, raw ?
                                value :
                                value.call(elems[i], i, fn(elems[i], key))
                            );
                        }
                    }
                }

                if (chainable) {
                    return elems;
                }

                // Gets
                if (bulk) {
                    return fn.call(elems);
                }

                return len ? fn(elems[0], key) : emptyGet;
            };
            var acceptData = function (owner) {

                // Accepts only:
                //  - Node
                //    - Node.ELEMENT_NODE
                //    - Node.DOCUMENT_NODE
                //  - Object
                //    - Any
                return owner.nodeType === 1 || owner.nodeType === 9 || !(+owner.nodeType);
            };




            function Data() {
                this.expando = jQuery.expando + Data.uid++;
            }

            Data.uid = 1;

            Data.prototype = {

                cache: function (owner) {

                    // Check if the owner object already has a cache
                    var value = owner[this.expando];

                    // If not, create one
                    if (!value) {
                        value = {};

                        // We can accept data for non-element nodes in modern browsers,
                        // but we should not, see #8335.
                        // Always return an empty object.
                        if (acceptData(owner)) {

                            // If it is a node unlikely to be stringify-ed or looped over
                            // use plain assignment
                            if (owner.nodeType) {
                                owner[this.expando] = value;

                                // Otherwise secure it in a non-enumerable property
                                // configurable must be true to allow the property to be
                                // deleted when data is removed
                            } else {
                                Object.defineProperty(owner, this.expando, {
                                    value: value,
                                    configurable: true
                                });
                            }
                        }
                    }

                    return value;
                },
                set: function (owner, data, value) {
                    var prop,
                        cache = this.cache(owner);

                    // Handle: [ owner, key, value ] args
                    // Always use camelCase key (gh-2257)
                    if (typeof data === "string") {
                        cache[jQuery.camelCase(data)] = value;

                        // Handle: [ owner, { properties } ] args
                    } else {

                        // Copy the properties one-by-one to the cache object
                        for (prop in data) {
                            cache[jQuery.camelCase(prop)] = data[prop];
                        }
                    }
                    return cache;
                },
                get: function (owner, key) {
                    return key === undefined ?
                        this.cache(owner) :

                        // Always use camelCase key (gh-2257)
                        owner[this.expando] && owner[this.expando][jQuery.camelCase(key)];
                },
                access: function (owner, key, value) {

                    // In cases where either:
                    //
                    //   1. No key was specified
                    //   2. A string key was specified, but no value provided
                    //
                    // Take the "read" path and allow the get method to determine
                    // which value to return, respectively either:
                    //
                    //   1. The entire cache object
                    //   2. The data stored at the key
                    //
                    if (key === undefined ||
                        ((key && typeof key === "string") && value === undefined)) {

                        return this.get(owner, key);
                    }

                    // When the key is not a string, or both a key and value
                    // are specified, set or extend (existing objects) with either:
                    //
                    //   1. An object of properties
                    //   2. A key and value
                    //
                    this.set(owner, key, value);

                    // Since the "set" path can have two possible entry points
                    // return the expected data based on which path was taken[*]
                    return value !== undefined ? value : key;
                },
                remove: function (owner, key) {
                    var i,
                        cache = owner[this.expando];

                    if (cache === undefined) {
                        return;
                    }

                    if (key !== undefined) {

                        // Support array or space separated string of keys
                        if (Array.isArray(key)) {

                            // If key is an array of keys...
                            // We always set camelCase keys, so remove that.
                            key = key.map(jQuery.camelCase);
                        } else {
                            key = jQuery.camelCase(key);

                            // If a key with the spaces exists, use it.
                            // Otherwise, create an array by matching non-whitespace
                            key = key in cache ?
                                [key] :
                                (key.match(rnothtmlwhite) || []);
                        }

                        i = key.length;

                        while (i--) {
                            delete cache[key[i]];
                        }
                    }

                    // Remove the expando if there's no more data
                    if (key === undefined || jQuery.isEmptyObject(cache)) {

                        // Support: Chrome <=35 - 45
                        // Webkit & Blink performance suffers when deleting properties
                        // from DOM nodes, so set to undefined instead
                        // https://bugs.chromium.org/p/chromium/issues/detail?id=378607 (bug restricted)
                        if (owner.nodeType) {
                            owner[this.expando] = undefined;
                        } else {
                            delete owner[this.expando];
                        }
                    }
                },
                hasData: function (owner) {
                    var cache = owner[this.expando];
                    return cache !== undefined && !jQuery.isEmptyObject(cache);
                }
            };
            var dataPriv = new Data();

            var dataUser = new Data();



            //	Implementation Summary
            //
            //	1. Enforce API surface and semantic compatibility with 1.9.x branch
            //	2. Improve the module's maintainability by reducing the storage
            //		paths to a single mechanism.
            //	3. Use the same single mechanism to support "private" and "user" data.
            //	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
            //	5. Avoid exposing implementation details on user objects (eg. expando properties)
            //	6. Provide a clear path for implementation upgrade to WeakMap in 2014

            var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
                rmultiDash = /[A-Z]/g;

            function getData(data) {
                if (data === "true") {
                    return true;
                }

                if (data === "false") {
                    return false;
                }

                if (data === "null") {
                    return null;
                }

                // Only convert to a number if it doesn't change the string
                if (data === +data + "") {
                    return +data;
                }

                if (rbrace.test(data)) {
                    return JSON.parse(data);
                }

                return data;
            }

            function dataAttr(elem, key, data) {
                var name;

                // If nothing was found internally, try to fetch any
                // data from the HTML5 data-* attribute
                if (data === undefined && elem.nodeType === 1) {
                    name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
                    data = elem.getAttribute(name);

                    if (typeof data === "string") {
                        try {
                            data = getData(data);
                        } catch (e) { }

                        // Make sure we set the data so it isn't changed later
                        dataUser.set(elem, key, data);
                    } else {
                        data = undefined;
                    }
                }
                return data;
            }

            jQuery.extend({
                hasData: function (elem) {
                    return dataUser.hasData(elem) || dataPriv.hasData(elem);
                },

                data: function (elem, name, data) {
                    return dataUser.access(elem, name, data);
                },

                removeData: function (elem, name) {
                    dataUser.remove(elem, name);
                },

                // TODO: Now that all calls to _data and _removeData have been replaced
                // with direct calls to dataPriv methods, these can be deprecated.
                _data: function (elem, name, data) {
                    return dataPriv.access(elem, name, data);
                },

                _removeData: function (elem, name) {
                    dataPriv.remove(elem, name);
                }
            });

            jQuery.fn.extend({
                data: function (key, value) {
                    var i, name, data,
                        elem = this[0],
                        attrs = elem && elem.attributes;

                    // Gets all values
                    if (key === undefined) {
                        if (this.length) {
                            data = dataUser.get(elem);

                            if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
                                i = attrs.length;
                                while (i--) {

                                    // Support: IE 11 only
                                    // The attrs elements can be null (#14894)
                                    if (attrs[i]) {
                                        name = attrs[i].name;
                                        if (name.indexOf("data-") === 0) {
                                            name = jQuery.camelCase(name.slice(5));
                                            dataAttr(elem, name, data[name]);
                                        }
                                    }
                                }
                                dataPriv.set(elem, "hasDataAttrs", true);
                            }
                        }

                        return data;
                    }

                    // Sets multiple values
                    if (typeof key === "object") {
                        return this.each(function () {
                            dataUser.set(this, key);
                        });
                    }

                    return access(this, function (value) {
                        var data;

                        // The calling jQuery object (element matches) is not empty
                        // (and therefore has an element appears at this[ 0 ]) and the
                        // `value` parameter was not undefined. An empty jQuery object
                        // will result in `undefined` for elem = this[ 0 ] which will
                        // throw an exception if an attempt to read a data cache is made.
                        if (elem && value === undefined) {

                            // Attempt to get data from the cache
                            // The key will always be camelCased in Data
                            data = dataUser.get(elem, key);
                            if (data !== undefined) {
                                return data;
                            }

                            // Attempt to "discover" the data in
                            // HTML5 custom data-* attrs
                            data = dataAttr(elem, key);
                            if (data !== undefined) {
                                return data;
                            }

                            // We tried really hard, but the data doesn't exist.
                            return;
                        }

                        // Set the data...
                        this.each(function () {

                            // We always store the camelCased key
                            dataUser.set(this, key, value);
                        });
                    }, null, value, arguments.length > 1, null, true);
                },

                removeData: function (key) {
                    return this.each(function () {
                        dataUser.remove(this, key);
                    });
                }
            });


            jQuery.extend({
                queue: function (elem, type, data) {
                    var queue;

                    if (elem) {
                        type = (type || "fx") + "queue";
                        queue = dataPriv.get(elem, type);

                        // Speed up dequeue by getting out quickly if this is just a lookup
                        if (data) {
                            if (!queue || Array.isArray(data)) {
                                queue = dataPriv.access(elem, type, jQuery.makeArray(data));
                            } else {
                                queue.push(data);
                            }
                        }
                        return queue || [];
                    }
                },

                dequeue: function (elem, type) {
                    type = type || "fx";

                    var queue = jQuery.queue(elem, type),
                        startLength = queue.length,
                        fn = queue.shift(),
                        hooks = jQuery._queueHooks(elem, type),
                        next = function () {
                            jQuery.dequeue(elem, type);
                        };

                    // If the fx queue is dequeued, always remove the progress sentinel
                    if (fn === "inprogress") {
                        fn = queue.shift();
                        startLength--;
                    }

                    if (fn) {

                        // Add a progress sentinel to prevent the fx queue from being
                        // automatically dequeued
                        if (type === "fx") {
                            queue.unshift("inprogress");
                        }

                        // Clear up the last queue stop function
                        delete hooks.stop;
                        fn.call(elem, next, hooks);
                    }

                    if (!startLength && hooks) {
                        hooks.empty.fire();
                    }
                },

                // Not public - generate a queueHooks object, or return the current one
                _queueHooks: function (elem, type) {
                    var key = type + "queueHooks";
                    return dataPriv.get(elem, key) || dataPriv.access(elem, key, {
                        empty: jQuery.Callbacks("once memory").add(function () {
                            dataPriv.remove(elem, [type + "queue", key]);
                        })
                    });
                }
            });

            jQuery.fn.extend({
                queue: function (type, data) {
                    var setter = 2;

                    if (typeof type !== "string") {
                        data = type;
                        type = "fx";
                        setter--;
                    }

                    if (arguments.length < setter) {
                        return jQuery.queue(this[0], type);
                    }

                    return data === undefined ?
                        this :
                        this.each(function () {
                            var queue = jQuery.queue(this, type, data);

                            // Ensure a hooks for this queue
                            jQuery._queueHooks(this, type);

                            if (type === "fx" && queue[0] !== "inprogress") {
                                jQuery.dequeue(this, type);
                            }
                        });
                },
                dequeue: function (type) {
                    return this.each(function () {
                        jQuery.dequeue(this, type);
                    });
                },
                clearQueue: function (type) {
                    return this.queue(type || "fx", []);
                },

                // Get a promise resolved when queues of a certain type
                // are emptied (fx is the type by default)
                promise: function (type, obj) {
                    var tmp,
                        count = 1,
                        defer = jQuery.Deferred(),
                        elements = this,
                        i = this.length,
                        resolve = function () {
                            if (!(--count)) {
                                defer.resolveWith(elements, [elements]);
                            }
                        };

                    if (typeof type !== "string") {
                        obj = type;
                        type = undefined;
                    }
                    type = type || "fx";

                    while (i--) {
                        tmp = dataPriv.get(elements[i], type + "queueHooks");
                        if (tmp && tmp.empty) {
                            count++;
                            tmp.empty.add(resolve);
                        }
                    }
                    resolve();
                    return defer.promise(obj);
                }
            });
            var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

            var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");


            var cssExpand = ["Top", "Right", "Bottom", "Left"];

            var isHiddenWithinTree = function (elem, el) {

                // isHiddenWithinTree might be called from jQuery#filter function;
                // in that case, element will be second argument
                elem = el || elem;

                // Inline style trumps all
                return elem.style.display === "none" ||
                    elem.style.display === "" &&

                    // Otherwise, check computed style
                    // Support: Firefox <=43 - 45
                    // Disconnected elements can have computed display: none, so first confirm that elem is
                    // in the document.
                    jQuery.contains(elem.ownerDocument, elem) &&

                    jQuery.css(elem, "display") === "none";
            };

            var swap = function (elem, options, callback, args) {
                var ret, name,
                    old = {};

                // Remember the old values, and insert the new ones
                for (name in options) {
                    old[name] = elem.style[name];
                    elem.style[name] = options[name];
                }

                ret = callback.apply(elem, args || []);

                // Revert the old values
                for (name in options) {
                    elem.style[name] = old[name];
                }

                return ret;
            };




            function adjustCSS(elem, prop, valueParts, tween) {
                var adjusted,
                    scale = 1,
                    maxIterations = 20,
                    currentValue = tween ?
                        function () {
                            return tween.cur();
                        } :
                        function () {
                            return jQuery.css(elem, prop, "");
                        },
                    initial = currentValue(),
                    unit = valueParts && valueParts[3] || (jQuery.cssNumber[prop] ? "" : "px"),

                    // Starting value computation is required for potential unit mismatches
                    initialInUnit = (jQuery.cssNumber[prop] || unit !== "px" && +initial) &&
                        rcssNum.exec(jQuery.css(elem, prop));

                if (initialInUnit && initialInUnit[3] !== unit) {

                    // Trust units reported by jQuery.css
                    unit = unit || initialInUnit[3];

                    // Make sure we update the tween properties later on
                    valueParts = valueParts || [];

                    // Iteratively approximate from a nonzero starting point
                    initialInUnit = +initial || 1;

                    do {

                        // If previous iteration zeroed out, double until we get *something*.
                        // Use string for doubling so we don't accidentally see scale as unchanged below
                        scale = scale || ".5";

                        // Adjust and apply
                        initialInUnit = initialInUnit / scale;
                        jQuery.style(elem, prop, initialInUnit + unit);

                        // Update scale, tolerating zero or NaN from tween.cur()
                        // Break the loop if scale is unchanged or perfect, or if we've just had enough.
                    } while (
                        scale !== (scale = currentValue() / initial) && scale !== 1 && --maxIterations
                    );
                }

                if (valueParts) {
                    initialInUnit = +initialInUnit || +initial || 0;

                    // Apply relative offset (+=/-=) if specified
                    adjusted = valueParts[1] ?
                        initialInUnit + (valueParts[1] + 1) * valueParts[2] :
                        +valueParts[2];
                    if (tween) {
                        tween.unit = unit;
                        tween.start = initialInUnit;
                        tween.end = adjusted;
                    }
                }
                return adjusted;
            }


            var defaultDisplayMap = {};

            function getDefaultDisplay(elem) {
                var temp,
                    doc = elem.ownerDocument,
                    nodeName = elem.nodeName,
                    display = defaultDisplayMap[nodeName];

                if (display) {
                    return display;
                }

                temp = doc.body.appendChild(doc.createElement(nodeName));
                display = jQuery.css(temp, "display");

                temp.parentNode.removeChild(temp);

                if (display === "none") {
                    display = "block";
                }
                defaultDisplayMap[nodeName] = display;

                return display;
            }

            function showHide(elements, show) {
                var display, elem,
                    values = [],
                    index = 0,
                    length = elements.length;

                // Determine new display value for elements that need to change
                for (; index < length; index++) {
                    elem = elements[index];
                    if (!elem.style) {
                        continue;
                    }

                    display = elem.style.display;
                    if (show) {

                        // Since we force visibility upon cascade-hidden elements, an immediate (and slow)
                        // check is required in this first loop unless we have a nonempty display value (either
                        // inline or about-to-be-restored)
                        if (display === "none") {
                            values[index] = dataPriv.get(elem, "display") || null;
                            if (!values[index]) {
                                elem.style.display = "";
                            }
                        }
                        if (elem.style.display === "" && isHiddenWithinTree(elem)) {
                            values[index] = getDefaultDisplay(elem);
                        }
                    } else {
                        if (display !== "none") {
                            values[index] = "none";

                            // Remember what we're overwriting
                            dataPriv.set(elem, "display", display);
                        }
                    }
                }

                // Set the display of the elements in a second loop to avoid constant reflow
                for (index = 0; index < length; index++) {
                    if (values[index] != null) {
                        elements[index].style.display = values[index];
                    }
                }

                return elements;
            }

            jQuery.fn.extend({
                show: function () {
                    return showHide(this, true);
                },
                hide: function () {
                    return showHide(this);
                },
                toggle: function (state) {
                    if (typeof state === "boolean") {
                        return state ? this.show() : this.hide();
                    }

                    return this.each(function () {
                        if (isHiddenWithinTree(this)) {
                            jQuery(this).show();
                        } else {
                            jQuery(this).hide();
                        }
                    });
                }
            });
            var rcheckableType = (/^(?:checkbox|radio)$/i);

            var rtagName = (/<([a-z][^\/\0>\x20\t\r\n\f]+)/i);

            var rscriptType = (/^$|\/(?:java|ecma)script/i);



            // We have to close these tags to support XHTML (#13200)
            var wrapMap = {

                // Support: IE <=9 only
                option: [1, "<select multiple='multiple'>", "</select>"],

                // XHTML parsers do not magically insert elements in the
                // same way that tag soup parsers do. So we cannot shorten
                // this by omitting <tbody> or other required elements.
                thead: [1, "<table>", "</table>"],
                col: [2, "<table><colgroup>", "</colgroup></table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],

                _default: [0, "", ""]
            };

            // Support: IE <=9 only
            wrapMap.optgroup = wrapMap.option;

            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
            wrapMap.th = wrapMap.td;


            function getAll(context, tag) {

                // Support: IE <=9 - 11 only
                // Use typeof to avoid zero-argument method invocation on host objects (#15151)
                var ret;

                if (typeof context.getElementsByTagName !== "undefined") {
                    ret = context.getElementsByTagName(tag || "*");

                } else if (typeof context.querySelectorAll !== "undefined") {
                    ret = context.querySelectorAll(tag || "*");

                } else {
                    ret = [];
                }

                if (tag === undefined || tag && nodeName(context, tag)) {
                    return jQuery.merge([context], ret);
                }

                return ret;
            }


            // Mark scripts as having already been evaluated
            function setGlobalEval(elems, refElements) {
                var i = 0,
                    l = elems.length;

                for (; i < l; i++) {
                    dataPriv.set(
                        elems[i],
                        "globalEval",
                        !refElements || dataPriv.get(refElements[i], "globalEval")
                    );
                }
            }


            var rhtml = /<|&#?\w+;/;

            function buildFragment(elems, context, scripts, selection, ignored) {
                var elem, tmp, tag, wrap, contains, j,
                    fragment = context.createDocumentFragment(),
                    nodes = [],
                    i = 0,
                    l = elems.length;

                for (; i < l; i++) {
                    elem = elems[i];

                    if (elem || elem === 0) {

                        // Add nodes directly
                        if (jQuery.type(elem) === "object") {

                            // Support: Android <=4.0 only, PhantomJS 1 only
                            // push.apply(_, arraylike) throws on ancient WebKit
                            jQuery.merge(nodes, elem.nodeType ? [elem] : elem);

                            // Convert non-html into a text node
                        } else if (!rhtml.test(elem)) {
                            nodes.push(context.createTextNode(elem));

                            // Convert html into DOM nodes
                        } else {
                            tmp = tmp || fragment.appendChild(context.createElement("div"));

                            // Deserialize a standard representation
                            tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                            wrap = wrapMap[tag] || wrapMap._default;
                            tmp.innerHTML = wrap[1] + jQuery.htmlPrefilter(elem) + wrap[2];

                            // Descend through wrappers to the right content
                            j = wrap[0];
                            while (j--) {
                                tmp = tmp.lastChild;
                            }

                            // Support: Android <=4.0 only, PhantomJS 1 only
                            // push.apply(_, arraylike) throws on ancient WebKit
                            jQuery.merge(nodes, tmp.childNodes);

                            // Remember the top-level container
                            tmp = fragment.firstChild;

                            // Ensure the created nodes are orphaned (#12392)
                            tmp.textContent = "";
                        }
                    }
                }

                // Remove wrapper from fragment
                fragment.textContent = "";

                i = 0;
                while ((elem = nodes[i++])) {

                    // Skip elements already in the context collection (trac-4087)
                    if (selection && jQuery.inArray(elem, selection) > -1) {
                        if (ignored) {
                            ignored.push(elem);
                        }
                        continue;
                    }

                    contains = jQuery.contains(elem.ownerDocument, elem);

                    // Append to fragment
                    tmp = getAll(fragment.appendChild(elem), "script");

                    // Preserve script evaluation history
                    if (contains) {
                        setGlobalEval(tmp);
                    }

                    // Capture executables
                    if (scripts) {
                        j = 0;
                        while ((elem = tmp[j++])) {
                            if (rscriptType.test(elem.type || "")) {
                                scripts.push(elem);
                            }
                        }
                    }
                }

                return fragment;
            }


            (function () {
                var fragment = document.createDocumentFragment(),
                    div = fragment.appendChild(document.createElement("div")),
                    input = document.createElement("input");

                // Support: Android 4.0 - 4.3 only
                // Check state lost if the name is set (#11217)
                // Support: Windows Web Apps (WWA)
                // `name` and `type` must use .setAttribute for WWA (#14901)
                input.setAttribute("type", "radio");
                input.setAttribute("checked", "checked");
                input.setAttribute("name", "t");

                div.appendChild(input);

                // Support: Android <=4.1 only
                // Older WebKit doesn't clone checked state correctly in fragments
                support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;

                // Support: IE <=11 only
                // Make sure textarea (and checkbox) defaultValue is properly cloned
                div.innerHTML = "<textarea>x</textarea>";
                support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
            })();
            var documentElement = document.documentElement;



            var
                rkeyEvent = /^key/,
                rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
                rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

            function returnTrue() {
                return true;
            }

            function returnFalse() {
                return false;
            }

            // Support: IE <=9 only
            // See #13393 for more info
            function safeActiveElement() {
                try {
                    return document.activeElement;
                } catch (err) { }
            }

            function on(elem, types, selector, data, fn, one) {
                var origFn, type;

                // Types can be a map of types/handlers
                if (typeof types === "object") {

                    // ( types-Object, selector, data )
                    if (typeof selector !== "string") {

                        // ( types-Object, data )
                        data = data || selector;
                        selector = undefined;
                    }
                    for (type in types) {
                        on(elem, type, selector, data, types[type], one);
                    }
                    return elem;
                }

                if (data == null && fn == null) {

                    // ( types, fn )
                    fn = selector;
                    data = selector = undefined;
                } else if (fn == null) {
                    if (typeof selector === "string") {

                        // ( types, selector, fn )
                        fn = data;
                        data = undefined;
                    } else {

                        // ( types, data, fn )
                        fn = data;
                        data = selector;
                        selector = undefined;
                    }
                }
                if (fn === false) {
                    fn = returnFalse;
                } else if (!fn) {
                    return elem;
                }

                if (one === 1) {
                    origFn = fn;
                    fn = function (event) {

                        // Can use an empty set, since event contains the info
                        jQuery().off(event);
                        return origFn.apply(this, arguments);
                    };

                    // Use same guid so caller can remove using origFn
                    fn.guid = origFn.guid || (origFn.guid = jQuery.guid++);
                }
                return elem.each(function () {
                    jQuery.event.add(this, types, fn, data, selector);
                });
            }

            /*
             * Helper functions for managing events -- not part of the public interface.
             * Props to Dean Edwards' addEvent library for many of the ideas.
             */
            jQuery.event = {

                global: {},

                add: function (elem, types, handler, data, selector) {

                    var handleObjIn, eventHandle, tmp,
                        events, t, handleObj,
                        special, handlers, type, namespaces, origType,
                        elemData = dataPriv.get(elem);

                    // Don't attach events to noData or text/comment nodes (but allow plain objects)
                    if (!elemData) {
                        return;
                    }

                    // Caller can pass in an object of custom data in lieu of the handler
                    if (handler.handler) {
                        handleObjIn = handler;
                        handler = handleObjIn.handler;
                        selector = handleObjIn.selector;
                    }

                    // Ensure that invalid selectors throw exceptions at attach time
                    // Evaluate against documentElement in case elem is a non-element node (e.g., document)
                    if (selector) {
                        jQuery.find.matchesSelector(documentElement, selector);
                    }

                    // Make sure that the handler has a unique ID, used to find/remove it later
                    if (!handler.guid) {
                        handler.guid = jQuery.guid++;
                    }

                    // Init the element's event structure and main handler, if this is the first
                    if (!(events = elemData.events)) {
                        events = elemData.events = {};
                    }
                    if (!(eventHandle = elemData.handle)) {
                        eventHandle = elemData.handle = function (e) {

                            // Discard the second event of a jQuery.event.trigger() and
                            // when an event is called after a page has unloaded
                            return typeof jQuery !== "undefined" && jQuery.event.triggered !== e.type ?
                                jQuery.event.dispatch.apply(elem, arguments) : undefined;
                        };
                    }

                    // Handle multiple events separated by a space
                    types = (types || "").match(rnothtmlwhite) || [""];
                    t = types.length;
                    while (t--) {
                        tmp = rtypenamespace.exec(types[t]) || [];
                        type = origType = tmp[1];
                        namespaces = (tmp[2] || "").split(".").sort();

                        // There *must* be a type, no attaching namespace-only handlers
                        if (!type) {
                            continue;
                        }

                        // If event changes its type, use the special event handlers for the changed type
                        special = jQuery.event.special[type] || {};

                        // If selector defined, determine special event api type, otherwise given type
                        type = (selector ? special.delegateType : special.bindType) || type;

                        // Update special based on newly reset type
                        special = jQuery.event.special[type] || {};

                        // handleObj is passed to all event handlers
                        handleObj = jQuery.extend({
                            type: type,
                            origType: origType,
                            data: data,
                            handler: handler,
                            guid: handler.guid,
                            selector: selector,
                            needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                            namespace: namespaces.join(".")
                        }, handleObjIn);

                        // Init the event handler queue if we're the first
                        if (!(handlers = events[type])) {
                            handlers = events[type] = [];
                            handlers.delegateCount = 0;

                            // Only use addEventListener if the special events handler returns false
                            if (!special.setup ||
                                special.setup.call(elem, data, namespaces, eventHandle) === false) {

                                if (elem.addEventListener) {
                                    elem.addEventListener(type, eventHandle);
                                }
                            }
                        }

                        if (special.add) {
                            special.add.call(elem, handleObj);

                            if (!handleObj.handler.guid) {
                                handleObj.handler.guid = handler.guid;
                            }
                        }

                        // Add to the element's handler list, delegates in front
                        if (selector) {
                            handlers.splice(handlers.delegateCount++, 0, handleObj);
                        } else {
                            handlers.push(handleObj);
                        }

                        // Keep track of which events have ever been used, for event optimization
                        jQuery.event.global[type] = true;
                    }

                },

                // Detach an event or set of events from an element
                remove: function (elem, types, handler, selector, mappedTypes) {

                    var j, origCount, tmp,
                        events, t, handleObj,
                        special, handlers, type, namespaces, origType,
                        elemData = dataPriv.hasData(elem) && dataPriv.get(elem);

                    if (!elemData || !(events = elemData.events)) {
                        return;
                    }

                    // Once for each type.namespace in types; type may be omitted
                    types = (types || "").match(rnothtmlwhite) || [""];
                    t = types.length;
                    while (t--) {
                        tmp = rtypenamespace.exec(types[t]) || [];
                        type = origType = tmp[1];
                        namespaces = (tmp[2] || "").split(".").sort();

                        // Unbind all events (on this namespace, if provided) for the element
                        if (!type) {
                            for (type in events) {
                                jQuery.event.remove(elem, type + types[t], handler, selector, true);
                            }
                            continue;
                        }

                        special = jQuery.event.special[type] || {};
                        type = (selector ? special.delegateType : special.bindType) || type;
                        handlers = events[type] || [];
                        tmp = tmp[2] &&
                            new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");

                        // Remove matching events
                        origCount = j = handlers.length;
                        while (j--) {
                            handleObj = handlers[j];

                            if ((mappedTypes || origType === handleObj.origType) &&
                                (!handler || handler.guid === handleObj.guid) &&
                                (!tmp || tmp.test(handleObj.namespace)) &&
                                (!selector || selector === handleObj.selector ||
                                    selector === "**" && handleObj.selector)) {
                                handlers.splice(j, 1);

                                if (handleObj.selector) {
                                    handlers.delegateCount--;
                                }
                                if (special.remove) {
                                    special.remove.call(elem, handleObj);
                                }
                            }
                        }

                        // Remove generic event handler if we removed something and no more handlers exist
                        // (avoids potential for endless recursion during removal of special event handlers)
                        if (origCount && !handlers.length) {
                            if (!special.teardown ||
                                special.teardown.call(elem, namespaces, elemData.handle) === false) {

                                jQuery.removeEvent(elem, type, elemData.handle);
                            }

                            delete events[type];
                        }
                    }

                    // Remove data and the expando if it's no longer used
                    if (jQuery.isEmptyObject(events)) {
                        dataPriv.remove(elem, "handle events");
                    }
                },

                dispatch: function (nativeEvent) {

                    // Make a writable jQuery.Event from the native event object
                    var event = jQuery.event.fix(nativeEvent);

                    var i, j, ret, matched, handleObj, handlerQueue,
                        args = new Array(arguments.length),
                        handlers = (dataPriv.get(this, "events") || {})[event.type] || [],
                        special = jQuery.event.special[event.type] || {};

                    // Use the fix-ed jQuery.Event rather than the (read-only) native event
                    args[0] = event;

                    for (i = 1; i < arguments.length; i++) {
                        args[i] = arguments[i];
                    }

                    event.delegateTarget = this;

                    // Call the preDispatch hook for the mapped type, and let it bail if desired
                    if (special.preDispatch && special.preDispatch.call(this, event) === false) {
                        return;
                    }

                    // Determine handlers
                    handlerQueue = jQuery.event.handlers.call(this, event, handlers);

                    // Run delegates first; they may want to stop propagation beneath us
                    i = 0;
                    while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
                        event.currentTarget = matched.elem;

                        j = 0;
                        while ((handleObj = matched.handlers[j++]) &&
                            !event.isImmediatePropagationStopped()) {

                            // Triggered event must either 1) have no namespace, or 2) have namespace(s)
                            // a subset or equal to those in the bound event (both can have no namespace).
                            if (!event.rnamespace || event.rnamespace.test(handleObj.namespace)) {

                                event.handleObj = handleObj;
                                event.data = handleObj.data;

                                ret = ((jQuery.event.special[handleObj.origType] || {}).handle ||
                                    handleObj.handler).apply(matched.elem, args);

                                if (ret !== undefined) {
                                    if ((event.result = ret) === false) {
                                        event.preventDefault();
                                        event.stopPropagation();
                                    }
                                }
                            }
                        }
                    }

                    // Call the postDispatch hook for the mapped type
                    if (special.postDispatch) {
                        special.postDispatch.call(this, event);
                    }

                    return event.result;
                },

                handlers: function (event, handlers) {
                    var i, handleObj, sel, matchedHandlers, matchedSelectors,
                        handlerQueue = [],
                        delegateCount = handlers.delegateCount,
                        cur = event.target;

                    // Find delegate handlers
                    if (delegateCount &&

                        // Support: IE <=9
                        // Black-hole SVG <use> instance trees (trac-13180)
                        cur.nodeType &&

                        // Support: Firefox <=42
                        // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
                        // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
                        // Support: IE 11 only
                        // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
                        !(event.type === "click" && event.button >= 1)) {

                        for (; cur !== this; cur = cur.parentNode || this) {

                            // Don't check non-elements (#13208)
                            // Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
                            if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
                                matchedHandlers = [];
                                matchedSelectors = {};
                                for (i = 0; i < delegateCount; i++) {
                                    handleObj = handlers[i];

                                    // Don't conflict with Object.prototype properties (#13203)
                                    sel = handleObj.selector + " ";

                                    if (matchedSelectors[sel] === undefined) {
                                        matchedSelectors[sel] = handleObj.needsContext ?
                                            jQuery(sel, this).index(cur) > -1 :
                                            jQuery.find(sel, this, null, [cur]).length;
                                    }
                                    if (matchedSelectors[sel]) {
                                        matchedHandlers.push(handleObj);
                                    }
                                }
                                if (matchedHandlers.length) {
                                    handlerQueue.push({ elem: cur, handlers: matchedHandlers });
                                }
                            }
                        }
                    }

                    // Add the remaining (directly-bound) handlers
                    cur = this;
                    if (delegateCount < handlers.length) {
                        handlerQueue.push({ elem: cur, handlers: handlers.slice(delegateCount) });
                    }

                    return handlerQueue;
                },

                addProp: function (name, hook) {
                    Object.defineProperty(jQuery.Event.prototype, name, {
                        enumerable: true,
                        configurable: true,

                        get: jQuery.isFunction(hook) ?
                            function () {
                                if (this.originalEvent) {
                                    return hook(this.originalEvent);
                                }
                            } :
                            function () {
                                if (this.originalEvent) {
                                    return this.originalEvent[name];
                                }
                            },

                        set: function (value) {
                            Object.defineProperty(this, name, {
                                enumerable: true,
                                configurable: true,
                                writable: true,
                                value: value
                            });
                        }
                    });
                },

                fix: function (originalEvent) {
                    return originalEvent[jQuery.expando] ?
                        originalEvent :
                        new jQuery.Event(originalEvent);
                },

                special: {
                    load: {

                        // Prevent triggered image.load events from bubbling to window.load
                        noBubble: true
                    },
                    focus: {

                        // Fire native event if possible so blur/focus sequence is correct
                        trigger: function () {
                            if (this !== safeActiveElement() && this.focus) {
                                this.focus();
                                return false;
                            }
                        },
                        delegateType: "focusin"
                    },
                    blur: {
                        trigger: function () {
                            if (this === safeActiveElement() && this.blur) {
                                this.blur();
                                return false;
                            }
                        },
                        delegateType: "focusout"
                    },
                    click: {

                        // For checkbox, fire native event so checked state will be right
                        trigger: function () {
                            if (this.type === "checkbox" && this.click && nodeName(this, "input")) {
                                this.click();
                                return false;
                            }
                        },

                        // For cross-browser consistency, don't fire native .click() on links
                        _default: function (event) {
                            return nodeName(event.target, "a");
                        }
                    },

                    beforeunload: {
                        postDispatch: function (event) {

                            // Support: Firefox 20+
                            // Firefox doesn't alert if the returnValue field is not set.
                            if (event.result !== undefined && event.originalEvent) {
                                event.originalEvent.returnValue = event.result;
                            }
                        }
                    }
                }
            };

            jQuery.removeEvent = function (elem, type, handle) {

                // This "if" is needed for plain objects
                if (elem.removeEventListener) {
                    elem.removeEventListener(type, handle);
                }
            };

            jQuery.Event = function (src, props) {

                // Allow instantiation without the 'new' keyword
                if (!(this instanceof jQuery.Event)) {
                    return new jQuery.Event(src, props);
                }

                // Event object
                if (src && src.type) {
                    this.originalEvent = src;
                    this.type = src.type;

                    // Events bubbling up the document may have been marked as prevented
                    // by a handler lower down the tree; reflect the correct value.
                    this.isDefaultPrevented = src.defaultPrevented ||
                        src.defaultPrevented === undefined &&

                        // Support: Android <=2.3 only
                        src.returnValue === false ?
                        returnTrue :
                        returnFalse;

                    // Create target properties
                    // Support: Safari <=6 - 7 only
                    // Target should not be a text node (#504, #13143)
                    this.target = (src.target && src.target.nodeType === 3) ?
                        src.target.parentNode :
                        src.target;

                    this.currentTarget = src.currentTarget;
                    this.relatedTarget = src.relatedTarget;

                    // Event type
                } else {
                    this.type = src;
                }

                // Put explicitly provided properties onto the event object
                if (props) {
                    jQuery.extend(this, props);
                }

                // Create a timestamp if incoming event doesn't have one
                this.timeStamp = src && src.timeStamp || jQuery.now();

                // Mark it as fixed
                this[jQuery.expando] = true;
            };

            // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
            // https://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
            jQuery.Event.prototype = {
                constructor: jQuery.Event,
                isDefaultPrevented: returnFalse,
                isPropagationStopped: returnFalse,
                isImmediatePropagationStopped: returnFalse,
                isSimulated: false,

                preventDefault: function () {
                    var e = this.originalEvent;

                    this.isDefaultPrevented = returnTrue;

                    if (e && !this.isSimulated) {
                        e.preventDefault();
                    }
                },
                stopPropagation: function () {
                    var e = this.originalEvent;

                    this.isPropagationStopped = returnTrue;

                    if (e && !this.isSimulated) {
                        e.stopPropagation();
                    }
                },
                stopImmediatePropagation: function () {
                    var e = this.originalEvent;

                    this.isImmediatePropagationStopped = returnTrue;

                    if (e && !this.isSimulated) {
                        e.stopImmediatePropagation();
                    }

                    this.stopPropagation();
                }
            };

            // Includes all common event props including KeyEvent and MouseEvent specific props
            jQuery.each({
                altKey: true,
                bubbles: true,
                cancelable: true,
                changedTouches: true,
                ctrlKey: true,
                detail: true,
                eventPhase: true,
                metaKey: true,
                pageX: true,
                pageY: true,
                shiftKey: true,
                view: true,
                "char": true,
                charCode: true,
                key: true,
                keyCode: true,
                button: true,
                buttons: true,
                clientX: true,
                clientY: true,
                offsetX: true,
                offsetY: true,
                pointerId: true,
                pointerType: true,
                screenX: true,
                screenY: true,
                targetTouches: true,
                toElement: true,
                touches: true,

                which: function (event) {
                    var button = event.button;

                    // Add which for key events
                    if (event.which == null && rkeyEvent.test(event.type)) {
                        return event.charCode != null ? event.charCode : event.keyCode;
                    }

                    // Add which for click: 1 === left; 2 === middle; 3 === right
                    if (!event.which && button !== undefined && rmouseEvent.test(event.type)) {
                        if (button & 1) {
                            return 1;
                        }

                        if (button & 2) {
                            return 3;
                        }

                        if (button & 4) {
                            return 2;
                        }

                        return 0;
                    }

                    return event.which;
                }
            }, jQuery.event.addProp);

            // Create mouseenter/leave events using mouseover/out and event-time checks
            // so that event delegation works in jQuery.
            // Do the same for pointerenter/pointerleave and pointerover/pointerout
            //
            // Support: Safari 7 only
            // Safari sends mouseenter too often; see:
            // https://bugs.chromium.org/p/chromium/issues/detail?id=470258
            // for the description of the bug (it existed in older Chrome versions as well).
            jQuery.each({
                mouseenter: "mouseover",
                mouseleave: "mouseout",
                pointerenter: "pointerover",
                pointerleave: "pointerout"
            }, function (orig, fix) {
                jQuery.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,

                    handle: function (event) {
                        var ret,
                            target = this,
                            related = event.relatedTarget,
                            handleObj = event.handleObj;

                        // For mouseenter/leave call the handler if related is outside the target.
                        // NB: No relatedTarget if the mouse left/entered the browser window
                        if (!related || (related !== target && !jQuery.contains(target, related))) {
                            event.type = handleObj.origType;
                            ret = handleObj.handler.apply(this, arguments);
                            event.type = fix;
                        }
                        return ret;
                    }
                };
            });

            jQuery.fn.extend({

                on: function (types, selector, data, fn) {
                    return on(this, types, selector, data, fn);
                },
                one: function (types, selector, data, fn) {
                    return on(this, types, selector, data, fn, 1);
                },
                off: function (types, selector, fn) {
                    var handleObj, type;
                    if (types && types.preventDefault && types.handleObj) {

                        // ( event )  dispatched jQuery.Event
                        handleObj = types.handleObj;
                        jQuery(types.delegateTarget).off(
                            handleObj.namespace ?
                                handleObj.origType + "." + handleObj.namespace :
                                handleObj.origType,
                            handleObj.selector,
                            handleObj.handler
                        );
                        return this;
                    }
                    if (typeof types === "object") {

                        // ( types-object [, selector] )
                        for (type in types) {
                            this.off(type, selector, types[type]);
                        }
                        return this;
                    }
                    if (selector === false || typeof selector === "function") {

                        // ( types [, fn] )
                        fn = selector;
                        selector = undefined;
                    }
                    if (fn === false) {
                        fn = returnFalse;
                    }
                    return this.each(function () {
                        jQuery.event.remove(this, types, fn, selector);
                    });
                }
            });


            var

                /* eslint-disable max-len */

                // See https://github.com/eslint/eslint/issues/3229
                rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi,

                /* eslint-enable */

                // Support: IE <=10 - 11, Edge 12 - 13
                // In IE/Edge using regex groups here causes severe slowdowns.
                // See https://connect.microsoft.com/IE/feedback/details/1736512/
                rnoInnerhtml = /<script|<style|<link/i,

                // checked="checked" or checked
                rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
                rscriptTypeMasked = /^true\/(.*)/,
                rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;

            // Prefer a tbody over its parent table for containing new rows
            function manipulationTarget(elem, content) {
                if (nodeName(elem, "table") &&
                    nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {

                    return jQuery(">tbody", elem)[0] || elem;
                }

                return elem;
            }

            // Replace/restore the type attribute of script elements for safe DOM manipulation
            function disableScript(elem) {
                elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
                return elem;
            }
            function restoreScript(elem) {
                var match = rscriptTypeMasked.exec(elem.type);

                if (match) {
                    elem.type = match[1];
                } else {
                    elem.removeAttribute("type");
                }

                return elem;
            }

            function cloneCopyEvent(src, dest) {
                var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

                if (dest.nodeType !== 1) {
                    return;
                }

                // 1. Copy private data: events, handlers, etc.
                if (dataPriv.hasData(src)) {
                    pdataOld = dataPriv.access(src);
                    pdataCur = dataPriv.set(dest, pdataOld);
                    events = pdataOld.events;

                    if (events) {
                        delete pdataCur.handle;
                        pdataCur.events = {};

                        for (type in events) {
                            for (i = 0, l = events[type].length; i < l; i++) {
                                jQuery.event.add(dest, type, events[type][i]);
                            }
                        }
                    }
                }

                // 2. Copy user data
                if (dataUser.hasData(src)) {
                    udataOld = dataUser.access(src);
                    udataCur = jQuery.extend({}, udataOld);

                    dataUser.set(dest, udataCur);
                }
            }

            // Fix IE bugs, see support tests
            function fixInput(src, dest) {
                var nodeName = dest.nodeName.toLowerCase();

                // Fails to persist the checked state of a cloned checkbox or radio button.
                if (nodeName === "input" && rcheckableType.test(src.type)) {
                    dest.checked = src.checked;

                    // Fails to return the selected option to the default selected state when cloning options
                } else if (nodeName === "input" || nodeName === "textarea") {
                    dest.defaultValue = src.defaultValue;
                }
            }

            function domManip(collection, args, callback, ignored) {

                // Flatten any nested arrays
                args = concat.apply([], args);

                var fragment, first, scripts, hasScripts, node, doc,
                    i = 0,
                    l = collection.length,
                    iNoClone = l - 1,
                    value = args[0],
                    isFunction = jQuery.isFunction(value);

                // We can't cloneNode fragments that contain checked, in WebKit
                if (isFunction ||
                    (l > 1 && typeof value === "string" &&
                        !support.checkClone && rchecked.test(value))) {
                    return collection.each(function (index) {
                        var self = collection.eq(index);
                        if (isFunction) {
                            args[0] = value.call(this, index, self.html());
                        }
                        domManip(self, args, callback, ignored);
                    });
                }

                if (l) {
                    fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
                    first = fragment.firstChild;

                    if (fragment.childNodes.length === 1) {
                        fragment = first;
                    }

                    // Require either new content or an interest in ignored elements to invoke the callback
                    if (first || ignored) {
                        scripts = jQuery.map(getAll(fragment, "script"), disableScript);
                        hasScripts = scripts.length;

                        // Use the original fragment for the last item
                        // instead of the first because it can end up
                        // being emptied incorrectly in certain situations (#8070).
                        for (; i < l; i++) {
                            node = fragment;

                            if (i !== iNoClone) {
                                node = jQuery.clone(node, true, true);

                                // Keep references to cloned scripts for later restoration
                                if (hasScripts) {

                                    // Support: Android <=4.0 only, PhantomJS 1 only
                                    // push.apply(_, arraylike) throws on ancient WebKit
                                    jQuery.merge(scripts, getAll(node, "script"));
                                }
                            }

                            callback.call(collection[i], node, i);
                        }

                        if (hasScripts) {
                            doc = scripts[scripts.length - 1].ownerDocument;

                            // Reenable scripts
                            jQuery.map(scripts, restoreScript);

                            // Evaluate executable scripts on first document insertion
                            for (i = 0; i < hasScripts; i++) {
                                node = scripts[i];
                                if (rscriptType.test(node.type || "") &&
                                    !dataPriv.access(node, "globalEval") &&
                                    jQuery.contains(doc, node)) {

                                    if (node.src) {

                                        // Optional AJAX dependency, but won't run scripts if not present
                                        if (jQuery._evalUrl) {
                                            jQuery._evalUrl(node.src);
                                        }
                                    } else {
                                        DOMEval(node.textContent.replace(rcleanScript, ""), doc);
                                    }
                                }
                            }
                        }
                    }
                }

                return collection;
            }

            function remove(elem, selector, keepData) {
                var node,
                    nodes = selector ? jQuery.filter(selector, elem) : elem,
                    i = 0;

                for (; (node = nodes[i]) != null; i++) {
                    if (!keepData && node.nodeType === 1) {
                        jQuery.cleanData(getAll(node));
                    }

                    if (node.parentNode) {
                        if (keepData && jQuery.contains(node.ownerDocument, node)) {
                            setGlobalEval(getAll(node, "script"));
                        }
                        node.parentNode.removeChild(node);
                    }
                }

                return elem;
            }

            jQuery.extend({
                htmlPrefilter: function (html) {
                    return html.replace(rxhtmlTag, "<$1></$2>");
                },

                clone: function (elem, dataAndEvents, deepDataAndEvents) {
                    var i, l, srcElements, destElements,
                        clone = elem.cloneNode(true),
                        inPage = jQuery.contains(elem.ownerDocument, elem);

                    // Fix IE cloning issues
                    if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) &&
                        !jQuery.isXMLDoc(elem)) {

                        // We eschew Sizzle here for performance reasons: https://jsperf.com/getall-vs-sizzle/2
                        destElements = getAll(clone);
                        srcElements = getAll(elem);

                        for (i = 0, l = srcElements.length; i < l; i++) {
                            fixInput(srcElements[i], destElements[i]);
                        }
                    }

                    // Copy the events from the original to the clone
                    if (dataAndEvents) {
                        if (deepDataAndEvents) {
                            srcElements = srcElements || getAll(elem);
                            destElements = destElements || getAll(clone);

                            for (i = 0, l = srcElements.length; i < l; i++) {
                                cloneCopyEvent(srcElements[i], destElements[i]);
                            }
                        } else {
                            cloneCopyEvent(elem, clone);
                        }
                    }

                    // Preserve script evaluation history
                    destElements = getAll(clone, "script");
                    if (destElements.length > 0) {
                        setGlobalEval(destElements, !inPage && getAll(elem, "script"));
                    }

                    // Return the cloned set
                    return clone;
                },

                cleanData: function (elems) {
                    var data, elem, type,
                        special = jQuery.event.special,
                        i = 0;

                    for (; (elem = elems[i]) !== undefined; i++) {
                        if (acceptData(elem)) {
                            if ((data = elem[dataPriv.expando])) {
                                if (data.events) {
                                    for (type in data.events) {
                                        if (special[type]) {
                                            jQuery.event.remove(elem, type);

                                            // This is a shortcut to avoid jQuery.event.remove's overhead
                                        } else {
                                            jQuery.removeEvent(elem, type, data.handle);
                                        }
                                    }
                                }

                                // Support: Chrome <=35 - 45+
                                // Assign undefined instead of using delete, see Data#remove
                                elem[dataPriv.expando] = undefined;
                            }
                            if (elem[dataUser.expando]) {

                                // Support: Chrome <=35 - 45+
                                // Assign undefined instead of using delete, see Data#remove
                                elem[dataUser.expando] = undefined;
                            }
                        }
                    }
                }
            });

            jQuery.fn.extend({
                detach: function (selector) {
                    return remove(this, selector, true);
                },

                remove: function (selector) {
                    return remove(this, selector);
                },

                text: function (value) {
                    return access(this, function (value) {
                        return value === undefined ?
                            jQuery.text(this) :
                            this.empty().each(function () {
                                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                                    this.textContent = value;
                                }
                            });
                    }, null, value, arguments.length);
                },

                append: function () {
                    return domManip(this, arguments, function (elem) {
                        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                            var target = manipulationTarget(this, elem);
                            target.appendChild(elem);
                        }
                    });
                },

                prepend: function () {
                    return domManip(this, arguments, function (elem) {
                        if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                            var target = manipulationTarget(this, elem);
                            target.insertBefore(elem, target.firstChild);
                        }
                    });
                },

                before: function () {
                    return domManip(this, arguments, function (elem) {
                        if (this.parentNode) {
                            this.parentNode.insertBefore(elem, this);
                        }
                    });
                },

                after: function () {
                    return domManip(this, arguments, function (elem) {
                        if (this.parentNode) {
                            this.parentNode.insertBefore(elem, this.nextSibling);
                        }
                    });
                },

                empty: function () {
                    var elem,
                        i = 0;

                    for (; (elem = this[i]) != null; i++) {
                        if (elem.nodeType === 1) {

                            // Prevent memory leaks
                            jQuery.cleanData(getAll(elem, false));

                            // Remove any remaining nodes
                            elem.textContent = "";
                        }
                    }

                    return this;
                },

                clone: function (dataAndEvents, deepDataAndEvents) {
                    dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
                    deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

                    return this.map(function () {
                        return jQuery.clone(this, dataAndEvents, deepDataAndEvents);
                    });
                },

                html: function (value) {
                    return access(this, function (value) {
                        var elem = this[0] || {},
                            i = 0,
                            l = this.length;

                        if (value === undefined && elem.nodeType === 1) {
                            return elem.innerHTML;
                        }

                        // See if we can take a shortcut and just use innerHTML
                        if (typeof value === "string" && !rnoInnerhtml.test(value) &&
                            !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {

                            value = jQuery.htmlPrefilter(value);

                            try {
                                for (; i < l; i++) {
                                    elem = this[i] || {};

                                    // Remove element nodes and prevent memory leaks
                                    if (elem.nodeType === 1) {
                                        jQuery.cleanData(getAll(elem, false));
                                        elem.innerHTML = value;
                                    }
                                }

                                elem = 0;

                                // If using innerHTML throws an exception, use the fallback method
                            } catch (e) { }
                        }

                        if (elem) {
                            this.empty().append(value);
                        }
                    }, null, value, arguments.length);
                },

                replaceWith: function () {
                    var ignored = [];

                    // Make the changes, replacing each non-ignored context element with the new content
                    return domManip(this, arguments, function (elem) {
                        var parent = this.parentNode;

                        if (jQuery.inArray(this, ignored) < 0) {
                            jQuery.cleanData(getAll(this));
                            if (parent) {
                                parent.replaceChild(elem, this);
                            }
                        }

                        // Force callback invocation
                    }, ignored);
                }
            });

            jQuery.each({
                appendTo: "append",
                prependTo: "prepend",
                insertBefore: "before",
                insertAfter: "after",
                replaceAll: "replaceWith"
            }, function (name, original) {
                jQuery.fn[name] = function (selector) {
                    var elems,
                        ret = [],
                        insert = jQuery(selector),
                        last = insert.length - 1,
                        i = 0;

                    for (; i <= last; i++) {
                        elems = i === last ? this : this.clone(true);
                        jQuery(insert[i])[original](elems);

                        // Support: Android <=4.0 only, PhantomJS 1 only
                        // .get() because push.apply(_, arraylike) throws on ancient WebKit
                        push.apply(ret, elems.get());
                    }

                    return this.pushStack(ret);
                };
            });
            var rmargin = (/^margin/);

            var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");

            var getStyles = function (elem) {

                // Support: IE <=11 only, Firefox <=30 (#15098, #14150)
                // IE throws on elements created in popups
                // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
                var view = elem.ownerDocument.defaultView;

                if (!view || !view.opener) {
                    view = window;
                }

                return view.getComputedStyle(elem);
            };



            (function () {

                // Executing both pixelPosition & boxSizingReliable tests require only one layout
                // so they're executed at the same time to save the second computation.
                function computeStyleTests() {

                    // This is a singleton, we need to execute it only once
                    if (!div) {
                        return;
                    }

                    div.style.cssText =
                        "box-sizing:border-box;" +
                        "position:relative;display:block;" +
                        "margin:auto;border:1px;padding:1px;" +
                        "top:1%;width:50%";
                    div.innerHTML = "";
                    documentElement.appendChild(container);

                    var divStyle = window.getComputedStyle(div);
                    pixelPositionVal = divStyle.top !== "1%";

                    // Support: Android 4.0 - 4.3 only, Firefox <=3 - 44
                    reliableMarginLeftVal = divStyle.marginLeft === "2px";
                    boxSizingReliableVal = divStyle.width === "4px";

                    // Support: Android 4.0 - 4.3 only
                    // Some styles come back with percentage values, even though they shouldn't
                    div.style.marginRight = "50%";
                    pixelMarginRightVal = divStyle.marginRight === "4px";

                    documentElement.removeChild(container);

                    // Nullify the div so it wouldn't be stored in the memory and
                    // it will also be a sign that checks already performed
                    div = null;
                }

                var pixelPositionVal, boxSizingReliableVal, pixelMarginRightVal, reliableMarginLeftVal,
                    container = document.createElement("div"),
                    div = document.createElement("div");

                // Finish early in limited (non-browser) environments
                if (!div.style) {
                    return;
                }

                // Support: IE <=9 - 11 only
                // Style of cloned element affects source element cloned (#8908)
                div.style.backgroundClip = "content-box";
                div.cloneNode(true).style.backgroundClip = "";
                support.clearCloneStyle = div.style.backgroundClip === "content-box";

                container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
                    "padding:0;margin-top:1px;position:absolute";
                container.appendChild(div);

                jQuery.extend(support, {
                    pixelPosition: function () {
                        computeStyleTests();
                        return pixelPositionVal;
                    },
                    boxSizingReliable: function () {
                        computeStyleTests();
                        return boxSizingReliableVal;
                    },
                    pixelMarginRight: function () {
                        computeStyleTests();
                        return pixelMarginRightVal;
                    },
                    reliableMarginLeft: function () {
                        computeStyleTests();
                        return reliableMarginLeftVal;
                    }
                });
            })();


            function curCSS(elem, name, computed) {
                var width, minWidth, maxWidth, ret,

                    // Support: Firefox 51+
                    // Retrieving style before computed somehow
                    // fixes an issue with getting wrong values
                    // on detached elements
                    style = elem.style;

                computed = computed || getStyles(elem);

                // getPropertyValue is needed for:
                //   .css('filter') (IE 9 only, #12537)
                //   .css('--customProperty) (#3144)
                if (computed) {
                    ret = computed.getPropertyValue(name) || computed[name];

                    if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {
                        ret = jQuery.style(elem, name);
                    }

                    // A tribute to the "awesome hack by Dean Edwards"
                    // Android Browser returns percentage for some values,
                    // but width seems to be reliably pixels.
                    // This is against the CSSOM draft spec:
                    // https://drafts.csswg.org/cssom/#resolved-values
                    if (!support.pixelMarginRight() && rnumnonpx.test(ret) && rmargin.test(name)) {

                        // Remember the original values
                        width = style.width;
                        minWidth = style.minWidth;
                        maxWidth = style.maxWidth;

                        // Put in the new values to get a computed value out
                        style.minWidth = style.maxWidth = style.width = ret;
                        ret = computed.width;

                        // Revert the changed values
                        style.width = width;
                        style.minWidth = minWidth;
                        style.maxWidth = maxWidth;
                    }
                }

                return ret !== undefined ?

                    // Support: IE <=9 - 11 only
                    // IE returns zIndex value as an integer.
                    ret + "" :
                    ret;
            }


            function addGetHookIf(conditionFn, hookFn) {

                // Define the hook, we'll check on the first run if it's really needed.
                return {
                    get: function () {
                        if (conditionFn()) {

                            // Hook not needed (or it's not possible to use it due
                            // to missing dependency), remove it.
                            delete this.get;
                            return;
                        }

                        // Hook needed; redefine it so that the support test is not executed again.
                        return (this.get = hookFn).apply(this, arguments);
                    }
                };
            }


            var

                // Swappable if display is none or starts with table
                // except "table", "table-cell", or "table-caption"
                // See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
                rdisplayswap = /^(none|table(?!-c[ea]).+)/,
                rcustomProp = /^--/,
                cssShow = { position: "absolute", visibility: "hidden", display: "block" },
                cssNormalTransform = {
                    letterSpacing: "0",
                    fontWeight: "400"
                },

                cssPrefixes = ["Webkit", "Moz", "ms"],
                emptyStyle = document.createElement("div").style;

            // Return a css property mapped to a potentially vendor prefixed property
            function vendorPropName(name) {

                // Shortcut for names that are not vendor prefixed
                if (name in emptyStyle) {
                    return name;
                }

                // Check for vendor prefixed names
                var capName = name[0].toUpperCase() + name.slice(1),
                    i = cssPrefixes.length;

                while (i--) {
                    name = cssPrefixes[i] + capName;
                    if (name in emptyStyle) {
                        return name;
                    }
                }
            }

            // Return a property mapped along what jQuery.cssProps suggests or to
            // a vendor prefixed property.
            function finalPropName(name) {
                var ret = jQuery.cssProps[name];
                if (!ret) {
                    ret = jQuery.cssProps[name] = vendorPropName(name) || name;
                }
                return ret;
            }

            function setPositiveNumber(elem, value, subtract) {

                // Any relative (+/-) values have already been
                // normalized at this point
                var matches = rcssNum.exec(value);
                return matches ?

                    // Guard against undefined "subtract", e.g., when used as in cssHooks
                    Math.max(0, matches[2] - (subtract || 0)) + (matches[3] || "px") :
                    value;
            }

            function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
                var i,
                    val = 0;

                // If we already have the right measurement, avoid augmentation
                if (extra === (isBorderBox ? "border" : "content")) {
                    i = 4;

                    // Otherwise initialize for horizontal or vertical properties
                } else {
                    i = name === "width" ? 1 : 0;
                }

                for (; i < 4; i += 2) {

                    // Both box models exclude margin, so add it if we want it
                    if (extra === "margin") {
                        val += jQuery.css(elem, extra + cssExpand[i], true, styles);
                    }

                    if (isBorderBox) {

                        // border-box includes padding, so remove it if we want content
                        if (extra === "content") {
                            val -= jQuery.css(elem, "padding" + cssExpand[i], true, styles);
                        }

                        // At this point, extra isn't border nor margin, so remove border
                        if (extra !== "margin") {
                            val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                        }
                    } else {

                        // At this point, extra isn't content, so add padding
                        val += jQuery.css(elem, "padding" + cssExpand[i], true, styles);

                        // At this point, extra isn't content nor padding, so add border
                        if (extra !== "padding") {
                            val += jQuery.css(elem, "border" + cssExpand[i] + "Width", true, styles);
                        }
                    }
                }

                return val;
            }

            function getWidthOrHeight(elem, name, extra) {

                // Start with computed style
                var valueIsBorderBox,
                    styles = getStyles(elem),
                    val = curCSS(elem, name, styles),
                    isBorderBox = jQuery.css(elem, "boxSizing", false, styles) === "border-box";

                // Computed unit is not pixels. Stop here and return.
                if (rnumnonpx.test(val)) {
                    return val;
                }

                // Check for style in case a browser which returns unreliable values
                // for getComputedStyle silently falls back to the reliable elem.style
                valueIsBorderBox = isBorderBox &&
                    (support.boxSizingReliable() || val === elem.style[name]);

                // Fall back to offsetWidth/Height when value is "auto"
                // This happens for inline elements with no explicit setting (gh-3571)
                if (val === "auto") {
                    val = elem["offset" + name[0].toUpperCase() + name.slice(1)];
                }

                // Normalize "", auto, and prepare for extra
                val = parseFloat(val) || 0;

                // Use the active box-sizing model to add/subtract irrelevant styles
                return (val +
                    augmentWidthOrHeight(
                        elem,
                        name,
                        extra || (isBorderBox ? "border" : "content"),
                        valueIsBorderBox,
                        styles
                    )
                ) + "px";
            }

            jQuery.extend({

                // Add in style property hooks for overriding the default
                // behavior of getting and setting a style property
                cssHooks: {
                    opacity: {
                        get: function (elem, computed) {
                            if (computed) {

                                // We should always get a number back from opacity
                                var ret = curCSS(elem, "opacity");
                                return ret === "" ? "1" : ret;
                            }
                        }
                    }
                },

                // Don't automatically add "px" to these possibly-unitless properties
                cssNumber: {
                    "animationIterationCount": true,
                    "columnCount": true,
                    "fillOpacity": true,
                    "flexGrow": true,
                    "flexShrink": true,
                    "fontWeight": true,
                    "lineHeight": true,
                    "opacity": true,
                    "order": true,
                    "orphans": true,
                    "widows": true,
                    "zIndex": true,
                    "zoom": true
                },

                // Add in properties whose names you wish to fix before
                // setting or getting the value
                cssProps: {
                    "float": "cssFloat"
                },

                // Get and set the style property on a DOM Node
                style: function (elem, name, value, extra) {

                    // Don't set styles on text and comment nodes
                    if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
                        return;
                    }

                    // Make sure that we're working with the right name
                    var ret, type, hooks,
                        origName = jQuery.camelCase(name),
                        isCustomProp = rcustomProp.test(name),
                        style = elem.style;

                    // Make sure that we're working with the right name. We don't
                    // want to query the value if it is a CSS custom property
                    // since they are user-defined.
                    if (!isCustomProp) {
                        name = finalPropName(origName);
                    }

                    // Gets hook for the prefixed version, then unprefixed version
                    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

                    // Check if we're setting a value
                    if (value !== undefined) {
                        type = typeof value;

                        // Convert "+=" or "-=" to relative numbers (#7345)
                        if (type === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
                            value = adjustCSS(elem, name, ret);

                            // Fixes bug #9237
                            type = "number";
                        }

                        // Make sure that null and NaN values aren't set (#7116)
                        if (value == null || value !== value) {
                            return;
                        }

                        // If a number was passed in, add the unit (except for certain CSS properties)
                        if (type === "number") {
                            value += ret && ret[3] || (jQuery.cssNumber[origName] ? "" : "px");
                        }

                        // background-* props affect original clone's values
                        if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                            style[name] = "inherit";
                        }

                        // If a hook was provided, use that value, otherwise just set the specified value
                        if (!hooks || !("set" in hooks) ||
                            (value = hooks.set(elem, value, extra)) !== undefined) {

                            if (isCustomProp) {
                                style.setProperty(name, value);
                            } else {
                                style[name] = value;
                            }
                        }

                    } else {

                        // If a hook was provided get the non-computed value from there
                        if (hooks && "get" in hooks &&
                            (ret = hooks.get(elem, false, extra)) !== undefined) {

                            return ret;
                        }

                        // Otherwise just get the value from the style object
                        return style[name];
                    }
                },

                css: function (elem, name, extra, styles) {
                    var val, num, hooks,
                        origName = jQuery.camelCase(name),
                        isCustomProp = rcustomProp.test(name);

                    // Make sure that we're working with the right name. We don't
                    // want to modify the value if it is a CSS custom property
                    // since they are user-defined.
                    if (!isCustomProp) {
                        name = finalPropName(origName);
                    }

                    // Try prefixed name followed by the unprefixed name
                    hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName];

                    // If a hook was provided get the computed value from there
                    if (hooks && "get" in hooks) {
                        val = hooks.get(elem, true, extra);
                    }

                    // Otherwise, if a way to get the computed value exists, use that
                    if (val === undefined) {
                        val = curCSS(elem, name, styles);
                    }

                    // Convert "normal" to computed value
                    if (val === "normal" && name in cssNormalTransform) {
                        val = cssNormalTransform[name];
                    }

                    // Make numeric if forced or a qualifier was provided and val looks numeric
                    if (extra === "" || extra) {
                        num = parseFloat(val);
                        return extra === true || isFinite(num) ? num || 0 : val;
                    }

                    return val;
                }
            });

            jQuery.each(["height", "width"], function (i, name) {
                jQuery.cssHooks[name] = {
                    get: function (elem, computed, extra) {
                        if (computed) {

                            // Certain elements can have dimension info if we invisibly show them
                            // but it must have a current display style that would benefit
                            return rdisplayswap.test(jQuery.css(elem, "display")) &&

                                // Support: Safari 8+
                                // Table columns in Safari have non-zero offsetWidth & zero
                                // getBoundingClientRect().width unless display is changed.
                                // Support: IE <=11 only
                                // Running getBoundingClientRect on a disconnected node
                                // in IE throws an error.
                                (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ?
                                swap(elem, cssShow, function () {
                                    return getWidthOrHeight(elem, name, extra);
                                }) :
                                getWidthOrHeight(elem, name, extra);
                        }
                    },

                    set: function (elem, value, extra) {
                        var matches,
                            styles = extra && getStyles(elem),
                            subtract = extra && augmentWidthOrHeight(
                                elem,
                                name,
                                extra,
                                jQuery.css(elem, "boxSizing", false, styles) === "border-box",
                                styles
                            );

                        // Convert to pixels if value adjustment is needed
                        if (subtract && (matches = rcssNum.exec(value)) &&
                            (matches[3] || "px") !== "px") {

                            elem.style[name] = value;
                            value = jQuery.css(elem, name);
                        }

                        return setPositiveNumber(elem, value, subtract);
                    }
                };
            });

            jQuery.cssHooks.marginLeft = addGetHookIf(support.reliableMarginLeft,
                function (elem, computed) {
                    if (computed) {
                        return (parseFloat(curCSS(elem, "marginLeft")) ||
                            elem.getBoundingClientRect().left -
                            swap(elem, { marginLeft: 0 }, function () {
                                return elem.getBoundingClientRect().left;
                            })
                        ) + "px";
                    }
                }
            );

            // These hooks are used by animate to expand properties
            jQuery.each({
                margin: "",
                padding: "",
                border: "Width"
            }, function (prefix, suffix) {
                jQuery.cssHooks[prefix + suffix] = {
                    expand: function (value) {
                        var i = 0,
                            expanded = {},

                            // Assumes a single number if not a string
                            parts = typeof value === "string" ? value.split(" ") : [value];

                        for (; i < 4; i++) {
                            expanded[prefix + cssExpand[i] + suffix] =
                                parts[i] || parts[i - 2] || parts[0];
                        }

                        return expanded;
                    }
                };

                if (!rmargin.test(prefix)) {
                    jQuery.cssHooks[prefix + suffix].set = setPositiveNumber;
                }
            });

            jQuery.fn.extend({
                css: function (name, value) {
                    return access(this, function (elem, name, value) {
                        var styles, len,
                            map = {},
                            i = 0;

                        if (Array.isArray(name)) {
                            styles = getStyles(elem);
                            len = name.length;

                            for (; i < len; i++) {
                                map[name[i]] = jQuery.css(elem, name[i], false, styles);
                            }

                            return map;
                        }

                        return value !== undefined ?
                            jQuery.style(elem, name, value) :
                            jQuery.css(elem, name);
                    }, name, value, arguments.length > 1);
                }
            });


            function Tween(elem, options, prop, end, easing) {
                return new Tween.prototype.init(elem, options, prop, end, easing);
            }
            jQuery.Tween = Tween;

            Tween.prototype = {
                constructor: Tween,
                init: function (elem, options, prop, end, easing, unit) {
                    this.elem = elem;
                    this.prop = prop;
                    this.easing = easing || jQuery.easing._default;
                    this.options = options;
                    this.start = this.now = this.cur();
                    this.end = end;
                    this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px");
                },
                cur: function () {
                    var hooks = Tween.propHooks[this.prop];

                    return hooks && hooks.get ?
                        hooks.get(this) :
                        Tween.propHooks._default.get(this);
                },
                run: function (percent) {
                    var eased,
                        hooks = Tween.propHooks[this.prop];

                    if (this.options.duration) {
                        this.pos = eased = jQuery.easing[this.easing](
                            percent, this.options.duration * percent, 0, 1, this.options.duration
                        );
                    } else {
                        this.pos = eased = percent;
                    }
                    this.now = (this.end - this.start) * eased + this.start;

                    if (this.options.step) {
                        this.options.step.call(this.elem, this.now, this);
                    }

                    if (hooks && hooks.set) {
                        hooks.set(this);
                    } else {
                        Tween.propHooks._default.set(this);
                    }
                    return this;
                }
            };

            Tween.prototype.init.prototype = Tween.prototype;

            Tween.propHooks = {
                _default: {
                    get: function (tween) {
                        var result;

                        // Use a property on the element directly when it is not a DOM element,
                        // or when there is no matching style property that exists.
                        if (tween.elem.nodeType !== 1 ||
                            tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
                            return tween.elem[tween.prop];
                        }

                        // Passing an empty string as a 3rd parameter to .css will automatically
                        // attempt a parseFloat and fallback to a string if the parse fails.
                        // Simple values such as "10px" are parsed to Float;
                        // complex values such as "rotate(1rad)" are returned as-is.
                        result = jQuery.css(tween.elem, tween.prop, "");

                        // Empty strings, null, undefined and "auto" are converted to 0.
                        return !result || result === "auto" ? 0 : result;
                    },
                    set: function (tween) {

                        // Use step hook for back compat.
                        // Use cssHook if its there.
                        // Use .style if available and use plain properties where available.
                        if (jQuery.fx.step[tween.prop]) {
                            jQuery.fx.step[tween.prop](tween);
                        } else if (tween.elem.nodeType === 1 &&
                            (tween.elem.style[jQuery.cssProps[tween.prop]] != null ||
                                jQuery.cssHooks[tween.prop])) {
                            jQuery.style(tween.elem, tween.prop, tween.now + tween.unit);
                        } else {
                            tween.elem[tween.prop] = tween.now;
                        }
                    }
                }
            };

            // Support: IE <=9 only
            // Panic based approach to setting things on disconnected nodes
            Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
                set: function (tween) {
                    if (tween.elem.nodeType && tween.elem.parentNode) {
                        tween.elem[tween.prop] = tween.now;
                    }
                }
            };

            jQuery.easing = {
                linear: function (p) {
                    return p;
                },
                swing: function (p) {
                    return 0.5 - Math.cos(p * Math.PI) / 2;
                },
                _default: "swing"
            };

            jQuery.fx = Tween.prototype.init;

            // Back compat <1.8 extension point
            jQuery.fx.step = {};




            var
                fxNow, inProgress,
                rfxtypes = /^(?:toggle|show|hide)$/,
                rrun = /queueHooks$/;

            function schedule() {
                if (inProgress) {
                    if (document.hidden === false && window.requestAnimationFrame) {
                        window.requestAnimationFrame(schedule);
                    } else {
                        window.setTimeout(schedule, jQuery.fx.interval);
                    }

                    jQuery.fx.tick();
                }
            }

            // Animations created synchronously will run synchronously
            function createFxNow() {
                window.setTimeout(function () {
                    fxNow = undefined;
                });
                return (fxNow = jQuery.now());
            }

            // Generate parameters to create a standard animation
            function genFx(type, includeWidth) {
                var which,
                    i = 0,
                    attrs = { height: type };

                // If we include width, step value is 1 to do all cssExpand values,
                // otherwise step value is 2 to skip over Left and Right
                includeWidth = includeWidth ? 1 : 0;
                for (; i < 4; i += 2 - includeWidth) {
                    which = cssExpand[i];
                    attrs["margin" + which] = attrs["padding" + which] = type;
                }

                if (includeWidth) {
                    attrs.opacity = attrs.width = type;
                }

                return attrs;
            }

            function createTween(value, prop, animation) {
                var tween,
                    collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]),
                    index = 0,
                    length = collection.length;
                for (; index < length; index++) {
                    if ((tween = collection[index].call(animation, prop, value))) {

                        // We're done with this property
                        return tween;
                    }
                }
            }

            function defaultPrefilter(elem, props, opts) {
                var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display,
                    isBox = "width" in props || "height" in props,
                    anim = this,
                    orig = {},
                    style = elem.style,
                    hidden = elem.nodeType && isHiddenWithinTree(elem),
                    dataShow = dataPriv.get(elem, "fxshow");

                // Queue-skipping animations hijack the fx hooks
                if (!opts.queue) {
                    hooks = jQuery._queueHooks(elem, "fx");
                    if (hooks.unqueued == null) {
                        hooks.unqueued = 0;
                        oldfire = hooks.empty.fire;
                        hooks.empty.fire = function () {
                            if (!hooks.unqueued) {
                                oldfire();
                            }
                        };
                    }
                    hooks.unqueued++;

                    anim.always(function () {

                        // Ensure the complete handler is called before this completes
                        anim.always(function () {
                            hooks.unqueued--;
                            if (!jQuery.queue(elem, "fx").length) {
                                hooks.empty.fire();
                            }
                        });
                    });
                }

                // Detect show/hide animations
                for (prop in props) {
                    value = props[prop];
                    if (rfxtypes.test(value)) {
                        delete props[prop];
                        toggle = toggle || value === "toggle";
                        if (value === (hidden ? "hide" : "show")) {

                            // Pretend to be hidden if this is a "show" and
                            // there is still data from a stopped show/hide
                            if (value === "show" && dataShow && dataShow[prop] !== undefined) {
                                hidden = true;

                                // Ignore all other no-op show/hide data
                            } else {
                                continue;
                            }
                        }
                        orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop);
                    }
                }

                // Bail out if this is a no-op like .hide().hide()
                propTween = !jQuery.isEmptyObject(props);
                if (!propTween && jQuery.isEmptyObject(orig)) {
                    return;
                }

                // Restrict "overflow" and "display" styles during box animations
                if (isBox && elem.nodeType === 1) {

                    // Support: IE <=9 - 11, Edge 12 - 13
                    // Record all 3 overflow attributes because IE does not infer the shorthand
                    // from identically-valued overflowX and overflowY
                    opts.overflow = [style.overflow, style.overflowX, style.overflowY];

                    // Identify a display type, preferring old show/hide data over the CSS cascade
                    restoreDisplay = dataShow && dataShow.display;
                    if (restoreDisplay == null) {
                        restoreDisplay = dataPriv.get(elem, "display");
                    }
                    display = jQuery.css(elem, "display");
                    if (display === "none") {
                        if (restoreDisplay) {
                            display = restoreDisplay;
                        } else {

                            // Get nonempty value(s) by temporarily forcing visibility
                            showHide([elem], true);
                            restoreDisplay = elem.style.display || restoreDisplay;
                            display = jQuery.css(elem, "display");
                            showHide([elem]);
                        }
                    }

                    // Animate inline elements as inline-block
                    if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
                        if (jQuery.css(elem, "float") === "none") {

                            // Restore the original display value at the end of pure show/hide animations
                            if (!propTween) {
                                anim.done(function () {
                                    style.display = restoreDisplay;
                                });
                                if (restoreDisplay == null) {
                                    display = style.display;
                                    restoreDisplay = display === "none" ? "" : display;
                                }
                            }
                            style.display = "inline-block";
                        }
                    }
                }

                if (opts.overflow) {
                    style.overflow = "hidden";
                    anim.always(function () {
                        style.overflow = opts.overflow[0];
                        style.overflowX = opts.overflow[1];
                        style.overflowY = opts.overflow[2];
                    });
                }

                // Implement show/hide animations
                propTween = false;
                for (prop in orig) {

                    // General show/hide setup for this element animation
                    if (!propTween) {
                        if (dataShow) {
                            if ("hidden" in dataShow) {
                                hidden = dataShow.hidden;
                            }
                        } else {
                            dataShow = dataPriv.access(elem, "fxshow", { display: restoreDisplay });
                        }

                        // Store hidden/visible for toggle so `.stop().toggle()` "reverses"
                        if (toggle) {
                            dataShow.hidden = !hidden;
                        }

                        // Show elements before animating them
                        if (hidden) {
                            showHide([elem], true);
                        }

                        /* eslint-disable no-loop-func */

                        anim.done(function () {

                            /* eslint-enable no-loop-func */

                            // The final step of a "hide" animation is actually hiding the element
                            if (!hidden) {
                                showHide([elem]);
                            }
                            dataPriv.remove(elem, "fxshow");
                            for (prop in orig) {
                                jQuery.style(elem, prop, orig[prop]);
                            }
                        });
                    }

                    // Per-property setup
                    propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
                    if (!(prop in dataShow)) {
                        dataShow[prop] = propTween.start;
                        if (hidden) {
                            propTween.end = propTween.start;
                            propTween.start = 0;
                        }
                    }
                }
            }

            function propFilter(props, specialEasing) {
                var index, name, easing, value, hooks;

                // camelCase, specialEasing and expand cssHook pass
                for (index in props) {
                    name = jQuery.camelCase(index);
                    easing = specialEasing[name];
                    value = props[index];
                    if (Array.isArray(value)) {
                        easing = value[1];
                        value = props[index] = value[0];
                    }

                    if (index !== name) {
                        props[name] = value;
                        delete props[index];
                    }

                    hooks = jQuery.cssHooks[name];
                    if (hooks && "expand" in hooks) {
                        value = hooks.expand(value);
                        delete props[name];

                        // Not quite $.extend, this won't overwrite existing keys.
                        // Reusing 'index' because we have the correct "name"
                        for (index in value) {
                            if (!(index in props)) {
                                props[index] = value[index];
                                specialEasing[index] = easing;
                            }
                        }
                    } else {
                        specialEasing[name] = easing;
                    }
                }
            }

            function Animation(elem, properties, options) {
                var result,
                    stopped,
                    index = 0,
                    length = Animation.prefilters.length,
                    deferred = jQuery.Deferred().always(function () {

                        // Don't match elem in the :animated selector
                        delete tick.elem;
                    }),
                    tick = function () {
                        if (stopped) {
                            return false;
                        }
                        var currentTime = fxNow || createFxNow(),
                            remaining = Math.max(0, animation.startTime + animation.duration - currentTime),

                            // Support: Android 2.3 only
                            // Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
                            temp = remaining / animation.duration || 0,
                            percent = 1 - temp,
                            index = 0,
                            length = animation.tweens.length;

                        for (; index < length; index++) {
                            animation.tweens[index].run(percent);
                        }

                        deferred.notifyWith(elem, [animation, percent, remaining]);

                        // If there's more to do, yield
                        if (percent < 1 && length) {
                            return remaining;
                        }

                        // If this was an empty animation, synthesize a final progress notification
                        if (!length) {
                            deferred.notifyWith(elem, [animation, 1, 0]);
                        }

                        // Resolve the animation and report its conclusion
                        deferred.resolveWith(elem, [animation]);
                        return false;
                    },
                    animation = deferred.promise({
                        elem: elem,
                        props: jQuery.extend({}, properties),
                        opts: jQuery.extend(true, {
                            specialEasing: {},
                            easing: jQuery.easing._default
                        }, options),
                        originalProperties: properties,
                        originalOptions: options,
                        startTime: fxNow || createFxNow(),
                        duration: options.duration,
                        tweens: [],
                        createTween: function (prop, end) {
                            var tween = jQuery.Tween(elem, animation.opts, prop, end,
                                animation.opts.specialEasing[prop] || animation.opts.easing);
                            animation.tweens.push(tween);
                            return tween;
                        },
                        stop: function (gotoEnd) {
                            var index = 0,

                                // If we are going to the end, we want to run all the tweens
                                // otherwise we skip this part
                                length = gotoEnd ? animation.tweens.length : 0;
                            if (stopped) {
                                return this;
                            }
                            stopped = true;
                            for (; index < length; index++) {
                                animation.tweens[index].run(1);
                            }

                            // Resolve when we played the last frame; otherwise, reject
                            if (gotoEnd) {
                                deferred.notifyWith(elem, [animation, 1, 0]);
                                deferred.resolveWith(elem, [animation, gotoEnd]);
                            } else {
                                deferred.rejectWith(elem, [animation, gotoEnd]);
                            }
                            return this;
                        }
                    }),
                    props = animation.props;

                propFilter(props, animation.opts.specialEasing);

                for (; index < length; index++) {
                    result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
                    if (result) {
                        if (jQuery.isFunction(result.stop)) {
                            jQuery._queueHooks(animation.elem, animation.opts.queue).stop =
                                jQuery.proxy(result.stop, result);
                        }
                        return result;
                    }
                }

                jQuery.map(props, createTween, animation);

                if (jQuery.isFunction(animation.opts.start)) {
                    animation.opts.start.call(elem, animation);
                }

                // Attach callbacks from options
                animation
                    .progress(animation.opts.progress)
                    .done(animation.opts.done, animation.opts.complete)
                    .fail(animation.opts.fail)
                    .always(animation.opts.always);

                jQuery.fx.timer(
                    jQuery.extend(tick, {
                        elem: elem,
                        anim: animation,
                        queue: animation.opts.queue
                    })
                );

                return animation;
            }

            jQuery.Animation = jQuery.extend(Animation, {

                tweeners: {
                    "*": [function (prop, value) {
                        var tween = this.createTween(prop, value);
                        adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
                        return tween;
                    }]
                },

                tweener: function (props, callback) {
                    if (jQuery.isFunction(props)) {
                        callback = props;
                        props = ["*"];
                    } else {
                        props = props.match(rnothtmlwhite);
                    }

                    var prop,
                        index = 0,
                        length = props.length;

                    for (; index < length; index++) {
                        prop = props[index];
                        Animation.tweeners[prop] = Animation.tweeners[prop] || [];
                        Animation.tweeners[prop].unshift(callback);
                    }
                },

                prefilters: [defaultPrefilter],

                prefilter: function (callback, prepend) {
                    if (prepend) {
                        Animation.prefilters.unshift(callback);
                    } else {
                        Animation.prefilters.push(callback);
                    }
                }
            });

            jQuery.speed = function (speed, easing, fn) {
                var opt = speed && typeof speed === "object" ? jQuery.extend({}, speed) : {
                    complete: fn || !fn && easing ||
                        jQuery.isFunction(speed) && speed,
                    duration: speed,
                    easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
                };

                // Go to the end state if fx are off
                if (jQuery.fx.off) {
                    opt.duration = 0;

                } else {
                    if (typeof opt.duration !== "number") {
                        if (opt.duration in jQuery.fx.speeds) {
                            opt.duration = jQuery.fx.speeds[opt.duration];

                        } else {
                            opt.duration = jQuery.fx.speeds._default;
                        }
                    }
                }

                // Normalize opt.queue - true/undefined/null -> "fx"
                if (opt.queue == null || opt.queue === true) {
                    opt.queue = "fx";
                }

                // Queueing
                opt.old = opt.complete;

                opt.complete = function () {
                    if (jQuery.isFunction(opt.old)) {
                        opt.old.call(this);
                    }

                    if (opt.queue) {
                        jQuery.dequeue(this, opt.queue);
                    }
                };

                return opt;
            };

            jQuery.fn.extend({
                fadeTo: function (speed, to, easing, callback) {

                    // Show any hidden elements after setting opacity to 0
                    return this.filter(isHiddenWithinTree).css("opacity", 0).show()

                        // Animate to the value specified
                        .end().animate({ opacity: to }, speed, easing, callback);
                },
                animate: function (prop, speed, easing, callback) {
                    var empty = jQuery.isEmptyObject(prop),
                        optall = jQuery.speed(speed, easing, callback),
                        doAnimation = function () {

                            // Operate on a copy of prop so per-property easing won't be lost
                            var anim = Animation(this, jQuery.extend({}, prop), optall);

                            // Empty animations, or finishing resolves immediately
                            if (empty || dataPriv.get(this, "finish")) {
                                anim.stop(true);
                            }
                        };
                    doAnimation.finish = doAnimation;

                    return empty || optall.queue === false ?
                        this.each(doAnimation) :
                        this.queue(optall.queue, doAnimation);
                },
                stop: function (type, clearQueue, gotoEnd) {
                    var stopQueue = function (hooks) {
                        var stop = hooks.stop;
                        delete hooks.stop;
                        stop(gotoEnd);
                    };

                    if (typeof type !== "string") {
                        gotoEnd = clearQueue;
                        clearQueue = type;
                        type = undefined;
                    }
                    if (clearQueue && type !== false) {
                        this.queue(type || "fx", []);
                    }

                    return this.each(function () {
                        var dequeue = true,
                            index = type != null && type + "queueHooks",
                            timers = jQuery.timers,
                            data = dataPriv.get(this);

                        if (index) {
                            if (data[index] && data[index].stop) {
                                stopQueue(data[index]);
                            }
                        } else {
                            for (index in data) {
                                if (data[index] && data[index].stop && rrun.test(index)) {
                                    stopQueue(data[index]);
                                }
                            }
                        }

                        for (index = timers.length; index--;) {
                            if (timers[index].elem === this &&
                                (type == null || timers[index].queue === type)) {

                                timers[index].anim.stop(gotoEnd);
                                dequeue = false;
                                timers.splice(index, 1);
                            }
                        }

                        // Start the next in the queue if the last step wasn't forced.
                        // Timers currently will call their complete callbacks, which
                        // will dequeue but only if they were gotoEnd.
                        if (dequeue || !gotoEnd) {
                            jQuery.dequeue(this, type);
                        }
                    });
                },
                finish: function (type) {
                    if (type !== false) {
                        type = type || "fx";
                    }
                    return this.each(function () {
                        var index,
                            data = dataPriv.get(this),
                            queue = data[type + "queue"],
                            hooks = data[type + "queueHooks"],
                            timers = jQuery.timers,
                            length = queue ? queue.length : 0;

                        // Enable finishing flag on private data
                        data.finish = true;

                        // Empty the queue first
                        jQuery.queue(this, type, []);

                        if (hooks && hooks.stop) {
                            hooks.stop.call(this, true);
                        }

                        // Look for any active animations, and finish them
                        for (index = timers.length; index--;) {
                            if (timers[index].elem === this && timers[index].queue === type) {
                                timers[index].anim.stop(true);
                                timers.splice(index, 1);
                            }
                        }

                        // Look for any animations in the old queue and finish them
                        for (index = 0; index < length; index++) {
                            if (queue[index] && queue[index].finish) {
                                queue[index].finish.call(this);
                            }
                        }

                        // Turn off finishing flag
                        delete data.finish;
                    });
                }
            });

            jQuery.each(["toggle", "show", "hide"], function (i, name) {
                var cssFn = jQuery.fn[name];
                jQuery.fn[name] = function (speed, easing, callback) {
                    return speed == null || typeof speed === "boolean" ?
                        cssFn.apply(this, arguments) :
                        this.animate(genFx(name, true), speed, easing, callback);
                };
            });

            // Generate shortcuts for custom animations
            jQuery.each({
                slideDown: genFx("show"),
                slideUp: genFx("hide"),
                slideToggle: genFx("toggle"),
                fadeIn: { opacity: "show" },
                fadeOut: { opacity: "hide" },
                fadeToggle: { opacity: "toggle" }
            }, function (name, props) {
                jQuery.fn[name] = function (speed, easing, callback) {
                    return this.animate(props, speed, easing, callback);
                };
            });

            jQuery.timers = [];
            jQuery.fx.tick = function () {
                var timer,
                    i = 0,
                    timers = jQuery.timers;

                fxNow = jQuery.now();

                for (; i < timers.length; i++) {
                    timer = timers[i];

                    // Run the timer and safely remove it when done (allowing for external removal)
                    if (!timer() && timers[i] === timer) {
                        timers.splice(i--, 1);
                    }
                }

                if (!timers.length) {
                    jQuery.fx.stop();
                }
                fxNow = undefined;
            };

            jQuery.fx.timer = function (timer) {
                jQuery.timers.push(timer);
                jQuery.fx.start();
            };

            jQuery.fx.interval = 13;
            jQuery.fx.start = function () {
                if (inProgress) {
                    return;
                }

                inProgress = true;
                schedule();
            };

            jQuery.fx.stop = function () {
                inProgress = null;
            };

            jQuery.fx.speeds = {
                slow: 600,
                fast: 200,

                // Default speed
                _default: 400
            };


            // Based off of the plugin by Clint Helfers, with permission.
            // https://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
            jQuery.fn.delay = function (time, type) {
                time = jQuery.fx ? jQuery.fx.speeds[time] || time : time;
                type = type || "fx";

                return this.queue(type, function (next, hooks) {
                    var timeout = window.setTimeout(next, time);
                    hooks.stop = function () {
                        window.clearTimeout(timeout);
                    };
                });
            };


            (function () {
                var input = document.createElement("input"),
                    select = document.createElement("select"),
                    opt = select.appendChild(document.createElement("option"));

                input.type = "checkbox";

                // Support: Android <=4.3 only
                // Default value for a checkbox should be "on"
                support.checkOn = input.value !== "";

                // Support: IE <=11 only
                // Must access selectedIndex to make default options select
                support.optSelected = opt.selected;

                // Support: IE <=11 only
                // An input loses its value after becoming a radio
                input = document.createElement("input");
                input.value = "t";
                input.type = "radio";
                support.radioValue = input.value === "t";
            })();


            var boolHook,
                attrHandle = jQuery.expr.attrHandle;

            jQuery.fn.extend({
                attr: function (name, value) {
                    return access(this, jQuery.attr, name, value, arguments.length > 1);
                },

                removeAttr: function (name) {
                    return this.each(function () {
                        jQuery.removeAttr(this, name);
                    });
                }
            });

            jQuery.extend({
                attr: function (elem, name, value) {
                    var ret, hooks,
                        nType = elem.nodeType;

                    // Don't get/set attributes on text, comment and attribute nodes
                    if (nType === 3 || nType === 8 || nType === 2) {
                        return;
                    }

                    // Fallback to prop when attributes are not supported
                    if (typeof elem.getAttribute === "undefined") {
                        return jQuery.prop(elem, name, value);
                    }

                    // Attribute hooks are determined by the lowercase version
                    // Grab necessary hook if one is defined
                    if (nType !== 1 || !jQuery.isXMLDoc(elem)) {
                        hooks = jQuery.attrHooks[name.toLowerCase()] ||
                            (jQuery.expr.match.bool.test(name) ? boolHook : undefined);
                    }

                    if (value !== undefined) {
                        if (value === null) {
                            jQuery.removeAttr(elem, name);
                            return;
                        }

                        if (hooks && "set" in hooks &&
                            (ret = hooks.set(elem, value, name)) !== undefined) {
                            return ret;
                        }

                        elem.setAttribute(name, value + "");
                        return value;
                    }

                    if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                        return ret;
                    }

                    ret = jQuery.find.attr(elem, name);

                    // Non-existent attributes return null, we normalize to undefined
                    return ret == null ? undefined : ret;
                },

                attrHooks: {
                    type: {
                        set: function (elem, value) {
                            if (!support.radioValue && value === "radio" &&
                                nodeName(elem, "input")) {
                                var val = elem.value;
                                elem.setAttribute("type", value);
                                if (val) {
                                    elem.value = val;
                                }
                                return value;
                            }
                        }
                    }
                },

                removeAttr: function (elem, value) {
                    var name,
                        i = 0,

                        // Attribute names can contain non-HTML whitespace characters
                        // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
                        attrNames = value && value.match(rnothtmlwhite);

                    if (attrNames && elem.nodeType === 1) {
                        while ((name = attrNames[i++])) {
                            elem.removeAttribute(name);
                        }
                    }
                }
            });

            // Hooks for boolean attributes
            boolHook = {
                set: function (elem, value, name) {
                    if (value === false) {

                        // Remove boolean attributes when set to false
                        jQuery.removeAttr(elem, name);
                    } else {
                        elem.setAttribute(name, name);
                    }
                    return name;
                }
            };

            jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
                var getter = attrHandle[name] || jQuery.find.attr;

                attrHandle[name] = function (elem, name, isXML) {
                    var ret, handle,
                        lowercaseName = name.toLowerCase();

                    if (!isXML) {

                        // Avoid an infinite loop by temporarily removing this function from the getter
                        handle = attrHandle[lowercaseName];
                        attrHandle[lowercaseName] = ret;
                        ret = getter(elem, name, isXML) != null ?
                            lowercaseName :
                            null;
                        attrHandle[lowercaseName] = handle;
                    }
                    return ret;
                };
            });




            var rfocusable = /^(?:input|select|textarea|button)$/i,
                rclickable = /^(?:a|area)$/i;

            jQuery.fn.extend({
                prop: function (name, value) {
                    return access(this, jQuery.prop, name, value, arguments.length > 1);
                },

                removeProp: function (name) {
                    return this.each(function () {
                        delete this[jQuery.propFix[name] || name];
                    });
                }
            });

            jQuery.extend({
                prop: function (elem, name, value) {
                    var ret, hooks,
                        nType = elem.nodeType;

                    // Don't get/set properties on text, comment and attribute nodes
                    if (nType === 3 || nType === 8 || nType === 2) {
                        return;
                    }

                    if (nType !== 1 || !jQuery.isXMLDoc(elem)) {

                        // Fix name and attach hooks
                        name = jQuery.propFix[name] || name;
                        hooks = jQuery.propHooks[name];
                    }

                    if (value !== undefined) {
                        if (hooks && "set" in hooks &&
                            (ret = hooks.set(elem, value, name)) !== undefined) {
                            return ret;
                        }

                        return (elem[name] = value);
                    }

                    if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
                        return ret;
                    }

                    return elem[name];
                },

                propHooks: {
                    tabIndex: {
                        get: function (elem) {

                            // Support: IE <=9 - 11 only
                            // elem.tabIndex doesn't always return the
                            // correct value when it hasn't been explicitly set
                            // https://web.archive.org/web/20141116233347/http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                            // Use proper attribute retrieval(#12072)
                            var tabindex = jQuery.find.attr(elem, "tabindex");

                            if (tabindex) {
                                return parseInt(tabindex, 10);
                            }

                            if (
                                rfocusable.test(elem.nodeName) ||
                                rclickable.test(elem.nodeName) &&
                                elem.href
                            ) {
                                return 0;
                            }

                            return -1;
                        }
                    }
                },

                propFix: {
                    "for": "htmlFor",
                    "class": "className"
                }
            });

            // Support: IE <=11 only
            // Accessing the selectedIndex property
            // forces the browser to respect setting selected
            // on the option
            // The getter ensures a default option is selected
            // when in an optgroup
            // eslint rule "no-unused-expressions" is disabled for this code
            // since it considers such accessions noop
            if (!support.optSelected) {
                jQuery.propHooks.selected = {
                    get: function (elem) {

                        /* eslint no-unused-expressions: "off" */

                        var parent = elem.parentNode;
                        if (parent && parent.parentNode) {
                            parent.parentNode.selectedIndex;
                        }
                        return null;
                    },
                    set: function (elem) {

                        /* eslint no-unused-expressions: "off" */

                        var parent = elem.parentNode;
                        if (parent) {
                            parent.selectedIndex;

                            if (parent.parentNode) {
                                parent.parentNode.selectedIndex;
                            }
                        }
                    }
                };
            }

            jQuery.each([
                "tabIndex",
                "readOnly",
                "maxLength",
                "cellSpacing",
                "cellPadding",
                "rowSpan",
                "colSpan",
                "useMap",
                "frameBorder",
                "contentEditable"
            ], function () {
                jQuery.propFix[this.toLowerCase()] = this;
            });




            // Strip and collapse whitespace according to HTML spec
            // https://html.spec.whatwg.org/multipage/infrastructure.html#strip-and-collapse-whitespace
            function stripAndCollapse(value) {
                var tokens = value.match(rnothtmlwhite) || [];
                return tokens.join(" ");
            }


            function getClass(elem) {
                return elem.getAttribute && elem.getAttribute("class") || "";
            }

            jQuery.fn.extend({
                addClass: function (value) {
                    var classes, elem, cur, curValue, clazz, j, finalValue,
                        i = 0;

                    if (jQuery.isFunction(value)) {
                        return this.each(function (j) {
                            jQuery(this).addClass(value.call(this, j, getClass(this)));
                        });
                    }

                    if (typeof value === "string" && value) {
                        classes = value.match(rnothtmlwhite) || [];

                        while ((elem = this[i++])) {
                            curValue = getClass(elem);
                            cur = elem.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");

                            if (cur) {
                                j = 0;
                                while ((clazz = classes[j++])) {
                                    if (cur.indexOf(" " + clazz + " ") < 0) {
                                        cur += clazz + " ";
                                    }
                                }

                                // Only assign if different to avoid unneeded rendering.
                                finalValue = stripAndCollapse(cur);
                                if (curValue !== finalValue) {
                                    elem.setAttribute("class", finalValue);
                                }
                            }
                        }
                    }

                    return this;
                },

                removeClass: function (value) {
                    var classes, elem, cur, curValue, clazz, j, finalValue,
                        i = 0;

                    if (jQuery.isFunction(value)) {
                        return this.each(function (j) {
                            jQuery(this).removeClass(value.call(this, j, getClass(this)));
                        });
                    }

                    if (!arguments.length) {
                        return this.attr("class", "");
                    }

                    if (typeof value === "string" && value) {
                        classes = value.match(rnothtmlwhite) || [];

                        while ((elem = this[i++])) {
                            curValue = getClass(elem);

                            // This expression is here for better compressibility (see addClass)
                            cur = elem.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");

                            if (cur) {
                                j = 0;
                                while ((clazz = classes[j++])) {

                                    // Remove *all* instances
                                    while (cur.indexOf(" " + clazz + " ") > -1) {
                                        cur = cur.replace(" " + clazz + " ", " ");
                                    }
                                }

                                // Only assign if different to avoid unneeded rendering.
                                finalValue = stripAndCollapse(cur);
                                if (curValue !== finalValue) {
                                    elem.setAttribute("class", finalValue);
                                }
                            }
                        }
                    }

                    return this;
                },

                toggleClass: function (value, stateVal) {
                    var type = typeof value;

                    if (typeof stateVal === "boolean" && type === "string") {
                        return stateVal ? this.addClass(value) : this.removeClass(value);
                    }

                    if (jQuery.isFunction(value)) {
                        return this.each(function (i) {
                            jQuery(this).toggleClass(
                                value.call(this, i, getClass(this), stateVal),
                                stateVal
                            );
                        });
                    }

                    return this.each(function () {
                        var className, i, self, classNames;

                        if (type === "string") {

                            // Toggle individual class names
                            i = 0;
                            self = jQuery(this);
                            classNames = value.match(rnothtmlwhite) || [];

                            while ((className = classNames[i++])) {

                                // Check each className given, space separated list
                                if (self.hasClass(className)) {
                                    self.removeClass(className);
                                } else {
                                    self.addClass(className);
                                }
                            }

                            // Toggle whole class name
                        } else if (value === undefined || type === "boolean") {
                            className = getClass(this);
                            if (className) {

                                // Store className if set
                                dataPriv.set(this, "__className__", className);
                            }

                            // If the element has a class name or if we're passed `false`,
                            // then remove the whole classname (if there was one, the above saved it).
                            // Otherwise bring back whatever was previously saved (if anything),
                            // falling back to the empty string if nothing was stored.
                            if (this.setAttribute) {
                                this.setAttribute("class",
                                    className || value === false ?
                                        "" :
                                        dataPriv.get(this, "__className__") || ""
                                );
                            }
                        }
                    });
                },

                hasClass: function (selector) {
                    var className, elem,
                        i = 0;

                    className = " " + selector + " ";
                    while ((elem = this[i++])) {
                        if (elem.nodeType === 1 &&
                            (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
                            return true;
                        }
                    }

                    return false;
                }
            });




            var rreturn = /\r/g;

            jQuery.fn.extend({
                val: function (value) {
                    var hooks, ret, isFunction,
                        elem = this[0];

                    if (!arguments.length) {
                        if (elem) {
                            hooks = jQuery.valHooks[elem.type] ||
                                jQuery.valHooks[elem.nodeName.toLowerCase()];

                            if (hooks &&
                                "get" in hooks &&
                                (ret = hooks.get(elem, "value")) !== undefined
                            ) {
                                return ret;
                            }

                            ret = elem.value;

                            // Handle most common string cases
                            if (typeof ret === "string") {
                                return ret.replace(rreturn, "");
                            }

                            // Handle cases where value is null/undef or number
                            return ret == null ? "" : ret;
                        }

                        return;
                    }

                    isFunction = jQuery.isFunction(value);

                    return this.each(function (i) {
                        var val;

                        if (this.nodeType !== 1) {
                            return;
                        }

                        if (isFunction) {
                            val = value.call(this, i, jQuery(this).val());
                        } else {
                            val = value;
                        }

                        // Treat null/undefined as ""; convert numbers to string
                        if (val == null) {
                            val = "";

                        } else if (typeof val === "number") {
                            val += "";

                        } else if (Array.isArray(val)) {
                            val = jQuery.map(val, function (value) {
                                return value == null ? "" : value + "";
                            });
                        }

                        hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()];

                        // If set returns undefined, fall back to normal setting
                        if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === undefined) {
                            this.value = val;
                        }
                    });
                }
            });

            jQuery.extend({
                valHooks: {
                    option: {
                        get: function (elem) {

                            var val = jQuery.find.attr(elem, "value");
                            return val != null ?
                                val :

                                // Support: IE <=10 - 11 only
                                // option.text throws exceptions (#14686, #14858)
                                // Strip and collapse whitespace
                                // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
                                stripAndCollapse(jQuery.text(elem));
                        }
                    },
                    select: {
                        get: function (elem) {
                            var value, option, i,
                                options = elem.options,
                                index = elem.selectedIndex,
                                one = elem.type === "select-one",
                                values = one ? null : [],
                                max = one ? index + 1 : options.length;

                            if (index < 0) {
                                i = max;

                            } else {
                                i = one ? index : 0;
                            }

                            // Loop through all the selected options
                            for (; i < max; i++) {
                                option = options[i];

                                // Support: IE <=9 only
                                // IE8-9 doesn't update selected after form reset (#2551)
                                if ((option.selected || i === index) &&

                                    // Don't return options that are disabled or in a disabled optgroup
                                    !option.disabled &&
                                    (!option.parentNode.disabled ||
                                        !nodeName(option.parentNode, "optgroup"))) {

                                    // Get the specific value for the option
                                    value = jQuery(option).val();

                                    // We don't need an array for one selects
                                    if (one) {
                                        return value;
                                    }

                                    // Multi-Selects return an array
                                    values.push(value);
                                }
                            }

                            return values;
                        },

                        set: function (elem, value) {
                            var optionSet, option,
                                options = elem.options,
                                values = jQuery.makeArray(value),
                                i = options.length;

                            while (i--) {
                                option = options[i];

                                /* eslint-disable no-cond-assign */

                                if (option.selected =
                                    jQuery.inArray(jQuery.valHooks.option.get(option), values) > -1
                                ) {
                                    optionSet = true;
                                }

                                /* eslint-enable no-cond-assign */
                            }

                            // Force browsers to behave consistently when non-matching value is set
                            if (!optionSet) {
                                elem.selectedIndex = -1;
                            }
                            return values;
                        }
                    }
                }
            });

            // Radios and checkboxes getter/setter
            jQuery.each(["radio", "checkbox"], function () {
                jQuery.valHooks[this] = {
                    set: function (elem, value) {
                        if (Array.isArray(value)) {
                            return (elem.checked = jQuery.inArray(jQuery(elem).val(), value) > -1);
                        }
                    }
                };
                if (!support.checkOn) {
                    jQuery.valHooks[this].get = function (elem) {
                        return elem.getAttribute("value") === null ? "on" : elem.value;
                    };
                }
            });




            // Return jQuery for attributes-only inclusion


            var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/;

            jQuery.extend(jQuery.event, {

                trigger: function (event, data, elem, onlyHandlers) {

                    var i, cur, tmp, bubbleType, ontype, handle, special,
                        eventPath = [elem || document],
                        type = hasOwn.call(event, "type") ? event.type : event,
                        namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];

                    cur = tmp = elem = elem || document;

                    // Don't do events on text and comment nodes
                    if (elem.nodeType === 3 || elem.nodeType === 8) {
                        return;
                    }

                    // focus/blur morphs to focusin/out; ensure we're not firing them right now
                    if (rfocusMorph.test(type + jQuery.event.triggered)) {
                        return;
                    }

                    if (type.indexOf(".") > -1) {

                        // Namespaced trigger; create a regexp to match event type in handle()
                        namespaces = type.split(".");
                        type = namespaces.shift();
                        namespaces.sort();
                    }
                    ontype = type.indexOf(":") < 0 && "on" + type;

                    // Caller can pass in a jQuery.Event object, Object, or just an event type string
                    event = event[jQuery.expando] ?
                        event :
                        new jQuery.Event(type, typeof event === "object" && event);

                    // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
                    event.isTrigger = onlyHandlers ? 2 : 3;
                    event.namespace = namespaces.join(".");
                    event.rnamespace = event.namespace ?
                        new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") :
                        null;

                    // Clean up the event in case it is being reused
                    event.result = undefined;
                    if (!event.target) {
                        event.target = elem;
                    }

                    // Clone any incoming data and prepend the event, creating the handler arg list
                    data = data == null ?
                        [event] :
                        jQuery.makeArray(data, [event]);

                    // Allow special events to draw outside the lines
                    special = jQuery.event.special[type] || {};
                    if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
                        return;
                    }

                    // Determine event propagation path in advance, per W3C events spec (#9951)
                    // Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
                    if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {

                        bubbleType = special.delegateType || type;
                        if (!rfocusMorph.test(bubbleType + type)) {
                            cur = cur.parentNode;
                        }
                        for (; cur; cur = cur.parentNode) {
                            eventPath.push(cur);
                            tmp = cur;
                        }

                        // Only add window if we got to document (e.g., not plain obj or detached DOM)
                        if (tmp === (elem.ownerDocument || document)) {
                            eventPath.push(tmp.defaultView || tmp.parentWindow || window);
                        }
                    }

                    // Fire handlers on the event path
                    i = 0;
                    while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {

                        event.type = i > 1 ?
                            bubbleType :
                            special.bindType || type;

                        // jQuery handler
                        handle = (dataPriv.get(cur, "events") || {})[event.type] &&
                            dataPriv.get(cur, "handle");
                        if (handle) {
                            handle.apply(cur, data);
                        }

                        // Native handler
                        handle = ontype && cur[ontype];
                        if (handle && handle.apply && acceptData(cur)) {
                            event.result = handle.apply(cur, data);
                            if (event.result === false) {
                                event.preventDefault();
                            }
                        }
                    }
                    event.type = type;

                    // If nobody prevented the default action, do it now
                    if (!onlyHandlers && !event.isDefaultPrevented()) {

                        if ((!special._default ||
                            special._default.apply(eventPath.pop(), data) === false) &&
                            acceptData(elem)) {

                            // Call a native DOM method on the target with the same name as the event.
                            // Don't do default actions on window, that's where global variables be (#6170)
                            if (ontype && jQuery.isFunction(elem[type]) && !jQuery.isWindow(elem)) {

                                // Don't re-trigger an onFOO event when we call its FOO() method
                                tmp = elem[ontype];

                                if (tmp) {
                                    elem[ontype] = null;
                                }

                                // Prevent re-triggering of the same event, since we already bubbled it above
                                jQuery.event.triggered = type;
                                elem[type]();
                                jQuery.event.triggered = undefined;

                                if (tmp) {
                                    elem[ontype] = tmp;
                                }
                            }
                        }
                    }

                    return event.result;
                },

                // Piggyback on a donor event to simulate a different one
                // Used only for `focus(in | out)` events
                simulate: function (type, elem, event) {
                    var e = jQuery.extend(
                        new jQuery.Event(),
                        event,
                        {
                            type: type,
                            isSimulated: true
                        }
                    );

                    jQuery.event.trigger(e, null, elem);
                }

            });

            jQuery.fn.extend({

                trigger: function (type, data) {
                    return this.each(function () {
                        jQuery.event.trigger(type, data, this);
                    });
                },
                triggerHandler: function (type, data) {
                    var elem = this[0];
                    if (elem) {
                        return jQuery.event.trigger(type, data, elem, true);
                    }
                }
            });


            jQuery.each(("blur focus focusin focusout resize scroll click dblclick " +
                "mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
                "change select submit keydown keypress keyup contextmenu").split(" "),
                function (i, name) {

                    // Handle event binding
                    jQuery.fn[name] = function (data, fn) {
                        return arguments.length > 0 ?
                            this.on(name, null, data, fn) :
                            this.trigger(name);
                    };
                });

            jQuery.fn.extend({
                hover: function (fnOver, fnOut) {
                    return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
                }
            });




            support.focusin = "onfocusin" in window;


            if (!support.focusin) {
                jQuery.each({ focus: "focusin", blur: "focusout" }, function (orig, fix) {


                    var handler = function (event) {
                        jQuery.event.simulate(fix, event.target, jQuery.event.fix(event));
                    };

                    jQuery.event.special[fix] = {
                        setup: function () {
                            var doc = this.ownerDocument || this,
                                attaches = dataPriv.access(doc, fix);

                            if (!attaches) {
                                doc.addEventListener(orig, handler, true);
                            }
                            dataPriv.access(doc, fix, (attaches || 0) + 1);
                        },
                        teardown: function () {
                            var doc = this.ownerDocument || this,
                                attaches = dataPriv.access(doc, fix) - 1;

                            if (!attaches) {
                                doc.removeEventListener(orig, handler, true);
                                dataPriv.remove(doc, fix);

                            } else {
                                dataPriv.access(doc, fix, attaches);
                            }
                        }
                    };
                });
            }
            var location = window.location;

            var nonce = jQuery.now();

            var rquery = (/\?/);



            // Cross-browser xml parsing
            jQuery.parseXML = function (data) {
                var xml;
                if (!data || typeof data !== "string") {
                    return null;
                }

                // Support: IE 9 - 11 only
                // IE throws on parseFromString with invalid input.
                try {
                    xml = (new window.DOMParser()).parseFromString(data, "text/xml");
                } catch (e) {
                    xml = undefined;
                }

                if (!xml || xml.getElementsByTagName("parsererror").length) {
                    jQuery.error("Invalid XML: " + data);
                }
                return xml;
            };


            var
                rbracket = /\[\]$/,
                rCRLF = /\r?\n/g,
                rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
                rsubmittable = /^(?:input|select|textarea|keygen)/i;

            function buildParams(prefix, obj, traditional, add) {
                var name;

                if (Array.isArray(obj)) {

                    // Serialize array item.
                    jQuery.each(obj, function (i, v) {
                        if (traditional || rbracket.test(prefix)) {

                            // Treat each array item as a scalar.
                            add(prefix, v);

                        } else {

                            // Item is non-scalar (array or object), encode its numeric index.
                            buildParams(
                                prefix + "[" + (typeof v === "object" && v != null ? i : "") + "]",
                                v,
                                traditional,
                                add
                            );
                        }
                    });

                } else if (!traditional && jQuery.type(obj) === "object") {

                    // Serialize object item.
                    for (name in obj) {
                        buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
                    }

                } else {

                    // Serialize scalar item.
                    add(prefix, obj);
                }
            }

            // Serialize an array of form elements or a set of
            // key/values into a query string
            jQuery.param = function (a, traditional) {
                var prefix,
                    s = [],
                    add = function (key, valueOrFunction) {

                        // If value is a function, invoke it and use its return value
                        var value = jQuery.isFunction(valueOrFunction) ?
                            valueOrFunction() :
                            valueOrFunction;

                        s[s.length] = encodeURIComponent(key) + "=" +
                            encodeURIComponent(value == null ? "" : value);
                    };

                // If an array was passed in, assume that it is an array of form elements.
                if (Array.isArray(a) || (a.jquery && !jQuery.isPlainObject(a))) {

                    // Serialize the form elements
                    jQuery.each(a, function () {
                        add(this.name, this.value);
                    });

                } else {

                    // If traditional, encode the "old" way (the way 1.3.2 or older
                    // did it), otherwise encode params recursively.
                    for (prefix in a) {
                        buildParams(prefix, a[prefix], traditional, add);
                    }
                }

                // Return the resulting serialization
                return s.join("&");
            };

            jQuery.fn.extend({
                serialize: function () {
                    return jQuery.param(this.serializeArray());
                },
                serializeArray: function () {
                    return this.map(function () {

                        // Can add propHook for "elements" to filter or add form elements
                        var elements = jQuery.prop(this, "elements");
                        return elements ? jQuery.makeArray(elements) : this;
                    })
                        .filter(function () {
                            var type = this.type;

                            // Use .is( ":disabled" ) so that fieldset[disabled] works
                            return this.name && !jQuery(this).is(":disabled") &&
                                rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
                                (this.checked || !rcheckableType.test(type));
                        })
                        .map(function (i, elem) {
                            var val = jQuery(this).val();

                            if (val == null) {
                                return null;
                            }

                            if (Array.isArray(val)) {
                                return jQuery.map(val, function (val) {
                                    return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                                });
                            }

                            return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
                        }).get();
                }
            });


            var
                r20 = /%20/g,
                rhash = /#.*$/,
                rantiCache = /([?&])_=[^&]*/,
                rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,

                // #7653, #8125, #8152: local protocol detection
                rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
                rnoContent = /^(?:GET|HEAD)$/,
                rprotocol = /^\/\//,

                /* Prefilters
                 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
                 * 2) These are called:
                 *    - BEFORE asking for a transport
                 *    - AFTER param serialization (s.data is a string if s.processData is true)
                 * 3) key is the dataType
                 * 4) the catchall symbol "*" can be used
                 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
                 */
                prefilters = {},

                /* Transports bindings
                 * 1) key is the dataType
                 * 2) the catchall symbol "*" can be used
                 * 3) selection will start with transport dataType and THEN go to "*" if needed
                 */
                transports = {},

                // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
                allTypes = "*/".concat("*"),

                // Anchor tag for parsing the document origin
                originAnchor = document.createElement("a");
            originAnchor.href = location.href;

            // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
            function addToPrefiltersOrTransports(structure) {

                // dataTypeExpression is optional and defaults to "*"
                return function (dataTypeExpression, func) {

                    if (typeof dataTypeExpression !== "string") {
                        func = dataTypeExpression;
                        dataTypeExpression = "*";
                    }

                    var dataType,
                        i = 0,
                        dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];

                    if (jQuery.isFunction(func)) {

                        // For each dataType in the dataTypeExpression
                        while ((dataType = dataTypes[i++])) {

                            // Prepend if requested
                            if (dataType[0] === "+") {
                                dataType = dataType.slice(1) || "*";
                                (structure[dataType] = structure[dataType] || []).unshift(func);

                                // Otherwise append
                            } else {
                                (structure[dataType] = structure[dataType] || []).push(func);
                            }
                        }
                    }
                };
            }

            // Base inspection function for prefilters and transports
            function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {

                var inspected = {},
                    seekingTransport = (structure === transports);

                function inspect(dataType) {
                    var selected;
                    inspected[dataType] = true;
                    jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
                        var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                        if (typeof dataTypeOrTransport === "string" &&
                            !seekingTransport && !inspected[dataTypeOrTransport]) {

                            options.dataTypes.unshift(dataTypeOrTransport);
                            inspect(dataTypeOrTransport);
                            return false;
                        } else if (seekingTransport) {
                            return !(selected = dataTypeOrTransport);
                        }
                    });
                    return selected;
                }

                return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
            }

            // A special extend for ajax options
            // that takes "flat" options (not to be deep extended)
            // Fixes #9887
            function ajaxExtend(target, src) {
                var key, deep,
                    flatOptions = jQuery.ajaxSettings.flatOptions || {};

                for (key in src) {
                    if (src[key] !== undefined) {
                        (flatOptions[key] ? target : (deep || (deep = {})))[key] = src[key];
                    }
                }
                if (deep) {
                    jQuery.extend(true, target, deep);
                }

                return target;
            }

            /* Handles responses to an ajax request:
             * - finds the right dataType (mediates between content-type and expected dataType)
             * - returns the corresponding response
             */
            function ajaxHandleResponses(s, jqXHR, responses) {

                var ct, type, finalDataType, firstDataType,
                    contents = s.contents,
                    dataTypes = s.dataTypes;

                // Remove auto dataType and get content-type in the process
                while (dataTypes[0] === "*") {
                    dataTypes.shift();
                    if (ct === undefined) {
                        ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
                    }
                }

                // Check if we're dealing with a known content-type
                if (ct) {
                    for (type in contents) {
                        if (contents[type] && contents[type].test(ct)) {
                            dataTypes.unshift(type);
                            break;
                        }
                    }
                }

                // Check to see if we have a response for the expected dataType
                if (dataTypes[0] in responses) {
                    finalDataType = dataTypes[0];
                } else {

                    // Try convertible dataTypes
                    for (type in responses) {
                        if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                            finalDataType = type;
                            break;
                        }
                        if (!firstDataType) {
                            firstDataType = type;
                        }
                    }

                    // Or just use first one
                    finalDataType = finalDataType || firstDataType;
                }

                // If we found a dataType
                // We add the dataType to the list if needed
                // and return the corresponding response
                if (finalDataType) {
                    if (finalDataType !== dataTypes[0]) {
                        dataTypes.unshift(finalDataType);
                    }
                    return responses[finalDataType];
                }
            }

            /* Chain conversions given the request and the original response
             * Also sets the responseXXX fields on the jqXHR instance
             */
            function ajaxConvert(s, response, jqXHR, isSuccess) {
                var conv2, current, conv, tmp, prev,
                    converters = {},

                    // Work with a copy of dataTypes in case we need to modify it for conversion
                    dataTypes = s.dataTypes.slice();

                // Create converters map with lowercased keys
                if (dataTypes[1]) {
                    for (conv in s.converters) {
                        converters[conv.toLowerCase()] = s.converters[conv];
                    }
                }

                current = dataTypes.shift();

                // Convert to each sequential dataType
                while (current) {

                    if (s.responseFields[current]) {
                        jqXHR[s.responseFields[current]] = response;
                    }

                    // Apply the dataFilter if provided
                    if (!prev && isSuccess && s.dataFilter) {
                        response = s.dataFilter(response, s.dataType);
                    }

                    prev = current;
                    current = dataTypes.shift();

                    if (current) {

                        // There's only work to do if current dataType is non-auto
                        if (current === "*") {

                            current = prev;

                            // Convert response if prev dataType is non-auto and differs from current
                        } else if (prev !== "*" && prev !== current) {

                            // Seek a direct converter
                            conv = converters[prev + " " + current] || converters["* " + current];

                            // If none found, seek a pair
                            if (!conv) {
                                for (conv2 in converters) {

                                    // If conv2 outputs current
                                    tmp = conv2.split(" ");
                                    if (tmp[1] === current) {

                                        // If prev can be converted to accepted input
                                        conv = converters[prev + " " + tmp[0]] ||
                                            converters["* " + tmp[0]];
                                        if (conv) {

                                            // Condense equivalence converters
                                            if (conv === true) {
                                                conv = converters[conv2];

                                                // Otherwise, insert the intermediate dataType
                                            } else if (converters[conv2] !== true) {
                                                current = tmp[0];
                                                dataTypes.unshift(tmp[1]);
                                            }
                                            break;
                                        }
                                    }
                                }
                            }

                            // Apply converter (if not an equivalence)
                            if (conv !== true) {

                                // Unless errors are allowed to bubble, catch and return them
                                if (conv && s.throws) {
                                    response = conv(response);
                                } else {
                                    try {
                                        response = conv(response);
                                    } catch (e) {
                                        return {
                                            state: "parsererror",
                                            error: conv ? e : "No conversion from " + prev + " to " + current
                                        };
                                    }
                                }
                            }
                        }
                    }
                }

                return { state: "success", data: response };
            }

            jQuery.extend({

                // Counter for holding the number of active queries
                active: 0,

                // Last-Modified header cache for next request
                lastModified: {},
                etag: {},

                ajaxSettings: {
                    url: location.href,
                    type: "GET",
                    isLocal: rlocalProtocol.test(location.protocol),
                    global: true,
                    processData: true,
                    async: true,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",

                    /*
                    timeout: 0,
                    data: null,
                    dataType: null,
                    username: null,
                    password: null,
                    cache: null,
                    throws: false,
                    traditional: false,
                    headers: {},
                    */

                    accepts: {
                        "*": allTypes,
                        text: "text/plain",
                        html: "text/html",
                        xml: "application/xml, text/xml",
                        json: "application/json, text/javascript"
                    },

                    contents: {
                        xml: /\bxml\b/,
                        html: /\bhtml/,
                        json: /\bjson\b/
                    },

                    responseFields: {
                        xml: "responseXML",
                        text: "responseText",
                        json: "responseJSON"
                    },

                    // Data converters
                    // Keys separate source (or catchall "*") and destination types with a single space
                    converters: {

                        // Convert anything to text
                        "* text": String,

                        // Text to html (true = no transformation)
                        "text html": true,

                        // Evaluate text as a json expression
                        "text json": JSON.parse,

                        // Parse text as xml
                        "text xml": jQuery.parseXML
                    },

                    // For options that shouldn't be deep extended:
                    // you can add your own custom options here if
                    // and when you create one that shouldn't be
                    // deep extended (see ajaxExtend)
                    flatOptions: {
                        url: true,
                        context: true
                    }
                },

                // Creates a full fledged settings object into target
                // with both ajaxSettings and settings fields.
                // If target is omitted, writes into ajaxSettings.
                ajaxSetup: function (target, settings) {
                    return settings ?

                        // Building a settings object
                        ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) :

                        // Extending ajaxSettings
                        ajaxExtend(jQuery.ajaxSettings, target);
                },

                ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
                ajaxTransport: addToPrefiltersOrTransports(transports),

                // Main method
                ajax: function (url, options) {

                    // If url is an object, simulate pre-1.5 signature
                    if (typeof url === "object") {
                        options = url;
                        url = undefined;
                    }

                    // Force options to be an object
                    options = options || {};

                    var transport,

                        // URL without anti-cache param
                        cacheURL,

                        // Response headers
                        responseHeadersString,
                        responseHeaders,

                        // timeout handle
                        timeoutTimer,

                        // Url cleanup var
                        urlAnchor,

                        // Request state (becomes false upon send and true upon completion)
                        completed,

                        // To know if global events are to be dispatched
                        fireGlobals,

                        // Loop variable
                        i,

                        // uncached part of the url
                        uncached,

                        // Create the final options object
                        s = jQuery.ajaxSetup({}, options),

                        // Callbacks context
                        callbackContext = s.context || s,

                        // Context for global events is callbackContext if it is a DOM node or jQuery collection
                        globalEventContext = s.context &&
                            (callbackContext.nodeType || callbackContext.jquery) ?
                            jQuery(callbackContext) :
                            jQuery.event,

                        // Deferreds
                        deferred = jQuery.Deferred(),
                        completeDeferred = jQuery.Callbacks("once memory"),

                        // Status-dependent callbacks
                        statusCode = s.statusCode || {},

                        // Headers (they are sent all at once)
                        requestHeaders = {},
                        requestHeadersNames = {},

                        // Default abort message
                        strAbort = "canceled",

                        // Fake xhr
                        jqXHR = {
                            readyState: 0,

                            // Builds headers hashtable if needed
                            getResponseHeader: function (key) {
                                var match;
                                if (completed) {
                                    if (!responseHeaders) {
                                        responseHeaders = {};
                                        while ((match = rheaders.exec(responseHeadersString))) {
                                            responseHeaders[match[1].toLowerCase()] = match[2];
                                        }
                                    }
                                    match = responseHeaders[key.toLowerCase()];
                                }
                                return match == null ? null : match;
                            },

                            // Raw string
                            getAllResponseHeaders: function () {
                                return completed ? responseHeadersString : null;
                            },

                            // Caches the header
                            setRequestHeader: function (name, value) {
                                if (completed == null) {
                                    name = requestHeadersNames[name.toLowerCase()] =
                                        requestHeadersNames[name.toLowerCase()] || name;
                                    requestHeaders[name] = value;
                                }
                                return this;
                            },

                            // Overrides response content-type header
                            overrideMimeType: function (type) {
                                if (completed == null) {
                                    s.mimeType = type;
                                }
                                return this;
                            },

                            // Status-dependent callbacks
                            statusCode: function (map) {
                                var code;
                                if (map) {
                                    if (completed) {

                                        // Execute the appropriate callbacks
                                        jqXHR.always(map[jqXHR.status]);
                                    } else {

                                        // Lazy-add the new callbacks in a way that preserves old ones
                                        for (code in map) {
                                            statusCode[code] = [statusCode[code], map[code]];
                                        }
                                    }
                                }
                                return this;
                            },

                            // Cancel the request
                            abort: function (statusText) {
                                var finalText = statusText || strAbort;
                                if (transport) {
                                    transport.abort(finalText);
                                }
                                done(0, finalText);
                                return this;
                            }
                        };

                    // Attach deferreds
                    deferred.promise(jqXHR);

                    // Add protocol if not provided (prefilters might expect it)
                    // Handle falsy url in the settings object (#10093: consistency with old signature)
                    // We also use the url parameter if available
                    s.url = ((url || s.url || location.href) + "")
                        .replace(rprotocol, location.protocol + "//");

                    // Alias method option to type as per ticket #12004
                    s.type = options.method || options.type || s.method || s.type;

                    // Extract dataTypes list
                    s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];

                    // A cross-domain request is in order when the origin doesn't match the current origin.
                    if (s.crossDomain == null) {
                        urlAnchor = document.createElement("a");

                        // Support: IE <=8 - 11, Edge 12 - 13
                        // IE throws exception on accessing the href property if url is malformed,
                        // e.g. http://example.com:80x/
                        try {
                            urlAnchor.href = s.url;

                            // Support: IE <=8 - 11 only
                            // Anchor's host property isn't correctly set when s.url is relative
                            urlAnchor.href = urlAnchor.href;
                            s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !==
                                urlAnchor.protocol + "//" + urlAnchor.host;
                        } catch (e) {

                            // If there is an error parsing the URL, assume it is crossDomain,
                            // it can be rejected by the transport if it is invalid
                            s.crossDomain = true;
                        }
                    }

                    // Convert data if not already a string
                    if (s.data && s.processData && typeof s.data !== "string") {
                        s.data = jQuery.param(s.data, s.traditional);
                    }

                    // Apply prefilters
                    inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);

                    // If request was aborted inside a prefilter, stop there
                    if (completed) {
                        return jqXHR;
                    }

                    // We can fire global events as of now if asked to
                    // Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
                    fireGlobals = jQuery.event && s.global;

                    // Watch for a new set of requests
                    if (fireGlobals && jQuery.active++ === 0) {
                        jQuery.event.trigger("ajaxStart");
                    }

                    // Uppercase the type
                    s.type = s.type.toUpperCase();

                    // Determine if request has content
                    s.hasContent = !rnoContent.test(s.type);

                    // Save the URL in case we're toying with the If-Modified-Since
                    // and/or If-None-Match header later on
                    // Remove hash to simplify url manipulation
                    cacheURL = s.url.replace(rhash, "");

                    // More options handling for requests with no content
                    if (!s.hasContent) {

                        // Remember the hash so we can put it back
                        uncached = s.url.slice(cacheURL.length);

                        // If data is available, append data to url
                        if (s.data) {
                            cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;

                            // #9682: remove data so that it's not used in an eventual retry
                            delete s.data;
                        }

                        // Add or update anti-cache param if needed
                        if (s.cache === false) {
                            cacheURL = cacheURL.replace(rantiCache, "$1");
                            uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + (nonce++) + uncached;
                        }

                        // Put hash and anti-cache on the URL that will be requested (gh-1732)
                        s.url = cacheURL + uncached;

                        // Change '%20' to '+' if this is encoded form body content (gh-2658)
                    } else if (s.data && s.processData &&
                        (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
                        s.data = s.data.replace(r20, "+");
                    }

                    // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                    if (s.ifModified) {
                        if (jQuery.lastModified[cacheURL]) {
                            jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]);
                        }
                        if (jQuery.etag[cacheURL]) {
                            jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL]);
                        }
                    }

                    // Set the correct header, if data is being sent
                    if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
                        jqXHR.setRequestHeader("Content-Type", s.contentType);
                    }

                    // Set the Accepts header for the server, depending on the dataType
                    jqXHR.setRequestHeader(
                        "Accept",
                        s.dataTypes[0] && s.accepts[s.dataTypes[0]] ?
                            s.accepts[s.dataTypes[0]] +
                            (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") :
                            s.accepts["*"]
                    );

                    // Check for headers option
                    for (i in s.headers) {
                        jqXHR.setRequestHeader(i, s.headers[i]);
                    }

                    // Allow custom headers/mimetypes and early abort
                    if (s.beforeSend &&
                        (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed)) {

                        // Abort if not done already and return
                        return jqXHR.abort();
                    }

                    // Aborting is no longer a cancellation
                    strAbort = "abort";

                    // Install callbacks on deferreds
                    completeDeferred.add(s.complete);
                    jqXHR.done(s.success);
                    jqXHR.fail(s.error);

                    // Get transport
                    transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);

                    // If no transport, we auto-abort
                    if (!transport) {
                        done(-1, "No Transport");
                    } else {
                        jqXHR.readyState = 1;

                        // Send global event
                        if (fireGlobals) {
                            globalEventContext.trigger("ajaxSend", [jqXHR, s]);
                        }

                        // If request was aborted inside ajaxSend, stop there
                        if (completed) {
                            return jqXHR;
                        }

                        // Timeout
                        if (s.async && s.timeout > 0) {
                            timeoutTimer = window.setTimeout(function () {
                                jqXHR.abort("timeout");
                            }, s.timeout);
                        }

                        try {
                            completed = false;
                            transport.send(requestHeaders, done);
                        } catch (e) {

                            // Rethrow post-completion exceptions
                            if (completed) {
                                throw e;
                            }

                            // Propagate others as results
                            done(-1, e);
                        }
                    }

                    // Callback for when everything is done
                    function done(status, nativeStatusText, responses, headers) {
                        var isSuccess, success, error, response, modified,
                            statusText = nativeStatusText;

                        // Ignore repeat invocations
                        if (completed) {
                            return;
                        }

                        completed = true;

                        // Clear timeout if it exists
                        if (timeoutTimer) {
                            window.clearTimeout(timeoutTimer);
                        }

                        // Dereference transport for early garbage collection
                        // (no matter how long the jqXHR object will be used)
                        transport = undefined;

                        // Cache response headers
                        responseHeadersString = headers || "";

                        // Set readyState
                        jqXHR.readyState = status > 0 ? 4 : 0;

                        // Determine if successful
                        isSuccess = status >= 200 && status < 300 || status === 304;

                        // Get response data
                        if (responses) {
                            response = ajaxHandleResponses(s, jqXHR, responses);
                        }

                        // Convert no matter what (that way responseXXX fields are always set)
                        response = ajaxConvert(s, response, jqXHR, isSuccess);

                        // If successful, handle type chaining
                        if (isSuccess) {

                            // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                            if (s.ifModified) {
                                modified = jqXHR.getResponseHeader("Last-Modified");
                                if (modified) {
                                    jQuery.lastModified[cacheURL] = modified;
                                }
                                modified = jqXHR.getResponseHeader("etag");
                                if (modified) {
                                    jQuery.etag[cacheURL] = modified;
                                }
                            }

                            // if no content
                            if (status === 204 || s.type === "HEAD") {
                                statusText = "nocontent";

                                // if not modified
                            } else if (status === 304) {
                                statusText = "notmodified";

                                // If we have data, let's convert it
                            } else {
                                statusText = response.state;
                                success = response.data;
                                error = response.error;
                                isSuccess = !error;
                            }
                        } else {

                            // Extract error from statusText and normalize for non-aborts
                            error = statusText;
                            if (status || !statusText) {
                                statusText = "error";
                                if (status < 0) {
                                    status = 0;
                                }
                            }
                        }

                        // Set data for the fake xhr object
                        jqXHR.status = status;
                        jqXHR.statusText = (nativeStatusText || statusText) + "";

                        // Success/Error
                        if (isSuccess) {
                            deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
                        } else {
                            deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
                        }

                        // Status-dependent callbacks
                        jqXHR.statusCode(statusCode);
                        statusCode = undefined;

                        if (fireGlobals) {
                            globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError",
                                [jqXHR, s, isSuccess ? success : error]);
                        }

                        // Complete
                        completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);

                        if (fireGlobals) {
                            globalEventContext.trigger("ajaxComplete", [jqXHR, s]);

                            // Handle the global AJAX counter
                            if (!(--jQuery.active)) {
                                jQuery.event.trigger("ajaxStop");
                            }
                        }
                    }

                    return jqXHR;
                },

                getJSON: function (url, data, callback) {
                    return jQuery.get(url, data, callback, "json");
                },

                getScript: function (url, callback) {
                    return jQuery.get(url, undefined, callback, "script");
                }
            });

            jQuery.each(["get", "post"], function (i, method) {
                jQuery[method] = function (url, data, callback, type) {

                    // Shift arguments if data argument was omitted
                    if (jQuery.isFunction(data)) {
                        type = type || callback;
                        callback = data;
                        data = undefined;
                    }

                    // The url can be an options object (which then must have .url)
                    return jQuery.ajax(jQuery.extend({
                        url: url,
                        type: method,
                        dataType: type,
                        data: data,
                        success: callback
                    }, jQuery.isPlainObject(url) && url));
                };
            });


            jQuery._evalUrl = function (url) {
                return jQuery.ajax({
                    url: url,

                    // Make this explicit, since user can override this through ajaxSetup (#11264)
                    type: "GET",
                    dataType: "script",
                    cache: true,
                    async: false,
                    global: false,
                    "throws": true
                });
            };


            jQuery.fn.extend({
                wrapAll: function (html) {
                    var wrap;

                    if (this[0]) {
                        if (jQuery.isFunction(html)) {
                            html = html.call(this[0]);
                        }

                        // The elements to wrap the target around
                        wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(true);

                        if (this[0].parentNode) {
                            wrap.insertBefore(this[0]);
                        }

                        wrap.map(function () {
                            var elem = this;

                            while (elem.firstElementChild) {
                                elem = elem.firstElementChild;
                            }

                            return elem;
                        }).append(this);
                    }

                    return this;
                },

                wrapInner: function (html) {
                    if (jQuery.isFunction(html)) {
                        return this.each(function (i) {
                            jQuery(this).wrapInner(html.call(this, i));
                        });
                    }

                    return this.each(function () {
                        var self = jQuery(this),
                            contents = self.contents();

                        if (contents.length) {
                            contents.wrapAll(html);

                        } else {
                            self.append(html);
                        }
                    });
                },

                wrap: function (html) {
                    var isFunction = jQuery.isFunction(html);

                    return this.each(function (i) {
                        jQuery(this).wrapAll(isFunction ? html.call(this, i) : html);
                    });
                },

                unwrap: function (selector) {
                    this.parent(selector).not("body").each(function () {
                        jQuery(this).replaceWith(this.childNodes);
                    });
                    return this;
                }
            });


            jQuery.expr.pseudos.hidden = function (elem) {
                return !jQuery.expr.pseudos.visible(elem);
            };
            jQuery.expr.pseudos.visible = function (elem) {
                return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
            };




            jQuery.ajaxSettings.xhr = function () {
                try {
                    return new window.XMLHttpRequest();
                } catch (e) { }
            };

            var xhrSuccessStatus = {

                // File protocol always yields status code 0, assume 200
                0: 200,

                // Support: IE <=9 only
                // #1450: sometimes IE returns 1223 when it should be 204
                1223: 204
            },
                xhrSupported = jQuery.ajaxSettings.xhr();

            support.cors = !!xhrSupported && ("withCredentials" in xhrSupported);
            support.ajax = xhrSupported = !!xhrSupported;

            jQuery.ajaxTransport(function (options) {
                var callback, errorCallback;

                // Cross domain only allowed if supported through XMLHttpRequest
                if (support.cors || xhrSupported && !options.crossDomain) {
                    return {
                        send: function (headers, complete) {
                            var i,
                                xhr = options.xhr();

                            xhr.open(
                                options.type,
                                options.url,
                                options.async,
                                options.username,
                                options.password
                            );

                            // Apply custom fields if provided
                            if (options.xhrFields) {
                                for (i in options.xhrFields) {
                                    xhr[i] = options.xhrFields[i];
                                }
                            }

                            // Override mime type if needed
                            if (options.mimeType && xhr.overrideMimeType) {
                                xhr.overrideMimeType(options.mimeType);
                            }

                            // X-Requested-With header
                            // For cross-domain requests, seeing as conditions for a preflight are
                            // akin to a jigsaw puzzle, we simply never set it to be sure.
                            // (it can always be set on a per-request basis or even using ajaxSetup)
                            // For same-domain requests, won't change header if already provided.
                            if (!options.crossDomain && !headers["X-Requested-With"]) {
                                headers["X-Requested-With"] = "XMLHttpRequest";
                            }

                            // Set headers
                            for (i in headers) {
                                xhr.setRequestHeader(i, headers[i]);
                            }

                            // Callback
                            callback = function (type) {
                                return function () {
                                    if (callback) {
                                        callback = errorCallback = xhr.onload =
                                            xhr.onerror = xhr.onabort = xhr.onreadystatechange = null;

                                        if (type === "abort") {
                                            xhr.abort();
                                        } else if (type === "error") {

                                            // Support: IE <=9 only
                                            // On a manual native abort, IE9 throws
                                            // errors on any property access that is not readyState
                                            if (typeof xhr.status !== "number") {
                                                complete(0, "error");
                                            } else {
                                                complete(

                                                    // File: protocol always yields status 0; see #8605, #14207
                                                    xhr.status,
                                                    xhr.statusText
                                                );
                                            }
                                        } else {
                                            complete(
                                                xhrSuccessStatus[xhr.status] || xhr.status,
                                                xhr.statusText,

                                                // Support: IE <=9 only
                                                // IE9 has no XHR2 but throws on binary (trac-11426)
                                                // For XHR2 non-text, let the caller handle it (gh-2498)
                                                (xhr.responseType || "text") !== "text" ||
                                                    typeof xhr.responseText !== "string" ?
                                                    { binary: xhr.response } :
                                                    { text: xhr.responseText },
                                                xhr.getAllResponseHeaders()
                                            );
                                        }
                                    }
                                };
                            };

                            // Listen to events
                            xhr.onload = callback();
                            errorCallback = xhr.onerror = callback("error");

                            // Support: IE 9 only
                            // Use onreadystatechange to replace onabort
                            // to handle uncaught aborts
                            if (xhr.onabort !== undefined) {
                                xhr.onabort = errorCallback;
                            } else {
                                xhr.onreadystatechange = function () {

                                    // Check readyState before timeout as it changes
                                    if (xhr.readyState === 4) {

                                        // Allow onerror to be called first,
                                        // but that will not handle a native abort
                                        // Also, save errorCallback to a variable
                                        // as xhr.onerror cannot be accessed
                                        window.setTimeout(function () {
                                            if (callback) {
                                                errorCallback();
                                            }
                                        });
                                    }
                                };
                            }

                            // Create the abort callback
                            callback = callback("abort");

                            try {

                                // Do send the request (this may raise an exception)
                                xhr.send(options.hasContent && options.data || null);
                            } catch (e) {

                                // #14683: Only rethrow if this hasn't been notified as an error yet
                                if (callback) {
                                    throw e;
                                }
                            }
                        },

                        abort: function () {
                            if (callback) {
                                callback();
                            }
                        }
                    };
                }
            });




            // Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
            jQuery.ajaxPrefilter(function (s) {
                if (s.crossDomain) {
                    s.contents.script = false;
                }
            });

            // Install script dataType
            jQuery.ajaxSetup({
                accepts: {
                    script: "text/javascript, application/javascript, " +
                        "application/ecmascript, application/x-ecmascript"
                },
                contents: {
                    script: /\b(?:java|ecma)script\b/
                },
                converters: {
                    "text script": function (text) {
                        jQuery.globalEval(text);
                        return text;
                    }
                }
            });

            // Handle cache's special case and crossDomain
            jQuery.ajaxPrefilter("script", function (s) {
                if (s.cache === undefined) {
                    s.cache = false;
                }
                if (s.crossDomain) {
                    s.type = "GET";
                }
            });

            // Bind script tag hack transport
            jQuery.ajaxTransport("script", function (s) {

                // This transport only deals with cross domain requests
                if (s.crossDomain) {
                    var script, callback;
                    return {
                        send: function (_, complete) {
                            script = jQuery("<script>").prop({
                                charset: s.scriptCharset,
                                src: s.url
                            }).on(
                                "load error",
                                callback = function (evt) {
                                    script.remove();
                                    callback = null;
                                    if (evt) {
                                        complete(evt.type === "error" ? 404 : 200, evt.type);
                                    }
                                }
                            );

                            // Use native DOM manipulation to avoid our domManip AJAX trickery
                            document.head.appendChild(script[0]);
                        },
                        abort: function () {
                            if (callback) {
                                callback();
                            }
                        }
                    };
                }
            });




            var oldCallbacks = [],
                rjsonp = /(=)\?(?=&|$)|\?\?/;

            // Default jsonp settings
            jQuery.ajaxSetup({
                jsonp: "callback",
                jsonpCallback: function () {
                    var callback = oldCallbacks.pop() || (jQuery.expando + "_" + (nonce++));
                    this[callback] = true;
                    return callback;
                }
            });

            // Detect, normalize options and install callbacks for jsonp requests
            jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {

                var callbackName, overwritten, responseContainer,
                    jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ?
                        "url" :
                        typeof s.data === "string" &&
                        (s.contentType || "")
                            .indexOf("application/x-www-form-urlencoded") === 0 &&
                        rjsonp.test(s.data) && "data"
                    );

                // Handle iff the expected data type is "jsonp" or we have a parameter to set
                if (jsonProp || s.dataTypes[0] === "jsonp") {

                    // Get callback name, remembering preexisting value associated with it
                    callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ?
                        s.jsonpCallback() :
                        s.jsonpCallback;

                    // Insert callback into url or form data
                    if (jsonProp) {
                        s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
                    } else if (s.jsonp !== false) {
                        s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
                    }

                    // Use data converter to retrieve json after script execution
                    s.converters["script json"] = function () {
                        if (!responseContainer) {
                            jQuery.error(callbackName + " was not called");
                        }
                        return responseContainer[0];
                    };

                    // Force json dataType
                    s.dataTypes[0] = "json";

                    // Install callback
                    overwritten = window[callbackName];
                    window[callbackName] = function () {
                        responseContainer = arguments;
                    };

                    // Clean-up function (fires after converters)
                    jqXHR.always(function () {

                        // If previous value didn't exist - remove it
                        if (overwritten === undefined) {
                            jQuery(window).removeProp(callbackName);

                            // Otherwise restore preexisting value
                        } else {
                            window[callbackName] = overwritten;
                        }

                        // Save back as free
                        if (s[callbackName]) {

                            // Make sure that re-using the options doesn't screw things around
                            s.jsonpCallback = originalSettings.jsonpCallback;

                            // Save the callback name for future use
                            oldCallbacks.push(callbackName);
                        }

                        // Call if it was a function and we have a response
                        if (responseContainer && jQuery.isFunction(overwritten)) {
                            overwritten(responseContainer[0]);
                        }

                        responseContainer = overwritten = undefined;
                    });

                    // Delegate to script
                    return "script";
                }
            });




            // Support: Safari 8 only
            // In Safari 8 documents created via document.implementation.createHTMLDocument
            // collapse sibling forms: the second one becomes a child of the first one.
            // Because of that, this security measure has to be disabled in Safari 8.
            // https://bugs.webkit.org/show_bug.cgi?id=137337
            support.createHTMLDocument = (function () {
                var body = document.implementation.createHTMLDocument("").body;
                body.innerHTML = "<form></form><form></form>";
                return body.childNodes.length === 2;
            })();


            // Argument "data" should be string of html
            // context (optional): If specified, the fragment will be created in this context,
            // defaults to document
            // keepScripts (optional): If true, will include scripts passed in the html string
            jQuery.parseHTML = function (data, context, keepScripts) {
                if (typeof data !== "string") {
                    return [];
                }
                if (typeof context === "boolean") {
                    keepScripts = context;
                    context = false;
                }

                var base, parsed, scripts;

                if (!context) {

                    // Stop scripts or inline event handlers from being executed immediately
                    // by using document.implementation
                    if (support.createHTMLDocument) {
                        context = document.implementation.createHTMLDocument("");

                        // Set the base href for the created document
                        // so any parsed elements with URLs
                        // are based on the document's URL (gh-2965)
                        base = context.createElement("base");
                        base.href = document.location.href;
                        context.head.appendChild(base);
                    } else {
                        context = document;
                    }
                }

                parsed = rsingleTag.exec(data);
                scripts = !keepScripts && [];

                // Single tag
                if (parsed) {
                    return [context.createElement(parsed[1])];
                }

                parsed = buildFragment([data], context, scripts);

                if (scripts && scripts.length) {
                    jQuery(scripts).remove();
                }

                return jQuery.merge([], parsed.childNodes);
            };


            /**
             * Load a url into a page
             */
            jQuery.fn.load = function (url, params, callback) {
                var selector, type, response,
                    self = this,
                    off = url.indexOf(" ");

                if (off > -1) {
                    selector = stripAndCollapse(url.slice(off));
                    url = url.slice(0, off);
                }

                // If it's a function
                if (jQuery.isFunction(params)) {

                    // We assume that it's the callback
                    callback = params;
                    params = undefined;

                    // Otherwise, build a param string
                } else if (params && typeof params === "object") {
                    type = "POST";
                }

                // If we have elements to modify, make the request
                if (self.length > 0) {
                    jQuery.ajax({
                        url: url,

                        // If "type" variable is undefined, then "GET" method will be used.
                        // Make value of this field explicit since
                        // user can override it through ajaxSetup method
                        type: type || "GET",
                        dataType: "html",
                        data: params
                    }).done(function (responseText) {

                        // Save response for use in complete callback
                        response = arguments;

                        self.html(selector ?

                            // If a selector was specified, locate the right elements in a dummy div
                            // Exclude scripts to avoid IE 'Permission Denied' errors
                            jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) :

                            // Otherwise use the full result
                            responseText);

                        // If the request succeeds, this function gets "data", "status", "jqXHR"
                        // but they are ignored because response was set above.
                        // If it fails, this function gets "jqXHR", "status", "error"
                    }).always(callback && function (jqXHR, status) {
                        self.each(function () {
                            callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
                        });
                    });
                }

                return this;
            };




            // Attach a bunch of functions for handling common AJAX events
            jQuery.each([
                "ajaxStart",
                "ajaxStop",
                "ajaxComplete",
                "ajaxError",
                "ajaxSuccess",
                "ajaxSend"
            ], function (i, type) {
                jQuery.fn[type] = function (fn) {
                    return this.on(type, fn);
                };
            });




            jQuery.expr.pseudos.animated = function (elem) {
                return jQuery.grep(jQuery.timers, function (fn) {
                    return elem === fn.elem;
                }).length;
            };




            jQuery.offset = {
                setOffset: function (elem, options, i) {
                    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                        position = jQuery.css(elem, "position"),
                        curElem = jQuery(elem),
                        props = {};

                    // Set position first, in-case top/left are set even on static elem
                    if (position === "static") {
                        elem.style.position = "relative";
                    }

                    curOffset = curElem.offset();
                    curCSSTop = jQuery.css(elem, "top");
                    curCSSLeft = jQuery.css(elem, "left");
                    calculatePosition = (position === "absolute" || position === "fixed") &&
                        (curCSSTop + curCSSLeft).indexOf("auto") > -1;

                    // Need to be able to calculate position if either
                    // top or left is auto and position is either absolute or fixed
                    if (calculatePosition) {
                        curPosition = curElem.position();
                        curTop = curPosition.top;
                        curLeft = curPosition.left;

                    } else {
                        curTop = parseFloat(curCSSTop) || 0;
                        curLeft = parseFloat(curCSSLeft) || 0;
                    }

                    if (jQuery.isFunction(options)) {

                        // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
                        options = options.call(elem, i, jQuery.extend({}, curOffset));
                    }

                    if (options.top != null) {
                        props.top = (options.top - curOffset.top) + curTop;
                    }
                    if (options.left != null) {
                        props.left = (options.left - curOffset.left) + curLeft;
                    }

                    if ("using" in options) {
                        options.using.call(elem, props);

                    } else {
                        curElem.css(props);
                    }
                }
            };

            jQuery.fn.extend({
                offset: function (options) {

                    // Preserve chaining for setter
                    if (arguments.length) {
                        return options === undefined ?
                            this :
                            this.each(function (i) {
                                jQuery.offset.setOffset(this, options, i);
                            });
                    }

                    var doc, docElem, rect, win,
                        elem = this[0];

                    if (!elem) {
                        return;
                    }

                    // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
                    // Support: IE <=11 only
                    // Running getBoundingClientRect on a
                    // disconnected node in IE throws an error
                    if (!elem.getClientRects().length) {
                        return { top: 0, left: 0 };
                    }

                    rect = elem.getBoundingClientRect();

                    doc = elem.ownerDocument;
                    docElem = doc.documentElement;
                    win = doc.defaultView;

                    return {
                        top: rect.top + win.pageYOffset - docElem.clientTop,
                        left: rect.left + win.pageXOffset - docElem.clientLeft
                    };
                },

                position: function () {
                    if (!this[0]) {
                        return;
                    }

                    var offsetParent, offset,
                        elem = this[0],
                        parentOffset = { top: 0, left: 0 };

                    // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
                    // because it is its only offset parent
                    if (jQuery.css(elem, "position") === "fixed") {

                        // Assume getBoundingClientRect is there when computed position is fixed
                        offset = elem.getBoundingClientRect();

                    } else {

                        // Get *real* offsetParent
                        offsetParent = this.offsetParent();

                        // Get correct offsets
                        offset = this.offset();
                        if (!nodeName(offsetParent[0], "html")) {
                            parentOffset = offsetParent.offset();
                        }

                        // Add offsetParent borders
                        parentOffset = {
                            top: parentOffset.top + jQuery.css(offsetParent[0], "borderTopWidth", true),
                            left: parentOffset.left + jQuery.css(offsetParent[0], "borderLeftWidth", true)
                        };
                    }

                    // Subtract parent offsets and element margins
                    return {
                        top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", true),
                        left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", true)
                    };
                },

                // This method will return documentElement in the following cases:
                // 1) For the element inside the iframe without offsetParent, this method will return
                //    documentElement of the parent window
                // 2) For the hidden or detached element
                // 3) For body or html element, i.e. in case of the html node - it will return itself
                //
                // but those exceptions were never presented as a real life use-cases
                // and might be considered as more preferable results.
                //
                // This logic, however, is not guaranteed and can change at any point in the future
                offsetParent: function () {
                    return this.map(function () {
                        var offsetParent = this.offsetParent;

                        while (offsetParent && jQuery.css(offsetParent, "position") === "static") {
                            offsetParent = offsetParent.offsetParent;
                        }

                        return offsetParent || documentElement;
                    });
                }
            });

            // Create scrollLeft and scrollTop methods
            jQuery.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function (method, prop) {
                var top = "pageYOffset" === prop;

                jQuery.fn[method] = function (val) {
                    return access(this, function (elem, method, val) {

                        // Coalesce documents and windows
                        var win;
                        if (jQuery.isWindow(elem)) {
                            win = elem;
                        } else if (elem.nodeType === 9) {
                            win = elem.defaultView;
                        }

                        if (val === undefined) {
                            return win ? win[prop] : elem[method];
                        }

                        if (win) {
                            win.scrollTo(
                                !top ? val : win.pageXOffset,
                                top ? val : win.pageYOffset
                            );

                        } else {
                            elem[method] = val;
                        }
                    }, method, val, arguments.length);
                };
            });

            // Support: Safari <=7 - 9.1, Chrome <=37 - 49
            // Add the top/left cssHooks using jQuery.fn.position
            // Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
            // Blink bug: https://bugs.chromium.org/p/chromium/issues/detail?id=589347
            // getComputedStyle returns percent when specified for top/left/bottom/right;
            // rather than make the css module depend on the offset module, just check for it here
            jQuery.each(["top", "left"], function (i, prop) {
                jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition,
                    function (elem, computed) {
                        if (computed) {
                            computed = curCSS(elem, prop);

                            // If curCSS returns percentage, fallback to offset
                            return rnumnonpx.test(computed) ?
                                jQuery(elem).position()[prop] + "px" :
                                computed;
                        }
                    }
                );
            });


            // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
            jQuery.each({ Height: "height", Width: "width" }, function (name, type) {
                jQuery.each({ padding: "inner" + name, content: type, "": "outer" + name },
                    function (defaultExtra, funcName) {

                        // Margin is only for outerHeight, outerWidth
                        jQuery.fn[funcName] = function (margin, value) {
                            var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"),
                                extra = defaultExtra || (margin === true || value === true ? "margin" : "border");

                            return access(this, function (elem, type, value) {
                                var doc;

                                if (jQuery.isWindow(elem)) {

                                    // $( window ).outerWidth/Height return w/h including scrollbars (gh-1729)
                                    return funcName.indexOf("outer") === 0 ?
                                        elem["inner" + name] :
                                        elem.document.documentElement["client" + name];
                                }

                                // Get document width or height
                                if (elem.nodeType === 9) {
                                    doc = elem.documentElement;

                                    // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
                                    // whichever is greatest
                                    return Math.max(
                                        elem.body["scroll" + name], doc["scroll" + name],
                                        elem.body["offset" + name], doc["offset" + name],
                                        doc["client" + name]
                                    );
                                }

                                return value === undefined ?

                                    // Get width or height on the element, requesting but not forcing parseFloat
                                    jQuery.css(elem, type, extra) :

                                    // Set width or height on the element
                                    jQuery.style(elem, type, value, extra);
                            }, type, chainable ? margin : undefined, chainable);
                        };
                    });
            });


            jQuery.fn.extend({

                bind: function (types, data, fn) {
                    return this.on(types, null, data, fn);
                },
                unbind: function (types, fn) {
                    return this.off(types, null, fn);
                },

                delegate: function (selector, types, data, fn) {
                    return this.on(types, selector, data, fn);
                },
                undelegate: function (selector, types, fn) {

                    // ( namespace ) or ( selector, types [, fn] )
                    return arguments.length === 1 ?
                        this.off(selector, "**") :
                        this.off(types, selector || "**", fn);
                }
            });

            jQuery.holdReady = function (hold) {
                if (hold) {
                    jQuery.readyWait++;
                } else {
                    jQuery.ready(true);
                }
            };
            jQuery.isArray = Array.isArray;
            jQuery.parseJSON = JSON.parse;
            jQuery.nodeName = nodeName;




            // Register as a named AMD module, since jQuery can be concatenated with other
            // files that may use define, but not via a proper concatenation script that
            // understands anonymous AMD modules. A named AMD is safest and most robust
            // way to register. Lowercase jquery is used because AMD module names are
            // derived from file names, and jQuery is normally delivered in a lowercase
            // file name. Do this after creating the global so that if an AMD module wants
            // to call noConflict to hide this version of jQuery, it will work.

            // Note that for maximum portability, libraries that are not jQuery should
            // declare themselves as anonymous modules, and avoid setting a global if an
            // AMD loader is present. jQuery is a special case. For more information, see
            // https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

            if (typeof define === "function" && define.amd) {
                define("jquery", [], function () {
                    return jQuery;
                });
            }




            var

                // Map over jQuery in case of overwrite
                _jQuery = window.jQuery,

                // Map over the $ in case of overwrite
                _$ = window.$;

            jQuery.noConflict = function (deep) {
                if (window.$ === jQuery) {
                    window.$ = _$;
                }

                if (deep && window.jQuery === jQuery) {
                    window.jQuery = _jQuery;
                }

                return jQuery;
            };

            // Expose jQuery and $ identifiers, even in AMD
            // (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
            // and CommonJS for browser emulators (#13566)
            if (!noGlobal) {
                window.jQuery = window.$ = jQuery;
            }




            return jQuery;
        });

    }, {}], 53: [function (require, module, exports) {
        /*
         * smoothscroll polyfill - v0.3.5
         * https://iamdustan.github.io/smoothscroll
         * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
         */

        (function (w, d, undefined) {
            'use strict';

            /*
             * aliases
             * w: window global object
             * d: document
             * undefined: undefined
             */

            // polyfill
            function polyfill() {
                // return when scrollBehavior interface is supported
                if ('scrollBehavior' in d.documentElement.style) {
                    return;
                }

                /*
                 * globals
                 */
                var Element = w.HTMLElement || w.Element;
                var SCROLL_TIME = 468;

                /*
                 * object gathering original scroll methods
                 */
                var original = {
                    scroll: w.scroll || w.scrollTo,
                    scrollBy: w.scrollBy,
                    elScroll: Element.prototype.scroll || scrollElement,
                    scrollIntoView: Element.prototype.scrollIntoView
                };

                /*
                 * define timing method
                 */
                var now = w.performance && w.performance.now
                    ? w.performance.now.bind(w.performance) : Date.now;

                /**
                 * changes scroll position inside an element
                 * @method scrollElement
                 * @param {Number} x
                 * @param {Number} y
                 */
                function scrollElement(x, y) {
                    this.scrollLeft = x;
                    this.scrollTop = y;
                }

                /**
                 * returns result of applying ease math function to a number
                 * @method ease
                 * @param {Number} k
                 * @returns {Number}
                 */
                function ease(k) {
                    return 0.5 * (1 - Math.cos(Math.PI * k));
                }

                /**
                 * indicates if a smooth behavior should be applied
                 * @method shouldBailOut
                 * @param {Number|Object} x
                 * @returns {Boolean}
                 */
                function shouldBailOut(x) {
                    if (typeof x !== 'object'
                        || x === null
                        || x.behavior === undefined
                        || x.behavior === 'auto'
                        || x.behavior === 'instant') {
                        // first arg not an object/null
                        // or behavior is auto, instant or undefined
                        return true;
                    }

                    if (typeof x === 'object'
                        && x.behavior === 'smooth') {
                        // first argument is an object and behavior is smooth
                        return false;
                    }

                    // throw error when behavior is not supported
                    throw new TypeError('behavior not valid');
                }

                /**
                 * finds scrollable parent of an element
                 * @method findScrollableParent
                 * @param {Node} el
                 * @returns {Node} el
                 */
                function findScrollableParent(el) {
                    var isBody;
                    var hasScrollableSpace;
                    var hasVisibleOverflow;

                    do {
                        el = el.parentNode;

                        // set condition variables
                        isBody = el === d.body;
                        hasScrollableSpace =
                            el.clientHeight < el.scrollHeight ||
                            el.clientWidth < el.scrollWidth;
                        hasVisibleOverflow =
                            w.getComputedStyle(el, null).overflow === 'visible';
                    } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

                    isBody = hasScrollableSpace = hasVisibleOverflow = null;

                    return el;
                }

                /**
                 * self invoked function that, given a context, steps through scrolling
                 * @method step
                 * @param {Object} context
                 */
                function step(context) {
                    var time = now();
                    var value;
                    var currentX;
                    var currentY;
                    var elapsed = (time - context.startTime) / SCROLL_TIME;

                    // avoid elapsed times higher than one
                    elapsed = elapsed > 1 ? 1 : elapsed;

                    // apply easing to elapsed time
                    value = ease(elapsed);

                    currentX = context.startX + (context.x - context.startX) * value;
                    currentY = context.startY + (context.y - context.startY) * value;

                    context.method.call(context.scrollable, currentX, currentY);

                    // scroll more if we have not reached our destination
                    if (currentX !== context.x || currentY !== context.y) {
                        w.requestAnimationFrame(step.bind(w, context));
                    }
                }

                /**
                 * scrolls window with a smooth behavior
                 * @method smoothScroll
                 * @param {Object|Node} el
                 * @param {Number} x
                 * @param {Number} y
                 */
                function smoothScroll(el, x, y) {
                    var scrollable;
                    var startX;
                    var startY;
                    var method;
                    var startTime = now();

                    // define scroll context
                    if (el === d.body) {
                        scrollable = w;
                        startX = w.scrollX || w.pageXOffset;
                        startY = w.scrollY || w.pageYOffset;
                        method = original.scroll;
                    } else {
                        scrollable = el;
                        startX = el.scrollLeft;
                        startY = el.scrollTop;
                        method = scrollElement;
                    }

                    // scroll looping over a frame
                    step({
                        scrollable: scrollable,
                        method: method,
                        startTime: startTime,
                        startX: startX,
                        startY: startY,
                        x: x,
                        y: y
                    });
                }

                /*
                 * ORIGINAL METHODS OVERRIDES
                 */

                // w.scroll and w.scrollTo
                w.scroll = w.scrollTo = function () {
                    // avoid smooth behavior if not required
                    if (shouldBailOut(arguments[0])) {
                        original.scroll.call(
                            w,
                            arguments[0].left || arguments[0],
                            arguments[0].top || arguments[1]
                        );
                        return;
                    }

                    // LET THE SMOOTHNESS BEGIN!
                    smoothScroll.call(
                        w,
                        d.body,
                        ~~arguments[0].left,
                        ~~arguments[0].top
                    );
                };

                // w.scrollBy
                w.scrollBy = function () {
                    // avoid smooth behavior if not required
                    if (shouldBailOut(arguments[0])) {
                        original.scrollBy.call(
                            w,
                            arguments[0].left || arguments[0],
                            arguments[0].top || arguments[1]
                        );
                        return;
                    }

                    // LET THE SMOOTHNESS BEGIN!
                    smoothScroll.call(
                        w,
                        d.body,
                        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
                        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
                    );
                };

                // Element.prototype.scroll and Element.prototype.scrollTo
                Element.prototype.scroll = Element.prototype.scrollTo = function () {
                    // avoid smooth behavior if not required
                    if (shouldBailOut(arguments[0])) {
                        original.elScroll.call(
                            this,
                            arguments[0].left || arguments[0],
                            arguments[0].top || arguments[1]
                        );
                        return;
                    }

                    var left = arguments[0].left;
                    var top = arguments[0].top;

                    // LET THE SMOOTHNESS BEGIN!
                    smoothScroll.call(
                        this,
                        this,
                        typeof left === 'number' ? left : this.scrollLeft,
                        typeof top === 'number' ? top : this.scrollTop
                    );
                };

                // Element.prototype.scrollBy
                Element.prototype.scrollBy = function () {
                    var arg0 = arguments[0];

                    if (typeof arg0 === 'object') {
                        this.scroll({
                            left: arg0.left + this.scrollLeft,
                            top: arg0.top + this.scrollTop,
                            behavior: arg0.behavior
                        });
                    } else {
                        this.scroll(
                            this.scrollLeft + arg0,
                            this.scrollTop + arguments[1]
                        );
                    }
                };

                // Element.prototype.scrollIntoView
                Element.prototype.scrollIntoView = function () {
                    // avoid smooth behavior if not required
                    if (shouldBailOut(arguments[0])) {
                        original.scrollIntoView.call(
                            this,
                            arguments[0] === undefined ? true : arguments[0]
                        );
                        return;
                    }

                    // LET THE SMOOTHNESS BEGIN!
                    var scrollableParent = findScrollableParent(this);
                    var parentRects = scrollableParent.getBoundingClientRect();
                    var clientRects = this.getBoundingClientRect();

                    if (scrollableParent !== d.body) {
                        // reveal element inside parent
                        smoothScroll.call(
                            this,
                            scrollableParent,
                            scrollableParent.scrollLeft + clientRects.left - parentRects.left,
                            scrollableParent.scrollTop + clientRects.top - parentRects.top
                        );
                        // reveal parent in viewport
                        w.scrollBy({
                            left: parentRects.left,
                            top: parentRects.top,
                            behavior: 'smooth'
                        });
                    } else {
                        // reveal element in viewport
                        w.scrollBy({
                            left: clientRects.left,
                            top: clientRects.top,
                            behavior: 'smooth'
                        });
                    }
                };
            }

            if (typeof exports === 'object') {
                // commonjs
                module.exports = { polyfill: polyfill };
            } else {
                // global
                polyfill();
            }
        })(window, document);

    }, {}], 54: [function (require, module, exports) {
    /* Web Font Loader v1.6.28 - (c) Adobe Systems, Google. License: Apache 2.0 */(function () {
            function aa(a, b, c) { return a.call.apply(a.bind, arguments) } function ba(a, b, c) { if (!a) throw Error(); if (2 < arguments.length) { var d = Array.prototype.slice.call(arguments, 2); return function () { var c = Array.prototype.slice.call(arguments); Array.prototype.unshift.apply(c, d); return a.apply(b, c) } } return function () { return a.apply(b, arguments) } } function p(a, b, c) { p = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? aa : ba; return p.apply(null, arguments) } var q = Date.now || function () { return +new Date }; function ca(a, b) { this.a = a; this.o = b || a; this.c = this.o.document } var da = !!window.FontFace; function t(a, b, c, d) { b = a.c.createElement(b); if (c) for (var e in c) c.hasOwnProperty(e) && ("style" == e ? b.style.cssText = c[e] : b.setAttribute(e, c[e])); d && b.appendChild(a.c.createTextNode(d)); return b } function u(a, b, c) { a = a.c.getElementsByTagName(b)[0]; a || (a = document.documentElement); a.insertBefore(c, a.lastChild) } function v(a) { a.parentNode && a.parentNode.removeChild(a) }
            function w(a, b, c) { b = b || []; c = c || []; for (var d = a.className.split(/\s+/), e = 0; e < b.length; e += 1) { for (var f = !1, g = 0; g < d.length; g += 1)if (b[e] === d[g]) { f = !0; break } f || d.push(b[e]) } b = []; for (e = 0; e < d.length; e += 1) { f = !1; for (g = 0; g < c.length; g += 1)if (d[e] === c[g]) { f = !0; break } f || b.push(d[e]) } a.className = b.join(" ").replace(/\s+/g, " ").replace(/^\s+|\s+$/, "") } function y(a, b) { for (var c = a.className.split(/\s+/), d = 0, e = c.length; d < e; d++)if (c[d] == b) return !0; return !1 }
            function ea(a) { return a.o.location.hostname || a.a.location.hostname } function z(a, b, c) { function d() { m && e && f && (m(g), m = null) } b = t(a, "link", { rel: "stylesheet", href: b, media: "all" }); var e = !1, f = !0, g = null, m = c || null; da ? (b.onload = function () { e = !0; d() }, b.onerror = function () { e = !0; g = Error("Stylesheet failed to load"); d() }) : setTimeout(function () { e = !0; d() }, 0); u(a, "head", b) }
            function A(a, b, c, d) { var e = a.c.getElementsByTagName("head")[0]; if (e) { var f = t(a, "script", { src: b }), g = !1; f.onload = f.onreadystatechange = function () { g || this.readyState && "loaded" != this.readyState && "complete" != this.readyState || (g = !0, c && c(null), f.onload = f.onreadystatechange = null, "HEAD" == f.parentNode.tagName && e.removeChild(f)) }; e.appendChild(f); setTimeout(function () { g || (g = !0, c && c(Error("Script load timeout"))) }, d || 5E3); return f } return null }; function B() { this.a = 0; this.c = null } function C(a) { a.a++; return function () { a.a--; D(a) } } function E(a, b) { a.c = b; D(a) } function D(a) { 0 == a.a && a.c && (a.c(), a.c = null) }; function F(a) { this.a = a || "-" } F.prototype.c = function (a) { for (var b = [], c = 0; c < arguments.length; c++)b.push(arguments[c].replace(/[\W_]+/g, "").toLowerCase()); return b.join(this.a) }; function G(a, b) { this.c = a; this.f = 4; this.a = "n"; var c = (b || "n4").match(/^([nio])([1-9])$/i); c && (this.a = c[1], this.f = parseInt(c[2], 10)) } function fa(a) { return H(a) + " " + (a.f + "00") + " 300px " + I(a.c) } function I(a) { var b = []; a = a.split(/,\s*/); for (var c = 0; c < a.length; c++) { var d = a[c].replace(/['"]/g, ""); -1 != d.indexOf(" ") || /^\d/.test(d) ? b.push("'" + d + "'") : b.push(d) } return b.join(",") } function J(a) { return a.a + a.f } function H(a) { var b = "normal"; "o" === a.a ? b = "oblique" : "i" === a.a && (b = "italic"); return b }
            function ga(a) { var b = 4, c = "n", d = null; a && ((d = a.match(/(normal|oblique|italic)/i)) && d[1] && (c = d[1].substr(0, 1).toLowerCase()), (d = a.match(/([1-9]00|normal|bold)/i)) && d[1] && (/bold/i.test(d[1]) ? b = 7 : /[1-9]00/.test(d[1]) && (b = parseInt(d[1].substr(0, 1), 10)))); return c + b }; function ha(a, b) { this.c = a; this.f = a.o.document.documentElement; this.h = b; this.a = new F("-"); this.j = !1 !== b.events; this.g = !1 !== b.classes } function ia(a) { a.g && w(a.f, [a.a.c("wf", "loading")]); K(a, "loading") } function L(a) { if (a.g) { var b = y(a.f, a.a.c("wf", "active")), c = [], d = [a.a.c("wf", "loading")]; b || c.push(a.a.c("wf", "inactive")); w(a.f, c, d) } K(a, "inactive") } function K(a, b, c) { if (a.j && a.h[b]) if (c) a.h[b](c.c, J(c)); else a.h[b]() }; function ja() { this.c = {} } function ka(a, b, c) { var d = [], e; for (e in b) if (b.hasOwnProperty(e)) { var f = a.c[e]; f && d.push(f(b[e], c)) } return d }; function M(a, b) { this.c = a; this.f = b; this.a = t(this.c, "span", { "aria-hidden": "true" }, this.f) } function N(a) { u(a.c, "body", a.a) } function O(a) { return "display:block;position:absolute;top:-9999px;left:-9999px;font-size:300px;width:auto;height:auto;line-height:normal;margin:0;padding:0;font-variant:normal;white-space:nowrap;font-family:" + I(a.c) + ";" + ("font-style:" + H(a) + ";font-weight:" + (a.f + "00") + ";") }; function P(a, b, c, d, e, f) { this.g = a; this.j = b; this.a = d; this.c = c; this.f = e || 3E3; this.h = f || void 0 } P.prototype.start = function () { var a = this.c.o.document, b = this, c = q(), d = new Promise(function (d, e) { function f() { q() - c >= b.f ? e() : a.fonts.load(fa(b.a), b.h).then(function (a) { 1 <= a.length ? d() : setTimeout(f, 25) }, function () { e() }) } f() }), e = null, f = new Promise(function (a, d) { e = setTimeout(d, b.f) }); Promise.race([f, d]).then(function () { e && (clearTimeout(e), e = null); b.g(b.a) }, function () { b.j(b.a) }) }; function Q(a, b, c, d, e, f, g) {
                this.v = a; this.B = b; this.c = c; this.a = d; this.s = g || "BESbswy"; this.f = {}; this.w = e || 3E3; this.u = f || null; this.m = this.j = this.h = this.g = null; this.g = new M(this.c, this.s); this.h = new M(this.c, this.s); this.j = new M(this.c, this.s); this.m = new M(this.c, this.s); a = new G(this.a.c + ",serif", J(this.a)); a = O(a); this.g.a.style.cssText = a; a = new G(this.a.c + ",sans-serif", J(this.a)); a = O(a); this.h.a.style.cssText = a; a = new G("serif", J(this.a)); a = O(a); this.j.a.style.cssText = a; a = new G("sans-serif", J(this.a)); a =
                    O(a); this.m.a.style.cssText = a; N(this.g); N(this.h); N(this.j); N(this.m)
            } var R = { D: "serif", C: "sans-serif" }, S = null; function T() { if (null === S) { var a = /AppleWebKit\/([0-9]+)(?:\.([0-9]+))/.exec(window.navigator.userAgent); S = !!a && (536 > parseInt(a[1], 10) || 536 === parseInt(a[1], 10) && 11 >= parseInt(a[2], 10)) } return S } Q.prototype.start = function () { this.f.serif = this.j.a.offsetWidth; this.f["sans-serif"] = this.m.a.offsetWidth; this.A = q(); U(this) };
            function la(a, b, c) { for (var d in R) if (R.hasOwnProperty(d) && b === a.f[R[d]] && c === a.f[R[d]]) return !0; return !1 } function U(a) { var b = a.g.a.offsetWidth, c = a.h.a.offsetWidth, d; (d = b === a.f.serif && c === a.f["sans-serif"]) || (d = T() && la(a, b, c)); d ? q() - a.A >= a.w ? T() && la(a, b, c) && (null === a.u || a.u.hasOwnProperty(a.a.c)) ? V(a, a.v) : V(a, a.B) : ma(a) : V(a, a.v) } function ma(a) { setTimeout(p(function () { U(this) }, a), 50) } function V(a, b) { setTimeout(p(function () { v(this.g.a); v(this.h.a); v(this.j.a); v(this.m.a); b(this.a) }, a), 0) }; function W(a, b, c) { this.c = a; this.a = b; this.f = 0; this.m = this.j = !1; this.s = c } var X = null; W.prototype.g = function (a) { var b = this.a; b.g && w(b.f, [b.a.c("wf", a.c, J(a).toString(), "active")], [b.a.c("wf", a.c, J(a).toString(), "loading"), b.a.c("wf", a.c, J(a).toString(), "inactive")]); K(b, "fontactive", a); this.m = !0; na(this) };
            W.prototype.h = function (a) { var b = this.a; if (b.g) { var c = y(b.f, b.a.c("wf", a.c, J(a).toString(), "active")), d = [], e = [b.a.c("wf", a.c, J(a).toString(), "loading")]; c || d.push(b.a.c("wf", a.c, J(a).toString(), "inactive")); w(b.f, d, e) } K(b, "fontinactive", a); na(this) }; function na(a) { 0 == --a.f && a.j && (a.m ? (a = a.a, a.g && w(a.f, [a.a.c("wf", "active")], [a.a.c("wf", "loading"), a.a.c("wf", "inactive")]), K(a, "active")) : L(a.a)) }; function oa(a) { this.j = a; this.a = new ja; this.h = 0; this.f = this.g = !0 } oa.prototype.load = function (a) { this.c = new ca(this.j, a.context || this.j); this.g = !1 !== a.events; this.f = !1 !== a.classes; pa(this, new ha(this.c, a), a) };
            function qa(a, b, c, d, e) {
                var f = 0 == --a.h; (a.f || a.g) && setTimeout(function () {
                    var a = e || null, m = d || null || {}; if (0 === c.length && f) L(b.a); else {
                        b.f += c.length; f && (b.j = f); var h, l = []; for (h = 0; h < c.length; h++) {
                            var k = c[h], n = m[k.c], r = b.a, x = k; r.g && w(r.f, [r.a.c("wf", x.c, J(x).toString(), "loading")]); K(r, "fontloading", x); r = null; if (null === X) if (window.FontFace) {
                                var x = /Gecko.*Firefox\/(\d+)/.exec(window.navigator.userAgent), xa = /OS X.*Version\/10\..*Safari/.exec(window.navigator.userAgent) && /Apple/.exec(window.navigator.vendor);
                                X = x ? 42 < parseInt(x[1], 10) : xa ? !1 : !0
                            } else X = !1; X ? r = new P(p(b.g, b), p(b.h, b), b.c, k, b.s, n) : r = new Q(p(b.g, b), p(b.h, b), b.c, k, b.s, a, n); l.push(r)
                        } for (h = 0; h < l.length; h++)l[h].start()
                    }
                }, 0)
            } function pa(a, b, c) { var d = [], e = c.timeout; ia(b); var d = ka(a.a, c, a.c), f = new W(a.c, b, e); a.h = d.length; b = 0; for (c = d.length; b < c; b++)d[b].load(function (b, d, c) { qa(a, f, b, d, c) }) }; function ra(a, b) { this.c = a; this.a = b }
            ra.prototype.load = function (a) {
                function b() { if (f["__mti_fntLst" + d]) { var c = f["__mti_fntLst" + d](), e = [], h; if (c) for (var l = 0; l < c.length; l++) { var k = c[l].fontfamily; void 0 != c[l].fontStyle && void 0 != c[l].fontWeight ? (h = c[l].fontStyle + c[l].fontWeight, e.push(new G(k, h))) : e.push(new G(k)) } a(e) } else setTimeout(function () { b() }, 50) } var c = this, d = c.a.projectId, e = c.a.version; if (d) {
                    var f = c.c.o; A(this.c, (c.a.api || "https://fast.fonts.net/jsapi") + "/" + d + ".js" + (e ? "?v=" + e : ""), function (e) {
                        e ? a([]) : (f["__MonotypeConfiguration__" +
                            d] = function () { return c.a }, b())
                    }).id = "__MonotypeAPIScript__" + d
                } else a([])
            }; function sa(a, b) { this.c = a; this.a = b } sa.prototype.load = function (a) { var b, c, d = this.a.urls || [], e = this.a.families || [], f = this.a.testStrings || {}, g = new B; b = 0; for (c = d.length; b < c; b++)z(this.c, d[b], C(g)); var m = []; b = 0; for (c = e.length; b < c; b++)if (d = e[b].split(":"), d[1]) for (var h = d[1].split(","), l = 0; l < h.length; l += 1)m.push(new G(d[0], h[l])); else m.push(new G(d[0])); E(g, function () { a(m, f) }) }; function ta(a, b) { a ? this.c = a : this.c = ua; this.a = []; this.f = []; this.g = b || "" } var ua = "https://fonts.googleapis.com/css"; function va(a, b) { for (var c = b.length, d = 0; d < c; d++) { var e = b[d].split(":"); 3 == e.length && a.f.push(e.pop()); var f = ""; 2 == e.length && "" != e[1] && (f = ":"); a.a.push(e.join(f)) } }
            function wa(a) { if (0 == a.a.length) throw Error("No fonts to load!"); if (-1 != a.c.indexOf("kit=")) return a.c; for (var b = a.a.length, c = [], d = 0; d < b; d++)c.push(a.a[d].replace(/ /g, "+")); b = a.c + "?family=" + c.join("%7C"); 0 < a.f.length && (b += "&subset=" + a.f.join(",")); 0 < a.g.length && (b += "&text=" + encodeURIComponent(a.g)); return b }; function ya(a) { this.f = a; this.a = []; this.c = {} }
            var za = { latin: "BESbswy", "latin-ext": "\u00e7\u00f6\u00fc\u011f\u015f", cyrillic: "\u0439\u044f\u0416", greek: "\u03b1\u03b2\u03a3", khmer: "\u1780\u1781\u1782", Hanuman: "\u1780\u1781\u1782" }, Aa = { thin: "1", extralight: "2", "extra-light": "2", ultralight: "2", "ultra-light": "2", light: "3", regular: "4", book: "4", medium: "5", "semi-bold": "6", semibold: "6", "demi-bold": "6", demibold: "6", bold: "7", "extra-bold": "8", extrabold: "8", "ultra-bold": "8", ultrabold: "8", black: "9", heavy: "9", l: "3", r: "4", b: "7" }, Ba = { i: "i", italic: "i", n: "n", normal: "n" },
                Ca = /^(thin|(?:(?:extra|ultra)-?)?light|regular|book|medium|(?:(?:semi|demi|extra|ultra)-?)?bold|black|heavy|l|r|b|[1-9]00)?(n|i|normal|italic)?$/;
            function Da(a) {
                for (var b = a.f.length, c = 0; c < b; c++) {
                    var d = a.f[c].split(":"), e = d[0].replace(/\+/g, " "), f = ["n4"]; if (2 <= d.length) {
                        var g; var m = d[1]; g = []; if (m) for (var m = m.split(","), h = m.length, l = 0; l < h; l++) { var k; k = m[l]; if (k.match(/^[\w-]+$/)) { var n = Ca.exec(k.toLowerCase()); if (null == n) k = ""; else { k = n[2]; k = null == k || "" == k ? "n" : Ba[k]; n = n[1]; if (null == n || "" == n) n = "4"; else var r = Aa[n], n = r ? r : isNaN(n) ? "4" : n.substr(0, 1); k = [k, n].join("") } } else k = ""; k && g.push(k) } 0 < g.length && (f = g); 3 == d.length && (d = d[2], g = [], d = d ? d.split(",") :
                            g, 0 < d.length && (d = za[d[0]]) && (a.c[e] = d))
                    } a.c[e] || (d = za[e]) && (a.c[e] = d); for (d = 0; d < f.length; d += 1)a.a.push(new G(e, f[d]))
                }
            }; function Ea(a, b) { this.c = a; this.a = b } var Fa = { Arimo: !0, Cousine: !0, Tinos: !0 }; Ea.prototype.load = function (a) { var b = new B, c = this.c, d = new ta(this.a.api, this.a.text), e = this.a.families; va(d, e); var f = new ya(e); Da(f); z(c, wa(d), C(b)); E(b, function () { a(f.a, f.c, Fa) }) }; function Ga(a, b) { this.c = a; this.a = b } Ga.prototype.load = function (a) { var b = this.a.id, c = this.c.o; b ? A(this.c, (this.a.api || "https://use.typekit.net") + "/" + b + ".js", function (b) { if (b) a([]); else if (c.Typekit && c.Typekit.config && c.Typekit.config.fn) { b = c.Typekit.config.fn; for (var e = [], f = 0; f < b.length; f += 2)for (var g = b[f], m = b[f + 1], h = 0; h < m.length; h++)e.push(new G(g, m[h])); try { c.Typekit.load({ events: !1, classes: !1, async: !0 }) } catch (l) { } a(e) } }, 2E3) : a([]) }; function Ha(a, b) { this.c = a; this.f = b; this.a = [] } Ha.prototype.load = function (a) { var b = this.f.id, c = this.c.o, d = this; b ? (c.__webfontfontdeckmodule__ || (c.__webfontfontdeckmodule__ = {}), c.__webfontfontdeckmodule__[b] = function (b, c) { for (var g = 0, m = c.fonts.length; g < m; ++g) { var h = c.fonts[g]; d.a.push(new G(h.name, ga("font-weight:" + h.weight + ";font-style:" + h.style))) } a(d.a) }, A(this.c, (this.f.api || "https://f.fontdeck.com/s/css/js/") + ea(this.c) + "/" + b + ".js", function (b) { b && a([]) })) : a([]) }; var Y = new oa(window); Y.a.c.custom = function (a, b) { return new sa(b, a) }; Y.a.c.fontdeck = function (a, b) { return new Ha(b, a) }; Y.a.c.monotype = function (a, b) { return new ra(b, a) }; Y.a.c.typekit = function (a, b) { return new Ga(b, a) }; Y.a.c.google = function (a, b) { return new Ea(b, a) }; var Z = { load: p(Y.load, Y) }; "function" === typeof define && define.amd ? define(function () { return Z }) : "undefined" !== typeof module && module.exports ? module.exports = Z : (window.WebFont = Z, window.WebFontConfig && Y.load(window.WebFontConfig));
        }());

    }, {}]
}, {}, [46]);
