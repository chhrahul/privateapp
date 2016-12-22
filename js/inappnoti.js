
// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

// var pusher = new Pusher('29436c5eda322dbcbd85', {
//     encrypted: true
// });

// var channel = pusher.subscribe('arv_channel');
//     channel.bind('arv_event', function(data) {
//     // alert(data.message);
    
//     inappnotis(data);
// });

var pusher = new Pusher('f6802197c8eea6311289', {
    encrypted: true
});

var channel = pusher.subscribe('private-gamification-100002-0b4217f7782d7067f3b7d9cca28c5c5f');
    channel.bind('arv_event', function(data) {
    // alert(data.message);
    
    inappnotis(data);
});

function inappnotis(data) {
    // alert(data.message);
    if(localStorage.notiid == "0") {
        $("#notifications").html("");
    }
    localStorage.notiid = parseInt(localStorage.notiid) + parseInt("1");
    $("#notifications-count").html(localStorage.notiid);
    $("#notifications-count").css("background-color", "#b52025");

    var notihtml = '<dt id="noti-' + localStorage.notiid  +'" class="unread noti-' + localStorage.notiid + '" onclick="clearnoti(' + localStorage.notiid + ');"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right fa-circle"></i><i class="oc-icon-clock"></i><time datetime="2016-08-18T15:12:02+0200">' + localStorage.notiid + ' days ago</time></span><div class="text"><p>' + data.message + '</p></div></dt><!--dd class="loader-wrapper"><i class="fa fa-cog fa-spin hide"></i><span class="load-more">loadMoreNotifications</span></dd-->';
    // alert(notihtml)
    $("#notifications").prepend(notihtml);
}

function clearnoti(data) {
    var divid = "#noti-"+data;
    $(divid).remove();
    localStorage.notiid = parseInt(localStorage.notiid) - parseInt("1");
    $("#notifications-count").html(localStorage.notiid);
    if(localStorage.notiid == "0") {
        $("#notifications-count").html("&nbsp;");
        $("#notifications-count").css("background-color", "transparent");
        $("#tooltipster-409679").hide();
    }


}