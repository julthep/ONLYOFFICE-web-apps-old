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
Ext.define('DE.controller.tablet.panel.Spacing', {
    extend: 'Ext.app.Controller',

    config: {
        refs: {
            spacingPanel        : 'spacingpanel',
            navigateView        : '#id-spacing-navigate',
            spacingListView     : '#id-spacing-root',
            spacingValueListView: '#id-spacing-linespacing'
        },

        control: {
            spacingPanel: {
                show            : 'onSpacingPanelShow',
                hide            : 'onSpacingPanelHide'
            },
            navigateView: {
                push            : 'onSpacingListViewPush',
                pop             : 'onSpacingListViewPop',
                back            : 'onSpacingListViewBack'
            },
            spacingListView: {
                itemsingletap   : 'onSpacingListItemTap'
            },
            spacingValueListView: {
                itemsingletap   : 'onSpacingValueListItemTap'
            }
        },

        handleApiEvent  : false
    },

    init: function() {
    },

    launch: function() {
    },

    setApi: function(o) {
        this.api = o;

        if (this.api) {
            this.api.asc_registerCallback('asc_onParaSpacingLine', Ext.bind(this.onApiLineSpacing, this));
        }
    },

    onSpacingPanelShow: function(cmp) {
        this.setHandleApiEvent(true);

        // update ui data
        this.api && this.api.UpdateInterfaceState();
    },

    onSpacingPanelHide: function(cmp) {
        this.setHandleApiEvent(false);

        var navigateView = this.getNavigateView();

        if (navigateView) {
            if (Ext.isDefined(navigateView.getLayout().getAnimation().getInAnimation))
                navigateView.getLayout().getAnimation().getInAnimation().stop();

            if (Ext.isDefined(navigateView.getLayout().getAnimation().getOutAnimation))
                navigateView.getLayout().getAnimation().getOutAnimation().stop();

            navigateView.reset();

            var activeItem  = navigateView.getActiveItem(),
                panelHeight = this.getHeightById(activeItem && activeItem.id);

            cmp.setHeight(panelHeight);
        }
    },

    onSpacingListItemTap: function(cmp, index, target, record) {
        var navigateView = this.getNavigateView(),
            cmdId        = record.get('id');

        if (!Ext.isEmpty(cmdId)) {
            if (cmdId == 'id-linespacing-increaseindent') {
                this.api && this.api.IncreaseIndent();
                Common.component.Analytics.trackEvent('ToolBar', 'Indent');
            } else if (cmdId == 'id-linespacing-decrementindent') {
                this.api && this.api.DecreaseIndent();
                Common.component.Analytics.trackEvent('ToolBar', 'Indent');
            }
        }

        if (navigateView) {
            var cmpId = record.get('child');

            if (!Ext.isEmpty(cmpId)) {
                var childCmp = Ext.getCmp(cmpId);

                if (childCmp)
                    navigateView.push(childCmp);
            }
        }
    },

    onSpacingValueListItemTap: function(cmp, index, target, record) {
        var spacingVal      = parseFloat(record.get('setting')),
            LINERULE_AUTO   = 1;

        this.api && this.api.put_PrLineSpacing(LINERULE_AUTO, spacingVal);

        Common.component.Analytics.trackEvent('ToolBar', 'Line Spacing');
    },

    getHeightById: function(id){
        switch(id){
            case 'id-spacing-linespacing':  return 360;
            default:
            case 'id-spacing-root':         return 235;
        }
    },

    onSpacingListViewPush: function(cmp, view) {
        var parentCmp = cmp.getParent();

        if (parentCmp)
            parentCmp.setHeight(this.getHeightById(view.id));
    },

    onSpacingListViewPop: function(cmp, view) {
        //
    },

    onSpacingListViewBack: function(cmp) {
        var parentCmp = cmp.getParent(),
            activeItem = cmp.getActiveItem();

        if (parentCmp && activeItem) {
            parentCmp.setHeight(this.getHeightById(activeItem && activeItem.id));
        }
    },

    onApiLineSpacing: function(info) {
        if (this.getHandleApiEvent()) {
            if (Ext.isDefined(info)) {
                var spacingValueListView = this.getSpacingValueListView();

                if (spacingValueListView) {
                    if (info.get_Line() === null ||
                        info.get_LineRule() === null ||
                        info.get_LineRule() != 1) {

                        spacingValueListView.deselectAll();
                        return;
                    }

                    var line = info.get_Line();
                    if (Math.abs(line - 1.0) < 0.0001)
                        spacingValueListView.select(0);
                    else if (Math.abs(line - 1.15) < 0.0001)
                        spacingValueListView.select(1);
                    else if (Math.abs(line - 1.5) < 0.0001)
                        spacingValueListView.select(2);
                    else if (Math.abs(line - 2.0) < 0.0001)
                        spacingValueListView.select(3);
                    else if (Math.abs(line - 2.5) < 0.0001)
                        spacingValueListView.select(4);
                    else if (Math.abs(line - 3.0) < 0.0001)
                        spacingValueListView.select(5);
                    else
                        spacingValueListView.deselectAll();
                }
            }
        }
    }
});