var IEVersion = false;
if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){ //test for MSIE x.x;
	IEVersion = new Number(RegExp.$1) // capture x.x portion and store as a number
}

var presentationsLoading = false;

function loadMorePresentations()
{	
	if (presentationsLoading) {
        return;
    }
    
    var presentationsList = $('#presentations-list');
	var displayedElementsCount =  presentationsList.find('.agenda-item').length;
    if(presentationsCount) {
       presentationsCount = presentationsCount;
    }
    else {
        var  presentationsCount = "0";
    }
	if (displayedElementsCount < presentationsCount) {
		presentationsLoading = true;
        
        $.ajax({
            url: $('#toggle-presentations').attr('href'),
            data: {
                ajax: 1, 
                start: displayedElementsCount,
                all: $('#toggle-presentations').data('toggle') == 'all' ? 0 : 1,
                lastDisplayedGroupItem: lastGroupItem
            },
        }).done(function (data)
        {
            var data = $(data);

			// Add agenda items to list and refresh list view.
            presentationsList.append(data);
            
            data.find('.agenda-img').each(function () 
            {
                initAgendaProgress(this);
            });
            
		 	presentationsLoading = false;
		});
	}
}

//rewrites the email addresses so they can't be read by the bots
function writeEmailAddress(domain, user, tld, extra, boxId, title){
	if(typeof(title) == 'undefined' || title == '') title = user+'@'+domain+'.'+tld;
	var html = '<a href="mai'+'lto:'+user+'@'+domain+'.'+tld+'" '+extra+'>'+title+'</'+'a>';
	if(typeof(boxId) == 'undefined') document.write(html);
	else document.getElementById(boxId).innerHTML = html;
}


$('.refresh').bind('click', function(e){
	//window.location.reload();
	window.location.reload(true);
});

function refreshPresentationPage() {
	window.location.reload(true);
}

function stripURLSegment(URLSegment)
{
    var URLSegment = jQuery.trim(URLSegment.replace('/', '-'));
    return URLSegment == '-' ? '_' : URLSegment;
}

function drawAgendaItemProgress(el, duration, eta, etaEl)
{
    // The element was removed.
    if (!el.closest('body').length) {
        return;
    }
    
    // This will be called once every second, 
    // so decrement the elapsed time with 1 second.
    if (eta > 0) {
        eta -= 1;
    }

    if (eta > duration) {
        // The event has not started yet.
        var progress = 0;
    } else {
        // The event has started and is in progress.
        var progress = ((duration - eta) / duration) * 100;
    }

    var r = etaEl.attr('r');
    var c = Math.PI * r * 2;

    var pct = ((100 - progress) / 100) * c;

    etaEl.css('stroke-dashoffset', pct);
    
    // Refresh the progress once every second.
    if (eta > 0) {
        setTimeout(function () 
        { 
            drawAgendaItemProgress(el, duration, eta, etaEl);
        }, 1000);
    }
}

function initAgendaProgress(el)
{
    var el = $(el);
    var svg = el.find('svg');
    var etaEl = svg.find('.agenda-item-progress-eta');
    
    drawAgendaItemProgress(el, svg.data('duration'), svg.data('eta'), etaEl);
}

function resizeSvgCircle(circle, radius)
{
    var dashArrayInit = circle.attr('stroke-dasharray');
    var dashOffsetInit = circle.css('stroke-dashoffset');
    var dashArray = radius * 2 * Math.PI;
    var dashOffset = (dashOffsetInit * dashArray) / dashArrayInit;

    circle.attr('r', radius);
    circle.attr('stroke-dasharray', dashArray);
    circle.css('stroke-dashoffset', dashOffset);
}

function resizeSvg() 
{
    if (typeof window.innerWidth != 'undefined') {
        var viewPortWidth = window.innerWidth;
    } else {
        var viewPortWidth = $('body').outerWidth();
    } 

    $('.agenda-item-progress').each(function () 
    {
        var svg = $(this);
        var etaEl = svg.find('.agenda-item-progress-eta');
        var bgEl = svg.find('.agenda-item-progress-bg');

        if (768 > viewPortWidth) {
            resizeSvgCircle(etaEl, 44.5);
            resizeSvgCircle(bgEl, 42.5);
        } else {
            resizeSvgCircle(etaEl, 49.5);
            resizeSvgCircle(bgEl, 47.5);
        }
    });
}

jQuery(function ($) 
{
    var searchTimer;
	
	$(window).bind('scroll', function () 
	{
		
    if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10 && localStorage.nextPageLink != null) {
			   getAjaxMoreUsers(localStorage.nextPageLink); //alert(localStorage.nextPageLink)
		}  
	});
    
    // Disable the form submit if we press the enter key inside the input.
    $('#users-filter').on('keydown', function (e) 
    {
        if (13 == e.which || 13 == e.keyCode) {
            e.preventDefault();
        }
    });
	
	$('#users-filter').on('keyup', function () 
	{
		var q = stripURLSegment($(this).val());
		    
		searchTimer && clearTimeout(searchTimer);
		searchTimer = setTimeout(function () 
		{
			lastLetter = '';
      //alert(q)
      //alert(currentPageLink);
			//getAjaxUsers(currentPageLink + (q != '' ? 'q-' + stripURLSegment(q) : ''));
      getuserbyajax(q);
		}, 500);
	});
  
  //code starts here from Rahul
  //function to get users by ajax request
  function getuserbyajax(q)
  {
      jQuery(document).ready(function($)
      {
      var add_url = $('.is_friend').val();
      var main_url = localStorage.url + 'user-add-friend/-/OCintranet-'+localStorage.event_id+'/'+add_url+'/q-'+q+'?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
      //alert(main_url);
      jQuery.ajax({
          url: main_url,
          dataType: "json",
          method: "GET",
          success: function(obj) {
             showcommoncontacts(obj);
            
          }
          }); 
          });
  }
	//code ends here from Rahul
	/**
	 * Method used to replace the current users with new loaded users. 
	 * 
	 * @param string link
	 */
	function getAjaxUsers(link) 
    {	
		var usersListContainer = $('#friends-content-container');
		
		if (usersListContainer.hasClass('ni_loading')) {
            return false;
        }
		
		history.pushState(null, null, link);
		
		usersListContainer.addClass('ni_loading');
		
		$.ajax({
			type: 'POST',
			url: link,
			data: {
                is_ajax: 1
            },
			success: function (html) 
            {
				html = $(html).hide();
				usersListContainer.replaceWith(html);
				html.trigger('create').fadeIn('fast');
				usersListContainer.removeClass('ni_loading');
			}
		});
	}
	
	/**
	 * Method used to load more users and add them to the users list.
	 * 
	 * @param string link
	 */
	function getAjaxMoreUsers(link) 
	{
		/*var usersList = $('.friends-items-container');
		
		if (usersList.hasClass('ni_loading')) {
            return false;
        }
		
		history.pushState(null, null, link);
		
		usersList.addClass('ni_loading'); */
    //history.pushState(null, null, link);
		 //alert(link)
     var main_url = localStorage.url + "user-add-friend/-/OCintranet-" + localStorage.event_id + "/p-"+localStorage.nextPageLink+"?gvm_json=1";
		$.ajax({
			type: 'POST',
			url: main_url,
      datatype:'json',
			success: function (obj) 
      {
				 showcommoncontacts(obj,'yes'); 
         localStorage.nextPageLink = Number(localStorage.nextPageLink) + Number(1);
         //alert(localStorage.nextPageLink)       
			}
		});
	}
    
    $('#toggle-presentations').on('click', function (e) 
    {
        e.preventDefault();
        
        if (presentationsLoading) {
            return;
        }
        
        var el = $(this);
        var presentationsList = $('#presentations-list');

        var agendaItems = presentationsList.find('.agenda-item');
        var type = el.data('type');
        
        el.find('span').html('all' === type ? keywords.seeCurrent : keywords.seeAll);
        el.data('type', 'all' === type ? 'current' : 'all');

        // Remove all agenda items.
        agendaItems.remove();

        presentationsLoading = true;
        
        // Load agenda items.
        $.ajax({
            url: el.attr('href'),
            data: {
                ajax: 1,
                all: 'all' === type ? 1 : 0
            },
        }).done(function (data)
        {
            var data = $(data);
            
            // Add agenda items to list and refresh list view.
            presentationsList.empty().append(data);
            
            data.find('.agenda-img').each(function () 
            {
                initAgendaProgress(this);
            });
            
            presentationsLoading = false;
        });
    });
    
    var agendaContainer = $('.agenda-container');
    
    // !! put intentionally.
    // Google "javascript not not".
    if (!!agendaContainer.length) {
        $(window).bind('scroll', function () 
        {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
                loadMorePresentations();
            }
        });
    }
    
    $('.agenda-img').each(function () 
    {
        initAgendaProgress(this);
    });
    
    resizeSvg();
    $(window).resize(function () 
    {
        resizeSvg();
    });
});