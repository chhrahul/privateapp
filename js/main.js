
function setStars($btn, starsNum) 
{
	$btn.find('.rate-star').removeClass('active');
	$btn.find('.rate-star:lt(' + starsNum + ')').addClass('active');
}
 
function parseRate(rate) 
{
	var rate = parseInt(rate);
    rate = Math.max(rate, 1);
    rate = Math.min(rate, 5);
 
	return rate;
}

$(function ()
{
	// Initialize interaction buttons tooltips.
	$('.interaction-box').tooltip();

	// Init rate buttons
	$('.item-interaction-rate').each(function () 
    {
        var el = $(this);
		var rate = parseRate(el.data('ratevalue'));
		setStars(el, rate);
	});
 
	// Rate.
	$('.item-interaction-rate:not(.readonly) a').hover(function ()
    {
        var el = $(this);
		var rate = parseRate(el.data('rate'));
		setStars(el.closest('.item-interaction-rate'), rate);
	}, function ()
    {
        var el = $(this);
		var rate = parseRate(el.closest('.item-interaction-rate').data('ratevalue'));
		setStars(el.closest('.item-interaction-rate'), rate);
	});
 
    $('.item-interaction-rate a').on('click', function (e) 
    {	
        e.preventDefault();
	  });
    
	$('.item-interaction-rate:not(.readonly) a').on('click', function (e) 
    {	
        e.preventDefault();
        
        var el = $(this);
		var rate = parseRate(el.data('rate'));

		el.closest('.item-interaction-rate').data('ratevalue', rate);
	});
    
    $('#rate').on('click', function (e) 
    {
        e.preventDefault();
        
        var el = $(this);
        var ratingContainer = el.closest('.agenda-item-rating-container');
        var rate = ratingContainer.find('.item-interaction-rate');
        
        $.ajax({
            type: 'POST',
            url: actionUrl + '/submit/rating',
            data: {
                'rate': rate.data('ratevalue')
            },
            dataType: 'json',
            success: function (json)
            {
                ratingContainer.find('.after-rating-container').removeClass('hidden');
                
                // Display the response message.
                ratingContainer.find('.msg').empty()
                    .removeClass().addClass('msg ' + json.msg.classAttr)
                    .html(json.msg.text);
                 
                if (json.success) {
                    // Make the rating readonly.
                    rate.addClass('readonly');
                    // Display the comment form.
                    ratingContainer.find('.comment-form').removeClass('hidden');
                    // Remove the rate button.
                    el.remove();
                }
            }
        });
    });
    
    $('.send-comment').on('click', function (e) 
    {
        e.preventDefault();
        
        var el = $(this);
        var ratingContainer = el.closest('.agenda-item-rating-container');
        
        if (el.hasClass('send-btn')) {
            // The send button has been pressed.
            data = {
                'comment': $('.comment-input').val(),
                'status': 1
            };
        } else {
            // The cancel button has been pressed.
            data = {
                'status': 2
            };
        }
        
        $.ajax({
            type: 'POST',
            url: actionUrl + '/submit/comment',
            data: data,
            dataType: 'json',
            success: function (json)
            {
                // Display the response message.
                ratingContainer.find('.msg').empty()
                    .removeClass().addClass('msg ' + json.msg.classAttr)
                    .html(json.msg.text);
                 
                if (json.success) {
                    // Remove the comment form.
                    ratingContainer.find('.comment-form').remove();
                    if (!el.hasClass('send-btn')) {
                        // Remove the msg element.
                        ratingContainer.find('.msg').remove();
                    }
                }
            }
        });
    });

	$('.footer-menu-button').on('click',function ()
    {
		$('.footer-menu').toggleClass('footer-menu-inline');
	});

	$('.more-btn').on('click', function ()
    {	
		$('.footer-menu').toggleClass('footer-menu-open');
	});

	$('.dropdown-btn').on('click', function ()
    {
 		$('body').toggleClass('locked');

 		if ($('.footer-menu').hasClass('footer-menu-open')) {
 			$('.footer-menu').removeClass('footer-menu-open');
 		}
	});	

//	$('#rate').on('click', function ()
//    {
//		$(this).hide();
//		$('.after-rating-container').show();
//		$('.item-interactions').find('a').each(function ()
//        {
//            var el = $(this);
//			if(!el.hasClass('active')){
//				el.hide();
//			}
//		});
//	});
	$('.show-all-btn').on('click', function ()
    {
		$(this).hide();
		$('.show-friends-btn').show();

	});
	$('.show-friends-btn').on('click', function ()
    {
		$(this).hide();
		$('.show-all-btn').show();

	});

	$('.voting-content-item > ul > li > a, .voting-content-item > ul > li a.cancel , .voting-content-item > ul > li a.voting-toggle-btn').on('click', function (e)
    {
    alert('hi')
		e.preventDefault();
        
        var btn = $(this);
        var votingContentWrapper = $('.voting-content-wrapper');
        var isInactiveWrapper = votingContentWrapper.hasClass('inactive');
        var isClosedWrapper = votingContentWrapper.hasClass('closed');
        var isDisabledItem = btn.closest('li').hasClass('disabled');
        
		if (isInactiveWrapper || isClosedWrapper || isDisabledItem) {
			return false;
		}
        
		btn.closest('li:not(.active)').toggleClass('opened');
	});

	$('.voting-content-item > ul > li .voting-toggle-btn').on('click', function (e)
    {
		e.preventDefault();
        
        var btn = $(this);
		btn.closest('li').toggleClass('active');
        
        setTimeout(function () 
        {
            window.location = btn.attr('href');
        }, 500);
	});
    
    $('.fa-star-o').each(function () 
    {
        var el = $(this);
		el.on('click', function () 
        {
			el.toggleClass('fa-star');
		});
	});
    
    /**
     * Selfie upload on change event.
     * 
     * Submit the form if the user selected a file.
     */
    $('.pic-upload input').on('change', function () 
    {
        var el = $(this);
        
        if (el.val()) {
            el.closest('form').submit();
        }
    });
    
    $('.user-info-edit-btn,.user-info-cancel-btn').on('click', function (e) 
    {
        e.preventDefault();
        
        var el = $(this);
        $('.user-info-panel').removeClass('hidden');
        el.closest('.user-info-panel').addClass('hidden');
    });
    
    $('#vote-items-filter').on('keyup', function () 
    {
        var val = $(this).val().toLowerCase();
        
        $('.voting-content-item li').each(function () 
        {
            var el = $(this);
            
            var inTitle = el.find('.vote-item-title').text().toLowerCase().indexOf(val) != -1;
            var inSubtitle = el.find('.vote-item-subtitle').text().toLowerCase().indexOf(val) != -1;
            
            if (inTitle || inSubtitle) {
                el.removeClass('hidden');
            } else {
                el.addClass('hidden');
            }
        });
    });
    
    var addFriendsContainer = $('.add-friends-container');
    
    addFriendsContainer.on('click', '.toggle-friend-request-confirmation,.friend-request-confirm-wrapper .cancel', function (e) 
    {
        e.preventDefault();
        
        $(this).parents('.friends-item-wrapper').toggleClass('opened');
    });
    
    addFriendsContainer.on('click', '.send-friend-request,.cancel-friend-request', function (e)
    {
		e.preventDefault();
        
        var btn = $(this);
		btn.closest('.friends-item-wrapper').toggleClass('pending');
        
        setTimeout(function () 
        {
            window.location = btn.attr('href');
        }, 500);
	});
});