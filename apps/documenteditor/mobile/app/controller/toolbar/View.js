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
Ext.define('DE.controller.toolbar.View', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            viewToolbar         : 'viewtoolbar',
            searchToolbar       : 'searchtoolbar',
            doneButton          : '#id-tb-btn-view-done',
            editModeButton      : '#id-tb-btn-editmode',
            readModeButton      : '#id-tb-btn-readable',
            searchButton        : '#id-tb-btn-search',
            fullscreenButton    : '#id-tb-btn-fullscreen',
            shareButton         : '#id-tb-btn-view-share',
            incFontSizeButton   : '#id-tb-btn-incfontsize',
            decFontSizeButton   : '#id-tb-btn-decfontsize'
        },

        control: {
            doneButton      : {
                tap         : 'onTapDoneButton'
            },
            editModeButton  : {
                tap         : 'onTapEditModeButton'
            },
            searchButton    : {
                tap         : 'onTapSearchButton'
            },
            readModeButton  : {
                tap         : 'onTapReaderButton'
            },
            shareButton     : {
                tap         : 'onTapShareButton'
            },
            incFontSizeButton: {
                tap         : 'onTapIncFontSizeButton'
            },
            decFontSizeButton: {
                tap         : 'onTapDecFontSizeButton'
            }
        },

        searchMode      : false,
        fullscreenMode  : false,
        readableMode    : false
    },

    init: function() {
        this.control({
            fullscreenButton: {
                tap: Ext.Function.createBuffered(this.onTapFullscreenButton, 500, this)
            }
        });
    },

    launch: function() {
        this.callParent(arguments);

        Common.Gateway.on('init',           Ext.bind(this.loadConfig, this));
        Common.Gateway.on('opendocument',   Ext.bind(this.loadDocument, this));
        Common.Gateway.on('applyeditrights',Ext.bind(this.onApplyEditRights, this));
    },

    initControl: function() {
        this.callParent(arguments);
    },

    initApi: function() {
        //
    },

    setApi: function(o){
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onTapEvent',                 Ext.bind(this.onSingleTapDocument, this));
            this.api.asc_registerCallback('asc_onCoAuthoringDisconnect',    Ext.bind(this.onCoAuthoringDisconnect, this));
        }
    },

    loadConfig: function(data) {
        var doneButton = this.getDoneButton();

        if (doneButton && data && data.config && data.config.canBackToFolder !== false &&
            data.config.customization && data.config.customization.goback && data.config.customization.goback.url){
            this.gobackUrl = data.config.customization.goback.url;
            doneButton.show();
        }
    },

    loadDocument: function(data) {
        var permissions = {};
        if (data.doc) {
            permissions = Ext.merge(permissions, data.doc.permissions);

            var editModeButton = this.getEditModeButton();

            if (editModeButton)
                editModeButton.setHidden(permissions.edit === false);
        }
    },

    onApplyEditRights: function(data) {
        Ext.Viewport.unmask();

        if (data && data.allowed) {
            var mainController = this.getApplication().getController('tablet.Main');

            if (this.getReadableMode())
                this.setReadableMode(false);

            if (this.getFullscreenMode())
                this.setFullscreenMode(false);

            if (mainController)
                mainController.setMode('edit');
        } else {
            var editModeButton = this.getEditModeButton();

            editModeButton && editModeButton.hide();

            Ext.Msg.show({
                title: this.requestEditFailedTitleText,
                message: (data && data.message) || this.requestEditFailedMessageText,
                icon: Ext.Msg.INFO,
                buttons: Ext.Msg.OK
            });
        }
    },

    applySearchMode: function(search){
        if (!Ext.isBoolean(search)) {
            Ext.Logger.error('Invalid parameters.');
        } else {
            var me              = this,
                searchToolbar   = me.getSearchToolbar(),
                searchButton    = me.getSearchButton();

            if (searchToolbar) {
                if (search) {
                    searchButton && searchButton.addCls('x-button-pressing');

                    if (me.getFullscreenMode()) {
                        searchToolbar.show({
                            easing: 'ease-out',
                            preserveEndState: true,
                            autoClear: false,
                            from: {
                                opacity : 0.3
                            },
                            to: {
                                opacity : 0.9
                            }
                        });
                    } else {
                        searchToolbar.show();
                    }
                } else {
                    searchButton && searchButton.removeCls('x-button-pressing');

                    if (me.getFullscreenMode()) {
                        searchToolbar.hide({
                            easing: 'ease-in',
                            to: {
                                opacity : 0.3
                            }
                        });
                    } else {
                        searchToolbar.hide();
                    }
                }
            }
            return search;
        }
    },

    applyFullscreenMode: function(fullscreen) {
        if (!Ext.isBoolean(fullscreen)) {
            Ext.Logger.error('Invalid parameters.');
        } else {
            var viewToolbar     = this.getViewToolbar(),
                searchToolbar   = this.getSearchToolbar(),
                fullscreenButton= this.getFullscreenButton(),
                popClipCmp      = Ext.ComponentQuery.query('popclip');

            if (popClipCmp.length > 0) {
                popClipCmp[0].hide();
            }

            if (viewToolbar && searchToolbar) {
                if (fullscreen) {
                    fullscreenButton && fullscreenButton.addCls('x-button-pressing');

                    viewToolbar.setStyle({
                        position    : 'absolute',
                        left        : 0,
                        top         : 0,
                        right       : 0,
                        opacity     : 0.9,
                        'z-index'   : 17
                    });

                    searchToolbar.setStyle({
                        position    : 'absolute',
                        left        : 0,
                        top         : '44px',
                        right       : 0,
                        opacity     : 0.9,
                        'z-index'   : 16
                    });

                    this.setHiddenToolbars(true);
                } else {
                    viewToolbar.setStyle({
                        position    : 'initial',
                        opacity     : 1
                    });
                    searchToolbar.setStyle({
                        position    : 'initial',
                        opacity     : 1
                    });

                    viewToolbar.setDocked('top');
                    searchToolbar.setDocked('top');
                }
            }

            return fullscreen;
        }
    },

    applyReadableMode: function(readable) {
        if (!Ext.isBoolean(readable)) {
            Ext.Logger.error('Invalid parameters.');
        } else {
            var searchButton        = this.getSearchButton(),
                incFontSizeButton   = this.getIncFontSizeButton(),
                decFontSizeButton   = this.getDecFontSizeButton(),
                readModeButton      = this.getReadModeButton(),
                popClipCmp          = Ext.ComponentQuery.query('popclip'),
                shareButton         = this.getShareButton();

            if (popClipCmp.length > 0) {
                popClipCmp[0].hide();
            }

            if (readable) {
                this.getSearchMode() && this.setSearchMode(false);
                readable && readModeButton && readModeButton.addCls('x-button-pressing');

                searchButton      && searchButton.hide();
                incFontSizeButton && incFontSizeButton.show();
                decFontSizeButton && decFontSizeButton.show();
                shareButton       && shareButton.setDisabled(true);
            } else {
                incFontSizeButton && incFontSizeButton.hide();
                decFontSizeButton && decFontSizeButton.hide();
                searchButton      && searchButton.show();
                shareButton       && shareButton.setDisabled(false);
            }

            this.api && this.api.ChangeReaderMode();

            return readable;
        }
    },

    setHiddenToolbars: function(hide) {
        var viewToolbar     = this.getViewToolbar(),
            searchToolbar   = this.getSearchToolbar();

        if (viewToolbar && searchToolbar){
            if (hide){
                viewToolbar.hide({
                    easing  : 'ease-out',
                    from    : {opacity : 0.9},
                    to      : {opacity : 0}
                });
                searchToolbar.hide({
                    easing  : 'ease-out',
                    from    : {opacity : 0.9},
                    to      : {opacity : 0}
                });
            } else {
                viewToolbar.show({
                    preserveEndState: true,
                    easing  : 'ease-in',
                    from    : {opacity : 0},
                    to      : {opacity : 0.9}
                });
                this.getSearchMode() && searchToolbar.show({
                    preserveEndState: true,
                    easing  : 'ease-in',
                    from    : {opacity : 0},
                    to      : {opacity : 0.9}
                });
            }
        }
    },

    onTapDoneButton: function() {
        if (this.gobackUrl) window.parent.location.href = this.gobackUrl;
    },

    onTapEditModeButton: function() {
        Ext.Viewport.mask();
        Common.Gateway.requestEditRights();
    },

    onTapReaderButton: function() {
        this.setReadableMode(!this.getReadableMode());
    },

    onTapSearchButton: function(btn) {
        this.setSearchMode(!this.getSearchMode());
    },

    onTapFullscreenButton: function(btn) {
        this.setFullscreenMode(!this.getFullscreenMode());
    },

    onTapShareButton: function() {
        this.api && this.api.asc_Print();
        Common.component.Analytics.trackEvent('ToolBar View', 'Share');
    },

    onSingleTapDocument: function() {
        var viewToolbar = this.getViewToolbar();

        if (viewToolbar && this.getFullscreenMode()) {
            this.setHiddenToolbars(!viewToolbar.isHidden());
        }
    },

    onCoAuthoringDisconnect: function() {
        var editModeButton = this.getEditModeButton();
        editModeButton && editModeButton.setHidden(true);
    },

    onTapIncFontSizeButton: function() {
        this.api && this.api.IncreaseReaderFontSize();
    },

    onTapDecFontSizeButton: function() {
        this.api && this.api.DecreaseReaderFontSize();
    },

    requestEditFailedTitleText  : 'Access denied',
    requestEditFailedMessageText: 'You can\'t edit the document right now. Please try again later.'
});