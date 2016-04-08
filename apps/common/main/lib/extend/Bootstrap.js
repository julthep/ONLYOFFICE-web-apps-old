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
 *  Bootstrap.js
 *
 *  Created by Alexander Yuzhin on 5/27/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

function onDropDownKeyDown(e) {
    var $this       = $(this),
        $parent     = $this.parent(),
        beforeEvent = jQuery.Event('keydown.before.bs.dropdown'),
        afterEvent  = jQuery.Event('keydown.after.bs.dropdown');

    $parent.trigger(beforeEvent);

    if ($parent.hasClass('no-stop-propagate') && arguments.length>1 && arguments[1] instanceof jQuery.Event) {
        e = arguments[1];
        if ( /^(38|40|27|13|9)$/.test(e.keyCode) && !e.ctrlKey && !e.altKey) {
            patchDropDownKeyDownAdditional.call(this, e);
            e.preventDefault();
            e.stopPropagation();
        }
    } else if ( !$parent.hasClass('no-stop-propagate') || /^(38|40|27|13|9)$/.test(e.keyCode) && !e.ctrlKey && !e.altKey) {
        patchDropDownKeyDown.call(this, e);
        e.preventDefault();
        e.stopPropagation();
    }

    $parent.trigger(afterEvent);
}

function patchDropDownKeyDown(e) {
    if (!/(38|40|27|37|39)/.test(e.keyCode)) return;

    var $this = $(this);

    e.preventDefault();
    e.stopPropagation();

    if ($this.is('.disabled, :disabled')) return;

    var $parent  = getParent($this);
    var isActive = $parent.hasClass('open') || $parent.hasClass('over');

    if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) {
            $items = $('[role=menu] li.dropdown-submenu.over:visible', $parent);
            if ($items.size()) {
                $items.eq($items.size()-1).removeClass('over');
                return false;
            } else if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over')) {
                $parent.removeClass('over');
                $parent.find('> a').focus();
            } else {
                $parent.find('[data-toggle=dropdown]').focus();
            }
        }
        return (isActive) ? $this.click() : undefined;
    }

//    var $items = $('[role=menu] li:not(.divider):visible a', $parent)   - original search function
    var $items = $('> [role=menu] > li:not(.divider):not(.disabled):visible', $parent).find('> a');

    if (!$items.length) return;

    var index = $items.index($items.filter(':focus'));
    if (e.keyCode == 39) {     // right
        if (index<0) return;

        var li = $items.eq(index).parent();
        if (li.hasClass('dropdown-submenu') && !li.hasClass('over')) {// open submenu and select first <li> item
            li.mouseenter();
            li.addClass('focused-submenu');
             _.delay(function() {
                 var mnu = $('> [role=menu]', li),
                    $subitems = mnu.find('> li:not(.divider):not(.disabled):visible > a'),
                    focusIdx = 0;
                 if (mnu.find('> .menu-scroll').length>0) {
                    var offset = mnu.scrollTop();
                    for (var i=0; i<$subitems.length; i++) {
                        if ($subitems[i].offsetTop > offset) {
                            focusIdx = i; break;
                        }
                    }
                }
                if ($subitems.length>0)
                    $subitems.eq(focusIdx).focus();
            }, 250);
        }
    } else if (e.keyCode == 37) {     // left
        if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over')) { // close submenu
            $parent.removeClass('over');
            $parent.find('> a').focus();
        }
    } else {
        if (e.keyCode == 38) { index > 0 ? index-- : ($this.hasClass('no-cyclic') ? (index = 0) : (index = $items.length - 1));} else         // up
        if (e.keyCode == 40) { index < $items.length - 1 ? index++ : ($this.hasClass('no-cyclic') ? (index = $items.length - 1) : (index = 0));}              // down
        if (!~index) index=0;
        if ($parent.hasClass('dropdown-submenu') && $parent.hasClass('over'))
            $parent.addClass('focused-submenu'); // for Safari. When focus go from parent menuItem to it's submenu don't hide this submenu

        $items.eq(index).focus();
    }
}

function patchDropDownKeyDownAdditional(e) { // only for formula menu when typing in cell editor
    if (!/(38|40|27|37|39)/.test(e.keyCode)) return;

    var $this = $(this);

    e.preventDefault();
    e.stopPropagation();

    if ($this.is('.disabled, :disabled')) return;

    var $parent  = getParent($this);
    var isActive = $parent.hasClass('open') || $parent.hasClass('over');

    if (!isActive || (isActive && e.keyCode == 27)) {
        if (e.which == 27) 
            $parent.find('[data-toggle=dropdown]').focus();
        return (isActive) ? $this.click() : undefined;
    }

    var $items = $('> [role=menu] > li:not(.divider):not(.disabled):visible', $parent).find('> a');

    if (!$items.length) return;

    var index = $items.index($items.filter('.focus'));
    if (e.keyCode == 38) { index > 0 ? index-- : ($this.hasClass('no-cyclic') ? (index = 0) : (index = $items.length - 1));} else         // up
    if (e.keyCode == 40) { index < $items.length - 1 ? index++ : ($this.hasClass('no-cyclic') ? (index = $items.length - 1) : (index = 0));}              // down
    if (!~index) index=0;

    $items.removeClass('focus');
    $items.eq(index).addClass('focus');
}

function getParent($this) {
    var selector = $this.attr('data-target');

    if (!selector) {
        selector = $this.attr('href');
        selector = selector && /#/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
    }

    var $parent = selector && $(selector);

    return $parent && $parent.length ? $parent : $this.parent();
}

$(document)
    .off('keydown.bs.dropdown.data-api')
    .on('keydown.bs.dropdown.data-api', '[data-toggle=dropdown], [role=menu]' , onDropDownKeyDown);

/*
*      workaround closing menu by right click
* */
(function () {
    var eventsObj = $._data($(document).get(0), "events"), clickDefHandler;
    if (eventsObj && eventsObj.click) {
        eventsObj.click.every(function(e, i, a){
            if (/click/.test(e.type) && !e.selector && /bs\..+\.dropdown/.test(e.namespace)) {
                clickDefHandler = e.handler;
            }

            return !clickDefHandler;
        });
    }

    function onDropDownClick(e) {
        if ((e.which == 1 || e.which == undefined) && !!clickDefHandler) {
            clickDefHandler(e);
        }
    }

    if (!!clickDefHandler) {
        $(document)
            .off('click.bs.dropdown.data-api', clickDefHandler)
            .on('click.bs.dropdown.data-api', onDropDownClick);
    }
})();
/*
* */