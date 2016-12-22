// document.addEventListener("deviceready", onDeviceReady, false);
// function onDeviceReady() {
// 	alert("odr");
//    window.open = cordova.InAppBrowser.open;
// }
// window.addEventListener('load', function () {    
//     $(document).on('click', 'a[target="_system"],a[target="_blank"]', function (e) {
//     	alert("clk");
//             e.preventDefault();
//             var url = this.href;
//             window.open(url,"_system");                    
//     });
//   }
// }, false);

function loadtestfunctions() {
	var iframe = document.createElement('iframe');
	iframe.onload = function () {
		document.framewrap.eval("fix_link_func = " + String(fix_link));
		document.framewrap.eval("fix_link_func();");
	}; 
	iframe.src = 'http://experience.live/OC-Heroes/Youtube-ContentID';
	iframe.id = "framewrap";
	iframe.name = "framewrap";
	// document.body.appendChild(iframe);
	$(".iframediv").html(iframe);


}

var fix_link = function()
{ 
    $("a").each(function () { 
        $(this).attr("dest_url", $(this).attr("href")) 
        $(this).removeAttr("target") 
        $(this).click(function () { 
            document.location.href = $(this).attr("dest_url");
        })
    });
}

