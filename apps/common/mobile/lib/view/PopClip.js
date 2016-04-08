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
Ext.define('Common.view.PopClip', {
    extend: 'Ext.Container',
    alias: 'widget.popclip',

    requires: ([
        'Ext.Panel',
        'Ext.SegmentedButton'
    ]),

    config: {
        style   : 'position: absolute; z-index: 9090; background-color: transparent; width: 2px; height: 2px;'
    },

    initialize: function() {
        var me = this;

        me.popClipCmp = me.add({
            xtype   : 'panel',
            layout  : 'fit',
            ui      : 'settings',
            style   : 'padding: 1px;',
            hidden  : true,
            items   : [
                {
                    xtype   : 'container',
                    items   : [
                        {
                            xtype   : 'segmentedbutton',
                            style   : 'margin: 0',
                            ui      : 'base',
                            allowToggle: false,
                            items   : [
                                {
                                    id      : 'id-btn-popclip-cut',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.cutButtonText
                                },
                                {
                                    id      : 'id-btn-popclip-copy',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.copyButtonText
                                },
                                {
                                    id      : 'id-btn-popclip-paste',
                                    ui      : 'base',
                                    style   : 'font-size: 0.7em; border: 0; box-shadow: none;',
                                    cls     : 'text-offset-12',
                                    text    : this.pasteButtonText
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        this.callParent(arguments);
    },

    show: function(animation) {
        if (Ext.isDefined(this.isAnim))
            return;

        this.callParent(arguments);

        var popClip = this.popClipCmp;
        popClip.showBy(this, 'bc-tc?');
        popClip.hide();

        popClip.show();
        popClip.alignTo(this, 'bc-tc?');

        this.isAnim = true;

        Ext.Anim.run(popClip, 'pop', {
            out         : false,
            duration    : 250,
            easing      : 'ease-out',
            autoClear   : false
        });

        popClip.element.on('transitionend', function(){
            Ext.isDefined(this.isAnim) && delete this.isAnim;
        }, this, {single: true});
    },

    hide: function(animation) {
        var me = this;

        var safeHide = function(arguments) {
            if (Ext.isDefined(me.isAnim)) {
                Ext.defer(safeHide, 50, me, arguments);
            } else {
                Ext.bind(me.callParent, me, arguments);
                me.popClipCmp.hide();
            }
        };

        safeHide(arguments);
    },

    cutButtonText   : 'Cut',
    copyButtonText  : 'Copy',
    pasteButtonText : 'Paste'

});