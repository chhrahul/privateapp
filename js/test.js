function commondivsformenus(){
	 shownotification("ALL DIVS HTML", "ALL DIVS");
	 
	/*jQuery('#commondivsformenus').append('<div class="container main-container user-profile-container"><div class="header-title row"><p></p></div><div class="user-profile-add-container "><div class="main-img-wrapper"><div class="main-img" style="background-image: url('');"></div></div><form enctype="multipart/form-data" method="post" action=""> <div class="selfie_button"><div class="pic-upload selfie_capture"><input class="addselfie" type="button" value=""onclick="showbuttons();"></div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Choose a Photo"onclick="getPhoto(pictureSource.PHOTOLIBRARY);">Choose a Photo</div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Take a Photo"onclick="capturePhoto();"> Take a Photo</div></div></form><div id="plid"><h5>Your player ID</h5><h2 class="player_code"></h2></div></div><div class="success_message"><div class="isa_success"> <i class="fa fa-check"></i> Profile Edited Successfully! <input type="hidden" id="edited_success"></div></div><div class="user-info row"><div class="user-info-panel show_info_user"><dl class="dl-horizontal"><dt class="all_username"></dt><dd class="myname"></dd><dt class="all_email"></dt><dd class="myemail"></dd><dt class="all_mobile"></dt><dd class="mymobile"></dd><dt class="all_gender"></dt><dd class="mygender"></dd></dl><div class="btns-wrapper"><a class="btn user-info-edit-btn" href="#"></a></div></div><div class="user-info-edit-form edit_info_user user-info-panel hidden"><dl class="dl-horizontal clearfix"><dt id="all_fname">First Name</dt><dd><input class="form-control" id="fname_edit" type="text" name="data[fName]" value=""></dd> <dt id="all_lname">Last Name</dt><dd><input class="form-control" id="lname_edit" type="text" name="data[lName]" value=""></dd><dt id="all_email">Email</dt><dd><input class="form-control" id="email_edit" type="text" name="data[eMail]" value=""></dd><dt id="all_remail">Repeat email</dt><dd><input class="form-control" id="emailrepeat_edit" type="text" name="data[email_repeat]" value=""></dd><dt id="all_mobile">Mobile</dt><dd><input class="form-control" id="mobile_edit" type="text" name="data[mobile]" value=""></dd><dt id="all_pwd">SetNewPassword</dt><dd><input class="form-control" id="pwd_edit" type="password" name="data[password]"></dd><dt id="all_rpwd">RepeatNewPassword</dt><dd><input class="form-control" id="pwdrepeat_edit" type="password" name="data[password_repeat]"></dd></dl><div class="btns-wrapper"><button class="btn user-info-save-btn" onclick="return saveprofile();" type="button" name="save_details" value="1">Save</button><a class="btn user-info-cancel-btn" href="#">Cancel</a></div></div></div><div class="user-facebook-link row facebook-link"><h4></h4><div class="facebook-description"></div><div class="facebook-btn-wrapper"><a href="#" onclick="linkwithfacebook();"><i class="fa fa-facebook fbs"></i></a></div></div><div class="user-facebook-link" id="unlinkfacebook"><div class="facebook-btn-wrapper"><a href="#" onclick="unlinkwithfacebook();"><i class="fa fa-facebook"></i> Unlink your account from Facebook</a></div></div><dl class="qa-list row"></dl></div>');*/
	
	
	/*jQuery('#commondivsformenus').append("hello");*/
	
	jQuery('#commondivsformenus').append("<div class='container main-container user-profile-container'>
	<div class='header-title row'>
		<p>
            		</p>
	</div>
	<div class='user-profile-add-container '>
		<div class='main-img-wrapper'>
			<div class='main-img' style='background-image: url('');'></div>
		</div>
        <form enctype='multipart/form-data' method='post' action=''>
                                   <div class='selfie_button'>
                                    <div class='pic-upload selfie_capture'>
                <input class='addselfie' type='button' value=''  onclick='showbuttons();'>
                
                            </div>
                <div class='pic-upload hidden_button' style='display:none;'>
                <input type='button' value='Choose a Photo'  onclick='getPhoto(pictureSource.PHOTOLIBRARY);'>
                
                Choose a Photo          </div>
                <div class='pic-upload hidden_button' style='display:none;'>
                <input type='button' value='Take a Photo'  onclick='capturePhoto();'>
                
               Take a Photo          </div>
                </div>
                    </form>
                    <div id='plid'>
                    <h5>Your player ID</h5>
                    <h2 class='player_code'></h2>
                    </div>
        	</div>
      
          
      <div class='success_message'>
      <div class='isa_success'>
     <i class='fa fa-check'></i>
     Profile Edited Successfully!
     <input type='hidden' id='edited_success'>
</div>
      </div>    
	<div class='user-info row'>

        <div class='user-info-panel show_info_user'>
            <dl class='dl-horizontal'>
                                <dt class='all_username'></dt>
                <dd class='myname'></dd>
                
                                <dt class='all_email'></dt>
                <dd class='myemail'></dd>
                
                                <dt class='all_mobile'></dt>
                <dd class='mymobile'></dd>
                
                                <dt class='all_gender'></dt>
                <dd class='mygender'></dd>
                            </dl>
            <div class='btns-wrapper'>
                <a class='btn user-info-edit-btn' href='#'></a>
            </div>
        </div>

        <div class='user-info-edit-form edit_info_user user-info-panel hidden'>
                        <dl class='dl-horizontal clearfix'>
                <dt id='all_fname'>
                    First Name                </dt>
                <dd>
                    <input class='form-control' id='fname_edit' type='text' name='data[fName]' value=''>
                </dd>
                <dt id='all_lname'>
                    Last Name                </dt>
                <dd>
                    <input class='form-control' id='lname_edit' type='text' name='data[lName]' value=''>
                </dd>
                <dt id='all_email'>
                    Email                </dt>
                <dd>
                    <input class='form-control' id='email_edit' type='text' name='data[eMail]' value=''>
                </dd>
                <dt id='all_remail'>
                    Repeat email                </dt>
                <dd>
                    <input class='form-control' id='emailrepeat_edit' type='text' name='data[email_repeat]' value=''>
                </dd>
                <dt id='all_mobile'>
                    Mobile                </dt>
                <dd>
                    <input class='form-control' id='mobile_edit' type='text' name='data[mobile]' value=''>
                </dd>
                <dt id='all_pwd'>
                    SetNewPassword                </dt>
                <dd>
                    <input class='form-control' id='pwd_edit' type='password' name='data[password]'>
                </dd>
                <dt id='all_rpwd'>
                    RepeatNewPassword                </dt>
                <dd>
                    <input class='form-control' id='pwdrepeat_edit' type='password' name='data[password_repeat]'>
                </dd>
            </dl>
            <div class='btns-wrapper'>
                <button class='btn user-info-save-btn' onclick='return saveprofile();' type='button' name='save_details' value='1'>Save</button>
                <a class='btn user-info-cancel-btn' href='#'>Cancel</a>
            </div>
        </div>
	
	</div>
    	<div class='user-facebook-link row facebook-link'>
        		<h4></h4>
        <div class='facebook-description'>
                   </div>
		<div class='facebook-btn-wrapper'>
			<a href='#' onclick='linkwithfacebook();'>
                <i class='fa fa-facebook fbs'></i>            </a>
		</div>
	</div>
  <div class='user-facebook-link' id='unlinkfacebook'>
  
        <div class='facebook-btn-wrapper'>
			<a href='#' onclick='unlinkwithfacebook();'>
                <i class='fa fa-facebook'></i> Unlink your account from Facebook            </a>
		</div>
  </div>
	        <dl class='qa-list row'>
                               
                        </dl>
    </div>");
}