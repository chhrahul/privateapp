var remainingTime = -1;
var quizTimer = false;

function quizDecreaseTimer()
{
    // Do nothing if remainingTime not initialized.
	if (remainingTime == -1) {
        return;
    } 
    
    if (remainingTime <= 0) {
		quizClearTimer();
		remainingTime = -1;
		$('#quiz_form').submit();
	} else {
		remainingTime -= 1000;
		$('#ipt_countdown').val(remainingTime);
		$('#countdown_box').html(remainingTime / 1000);
		quizChangeTimerColor();
		quizStartTimer();
	}
}

function quizClearTimer()
{
	if (quizTimer != false) {
		clearTimeout(quizTimer);
		quizTimer = false;
	}	
}

function quizStartTimer()
{
	quizClearTimer();
	quizTimer = setTimeout(quizDecreaseTimer, 1000);
}


function quizSendAnswer(formEl)
{
	// Set the time first.
	$('#ipt_countdown').val(remainingTime<0?0:remainingTime);
	return true;
}

function quizInit(remainingMiliseconds)
{
	remainingTime = remainingMiliseconds;
	$('.ipt_quiz_a').change(function ()
    {
        // Only for radio input.
        if ($(this).is(':radio')) {
            $('#quiz_form').submit();
        }
    });
	quizChangeTimerColor();
	quizStartTimer();
}

function quizChangeTimerColor()
{
	if (remainingTime <= 5000) {
        $('#countdown_box').addClass('red').removeClass('orange');
    } else if (remainingTime <= 10000) {
        $('#countdown_box').addClass('orange');
    } else {
        $('#countdown_box').removeClass('red orange');
    }
}

jQuery(function ($) 
{
    $('#quiz_form').on('submit', function () 
    {
        return quizSendAnswer(this);
    });
});