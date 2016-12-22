$(function () {
    var interval = 300;
    var websiteId = $('.mobile_search_string').data('website');
    $('.mobile_search_string').keyup(function () {
        var filter = $(this).val();
         alert(websiteId)
          alert(filter)
            alert(localStorage.url + 'modules/sitebuilder/ajax/fe_search_ws.php')
        if (filter != "") {
            delay(function () {
                $.ajax({
                    type: "POST",
                    url: localStorage.url + 'modules/sitebuilder/ajax/fe_search_ws.php',
                    data: {
                        action: 'search_string',
                        filter: filter,
                        website_id: websiteId
                    },
                    dataType: 'json',
                    success: function (jsonData) {
                        alert(JSON.stringify(jsonData));
                        var res = '';

                        if (jsonData['status'] != 'error') {

                            $.each(jsonData['results']['categories'], function (ci, category) {

                                if (category['count'] > 0) {

                                    res += '<div class="mobile-aside-result-list-title">\
											' + category["title"] + ':\
										</div>\
										<ul class="search-results-list">';

                                    $.each(category["search"], function (si, searchResult) {
                                        res += '<li>\
												<a href="' + searchResult["url"] + '" target="homepage-content">\
													 ' + searchResult["title"] + '\
												</a>\
											</li>';
                                    });

                                    res += '</ul>';

                                }

                            });

                        } else { //No results
                            res += jsonData['no_results'];
                        }

                        $('.mobile-aside-search-results').html(res);
                        $('#gamificationMobileMenu').hide();
                        $('#gamificationMobileSearch').show();
                    }
                });
            }, interval);
        } else {
            $("#gamificationMobileMenu").show();
            $("#gamificationMobileSearch").hide();
        }
    });
});

var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();