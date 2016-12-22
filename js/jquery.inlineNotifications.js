// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined)
{
    "use strict";

    // undefined is used here as the undefined global variable in ECMAScript 3 is
    // mutable (ie. it can be changed by someone else). undefined isn't really being
    // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
    // can no longer be modified.

    // window and document are passed through as local variables rather than global
    // as this (slightly) quickens the resolution process and can be more efficiently
    // minified (especially when both are regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = 'inlineNotifications',
        defaults = {
            unreadNotificationsCount: 0,
            initialNotifications: [],
            pusherKey: undefined,
            pusherCluster: undefined,
            pusherAuthEndpoint: undefined,
            pusherUserChannel: undefined,
            pusherEvent: undefined,
            innerHTML: '<i class="oc-icon-notification"></i>',
            unreadNotificationsCountTemplate: '<span id="notifications-count"></span>',
            notificationTemplate: '<dt><span class="time-wrapper clearfix"><i class="mark-as fa pull-right"></i><i class="oc-icon-clock"></i><time></time></span><div class="text"></div></dt>',
            plainElementTemplate: '<dd></dd>',
            loaderTemplate: '<dd class="loader-wrapper"><i class="fa fa-cog fa-spin hide"></i><span class="load-more"></span></dd>',
            serviceUrl: undefined,
            markAsOnClick: undefined,
            onSlimScrollBottom: undefined
        };

    // The actual plugin constructor
    function Plugin(element, options)
    {
        this.element = $(element);

        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin.
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts.
    $.extend(Plugin.prototype, {
        /**
         * Initialize plugin.
         */
        init: function ()
        {
            if (typeof $.fn.timeago === 'undefined') {
                console.log('timeago was not found! The inlineNotifications plugin will not work properly!');
            }

            if (typeof $.fn.slimScroll === 'undefined') {
                console.log('slimScroll was not found! The inlineNotifications plugin will not work properly!');
            }

            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like the example below.
            this.initSettings();
            this.initElement();
            this.initTooltipster();
            this.initPusher();
        },
        /**
         * Initialize settings.
         */
        initSettings: function ()
        {
            // Initialize the notifications list.
            this.settings.notificationsElement = this.settings.notificationsElement || $('<dl id="notifications">');

            // Initialize the mark as onclick handler.
            this.settings.markAsOnClick = this.settings.markAsOnClick || this.markAsOnClick;

            // Initialize the tooltipster content on scroll handler.
            this.settings.onSlimScrollBottom = this.settings.onSlimScrollBottom || this.onSlimScrollBottom;

            // Initialize the timeago translations.
            $.timeago.settings.strings = $.extend({}, $.timeago.settings.strings, {
                prefixAgo: getLabel('timeagoPrefixAgo'),
                prefixFromNow: getLabel('timeagoPrefixFromNow'),
                suffixAgo: getLabel('timeagoSuffixAgo'),
                suffixFromNow: getLabel('timeagoSuffixFromNow'),
                inPast: getLabel('timeagoInPast'),
                seconds: getLabel('timeagoSeconds'),
                minute: getLabel('timeagoMinute'),
                minutes: getLabel('timeagoMinutes'),
                hour: getLabel('timeagoHour'),
                hours: getLabel('timeagoHours'),
                day: getLabel('timeagoDay'),
                days: getLabel('timeagoDays'),
                month: getLabel('timeagoMonth'),
                months: getLabel('timeagoMonths'),
                year: getLabel('timeagoYear'),
                years: getLabel('timeagoYears'),
            });
        },
        /**
         * Initialize element.
         */
        initElement: function ()
        {
            var notificationsElement = this.settings.notificationsElement;
            var initialNotifications = this.settings.initialNotifications;

            // Set notifications count from initial notifications length.
            this.notificationsCount = this.settings.initialNotifications.length;

            // Add the count to the notifications button.
            this.element.append(this.settings.innerHTML);

            // Initialize unreal notifications count.
            this.incrementUnreadNotificationsCount(0);

            // Initialize the loader wrapper.
            this.loaderWrapper = $(this.settings.loaderTemplate);

            // Add notifications to notification wrapper.
            if (initialNotifications.length) {
                for (var i in initialNotifications) {
                    this.appendNotification(initialNotifications[i]);
                }
            } else {
                // Hide the loader wrapper if there are no notifications in the list.
                this.loaderWrapper.addClass('hide');
                // Add a message if there are no notifications in the list.
                this.noContentElement = $(this.settings.plainElementTemplate).html(getLabel('noNotifications'));
                notificationsElement.append(this.noContentElement);
            }

            // Add the load more wrapper.
            this.loaderWrapper.find('.load-more').text(getLabel('loadMoreNotifications')).on('click', function ()
            {
                // Trigger the slimscroll when the load more button is pressed.
                notificationsElement.trigger('slimscroll', ['bottom']);
            });
            notificationsElement.append(this.loaderWrapper);
        },
        /**
         * Initialize the notifications tooltip.
         */
        initTooltipster: function ()
        {
            if (typeof $.fn.tooltipster === 'undefined') {
                console.log('tooltipster was not found! The inlineNotifications plugin will not work properly!');
            }

            var plugin = this;
            var notificationsElement = this.settings.notificationsElement;

            this.tooltipster =  this.element.tooltipster({
                plugins: ['sideTip', 'scrollableTip'],
                contentAsHTML: true,
                theme: 'tooltipster-borderless',
                trigger: 'click',
                side: ['bottom'],
                minWidth: 300,
                maxWidth: 300,
                interactive: true,
                trackOrigin: true,
                trackTooltip: true,
                functionInit: function (instance, helper)
                {
                    // Call the 'content' method to update the content of our tooltip with the returned data.
                    instance.content(notificationsElement);
                },
                functionReady: function (instance, helper)
                {
                    // This is necessary for the timeago plugin to work.
                    plugin.refreshTimeago();
                }
            }).tooltipster('instance');

            $(window).resize(function ()
            {
                plugin.destroySlimScroll();
            });

            this.tooltipster.on('repositioned', function (event)
            {
                plugin.initializeSlimScroll();
            });
        },
        /**
         * Initialize Pusher.
         */
        initPusher: function ()
        {
            if (typeof Pusher === 'undefined') {
                console.log('Pusher was not found! The inlineNotifications plugin will not work properly!');
            }

            // Do not initialize Pusher if not all the details are set.
            if (typeof Pusher == 'undefined' || !this.settings.pusherKey || !this.settings.pusherCluster ||
                !this.settings.pusherAuthEndpoint || !this.settings.pusherUserChannel || !this.settings.pusherEvent) {
                return;
            }

            var plugin = this;

            // Initialize Pusher.
            var pusher = new Pusher(this.settings.pusherKey, {
                cluster: this.settings.pusherCluster,
                authEndpoint: this.settings.pusherAuthEndpoint
            });

            // Subscribe to user channel.
            var channel = pusher.subscribe(this.settings.pusherUserChannel);

            // Listen to event.
            channel.bind(this.settings.pusherEvent, function(notification)
            {
                plugin.destroySlimScroll();

                plugin.prependNotification(notification);

                // If read == 0, update the unread notifications count.
                1 == notification['read'] || plugin.incrementUnreadNotificationsCount(1);

                // Increase the notifications count.
                plugin.notificationsCount++;

                plugin.initializeSlimScroll();
            });
        },
        /**
         * Initialize notification and return jQuery object of notification.
         *
         * @param object notification
         * @returns jQuery
         */
        initNotification: function (notification)
        {
            var notificationElement = $(this.settings.notificationTemplate);
            var isRead = parseInt(notification['read']);
            var markAsData = {
                plugin: this,
                notificationElement: notificationElement
            };

            notificationElement.addClass(isRead ? 'read' : 'unread').data({
                instance_id: notification['instance_id'],
                is_read: isRead
            });

            if (typeof this.noContentElement !== 'undefined') {
                this.noContentElement.remove();
            }

            notificationElement.find('time').attr('datetime', notification['time']).timeago();
            notificationElement.find('.text').html(notification['text']);
            notificationElement.find('.mark-as').addClass(isRead ? 'fa-circle-o' : 'fa-circle').on('click.' + pluginName, markAsData, this.settings.markAsOnClick);

            return notificationElement;
        },
        /**
         * Append notification to the notifications list.
         *
         * @param object notification
         */
        appendNotification: function (notification)
        {
            if (this.settings.notificationsElement.find(this.loaderWrapper).length) {
                // Add before the loader wrapper.
                this.loaderWrapper.before(this.initNotification(notification));
            } else {
                // Just add after the last element in the notifications wrapper.
                this.settings.notificationsElement.append(this.initNotification(notification));
            }

            // This is necessary for the timeago plugin to work properly.
            this.refreshTimeago();
        },
        /**
         * Append notification to the notifications list.
         *
         * @param object notification
         */
        prependNotification: function (notification)
        {
            this.settings.notificationsElement.prepend(this.initNotification(notification));

            // This is necessary for the timeago plugin to work.
            this.refreshTimeago();
        },
        /**
         * Refresh timeago objects.
         * This is necessary for the timeago plugin to work properly.
         */
        refreshTimeago: function ()
        {
            this.settings.notificationsElement.find('time').timeago('updateFromDOM');
        },
        /**
         * Mark as onclick event handler.
         *
         * @param object event
         */
        markAsOnClick: function (event)
        {
            var plugin = event.data.plugin;
            var notificationElement = event.data.notificationElement;
            var read = !notificationElement.data('is_read');
            var button = $(this);
            var isClicked = button.data('is_clicked');

            // Do not make a new request if another one was already triggered by pressing the same button.
            if (isClicked) {
                return;
            }

            // Mark as clicked.
            button.data('is_clicked', true);

            $.ajax({
                url: plugin.settings.serviceUrl,
                method: 'post',
                dataType: 'json',
                data: {
                    action: 'notification_mark_as',
                    instance_id: notificationElement.data('instance_id'),
                    read:  read
                }
            }).done(function (data)
            {
                // Remove is_clicked mark.
                button.data('is_clicked', null);

                if ('success' == data.status) {
                    plugin.markAs(notificationElement, read);
                } else if ('error' == data.status) {
                    alert(data.error_msg);
                }
            });
        },
        /**
         * Mark notification as read/unread.
         *
         * @param jQuery notificationElement
         * @param int read
         */
        markAs: function (notificationElement, read)
        {
            notificationElement.toggleClass('read').toggleClass('unread').data('is_read', read);
            notificationElement.find('.mark-as').toggleClass('fa-circle').toggleClass('fa-circle-o');

            // If we are marking the notification as read,
            // then we are substracting 1 from the total count
            // else we add 1.
            this.incrementUnreadNotificationsCount(read ? -1 : 1);
        },
        /**
         * Increment unread notifications count.
         *
         * @param int add
         */
        incrementUnreadNotificationsCount: function (step)
        {
            // Create the unread notifications count element
            // and append it to the inlineNotifications element.
            if (typeof this.unreadNotificationsCountElement == 'undefined') {
                this.unreadNotificationsCountElement = $(this.settings.unreadNotificationsCountTemplate);
                this.element.append(this.unreadNotificationsCountElement);
            }

            // Update the count.
            this.settings.unreadNotificationsCount += step;

            if (this.settings.unreadNotificationsCount > 0) {
                // Display the unread notifications count element and set the new count.
                this.unreadNotificationsCountElement.text(this.settings.unreadNotificationsCount).show();
            } else {
                // Hide the unread notifications count element.
                this.unreadNotificationsCountElement.hide();
            }
        },
        /**
         * Initialize Slim Scroll.
         */
        initializeSlimScroll: function ()
        {
            // 1st destroy the current Slim Scroll.. if initialized.
            this.destroySlimScroll();

            // Initialize Slim Scroll.
            this.settings.notificationsElement.slimScroll({
                height: 'auto',
                color: '#fff',
                alwaysVisible: true,
                touchScrollStep: 40
            }).on('slimscroll', {plugin: this}, this.settings.onSlimScrollBottom);
        },
        /**
         * Destroy slim scroll.
         */
        destroySlimScroll: function ()
        {
            var notificationsElement = this.settings.notificationsElement;

            notificationsElement.slimScroll({destroy: true});
            notificationsElement[0].style.width = null;
            notificationsElement[0].style.height = null;
            notificationsElement[0].style.overflow = null;
        },
        /**
         * Handler for slimscroll, to load more notifications.
         *
         * @param object event
         */
        onSlimScrollBottom: function(event, position)
        {
            if ('bottom' !== position) {
                return;
            }

            var plugin = event.data.plugin;
            var elem = $(this);
            var isTriggered = elem.data('is_triggered');

            // Do not make another request until the existing one is not complete.
            if (isTriggered) {
                return;
            }

            // Mark as triggered.
            elem.data('is_triggered', true);

            // Toggle loader.
            plugin.tooltipToggleLoader();

            $.ajax({
                url: plugin.settings.serviceUrl,
                method: 'post',
                dataType: 'json',
                data: {
                    action: 'notifications_load_more',
                    current_count: plugin.notificationsCount
                }
            }).done(function (data)
            {
                // Remove is_triggered mark.
                elem.data('is_triggered', null);

                // Toggle loader.
                plugin.tooltipToggleLoader();

                if ('success' == data.status && data.notifications.length) {
                    plugin.destroySlimScroll();

                    for (var i in data.notifications) {
                        plugin.appendNotification(data.notifications[i]);

                        // Increase the notifications count.
                        plugin.notificationsCount++;
                    }

                    plugin.initializeSlimScroll();
                } else if ('error' == data.status) {
                    alert(data.error_msg);
                }
            });
        },
        /**
         * Toggle loader.
         */
        tooltipToggleLoader: function ()
        {
            // Display the loader wrapper if it was hidden and show/hide loader animation.
            this.loaderWrapper.find('i').toggleClass('hide');
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations.
    $.fn[pluginName] = function (options)
    {
        return this.each(function ()
        {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
            }
        });
    };

})(jQuery, window, document);
