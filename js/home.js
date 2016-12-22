var lastScrollTop = 0;
var containerinterval = 0;
var firstpadding = 0;
$(function(){
	
	
	// $(".custom-heading-panel").on("click",function(){
	// 	var index = $("ul.custom-panel li.custom-panel-content .custom-heading-panel").index(this);
	// 	var offset = $(this).parent().offset();
	// 	// console.log(index)
	// 	$('html, body').animate({scrollTop:(offset.top - (index*30) - firstpadding)}, 'slow');
	// });

	// $(document).bind('touchstart touchend touchcancel touchleave touchmove', function(e){
 //    	checkScrolling();
	// });

	// $(window).scroll(function(){
	//     checkScrolling();
	// });
	//  checkScrolling();




	 $(".secondary-menu button").on("click",function(){
		$(".active-button").removeClass("active-button");
		$(this).find("a").toggleClass("active-button");
	});
	
	$(".drop-select").on("click",function(){
		// console.log("clicked");
		
		if($('.drop-select-content').hasClass('content-display')){
			$('.drop-select-content').removeClass('content-display');	
		}
		else $('.drop-select-content').addClass('content-display');


	});

});
function checkScrolling(){
		var els = $(".custom-heading-panel");
		
		var scrollTop = $(window).scrollTop();
		if(scrollTop > lastScrollTop){
			var direction = "down";
		}
		else{
			var direction = "up";
		}
		lastScrollTop = scrollTop;

		$.each(els, function( index, el ) {
		  	
			if(direction == "down"){
				var offset = $(el).offset();
				var paddingTop = firstpadding + (index*30);
				var paddingForCalc = $(window).scrollTop() + firstpadding + (index*30);
				if( paddingForCalc >= ((offset.top) - containerinterval) ){
					$(el).addClass("fixed").css("top", paddingTop+"px");
				}
			}
			if(direction == "up"){
				var offset = $(el).parent().offset();
				var paddingTop = firstpadding + (index*30);
				var paddingForCalc = $(window).scrollTop() + firstpadding + (index*30);

					if( paddingForCalc <= ((offset.top) + containerinterval) ){
						$(el).removeClass("fixed").css("top", "0");
					}

			}
			
		});


	
		/* sticky header */
		var el2 = $(".custom-heading-menu");
		var offset2 = el2.offset();
		var paddingForCalc2 = scrollTop;
	if(direction == "down"){
		
		if( paddingForCalc2 >= ((offset2.top)) ){
			$(el2).css("position", "static").css("top", "0px");
			$("header").css("margin-top", "0");
		}
	}
	else if(direction == "up"){
		if( paddingForCalc2 <= 50 ){
			$(el2).css("position", "static").css("top", "0px");
			$("header").css("margin-top", "0");
		}
		// console.log(paddingForCalc2+" + "+offset2.top)
		// else{
		// 	$(el).css("position", "fixed").css("top", "0px");
		// 	$("header").css("margin-top", "50px");
		// }
	}
	/* end of sticky header */
}
