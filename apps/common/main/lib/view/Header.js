/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html).
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7  3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute.
 * Pursuant to Section 7  3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/
/**
 *  Header.js
 *
 *  Created by Alexander Yuzhin on 2/14/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

if (Common === undefined)
    var Common = {};

Common.Views = Common.Views || {};

define([
    'backbone',
    'text!common/main/lib/template/Header.template',
    'core'
], function (Backbone, headerTemplate) { 'use strict';

    Common.Views.Header =  Backbone.View.extend(_.extend({
        options : {
            branding: {},
            headerCaption: 'Default Caption',
            documentCaption: '',
            canBack: false
        },

        el: '#header',

        // Compile our stats template
        template: _.template(headerTemplate),

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            'click #header-logo': function(e) {
                var _url = !!this.branding && !!this.branding.logo && !!this.branding.logo.url ?
                                this.branding.logo.url : 'http://www.onlyoffice.com';

                var newDocumentPage = window.open(_url);
                newDocumentPage && newDocumentPage.focus();
            }
        },

        initialize: function (options) {
            this.options = this.options ? _({}).extend(this.options, options) : options;

            this.headerCaption      = this.options.headerCaption;
            this.documentCaption    = this.options.documentCaption;
            this.canBack            = this.options.canBack;
            this.branding           = this.options.customization;
        },

        render: function () {
            $(this.el).html(this.template({
                headerCaption   : this.headerCaption,
                documentCaption : Common.Utils.String.htmlEncode(this.documentCaption),
                canBack         : this.canBack,
                textBack        : this.textBack
            }));

            var menuNewTab = new Common.UI.MenuItem({
                caption     : this.openNewTabText
            }).on('click', function(item, e) {
                Common.NotificationCenter.trigger('goback', true);
                Common.component.Analytics.trackEvent('Back to Folder');
            });
            this.gotoDocsMenu = new Common.UI.Menu({
                style: 'min-width: 100px;',
                items: [
                    menuNewTab
                ]
            });
        },

        setVisible: function(visible) {
            visible
                ? this.show()
                : this.hide();
        },

        setBranding: function(value) {
            var element;

            this.branding = value;

            if (value && value.logo && value.logo.image) {
                element = $('#header-logo');
                if (element) {
                    element.html('<img src="'+value.logo.image+'" style="max-width:86px; max-height:20px; margin: 0 8px 0 15px;"/>');
                    element.css({'background-image': 'none', width: 'auto'});
                }
            }

//            if (value && value.backgroundColor) {
//                element = Ext.select(".common-header");
//                if (element) {
//                    element.setStyle("background-image", "none");
//                    element.setStyle("background-color", value.backgroundColor);
//                }
//            }
//
//            if (value && value.textColor) {
//                var allSpanEl = element.select('span');
//                allSpanEl.each(function(el){
//                    el.setStyle("color", value.textColor);
//                });
//            }
        },

        setHeaderCaption: function(value) {
            this.headerCaption = value;

            var caption = $('#header-caption > div');

            if (caption)
                caption.html(value);

            return value;
        },

        getHeaderCaption: function() {
            return this.headerCaption;
        },

        setDocumentCaption: function(value, applyOnly) {
            if (_.isUndefined(applyOnly)) {
                this.documentCaption = value;
            }

            if (!value)
                value = '';

            var dc = $('#header-documentcaption');
            if (dc)
                dc.html(Common.Utils.String.htmlEncode(value));

            return value;
        },

        getDocumentCaption: function() {
            return this.documentCaption;
        },

        setCanBack: function(value) {
            this.canBack = value;
            var back = $('#header-back');

            if (back) {
                back.off('mouseup');
                back.css('display', value ? 'table-cell' : 'none');

                if (value)
                    back.on('mouseup', _.bind(this.onBackClick, this));
            }
        },

        getCanBack: function() {
            return this.canBack;
        },

        onBackClick: function(e) {
            if (e.which == 3) { // right button click
                Common.UI.Menu.Manager.hideAll();
                var me = this,
                    showPoint = [e.pageX, e.pageY],
                    menuContainer = $(this.el).find(Common.Utils.String.format('#menu-container-{0}',  this.gotoDocsMenu.id));
                if (!this.gotoDocsMenu.rendered) {
                    // Prepare menu container
                    if (menuContainer.length < 1) {
                        menuContainer = $(Common.Utils.String.format('<div id="menu-container-{0}" style="position: absolute; z-index: 10000;"><div class="dropdown-toggle" data-toggle="dropdown"></div></div>', this.gotoDocsMenu.id));
                        $(this.el).append(menuContainer);
                    }

                    this.gotoDocsMenu.render(menuContainer);
                    this.gotoDocsMenu.cmpEl.attr({tabindex: "-1"});
                }
                _.delay(function(){
                     menuContainer.css({
                        left: showPoint[0] - me.gotoDocsMenu.cmpEl.width(),
                        top : showPoint[1] + 3
                    });
                    me.gotoDocsMenu.show();
                },10);
            } else {
                Common.NotificationCenter.trigger('goback', e.which == 2);
                Common.component.Analytics.trackEvent('Back to Folder');
            }
        },

        textBack: 'Go to Documents',
        openNewTabText: 'Open in New Tab'
    }, Common.Views.Header || {}))
});
