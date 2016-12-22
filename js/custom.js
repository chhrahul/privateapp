$(function ()
{
	// Media element
	
	$('video:not(.noplayer),audio').mediaelementplayer(/* Options */);

	// Login
	
	$('#reset_button').click(function (e) 
    {
        e.preventDefault();
		$('#resetPasswordBox').slideToggle();
		$('#loginBox').slideUp();
	});

	$('#login_button').click(function (e) 
    {
        e.preventDefault();
		$('#loginFacebookBox').slideUp();
		$('#loginBox').slideToggle();
	});

	$('#back_button').click(function (e) 
    {
        e.preventDefault();
		$('#resetPasswordBox').slideUp();
		$('#loginFacebookBox').slideToggle();
	});

	$('div.errorMessage').click(function () {
		$(this).fadeTo('slow', 0);
		$(this).slideUp(300)
	});
    
    $('form.has-image-upload').on('submit', function () 
    {
        $(this).find('.loader-wrapper').removeClass('hide');
    });
    
    $('.file-upload input[type="file"]').on('change', function () 
    {
        var el = $(this);
        if (el.val()) {
            el.parents('i').addClass('active');
        } else {
            el.parents('i').removeClass('active');
        }
    });
    
    $('.reply-to-comment,.reply-cancel').on('click', function (e) 
    {
        e.preventDefault();
         alert('hi')
        var container = $(this).parents('.questions-item-container');
        container.find('.reply-form').toggleClass('hide');
    });
    
    $('.delete-comment').on('click', function (e) 
    {
        e.preventDefault();
        
        if (confirm(keywords.commentDeleteConfirmation)) {
            window.location = $(this).data('url');
        }
    });
    
    $('.images-container').each(function () 
    {
        $(this).magnificPopup({
            delegate: 'a',
            type: 'image',
            gallery: {
                enabled: true
            }
        });
    });
});
 $('#show-form-container').on('click', function ()
    {
        var container = $('.main-questions-form-container');
        // Hide all other forms besides this one.
        $('.questions-filter-items').not(container).slideUp();
        // Hide main form container.
        container.slideToggle();
    });

function refreshPage() {
    window.location = window.location;
}

function refreshCountdown() {
    var t = new Date();
    t.setSeconds(t.getSeconds() + 5);
    $('#countdown').countdown({until: t, onExpiry: refreshPage, format:'s', compact: true});
}