/**

Copyright (c) 2014 torrmal:Jorge Torres, jorge-at-turned.mobi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

try{
	var tmp = LocalFileSystem.PERSISTENT;
	var tmp = null;
}
catch(e){
	var LocalFileSystem= {
		PERSISTENT : window.PERSISTENT,
		TEMPORARY: window.TEMPORARY
	}; 
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
}


var DirManager = function(){
	
	this.cache = {};

	var current_object = this;
	// recursive create
	this.create_r =function(path, callback, fail, position)
	{
		position = (typeof position == 'undefined')? 0: position;

		
		
		var path_split 		= path.split('/');
		var new_position 	= position+1;
		var sub_path 		= path_split.slice(0,new_position).join('/');

		Log('DirManager','mesg')('path:'+sub_path,'DirManager');
		
		
		
		var inner_callback = function(obj){
			return function(){
				Log('DirManager','mesg')('inner_callback:'+path);

				obj.create_r(path, callback, fail, new_position);
			}
		}

		
		if(new_position == path_split.length){
			this.create(sub_path, callback, fail);
		}
		else
		{
			this.create(sub_path, inner_callback(this), fail);
		}
		

	};

	this.list = function(path, success, fail){

		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;

		var template_callback = function(success){

			return 	function(entries) {
			        var i;
			        var ret = [];
			        
			        limit=entries.length;
			        	
			        
			        for (i=0; i<limit; i++) {
			            //console.log(entries[i].name);
			            ret.push(entries[i].name);

			        }
			        // console.log('LIST: '+ret);
			        success(ret);
				}
		}

		if(current_object.cache[path]){
			
			current_object.cache[path].readEntries(
			            	template_callback(success)
			            );
			return;
		}

		fileSystemSingleton.load(
			function(fileSystem){
				var entry=fileSystem.root; 
				
	        	entry.getDirectory(path,

	        		{create: true, exclusive: false}, 
	        		function(entry){
	        			var directoryReader = entry.createReader();
	        			current_object.cache[path] = directoryReader;
			            directoryReader.readEntries(
			            	template_callback(success)
			            );
	        		}, 
	        		function(err){
	        			current_object.create_r(path,function(){success([]);},fail);
	        			Log('DirManager','crete fail')('error creating directory');
	        			//fail(err);
	        		}
	        	);
			}
		);		
	}

	this.create = function(path, callback, fail){
		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;
		fileSystemSingleton.load(
			function(fileSystem){
				var entry=fileSystem.root; 
				
	        	entry.getDirectory(path,
	        		{create: true, exclusive: false}, 
	        		function(entry){
	        			Log('FileSystem','msg')('Directory created successfuly');
	        			callback(entry);
	        		}, 
	        		function(err){
	        			Log('DirManager','crete fail')('error creating directory');
	        			fail(err);
	        		}
	        	);
			}
		);
	};

	this.remove = function(path, success, fail){
		fail = (typeof fail == 'undefined')? Log('DirManager','crete fail'): fail;
		success = (typeof success == 'undefined')? Log('DirManager','crete fail'): success;
		
		//console.log(current_object.cache);
		delete current_object.cache[path];
		//console.log(current_object.cache);
		this.create(
			path,
			function(entry){
				
				
				entry.removeRecursively(success, fail);
			}
		);
	}
	
};

var Log = function(bucket, tag){
  return function(message){
    if(typeof bucket != 'undefined')
    {
      console.log(' '+bucket+':');
    }
    if(typeof tag != 'undefined')
    {
      console.log(' '+tag+':');
    }
    if(typeof message != 'object'){
      console.log('       '+message);
    }
    else
    {
      console.log(message);
    }
  };
}


var fileSystemSingleton = {
	fileSystem: false,

	load : function(callback, fail){
		fail = (typeof fail == 'undefined')? Log('FileSystem','load fail'): fail;
		if(fileSystemSingleton.fileSystem){
			callback(fileSystemSingleton.fileSystem);
			return; 
		}

		if(!window.requestFileSystem){
			return fail();
		}


		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0, 
			function(fileSystem){
				fileSystemSingleton.fileSystem = fileSystem;
				callback(fileSystemSingleton.fileSystem);
			}, 
			function(err){
				Log('FileSystem','load fail')('error loading file system');
				fail(err);
			}
		);
	}
};


var Log = function(bucket, tag){
  return function(message){
    if(typeof bucket != 'undefined')
    {
      console.log(' '+bucket+':');
    }
    if(typeof tag != 'undefined')
    {
      console.log(' '+tag+':');
    }
    if(typeof message != 'object'){
      console.log('       '+message);
    }
    else
    {
      console.log(message);
    }
  };
}


var fileSystemSingleton = {
	fileSystem: false,

	load : function(callback, fail){
		fail = (typeof fail == 'undefined')? Log('FileSystem','load fail'): fail;
		if(fileSystemSingleton.fileSystem){
			callback(fileSystemSingleton.fileSystem);
			return; 
		}

		if(!window.requestFileSystem){
			return fail();
		}


		window.requestFileSystem(
			LocalFileSystem.PERSISTENT,
			0, 
			function(fileSystem){
				fileSystemSingleton.fileSystem = fileSystem;
				callback(fileSystemSingleton.fileSystem);
			}, 
			function(err){
				Log('FileSystem','load fail')('error loading file system');
				fail(err);
			}
		);
	}
};

var FileManager = function(){

	

	this.get_path = function(todir,tofilename, success){
		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			todir,
			tofilename,
			function(fileEntry){

					var sPath = fileEntry.toURL();
					
					
					success(sPath);
			},
			Log('fail')
		);		
	}

	this.load_file = function(dir, file, success, fail, dont_repeat){
		if(!dir || dir =='')
		{
			Log('error','msg')('No file should be created, without a folder, to prevent a mess');
			fail();
			return;
		}
		fail = (typeof fail == 'undefined')? Log('FileManager','load file fail'): fail;
		var full_file_path = dir+'/'+file;
		var object = this;
		// well, here it will be a bit of diharrea code, 
		// but, this requires to be this chain of crap, thanks to phonegap file creation asynch stuff
		// get fileSystem
		fileSystemSingleton.load(
			function(fs){
				var dont_repeat_inner = dont_repeat;
				// get file handler
				console.log(fs.root);
				fs.root.getFile(
					full_file_path, 
					{create: true, exclusive: false}, 
					success, 

					function(error){
						
						if(dont_repeat == true){
							Log('FileManager','error')('recurring error, gettingout of here!');
							return;
						}
						// if target folder does not exist, create it
						if(error.code == 3){
							Log('FileManager','msg')('folder does not exist, creating it');
							var a = new DirManager();
      						a.create_r(
      							dir, 
      							function(){
      								Log('FileManager','mesg')('trying to create the file again: '+file);
      								object.load_file(dir,file,success,fail,true);
      							},
      							fail
      						);
							return;
						}
						fail(error);
					}
				);
			}
		);
	};

	this.download_file = function(url, todir, tofilename, success, fail){

		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			todir,
			tofilename,
			function(fileEntry){

					var sPath = fileEntry.toURL();

		            var fileTransfer = new FileTransfer();
		            fileEntry.remove();
		           
		            fileTransfer.download(
		                encodeURI(url),
		                sPath,
		                function(theFile) {
		                    console.log("download complete: " + theFile.toURI()); 
		                    success(theFile);
		                },
		                function(error) {
		                    console.log("download error source " + error.source);
		                    console.log("download error target " + error.target);
		                    console.log("upload error code: " + error.code);
		                    fail(error);
		                }
		            );


				

			},
			fail
		);

		
	};

	this.read_file = function(dir, filename, success, fail){
		// console.log(dir);
		fail = (typeof fail == 'undefined')? Log('FileManager','read file fail'): fail;
		this.load_file(
			dir,
			filename,
			function(fileEntry){
				fileEntry.file(
					function(file){
						var reader = new FileReader();

						reader.onloadend = function(evt) {
						    
						    success(evt.target.result);
						};

						reader.readAsText(file);
					}, 
					fail
				);

			},
			fail
		);
	};

	this.write_file = function(dir, filename, data, success, fail){
		fail = (typeof fail == 'undefined')? Log('FileManager','write file fail'): fail;
		this.load_file(
			dir,
			filename,
			function(fileEntry){
				fileEntry.createWriter(
					function(writer){
						Log('FileManager','mesg')('writing to file: '+filename);
						writer.onwriteend = function(evt){
							Log('FileManager','mesg')('file write success!');
							success(evt);
						}
				        writer.write(data);
					}, 
					fail
				);
			},			
			fail
		);

		//
	};


	this.remove_file = function(dir, filename, success, fail){
		var full_file_path = dir+'/'+filename;
		fileSystemSingleton.load(
			function(fs){
				
				// get file handler
				fs.root.getFile(full_file_path, {create: false, exclusive: false}, function(fileEntry){fileEntry.remove(success, fail);}, fail);
			}

		);
		//
	};
};




var ParallelAgregator = function(count, success, fail, bucket)
{
  ////System.log('success: aggregator count:'+count);
  var success_results = [];
  var fail_results = [];
  var success_results_labeled = {};
  var ini_count = 0;
  var log_func= function(the_data){
    //console.log(the_data)
  }
  var object = this;
  current_bucket = (typeof bucket == 'undefined')? 'aggregator' : bucket;
  var success_callback =  (typeof success == 'undefined')? log_func : success;
  var fail_callback = (typeof fail == 'undefined')? log_func: fail;

  

  this.success = function(label){
    return function(result){
      //System.log('one aggregator success!',current_bucket);
      ini_count++;
      success_results.push(result);
      if(!success_results_labeled[label]){
        success_results_labeled[label] = [];
      }
      success_results_labeled[label].push(result);
      //System.log('success: aggregator count:'+ini_count,current_bucket);
      object.call_success_or_fail();
    }
  };

  this.call_success_or_fail = function(){
    if(ini_count == count){
      //System.log('aggregator complete',current_bucket);
      if(success_results.length == count)
      {
        //System.log('aggregator success',current_bucket);
        success_callback(success_results_labeled);
      }
      else{
        //System.log('aggregator fail',current_bucket);
        fail_callback({success:success_results,fail:fail_results});
      }
    }
  };

  this.fail = function(result){
    //System.log('one aggregator fail!',current_bucket);
    ini_count++;
    fail_results.push(result);
    //System.log('fail: aggregator count:'+ini_count, current_bucket);
    this.call_success_or_fail();
  }
}

/**

//TEST CODE:
var start=	function(){
		

		//
		//CREATE A DIRECTORY RECURSEVLY
		var a = new DirManager(); // Initialize a Folder manager
        a.create_r('folder_a/folder_b',Log('complete/jorge'));

		//LIST A DIRECTORY 
		a.list('cosa', Log('List'));

        //REMOVE A DIRECTORY RECURSEVLY
        a.remove('folder_a/folder_b',Log('complete delte'), Log('delete fail'));

		//
		//FILES MANAGEMENT:
		//
        var b = new FileManager();
        // create an empty  FILE (simialr unix touch command), directory will be created recursevly if it doesnt exist
        b.load_file('dira/dirb/dirc','demofile.txt',Log('file created'),Log('something went wrong'));
        
        // WRITE TO A FILE
        b.write_file('dira/dirb/dirc/dird','demofile_2.txt','this is demo content',Log('wrote sucessful!'));

        // READ A FILE
        b.read_file('dira/dirb/dirc/dird','demofile_2.txt',Log('file contents: '),Log('something went wrong'));
        
        // download a file from a remote location and store it localy
        b.download_file('http://www.greylock.com/teams/42-Josh-Elman','filder_a/dwonloads_folder/','target_name.html',Log('downloaded sucess'));
       

		
}
document.addEventListener('deviceready', start, false);
*/





function getFileNameFromPath(path) {
    var ary = path.split("/");
    return ary[ary.length - 1];
}

//function to check internet connection on device
function checkNetworkConnection()
{
        var networkState = navigator.connection.type;
			
				var states = {};
				states[Connection.UNKNOWN]  = 'Unknown connection';
				states[Connection.ETHERNET] = 'Ethernet connection';
				states[Connection.WIFI]     = 'WiFi connection';
				states[Connection.CELL_2G]  = 'Cell 2G connection';
				states[Connection.CELL_3G]  = 'Cell 3G connection';
				states[Connection.CELL_4G]  = 'Cell 4G connection';
				states[Connection.CELL]     = 'Cell generic connection';
				states[Connection.NONE]     = 'No network connection';  
				 //alert(states[networkState]);
				if(states[networkState]=='No network connection'){
            return 'no';
        }
        else
        {
          return 'yes';
        }
}

//function to check if user is logged in or not
function isLoggedIn()
{
    var main_url = localStorage.url + 'api/index.php/auth/isLoggedIn?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(resp) {
            if (resp.data.logged_in == false || resp.data.logged_in == 'false') {
               localStorage.user_id = '';
               window.location.href = 'index.html';
            }
          } 
      });
}


//Reset Password
function resetpassword() {
    //alert("asdas");
  event.preventDefault();
  
  db.transaction(function(tx) {
				tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
					var len = results.rows.length; 
					
					
				  var pr = '';  
                  var ys = '';  
                  var fp = '';
                            
                  for (i = 0; i < len; i++) {
                    
                      if(results.rows.item(i).key_constant == 'ErrorURL')
                      {
                         pr = unescape(results.rows.item(i).key_val); 
                      } 
                      if(results.rows.item(i).key_constant == 'InvalidEmailOrPassword')
                      {
                         ys = unescape(results.rows.item(i).key_val); 
                      }
                      if(results.rows.item(i).key_constant == 'checkYourEmailPhoneMessages')
                      {
					  	fp = unescape(results.rows.item(i).key_val);
					  	fp = fp.replace(/\<br\>/g,' ');
					  }
                      
                      
                   }
  
  var email = jQuery("#fld_rp_email").val();
  var fld_l_url = jQuery("#fld_l_url").val();
    
  if (fld_l_url == '') {
      //alert("Please Enter Url");
     shownotification(pr,"Forgot Password?");
      return false;
  }
  else if (email == '') {
      //alert("Please Enter Email");
      shownotification(ys,"Forgot Password?");
      
      return false;
  }
  else
   {
    var main_url = fld_l_url + '/gamification/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            email_sms_reset: email
        },
        success: function(resp) {
            //alert(JSON.stringify(resp));
            //alert('Please check your email for new password!');
           // shownotification(fp,"Login");  
           // alert(resp.login_success);
            if (resp.login_success != '') {
               shownotification(fp,"Login");
            } else {
                shownotification(resp.login_error,"Login");                
            }      
            window.location.href = 'index.html';
        }
    });
    }
   });
   }); 
}



function removeprofileimage() {
	$(".selfie_button").html('<img src="img/loading.gif">');
    var main_url = localStorage.url + 'api/index.php/auth/removeUserImage?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(resp) {
            if (resp.status == 'success') {
                var DIR_Name = 'oc_photos';
                var a = new DirManager();
                a.create_r(DIR_Name, Log('created successfully'));
                var b = new FileManager();

                var img_src = resp.data.image.image_src;
                var image_name = getFileNameFromPath(img_src);

                var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                jQuery.ajax({
                    url: STR,
                    dataType: "html",
                    success: function(DtatURL) {

                        b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(resp.data.image.image_src), function(theFile) {

                            var ImgFullUrl = '';
                            ImgFullUrl = theFile.toURI();

                            db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="false"');
                                //window.location.href = "profile.html";
                                localStorage.profileuis = "removed";
                                loadUserImages();
                                loadcommonthings();
                                changetoprofile();
                            });
                        });
                    }
                });
            }
        }

    });
}

function shownotification(msg,title)
{
  navigator.notification.alert(
                        msg,  // message
                        alertDismissed,         // callback
                        title,            // title
                        'Ok'                  // buttonName
              );
}

//function to update profile
function saveprofile() {
    jQuery(document).ready(function($) {
        // event.preventDefault();

        var fname = $("#fname_edit").val();
        var lname = $("#lname_edit").val();
        var email = $("#email_edit").val();
        var repeat_email = $("#emailrepeat_edit").val();
        var mobile = $("#mobile_edit").val();
        var password = $("#pwd_edit").val();
        var password_repeat = $("#pwdrepeat_edit").val();
        if (fname == '') {
            //alert("Please Enter First Name");
            shownotification("Please Enter First Name","Profile");
            $("#fname_edit").focus();
            return false;
        }
        if (lname == '') {
            //alert("Please Enter Last Name");
            shownotification("Please Enter Last Name","Profile");
            $("#lname_edit").focus();
            return false;
        }

        if (email == '') {
            //alert("Please Enter Your Email Address");
            shownotification("Please Enter Your Email Address","Profile");
            $("#email_edit").focus();
            return false;
        }
        if (repeat_email != '') {
            if (email != repeat_email) {
                //alert("Emails Don't Match");
                shownotification("Emails Don't Match","Profile");
                $("#emailrepeat_edit").focus();
                return false;
            }
        }
        if (mobile == '') {
            //alert("Please Enter Mobile Number");
            shownotification("Please Enter Mobile Number","Profile");
            $("#mobile_edit").focus();
            return false;
        }
        if (password != '') {
            if (password !== password_repeat) {
                //alert("Passwords Don't Match");
                shownotification("Passwords Don't Match","Profile");
                $("#pwdrepeat_edit").focus();
                return false;
            }
        }
        email = base64_encode(email);
        repeat_email = base64_encode(repeat_email);
        password = base64_encode(password);
        password_repeat = base64_encode(password_repeat);
        //alert(mobile);
        var main_url = localStorage.url + 'api/index.php/auth/updateUser?XDEBUG_SESSION_START=PHPSTORM';
        // alert('here');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                first_name: fname,
                last_name: lname,
                mobile: mobile,
                password: password,
                password_repeat: password_repeat,
                email: email,
                email_repeat: repeat_email
            },
            success: function(obj) {
                //alert(obj.status);
                if (obj.status == 'success') {
                    db.transaction(function(tx) {
                        tx.executeSql("update OCEVENTS_user set email = '" + obj.data.email + "',first_name = '" + obj.data.first_name + "',last_name = '" + obj.data.last_name + "',mobile = '" + obj.data.mobile + "'");
                        $(".success_message").show();
                        $('#edited_success').focus();
                        setTimeout(function() {
                            $('.success_message').fadeOut('slow');
                        }, 4000);

                        $(".myname").html(obj.data.first_name + " " + obj.data.last_name);
                        $(".myemail").html(obj.data.email);
                        $(".mymobile").html(obj.data.mobile);
                        //$(".log-info p").html("<p>"+obj.data.first_name+" "+obj.data.last_name+"<br><strong>&lt; "+obj.data.team+" &gt; </strong><br></p>");
                        $(".firstname a").html(obj.data.first_name);
                        $(".lastname a").html(obj.data.last_name);
                        $(".edit_info_user").addClass('hidden');
                        $(".show_info_user").removeClass('hidden');
                        //$(".user-info-cancel-btn").trigger("click");  
                    });
                } else {
                    //alert(obj.message);
                    shownotification(obj.message,"Profile");
                }
                //alert(obj.message);
            }
        });
    });
}


function checkURL(value) {
    var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
    if (urlregex.test(value)) {
        return (true);
    }
    return (false);
}

function createTables()
{

	db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_ticket (id integer primary key autoincrement,user_id,ticketCode,ticketSrc)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_points (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,hideTeamScores,label,instance_id)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_qa (id integer primary key autoincrement,user_id, question,answer)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type,iframe_url,banner_video,module_type)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_teampoints (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,label,instance_id)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_yourteampoints (id integer primary key autoincrement,alias,user_id,name,position integer,userTotal,green_count,label,instance_id)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footerlinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_footermorelinks (id integer primary key autoincrement,name,icon,friends_requests_count,menu_text)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_events (id integer primary key autoincrement,event_id,user_id,title,description,logo,image, short_url)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_keywords (id integer primary key autoincrement,key_constant,key_val)');
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_menu (id integer primary key autoincrement,parent_id,title,url,website_id)'); 
		tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_urleventslisting (id integer primary key autoincrement,url_name,url_link,solution_id,event_id,title)'); 

	}); 	
	loadkeywords();
	loadUrlEvents();
}


function loginme() {

// ErrorURL
// InvalidEmailOrPassword
	
    jQuery(document).ready(function($) {
       
        event.preventDefault();
       
        db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
				var len = results.rows.length; 


				var pr = '';  
				var ys = '';  

				for (i = 0; i < len; i++) {

					if(results.rows.item(i).key_constant == 'ErrorURL')
					{
						pr = unescape(results.rows.item(i).key_val); 
					} 
					if(results.rows.item(i).key_constant == 'InvalidEmailOrPassword')
					{
						ys = unescape(results.rows.item(i).key_val); 
					}


				}
				//alert(pr);
				//alert(ys);
		        var fld_l_email = $("#fld_l_email").val();
		        //var fld_l_url = $("#fld_l_url").val();
		        var fld_l_url = localStorage.surl;
		        var fld_l_password = $("#fld_l_password").val();
		        if (fld_l_email == '') {
		            //alert("Please Enter Your Email");
		            shownotification(ys,"Login");
		            return false;
		        } 
		        else if (fld_l_password == '') {
		            //alert("Please Enter Your Password");
		            shownotification(ys,"Login");
		            return false;
		        } 
		        else if (fld_l_url == '') {
		            //alert("Please Enter Url");
		            shownotification(pr,"Login");
		            return false;
		        } 
		        else if(!checkURL(fld_l_url)){
		              //alert("Please Enter A Valid Url");
		              shownotification(pr,"Login");
		            return false;
		        } 
		        else {
		        	$("#login_submit").hide();
		         	$(".loading").show();
		         	localStorage.url = fld_l_url + '/';
		        	var main_url = localStorage.url + 'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
			    	jQuery.ajax({
				        url: main_url,
				        dataType: "json",
				        method: "POST",
				        success: function(obj) {
							var email = base64_encode(fld_l_email);
							var pwd = base64_encode(fld_l_password);

							// var email = "YWRpLnBhdHJhc2N1QG91dGxvb2suY29t";
							// var pwd = "MTIzNDU2";

				            // alert(email)
				            //alert(pwd)
				            var main_url = localStorage.url + 'api/index.php/auth/login?XDEBUG_SESSION_START=PHPSTORM';
			             	// alert(main_url);
				            $.ajax({
				                url: main_url,
				                dataType: "json",
				                method: "POST",
				                data: {
				                    email: email,
				                    password: pwd
				                },
				                success: function(obj) {
				                   // alert(JSON.stringify(obj));
				                    if (obj.status == 'error') {
				                        alert(obj.message);
				                        shownotification(obj.message,"Profile");
				                        $("#login_submit").show();
				                        $(".loading").hide();
				                    } 
				                    else {
				                        //createTables();

				                        var DIR_Name = 'oc_photos';
				                        var a = new DirManager();
				                        a.create_r(DIR_Name, Log('created successfully'));

				                        var b = new FileManager();
				                        //alert(obj.data.image.image_src);	
				                        var img_src = obj.data.image.image_src;
				                       // localStorage.profilelogo = obj.data.image.image_src;
				                        //alert(localStorage.profilelogo);
				                        var image_name = getFileNameFromPath(img_src);
				                        var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


				                        $.ajax({
				                            url: STR,
				                            dataType: "html",
				                            success: function(DtatURL) {
												b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(obj.data.image.image_src), function(theFile) {

													var ImgFullUrl = '';
													ImgFullUrl = theFile.toURI();
													// alert(ImgFullUrl);
													db.transaction(function(tx) {      

														tx.executeSql("delete from OCEVENTS_user");
														tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
														localStorage.user_id = obj.data.id;
														if(localStorage.event_id == "" || localStorage.event_id == undefined || localStorage.event_id == null ) {
															localStorage.event_id = obj.data.event_id;
														}
														localStorage.event_language = obj.data.event_language;
														login_process();
													});
				                                });

				                            }
				                        });
				                    }

				                },fail: function()
				                {
				                  //alert('failed') ;
				                  shownotification("Failed","Login");
				                }
				            });
			        	}   
				    });
		        }
		    });
		});
	});
}


function autologinme() {

		$(".loading_index_items").hide();
		$(".loading_autologin_items").show();
		$("#autologinbox").hide();
		$('#select_url').hide();
		var fld_l_email = localStorage.linkurlusername;
		var fld_l_password = localStorage.linkurlpassword;
		var fld_l_url = localStorage.linkurlselecturl;

		// $("#fld_l_email").val() = fld_l_email;
  //       $("#fld_l_url").val() = fld_l_url;
  //       $("#fld_l_password").val() = fld_l_password;

	    if (fld_l_email == '') {
            shownotification(ys,"Login");
            return false;
        } else if (fld_l_password == '') {
            shownotification(ys,"Login");
            return false;
        } else if (fld_l_url == '') {
            shownotification(pr,"Login");
            return false;
        } else if(!checkURL(fld_l_url)){
              shownotification(pr,"Login");
            return false;
        } else {
        	$("#login_submit").hide();
         	$(".loading").show();
         	
         	localStorage.url = fld_l_url + '/';    	
        	//alert(fld_l_url);
        	//http://oceventmanager.com/g-homepage/-/OCintranet-100041/?e=marian@onecom.no&h=e8093daab4d1730424287af2194c276d&i=%2FWeWillChangeIT-not_unique-1&gvm_json=1
        	var main_url = localStorage.url + 'g-homepage/-/OCintranet-100041/?e='+ fld_l_email +'&h=' + fld_l_password + '&i=%2FWeWillChangeIT-not_unique-1&gvm_json=1';
           
            $.ajax({
                url: main_url,
                dataType: "json",
                method: "POST",
                success: function(data1) {

                	var main_url = localStorage.url + 'api/index.php/auth/user?XDEBUG_SESSION_START=PHPSTORM';
                	//http://www.oceventmanager.com/api/index.php/auth/user?XDEBUG_SESSION_START=PHPSTORM
                	$.ajax({
		                url: main_url,
		                dataType: "json",
		                method: "GET",
		                success: function(obj) {

		                	if (obj.status == 'error') {

		                        shownotification(obj.message,"Profile");
		                        $("#login_submit").show();
		                        $(".loading").hide();
		                    }
		                    else {


		                        var DIR_Name = 'oc_photos';
		                        var a = new DirManager();
		                        a.create_r(DIR_Name, Log('created successfully'));
		                        

		                        var b = new FileManager();
		                        var img_src = obj.data.image.image_src;
		                        
		                        var image_name = getFileNameFromPath(img_src);
		                        var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
		                        

		                        $.ajax({
		                            url: STR,
		                            dataType: "html",
		                            success: function(DtatURL) {
		                                b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(obj.data.image.image_src), function(theFile) {

		                                    var ImgFullUrl = '';
		                                    ImgFullUrl = theFile.toURI();
		                                    
		                                    db.transaction(function(tx) {                                        
		                                        tx.executeSql("delete from OCEVENTS_user");
		                                        tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
		                                        localStorage.user_id = obj.data.id;
		                                        localStorage.event_id = obj.data.event_id;
		                                        localStorage.event_language = obj.data.event_language;
		                                        login_process();
		                                    });
		                                });

		                            }
		                        });
		                    }

		                },fail: function()
		                {
		                  shownotification("Failed","Login");
		                }
		            });            	
                	
                },fail: function()
                {
                  shownotification("Failed","Login");
                }
            
            });
        	}
            

         

        
   
    
}






function base64_encode(data) {

    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = '',
        tmp_arr = [];

    if (!data) {
        return data;
    }

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    var r = data.length % 3;

    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

//UnLink your facebook account
function unlinkwithfacebook() {


   db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length; 
                   
                  var pr = '';  
                  var ys = '';  
                  var noo = '';              
                  for (i = 0; i < len; i++) {
                    
                      if(results.rows.item(i).key_constant == 'GFacebookSettings')
                      {
                         pr = unescape(results.rows.item(i).key_val); 
                      } 
                      if(results.rows.item(i).key_constant == 'yes')
                      {
                         ys = unescape(results.rows.item(i).key_val); 
                      }
                      if(results.rows.item(i).key_constant == 'no')
                      {
                         noo = unescape(results.rows.item(i).key_val); 
                      }  
                      
                   }
                   var con = 'Are you sure you want to unlink facebook from your account?';
    

    // Show a custom confirmation dialog
    //
    
        navigator.notification.confirm(
            con,  // message
            onConfirmFacebook,              // callback to invoke with index of button pressed
            pr,            // title
            ys+","+noo         // buttonLabels
        );
   

      });
    });

    /*if (confirm('Are you sure you want to unlink facebook from your account?')) {


        var main_url = localStorage.url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                event_id: localStorage.event_id
            },
            success: function(obj) {
                alert("Facebook Account Unlinked Successfully");
                jQuery(".facebook-link").show();
                jQuery("#unlinkfacebook").hide();
            }

        });
    }   */
}

function onConfirmFacebook(buttonIndex) {
        if(buttonIndex == '1')
        {
            var main_url = localStorage.url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
              jQuery.ajax({
                  url: main_url,
                  dataType: "json",
                  method: "POST",
                  data: {
                      event_id: localStorage.event_id
                  },
                  success: function(obj) {
                      //navigator.notification.alert();
                      navigator.notification.alert(
                        'Facebook Account Unlinked Successfully',  // message
                        alertDismissed,         // callback
                        'Facebook',            // title
                        'Ok'                  // buttonName
                    );
      
                     // alert("Facebook Account Unlinked Successfully");
                     
                      
                      db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set fb_user_id = 0');
                                });
                      jQuery(".facebook-link").show();
                      jQuery("#unlinkfacebook").hide();
                  }
      
              });
        }
}

function alertDismissed()
{
  //do nothing here
}

//Link your facebook account
function linkwithfacebook() {
    jQuery(document).ready(function($) {

        if (!window.cordova) {
            var appId = prompt("Enter FB Application ID", "");
            facebookConnectPlugin.browserInit(appId);
        }
        facebookConnectPlugin.login(["email"],
            function(response) {


                var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
                var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

                var encoded_newstr = base64_encode(newstr);
                var encoded_access_token = base64_encode(access_token);
                //alert(encoded_access_token);
               // alert(encoded_newstr);
                
                // $("#login_submit").hide();
                // $(".loading").show();
                var main_url = localStorage.url + 'api/index.php/auth/FBUpdateData?XDEBUG_SESSION_START=PHPSTORM';
               // alert(main_url);
                //alert(localStorage.event_id);
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr,
                        event_id: localStorage.event_id
                    },
                    success: function(obj) {
                        //alert(obj.status);
                        //alert(obj.message);
                        if (obj.status == "success") {
                            //alert(obj.message);
                            var fb_uid = obj.data.fb_user_id;
                            db.transaction(function(tx) {
                                tx.executeSql('update OCEVENTS_user set fb_user_id = "' + fb_uid + '"');

                               // window.location.href = "profile.html";
                                changetoprofile();

                            });
                        } else {
                            localStorage.user_fid = '';

                           // alert("Error in Fb Login");
                           shownotification("Error in Fb Login","Login");


                        }
                    }
                });


            },
            function(response) {
                alert(JSON.stringify(response));
            });
    });
}

var fbLoginSuccess = function() {

     
      
    facebookConnectPlugin.login(["email"],
        function(response) {
          
            var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
            var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');

            var encoded_newstr = base64_encode(newstr);
            var encoded_access_token = base64_encode(access_token);

            var main_url = localStorage.url + 'api/index.php/auth/FBRemoveData?XDEBUG_SESSION_START=PHPSTORM';
            jQuery.ajax({
                url: main_url,
                dataType: "json",
                method: "POST",
                data: {
                    fb_access_token: encoded_access_token,
                    fb_user_id: encoded_newstr,
                    event_id: localStorage.event_id
                },
                success: function(obj) {
                    //alert(obj.status);
                    if (obj.status == "success") {

                        db.transaction(function(tx) {
                            tx.executeSql('update OCEVENTS_user set fb_user_id = ""');

                           // window.location.href = "profile.html";
                           changetoprofile();

                        });
                    }
                }
            });

            
        },
        function(response) {
            //alert(JSON.stringify(response));
        });
       
       
}


var login = function() {
    //alert('here');
    jQuery(document).ready(function($) {

        if (!window.cordova) {
            var appId = prompt("Enter FB Application ID", "");
            facebookConnectPlugin.browserInit(appId);
        }
        //var fld_l_url = jQuery("#fld_l_url").val();
        var fld_l_url = localStorage.surl;
          if(fld_l_url == '')
          {
             //alert('Please Enter Url');
             shownotification("Please Enter Url","Fb Login");
          }
          else if(!checkURL(fld_l_url)){
             // alert("Please Enter A Valid Url");
             shownotification("Please Enter A Valid Url","Fb Login");
            return false;
        }
           else {
           localStorage.url = fld_l_url + '/';
           
           
           
        facebookConnectPlugin.login(["email"],
            function(response) {

                //alert('here 1');
                var newstr = JSON.stringify(response.authResponse.userID).replace(/\"/g, '');
                var access_token = JSON.stringify(response.authResponse.accessToken).replace(/\"/g, '');
                //alert(access_token)
                var encoded_newstr = base64_encode(newstr);
                var encoded_access_token = base64_encode(access_token);
                // $("#login_submit").hide();
                //   $(".loading").show();
              //  alert(encoded_newstr);
               // alert(encoded_access_token);
               // alert(localStorage.event_id)
               //createTables();
               
               var main_url = localStorage.url + 'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
    	jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(obj) {
                var main_url = localStorage.url + 'api/index.php/auth/FBlogin?XDEBUG_SESSION_START=PHPSTORM';
              // alert(main_url)
                jQuery.ajax({
                    url: main_url,
                    dataType: "json",
                    method: "POST",
                    data: {
                        fb_access_token: encoded_access_token,
                        fb_user_id: encoded_newstr
                        //event_id: localStorage.event_id
                    },
                    success: function(obj) {
                        // alert(obj.message);
                         //alert(obj.status)
                         //alert(JSON.stringify(obj));
                        if (obj.status == "success") {

                          // alert(obj.status)
                            var DIR_Name = 'oc_photos'; 
                            var a = new DirManager();
                            a.create_r(DIR_Name, Log('created successfully')); 
                            var b = new FileManager();   
                            //alert(obj.data.image.image_src);	
                            var img_src = obj.data.image.image_src;

                            //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                            var image_name = getFileNameFromPath(img_src);
                            // alert(img_src);
                            //  alert(image_name);
                            var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                            $.ajax({
                                url: STR,
                                dataType: "html",
                                success: function(DtatURL) {
                                    
                                    //alert(DtatURL);  
                                    //adb logcat *:E		 
                                    // alert(obj.data.image.image_src);
                                    b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(obj.data.image.image_src), function(theFile) {

                                        var ImgFullUrl = '';
                                        ImgFullUrl = theFile.toURI();
                                        // alert(ImgFullUrl);
                                        db.transaction(function(tx) {
                                            tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_user (id integer primary key autoincrement,team,position,fb_user_id,fb_email,birthday_date,website, user_id, email, first_name, last_name,mobile, image_src, is_user_image, created,gender,player_code)');
                                            tx.executeSql("delete from OCEVENTS_user");
                                            tx.executeSql('INSERT INTO OCEVENTS_user (team,position,fb_user_id,fb_email,birthday_date,website,user_id,email,first_name,last_name,mobile,image_src,is_user_image,created,gender,player_code) VALUES ("' + obj.data.team + '","' + obj.data.position + '","' + obj.data.fb_user_id + '","' + obj.data.fb_email + '","' + obj.data.birthday_date + '","' + obj.data.website + '","' + obj.data.id + '","' + obj.data.email + '","' + obj.data.first_name + '","' + obj.data.last_name + '","' + obj.data.mobile + '","' + ImgFullUrl + '","' + obj.data.image.is_user_image + '","' + obj.data.created + '","' + obj.data.gender + '","' + obj.data.player_code + '")');
                                            localStorage.user_id = obj.data.id;
                                            localStorage.event_id = obj.data.event_id; 
                                            //alert('started') 
                                            getLoggedInUser();                                             
                                           // login_process();
                                        });
                                    });

                                }
                            });
                        } else {
                            localStorage.user_fid = '';
                           // alert(obj.message); 
                           shownotification(obj.message,"Facebook login");
                        }
                    }
                });
}
});

            },
            function(response) {
               // alert(JSON.stringify(response));
            });
            }
    });
}


function logout() {
    //alert('here')
    truncatealltables();
    var main_url = localStorage.url + 'api/index.php/auth/logout?XDEBUG_SESSION_START=PHPSTORM';
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        success: function(obj) {
            //alert(obj.status);                       
            if (obj.status == 'success') {

                
                localStorage.user_id = '';
                localStorage.instance_id = '';
                localStorage.event_id = '';
                localStorage.short_url = '';
                localStorage.url = '';
                localStorage.noteid = '';
                localStorage.instance = '';
                localStorage.voteforwarderid = '';
				localStorage.euid = '';
				localStorage.reloadPage = "";

                if (localStorage.fid != '' && localStorage.fid != undefined && localStorage.fid != null) {
                    facebookConnectPlugin.logout(
                        function(response) {
                            //window.location.href="index.html"; 
                        },
                        function(response) {
                            //alert(JSON.stringify(response)) 
                        });
                    localStorage.fid = '';
                    localStorage.clear();
                }
                localStorage.clear();
                window.location.href = "index.html";
            } else {
                localStorage.user_id = '';
                localStorage.clear();
                //alert(obj.message);
                shownotification(obj.message,"Logout");
                window.location.href = "index.html";
            }
        }
    });

}

function changetoprofile(id)
{
	$('.welcome-container').hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".agenda-item-container").hide();
	$(".agenda-item-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadprofile();  
}

// var fix_link = function()
// { 
//     $("a").each(function () { 
//         $(this).attr("dest_url", $(this).attr("href")) 
//         $(this).removeAttr("target") 
//         $(this).click(function () { 
//             document.location.href = $(this).attr("dest_url");
//         })
//     });
// }

function loadgamification() {

	$("#tooltipster-409679").hide();
	var css_url = localStorage.url+"resources/gamification/css/appearance.css.php?eid="+localStorage.event_id;
    $(".stylesheetDiv").html('<link rel="stylesheet" type="text/css" href="'+css_url+'">');
	// alert("hello");
	loadUserImages();
    $(".login-page-container").hide();
    $(".user-profile-container").hide();
    $(".agenda-menu-container").hide();
    $(".ticketing-container").hide();
    $(".leaderboards-container").hide();
    $(".contacts-container").hide();
    $(".notes-container").hide();
    $(".add-comments-container").hide();
    $(".add-questions-container").hide();
    $(".single-seeker-container").hide();
    $(".quiz-container").hide();
    $(".voting-page-container").hide();
    $(".last-container").hide();
    $(".view-friend-container").hide();
    $(".seeker-results-container").hide();
    $(".score-card-container").hide();
    $(".loading_agenda_items").hide();
    $(".ui-widget-overlay").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
    

    //var db = openDatabase('OCEVENTS', '1.0', 'OCEVENTS', 2 * 1024 * 1024);
    loadcommonthings(); 
    //window.location.href= 'inline.html'
    isLoggedIn(); 
    
    importfooter('g-homepage', 'home');
    
    innoti();
    
    
	//alert(localStorage.reloadPage);

    if(localStorage.voteforwarderid == undefined || localStorage.voteforwarderid == null || localStorage.voteforwarderid == ""){
    	localStorage.voteforwarderid = "";
    }
    if(localStorage.euid == undefined || localStorage.euid == null || localStorage.euid == ""){
    	localStorage.euid = "";
    }
     
    $(".welcome-container").show();
    $(".header").show();
    $(".dropdown-menu").show();
    $(".footertag").show();  

    if(localStorage.triggerbtn == "yes"){
    	$('.dropdown-btn').trigger('click');
    	localStorage.triggerbtn = "";
    	// location.reload();
    } 

    $(".welcome-container").html('<div class="row"><div class="welcome-slider video"><img class="main_banner_image" src=""></div><div class="col-xs-12" style="background-color:#fff;"><div class="welcome-title"><h1></h1></div><p>&nbsp;</p><div class="welcome-content"></div></div></div>');
    $(".welcome-container").css("margin-top", "0px")
    
    jQuery( document ).ready(function() {
    
    if(localStorage.mainlogoSmallImage) {
        $(".logo_inner").attr('src', localStorage.mainlogoSmallImage);
    }

    db.transaction(function(tx) {

        //alert("SELECT * FROM OCEVENTS_homepage ");
        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
            var len = results.rows.length;
            //            alert(results.rows.item(0).main_logo_small_image);
            if (results.rows.item(0).type == 'content') {
                if (results.rows.item(0).main_logo_small_image != undefined && results.rows.item(0).main_logo_small_image != null && results.rows.item(0).main_logo_small_image != '') {
                	localStorage.mainlogoSmallImage = results.rows.item(0).main_logo_small_image;
                    $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
                }
                if (results.rows.item(0).main_banner_image != undefined && results.rows.item(0).main_banner_image != null && results.rows.item(0).main_banner_image != '') {
                    $(".main_banner_image").attr('src', results.rows.item(0).main_banner_image);
                }
                  // alert("azx" + results.rows.item(0).banner_video)
                var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;  
                if(checkdefined(results.rows.item(0).banner_video) == 'yes')
                {
                   $('.welcome-slider').addClass('video'); 
                   $('.welcome-slider').css('background','#000');
                   $('.welcome-slider').parent().css({
					   // 'background-image' : 'url("http://cdn1.iconfinder.com/data/icons/DarkGlass_Reworked/128x128/actions/camera_test.png")',
					    'background-color' : '#000'
					});
                   $('.welcome-slider').html('');    

                  if(isIphone) {                                         
                     var comment_video = '<div class="video-player-wrapper"><iframe id="videoPlayer-' + results.rows.item(0).banner_video + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + results.rows.item(0).banner_video + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" webkit-playsinline></iframe></div>';
                  }
                  else {
                     var comment_video = '<div class="video-player-wrapper"><iframe id="videoPlayer-' + results.rows.item(0).banner_video + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + results.rows.item(0).banner_video + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div>';
                  }
                    $('.welcome-slider').html(comment_video);
                		                     
                }
                

                $(".welcome-title h1").html(results.rows.item(0).main_title);
                $(".welcome-content").html(results.rows.item(0).main_text);
            } else if (results.rows.item(0).type == 'url') {
                // var ref = window.open('http://apache.org', '_system', 'location=yes');
                if (results.rows.item(0).main_logo_small_image != undefined && results.rows.item(0).main_logo_small_image != null && results.rows.item(0).main_logo_small_image != '') {
                	localStorage.mainlogoSmallImage = results.rows.item(0).main_logo_small_image;
                    $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
                }
                
                var iphoneDetect = navigator.userAgent.indexOf('iPhone') >= 0; 

                var iframeSrcUrl = results.rows.item(0).iframe_url + "&isApp=1";
                iframeSrcUrl = iframeSrcUrl.replace("http://_", "http://");
                
                // $(".welcome-container").html('<iframe mozallowfullscreen="true" webkitallowfullscreen="true" allowfullscreen="true" src=' + results.rows.item(0).iframe_url + ' name="homepage-content" id="homepage-content" />');
                $(".welcome-container").html('<iframe mozallowfullscreen="true" webkitallowfullscreen="true" allowfullscreen="true" src=' + iframeSrcUrl + ' name="homepage-content" id="homepage-content" />');
                
                
                //alert(len)
                if(checkdefined(localStorage.menu) == 'yes')
                {
                
                   var website_id =  localStorage.website_id;
                  // alert(website_id)
                $(document).ready(function () {
                if (typeof $("#homepage-content")[0] !== "undefined") {
                $('.welcome-container').append('<a id="gamification-footer-menu" class="gamification-footer-menu show-menu" href="javascript:void(0);">Pages</a>');
                $('.welcome-container').append('<div class="gamification-mobile-aside-wrapper show-menu" id="gamification-mobile-aside-wrapper"><div class="mobile-aside-container"><form class="mobile-aside-search-form"><div class="main-input-container"><button onclick="javascript:void(0);"><i class="fa fa-search"></i></button><input type="text" class="mobile_search_string" data-website="'+website_id+'" placeholder="Search"></div></form><ul class="mobile-aside-menu" id="gamificationMobileMenu"><div id="sitebuilderNavigation"></div></ul></div></div>');
                
           
                
                  var navCounter = 0;
      
				function getNavigation() {
					if (navCounter == 20) {
						return false;
					}

                if (typeof $("#homepage-content")[0].contentWindow.sbGamificationNavigation !== "undefined") {
                    $(".gamification-footer-menu").addClass('show-menu');
                    $(".gamification-mobile-aside-wrapper").addClass('show-menu');

                    $("#gamification-footer-menu").on("click", function () {
                        $("#gamificationMobileMenu").show();
                       // $("#gamificationMobileSearch").hide(); 
                        $('.main-wrapper').toggleClass("gamification-mobile-aside-wrapper-open");

                        return false;
                    });


                    var sbGamificationNavigation = $("#homepage-content")[0].contentWindow.sbGamificationNavigation;
                          //alert(sbGamificationNavigation)
                    $("#sitebuilderNavigation").html(sbGamificationNavigation);
                    $("#sitebuilderNavigation li a").each(function(k, v)
                    {
                      var href = $(v).attr("href"); 
                       //alert(localStorage.url+href);
                       $(v).attr("href",localStorage.url+href);
                    });
                    $("#sitebuilderNavigation li a").on("click", function () {
                    
                        $("#sitebuilderNavigation li a").removeClass("active");
                        $(this).addClass("active");
                    });
                } else {
                    setTimeout(function () {
                        getNavigation();
                    }, 1000);
                }

                navCounter++;

                return true;
            }

            getNavigation();
        }
        //$(' .main-wrapper > header:first-child').css('display','none !important;');
        //$("#homepage-content").contents().find("header").css("display", "none !important;");
        
    var interval = 300;
    var websiteId = $('.mobile_search_string').data('website');
    $('.mobile_search_string').keyup(function () {
        var filter = $(this).val();
         //alert(websiteId)
          //alert(filter)
            //alert(localStorage.url + 'modules/sitebuilder/ajax/fe_search_ws.php')
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
                        //alert(JSON.stringify(jsonData));
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
												<a href="'+ localStorage.url + searchResult["url"] + '" target="homepage-content">\
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
                        //alert(res)
                        //$('.mobile-aside-search-results').html(res);
                        //$('#gamificationMobileMenu').hide();
                        //$('#gamificationMobileSearch').show();
                        $("#sitebuilderNavigation").html('<div id="gamificationMobileSearch" style="display: block;"><h3>Search results</h3>');
                        $("#sitebuilderNavigation").append(res);
                        $("#sitebuilderNavigation").append('</div>');
                    }
                });
            }, interval);
        } else {
            $("#gamificationMobileMenu").show();
            $("#gamificationMobileSearch").hide();
        }
    });
    
var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();           
        
        
    });
    }
   
    
            }
            else if (results.rows.item(0).type == 'module') { 
            	
              //alert(JSON.stringify(results.rows.item(0)));
              var str = results.rows.item(0).main_title;
              var sp = str.split("/");
              //var sp = split("/",results.rows.item(0).module_type);   
              var ag_id = sp[0];
              var ag_name = sp[1];
              //alert("sp => " + sp);
              //alert("ag_id => " + ag_id);
              //alert("ag_name => " + ag_name);
                  if (ag_name == 'voting')
                  {
                     localStorage.agenda_id = ag_id;     
                    changetovoting();
                  }
                  else
                  {
                    //localStorage.agenda_id = results.rows.item(0).main_title;
                    localStorage.agenda_id = ag_id;
                    //alert(localStorage.agenda_id)
                    //window.location.href = 'agenda_item.html';
                    changetoagendaitem();
                    }
            } else { 
                
                $(".main-container").html("No Module Found");
            }



        });
    });
    });
} 

function hideimg()
{
   
  jQuery('#myimg').hide();
  
}

function playPause() { 
    var myVideo = document.getElementById("video1");
        
    if (myVideo.paused) 
    {    
    $('.video_comment').hide();    
        myVideo.play(); 
    }else{ 
        myVideo.pause(); 
        $('.video_comment').show();
        }                
}


function cancelagendasubmit()
{
  $('.after-rating-container').addClass('hidden');
  $('.comment-form').addClass('hidden');
}

function onFail(message) {
    //alert('Failed because: ' + message);
}

function capturePhoto() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 100,
        allowEdit: true,
        destinationType: destinationType.FILE_URI,
        saveToPhotoAlbum: false
    });
}


function getPhoto(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onPhotoURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.NATIVE_URI,
        sourceType: source
    });
}

// Called when a photo is successfully retrieved
function onPhotoURISuccess(imageURI) {

    var imageData = imageURI;
    var photo_ur = imageData;
    var options = new FileUploadOptions();
    var imageURI = photo_ur;
    options.fileKey = "image";
    if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
        var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
    } else {
        var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
    }
    options.fileName = newfname;
    //alert(newfname);
    options.mimeType = "image/jpeg";
    var params = new Object();
    options.params = params;
    //options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
    options.chunkedMode = false;
    var ft = new FileTransfer();
    //alert(imageURI);
    ft.upload(imageURI, encodeURI(localStorage.url + "api/index.php/auth/updateUserImage"), win, fail, options);

    function win(r) {
        //alert("Code = " + r.responseCode.toString());
        //alert("Response = " + r.response.message);
        var resp = JSON.parse(r.response);
        //alert(resp.status);
        if (resp.status == 'success') {
            // alert('here')
            // alert(resp.data.image.image_src)
            var DIR_Name = 'oc_photos';
            var a = new DirManager();
            a.create_r(DIR_Name, Log('created successfully'));
            var b = new FileManager();

            var img_src = resp.data.image.image_src;
            //alert(img_src);		
            //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
            var image_name = getFileNameFromPath(img_src);

            var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


            jQuery.ajax({
                url: STR,
                dataType: "html",
                success: function(DtatURL) {

                    //alert(DtatURL);  
                    //adb logcat *:E		 
                    // alert(obj.data.image.image_src);
                    b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(resp.data.image.image_src), function(theFile) {

                        var ImgFullUrl = '';
                        ImgFullUrl = theFile.toURI();
                        //alert(ImgFullUrl);
                        db.transaction(function(tx) {
                            tx.executeSql('update OCEVENTS_user set image_src = "' + ImgFullUrl + '",is_user_image="true"');

                            //window.location.href = "profile.html";
                            localStorage.profileuis = "added";
                            changetoprofile();

                        });

                    });
                }
            });
        }
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        alert("upload error source " + error.source);
        alert("upload error target " + error.target);
    }
}

function captureImage() {
    // Take picture using device camera and retrieve image as base64-encoded string
    navigator.camera.getPicture(onImageURISuccess, onFail, {
        quality: 100,
        allowEdit: true,
        destinationType: destinationType.FILE_URI,
        saveToPhotoAlbum: false
    });
}
function captureVideo() {
var options = { limit: 1 };

navigator.device.capture.captureVideo(onVideoCapURISuccess, onFail, options);

}


function getVideo(source) {
    navigator.camera.getPicture(onVideoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source,
    mediaType: 1 });
}

function onVideoURISuccess(videoURI) {

var newfname = videoURI.substr(videoURI.lastIndexOf('/') + 1);
jQuery(".upldFileNm").html(newfname);
jQuery('.swiper-container').show();
jQuery('.preview').html('<img  id="azxazx"src ="img/dummy_video.gif" width="80" height="80" />');

$('.ui-widget-overlay').hide();
$('#footerSlideContainer').slideUp('fast');
$('#footerSlideContainerbuttn').slideUp('fast');
jQuery(".main-questions-form-container").show();
localStorage.imageURI = videoURI;
localStorage.mime = 'video/mp4';
}

function onVideoCapURISuccess(videoURI) {
 
var video = videoURI[0].fullPath;
var newfname = video.substr(video.lastIndexOf('/') + 1);
jQuery(".upldFileNm").html(newfname);
jQuery('.swiper-container').show();
jQuery('.preview').html('<img src ="img/dummy_video.gif" width="80" height="80" />');
$('.ui-widget-overlay').hide();
$('#footerSlideContainer').slideUp('fast');
$('#footerSlideContainerbuttn').slideUp('fast');
jQuery(".main-questions-form-container").show();
localStorage.imageURI = video;
localStorage.mime = 'video/mp4';
}


function uploadImage(source) {
    // Retrieve image file location from specified source
    navigator.camera.getPicture(onImageURISuccess, onFail, {
        quality: 50,
        destinationType: destinationType.NATIVE_URI,
        sourceType: source
    });
}

// Called when an image from comment is successfully retrieved
function onImageURISuccess(imageURI) {
	//alert(imageURI);
	jQuery('.swiper-container').show();
	var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);

	$('.ui-widget-overlay').hide();
	$('#footerSlideContainer').slideUp('fast');
	$('#footerSlideContainerbuttn').slideUp('fast');
	jQuery(".main-questions-form-container").show();

	if(localStorage.imageURI) {
		localStorage.imageURI += ",,," + imageURI;
	}
	else {
		localStorage.imageURI = imageURI;
	}
	if(localStorage.imageURI) {
		var allImageURI = localStorage.imageURI.split(",,,");
	    var len = allImageURI.length-1;
		$('#uploadImgePreviews').append('<div id="hideDiv'+len+'" class="template-upload swiper-slide fade in dz-preview dz-image-preview swiper-slide-active" style="width: 93.1px; margin-right: 5px;"><div class="dz-details"><div class="dz-filename"><span class="upldFileNm" data-dz-name="">'+newfname+'</span></div><div data-dz-size="" class="dz-size"><strong></strong> </div><div class="preview"><img src = '+imageURI+' width="80" height="80" /></div></div><i data-dz-remove="" class="fa fa-times cancel" onclick="hidethumb('+len+');"></i></div>');
	}

	//localStorage.imageURI += imageURI;
	localStorage.mime = 'image/jpeg';


}

function hidethumb(pos)
{
	var allImageURI = localStorage.imageURI.split(",,,");
	var len = allImageURI.length;
	if(len != 0) {
		for(i=0; i<len; i++) {
			if(i==0) {
				if(pos == i) {
					allImageURI[pos] = "noImage";
				} else {
					localStorage.imageURI = allImageURI[i];
				}
			}
			else{
				if(pos == i) {
					allImageURI[pos] += ",,,noImage";
				} else {
					localStorage.imageURI += ",,," + allImageURI[i]
				}
			}
		}
	}
	else {
		localStorage.imageURI = '';
		jQuery('.swiper-container').hide();
	}
}

function showbuttons() {
    jQuery('.hidden_button').attr('style', 'display:block !important');
    jQuery('.selfie_capture').hide();
}

function showimagebuttons()
{

    //jQuery('.captureimage').show();
    //jQuery('.uploadimage').show();
    jQuery('.ui-widget-overlay').show();
    jQuery('#footerSlideContainerbuttn').slideDown('fast');
    jQuery(".main-questions-form-container").hide();   
	var buttons_html = '<div><a href="#" onclick="captureImage()">Take a Photo</a></div>';
	buttons_html += '<div><a href="#" onclick="uploadImage(pictureSource.PHOTOLIBRARY);">Choose a Photo</a></div>';
	buttons_html += '<div><a href="#" onclick="captureVideo();">Take a Video</a></div>';
	buttons_html += '<div><a href="#" onclick="getVideo(pictureSource.PHOTOLIBRARY);">Choose a Video</a></div>';
	buttons_html += '<div><a href="#" onclick="canceloptions()">Cancel</a></div>';
    jQuery('#footerSlideContainerbuttn').html(buttons_html);
     //alert(buttons_html)
}

function shownotesbuttons()
{
    //jQuery('.captureimage').show();
    //jQuery('.uploadimage').show();
    jQuery('.ui-widget-overlay').show();
    jQuery('#footerSlideContainer').slideDown('fast');
    jQuery(".main-questions-form-container").hide();   
     var buttons_html = '<div><a href="#" onclick="captureImage()">Take a Photo</a></div>';
     buttons_html += '<div><a href="#" onclick="uploadImage(pictureSource.PHOTOLIBRARY);">Choose a Photo</a></div>';
     buttons_html += '<div><a href="#" onclick="captureVideo();">Take a Video</a></div>';
     buttons_html += '<div><a href="#" onclick="getVideo(pictureSource.PHOTOLIBRARY);">Choose a Video</a></div>';
     buttons_html += '<div><a href="#" onclick="canceloptions()">Cancel</a></div>';
     jQuery('#footerSlideContainer').html(buttons_html);
     //alert(buttons_html)
}

function canceloptions(){
  
   $('.ui-widget-overlay').hide();
    $('#footerSlideContainerbuttn').slideUp('fast');
   $('#footerSlideContainer').slideUp('fast');
   jQuery(".main-questions-form-container").show();
} 

       
//function to play video
function playvideo(videoUrl) {
    var options = {
        successCallback: function() {
            console.log("Video was closed without error.");
        },
        errorCallback: function(errMsg) {
            console.log("Error! " + errMsg);
        }
    };
    window.plugins.streamingMedia.playVideo(videoUrl, options);
}

function checkdefined(str) {
    //alert(str)
    if (str != '' && str != undefined && str != 'undefined' && str != null && str != 'null') {
        return 'yes';
    } else {
        return 'no';
    }
}

//load agenda item
function loadagendaitem() {

    jQuery(document).ready(function($) {  
        
        importfooter('View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda-item');
		var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '?gvm_json=1';

		// if(checkdefined(localStorage.direct_access_module_href) == 'yes')
		// {
		// 	if(localStorage.ins_id == localStorage.agenda_id)
		// 	{
		// 		//importfooter(localStorage.direct_access_module_href, 'agenda-item');
		// 		//var main_url = localStorage.url + localStorage.direct_access_module_href + '?gvm_json=1';
		// 		var inputString = localStorage.direct_access_module_href;
		// 		if ( inputString.indexOf("comment") > -1 ) {
		// 			window.location.href="add_comments.html";
		// 		} 
		// 		else if ( inputString.indexOf("seeker") > -1 ) {
		// 			changetoseeker();
		// 		}
		// 		else if ( inputString.indexOf("question") > -1 ) {
		// 			changetoaddquestions();
		// 		}
		// 		else if ( inputString.indexOf("Quiz") > -1 ) {
		// 			window.location.href="add_quiz.html";
		// 		}
		// 		else if ( inputString.indexOf("quiz") > -1 ) {
		// 			window.location.href="add_quiz.html";
		// 		}
		// 		else if ( inputString.indexOf("vote") > -1 ) {
		// 			changetovoting();
		// 		}
		// 	}
		// 	else
		// 	{       
		// 		importfooter('View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda-item');
		// 		var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '?gvm_json=1';
		// 	}
		// }
		// else
		// {
		// 	importfooter('View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda-item');
		// 	var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '?gvm_json=1';
		// }

		//loadcommonthings(); 
		isLoggedIn();
		//alert(main_url)
		jQuery(".loading_agenda_items").show();
		jQuery(".notes-agenda-container").hide();
		jQuery(".list-agendalist-container").hide();

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(data) {
            	//alert(checkdefined(data.prevPresentation));
               if (checkdefined(data.prevPresentation) == 'yes') {
                    $('.prev').attr('onclick', 'gotoagenda("' + data.prevPresentation.instance_id + '");');
                    $('#prevmbtn').css("display", "block !important");
                } else {
                    $('.prev i').hide();
                }
                if (checkdefined(data.nextPresentation) == 'yes') {
                    $('.next').attr('onclick', 'gotoagenda("' + data.nextPresentation.instance_id + '");');
                    $('#nextmbtn').css("display", "block !important");
                } else {
                    $('.next i').hide();
                }
                if(checkdefined(data.presentation.title.value) == 'yes')
                {
                    $(".green-text").html(data.presentation.title.value);
					$('.green-text').attr('onclick', 'gotoagenda("' + localStorage.agenda_id + '")');
                    $(".agenda-item-img-info h5").html(data.presentation.title.value);
                }
                else
                {
                    $(".green-text").hide();
                    $(".agenda-item-img-info h5").hide();
                }               
                
                if(checkdefined(data.presentation.location) == 'yes')
                {
                	if(checkdefined(data.presentation.title.value) == 'yes'){
						var agendaItemImgInfo = data.presentation.title.value;
					}
					else {
						var agendaItemImgInfo = "";
					}
                   $(".agenda-item-img-info").html('<h5>'+agendaItemImgInfo+'</h5><p><i class="fa fa-map-marker"></i>'+data.presentation.location+'</p>');
                }
                if(checkdefined(data.presentation.group_item) == 'yes')
                {
                   $(".date p").html(data.presentation.group_item);
                }
                else
                {
                  $('.date-wrapper').hide();
                }
                if(checkdefined(data.presentation.speaker_name.value) == 'yes')
                {
                    $(".future-title").html(data.presentation.speaker_name.value);
                }
                else
                {
                    $(".future-title").hide();
                }
                if(checkdefined(data.presentation.description.value) == 'yes')
                {
                    $(".future-info").html(data.presentation.description.value);
                }
                else
                {
                    $(".future-info").hide();
                }
                if (checkdefined(data.presentation.speaker_image) == 'yes') {
                    var imgurl = localStorage.url + 'resources/files/images/' + data.presentation.speaker_image.__extra.medium_file_name;
                    $(".agenda-main-img").attr("style", "background-image:url(" + imgurl + ")");
                }
                //alert(data.presentation.time);
                if (checkdefined(data.presentation.time) == 'yes') {
                    $('.fa-clock-o').html(data.presentation.time)
                }
                else
                {
                  $('.time-wrapper').hide();
                }
                
                
                var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;
                if (checkdefined(data.presentation.__videoItem) == 'yes') {

					$.each(data.presentation.__videoItem, function(key, res) {
						if(res){
							if (checkdefined(res.hosted_vimeo_id) == 'yes') {
								if(isIphone) {
									if(checkdefined(res.hosted_vimeo_link_hd) == 'yes') {
										// alert("hd");
										var videoUrl = "http:" + res.hosted_vimeo_link_hd;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd960) == 'yes') {
										// alert("sd960");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd960;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd640) == 'yes') {
										// alert("sd640");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd640;
									}
									else if(checkdefined(res.hosted_vimeo_link_hls) == 'yes') {
										// alert("hls");
										var videoUrl = "http:" + res.hosted_vimeo_link_hls;
									}
									else if(checkdefined(res.hosted_vimeo_link_mobile) == 'yes') {
										// alert("mobile");
										var videoUrl = "http:" + res.hosted_vimeo_link_mobile;
									}
									
									comment_video = '<div class="video-player-wrapper"><video src="http:' + res.hosted_vimeo_link_sd640 + '" webkit-playsinline style="width: 100%; background-color: #000;" controls></video></div>';
							
								} 
								else {
									var comment_video = '<div class="video-player-wrapper"><iframe id="videoPlayer-' + res.hosted_vimeo_id + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + res.hosted_vimeo_id + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div>';
								}
							$('.here-video').html(comment_video);
							}
						}
						else{
							$('.here-video').html("");
						}
					});
                }
                if (checkdefined(data.presentation.embeded_html.value) == 'yes') {
                    $(".future-info").append('<div class="video-wrapper">' + data.presentation.embeded_html.value + '</div>');
                }
                
          $(".presentation-modules").html('&nbsp;');
                $.each(data.presentationModules, function(key, val) {

                    var container_class = val.container_class;
                    var icon_class = val.icon_class;
                    var text = val.text;
                    var onclick = '';
                    
                    if(val.name == 'comments')
                    {
                       onclick = 'onclick="changetoaddcomments(); return false;"';  
                       // onclick = 'href="add_comments.html"';
                       
                    }     
                    if(val.name == 'q_and_a')
                    {
                        onclick = 'onclick="changetoaddquestions(); return false;"';
                    }
                    if(val.name == 'quiz')
                    {
                        onclick = 'onclick="changetoaddquiz(); return false;"';
                        // onclick = 'href="add_quiz.html"';
                    }
                    if(val.name == 'voting')
                    {
                        onclick = 'onclick="changetovoting(); return false;"';
                    }
                    if(val.name == 'seeker')
                    {
                      onclick = 'onclick="changetoseeker(); return false;"';
                    }
                    //alert(text)
                    
                   
                    
                    $(".presentation-modules").append('<li><a  '+onclick+'><div class="cell"><i class="' + icon_class + '"></i></div><div class="cell">' + text + '</div></a></li>');

                });

                if (data.hasRating == true) {
                    $('.agenda-item-rating-container').show();
                    var ratin = data.ratevalue;
                    //alert(ratin)
                    var maxratin = 5;
                   // $('.item-interactions').html('<div class="item-interaction item-interaction-rate interaction-box" data-ratevalue="'+ratin+'" data-original-title="" title="">');
                   $('.item-interaction-rate').attr('data-ratevalue',ratin);
                    var str = '';
                    for(k = 1; k<=maxratin;k++)
                    {
                        //var active = '';
                        if(k <= ratin )
                        {
                         // alert(ratin)
                         // alert(k)
                          //active = 'active'
                          $('.f'+k).addClass('active');
                        }
                    //    str += '<a href="#" class="rate-star '+active+'" data-rate="'+k+'"><i class="fa fa-star"></i></a>';
                        
                      
                    }
                    //alert(str)
                    //$('.item-interactions').append(str);
                  // $('.item-interactions').append('</div>'); 
                  if(data.displayComment == true)
                  {
                     $('#rate').removeClass('hidden'); 
                     //$('.after-rating-container').removeClass('hidden'); 
                  }
                }
                else {

                    $('.agenda-item-rating-container').hide();
                }
                db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'YourRating')
                    {
                        $('.agenda-item-rating-container .urrate').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addRatingSubmit')
                    {
                        $('#rate').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'WriteCommentPlaceholder')
                    {
                        $('.comment-input').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'RatingPlacedMessage')
                    {
                        $('.msg').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addCommentSubmit')
                    {
                        $('.send-btn').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Cancel')
                    {
                        $('.cancel-btn').html(unescape(results.rows.item(i).key_val));                     
                    }
                 }
           });
        });
                $(".list-agendalist-container").hide();
                $(".agenda-item-container").show();
                $(".loading_agenda_items").hide();
            }
        });

    });
}

function submitrating()
{
    var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/submit/rating?gvm_json=1';
    $('#rate').hide();
    $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data:{rate:localStorage.ratin},
            success: function(data) {
            //alert(data)
              $('.after-rating-container').removeClass('hidden');
              $('.comment-form').removeClass('hidden');
            }
          });    
}

function submitagendacomment()
{
   var main_url = localStorage.url + 'View-presentation/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/submit/comment?gvm_json=1';
   var comm = $('.comment-input').val();
  // alert(comm)
   var status = 1; 
    $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data:{comment:comm,status:status},
            success: function(data) {
            //alert(data)
              //$('.after-rating-container').removeClass('hidden');
              $('.comment-form').addClass('hidden');
              
              db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'CommentPlacedMessage')
                    {
                        $('.msg').html(unescape(results.rows.item(i).key_val));                     
                    }
                  }
                });
              });                    
            }
          });   
}

function rateme(id)
{
  //alert(id)
  localStorage.ratin = id;
}

//got to agenda item
function gotoagenda(agenda_id) {
    localStorage.agenda_id = agenda_id;
    //window.location.href = 'agenda_item.html';
    changetoagendaitem();
}

//function to fetch user points
function loadticket() {
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        jQuery(".loading_agenda_items").show();
        importfooter('ticketing', 'home');
        db.transaction(function(tx) {
            
            tx.executeSql('delete from OCEVENTS_ticket');
            tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'MyTicket')
                    {
                        $('.ticketing-title-wrapper h1').html(unescape(results.rows.item(i).key_val));                     
                    }
                 }
           });
           //alert("SELECT * FROM OCEVENTS_events where event_id = '"+localStorage.event_id+"' ")
           tx.executeSql("SELECT * FROM OCEVENTS_events where event_id = '"+localStorage.event_id+"' ", [], function(tx, results) {
                  var len = results.rows.length;                  
                  var event_title = results.rows.item(0).title;
                  //alert(event_title)
                  $('.ticketing-content h3').html(event_title);
           });       
            
        });
        $(".ticketing-container").hide();
        var main_url = localStorage.url + 'ticketing/-/' + localStorage.event_id + '/?gvm_json=1';
        // alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                var DIR_Name = 'oc_photos';
                var a = new DirManager();
                a.create_r(DIR_Name, Log('created successfully'));
                var b = new FileManager();
                var img_src = localStorage.url + obj.ticketSrc;
                var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
                // alert(img_src);
                var image_name = getFileNameFromPath(img_src);
                //alert(image_name);

                //alert(imagedatalength);
                jQuery.ajax({
                    url: STR,
                    dataType: "html",
                    success: function(DtatURL) {
                        b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(localStorage.url + obj.ticketSrc), function(theFile) {
                            //alert(DtatURL);
                            var ImgFullUrl = '';
                            ImgFullUrl = theFile.toURI();

                            db.transaction(function(tx) {

                                tx.executeSql("insert into OCEVENTS_ticket (user_id,ticketCode,ticketSrc) values ('" + localStorage.user_id + "','" + obj.ticketCode + "','" + ImgFullUrl + "')");
                                showTicket();
                            });
                        });
                    }
                });

            }
        });
    });
}

//function to show user ticket
function showTicket() {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_ticket", [], function(tx, results) {
            jQuery(".ticket_code").html(results.rows.item(0).ticketCode);
            jQuery(".qr_photo").attr("src", results.rows.item(0).ticketSrc);
            jQuery(".ticketing-container").show();
            jQuery(".loading_agenda_items").hide();
        });
    });
}

//function to fetch user points
function loadpoints() {
    jQuery(document).ready(function($) {
       // loadcommonthings(); 
        isLoggedIn();  
        jQuery(".loading_agenda_items").show();
        importfooter('user-points', 'points');
        $(".leaderboards-container").hide();
        // $(".yourscores-leaderboards-container").hide();
       	// $(".teamscores-leaderboards-container").hide();
       	// $(".yourteam-leaderboards-container").hide();
        var main_url = localStorage.url + 'user-points/?gvm_json=1';
        // alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                //alert(obj.hideTeamScores)
                var hideTeamScores = obj.hideTeamScores;
                //var label =  obj.breadcrumbs.text;
                //alert(obj.breadcrumbs);
                //alert(label);
                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label = val.text;
                });
                 //alert(obj.totalPoints);
                 if(checkdefined(obj.totalPoints) == 'yes')
                 {
                    localStorage.total_points = obj.totalPoints;
                 }
                 else
                 {
                      localStorage.total_points = 0;
                 }
                
                var imagedatalength = obj.categories.length;
                db.transaction(function(tx) {
                    
                    tx.executeSql('delete from OCEVENTS_points');
                    tx.executeSql("SELECT * FROM OCEVENTS_points", [], function(tx, results) {
                        var len_ag = results.rows.length;
                        // alert(len_ag);
                       /* if (imagedatalength == len_ag && len_ag != 0) {
                            showPointsData();
                        } else {  */
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_points');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = '';
                                    //if (val.count != null && val.count != undefined && val.count != 'null' && val.count != '') {
                                    if(checkdefined(val.count) == 'yes' || val.count == '0')
                                    {
                                        green_count = val.count;
                                        //alert(green_count)
                                    }
                                   // if(checkdefined(val.userTotal) == 'yes')
                                   // {
                                        tx.executeSql("insert into OCEVENTS_points (alias,user_id,name,position,userTotal,green_count,hideTeamScores,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal + "','" + green_count + "','" + hideTeamScores + "','" + label + "' ,'" + val.instance_id + "' )");
                                   // }
                                    
                                   // alert("insert into OCEVENTS_points (alias,user_id,name,position,userTotal,green_count,hideTeamScores,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.userTotal + "','" + green_count + "','" + hideTeamScores + "','" + label + "' ,'" + val.instance_id + "' )")
                                    //alert(val.position);
                                    co++;
                                    // alert(co);
                                    //alert(imagedatalength); 
                                    if (imagedatalength == co) {
                                        //alert(co);
                                        //alert(imagedatalength);
                                        // alert('going');
                                        showPointsData();
                                    }
                                });
                            });
                        

                    });

                });
            }

        });
    });
}

//function to show user points
function showPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_points", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;
            var hideTeamScores = results.rows.item(0).hideTeamScores;
            if (hideTeamScores == 'false') {
                $('.teampoints').show();
                $('.yourteam').show();
                $('.user-points-table-title tbody tr th').attr('class', 'col-xs-4');
            }
            $(".green-text").html(label);
            var group_title = '';

            //alert(results.rows.item(0).hideTeamScores);
            for (i = 0; i < len; i++) {
                //alert(results.rows.item(i).userTotal);
                  var icon = '';
                  var user_total = '0';
                   var id = results.rows.item(i).userTotal ;
               if(checkdefined(id) == 'yes')
               {
                  user_total = formatpoints(id);
               }
                var val = results.rows.item(i);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                        user_total = localStorage.total_points;
                    }
                var green_count_html = '';
                if (checkdefined(results.rows.item(i).green_count) == 'yes' || results.rows.item(i).green_count == '0') {
                    var green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                }
              
               
                
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotopoints(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + '<span class="icon"></span>&nbsp;' + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gotopoints(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            
            db.transaction(function(tx) {
    
   
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });      
            
            //jQuery(".leaderboards-container").show();
           jQuery(".yourscores-leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to format points string
function formatpoints(id)
{
  if(id.length == 7)
   {
      var user_total = id[0]+id[1]+id[2]+id[3]+' '+id[4]+id[5]+id[6];
   }
   else if(id.length == 6)
   {
      var user_total = id[0]+id[1]+id[2]+' '+id[3]+id[4]+id[5];
   } 
   else if(id.length == 5)
   {
      var user_total = id[0]+id[1]+' '+id[2]+id[3]+id[4];
   } 
   else if(id.length == 4)
   {
      var user_total = id[0]+' '+id[1]+id[2]+id[3];
   }
   else
   {
      var user_total = id;
   }
   return user_total;
}

//function to go to user point detail page
function gotopoints(instance_id) {
    localStorage.instance_id = instance_id;
    //window.location.href = 'user_detail.html';
    changetouserdetail();
}

//function to fetch user detail 
function loaduserdetail() {
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        $(".leaderboards-container").hide();
		// $(".yourscores-leaderboards-container").hide();
		// $(".teamscores-leaderboards-container").hide();
		// $(".yourteam-leaderboards-container").hide();
        jQuery(".loading_agenda_items").show();
        importfooter('user-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'points');
        var main_url = localStorage.url + 'user-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';
         //alert(main_url)
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                var classcss = '';
                $.each(obj.topScoresViewVars.items, function(key, val) {
                    var classcss = "";
                    //alert(localStorage.user_id)
                    if(val.is_current_user == true || val.is_current_user == 'true')
                    {
                        classcss= 'current-user';
                    }
                    if (val.image != '') {
                        var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url(' + val.image + ');"></div></span></td>';
                    } else {
                        var newtd = '<td class="avatar-col"></td>';
                    }
                    i++;
                     var id = val.points ;
                     var user_total = formatpoints(id);
                     $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + i + '</span></td>' + newtd + '<td><span class="name">' + val.name + '</span></td><td class="point">' + user_total + '</td></tr>');

                });
                
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    var user_total = '';
                    var id = val.userTotal ;
                    if(checkdefined(id) == 'yes')
                    { 
                      var user_total = formatpoints(id);
                    }  
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                        user_total = localStorage.total_points;
                    }
                    if (val.count > 0) {
                        var cnt = '<span class="count">' + val.count + '</span>';
                    } else {
                        var cnt = '';
                    }
                    
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gotopoints(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gotopoints(' + val.instance_id + ')">' + cnt + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                db.transaction(function(tx) {
    
   
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });
                //jQuery(".leaderboards-container").show();
				jQuery(".first-container").show();
				jQuery(".last-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}

//function to fetch team points
function loadteampoints() {
    jQuery(document).ready(function($) {
        // loadcommonthings(); 
        isLoggedIn();
        importfooter('team-points', 'team-points');
        jQuery(".loading_agenda_items").show();
       	$(".leaderboards-container").hide();
        // $(".yourscores-leaderboards-container").hide();
       	// $(".teamscores-leaderboards-container").hide();
       	// $(".yourteam-leaderboards-container").hide();
        var main_url = localStorage.url + 'team-points/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label = val.text;
                });
                // alert(label);
                var imagedatalength = obj.categories.length;
                db.transaction(function(tx) {
                    
                    tx.executeSql('delete from OCEVENTS_teampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_teampoints", [], function(tx, results) {
                        var len_ag = results.rows.length;
                        // alert(len_ag);
                        if (imagedatalength == len_ag && len_ag != 0) {
                            showTeamPointsData();
                        } else {
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_teampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = 0;
                                    if (val.count != null && val.count != undefined && val.count != 'null' && val.count != '') {
                                        green_count = val.count;
                                    }
                                    tx.executeSql("insert into OCEVENTS_teampoints (alias,user_id,name,position,userTotal,green_count,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "' )");
                                    //alert(val.position);
                                    co++;
                                    // alert(co);
                                    //alert(imagedatalength); 
                                    if (imagedatalength == co) {
                                        //alert(co);
                                        //alert(imagedatalength);
                                        // alert('going');
                                        showTeamPointsData();
                                    }
                                });
                            });
                        }

                    });

                });
            }

        });
    });
}

//function to show team points
function showTeamPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_teampoints", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;

            $(".green-text").html(label);
            var group_title = '';

            for (i = 0; i < len; i++) {
                
                var icon = '';
                var val = results.rows.item(i);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                
                
               /* var icon = '';
                if (results.rows.item(i).name == 'Bonus') {
                    icon = '<span class="icon"><i class="social-icon"></i></span>';
                } else if (results.rows.item(i).name == 'Social') {
                    icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                } else if (results.rows.item(i).name == 'Seekergame') {
                    icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                } else if (results.rows.item(i).name == 'Course/Quiz') {
                    icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                } else if (results.rows.item(i).name == 'Communication') {
                    icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                } else if (results.rows.item(i).name == 'Total') {
                    icon = '<span class="icon"><i class="gicon-points"></i></span>';   
                }                                                                       */
                var green_count_html = '';
                if (results.rows.item(i).green_count != 0) {
                    var green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                }
                 var id = results.rows.item(i).userTotal ;
                 var user_total = formatpoints(id);
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gototeamdetail(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + '<span class="icon"></span>&nbsp;' + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gototeamdetail(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
            }
            
             db.transaction(function(tx) {
    
   
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });
            
            //jQuery(".leaderboards-container").show();
            jQuery(".teamscores-leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to go to team point detail page
function gototeamdetail(instance_id) {
    localStorage.instance_id = instance_id;
    //window.location.href = 'team_detail_point.html';
    changetoteamdetailpoint();
}

//function to fetch detail team point
function loaddetailteampoints() {
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        $(".leaderboards-container").hide();
        jQuery(".loading_agenda_items").show();
        importfooter('team-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = localStorage.url + 'team-points/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                $.each(obj.topScoresViewVars.teamPointsSel, function(key, val) {
                    if (key == obj.topScoresViewVars.currentUserTeam) {
                        var classcss = "current-user";
                    } else {
                        var classcss = "";
                    }
                    var id = val.points ;
                 var user_total = formatpoints(id);
                    $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + val.pos + '</span></td><td><span class="name">' + key + '</span></td><td class="point">' + user_total + '</td></tr>');


                    i++;
                });
                var difference = Number(10) - Number(i);
                for (v = 0; v < difference; v++) {
                    i++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + i + '</span></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                }
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                    }
                    var id = val.points ;
                 var user_total = formatpoints(id);
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gototeamdetail(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gototeamdetail(' + val.instance_id + ')">' + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });
                jQuery(".leaderboards-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}


//function to go to  your team point detail page
function gotoyourteamdetail(instance_id) {
    localStorage.instance_id = instance_id;
    //window.location.href = 'your_detail_point.html';
    changetoyourdetailpoint();
}


//function to fetch your detail team point
function loadyourdetailteampoints() {
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        $(".leaderboards-container").hide();
        jQuery(".loading_agenda_items").show();
        importfooter('Your-team/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id, 'your-team');
        var main_url = localStorage.url + 'Your-team/-/'+localStorage.short_url+'-' + localStorage.event_id + '/topscores/' + localStorage.instance_id + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.topScoresViewVars.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }

                });
                $(".team-points-table table tbody").html('');
                var i = 0;
                var classcss = '';
                $.each(obj.topScoresViewVars.usersSel, function(key, val) {
                    if (key == localStorage.user_id) {
                        var classcss = "current-user";
                    } else {
                        var classcss = "";
                    }
                    i++;  
                    var id = val.total ;
                 var user_total = formatpoints(id);
                    if (val.image != '') {
                        var newtd = '<td class="avatar-col"><span class="avatar"><div class="img img-circle" style="background-image:url(' + val.image + ');"></div></span></td>';
                    } else {
                        var newtd = '<td class="avatar-col"></td>';
                    }
                    //alert(user_total)        
                    $(".team-points-table table tbody").append('<tr class=' + classcss + '><td class="num-col"><span class="num">' + i + '</span></td>' + newtd + '<td><span class="name">' + val.fName + ' ' + val.lName + '</span></td><td class="point">' + user_total + '</td></tr>');

                });
                var difference = Number(10) - Number(i);
                for (v = 0; v < difference; v++) {
                    i++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + i + '</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                }
                $(".user-points-table table tbody").html('');
                $.each(obj.categories, function(key, val) {
                    if (val.instance_id == localStorage.instance_id) {
                        var classcss = "active";
                    } else {
                        var classcss = "";
                    }

                    var icon = '';
                    var id = val.points ;
                    var user_total = formatpoints(id);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                        user_total = localStorage.total_points; 
                    }
                    
                      
                    $(".user-points-table table tbody").append('<tr class=' + classcss + '><td><a href="#" onclick="gotoyourteamdetail(' + val.instance_id + ')"><span class="num">' + val.position + '.</span>' + icon + val.name + '</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail(' + val.instance_id + ')">' + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');

                });
                db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });
                jQuery(".leaderboards-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });

    });
}



//function to fetch your team points
function loadyourpoints() {
    jQuery(document).ready(function($) {
        // loadcommonthings();
        isLoggedIn();
        $(".leaderboards-container").hide();
        // $(".yourscores-leaderboards-container").hide();
       	// $(".teamscores-leaderboards-container").hide();
       	// $(".yourteam-leaderboards-container").hide();
        jQuery(".loading_agenda_items").show();
        importfooter('Your-team', 'your-team');
        var main_url = localStorage.url + 'your-team/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {
                    //alert(val.text);
                    label = val.text;
                });
                if(checkdefined(obj.totalPoints) == 'yes')
                 {
                    localStorage.total_points = obj.totalPoints;
                 }
                 else
                 {
                      localStorage.total_points = 0;
                 }
                // alert(label);
                var imagedatalength = obj.categories.length;
                db.transaction(function(tx) {
                    
                    tx.executeSql('delete from OCEVENTS_yourteampoints');
                    tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints", [], function(tx, results) {
                        var len_ag = results.rows.length;
                        // alert(len_ag);
                      /*  if (imagedatalength == len_ag && len_ag != 0) {
                            showYourTeamPointsData();
                        } else { */
                            db.transaction(function(tx) {
                                tx.executeSql('delete from OCEVENTS_yourteampoints');
                            });
                            var co = 0;
                            $.each(obj.categories, function(key, val) {
                                db.transaction(function(tx) {
                                    var green_count = '';
                                    if (checkdefined(val.count) == 'yes' || val.count == '0') {
                                        green_count = val.count;
                                    }
                                    tx.executeSql("insert into OCEVENTS_yourteampoints (alias,user_id,name,position,userTotal,green_count,label,instance_id) values ('" + val.alias + "','" + localStorage.user_id + "','" + val.name + "','" + val.position + "','" + val.points + "','" + green_count + "','" + label + "','" + val.instance_id + "'  )");
                                    //alert(val.position);
                                    co++;
                                    // alert(co);
                                    //alert(imagedatalength); 
                                    if (imagedatalength == co) {
                                        //alert(co);
                                        //alert(imagedatalength);
                                        // alert('going');
                                        showYourTeamPointsData();
                                    }
                                });
                            });
                        //}

                    });

                });
                
            }

        });
    });
}

//function to show team points
function showYourTeamPointsData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_yourteampoints", [], function(tx, results) {
            var len = results.rows.length;
            $(".table-striped tbody").html('&nbsp;');
            var label = results.rows.item(0).label;

            $(".green-text").html(label);
            var group_title = '';

            for (i = 0; i < len; i++) {
               /* var icon = '';
                if (results.rows.item(i).name == 'Bonus') {
                    icon = '<span class="icon"><i class="social-icon"></i></span>';
                } else if (results.rows.item(i).name == 'Social') {
                    icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                } else if (results.rows.item(i).name == 'Seekergame') {
                    icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                } else if (results.rows.item(i).name == 'Course/Quiz') {
                    icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                } else if (results.rows.item(i).name == 'Communication') {
                    icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                } else if (results.rows.item(i).name == 'Total') {
                    icon = '<span class="icon"><i class="gicon-points"></i></span>';
                } */
                var val = results.rows.item(i);
                var icon = '';
                 var id = results.rows.item(i).userTotal ;
                 var user_total = formatpoints(id);
                    if (val.alias == 'early_bird') {
                        icon = '<span class="icon"><i class="social-icon"></i></span>';
                    } else if (val.alias == 'social') {
                        icon = '<span class="icon"><i class="gicon-friends"></i></span>';
                    } else if (val.alias == 'seeker') {
                        icon = '<span class="icon"><i class="gicon-seeker"></i></span>';
                    } else if (val.alias == 'first_mover') {
                        icon = '<span class="icon"><i class="gicon-quiz"></i></span>';
                    } else if (val.alias == 'communication') {
                        icon = '<span class="icon"><i class="gicon-comments"></i></span>';
                    } else if (val.alias == 'total') {
                        icon = '<span class="icon"><i class="gicon-points"></i></span>';
                        user_total = localStorage.total_points;
                    }
                var green_count_html = '';
                //if (results.rows.item(i).green_count != 0) {
                //alert(checkdefined(results.rows.item(i).green_count))
                if (checkdefined(results.rows.item(i).green_count) == 'yes' || results.rows.item(i).green_count == '0') {
                    green_count_html = '<span class="count">' + results.rows.item(i).green_count + '</span>';
                    //alert(results.rows.item(i).green_count)
                }
            
                
                $(".table-striped tbody").append('<tr><td><a href="#" onclick="gotoyourteamdetail(' + results.rows.item(i).instance_id + ');"><span class="num">' + results.rows.item(i).position + '.</span>' + icon + results.rows.item(i).name + '</a></td><td class="point"><a href="#" onclick="gotoyourteamdetail(' + results.rows.item(i).instance_id + ');">' + green_count_html + user_total + '<i class="fa fa-angle-right"></i></a></td></tr>');
            }
             db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'YourScores')
                    {
                      $('.yourscores').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'TeamScores')
                    {
                      $('.teamscores').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourTeam')
                    {
                      $('.yourteam').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });  
              });
            //jQuery(".leaderboards-container").show();
            jQuery(".yourteam-leaderboards-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

//function to fetch agenda items
function loadallagenda() {
    jQuery(document).ready(function($) {
        // loadcommonthings();
        isLoggedIn();
        jQuery(".loading_agenda_items").show();
        importfooter('agenda', 'agenda');
        
        
        
        $(".agenda-container").hide();
        //showAgendaData();
        //http://www.oceventmanager.com/agenda/-/'+localStorage.short_url+'-100041/?ajax=1&all=1&gvm_json=1
        var main_url = localStorage.url + 'agenda/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?ajax=1&all=1&gvm_json=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp;');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj); 
                db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'Agenda')
                    {
                        $('.header-title h1').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SeeCurrent')
                    {
                        $('.seealls span').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
               });
            });
                jQuery(".agenda-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });
    });
}

//function to fetch agenda items
function loadagenda() {
    jQuery(document).ready(function($) {
        //loadcommonthings();
         isLoggedIn();
         jQuery(".loading_agenda_items").show();
         $('.fa-clock-o').html('&nbsp;');
        db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'Agenda')
                    {
                        $('.header-title h1').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SeeAll')
                    {
                        $('.seealls span').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                 }
           });
        });
        importfooter('agenda', 'agenda');
       // $(".agenda-container").hide();
       $(".notes-agenda-container").hide();
       $(".list-agendalist-container").hide();
        // var main_url = localStorage.url + 'api/index.php/main/agendaItems?XDEBUG_SESSION_START=PHPSTORM';
        var main_url = localStorage.url + 'agenda/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';
        $("#presentations-list").html('&nbsp');
        // alert(main_url)
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                // alert(obj)
                showcommonagendalist(obj);
                //jQuery(".agenda-container").show();
                jQuery(".list-agendalist-container").show();
                jQuery(".loading_agenda_items").hide();
            }
        });
    });
}

//function to show common agenda list
function showcommonagendalist(obj) {
	$("#presentations-list").html('&nbsp');
	$(".agenda-item-container").hide();

    $.each(obj.data.presentations, function(key, val) {
        //if(val.group_title != null)
        // {
        var group_title = '';
        if (checkdefined(val.group_title) == 'yes') {
            $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>' + val.group_title + '</p></div></div></div>');
            group_title = val.group_title;
        }
        
        $.each(val.items, function(key1, val1) {
        if(checkdefined(val1.direct_access_module_href) == 'yes')
        {
             localStorage.direct_access_module_href = val1.direct_access_module_href;
             localStorage.ins_id = val1.id;
        }
            var duration = val1.duration; //7903980 =====  11978580

            var eta = val1.eta; //3593396 ====   8691056

            if (Number(eta) > Number(duration)) {
                // The event has not started yet.
                var progress = 0;
            } else {
                // The event has started and is in progress.
                var progress = ((duration - eta) / duration) * 100;
            }

            var c = Math.PI * 49.5 * 2;
            var pct = ((100 - progress) / 100) * c;
            pct = pct.toFixed(3) + 'px';
            //alert(pct);
            //54.5368
            //27.4450  
            var img_str = '';
            if (checkdefined(val1.speaker_image) == 'yes') {
                img_str = '<div class="agenda-img" style="background-image: url(' + val1.speaker_image.small_url + ');">';
            } else {
                img_str = '<div class="agenda-img">';
            } 
            
            var time_str = '';
            if(checkdefined(val1.time) == 'yes')
            {
              time_str = '<div class="agenda-footer">&nbsp;<div class="meeting-location"><i class="fa fa-clock-o"></i> ' + val1.time + '</div></div>';
            }

            $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda(' + val1.id + '); return false;"><div class="agenda-info">' + img_str + '<svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="' + duration + '" data-eta="' + eta + '"><circle class="agenda-item-progress-bg" r="42.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="267.0353755551324" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="44.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="279.6017461694916" stroke-dashoffset="" style="stroke-dashoffset: ' + pct + ';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + val1.title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + val1.speaker_name + '</span></div></div></div></a>'+time_str+'</div></div></div>');
        });
        // }
    });
}

//function to load current sponsors
function loadallsponsors() {
    jQuery(document).ready(function($) {
        loadcommonthings(); isLoggedIn();
        importfooter('sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id, 'sponsors');
        $(".agenda-container").hide();
        
        //showAgendaData();

        var main_url = localStorage.url + 'sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1&ajax=1&all=1';
        // alert(main_url);
        $("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommonagendalist(obj);
                db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'isSponsorLabel')
                    {
                        $('.header-title h1').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SeeCurrent')
                    {
                        $('.seal').html(unescape(results.rows.item(i).key_val));                     
                    }
				  }
                });
              });
                jQuery(".agenda-container").show();
                jQuery(".loading_agenda_items").hide();

            }
        });
    });
}

//function to load all sponsors
function loadsponsors() {
    jQuery(document).ready(function($) {
		 // loadcommonthings();
		isLoggedIn();
		jQuery(".loading_agenda_items").show();
		importfooter('sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id, 'sponsors');
		$(".agenda-container").hide();
		$('.see-all-wrapper').html('<span><a style="color: #fff;text-decoration: none;" class="seealls"  href="#" onclick="changetoallagenda(); return false;" data-type="all"><span>All</span><i class="fa fa-clock-o"></i></a></span>');
		//showAgendaData();

		var main_url = localStorage.url + 'sponsors/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';
		// alert(main_url);
		$("#presentations-list").html('&nbsp');
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
				showcommonagendalist(obj);
				db.transaction(function(tx) {
					tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
						var len = results.rows.length;                  
						for (i = 0; i < len; i++) {                    
							if(results.rows.item(i).key_constant == 'sponsorsPageTitle') {
								$('.header-title h1').html(unescape(results.rows.item(i).key_val));                     
							}
							if(results.rows.item(i).key_constant == 'SeeAll') {
								$('.seal').html(unescape(results.rows.item(i).key_val));                     
							}
						}
					});
				});
				jQuery(".list-agendalist-container").show();
				jQuery(".loading_agenda_items").hide();
            }
        });
    });
}

//function to show agenda items
function showAgendaData() {
    // alert('here');
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_agenda order by start_time asc", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len); 
            //$("#presentations-list").html('<div class="row"><div class="date-wrapper "><div class="date"><p>' + localStorage.group_title + '</p></div></div></div>');
            $("#presentations-list").html('&nbsp;');
            var group_title = '';
            for (i = 0; i < len; i++) {
                
                if (results.rows.item(i).group_title != group_title) {
                    $("#presentations-list").append('<div class="row"><div class="date-wrapper "><div class="date"><p>' + results.rows.item(i).group_title + '</p></div></div></div>');
                }
                group_title = results.rows.item(i).group_title;

                var duration = results.rows.item(i).duration; //7903980 =====  11978580

                var eta = results.rows.item(i).eta; //3593396 ====   8691056

                if (Number(eta) > Number(duration)) {
                    // The event has not started yet.
                    var progress = 0;
                } else {
                    // The event has started and is in progress.
                    var progress = ((duration - eta) / duration) * 100;
                }

                var c = Math.PI * 49.5 * 2;
                var pct = ((100 - progress) / 100) * c;
                pct = pct.toFixed(3) + 'px';
                //alert(pct);
                //54.5368
                //27.4450  
                $("#presentations-list").append('<div class="row"><div class="agenda-content"><div class="agenda-item col-xs-12"><a href="#" onclick="gotoagenda(' + results.rows.item(i).agenda_id + ')"><div class="agenda-info"><div class="agenda-img" style="background-image: url(' + results.rows.item(i).speaker_image + ');"><svg class="agenda-item-progress" version="1.1" xmlns="http://www.w3.org/2000/svg" data-duration="' + duration + '" data-eta="' + eta + '"><circle class="agenda-item-progress-bg" r="47.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="298.45130209103036" stroke-dashoffset="0"></circle><circle class="agenda-item-progress-eta" r="49.5" cx="50%" cy="50%" fill="transparent" stroke-dasharray="311.01767270538954" stroke-dashoffset="" style="stroke-dashoffset: ' + pct + ';"></circle></svg></div><div class="agenda-wrapper"><span class="agenda-slogan">' + results.rows.item(i).title + '</span><i class="fa fa-angle-right"></i><div class="agenda-person-info"><span class="name">' + results.rows.item(i).speaker_name + '</span></div></div></div></a><div class="agenda-footer">&nbsp;<div class="meeting-location">' + results.rows.item(i).event_time + '</div></div></div></div></div>');
            }
            jQuery(".agenda-container").show();
            jQuery(".loading_agenda_items").hide();

        });
    });
}

function viewfriend(user_id) {
    //alert(user_id)
    localStorage.friend_id = user_id;
    //window.location.href = 'view_friend.html';
    changetoviewfriend();
}

//function to fetch user detail 
function loadfrienddetail() {
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        
        //$(".add-friends-container").hide();
        $(".view-friend-container").hide();
		$(".contacts-container").hide();
		$('.qa').html("");
        jQuery(".loading_agenda_items").show();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/view/' + localStorage.friend_id, 'friends');
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/view/' + localStorage.friend_id + '?gvm_json=1';
        
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {

                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".green-text").html(val.text)
                    }
                });
                if (checkdefined(obj.prevFriendLink) == 'yes') {
                    var prev_link = obj.prevFriendLink;
                    var split_it = prev_link.split('view/');
                    var prev_friend_id = split_it[1];
                    //  alert(prev_friend_id);
                    $('.prev').attr('onclick', 'viewfriend(' + prev_friend_id + ')');
                } else {
                    $('.prev').hide();
                }
                if (checkdefined(obj.nextFriendLink) == 'yes') {
                    var next_link = obj.nextFriendLink;
                    var split_it = next_link.split('view/');
                    var next_friend_id = split_it[1];
                    //  alert(next_friend_id);
                    // $('.next').attr('onclick','viewfriend("'+next_friend_id+'")');
                    $('.next').attr('onclick', 'viewfriend(' + next_friend_id + ')');
                } else {
                    $('.nextFriendLink').hide();
                }
                $('.friends-item-img').attr('style', 'background-image: url(' + obj.userImageSrc + ');');
                $('.frndnm').html(obj.fullName);
                if (checkdefined(obj.userTeam) == 'yes') {
                    $('.friends-item-inner h6').html('&lt;' + obj.userTeam + '&gt;');
                }
                if (checkdefined(obj.mobile) == 'yes') {
                    $('.call_button').attr('href', 'tel:' + obj.mobile);
                    $('.mob').html(obj.mobile);
                }
                if (checkdefined(obj.email) == 'yes') {
                	// alert(checkdefined(obj.email));
                	// alert(obj.email);
                    $('.email_button').attr('href', 'mailto:' + obj.email);
                    $('.em').html(obj.email);
                }
                if (checkdefined(obj.downloadVCardLink) == 'yes') {
                    $('.vcard').attr('onclick', 'downloadVcard("' + obj.downloadVCardLink + '")');
                }
                if (checkdefined(obj.gender) == 'yes') {
                    $('.gender').html(obj.gender);
                }
                $.each(obj.userQA, function(i, dataVal) {
                    if (i != 0 && dataVal.question != undefined && dataVal.answer != undefined) {
                        $('.qa').append('<p>' + dataVal.question + ' <span class="green-text">' + dataVal.answer + '</span></p>');
                    }

                });
               db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'callUser')
                      {
                        $('.call_button').html(unescape(results.rows.item(i).key_val));
                        //$('.contacts_request').html(unescape(results.rows.item(i).key_val));
                      }
                      if(results.rows.item(i).key_constant == 'emailUser')
                      {
                        $('.email_button').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'downloadContactVCard')
                      {
                        $('.fa-download').html(" " + unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'userMobile'&& obj.mobile != "undefined")
                      {
                      	if(obj.mobile == undefined) {
							var objMObile = "";
						}
						else {
							var objMObile = obj.mobile;
						}
                        $('.mobTitle').html(unescape(results.rows.item(i).key_val)+': <span class="green-text mob"> '+objMObile+'</spam>');                     
                      } 
                      if(results.rows.item(i).key_constant == 'userEmail')
                      {
                      	if(obj.email == undefined) {
							var objEMail = "";
						}
						else {
							var objEMail = obj.email;
						}
                        $('.emTitle').html(unescape(results.rows.item(i).key_val)+': <span class="green-text em"> '+objEMail+'</spam>');                     
                      }
                      /*if(results.rows.item(i).key_constant == 'userGender')
                      {
                      	if(obj.gender == undefined) {
							var objGEnder = "";
						}
						else {
							var objGEnder = obj.gender;
						}
                        $('.gender').html(unescape(results.rows.item(i).key_val)+': '+objGEnder);                     
                      } */
                      if(results.rows.item(i).key_constant == 'registrationQuestions')
                      {
                        $('.registration-questions-title').html(unescape(results.rows.item(i).key_val)+': ');                     
                      }
                   }
                 });
               });       
                //$(".add-friends-container").show();
                $(".view-friend-container").show();
                $(".loading_agenda_items").hide();
            }
        });
    });
}

//function to download vCard
function downloadVcard(url) {
    var download_url = localStorage.url + url;
    //alert(download_url)
    navigator.app.loadUrl(download_url, { openExternal:true });
    //window.open(download_url, '_system');
    //alert(download_url)
    /*var fileTransfer = new FileTransfer();
    var store = cordova.file.dataDirectory;
    fileTransfer.download(
        download_url,
        store + "theFile.vcf",
        function(theFile) {
            alert("File Downloaded Successfully on your device, check it here : " + theFile.toURI());
            //showLink(theFile.toURI());
        },
        function(error) {
            alert("download error source " + error.source);
            alert("download error target " + error.target);
            alert("upload error code: " + error.code);
        }
    ); */
}

function showLink(url) {
    //alert(url);
    /*var divEl = document.getElementById("ready");
    var aElem = document.createElement("a");
    aElem.setAttribute("target", "_blank");
    aElem.setAttribute("href", url);
    aElem.appendChild(document.createTextNode("Ready! Click To Open."))
    divEl.appendChild(aElem); */
    //jQuery('#ready').html('<a target="_blank" href='+url+' />Ready! Click To Open.</a>');

}


// function to cancel friend request
function cancelRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_cancel").show();
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/cancel/' + player_code + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact request canceled</div>');
                $(".add-friends-container").show();
                $(".loading_cancel").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}


// function to approve friend request
function approveRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_approve").show();
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/approve/' + player_code + '?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact Request Approved</div>');
                $(".add-friends-container").show();
                $(".loading_approve").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}


// function to send friend request
function sendRequest(player_code) {
    jQuery(document).ready(function($) {
        $(".add-friends-container").hide();
        $(".loading_send").show();
        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/add/' + player_code + '?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                showcommoncontacts(obj);
                $('.form-container').prepend('<div class="alert alert-success">Contact Request Sent</div>');
                $(".add-friends-container").show();
                $(".loading_send").hide();
                $(".alert-success").fadeOut(5000);
            }

        });
    });
}

function showcommoncontacts(obj,checkhide) {
    var icon_class = '';
    var link = '';
    var team = '';
    var divider = '';
    var first_letter = '';
    if(checkhide != 'yes')
    {
       $(".all_conts").html('&nbsp');
    }                                
    // alert(JSON.stringify(obj.eventUserFriends));
    // alert(JSON.stringify(obj.receivedFriendsRequests));
    // alert(JSON.stringify(obj));
    $('.friends-requests-container').html("");
    var ficon_class = '';
    var flink = '';
    var fteam = '';
    var fdivider = '';
    var ffirst_letter = '';
    //alert(obj.receivedFriendsRequests.length)
    if(checkdefined(obj.receivedFriendsRequests) == 'yes')
    {
      if (obj.receivedFriendsRequests.length > 0) {
        $('.contacts_request').show();
        $('.friends-requests-container').show();
      }
    
    
    $.each(obj.receivedFriendsRequests, function(key, val) {
        if (checkdefined(val.event_user_id) == 'yes') {

            ficon_class = '';
            flink = '';
            fteam = '';
            fdivider = '';
            // alert(val.first_name[0].toUpperCase());
            if(checkdefined(val.first_name) == 'yes')
            {
                if (ffirst_letter != val.first_name[0].toUpperCase()) {
                    fdivider = '<div class="friends-item-title"> ' + val.first_name[0].toUpperCase() + ' </div>';
                }
    
                ffirst_letter = val.first_name[0].toUpperCase();
            }

            if (checkdefined(val.team) == 'yes') {
                fteam = '&lt;' + val.team + '&gt;';
            }
            ficon_class = 'pending';
            var fullname = '';

	        if(checkdefined(val.fullName) == 'yes')
	        {
	           fullname = val.fullName;
	        } 

            flink = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + fteam + '</h6><span><i class="oc-icon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Incoming contact request</h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request">Decline</a><a href="#" onclick=approveRequest("' + val.player_code + '") class="success send-friend-request">Approve</a></div></div>';


            $('.friends-requests-container').append(fdivider + '<div class="friends-item-wrapper ' + ficon_class + '">  ' + flink + '  </div>');
            //alert(fdivider+'<div class="friends-item-wrapper '+ficon_class+'">  '+flink+'  </div>')  

        }
    });
    } 
      
    if(checkdefined(obj.eventUserFriends) == 'yes')
     {
    $.each(obj.eventUserFriends, function(key, val) {
        icon_class = '';
        link = '';
        team = '';
        divider = '';
        //alert(val.fName)
        //alert(val.first_name)
        if(checkdefined(val.first_name) == 'yes') {
            if (first_letter != val.first_name[0].toUpperCase()) {
                //alert(first_letter)
                //alert(val.fName[0].toUpperCase())
                divider = '<div class="friends-item-title"> ' + val.first_name[0].toUpperCase() + ' </div>';
            }
    
            first_letter = val.first_name[0].toUpperCase();
        
            if(checkhide != 'yes')
            {
              if (key == 0 && val.first_name[0] != 'A') {
                  divider = '<div class="friends-item-title"> </div>';
              }
            }
        }
        if (checkdefined(val.team) == 'yes') {
            team = '&lt;' + val.team + '&gt;';
        }
        var fullname = '';
        if(checkdefined(val.fullName) == 'yes')
        {
           fullname = val.fullName;
        }   

        if (val.is_friend == 1 && val.status == 1) {
            icon_class = 'pending';
            link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="oc-icon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4 class="waiting"></h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request waitingno">No</a></div></div>';
        }
        if (val.is_friend == 1 && val.status == 2) {
            link = '<div class="friends-item"><a onclick="viewfriend(' + val.event_user_id + ')" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
        }
        if (val.is_friend == 0 && obj.enableFriendsRequests == true) {
            link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="oc-icon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4 class="sendreq"></h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel sendreqno"></a><a href="#" onclick=sendRequest("' + val.player_code + '") class="success send-friend-request sendreqyes"></a></div></div>';
        }

        if (val.is_friend == 0 && obj.enableFriendsRequests != true) {
            link = '<div class="friends-item"><a href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> ';
        }

        $('.all_conts').append(divider + '<div class="friends-item-wrapper ' + icon_class + '">  ' + link + '  </div>');
        $(".loading_agenda_items").hide();
       // $(".add-friends-container").show();
       $(".contacts-container").show();
        
        // alert(divider+'<div class="friends-item-wrapper '+icon_class+'">  '+link+'  </div>')
    });
    db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'userFriends')
                      {
                        $('.mycont').html(unescape(results.rows.item(i).key_val)+' '+'<i class="gicon-friends"></i>');
                      }
                      if(results.rows.item(i).key_constant == 'FriendRequestsTitle')
                      {
                        $('.contacts_request').html(unescape(results.rows.item(i).key_val)+' '+'<i class="oc-icon-friends"></i>');
                      }
                      if(results.rows.item(i).key_constant == 'UsersList')
                      {
                        $('.part_l').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'filterItems')
                      {
                        $('#users-filter').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'YourFriends')
                      {
                        $('.show-friends-btn').html(unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'pendingOutgoingFriendRequestDesc')
                      {
                        $('.waiting').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'no')
                      {
                        $('.waitingno').html(unescape(results.rows.item(i).key_val));
                        $('.sendreqno').html(unescape(results.rows.item(i).key_val));
                                             
                      } 
                      if(results.rows.item(i).key_constant == 'addFriendConfirmation')
                      {
                        $('.sendreq').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'yes')
                      {
                        //$('.waitingno').html(unescape(results.rows.item(i).key_val));
                        $('.sendreqyes').html(unescape(results.rows.item(i).key_val));
                                             
                      }  
                      
                       
                                      
                 }
              });  
          });
    }
    else
    {
      db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'userFriends')
                      {
                        $('.mycont').html(unescape(results.rows.item(i).key_val)+' '+'<i class="gicon-friends"></i>');
                      }
                      if(results.rows.item(i).key_constant == 'FriendRequestsTitle')
                      {
                        $('.contacts_request').html(unescape(results.rows.item(i).key_val)+' '+'<i class="oc-icon-friends"></i>');
                      }
                      if(results.rows.item(i).key_constant == 'UsersList')
                      {
                        $('.part_l').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'filterItems')
                      {
                        $('#users-filter').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'YourFriends')
                      {
                        $('.show-friends-btn').html(unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'pendingOutgoingFriendRequestDesc')
                      {
                        $('.waiting').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'no')
                      {
                        $('.waitingno').html(unescape(results.rows.item(i).key_val));
                        $('.sendreqno').html(unescape(results.rows.item(i).key_val));
                                             
                      } 
                      if(results.rows.item(i).key_constant == 'addFriendConfirmation')
                      {
                        $('.sendreq').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'yes')
                      {
                        //$('.waitingno').html(unescape(results.rows.item(i).key_val));
                        $('.sendreqyes').html(unescape(results.rows.item(i).key_val));
                                             
                      }  
                      
                       
                                      
                 }
              });  
          });
          $(".loading_agenda_items").hide();
      	  //$(".add-friends-container").show();
      	  $(".contacts-container").show();
    }

}

//function to load contacts
function loadcontacts() {
    jQuery(document).ready(function($) {
        //loadcommonthings();
         isLoggedIn();
         jQuery(".loading_agenda_items").show();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/', 'friends');
       // $(".add-friends-container").hide();
        $(".view-friend-container").hide();
		//$(".contacts-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                //alert(JSON.stringify(obj));
                showcommoncontacts(obj);
                
            }

        });
    });
}

//function to load your friends
function loadyourcontacts() {
    jQuery(document).ready(function($) {
        // loadcommonthings(); 
        isLoggedIn();
        importfooter('user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/friends', 'friends');
        jQuery(".loading_agenda_items").show();
        // $(".add-friends-container").hide();
        $(".view-friend-container").hide();
		$(".contacts-container").hide();
        //showAgendaData();

        var main_url = localStorage.url + 'user-add-friend/-/'+localStorage.short_url+'-' + localStorage.event_id + '/friends?gvm_json=1';
        $(".friends-items-container").html('&nbsp');
        var icon_class = '';
        var link = '';
        var team = '';
        var divider = '';
        var first_letter = '';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            if(checkdefined(obj.eventUserFriends) == 'yes')
            {
                $.each(obj.eventUserFriends, function(key, val) {
                    icon_class = '';
                    link = '';
                    team = '';
                    divider = '';
                    if(checkdefined(val.first_name) == 'yes') {
                      if (first_letter != val.first_name[0].toUpperCase()) {
                          //alert(first_letter)
                          //alert(val.first_name[0].toUpperCase())
                          divider = '<div class="friends-item-title"> ' + val.first_name[0].toUpperCase() + ' </div>';
                      }
  
                      first_letter = val.first_name[0].toUpperCase();
                   }
                    if (key == 0 && val.first_name[0] != 'A') {
                        divider = '<div class="friends-item-title"> </div>';
                    }


                    if (checkdefined(val.team) == 'yes') {
                        team = '&lt;' + val.team + '&gt;';
                    }
                    var fullname = '';
                    if(checkdefined(val.fullName) == 'yes')
                    {
                       fullname = val.fullName;
                    } 
                    if (val.is_friend == 1 && val.status == 1) {
                        icon_class = 'pending';
                        link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Keep waiting for response?</h4><div class="confirm-btn-wrapper"><a href="#" onclick=cancelRequest("' + val.player_code + '") class="danger cancel-friend-request">No</a></div></div>';
                    }
                    if (val.is_friend == 1 && val.status == 2) {
                        link = '<div class="friends-item"><a onclick="viewfriend(' + val.event_user_id + ')" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="fa fa-angle-right"></i></span></a></div>';
                    }
                    if (val.is_friend == 0) {
                        link = '<div class="friends-item"><a class="toggle-friend-request-confirmation" href="#"><div class="friends-item-img" style="background-image: url(' + val.image + ');"></div><h2> ' + fullname + '</h2><h6>' + team + '</h6><span><i class="gicon-friends"></i></span></a></div> <div class="friend-request-confirm-wrapper"><h4>Send contact request?</h4><div class="confirm-btn-wrapper"><a href="" class="danger cancel">No</a><a href="#" onclick=sendRequest("' + val.player_code + '") class="success send-friend-request">Yes</a></div></div>';
                    }

                    $('.friends-items-container').append(divider + '<div class="friends-item-wrapper ' + icon_class + '">  ' + link + '  </div>');
                    

                });
                
             } 
          db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'userFriends')
                      {
                        $('.mycont').html(unescape(results.rows.item(i).key_val)+' '+'<i class="gicon-friends"></i>');
                        //$('.contacts_request').html(unescape(results.rows.item(i).key_val));
                      }
                      if(results.rows.item(i).key_constant == 'UsersList')
                      {
                        $('.part_l').html(unescape(results.rows.item(i).key_val));                     
                      }
                      if(results.rows.item(i).key_constant == 'filterItems')
                      {
                        $('#users-filter').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                      } 
                      if(results.rows.item(i).key_constant == 'AllUsers')
                      {
                        $('.show-friends-btn').html(unescape(results.rows.item(i).key_val));                     
                      }                 
                 }
              });  
          });
                $(".loading_agenda_items").hide();
                //$(".add-friends-container").show();
               $(".contacts-container").show();
          
          }     
           

        });
    });
}

//Load profile page variables
function loadprofile() {
	showhidefacebook();
	loadUserImages();
	loadcommonthings();
	
    $(".user-profile-container").hide();

    if(localStorage.profileuis == "removed") {
		$(".imageaddedremoved").html('<div class="alert alert-success">I have removed your selfie<br>OC Cloud</div>');
    }
    else if (localStorage.profileuis == "added") {
		$(".imageaddedremoved").html('<div class="alert alert-success">Image added</div>');
    }
    else {
		$(".imageaddedremoved").html("");
    }
    
    //localStorage.profileuis = "";

    jQuery(".loading_agenda_items").show();
    importfooter('user-profile', 'profile');
    
    db.transaction(function(tx) {
                    
        tx.executeSql("SELECT * FROM OCEVENTS_qa", [], function(tx, results) {
            var len = results.rows.length;  
            if(len > 0)
            {
               $(".qa-list").html('<dt>'+localStorage.qlabel+'</dt>');
            }
            for (i = 0; i < len; i++) {
                // alert(results.rows.item(i).answer);
                $('.qa-list').append('<dd><h4 class="qa-item-title">' + results.rows.item(i).question + '</h4><p style="width: 97%; word-wrap: break-word; display: inline-block;">' + results.rows.item(i).answer + '</p></dd>');
            }
        });

        tx.executeSql("SELECT * FROM OCEVENTS_user", [], function(tx, results) {
            var len = results.rows.length;
            
            $(".player_code").html(results.rows.item(0).player_code);
            var proimg = 'background-image:url(' + localStorage.profilelogo + ');';
            $(".main-img").attr("style", proimg);
          
            if (localStorage.profilelogotype == '1') {
                $(".selfie_button").html('<button class="pic-remove" onclick="removeprofileimage();" type="button" name="remove_pic" value="1"></button>');
            }
            else {
            	$(".selfie_button").html('<div class="pic-upload selfie_capture"><button class="addselfie" onclick="showbuttons();" type="button" name="addselfie" value="1">Add</button><!--span class="addselfietex" onclick="showbuttons();">add</span--></div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Choose a Photo"  onclick="getPhoto(pictureSource.PHOTOLIBRARY);">Choose a Photo</div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Take a Photo"  onclick="capturePhoto();">Take a Photo</div>');
            }
            
            if (results.rows.item(0).first_name != undefined && results.rows.item(0).first_name != '' && results.rows.item(0).first_name != null && results.rows.item(0).first_name != 'null') {
            	var user_first_name = results.rows.item(0).first_name;
            } else {
				var user_first_name = "<p>&nbsp;</p>";
			}
            if (results.rows.item(0).last_name != undefined && results.rows.item(0).last_name != '' && results.rows.item(0).last_name != null && results.rows.item(0).last_name != 'null') {
            	var user_last_name = results.rows.item(0).last_name;
            } else {
				var user_last_name = "<p>&nbsp;</p>";
			}


            $(".myname").html(user_first_name + " " + user_last_name);
            $(".myemail").html(results.rows.item(0).email);
            $(".mymobile").html(results.rows.item(0).mobile);
            if (results.rows.item(0).gender == 'm') {
                $(".mygender").html('Male');
            } else if (results.rows.item(0).gender == 'f') {
                $(".mygender").html('Female');
            } else {
                //$(".mygender").html('N/A');
                $(".mygender").hide();
                $(".all_gender").hide();
                
            }                                            
                          
            $(".firstname a").html(results.rows.item(0).first_name);
            $(".lastname a").html(results.rows.item(0).last_name);
            $("#fname_edit").val(results.rows.item(0).first_name);
            $("#lname_edit").val(results.rows.item(0).last_name);
            $("#email_edit").val(results.rows.item(0).email);
            $("#mobile_edit").val(results.rows.item(0).mobile);
          
        });
		
		var main_url = localStorage.url + 'user-profile/-/'+localStorage.short_url+'-' + localStorage.event_id + '/?gvm_json=1';
   
	    jQuery.ajax({
	        url: main_url,
	        dataType: "json",
	        method: "GET",
	        success: function(obj) {
				if(obj.allowFacebook == "0" || obj.allowFacebook == 0) {
					$('.user-facebook-link').hide(); 
				}
				if(obj.playerCode == "" || obj.playerCode == undefined || obj.playerCode == null ) {
					$('#plid').hide();				
				}
				else {
					$('#plid').show();
				}
	        }        
	    });

		if(localStorage.mainlogoSmallImage) {
			$(".logo_inner").attr('src', localStorage.mainlogoSmallImage);
		}

        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
            var len = results.rows.length;

            $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);



        });
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'UserPage')
                    {
                        $('.header-title p').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                    if(results.rows.item(i).key_constant == 'RemoveSelfieFromProfile')
                    {
                        $('.pic-remove').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Username')
                    {
                        $('.all_username').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'userEmail')
                    {
                        $('.all_email').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'userMobile')
                    {
                        $('.all_mobile').html(unescape(results.rows.item(i).key_val)); 
                        $('#all_mobile').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'userGender')
                    {
                        $('.all_gender').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'EditProfileDetails')
                    {
                        $('.user-info-edit-btn').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'YourPlayedCode')
                    {
                        $('#plid h5').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Firstname')
                    {
                        $('#all_fname').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Lastname')
                    {
                        $('#all_lname').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Email')
                    {
                        $('#all_email').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'RepeatEmail')
                    {
                        $('#all_remail').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SetNewPassword')
                    {
                       $('#all_pwd').html(unescape(results.rows.item(i).key_val));                      
                    }
                    if(results.rows.item(i).key_constant == 'RepeatNewPassword')
                    {
                       $('#all_rpwd').html(unescape(results.rows.item(i).key_val));                      
                    }
                    if(results.rows.item(i).key_constant == 'Save')
                    {
                       $('.user-info-save-btn').html(unescape(results.rows.item(i).key_val));                      
                    }
                    if(results.rows.item(i).key_constant == 'Cancel')
                    {
                       $('.user-info-cancel-btn').html(unescape(results.rows.item(i).key_val));                      
                    } 
                    
                    if(results.rows.item(i).key_constant == 'fbAccountLinkYourFacebook')
                    {
                       $('.linkfb').html(unescape(results.rows.item(i).key_val));                      
                    }
                    if(results.rows.item(i).key_constant == 'fbAccountBenefits')
                    {
                       $('.facebook-description').html(unescape(results.rows.item(i).key_val));                      
                    }
                    if(results.rows.item(i).key_constant == 'AddSelfieToProfile')
                    {
                       $('.addselfietex').html(unescape(results.rows.item(i).key_val));                      
                    }
                     
                       
                    
                    
                    
              } 
              $(".user-profile-container").show();
        jQuery(".loading_agenda_items").hide();
        });   
    });  
}

function loadcommonthings() {
	$("#tooltipster-409679").hide();
	loadUserImages();

//jQuery("head").append("<link href='"+localStorage.url+"resources/gamification/css/appearance.css.php?eid="+localStorage.event_id+"' rel='stylesheet' type='text/css'>");
   // alert(localStorage.event_id)
 
    db.transaction(function(tx) {
    
   
        tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;
                  
                  for (i = 0; i < len; i++) {
                    if(results.rows.item(i).key_constant == 'EditUser')
                    {
                      $('.edit-btn-wrapper a').html(unescape(results.rows.item(i).key_val));
                    }
                    if(results.rows.item(i).key_constant == 'MyEvents')
                    {
                      $('.my-events-title').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'menuHome')
                    {
                      //$('.menu-items-wrapper ul li a .gicon-welcome').after().html('');
                     // $('.menu-items-wrapper ul li a .gicon-welcome').after(unescape(results.rows.item(i).key_val)); 
                      $('.menu-items-wrapper ul li a .gamification').html(unescape(results.rows.item(i).key_val));                    
                    }
                    if(results.rows.item(i).key_constant == 'menuProfile')
                    {
                      //$('.menu-items-wrapper ul li a .gicon-my-profile').nextAll().remove();
                      //$('.menu-items-wrapper ul li a .gicon-my-profile').after(unescape(results.rows.item(i).key_val));
                      $('.menu-items-wrapper ul li a .profile').html(unescape(results.rows.item(i).key_val));
                      //$('.header-title p').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'Agenda')
                    {
                     // $('.menu-items-wrapper ul li a .gicon-agenda').nextAll().remove();
                    //  $('.menu-items-wrapper ul li a .gicon-agenda').after(unescape(results.rows.item(i).key_val)); 
                      $('.menu-items-wrapper ul li a .agenda').html(unescape(results.rows.item(i).key_val));                    
                    }
                    if(results.rows.item(i).key_constant == 'Points')
                    {
                     // $('.menu-items-wrapper ul li a .gicon-points').nextAll().remove();
                      //$('.menu-items-wrapper ul li a .gicon-points').after(unescape(results.rows.item(i).key_val));
                      $('.menu-items-wrapper ul li a .points').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'AddFriends')
                    {
                     // $('.menu-items-wrapper ul li a .gicon-friends').nextAll().remove();
                      //$('.menu-items-wrapper ul li a .gicon-friends').after(unescape(results.rows.item(i).key_val));
                      $('.menu-items-wrapper ul li a .friends').html(unescape(results.rows.item(i).key_val));                     
                    }  
                    if(results.rows.item(i).key_constant == 'MenuNotes')
                    {
                     // $('.menu-items-wrapper ul li a .gicon-notes').nextAll().remove();
                     // $('.menu-items-wrapper ul li a .gicon-notes').after(unescape(results.rows.item(i).key_val)); 
                       $('.menu-items-wrapper ul li a .notes').html(unescape(results.rows.item(i).key_val));                    
                    }
                     if(results.rows.item(i).key_constant == 'MyTicket')
                    {
                     // $('.menu-items-wrapper ul li a .gicon-my-ticket').nextAll().remove();
                      //$('.menu-items-wrapper ul li a .gicon-my-ticket').after(unescape(results.rows.item(i).key_val)); 
                      $('.menu-items-wrapper ul li a .ticket').html(unescape(results.rows.item(i).key_val));                    
                    }
                    
                    if(results.rows.item(i).key_constant == 'Logout')
                    {
                      //$('.gicon-logout').nextAll().remove();
                     // $('.gicon-logout').after(unescape(results.rows.item(i).key_val));  
                      $('.logout').html(unescape(results.rows.item(i).key_val));                     
                    }                    
                    
                  }
        });  
     
        tx.executeSql("SELECT * FROM OCEVENTS_user", [], function(tx, results) {
            var len = results.rows.length;
            
            if (results.rows.item(0).first_name != undefined && results.rows.item(0).first_name != '' && results.rows.item(0).first_name != null && results.rows.item(0).first_name != 'null') {
            	var user_first_name = results.rows.item(0).first_name;
            } else {
				var user_first_name = "";
			}
            if (results.rows.item(0).last_name != undefined && results.rows.item(0).last_name != '' && results.rows.item(0).last_name != null && results.rows.item(0).last_name != 'null') {
            	var user_last_name = results.rows.item(0).last_name;
            } else {
				var user_last_name = "";
			}
			
            //alert(results.rows.item(0).image_src)
            //$("#profile_pic").attr("style", "background-image:url(" + results.rows.item(0).image_src + ")");
            var url = 'url(' + localStorage.profilelogo + ')';
            $("#profile_pic").css("background-image",url);

            var medpropic = 'background-image:url(' + localStorage.profilelogo + ');';
            $("#medium_profile_pic").attr("style", medpropic);

            $(".log-info p").html(user_first_name + " " + user_last_name);
            if (results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null') {
                $(".log-info p").append("<br><strong>&lt; " + results.rows.item(0).team + " &gt; </strong><br />");
            }
            $(".log-info p").append("</p>");
            $(".firstname a").html(user_first_name);
            if (results.rows.item(0).team != undefined && results.rows.item(0).team != '' && results.rows.item(0).team != null && results.rows.item(0).team != 'null') {
                $(".team-name").html("&lt; " + results.rows.item(0).team + " &gt;");
            }

            $(".lastname a").html(user_last_name);
            if(localStorage.usr_position == undefined || localStorage.usr_position == null || localStorage.usr_position == "") {
            	$(".fa-trophy").html("<span> # </span>" + results.rows.item(0).position);
            }
            else {
            	$(".fa-trophy").html("<span> # </span>" + localStorage.usr_position);
            }
        });

        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
            var len = results.rows.length;    
            $(".logo_inner").attr('src', results.rows.item(0).main_logo_small_image);
        });
        tx.executeSql("SELECT * FROM OCEVENTS_events", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)
            if(len>0)
            {
//                $('.events').html('<p class="my-events-title">My networks</p>');
            }
            $('.events').html("&nbsp");
            $('.events').append('<p class="my-events-title">My networks</p><p class="listactiveEvent"</p><div id="events-normal-container"></div><div class="hide" id="events-more-container"></div>');
            var sideMenuEventsLimit = localStorage.sideMenuEventsLimit;
            var menuLimiter = 0;
            for (i = 0; i < len; i++) {                
                    
                    var event_id = results.rows.item(i).event_id;
                    var title = results.rows.item(i).title; 
                    //alert(title)
                    var current = '';
                    if(localStorage.event_id == event_id)
                    {
                       current = 'active';
                       $('.listactiveEvent').html('<a href="javascript:changecurrentevent('+event_id+', 1)" class="'+current+'">'+title+'</a>')
                    }
                    else {
                    	if(menuLimiter < sideMenuEventsLimit-1) {
                    		$('#events-normal-container').append('<p><a href="javascript:changecurrentevent('+event_id+', 1)" class="'+current+'">'+title+'</a></p>');
                    	}
                    	else {                    		
                    		$('#events-more-container').append('<p><a href="javascript:changecurrentevent('+event_id+', 1)" class="'+current+'">'+title+'</a></p>');
                    	 }      
                    	menuLimiter++;
                    }                
                }   
                $('.events').append('<a onclick="showMoreEvents();" id="show-more-events-btn"><span class="text">Show more events</span><i class="fa fa-chevron-down"></i></a><a onclick="showFewerEvents();" id="show-fewer-events-btn" class="hide"><span class="text">Show fewer events</span><i class="fa fa-chevron-up"></i></a>'); 
        });    
    });
}

function showMoreEvents() {
	$("#show-more-events-btn").hide();
	$('#events-more-container').removeClass("hide");
	$("#show-fewer-events-btn").removeClass("hide");
}

function showFewerEvents() {
	$("#show-fewer-events-btn").addClass("hide");
	$('#events-more-container').addClass("hide");
	$("#show-more-events-btn").show();
}

function getLoggedInUser(id)
{
   var main_url = localStorage.url + 'api/index.php/auth/user?gvm_json=1';
    jQuery.ajax({
      url: main_url,
      dataType: "json",
      method: "GET",
      success: function(obj) {
          db.transaction(function(tx) {                                        
            tx.executeSql('update OCEVENTS_user set position = "' + obj.data.position + '", team = "'+obj.data.team+'"');
            //alert('done')
            localStorage.event_language = obj.data.event_language;
           // alert(localStorage.event_language) 
                     
            login_process();
          });                                
      }
    }); 
}

function changecurrentevent(event_id,id)
{                  
    jQuery("footer .container").before('<div class="ui-widget-overlay"></div>');
    jQuery(".my-events-title").before('<div id="footerSlideContainer_loading"><img src="img/ajax-loader.gif" /></div>');
    jQuery(".ui-widget-overlay").show();
    jQuery("#footerSlideContainer_loading").show();
    
    var main_url = localStorage.url + 'api/index.php/main/changeEvent?gvm_json=1';
    jQuery.ajax({
      url: main_url,
      dataType: "json",
      method: "POST",
      data:{eventId:event_id},
      success: function(obj) {
          //alert(obj.data.event_id)
          //alert(obj.data.short_url)
          localStorage.event_id = obj.data.event_id;
          localStorage.short_url = obj.data.short_url;
          if(id == '1') 
        	{
              localStorage.triggerbtn = "yes";
        	}
            getLoggedInUser();
       
          
      }
    });
}

function login_process() {

	

    db.transaction(function(tx) {
        tx.executeSql('delete from OCEVENTS_qa');
        tx.executeSql('delete from OCEVENTS_homepage');
    });    
    var main_url = localStorage.url + 'user-profile/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
   // alert(main_url);
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
                 //alert(JSON.stringify(obj));
        
            $.each(obj.userQA, function(i, dataVal) {
                localStorage.qlabel = obj.userQA[0].label;
                if (i != 0 && dataVal.question != undefined && dataVal.answer != undefined) {
                    if (dataVal.question != undefined && dataVal.question != null && dataVal.question != '') {
                        db.transaction(function(tx) {
                            tx.executeSql("insert into OCEVENTS_qa (user_id,question,answer) values('" + localStorage.user_id + "','" + dataVal.question + "','" + dataVal.answer + "')");
                        });
                    }
                }
            });  
           
            importhomepage();
        },error: function(XMLHttpRequest, textStatus, errorThrown) { 
			  // alert("Status: " + textStatus); 
			// alert("Error: " + errorThrown); 
			// alert("Errors: " + XMLHttpRequest); 

			importhomepage();
		}  

    }); 

}

function importhomepage() {
	

    if(localStorage.event_language == 'en')
    {
       var main_urld = localStorage.url + 'api/index.php/main/keywords?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id;
    }
    else
    {
        var main_urld = localStorage.url + 'api/index.php/main/keywords?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id + '&locale='+localStorage.event_language;
    }
   // alert(main_urld)
    jQuery.ajax({
        url: main_urld,
        dataType: "json",
        method: "GET",
        success: function(ss) {
  
         db.transaction(function(tx) {
         tx.executeSql('delete from OCEVENTS_keywords');
        jQuery.each( ss.data, function( key, val ) {
          
      
          tx.executeSql("insert into OCEVENTS_keywords (key_constant,key_val) values ('"+key+"','"+escape(val)+"')");
          
        });
         }); 
        var ajax_url = localStorage.url + 'api/index.php/main/sitebuilderMenu?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id;
      
        jQuery.ajax({
        url: ajax_url,
        dataType: "json",
        method: "GET",
        success: function(obja) {
           //alert(JSON.stringify(obja.data))
         if(checkdefined(obja.data) == 'yes')
         {
            localStorage.menu = 'yes';
            localStorage.website_id = obja.data[0].website_id;            
         } 
          var main_url = localStorage.url + 'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id;
         
          jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
            if (obj.status == 'error') {
                //alert(obj.message);
                window.location.href = "index.html";
            } else {
                 db.transaction(function(tx) {
                 tx.executeSql("SELECT * FROM OCEVENTS_events", [], function(tx, results) {
                  var len = results.rows.length;
                  //alert(len)
                 // alert('here 2');
               if(len == 0)
               {
               	localStorage.sideMenuEventsLimit = obj.data._extra.sideMenuEventsLimit;
                   tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_events (id integer primary key autoincrement,event_id,user_id,title,description,logo,image, short_url)');
                   tx.executeSql("delete from OCEVENTS_events");                            
                         
                  $.each( obj.data._extra.userEvents, function( key, val ) {
                   			
                              //document.write(val.event_id+'<br />');
                              if(val.event_id == localStorage.event_id)
                              {
                                  localStorage.event_id = val.event_id;
                                  localStorage.short_url = val.short_url;
                                   // alert(localStorage.short_url)
                                  //alert(localStorage.event_id)
                              }
                             
                              //db.transaction(function(tx) {
                                  tx.executeSql('INSERT INTO OCEVENTS_events (event_id,user_id,title,logo,image, short_url) VALUES ("' + val.event_id + '","' + val.user_id + '","' + val.title + '","' + val.logo + '","' + val.image + '","' + val.short_url + '")');
                                  //tx.executeSql('INSERT INTO OCEVENTS_events (event_id,user_id,title,description,logo,image, short_url) VALUES ("' + val.event_id + '","' + val.user_id + '","' + val.title + '","' + val.description + '","' + val.logo + '","' + val.image + '","' + val.short_url + '")');
                                  //alert('INSERT INTO OCEVENTS_events (event_id,user_id,title,logo,image, short_url) VALUES ("' + val.event_id + '","' + val.user_id + '","' + val.title + '","' + val.logo + '","' + val.image + '","' + val.short_url + '")')
                             // });                
                      }); 
                }
                  });
                  });
            
                 
                  // alert(obj.data.type)         
                if (obj.data.type == 'content') {
                     //alert('here content')
                    db.transaction(function(tx) {

                        
                        tx.executeSql("delete from OCEVENTS_homepage");
                        tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type,module_type) VALUES ('','','" + localStorage.user_id + "','" + obj.data.content.main_title + "','" + obj.data.content.main_text + "','" + obj.data.content.main_link + "','" + obj.data.type + "','" + obj.data.content.main_title +"')");
                        //alert("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('','','"+localStorage.user_id+"','"+obj.data.content.main_title+"','"+obj.data.content.main_text+"','"+obj.data.content.main_link+"','"+obj.data.type+"')");
                        //alert("SELECT * FROM OCEVENTS_homepage");

                    });
                    
                    var STRD = localStorage.url + "gamification/-/"+localStorage.short_url+"-"+localStorage.event_id+"/?gvm_json=1";
                        // alert(STRD)           

                        jQuery.ajax({
                            url: STRD,
                            dataType: "json",
                            success: function(obj) {
                                if(checkdefined(obj.GSettingsExtraData.main_banner_video) == 'yes')
                                {
                                	$.each(obj.GSettingsExtraData.main_banner_video.__videoItem, function(key, res) {
                                		if(res.hosted_vimeo_id !== undefined) {
                                			db.transaction(function(tx) {
												tx.executeSql('update OCEVENTS_homepage set banner_video = "' + res.hosted_vimeo_id + '"'); 
												                                      
											});
										}
									});
                                }
                            }
                            
                          });  
                    
                    
                    var DIR_Name = 'oc_photos';
                    var a = new DirManager();
                    a.create_r(DIR_Name, Log('created successfully'));
                    var b = new FileManager();
                    // alert(obj.data.main_logo_image.small_url);
                    // alert(obj.data.content.main_banner_image.medium_url);
                    if (obj.data.main_logo_image != null) {
                        var img_src = obj.data.main_logo_image.small_url; 
                        //var img_src = 'http://weknowyourdreams.com/images/love/love-09.jpg';
                        var image_name = getFileNameFromPath(img_src);
                        //alert(image_name)
                        //alert(img_src)   
                        var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
                        //alert(STR)           

                        jQuery.ajax({
                            url: STR,
                            dataType: "html",
                            success: function(DtatURL) {
                                
                                b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(obj.data.main_logo_image.small_url), function(theFile) {
                                     //alert(getFileNameFromPath(obj.data.main_logo_image.small_url))
                                    var ImgFullUrl = '';
                                    ImgFullUrl = theFile.toURI();
                                   // alert(ImgFullUrl);
                                    db.transaction(function(tx) { 
                                        tx.executeSql('update OCEVENTS_homepage set main_logo_small_image = "' + ImgFullUrl + '"');
                                       // alert('update OCEVENTS_homepage set main_logo_small_image = "' + ImgFullUrl + '"');
                                        if (obj.data.content.main_banner_image == null) {  
                                            //alert(obj.data.content.main_banner_image);
                                            //window.location.href = "gamification.html"; 

                                            loadgamification(); 
                                        }
                                    });

                                });
                            }
                        });
                    }
                    if (obj.data.content.main_banner_image != null) { 
                        var img_src = obj.data.content.main_banner_image.medium_url;
                        //var img_src = 'https://www.google.ro/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';
                        var image_name = getFileNameFromPath(img_src);
                        //alert(img_src);
                          
                        var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;


                        jQuery.ajax({
                            url: STR,
                            dataType: "html",
                            success: function(DtatURL) {

                                //alert(DtatURL);  
                                //adb logcat *:E		 
                                // alert(obj.data.image.image_src);
                                b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(obj.data.content.main_banner_image.medium_url), function(theFile) {

                                    var BannerImgFullUrl = '';
                                    //ImgFullUrl = localStorage.ImgFullUrl; 
                                    //alert(localStorage.ImgFullUrl);
                                    BannerImgFullUrl = theFile.toURI();
                                    //alert(BannerImgFullUrl);                          
                                    db.transaction(function(tx) {

                                        tx.executeSql('update OCEVENTS_homepage set main_banner_image = "' + BannerImgFullUrl + '"');
                                       // alert('update OCEVENTS_homepage set main_banner_image = "' + BannerImgFullUrl + '"');
                                        tx.executeSql("SELECT * FROM OCEVENTS_homepage", [], function(tx, results) {
                      //var len = results.rows.length;
                        //alert(results.rows.item(0).main_logo_small_image);
                       // alert(results.rows.item(0).main_banner_image);                
                
                
                });                       
                                        //window.location.href = "gamification.html"; 
                                        loadgamification(); 
                                    });
                                });
                            }
                        });
                    }

                    if (obj.data.content.main_banner_image == null && obj.data.main_logo_image == null) {
                        //window.location.href = "gamification.html";   
                        loadgamification();
                    }

                } else if (obj.data.type == 'url') {
                   // alert('here url')
                   image_url ="/resources/files/event/images/thumb_1464273519.jpg";
                	if(checkdefined(obj.data.main_logo_image) == "yes") {
                		downloadLogoFile(obj.data.url, obj.data.type, obj.data.main_logo_image.small_url);
                	}
                	else {
                		downloadLogoFile(obj.data.url, obj.data.type, image_url);
                	}
                	// if(localStorage.url == "https://beta.oceventmanager.com/"){
                	// 	downloadLogoFile(obj.data.url, obj.data.type, image_url); 
                	// }
                	// else{
	                //     downloadLogoFile(obj.data.url, obj.data.type, obj.data.main_logo_image.small_url);
	                // }

                }
                else if (obj.data.type == 'module') {
                	image_url ="/resources/files/event/images/thumb_1464273519.jpg";
                	if(checkdefined(obj.data.main_logo_image) == "yes") {
                		downloadmoduleLogoFile(obj.data.module, obj.data.type, obj.data.main_logo_image.small_url); 
                	}
                	else {
                		downloadmoduleLogoFile(obj.data.module, obj.data.type, image_url);
                	}
                	// if(localStorage.url == "https://beta.oceventmanager.com/"){
                	// 	downloadmoduleLogoFile(obj.data.module, obj.data.type, image_url); 
                	// }
                	// else{
                	// 	downloadmoduleLogoFile(obj.data.module, obj.data.type, obj.data.main_logo_image.small_url); 
                	// }
                                      
                                       
                } else {
                    db.transaction(function(tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type,main_logo_small_image)');
                        tx.executeSql("delete from OCEVENTS_homepage");
                        tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,type) VALUES ('" + localStorage.user_id + "','" + obj.data.type + "')");
                        //window.location.href = "gamification.html";    
                        loadgamification();
                    });
                }
            }
        }
    });
    }
        
        });
        }
        
        });
    
    

}

var pictureSource; // picture source
var destinationType; // sets the format of returned value

// Wait for device API libraries to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// device APIs are available
//
function onDeviceReady() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}

//function to download logo from module
function downloadmoduleLogoFile(url, type, img_src)
{   //document.write('<scr'+'ipt type="text/javascript" src="painlessfs.js" ></scr'+'ipt>'); 

    var DIR_Name = 'oc_photos';
   /* alert(url);
    alert(type);
    alert(img_src); */
    var a = new DirManager();
    a.create_r(DIR_Name, Log('created successfully'));
    var b = new FileManager();
    var image_name = getFileNameFromPath(img_src);
    var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
    //alert(STR)
    jQuery.ajax({
        url: STR,
        dataType: "html",
        success: function(DtatURL) {
            b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(img_src), function(theFile) {
                var img_uri = theFile.toURI();
               // alert(img_uri);
                db.transaction(function(tx) {

        tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id,main_logo_small_image,main_banner_image,main_title,main_text,main_link,type,iframe_url)');
        tx.executeSql("delete from OCEVENTS_homepage");
        tx.executeSql("INSERT INTO OCEVENTS_homepage (main_logo_small_image,main_banner_image,user_id,main_title,main_text,main_link,type) VALUES ('"+img_uri+"','','','"+url+"','','','" + type + "')");
       //alert(url); 
        //window.location.href = "gamification.html";  
        loadgamification();

  });
            });
        }
    }); 
    
    
    
}

//function to download logo from server
function downloadLogoFile(url, type, img_src) {
   //document.write('<scr'+'ipt type="text/javascript" src="painlessfs.js" ></scr'+'ipt>'); 
    var DIR_Name = 'oc_photos';
   /* alert(url);
    alert(type);
    alert(img_src); */
    var a = new DirManager();
    a.create_r(DIR_Name, Log('created successfully'));
    var b = new FileManager();
    var image_name = getFileNameFromPath(img_src);
    var STR = localStorage.url + "api/index.php/main/base64Image?XDEBUG_SESSION_START=PHPSTORM&image=" + img_src;
    //alert(STR)
    jQuery.ajax({
        url: STR,
        dataType: "html",
        success: function(DtatURL) {
            b.download_file(DtatURL, DIR_Name + '/', getFileNameFromPath(img_src), function(theFile) {
                var img_uri = theFile.toURI();
               // alert(img_uri);
                db.transaction(function(tx) {
                    tx.executeSql('CREATE TABLE IF NOT EXISTS OCEVENTS_homepage (id integer primary key autoincrement,user_id, iframe_url,type,main_logo_small_image)');
                    tx.executeSql("delete from OCEVENTS_homepage");
                    tx.executeSql("INSERT INTO OCEVENTS_homepage (user_id,iframe_url,type,main_logo_small_image) VALUES ('" + localStorage.user_id + "','" + url + "','" + type + "','" + img_uri + "')");
                    //window.location.href = "gamification.html";  
                    loadgamification();
                });
            });
        }
    }); 
}

//function to import footer links
function importfooter(page, active) {
    //alert(page + " , " + active);
    var main_url = localStorage.url + page + '/?gvm_json=1&event_id=' + localStorage.event_id;
    // alert(main_url);
    db.transaction(function(tx) {

        
        tx.executeSql("delete from OCEVENTS_footerlinks");

        
        tx.executeSql("delete from OCEVENTS_footermorelinks");
    });
    jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(data) {
            if (data._footerMenuData != undefined && data._footerMenuData != 'undefined') {
                var getdata = data._footerMenuData;
            } else {
                var getdata = data.data._footerMenuData;

            }

            if (checkdefined(getdata.prevPresentation) == 'yes') {
            	localStorage.idprevmbtn = "1";
            } else {
            	localStorage.idprevmbtn = "0";
            }

            if (checkdefined(getdata.nextPresentation) == 'yes') {
            	localStorage.idnextmbtn = "1";
            } else {
            	localStorage.idnextmbtn = "0";
            }

            jQuery.each(getdata.mainButtons, function(key, val) {
                //alert(val.name);
                db.transaction(function(tx) {
                    var friend_count = 0;

                    var inputString = val.href;
		            if ( inputString.indexOf("g-homepage") > -1 ) {
						var linktoval = "home";
		            } 
		            else if ( inputString.indexOf("agenda") > -1 ) {
						var linktoval = "agenda";
		            } 
		            else if ( inputString.indexOf("sponsors") > -1 ) {
						var linktoval = "sponsors";
		            }
		            else if ( inputString.indexOf("friend") > -1 ) {
						var linktoval = "friends";
		            }
		            else if ( inputString.indexOf("points") > -1 ) {
						var linktoval = "points";
		            }
		            else if ( inputString.indexOf("note") > -1 ) {
						var linktoval = "note";
		            }
		            else {
		            	var linktoval = val.name;
		            }

                    if (val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined') {
                        friend_count = val.friends_requests_count;
                    }
                    tx.executeSql("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('" + linktoval + "','" + val.icon_class + "','" + friend_count + "','" + val.text + "')");
                    //alert("insert into OCEVENTS_footerlinks (name,icon,friends_requests_count,menu_text) values ('"+val.name+"','"+val.icon_class+"','"+friend_count+"','"+val.text+"')");
                });
            });
            jQuery.each(getdata.moreButtons, function(key, val) {

                db.transaction(function(tx) {
                    var mfriend_count = 0;

                    var inputString = val.href;
		            if ( inputString.indexOf("g-homepage") > -1 ) {
						var linktoval = "home";
		            } 
		            else if ( inputString.indexOf("agenda") > -1 ) {
						var linktoval = "agenda";
		            } 
		            else if ( inputString.indexOf("sponsors") > -1 ) {
						var linktoval = "sponsors";
		            }
		            else if ( inputString.indexOf("friend") > -1 ) {
						var linktoval = "friends";
		            }
		            else if ( inputString.indexOf("points") > -1 ) {
						var linktoval = "points";
		            }
		            else if ( inputString.indexOf("note") > -1 ) {
						var linktoval = "note";
		            }
		            else {
		            	var linktoval = val.name;
		            }
                    if (val.friends_requests_count != '' && val.friends_requests_count != undefined && val.friends_requests_count != null && val.friends_requests_count != 'null' && val.friends_requests_count != 'undefined') {
                        mfriend_count = val.friends_requests_count;
                    }
                    tx.executeSql("insert into OCEVENTS_footermorelinks (name,icon,friends_requests_count,menu_text) values ('" + val.name + "','" + val.icon_class + "','" + mfriend_count + "','" + val.text + "')");
                });
            });
            showfooter(active);
        }
    });
}

//function to show footer links
function showfooter(active) {
    db.transaction(function(tx) {
        tx.executeSql("SELECT * FROM OCEVENTS_footerlinks", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)
            if (len > 0) {
                jQuery('.footer-menu').html('');
                var link = '';
                var name = '';
                var menu_text = '';
                var icon = '';
                var active_class = '';
                var onclickfn = '';
                for (i = 0; i < len; i++) {
                    name = results.rows.item(i).name;
                    if (results.rows.item(i).icon == 'gicon-sponsors') {
                        name = 'sponsors';
                    }

                    if (name == active) {
                        active_class = 'active';
                    } else {
                        active_class = '';
                    }
                    if (name == 'home') {
                        link = '"index.html"';
                    } else {
                        link = '"#"';
                    }
					onclickfn = '';

                    
                    // if (name == 'home') {
                    // 	onclick = 'onclick="changetogamification(); return false;"';
                    // }
					if (name == 'agenda') {
                      onclickfn = 'onclick="changetoagenda(); return false;"';
                    }
                    if (name == 'friends') {
                      onclickfn = 'onclick="changetocontacts(); return false;"';
                    }
                    if (name == 'points') {
                      onclickfn = 'onclick="changetopoints(); return false;"';
                    }
                    if (name == 'sponsors') {
                      onclickfn = 'onclick="changetosponsors(); return false;"';
                    }
                    if (name == 'notes') {
                      onclickfn = 'onclick="changetonotes(); return false;"';
                    }
                    
                    var friends_requests_count = results.rows.item(i).friends_requests_count;
                    if (friends_requests_count > 0) {
                        var count_label = '<span class="count-label">' + friends_requests_count + '</span>';
                    } else {
                        var count_label = '';
                    }
                    menu_text = results.rows.item(i).menu_text;

                    icon = results.rows.item(i).icon;
                    jQuery('.footer-menu').append("<div class='label-container " + active_class + "'><a href=" + link + " " + onclickfn + "><label>" + count_label + "<i class=" + icon + "></i><p>" + menu_text + "</p></label></a></div>");
                }
            }
        });
        tx.executeSql("SELECT * FROM OCEVENTS_footermorelinks", [], function(tx, results) {
            var len = results.rows.length;
            //alert(len)          
            if (len > 0) {
                jQuery('.footer-menu').append('<div class="more-btn label-container"><label><i class="gicon-more"></i><p>More</p></label></div> ');

                if(localStorage.idprevmbtn == "1") {
                	var styleprev = '<li id="prevmbtn" class="prev" ><label><a title="Prev"><i class="fa fa-angle-left"></i><span>Prev</span></a></label></li>';
                }
                else{
                	var styleprev = '';
                }
                
				if(localStorage.idnextmbtn == "1") {
                	var stylenext = '<li class="next" id="nextmbtn"><label><a title="Next"><i class="fa fa-angle-right"></i><span>Next</span></a></label></li>';
                }
                else {
                	var stylenext = '';
                }

                var more_wrapper = '<div class="more-wrapper"><div class="footer-menu-opened"><ul><li><label><a id="home" href="#" onclick="loadgamification(); return false;"><i class="gicon-welcome"></i><span>Home</span></a></label></li>' + styleprev + ' ' + stylenext + '</ul><ul class="divider"><li><i class="gicon-gamification"></i><span class="line"></span></li></ul><ul>';
                
                var link = '';
                var name = '';
                var menu_text = '';
                var icon = '';
                var active_class = '';
                var onclick = '';
                for (i = 0; i < len; i++) {
                    name = results.rows.item(i).name;
                   // alert(name + " , " + active);
                    if (name == active) {
                        active_class = 'class="active"';
                    } else {
                        active_class = '';
                    }
                    if (name == 'home') {
                        link = '"index.html"';
                    } else
                    {
                      link = '"#"';
                    }
                    onclick = '';
                    
                    // if (name == 'home') {
                    // 	onclick = 'onclick="changetogamification(); return false;"';
                    // }
                    if (name == 'agenda') {
                      onclick = 'onclick="changetoagenda(); return false;"';
                    }
                    if (name == 'friends') {
                      onclick = 'onclick="changetocontacts(); return false;"';
                    }
                    if (name == 'points') {
                      onclick = 'onclick="changetopoints(); return false;"';
                    }
                    if (name == 'notes') {
                      onclick = 'onclick="changetonotes(); return false;"';
                    }
                    if(name == 'comments')
                    {
                      onclick = 'onclick="add_comments(); return false;"';
                    }
                    if(name == 'q_and_a')
                    {
                      onclick = 'onclick="add_questions(); return false;"';
                    }
                    if(name == 'quiz')
                    {
                      onclick = 'onclick="add_quiz(); return false;"';
                    }
                    if(name == 'voting')
                    {
                      onclick = 'onclick="voting(); return false;"';
                    }
                    if(name == 'seeker')
                    {
                      onclick = 'onclick="gotoseeker(); return false;"';
                    }
                    //alert(onclick);
                    menu_text = results.rows.item(i).menu_text;
                    icon = results.rows.item(i).icon;
                    more_wrapper += '<li '+active_class+'><label><a href="' + link + '" '+onclick+'><i class=' + icon + '></i><span>' + menu_text + '</span></a></label></li>';
                }


                more_wrapper += '</ul></div></div>';
                //more_wrapper += '';
                 //alert(more_wrapper);

                jQuery('.footer-menu').prepend(more_wrapper);
                jQuery('.more-btn').on('click', function() {
                	$("#tooltipster-409679").hide();
                    jQuery('.footer-menu').toggleClass('footer-menu-open');
                });
            }
        });
    });
}
//function to redirect to seeker
function gotoseeker()
{
  //window.location.href="seeker.html"
  changetoseeker();
}

//function to load notes
function loadnotes()
{
    //alert(ur)
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();        
        $(".notes-agenda-container").hide();
        $(".list-agendalist-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id, 'notes'); 
        var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id +'/?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               $('.header-title h1').html(obj.pageTitle);
               $('.questions-heading-title').hide();
               if(checkdefined(obj.countNoteInstances) == 'yes')
               {
                  $('.questions-heading-title').show();
                  $('.votes-count .green-text').html(obj.countNoteInstances);
                  $('#allnotes').html('');
                  $.each(obj.noteInstances, function(key, val) {
                  
                  var remstr = '';
                  if(obj.currentEventUserId == val.eventuser_id)
                  {
                     remstr = ' <div class="clearfix"><a class="pull-right delete-note" href="javascript:removenote('+val.instance_id+')" data-url="/Add-note/-/'+localStorage.short_url+'-100041/delete/28"><i class="fa fa-times"></i></a></div>'; 
                  }
                  
              var comment_image = '';
              var increment_commentimage = 0;
              if(checkdefined(val.images) == 'yes')
              {	
              	comment_image += '<div class="images-container clearfix">';
              	$.each(val.images, function(key, data) {
                  comment_image += '<div class="col-xs-6 col-md-4 col-lg-2 image-container"><i data-image-position="' + increment_commentimage + '" class="fa fa-times delete-note-image" onclick="removenotesimages(' + val.instance_id + ',' + increment_commentimage + ')"></i><span data-mfp-src="'+localStorage.url+'resources/files/images/'+data.large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+data.small+'" class="resize-img notes-resize-images"></span></div>';
                  increment_commentimage++;
              	});
              	comment_image += '</div">';
              }
              var comment_video = '';
              var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;
              if(checkdefined(val.__videoItem) == 'yes')
              {
                  if(checkdefined(val.__videoItem.hosted_vimeo_id) == 'yes')
                  {
                     if(isIphone)
                     {
                        if(checkdefined(res.hosted_vimeo_link_hd) == 'yes') {
							// alert("hd");
							var videoUrl = "http:" + res.hosted_vimeo_link_hd;
						}
						else if(checkdefined(res.hosted_vimeo_link_sd960) == 'yes') {
							// alert("sd960");
							var videoUrl = "http:" + res.hosted_vimeo_link_sd960;
						}
						else if(checkdefined(res.hosted_vimeo_link_sd640) == 'yes') {
							// alert("sd640");
							var videoUrl = "http:" + res.hosted_vimeo_link_sd640;
						}
						else if(checkdefined(res.hosted_vimeo_link_hls) == 'yes') {
							// alert("hls");
							var videoUrl = "http:" + res.hosted_vimeo_link_hls;
						}
						else if(checkdefined(res.hosted_vimeo_link_mobile) == 'yes') {
							// alert("mobile");
							var videoUrl = "http:" + res.hosted_vimeo_link_mobile;
						}
						
						comment_video = '<div style="width:60%;padding:20px;margin:0 auto;" align="center"><div class="video-player-wrapper" style="display: inline-flex; height: 100%; padding: 0px;"><video src="http:' + res.hosted_vimeo_link_sd640 + '" webkit-playsinline style="width: 100%; background-color: #000;" controls></video></div></div>';
							
                        // comment_video = '<div style="width:60%;padding:20px;margin:0 auto;" align="center"><div class="video-player-wrapper"><iframe id="videoPlayer-' + val.__videoItem.hosted_vimeo_id + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + val.__videoItem.hosted_vimeo_id + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div></div>';
                     }
                    else
                    {
                      comment_video = '<div style="width:60%;padding:20px;margin:0 auto;" align="center"><div class="video-player-wrapper"><iframe id="videoPlayer-' + val.__videoItem.hosted_vimeo_id + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + val.__videoItem.hosted_vimeo_id + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div></div>';
                      // comment_video = '<div class="video-item"><div class="video-wrapper"><div class="video-container"> <video class="future-video video" controls><source src="' + localStorage.url+ 'resources/files/videos/' + val.video_filename + '" webkit-playsinline width="480" height="320" type="video/mp4"></video></div></div></div></div>'; 
                    } 
                }    
              }
                      var str = '<div id="note_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-12 question-item-info"><h3 class="clearfix">'+val.first_name+' '+val.last_name+'<span><i class="fa fa-clock-o"></i> '+val.time_since+'</span></h3><div class="question-inner"><div><i class="gicon-notes"></i></div><p>'+val.notes+'</p></div></div>'+comment_image+comment_video+'</div>'+remstr+'</div>';
                   $('#allnotes').append(str); 
                   if(isIphone && checkdefined(val.video_filename) == 'yes')
                   {
                      var canvasVideo = new CanvasVideoPlayer({
                    			videoSelector: '.js-video_'+val.instance_id,
                  			canvasSelector: '.js-canvas_'+val.instance_id,
                  			timelineSelector: '.js-timeline_'+val.instance_id,
                    			audio: true
                      });
                   }  
                  });
                  
               }
               $(".close-btn-wrapper").click(function()
               {
                  //alert("here")
                  $("#show-form-container").show();
                  $(".questions-filter-items").fadeOut();
               }); 
               localStorage.resubmit_code = obj.form.noResubmitCode;               
               db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'ToggleForm')
                      {
                        $('#show-form-container').html(unescape(results.rows.item(i).key_val));                        
                      }
                      if(results.rows.item(i).key_constant == 'WriteANotePlaceholder')
                      {
                        $('#frmfld_note').attr('placeholder',unescape(results.rows.item(i).key_val));                        
                      }
                      if(results.rows.item(i).key_constant == 'AddNoteSubmit')
                      {
                        $('.submit_com').html(unescape(results.rows.item(i).key_val));                        
                      }
                      if(results.rows.item(i).key_constant == 'RemoveNote')
                      {
                        $('.delete-note .fa-times').after(unescape(results.rows.item(i).key_val));                        
                      }
                      if(results.rows.item(i).key_constant == 'AddNoteNotes')
                      {
                        $('.votes-count').append(unescape(results.rows.item(i).key_val));                        
                      }
                      
                      
                      
                      
                  }
               });
             });     
               $(".notes-agenda-container").show();
               $(".loading_agenda_items").hide();
            }
       });     
    });    
}
function removenotesimages(noteId , imagePosition) {
	
	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
	
	jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            action: 'delete_note_image',
            imagePosition: imagePosition,
            noteId: noteId
        },
        success: function(resp) {
           changetonotes();
        }
   });
}

//function to add note
function addnote()
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
   //alert(form_noresubmit_code)
    var code = jQuery('#frmfld_note').val();
    if(checkdefined(code) != 'yes')
    {
        //alert('Please enter note!');
        shownotification('Please enter note!',"Note");
        $('#frmfld_note').focus();
    }
    else
    {
    jQuery(".submit_com").hide();
    jQuery(".loading_send").show();
      if(checkdefined(localStorage.imageURI) == 'yes')
  {
    
    
    var imageData = localStorage.imageURI;
   
    //  alert(imageData);          
    var photo_ur = imageData;
    var options = new FileUploadOptions();
    var imageURI = photo_ur;
    options.fileKey = "files[]";
    
    if(localStorage.mime == 'video/mp4')
    {
       if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
          var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      } else {
          var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.mp4';
      }
    }
    else
    {
    
      if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
          var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
      } else {
          var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
      }
    }
    options.fileName = newfname;
   // alert(newfname);
    options.mimeType = localStorage.mime;
    var params = new Object();    
    params.submit_form = submit_form;
    params.form_noresubmit_code = form_noresubmit_code;
    params.note = code;
    
    //options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
    options.params = params;
    options.chunkedMode = false;
    var ft = new FileTransfer();
    //alert(imageURI);
    var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    ft.upload(imageURI, encodeURI(main_url), win, fail, options);

    function win(r) {
      localStorage.imageURI = '';
      localStorage.resubmit_code= '';      
       //window.location.href="notes.html"
       changetonotes();
    }

    function fail(error) {
        alert("An error has occurred: Code = " + error.code);
        alert("upload error source " + error.source);
        alert("upload error target " + error.target);
        jQuery(".submit_com").show();
        jQuery(".loading_send").hide();
    }
    
   }
   else
   { 
      var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-'+localStorage.event_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                submit_form: submit_form,
                form_noresubmit_code:form_noresubmit_code,
                note:code
            },
            success: function(resp) {
               //window.location.href = 'notes.html';
               changetonotes();
            }
       });
    } 
    }       
}

 function onConfirmNote(buttonIndex) {
        if(buttonIndex == '1')
        {
            //alert('hello');
            var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id +'/delete/'+localStorage.noteid+'/?gvm_json=1';
            $.ajax({
              url: main_url,
              dataType: "json",
              method: "GET",
              success: function(obj) {
                //window.location.href = 'notes.html';
                changetonotes();
             }
        });
        }
      
    }

//function to remove note
function removenote(id)
{
   
   localStorage.noteid = id;
   db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length; 
                  var con = ''; 
                  var pr = '';  
                  var ys = '';  
                  var noo = '';              
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'commentDeleteConfirmation')
                      {
                        con = unescape(results.rows.item(i).key_val);                        
                      }
                      if(results.rows.item(i).key_constant == 'Notes')
                      {
                         pr = unescape(results.rows.item(i).key_val); 
                      } 
                      if(results.rows.item(i).key_constant == 'yes')
                      {
                         ys = unescape(results.rows.item(i).key_val); 
                      }
                      if(results.rows.item(i).key_constant == 'no')
                      {
                         noo = unescape(results.rows.item(i).key_val); 
                      }  
                      
                   }
  
 /* navigator.notification.alert(
            'You are the winner!',  // message
            alertDismissed,         // callback
            'Game Over',            // title
            'Done'                  // buttonName
        );
        function alertDismissed() {
       alert('do something');
    } */
    

    // Show a custom confirmation dialog
    //
    
        navigator.notification.confirm(
            con,  // message
            onConfirmNote,              // callback to invoke with index of button pressed
            pr,            // title
            ys+","+noo         // buttonLabels
        );
   
  /*if(confirm(con))
  {
    var main_url = localStorage.url + 'Add-note/-/'+localStorage.short_url+'-' + localStorage.event_id +'/delete/'+id+'/?gvm_json=1';
          $.ajax({
              url: main_url,
              dataType: "json",
              method: "GET",
              success: function(obj) {
                window.location.href = 'notes.html';
             }
        });
        } */ 
      });
    });     
         
}

function showseekerresults(ur)
{
    //alert(ur)
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();        
       // $(".seeker-game-container").hide();
        $(".single-seeker-container").hide();
		$(".seeker-results-container").hide();
        $(".loading_agenda_items").show(); 
        importfooter('seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id+'/'+ur, 'agenda'); 
        var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/' + ur + '/?gvm_json=1';
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                $.each(obj.breadcrumbs, function(key, val) {
                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                $('.congratsText').html(obj.congratsText);
                $('.table tbody').html('');
                $.each(obj.items, function(key, val) {
                var cssofclass = '';
                var tdcssofclass = '';
                if(val.is_current_user == 'true' || val.is_current_user == true)
                {
                   cssofclass = 'class="current-user"';
                   tdcssofclass = 'class="player-name"';
                } 
                
                if(val.correct_answers == '-')
                {
                    var str = '-';
                }
                else
                {
                    var str = val.correct_answers+'/'+obj.floormapsCount;
                }
                               
                    $('.table tbody').append('<tr '+cssofclass+'><td '+tdcssofclass+'><div class="player-name-wrapper"><span class="player-position">'+val.position+'.</span>'+val.name+'</div></td><td class="correct-answers">'+str+'</td><td class="seeker-hints-col"><span class="hints-count-label label label-danger">'+val.hints+'</span></td><td class="points">'+val.no_1_count+'</td><td class="points">'+val.no_2_count+'</td><td class="points">'+val.no_3_count+'</td><td>'+val.points+'</td></tr>');    
                });
                if(checkdefined(ur) == 'yes')
                {
                    $('.seeall').html('Top Scores');
                    $('.seeall').attr('href','javascript:showseekerresults();');
                }
                else
                {
                   $('.seeall').html('All');
                   $('.seeall').attr('href','javascript:showseekerresults("l-full");');
                }
                db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'seekerFinishedTitle')
                    {
                        $('.seek-questions .green-text').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerEndCongratulationsTitle')
                    {
                        $('.congrat-text-wrapper .green-text').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SeekerPlayAgain')
                    {
                        $('.reset_seek').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerTopScoresTitle')
                    {
                        $('.seeker-scores-table-heading').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerCorrectAnswers')
                    {
                        $('.crct').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerHints')
                    {
                        //alert(results.rows.item(i).key_val)
                        $('.hint_h').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerPlaces')
                    {
                        $('.plcs').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'SeeFullList')
                    {
                        $('.seeall').html(unescape(results.rows.item(i).key_val));                     
                    }
                    
                     
                    
                 }
           });
        });
                
                $(".seeker-results-container").show();
                $(".loading_agenda_items").hide();  
           }
        });               
    });    
                    //4,981
}

//function to reset seeker game
function reset_seeker()
{                         
    var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/reset_seeker?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              //window.location.href = 'seeker.html';
              changetoseeker();
            }
        });
}        

function showseeker()
{
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        
       // $(".seeker-game-container").hide(); 
        $(".single-seeker-container").hide();
		   $(".seeker-results-container").hide();
        jQuery(".loading_agenda_items").show();
          importfooter('seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        
        
        var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';
        
         $('.prev').attr('onclick', 'gotoagenda("' + localStorage.agenda_id + '")');
        // alert("hello");
         
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {  
              $('.show-hint').click(function()
              {
                var seeker_id = obj.currentFloormapInstance.seeker_session_a_i_id.value;
                var get_seeker_hint = 'get_seeker_hint';
                var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
                //alert(main_url)
                $.ajax({
                  url: main_url,
                  dataType: "json",
                  method: "POST",
                  data: {
                    action: get_seeker_hint,
                    seekerId: seeker_id
                  },                 
                  success:function(datas) {
                      $('.seeker-hint').html(datas.hint);
                      $('.seeker-hint').show();
                  },
                  error: function(xhr, textStatus, errorThrown){
                         alert('Request Failed');                  
                  } 
                 
              });
              });              
                    
               $.each(obj.breadcrumbs, function(key, val) {
                     
                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });  
                
                
                if(checkdefined(obj.congratsText) == 'yes')
                {
                   //window.location.href = 'seeker_results.html';
                   changetoseekerresults();
                }              
                   
                  $('.oneof').html(obj.currentPosition);
                  $('.totalof').html(obj.floormapsCount);
                  $('.bordered').html(''); 
                  for(j = 1; j<=obj.floormapsCount; j++)
                  {
                     if(j == obj.userPositionForFloormap)
                     {
                         var classofcss = 'class="active"';
                     }
                     else
                     {
                         var classofcss = '';
                     }
                     var borderedj = '.bordered'+j;    
                     $('ul.bordered').append('<li '+classofcss+'>'+j+'</li>'); 
                     $(borderedj).html('<span>'+j+'</span>'); 
                  }  
                  localStorage.correct_answer = obj.currentFloormapInstance.code.value;  
                  $('.seeker-description').html(''); 
                  
                  //if(checkdefined(obj.currentFloormapInstance.floormap_image) == 'yes')
                  if(checkdefined(obj.currentFloormapInstance.floormap_image.__extra.large_file_name) == "yes")
                  {   
                  	$('.seeker-map-wrapper').html('<img src='+localStorage.url+'resources/files/images/'+obj.currentFloormapInstance.floormap_image.__extra.large_file_name+' width:100%;/>');                      
                  }  
                  else {
                  	 $('.seeker-map-wrapper').html("&nbsp;");
                  }        
                  $('.seeker-description').append(obj.currentFloormapInstance.description.value+'<div class="seeker-hint"></div>');
                  if(checkdefined(obj.currentFloormapInstance.hint) == 'yes')
                  {
                    $('.seeker-hint').html(obj.currentFloormapInstance.hint.value);
                  }
                  else
                  {
                      $('.show-hint').hide();
                  }
                  
                  
                  localStorage.resubmit_code = obj.form.noResubmitCode;
                  
                  db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'SeekerShowHint')
                    {
                        $('.show-hint').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'seekerSendCode')
                    {
                        $('.submit_com').html(unescape(results.rows.item(i).key_val));                     
                    }
                     
                    
                 }
           });
        });
                  $(".single-seeker-container").show();
                  $(".loading_agenda_items").hide();
              }
           });        
        });
}

//function to submit answer for seeker
function submitseekeranswer()
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
   //alert(form_noresubmit_code)
    var code = jQuery('#frmfld_code').val();
    if(checkdefined(code) != 'yes')
    {
        //alert('Please submit your answer!');
        shownotification('Please submit your answer!',"Seeker");
        $('#frmfld_code').focus();
    }
    else
    {
      //jQuery(".submit_com").hide();
      //jQuery(".loading_send").show(); 
      var main_url = localStorage.url + 'seeker/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
                submit_form: submit_form,
                form_noresubmit_code:form_noresubmit_code,
                code:code
            },
            success: function(resp) {
                localStorage.resubmit_code = '';
                $('.seeker-description img').remove();
                $('.seeker-map-wrapper').show();
                if(localStorage.correct_answer == code)
                {
                  localStorage.correct_answer = '';
         $('.seeker-map-wrapper').html('<div class="seeker-bg-overlay"></div><a href="#" onclick="changetoseeker();" class="msg-wrapper"><div class="right-msg-container"><i class="fa fa-check"></i><h4><p>You got the <strong>correct</strong> code!</p></h4><p>New task starts in <span id="countdown" class="hasCountdown">05</span> seconds...</p></div></a>');
         
                    var c = 5;
                    setInterval(function(){
                		c--;
                		if(c>=0){
                			$('#countdown').text(c);
                		}
                    if(c==0){
                       //window.location.href="seeker.html"
                       changetoseeker();
                    }
                	},1000);
                }
                else
                {
                 localStorage.correct_answer = '';
         $('.seeker-map-wrapper').html('<div class="seeker-bg-overlay"></div><a class="msg-wrapper" href="#" onclick="changetoseeker();"><div class="wrong-msg-container"><i class="fa fa-ban"></i><h5><p>The entered code is <strong>incorrect</strong>. <br>Try again!</p></h5><p>New task starts in <span id="countdown" class="hasCountdown">5</span> seconds...</p></div></a>');
         
              var c = 5;
              setInterval(function(){
          		c--;
          		if(c>=0){
          			$('#countdown').text(c);
          		}
                  if(c==0){
                      //window.location.href="seeker.html"
                      changetoseeker();
                  }
          	},1000);
                }
                
                //
            }
        });
    }  
}

//function to redirect to voting
function voting()
{
    //window.location.href="voting.html"
    changetovoting();
}

function sortvoting(s,r)
{
	$('.loading_agenda_items').show();

	$('.voting-content-item ul').html("&nbsp;");
	var l = 1;

	showvoting(s,r,l);
}

//function to show voting
function showvoting(sortby,sortdr,l)
{
	// alert(sortby + " , " + sortdr + " , " + l);
   jQuery(document).ready(function($) {

        // event.preventDefault();
	$('.voting-content-item ul').html("&nbsp;");
        if(l != 1)
        {
          //loadcommonthings(); 
          isLoggedIn();
        }
        $(".voting-page-container").hide();
        if(checkdefined(sortby) != 'yes')
        {
          sortby = 'title_value';
        }
        if(checkdefined(sortdr) != 'yes')
        {
          sortdr = 'asc';
        }
        
 		jQuery(".loading_agenda_items").show();

 		var taonclk = "sortvoting('title_value','asc')";
		var tdonclk = "sortvoting('title_value','desc')";
		var laonclk = "sortvoting('votes_count','asc')";
		var ldonclk = "sortvoting('votes_count','desc')";
         $('.votes-count .green-text-text').html("votes");

		if(sortdr == 'desc' && sortby == 'title_value') {
			
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-down time_s"></i> Title </a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Votes </a>');
		}

		if(sortdr == 'asc' && sortby == 'title_value') {
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + tdonclk + '"><i class="fa fa-caret-up time_s"></i> Title </a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Votes </a>');
		}

		if(sortdr == 'asc' && sortby == 'votes_count') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Title </a><a onclick="' + ldonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-up like_s"></i> Votes </a>');
		}

		if(sortdr == 'desc' && sortby == 'votes_count') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Title </a><a onclick="' + laonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-down like_s"></i> Votes </a>');
		}


       $('.prev').attr('onclick', 'gotoagenda("' + localStorage.agenda_id + '")'); 
        
        importfooter('Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');

        if(localStorage.url == "https://beta.oceventmanager.com/"){
    		var main_urgl = localStorage.url + 'Add-vote/-/Beta-eventroute-' + localStorage.event_id + '/' + localStorage.agenda_id + localStorage.voteforwarderid +'/sort/'+sortby+'/'+sortdr+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
    	}
    	else{
    		var main_urgl = localStorage.url + 'Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + localStorage.voteforwarderid +'/sort/'+sortby+'/'+sortdr+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1'; 
    	}
       
        // alert(main_urgl);

		 setTimeout(function () {

        $.ajax({
            url: main_urgl,
            dataType: "json",
            method: "GET",
            success: function(obj) {
                 // alert(JSON.stringify(obj.voteItems));
                 // alert(obj.sortDir)
                localStorage.voteSessionId = obj.voteSessionId;
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                //$.each( obj.votesCount, function( k, v ) {
                   
                         $('.votes-count .green-text').html(obj.totalCount);
                    
                  
                   //});
                   $('.voting-content-item').html('<ul>');
                   var is_answer = 0;
                   if(obj.voteItems != undefined || obj.voteItems!= null) {
                   $.each(obj.voteItems, function( key, val ) {
                    if(checkdefined(val.is_active) == 'yes')
                    {
                       is_answer = 1;
                    }
                   });
                   
                    $.each( obj.voteItems, function( key, val ) {
						var classcss='';
						var classcssli='';
						var classss= '';
						var giveVoteConfirm= "";

						// alert(JSON.stringify(val));

						if(val.is_disabled == true && val.class == "active disabled") {
							classcss = 'style="background-color:#2c3139"';
						}
						if(val.is_disabled == false && val.class == "active") {
							classcss = 'style="background-color:#2c3139;opacity:0.3;"';
						}

						if(val.is_disabled == true) {
							classcssli = 'style="opacity:0.3"';   
							classss = 'class="disabled"';   
							giveVoteConfirm = "";                  
						}
						else {
							giveVoteConfirm = '<div class="voting-confirm-wrapper"><h4>Give your vote!</h4><div class="confirm-btn-wrapper"><a href="" class="cancel">Cancel</a><a href="#" onclick="givevote('+val.instance_id.value+');" class="voting-toggle-btn">Yes</a></div></div>'; 
						}

						var anImage = val.image.__extra.medium_file_name;
						if(anImage != "") {        
							if(anImage == null || anImage == undefined) {
								var voteImageUrl = '';
							}
							else {
								var voteImageUrlPath = localStorage.url + "/resources/files/images/" + anImage;
								var voteImageUrl = '<div class="voting-img-wrapper"><img alt="Awards_Presentation vote items_2" src="' + voteImageUrlPath + '" class="img-circle"></div>';
							}
						}

						//alert(voteImageUrl);
						$('.voting-content-item ul').append('<li '+classcssli+''+classss+'><a '+classcss+' href="#">' + voteImageUrl + '<h4 class="vote-item-title">'+val.title.value+'</h4><p class="vote-item-subtitle">'+val.subtitle.value+'</p><div class="voting-item-count"><i class="icon-voting"></i>'+val.votes_count+' <span class="forvotes">votes</span></div></a>' + giveVoteConfirm + '</li>');                      
					});
				}
                     
                     $('.voting-content-item').append('</ul>'); 
                     if(is_answer != 1)
                    {
                                         
                    $('.voting-content-item > ul > li > a, .voting-content-item > ul > li a.cancel , .voting-content-item > ul > li a.voting-toggle-btn').on('click', function (e)
                    {
						e.preventDefault();
						var btn = $(this);
						var votingContentWrapper = $('.voting-content-wrapper');
						var isInactiveWrapper = votingContentWrapper.hasClass('inactive');
						var isClosedWrapper = votingContentWrapper.hasClass('closed');
						var isDisabledItem = btn.closest('li').hasClass('disabled');

						if (isInactiveWrapper || isClosedWrapper || isDisabledItem) {
							return false;
						}
						else {
							btn.closest('li:not(.active)').toggleClass('opened');
						}
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
                  }                  
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
         
                
                if(obj.isFinished == 'true' || obj.isFinished == true)
                {
                   $('.voting-end-content-title').hide();
                   $('.voting-closed-content-title').show(); 
                }
                else
                {
                  $('.voting-end-content-title').show();
                   $('.voting-closed-content-title').hide();
                   if((obj.showOpensInTimer == true || obj.showOpensInTimer == 'true') && (obj.showClosesInTimer == false || obj.showClosesInTimer == 'false')) {
						$('.voting-countdown').countdown({
							until: +obj.opensInTime,
							onExpiry: refreshPresentationPage, 
							format: 'HMS', 
							compact: true
						});
					}
					else {
						$('.voting-countdown').countdown({
							until: +obj.closesInTime, 
							onExpiry: refreshPresentationPage, 
							format: 'HMS', 
							compact: true
						});
					}
        }
         if(l != 1){
         db.transaction(function(tx) {
                      tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                             
                      for (i = 0; i < len; i++) {  
                        // if(results.rows.item(i).key_constant == 'votes')
                        // {
                        //     $('.votes-count .green-text').html(' '+unescape(results.rows.item(i).key_val));                     
                        // }
                        // if(results.rows.item(i).key_constant == 'SortBy')
                        // {
                        //     $('.votes-sort span').html(unescape(results.rows.item(i).key_val)+': ');                     
                        // }
                        // if(results.rows.item(i).key_constant == 'sortByTitle')
                        // {
                        //     $('.tit_span_tag').html(unescape(results.rows.item(i).key_val));                     
                        // }
                        // if(results.rows.item(i).key_constant == 'sortByVotes')
                        // {
                        //     $('.vot_span_tag').html(unescape(results.rows.item(i).key_val));                     
                        // }
                        if(results.rows.item(i).key_constant == 'filterItems')
                        {
                            $('#vote-items-filter').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                        }
                        if((obj.showOpensInTimer == true || obj.showOpensInTimer == 'true') && (obj.showClosesInTimer == false || obj.showClosesInTimer == 'false')) {
							if(results.rows.item(i).key_constant == 'votingOpensIn')
	                        {
	                        	$('.voting-end-content-title h3 .fa-clock-o').html(' ');
	                            $('.voting-end-content-title h3 .votingClosesIn').html(' '+unescape(results.rows.item(i).key_val));                     
	                        }
						}
						else {
							if(results.rows.item(i).key_constant == 'votingClosesIn')
	                        {
	                        	$('.voting-end-content-title h3 .fa-clock-o').html(' ');
	                            $('.voting-end-content-title h3 .votingClosesIn').html(' '+unescape(results.rows.item(i).key_val));                     
	                        }
						}
                        if(results.rows.item(i).key_constant == 'votingFinished')
                        {
                        	$('.voting-closed-content-title h3 .fa-clock-o').html(' ');
                            $('.voting-closed-content-title h3 .votingStatus').html(unescape(results.rows.item(i).key_val));                     
                        }
                        if(results.rows.item(i).key_constant == 'voteItemConfirmation')
                        {
                            $('.voting-confirm-wrapper h4').html(unescape(results.rows.item(i).key_val));                     
                        }
                        if(results.rows.item(i).key_constant == 'voteCancel')
                        {
                            $('.cancel').html(unescape(results.rows.item(i).key_val));                     
                        }
                        if(results.rows.item(i).key_constant == 'votes')
                        {
                            $('.forvotes').html(unescape(results.rows.item(i).key_val));                     
                        }

                        if(results.rows.item(i).key_constant == 'voteForwardingConfirmation') {
							var vfc = unescape(results.rows.item(i).key_val);                     
						}
						if(results.rows.item(i).key_constant == 'yes') {
							var yesbttn = unescape(results.rows.item(i).key_val);                     
						}
						if(results.rows.item(i).key_constant == 'no') {
							var nobttn = unescape(results.rows.item(i).key_val);                     
						}
						if(results.rows.item(i).key_constant == 'voteForwardingConfirmationDesc') {
							var vfcd = unescape(results.rows.item(i).key_val);                     
						}
						if(obj.userVote == "" || obj.userVote == undefined || obj.userVote == null) {
		          			if(results.rows.item(i).key_constant == 'IsAssignedToVoteOnYourBehalf')
	                        {
	                            $('.forwardVoteStaus').html(unescape(results.rows.item(i).key_val));                     
	                        }
	                        $('#forwardVoteReceiptantImage').attr('onClick','forwardedVoteUser()');
		          		}
		          		else {
		          			if(results.rows.item(i).key_constant == 'VotedForYou')
	                        {
	                            $('.forwardVoteStaus').html(unescape(results.rows.item(i).key_val));                     
	                        }
	                        $('#forwardVoteReceiptantImage').attr('onClick','');
		          		}

                        if(results.rows.item(i).key_constant == 'VoteForwardingBtn')
                        {
                        	$('#open-vote-forwarding-users-search-dialog').html(unescape(results.rows.item(i).key_val));
                        }
                         
                      }       
                      $('.vex-dialog-form').html('<div class="vex-dialog-message">' + vfc + '</div><div class="vex-dialog-input"><input type="hidden" value="_vex-empty-value" name="vex"></div><div class="vex-dialog-buttons"><button type="button" class="vex-dialog-button-primary vex-dialog-button vex-first" onclick="votingmodal(); return false;">' + yesbttn + '</button><button type="button" class="vex-dialog-button-secondary vex-dialog-button vex-last" onclick="cancelvotingmodal(); return false;">' + nobttn + '</button></div><div class="footer">' + vfcd + '</div>');            
                  });
              });
              }

              	// alert(JSON.stringify(obj.forwardedEventUsers));
              	if(checkdefined(obj.forwardedEventUsers) == "yes") {

              		$('.vote-forwarding-users').html('&nbsp;');

              		if (checkdefined(obj.eventUser.image) == 'yes') {
						var eventUserImage = localStorage.url + obj.eventUser.image;
					}
					// /Add-vote/-/OCintranet-100041/290/forwarded/101221

					if(localStorage.voteforwarderid == "") {
						if(obj.userVote == "") {
								var givento = "checked";
						}
						else{
							var givento = "dchecked";
						}
					}
					else {
						var givento = "";
					}
					
              		$('.vote-forwarding-users').append('<div class="vote-forwarding-user"><a class="image voteGivenTo ' + givento + '" href="#" onclick="changeUserForVote('+ obj.eventUser.event_user_id +')" style="background-image:url(' +eventUserImage + ')"></a><span class="name">You</span></div>');

              		$.each(obj.forwardedEventUsers, function(key, val) {
				        team = '';
						
						if (checkdefined(val.image) == 'yes') {
							str = localStorage.url + val.image;
						}

						if(val.first_name != "" || val.first_name != undefined || val.first_name != null){
							var firstName = val.first_name;
						}
						else {
							var firstName = "";
						}

						if(val.last_name != "" || val.last_name != undefined || val.last_name != null){
							var lastName = val.last_name;
						}
						else {
							var lastName = "";
						}

						var fullname = firstName + " " + lastName;

						if((localStorage.euid ==  val.event_user_id) && localStorage.voteforwarderid != "" ) {
							if(obj.userVote == "") {
								var givenby = "checked";
							}
							else{
								var givenby = "dchecked";
							}
							$('.vote-forwarding-users').append('<div class="vote-forwarding-user"><a  class="image voteGivenTo ' + givenby + '" href="#" onclick="changeUserForVote('+ val.event_user_id +')" style="background-image:url(' + str + ')"></a><span class="name">' + fullname + '</span></div>');
						}
						else {
							$('.vote-forwarding-users').append('<div class="vote-forwarding-user"><a  class="image voteGivenTo " href="#" onclick="changeUserForVote('+ val.event_user_id +')" style="background-image:url(' + str + ')"></a><span class="name">' + fullname + '</span></div>');
						}
							
				    });

				    $('.vote-forwarding-users').show();
				    $('#open-vote-forwarding-users-search-dialog').hide();

              	}
              	
              	if(checkdefined(obj.voteForwardingUser) == "yes") {
              		// alert(localStorage.user_id);
              		// alert(obj.voteForwardingUser.event_user_id);
              		if(localStorage.user_id != obj.voteForwardingUser.event_user_id){
              			localStorage.forwardedVoteUserId = obj.voteForwardingUser.event_user_id
		          		var forwardVoteReceiptantImage= localStorage.url + obj.voteForwardingUser.image;

		          		$('#voteForwardingControls').css("display", "block");
						$('.forwardVoteReceiptantName').html(obj.voteForwardingUser.first_name + " " + obj.voteForwardingUser.last_name);
						$('#forwardVoteReceiptantImage').html("<img src=" + forwardVoteReceiptantImage + " style='width:100%; height:100%;' >");
						$('#open-vote-forwarding-users-search-dialog').hide();
					}
              	}

              	$(".voting-page-container").show();
              	$(".voting-filter-items").show();
                $(".loading_agenda_items").hide();

                if(obj.enableVoteForwarding == true && checkdefined(obj.voteForwardingUser) !== "yes" && obj.forwardedEventUsers == ""/* && obj.isFinished == false */ && obj.enableOpenSearchDialog == true ) { 
	              	$('#voteForwardingControls').css("display", "none");
	              	$('#open-vote-forwarding-users-search-dialog').show();
	              	$('.vote-forwarding-users').hide();
				}
                
             }
          });
        }, 1000); 
	});     

                       
}



//function to give vote
function givevote(instance_id)
{
   
   if(localStorage.url == "https://beta.oceventmanager.com/"){
		 var main_url = localStorage.url + 'Add-vote/-/Beta-eventroute-' + localStorage.event_id + '/' + localStorage.agenda_id + localStorage.voteforwarderid + '/vote/'+instance_id+'/?gvm_json=1';
		 
	}
	else{
		var main_url = localStorage.url + 'Add-vote/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/vote/'+instance_id+'/?gvm_json=1';
	}

    // alert(main_url);

   $.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
          //window.location.href='voting.html';
          changetovoting();
        }
    });
}

//function to redirect to quiz
function add_quiz()
{
    // window.location.href="add_quiz.html"
    changetoaddquiz();
}
//function to show quiz
function showquiz()
{
     jQuery(document).ready(function($) {
        loadcommonthings(); 
        isLoggedIn();
        $(".quiz-container").hide();
        jQuery(".loading_agenda_items").show();
        $(".header").show();
	    $(".dropdown-menu").show();
	    $(".footertag").show();  
         
        //alert('hi')
        importfooter('Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';
		// alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
               // alert(obj.disableCountdown);
               // alert(JSON.stringify(disableCountdown));
               	if(obj.disableCountdown == "1") {
               		$("#quiz_timer_icon").hide();
               	}
                if(checkdefined(obj.results) == 'yes')
                {
                     db.transaction(function(tx) {
                      tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;  
                  var tryagain = ''; 
                  var resultss = '' ; 
                  var score_card = '';   

                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'quizMenuStartQuizTryAgain')
                    {
                        tryagain = unescape(results.rows.item(i).key_val);                     
                    }
                    if(results.rows.item(i).key_constant == 'quizResults')
                    {
                        resultss = unescape(results.rows.item(i).key_val);                     
                    }
                    if(results.rows.item(i).key_constant == 'seeScoreboard')
                    {
                        score_card = unescape(results.rows.item(i).key_val);                     
                    }
                    
                 }
                 $('.questionsdiv').hide();
                    $('.quiz-header-title').after('<div class="quiz-results-wrapper"><div class="quiz-results"><h3 class="green-text">'+resultss+'</h3><p>'+obj.results+'</p><span class="score green-text">'+obj.quizPoints+'</span></div><div class="quiz-btn-wrapper"><a class="btn btn-primary" href="javascript:resetquiz();">'+tryagain+'</a><a class="btn btn-primary scoreboard"  href="javascript:gotoscorecard();">'+score_card+'</a></div></div>');
              
           });
        });
                      }
                else
                { 
                $('.questionsdiv').show();
                $('.quiz-number').html(obj.questionNumber+' / '+obj.numQuestions);
                $('.quiz-question').html(obj.question.question);
                //alert(obj.question.answers);
                var arr = obj.question.answers.split('\r\n');
                
                $('.quiz-answer-container').html('');
                for(i=0; i < arr.length; i++)
                {
                	if(arr[i] != "") {
	                    var label_class='';
	                    var value = i + 1;
	                    var dis = '';
	                    
	                    if(checkdefined(obj.correctAnswerPositions) == 'yes')
	                    {
	                       label_class = 'disabled';
	                       dis = 'disabled';
	                       var sp = obj.correctAnswerPositions.length;
	                       //alert(sp)
	                       if(sp == 1)
	                       {                       
	                         if(obj.correctAnswerPositions == value)
	                         {
	                            label_class = 'correct-answer disabled';
	                         } 
	                       }
	                       if(sp > 1)
	                       {
	                          for(j = 0; j < sp; j++){
	                            if(value == obj.correctAnswerPositions[j])
	                            {
	                               label_class = 'correct-answer disabled';
	                               //alert(obj.correctAnswerPositions[j])
	                            }
	                            //document.write("<br /> Element " + i + " = " + obj.correctAnswerPositions[i]); 
	                          }
	                       }  
	                    }
	                   
	                    
	                    if(obj.questionMultipleAnswers == 'true' || obj.questionMultipleAnswers == true)
	                    {
	                        var radio_button = '<label class="'+label_class+'"><div class="poeng-options"><input type="checkbox" class="ipt_quiz_a"  name="answer_position" id="ipt_quiz_a_1" value="'+value+'"><span class="check"></span><div class="text">'+arr[i]+'</div></div></label>';
	                        $('.quiz-btn-wrapper').html('<button class="btn btn-primary nxt_q" type="button" onclick="submitmultipleanswers('+obj.question.instance_id+')" name="next_question" value="1"></button>');  
	                    }
	                    else
	                    {
	                        var radio_button = '<label class="'+label_class+'"><div class="poeng-options"><input '+dis+' type="radio" class="ipt_quiz_a" onclick="submitanswer('+obj.question.instance_id+','+value+')" name="answer_position" id="ipt_quiz_a_1" value="'+value+'"><span class="check"></span><div class="text">'+arr[i]+'</div></div></label>';
	                    }
	                    if(checkdefined(obj.correctAnswerPositions) == 'yes' && obj.questionNumber != obj.numQuestions)
		                {
		                   $('.quiz-btn-wrapper').html('<button class="btn btn-primary next_q" type="button" onclick="gotonextquestion('+obj.question.instance_id+')" name="next_question" value="1"></button>'); 
		                }
	                   if(checkdefined(obj.correctAnswerPositions) == 'yes' && obj.questionNumber == obj.numQuestions)
		                {
		                   $('.quiz-btn-wrapper').html('<button class="btn btn-primary res_p" type="button" onclick="gotonextquestion('+obj.question.instance_id+')" name="next_question" value="1"></button>'); 
		                }  
	                    
	                     //alert(radio_button)
	                    $('.quiz-answer-container').append(radio_button);
	                    //alert(arr[i]);
                	}
                }
                var timer = Number(obj.question.question_time+'000');
                quizInit(timer);
                
                $.each( obj.questionData, function( key, val ) {
                  if(checkdefined(val.__extra) == 'yes')
                  {
                    if(checkdefined(val.__extra.large_file_name) == 'yes')
                    {
                      $('.quiz-question-container').prepend('<img src="'+localStorage.url+'resources/files/images/'+val.__extra.large_file_name+'" class="img-responsive" />')
                    }
                  }
                
                });
                }
                db.transaction(function(tx) {
                      tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                             
                      for (i = 0; i < len; i++) {  
                        if(results.rows.item(i).key_constant == 'QuizSubmitAnswer')
                        {
                            $('.nxt_q').html(unescape(results.rows.item(i).key_val));                     
                        }
                        if(results.rows.item(i).key_constant == 'quizNextQuestionquizNextQuestion')
                        {
                            $('.next_q').html(unescape(results.rows.item(i).key_val));                     
                        }
                        if(results.rows.item(i).key_constant == 'quizGoToResultsPage')
                        {
                            $('.res_p').html(unescape(results.rows.item(i).key_val));                     
                        }
                         
                      }                 
                  });
              });
               $(".quiz-container").show(); 
               $(".loading_agenda_items").hide();  
            }
           });
      });      
}

//function to go to score card
function gotoscorecard()
{
  //window.location.href = 'scorecard.html'
  changetoscorecard();
}

//function to load score card
function loadscorecard()
{
    jQuery(document).ready(function($) {
        //loadcommonthings(); 
        isLoggedIn();
        $(".leaderboards-container").hide();
        jQuery(".loading_agenda_items").show();
        
        //alert('hi')
        importfooter('Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id+'/scorecard', 'agenda');
                                    
        var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/scoreboard/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
               $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs #b1").html(val.text);
                    }
                    if (key == 1) {
                        $(".breadcrumbs #b2").html(val.text);
                    }
                    if (key == 2) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
                $(".team-points-table table tbody").html('');
                
                $.each(obj.items, function(key, val) {
                
                      var cur_userclass = '';
                     if(val.is_current_user == 'true' || val.is_current_user == true)
                     {
                        cur_userclass = 'current-user';
                     }
                     var avatar = '';
                     if(val.image != 'false' && val.image != false)
                     {
                        avatar = '<div class="img img-circle" style="background-image:url('+val.image+');"></div>';
                     }
                   $(".team-points-table table tbody").append('<tr class='+cur_userclass+'><td class="num-col"><span class="num">'+val.position+'</span></td><td class="avatar-col"><span class="avatar">'+avatar+'</span></td><td><span class="name">'+val.name+'</span></td><td class="point">'+val.points+'</td></tr>');
                   
                });
               
                
                     
               /* var difference = Number(10) - Number(k);
                for (v = 0; v < difference; v++) {
                    k++;
                    $(".team-points-table table tbody").append('<tr><td class="num-col"><span class="num">' + k + '</span></td><td class="avatar-col"></td><td><span class="name">-</span></td><td class="point">0</td></tr>');
                } */
                //$(".leaderboards-container").show(); 
                $(".score-card-container").show(); 
                $(".loading_agenda_items").hide();
            }
            });
            });
}



//function to reset the quiz
function resetquiz()
{
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/reset_quiz/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
              // window.location.href='add_quiz.html';
              changetoaddquiz();
            }
            });
}

//function to submit multiple answers
function submitmultipleanswers(question_id)
{
    //alert(question_id)
    var arr = [];
    jQuery('input:checkbox:checked').each(function() {        
         //checkboxes += 'answer_position[]:'+jQuery(this).val();
          arr.push(jQuery(this).val());
          
    });
   // alert(checkboxes);
    
    var countdown_box = Number(jQuery('#countdown_box').html()+'000');
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        jQuery.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              submit_answer: 1,
              question_id:question_id, 
              answer_position: arr,            
              countdown:countdown_box,
              //checkboxes
          },
            success: function(obj) {
              // window.location.href='add_quiz.html';
              changetoaddquiz();
            }
            });
}

//function to submit answer
function submitanswer(question_id,answer)
{
  var countdown_box = Number($('#countdown_box').html()+'000');
  var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              submit_answer: 1,
              question_id:question_id,
              answer_position:answer,
              countdown:countdown_box
          },
            success: function(obj) {
              // window.location.href='add_quiz.html';
              changetoaddquiz();
            }
            });
}

//function to go to next question
function gotonextquestion(question_id)
{
    var main_url = localStorage.url + 'Quiz/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/?gvm_json=1';

        $.ajax({
            url: main_url,
            dataType: "json",
            method: "POST",
            data: {
              question_id:question_id,
              next_question:'1'
              
          },
            success: function(obj) {
              // window.location.href='add_quiz.html';
              changetoaddquiz();
            }
            });
}

//function to redirect to questions
function add_questions()
{
    //window.location.href="add_questions.html"
    changetoaddquestions();
}

function sortquestions(s,r)
{
	$('.loading_agenda_items').show();

	var l = 1;  

	showquestions(s,r,l)
}

function showquestions(sortby,sortdr,l)
{
   jQuery(document).ready(function($) {
        if(l != 1)
        {
          loadcommonthings(); 
          isLoggedIn();
        }
        $(".questions-container").hide();
        $(".header").show();
	    $(".dropdown-menu").show();
	    $(".footertag").show();  
        if(checkdefined(sortby) != 'yes')
        {
          sortby = 'timestamp';
        }
        if(checkdefined(sortdr) != 'yes')
        {
          sortdr = 'desc';
        }
        
        $('.inner_comment_loop').html("");

        var taonclk = "sortquestions('timestamp','asc')";
		var tdonclk = "sortquestions('timestamp','desc')";
		var laonclk = "sortquestions('likes','asc')";
		var ldonclk = "sortquestions('likes','desc')";

		if(sortdr == 'desc' && sortby == 'timestamp') {
			
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-down time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'asc' && sortby == 'timestamp') {
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + tdonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'asc' && sortby == 'likes') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'desc' && sortby == 'likes') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + ldonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-down like_s"></i> Likes</a>');
		}


        jQuery(".loading_agenda_items").show();
        importfooter('Add-question/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'agenda');
        var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/sort/'+sortby+'/'+sortdr+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
        // alert(main_url)
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            
            	if(checkdefined(obj.questionInstances) == "yes") {
					$(".questions-heading-title").show();
				}
				else {
					$(".questions-heading-title").hide();
				}
               $(".close-btn-wrapper").click(function()
               {
                  $("#show-form-container").show();
                  $(".questions-filter-items").fadeOut();
               });
                var label = '';
                $.each(obj.breadcrumbs, function(key, val) {

                    if (key == 0) {
                        $(".breadcrumbs a").html(val.text)
                    }
                    if (key == 1) {
                        $(".breadcrumbs .green-text").html(val.text);
                    }
                });
              $('.votes-count .green-text').html(obj.countQuestionInstances);
              $('.votes-count .small-text').html(obj.countAnswerInstances.answers);
              
              
                 localStorage.resubmit_code = obj.qForm.noResubmitCode;
              
             
              $.each(obj.questionInstances, function(key, val) {
              
              var image_url = localStorage.url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = localStorage.url+'resources/files/event/images/thumb_'+val.image+'.jpg';
              }
              var name = 'anonymous';
              if(checkdefined(val.first_name) == "yes")
              {
                  name = val.first_name;
              }
              if(checkdefined(val.last_name) == "yes")
              {
                  name += ' '+val.last_name;
              }
              var like_string = '';
              var dislike_link = '<a href="#" onclick="likedislikequestion('+val.instance_id+',0);"></a><span class="chkdislikes">Dislike</span>';
              if(val.like == 1)
              {
                like_string = '<a class="like-btn" href="#" onclick="likedislikequestion('+val.instance_id+',1);"><i class="fa fa-thumbs-up"></i></a>';
                dislike_link = '<span class="chkdislikes">Dislike</span>';  
              }
              else if(val.like == 0)
              {
                like_string = '<a class="liked-btn show ">Disliked</a>';
                dislike_link = '<span class="chkdislikes">Dislike</span>';
              }
              else
              {
                like_string = '<a class="like-btn" href="#" onclick="likedislikequestion('+val.instance_id+',1);"><i class="fa fa-thumbs-up"></i></a>';
                dislike_link = '<span class="chkdislikes">Dislike</span>';
              } 
              
              if(val.event_user_id == localStorage.user_id)
              {
                 like_string = '<i class="fa fa-thumbs-up"></i>'; 
                 dislike_link = '<span class="chkdislikes">Dislike</span>';
               
              }
              var answer = '';
              if(checkdefined(val.answer) == 'yes')
              {
                  answer = '<div class="answer-inner"><div>A:</div><p>'+val.answer+'</p></div>';
              }
                // alert(dislike_link);
              $('.inner_comment_loop').append('<div id="question_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"></i>'+val.time_since+'</span></h3><div class="question-inner"><div>Q:</div><p>'+val.question+' </p></div></div></div>'+answer+'<div class="clearfix"><div class="likes-container"><div class="likes-count"> '+like_string+'<span class="chklikes">'+val.likes+'</span></div><div class="dislikes-count like-btn"><i class="fa fa-thumbs-down"></i> '+val.dislikes+' '+dislike_link+'</div></div></div></div>');
             
              
             
        });
              $(".loading_agenda_items").hide();  
              //$(".questions-container").show();
              $(".add-questions-container").show();
        if(checkdefined(localStorage.message) == 'yes')
        {
            $('.comment_loop').before('<div class="alert alert-success">Deleted</div>');
            $('.alert-success').fadeOut(3000);
            localStorage.message = '';
        }
        $('.questionspostplaceholder').on('click', function ()
		{
			// alert('hi')
			var container = $('.main-questions-form-container');
			// Hide all other forms besides this one.
			$('.questions-filter-items').not(container).slideUp();
			// Hide main form container.
			container.slideToggle();  
		});
          if(l != 1)
          { 
           db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;                  
                  for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'presentationQuestionsTitle')
                    {
                        $('.question_counter').html(' '+unescape(results.rows.item(i).key_val)+' /');                     
                    }
                    if(results.rows.item(i).key_constant == 'orderByTime')
                    {
                        // $('.time_s').after(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'orderByLikes')
                    {
                        // $('.like_s').after(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addQuestionSubmit')
                    {
                        $('.submit_com').html(unescape(results.rows.item(i).key_val));                    
                    }
                     if(results.rows.item(i).key_constant == 'addQuestionAnswers')
                    {
                        $('.small-text').append(' '+unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'writeQuestion')
                    {
                       $('#frmfld_question').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'ToggleForm')
                    {
                        $('.questionspostplaceholder').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addQuestionLikes')
                    {
                        $('.chklikes').append(' '+unescape(results.rows.item(i).key_val));                     
                    }
                    /*
                    if(results.rows.item(i).key_constant == 'removeComment')
                    {
                        $('.delete-comment .fa-times').after(unescape(results.rows.item(i).key_val));                     
                    }
                    
                    if(results.rows.item(i).key_constant == 'addCommentDislikes')
                    {
                        $('.chkdislikes').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'replyCancelButton')
                    {
                        $('.reply-cancel').html(unescape(results.rows.item(i).key_val));                     
                    } */
                    
                    
                 }
           });
        });
        }   

            }
       }); 
   });             
}


//function to submit a question
function submitquestion(instance_id)
{
    var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
    var question = jQuery('#frmfld_question').val();
    jQuery(".submit_com").hide();
    jQuery(".loading_send").show(); 
    var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
      jQuery.ajax({
          url: main_url,
          dataType: "json",
          method: "POST",
          data: {
              submit_form: submit_form,
              form_noresubmit_code:form_noresubmit_code,
              question:question
          },
          success: function(resp) {
              localStorage.resubmit_code = '';
              //window.location.href="add_questions.html"
              changetoaddquestions();
          }
      });
}

//function to like and dislike question
function likedislikequestion(id,like)
{
  jQuery(document).ready(function($)
  {
    $(".loading_cancel").show();  
    $(".questions-container").hide();
  var main_url = localStorage.url + 'Add-question/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
       //  alert(main_url);
        $.ajax({
            url: main_url,
            dataType: "json",
            method: "GET",
            success: function(obj) {
            //window.location.href = 'add_questions.html';
            changetoaddquestions();
            }
            });
   });
}

//function to redirect to comments
function add_comments()
{
    // window.location.href="add_comments.html"
    changetoaddcomments();
}

function sortcomments(s,r)
{
	$('.loading_agenda_items').show();

	var l = 1;

	showcomments(s,r,l)
}

function closecommentbox() {
	$("#show-form-container").show();
	$(".questions-filter-items").fadeOut();
	$("#cpmaincomment").html('<div class="has-file-upload" id="createdform"><div class="close-btn-wrapper"><i class="fa fa-times close-btn"></i></div><div class="form-group fileupload frmfld_files" data-role="fieldcontain"><i class="gicon-camera file-upload" onclick="showimagebuttons();"></i></div><div class="form-group textarea frmfld_comment" data-role="fieldcontain"><textarea placeholder="" maxlength="4096" name="comment" id="frmfld_comment" class="form-control"></textarea><span><i class="fa fa-comment"></i></span></div><div class="form-group hidden frmfld_presentation_id" data-role="fieldcontain"><input type="hidden" value="142" name="presentation_id" id="frmfld_presentation_id"></div><div class="success-status hide"><div class="success-icon-wrapper"><i class="icon-check"></i></div><p></p><p><strong>Your <em>comment</em> <span style="">has</span> been sent to the moderator for approval.&nbsp;</strong><br><strong>Thank you for your participation.</strong></p></div><div class="error-status hide"><div class="error-icon-wrapper"><i class="fa fa-ban"></i></div><p></p><p>Something went wrong...<br>Your comments are limited to one per every 4 seconds.</p><p></p></div><div class="clearfix"><div class="frm_field submit" data-role="fieldcontain"><button name="capture_image" style="display:none;" class="captureimage" onclick="captureImage();" type="button">Take a photo</button><button name="upload_image" style="display:none;" class="uploadimage" onclick="uploadImage(pictureSource.PHOTOLIBRARY);" type="button">Choose a Photo</button><button name="submit" onclick="submitcomment();" class="submit_com" type="submit">Send</button><img src="img/loading.gif" class="loading_send" style="display:none" /></div></div><div class="swiper-container swiper-container-horizontal"><div class="files swiper-wrapper"><div class="template-upload swiper-slide fade in swiper-slide-active" style="width: 98.3333px; margin-right: 5px;"><div class="name"></div><div class="preview"><canvas width="80" height="80"></canvas></div><i class="fa fa-times cancel" onclick="hidethumb();"></i></div></div></div><div class="swiper-container swiper-container-horizontal"><div class="files swiper-wrapper"></div></div></div>');
}
//function to show comments
function showcomments(sortby,sortdr,l)
{
	localStorage.imageURI = "";
	localStorage.popUpObjectData = "";
	jQuery(".submit_com").show();
	jQuery(".loading_send").hide();
	if(localStorage.submitcommentstatus) {
		if(localStorage.submitcommentstatus == "1") {
			$(".success-status").removeClass("hide");
			$(".error-status").removeClass("hide");
			$(".error-status").addClass("hide");
			localStorage.submitcommentstatus = "";
			window.setInterval(function () {
			    closecommentbox();
			}, 10 * 1000);
		}
		else {
			$(".error-status").removeClass("hide");
			$(".success-status").removeClass("hide");
			$(".success-status").addClass("hide");
			localStorage.submitcommentstatus = "";
		}
	}
	else{
		localStorage.submitcommentstatus = "";
	}
   jQuery(document).ready(function($) {
        if(l != 1)
        {
          loadcommonthings(); 
          isLoggedIn();      
        }

        $(".notes-agenda-container").hide();
        $(".add-questions-container").hide();
        $(".add-comments-container").hide();
        $(".header").show();
	    $(".dropdown-menu").show();
	    $(".footertag").show();  

	    if(checkdefined(sortby) != 'yes') {
			sortby = 'timestamp';
		}

		if(checkdefined(sortdr) != 'yes') {
			sortdr = 'desc';
	    } 

	    $(".inner_comment_loop").html("");

		var taonclk = "sortcomments('timestamp','asc')";
		var tdonclk = "sortcomments('timestamp','desc')";
		var laonclk = "sortcomments('likes','asc')";
		var ldonclk = "sortcomments('likes','desc')";

		if(sortdr == 'desc' && sortby == 'timestamp') {
			
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-down time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'asc' && sortby == 'timestamp') {
			$('.votes-sort').html('<span>Sort by:</span><a class="active sortbytime" id="accsortbytime" onclick="' + tdonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'asc' && sortby == 'likes') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + laonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-up like_s"></i> Likes</a>');
		}

		if(sortdr == 'desc' && sortby == 'likes') {
			$('.votes-sort').html('<span>Sort by:</span><a class="sortbytime" id="accsortbytime" onclick="' + taonclk + '"><i class="fa fa-caret-up time_s"></i> Time</a><a onclick="' + ldonclk + '" id="accsortbylikes"class="active sortbylikes"><i class="fa fa-caret-down like_s"></i> Likes</a>');
		}

                   
        jQuery(".loading_agenda_items").show();
        importfooter('Add-comment/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id, 'comments');
        var main_urld = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-' + localStorage.event_id + '/' + localStorage.agenda_id + '/sort/'+sortby+'/'+sortdr+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';

        //alert(main_urld);
        localStorage.loadallcomments_url = main_urld;
        $.ajax({
            url: main_urld,
            dataType: "json",
            method: "GET",
            success: function(obj) {

            	if(checkdefined(obj.commentInstances) == "yes") {
					$(".questions-heading-title").show();
				}
				else {
					$(".questions-heading-title").hide();
				}
	            $('.questions-item-container').remove();
	            $(".close-btn-wrapper").click(function()
	            {
	                $("#show-form-container").show();
	                $(".questions-filter-items").fadeOut();
	            });
                var label = '';
				$.each(obj.breadcrumbs, function(key, val) {
				    if (key == 0) {
				        $(".breadcrumbs a").html(val.text)
				    }
				    if (key == 1) {
				        $(".breadcrumbs .green-text").html(val.text);
				    }
				});
				$('.votes-count .green-text').html(obj.countCommentInstances);

				
				$.each( obj.replyForms, function( key, val ) {
				 localStorage.resubmit_code = val.noResubmitCode;
				});

				$.each(obj.commentInstances, function(key, val) {

					//alert(json.STRINGIFY(VAL));
					var image_url = localStorage.url+'resources/gamification/img/avatar-placeholder.png';
					if(checkdefined(val.image) == "yes")
					{
					  image_url = localStorage.url+'resources/files/event/images/thumb_'+val.image+'.jpg';
					}

					var name = 'anonymous';
					if(checkdefined(val.first_name) == "yes")
					{
						name = val.first_name;
					}
					if(checkdefined(val.last_name) == "yes")
					{
						name += ' '+val.last_name;
					}
					var like_string = '';
					var dislike_link = '<a href="#" onclick=likedislikecomment('+val.instance_id+',0)></a><span class="chkdislikes"></span>';
					if(val.like == 1)
					{
						like_string = '<a class="liked-btn"><i class="fa fa-thumbs-up"></i></a>';
						dislike_link = '<span class="chkdislikes"></span>';  
					}
					else if(val.like == 0)
					{
						like_string = '<a class="liked-btn show">Disliked</a>';
						dislike_link = '<span class="chkdislikes"></span>';
					}
					else
					{
						like_string = '<a class="like-btn" href="#" onclick=likedislikecomment('+val.instance_id+',1)><i class="fa fa-thumbs-up"></i></a>';
					} 
					var delete_button = '';
					if(val.event_user_id == localStorage.user_id)
					{
						like_string = '<i class="fa fa-thumbs-up"></i>'; 
						dislike_link = '<span class="chkdislikes"></span>';
						delete_button = '<div onclick="deletecomment('+val.instance_id+')" class="pull-right delete-comment"><i class="fa fa-times"></i><span class="delcommentpostplaceholder"></span></div>';
					}
					var comment_image = '';
					//alert(val.images.length);
					if(checkdefined(val.images) == 'yes')
					{
						var i = "";

						if(val.images.length > 1){
							comment_image += '<div class="images-container clearfix">';
							for(i=0; i<val.images.length; i++){
								comment_image += '<div class="image-container"><span data-mfp-src="'+localStorage.url+'resources/files/images/'+val.images[i].large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+val.images[i].small+'" class="resize-img" style="width:100%;height:100%;" onclick="commentimagespopupslider('+val.instance_id+','+i+');"></span></div>';
							}
							comment_image += '</div>';
						}
						else{
					   		comment_image = '<div class="images-container clearfix"><div class="image-container"><span data-mfp-src="'+localStorage.url+'resources/files/images/'+val.images[0].large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+val.images[0].small+'" class="resize-img" style="width:100%;height:100%;"></span></div></div>';
					   	}
					}
					var comment_video = '';
					var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;

					if(checkdefined(val.__videoItem) == 'yes') {
						$.each(val.__videoItem, function(key, res) {
							if(checkdefined(res.hosted_vimeo_id) == 'yes') {
								if(isIphone) {
									if(checkdefined(res.hosted_vimeo_link_hd) == 'yes') {
										// alert("hd");
										var videoUrl = "http:" + res.hosted_vimeo_link_hd;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd960) == 'yes') {
										// alert("sd960");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd960;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd640) == 'yes') {
										// alert("sd640");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd640;
									}
									else if(checkdefined(res.hosted_vimeo_link_hls) == 'yes') {
										// alert("hls");
										var videoUrl = "http:" + res.hosted_vimeo_link_hls;
									}
									else if(checkdefined(res.hosted_vimeo_link_mobile) == 'yes') {
										// alert("mobile");
										var videoUrl = "http:" + res.hosted_vimeo_link_mobile;
									}
									
									comment_video = '<div style="width:100%;padding:20px 0;margin:0 auto;" align="center"><div class="video-player-wrapper" style="display: inline-flex; height: 100%; padding: 0px;"><video src="http:' + res.hosted_vimeo_link_sd640 + '" webkit-playsinline style="width: 100%; background-color: #000;" controls></video></div></div>';
								}
								else {
									comment_video = '<div style="width:100%;padding:20px 0;margin:0 auto;" align="center"><div class="video-player-wrapper"><iframe id="videoPlayer-' + res.hosted_vimeo_id + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + res.hosted_vimeo_id + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div></div>';
								}

							}
						});
					}
	                             
	              
					if(val.reply_to_comment_id == 0 || val.reply_to_comment_id == 'null' || val.reply_to_comment_id == null) {
						$('.inner_comment_loop').append('<div id="comment_'+val.instance_id+'" class="questions-item-container row"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"> </i> '+val.time_since+'</span></h3><div class="question-inner"><div><i class="fa fa-comment"></i></div><p>'+val.comments+' </p></div></div></div>'+comment_image+comment_video+'<div class="clearfix">'+delete_button+'<div class="likes-container"><div class="likes-count"> '+like_string+'<span class="chklikes"> '+val.likes+'</span> </div><div class="dislikes-count like-btn"><i class="fa fa-thumbs-down"></i> '+val.dislikes+'  '+dislike_link+'</div><div class="reply-to-comment"><i class="fa fa-reply"></i><span class="replypostplaceholder"></span></div></div></div><div class="questions-filter-items reply-form clearfix hide"><div id="replyform-'+val.instance_id+'" class="has-file-upload"><div class="form-group fileupload c'+val.instance_id+'_files" data-role="fieldcontain"><i class="oc-icon-camera file-upload dz-clickable greencamera" onclick="showimagebuttons();"></i></div><div data-role="fieldcontain" class="form-group textarea c'+val.instance_id+'_comment"><textarea class="form-control textcomment" id="c'+val.instance_id+'_comment" name="comment" maxlength="4096" placeholder=""></textarea><span><i class="fa fa-comment"></i></span></div><div class="success-status hide"><div class="success-icon-wrapper"><i class="icon-check"></i></div><p></p></div><div class="error-status hide"><div class="error-icon-wrapper"><i class="fa fa-ban"></i></div><p></p></div><div class="clearfix"><div data-role="fieldcontain" class="frm_field submit"><button type="submit" class="reply-sub" onclick="submitcomment('+val.instance_id+')" name="submit"></button><button type="submit" class="btn-danger reply-cancel" name="cancel"></button></div></div></div></div></div>');
					}
				});
        $.each(obj.commentInstances, function(key, val) {
             // alert(val.instance_id)
              var image_url = localStorage.url+'resources/gamification/img/avatar-placeholder.png';
              if(checkdefined(val.image) == "yes")
              {
                  image_url = localStorage.url+'resources/files/event/images/thumb_'+val.image+'.jpg';
              }
              var name = 'anonymous';
              if(checkdefined(val.first_name) == "yes")
              {
                  name = val.first_name;
              }
              if(checkdefined(val.last_name) == "yes")
              {
                  name += ' '+val.last_name;
              }
              var like_string = '';
              var dislike_link = '<a class="like-btn" href="#" onclick=likedislikecomment('+val.instance_id+',0)></a><span class="chkdislikes"></span>';
              if(val.like == 1)
              {
                like_string = '<a class="liked-btn"><i class="fa fa-thumbs-up"></i></a>';
                dislike_link = '<span class="chkdislikes"></span>';  
              }
              else if(val.like == 0)
              {
                like_string = '<a class="liked-btn show">Disliked</a>';
                dislike_link = '<span class="chkdislikes"></span>';
              }
              else
              {
                like_string = '<a class="like-btn" href="#" onclick=likedislikecomment('+val.instance_id+',1)><i class="fa fa-thumbs-up"></i></a>';
              } 
              var delete_button = '';
              if(val.event_user_id == localStorage.user_id)
              {
                 like_string = '<i class="fa fa-thumbs-up"></i>'; 
                 dislike_link = '<span class="chkdislikes"></span>';
                 delete_button = '<div onclick="deletecomment('+val.instance_id+')" class="pull-right delete-comment"><i class="fa fa-times"></i><span class="delcommentpostplaceholder"></span></div>';
              }
              var comment_image = '';
              if(checkdefined(val.images) == 'yes')
				{
					var i = "";

					if(val.images.length > 1){
						comment_image += '<div class="images-container clearfix">';
						for(i=0; i<val.images.length; i++) {
							comment_image += '<div class="image-container"><span data-mfp-src="'+localStorage.url+'resources/files/images/'+val.images[i].large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+val.images[i].small+'" class="resize-img" style="width:100%;height:100%;" onclick="commentimagespopupslider('+val.instance_id+','+i+');"></span></div>';
						}
						comment_image += '</div>';
					}
					else{
				   		comment_image = '<div class="images-container clearfix"><div class="image-container"><span data-mfp-src="'+localStorage.url+'resources/files/images/'+val.images[0].large+'" class="mfp-image"><img alt="" src="'+localStorage.url+'resources/files/images/'+val.images[0].small+'" class="resize-img" style="width:100%;height:100%;"></span></div></div>';
				   	}
				}
              var comment_video = '';
              var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;


              		if(checkdefined(val.__videoItem) == 'yes') {
						$.each(val.__videoItem, function(key, res) {

							if(checkdefined(res.hosted_vimeo_id) == 'yes') {
								if(isIphone) {
									if(checkdefined(res.hosted_vimeo_link_hd) == 'yes') {
										// alert("hd");
										var videoUrl = "http:" + res.hosted_vimeo_link_hd;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd960) == 'yes') {
										// alert("sd960");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd960;
									}
									else if(checkdefined(res.hosted_vimeo_link_sd640) == 'yes') {
										// alert("sd640");
										var videoUrl = "http:" + res.hosted_vimeo_link_sd640;
									}
									else if(checkdefined(res.hosted_vimeo_link_hls) == 'yes') {
										// alert("hls");
										var videoUrl = "http:" + res.hosted_vimeo_link_hls;
									}
									else if(checkdefined(res.hosted_vimeo_link_mobile) == 'yes') {
										// alert("mobile");
										var videoUrl = "http:" + res.hosted_vimeo_link_mobile;
									}
									
									comment_video = '<div style="width:100%;padding:20px 0;margin:0 auto;" align="center"><div class="video-player-wrapper" style="display: inline-flex; height: 100%; padding: 0px;"><video src="http:' + res.hosted_vimeo_link_sd640 + '" webkit-playsinline style="width: 100%; background-color: #000;" controls></video></div></div>';
								}
								else {
									comment_video = '<div style="width:100%;padding:20px 0;margin:0 auto;" align="center"><div class="video-player-wrapper"><iframe id="videoPlayer-' + res.hosted_vimeo_id + '" class="videoVimeoPlayer" src="https://player.vimeo.com/video/' + res.hosted_vimeo_id + '?api=1" frameborder="0" title="" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen=""></iframe></div></div>';
								}
							}
						});
					}     

              
              if(val.reply_to_comment_id != 0 && val.reply_to_comment_id != 'null' && val.reply_to_comment_id != null) {
					$('#comment_'+val.reply_to_comment_id).after('<div id="comment_'+val.instance_id+'" class="questions-item-container row comment-reply"><div class="clearfix"><div class="col-xs-2 questions-item-img"><div class="img-wrapper" style="background-image:url('+image_url+')"></div></div><div class="col-xs-10 question-item-info"><h3 class="clearfix">'+name+'<span><i class="fa fa-clock-o"> </i> '+val.time_since+'</span></h3><div class="question-inner"><div><i class="fa fa-comment"></i></div><p>'+val.comments+' </p></div></div></div>'+comment_image+'<div class="clearfix">'+delete_button+'<div class="likes-container"><div class="likes-count">'+like_string+' <span class="chklikes">'+val.likes+'</span></div><div class="dislikes-count like-btn"><i class="fa fa-thumbs-down"></i>'+val.dislikes+' '+dislike_link+'</div><div class="reply-to-comment"><i class="fa fa-reply"></i><span class="replypostplaceholder"></span></div></div></div><div class="questions-filter-items reply-form clearfix hide"><div id="replyform-'+val.instance_id+'" class="has-file-upload"><div class="form-group fileupload c'+val.instance_id+'_files" data-role="fieldcontain"><i class="gicon-camera file-upload dz-clickable greencamera" onclick="showimagebuttons();"></i></div><div data-role="fieldcontain" class="form-group textarea c'+val.instance_id+'_comment"><textarea class="form-control textcomment" id="c'+val.instance_id+'_comment" name="comment" maxlength="4096" placeholder=""></textarea><span><i class="fa fa-comment"></i></span></div><div class="success-status hide"><div class="success-icon-wrapper"><i class="icon-check"></i></div><p></p></div><div class="error-status hide"><div class="error-icon-wrapper"><i class="fa fa-ban"></i></div><p></p></div><div class="clearfix"><div data-role="fieldcontain" class="frm_field submit"><button type="submit" class="reply-sub" onclick="submitcomment('+val.instance_id+')" name="submit"></button><button type="submit" class="btn-danger reply-cancel" name="cancel"></button></div></div></div></div></div>');
				}

        });    

        if(checkdefined(localStorage.message) == 'yes')
        {
            $('.comment_loop').before('<div class="alert alert-success">Deleted</div>');
            $('.alert-success').fadeOut(3000);
            localStorage.message = '';
        }
              $('.reply-to-comment,.reply-cancel').on('click', function (e) 
              {
                  e.preventDefault();
                  // alert('hi')
                  var container = $(this).parents('.questions-item-container');
                  container.find('.reply-form').toggleClass('hide');
                  $('#createdform').toggle();
                 
              });
              // $('.commentpostplaceholder').on('click', function ()
              // {
              //    // alert('hi')
              //     var container = $('.main-questions-form-container');
              //     // Hide all other forms besides this one.
              //     $('.questions-filter-items').not(container).slideUp();
              //     // Hide main form container.
              //     container.slideToggle();  
              // });
              if(l != 1)
              {
              db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length;  
                 for (i = 0; i < len; i++) {                    
                    if(results.rows.item(i).key_constant == 'addCommentComments')
                    {
                        $('.comment_counter_text').html(' '+unescape(results.rows.item(i).key_val));                     
                    }
                   if(results.rows.item(i).key_constant == 'orderByTime')
                    {
                      //  $('.time_s').after(" " + unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'orderByLikes')
                    {
                       // $('.like_s').after(" " + unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'ToggleForm')
                    {
                        $('.commentpostplaceholder').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'replyToComment')
                    {
                        $('.replypostplaceholder').html(" " + unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'writeACommentPlaceholder')
                    {
                        $('.textcomment').attr('placeholder',unescape(results.rows.item(i).key_val));
                       // $('#frmfld_comment').attr('placeholder',unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'removeComment')
                    {
                        $('.delete-comment .fa-times').after(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addCommentLikes')
                    {
                        $('.chklikes').append(' '+unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addCommentDislike')
                    {
                        $('.chkdislikes').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'replyCancelButton')
                    {
                        $('.reply-cancel').html(unescape(results.rows.item(i).key_val));                     
                    }
                    if(results.rows.item(i).key_constant == 'addCommentSubmit')
                    {
                        $('.reply-sub').html(unescape(results.rows.item(i).key_val)); 
                        $('.submit_com').html(unescape(results.rows.item(i).key_val));                    
                    }
                 }
           });
        });
        }
        
          $(".loading_agenda_items").hide();  
              $(".add-comments-container").show(); 
              
            }
       }); 
   });            
}

function commentpostbtn() {
	$(".success-status").removeClass("hide");
	$(".error-status").removeClass("hide");
	$(".success-status").addClass("hide");
	$(".error-status").addClass("hide");

	var container = $('.main-questions-form-container');
	// Hide all other forms besides this one.
	$('.questions-filter-items').not(container).slideUp();
	// Hide main form container.
	container.slideToggle();  
}

function onConfirmComment(buttonIndex) {
// alert('You selected button ' + buttonIndex);
if(buttonIndex == '1')
{
      var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/delete/'+localStorage.instance+'/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
      jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(resp) {
            // window.location.href="add_comments.html";
            changetoaddcomments();
            localStorage.message = 'Deleted';
        }
      });
  }
}


//function to delete a comment
function deletecomment(instance_id)
{
   localStorage.instance = instance_id;
   db.transaction(function(tx) {
                  tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
                  var len = results.rows.length; 
                  var con = ''; 
                  var pr = '';  
                  var ys = '';  
                  var noo = '';              
                  for (i = 0; i < len; i++) {
                      if(results.rows.item(i).key_constant == 'commentDeleteConfirmation')
                      {
                        con = unescape(results.rows.item(i).key_val);                        
                      }
                      if(results.rows.item(i).key_constant == 'Comments')
                      {
                         pr = unescape(results.rows.item(i).key_val); 
                      } 
                      if(results.rows.item(i).key_constant == 'yes')
                      {
                         ys = unescape(results.rows.item(i).key_val); 
                      }
                      if(results.rows.item(i).key_constant == 'no')
                      {
                         noo = unescape(results.rows.item(i).key_val); 
                      }  
                      
                   }
    

    // Show a custom confirmation dialog
    //
    
        navigator.notification.confirm(
            con,  // message
            onConfirmComment,              // callback to invoke with index of button pressed
            pr,            // title
            ys+","+noo         // buttonLabels
        );
   

      });
    });
}

//function to submit a comment
function submitcomment(instance_id)
{
	var submit_form = 1;
    var form_noresubmit_code = localStorage.resubmit_code;
	//alert(form_noresubmit_code)
	var comment_id = 0;
	var comment = jQuery('#frmfld_comment').val();
	if(checkdefined(instance_id) == 'yes')
	{
	var comment_id = instance_id;  
	var comment = jQuery('#c'+instance_id+'_comment').val();
	} 
	//alert(comment); 
	var action = 'post_comment';

	jQuery(".submit_com").hide();
	jQuery(".loading_send").show(); 
	if(checkdefined(localStorage.imageURI) == 'yes')
	{
    
	    var allImageURI = localStorage.imageURI.split(",,,");
	    localStorage.allImageURILength = allImageURI.length;
	    localStorage.allImageURILengthStart = 1;
	    $.each(allImageURI, function(key, val) {
	    	if(val == "noImage") {
	    	}
	    	else {
			    var imageData = allImageURI;
			   
			    //alert(imageData);          
			    var photo_ur = imageData;
			    var options = new FileUploadOptions();
			    var imageURI = photo_ur;
			    options.fileKey = "files[]";
			    
			    if(localStorage.mime == 'video/mp4')
			    {
					if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
						var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
					} else {
						var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.mp4';
					}
			    }
			    else {		    
					if (imageURI.substr(imageURI.lastIndexOf('/') + 1).indexOf(".") >= 0) {
						var newfname = imageURI.substr(imageURI.lastIndexOf('/') + 1);
					} else {
						var newfname = jQuery.trim(imageURI.substr(imageURI.lastIndexOf('/') + 1)) + '.jpg';
					}
			    }
			    options.fileName = newfname;
			    //alert(newfname);
			    options.mimeType = localStorage.mime;
			    var params = new Object();    
			    params.submit_form = submit_form;
			    params.form_noresubmit_code = form_noresubmit_code;
			    params.comment_id = comment_id;
			    params.action = action;
			    params.comment = comment;
			    //options.headers = "Content-Type: multipart/form-data; boundary=38516d25820c4a9aad05f1e42cb442f4";
			    options.params = params;
			    options.chunkedMode = false;
			    var ft = new FileTransfer();
			    //alert(imageURI);
			    var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';

			    ft.upload(imageURI, encodeURI(main_url), win, fail, options);

			    function win(r) {
			    	alert("r = " + r);
			    	alert("JSON r = " + JSON.stringify(r));
			    	if(localStorage.allImageURILength == localStorage.allImageURILengthStart){
			    		localStorage.imageURI = '';
						localStorage.resubmit_code = '';      
						// window.location.href="add_comments.html"
						localStorage.submitcommentstatus = "1";
						changetoaddcomments();
			    	}
			    	else{
			    		var lengthIncrement = 1;
			    		localStorage.allImageURILengthStart = Number(localStorage.allImageURILengthStart) + Number(lengthIncrement);
					localStorage.submitcommentstatus = "0";
			    	}				
			    }

			    function fail(error) {
					alert("An error has occurred: Code = " + error.code);
					alert("upload error source " + error.source);
					alert("upload error target " + error.target);
					jQuery(".submit_com").show();
					jQuery(".loading_send").hide();
					localStorage.submitcommentstatus = "0";
			    }
			}
	    });    
	} 
	else {     
		// alert(comment)
		var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/submit/?XDEBUG_SESSION_START=PHPSTORM&gvm_json=1';
		jQuery.ajax({
			url: main_url,
			dataType: "json",
			method: "POST",
			data: {
				submit_form: submit_form,
				form_noresubmit_code:form_noresubmit_code,
				comment_id:comment_id,
				action:action,
				comment:comment
			},
			success: function(resp) {
				//alert(resp)
				localStorage.resubmit_code = '';            
				// window.location.href="add_comments.html"
				if(comment) {
					localStorage.submitcommentstatus = "1";
				}
				else {
					localStorage.submitcommentstatus = "0";
				}
				changetoaddcomments();
			},fail: function()
            {
              localStorage.submitcommentstatus = "0";
            }
		});
	}
} 

//function to like and dislike comment
function likedislikecomment(id,like)
{
  jQuery(document).ready(function($)
  {
    // alert(id)
    // alert(like)
      $(".loading_cancel").show();  
      $(".questions-container").hide();
      var main_url = localStorage.url + 'Add-comment/-/'+localStorage.short_url+'-'+localStorage.event_id+'/'+localStorage.agenda_id+'/?action=like&gvm_json=1&like='+like+'&c_id='+id;
         //  alert(main_url);
        $.ajax({
              url: main_url,
              dataType: "json",
              method: "GET",
              success: function(obj) {
                // window.location.href = 'add_comments.html';
                changetoaddcomments();
              }
            });
    });
}

function sortResults(prop, asc) {
    arr = arr.sort(function(a, b) {
        if (asc) return (a[prop] > b[prop]);
        else return (b[prop] > a[prop]);
    });
}

//function to delete entries from all the tables
function truncatealltables() {
    db.transaction(function(tx) {
        tx.executeSql('delete from OCEVENTS_user');
        tx.executeSql('delete from OCEVENTS_ticket');
        tx.executeSql('delete from OCEVENTS_points');
        tx.executeSql('delete from OCEVENTS_qa');
        tx.executeSql('delete from OCEVENTS_homepage');
        tx.executeSql('delete from OCEVENTS_teampoints');
        tx.executeSql('delete from OCEVENTS_yourteampoints');
        tx.executeSql('delete from OCEVENTS_footerlinks');
        tx.executeSql('delete from OCEVENTS_footermorelinks');
        tx.executeSql('delete from OCEVENTS_events');
        tx.executeSql('delete from OCEVENTS_keywords');
        tx.executeSql('delete from OCEVENTS_menu');
        tx.executeSql('delete from OCEVENTS_urleventslisting');
        
    });
}

//Done this week:
//OCEM-1727
//OCEM-1728

function changetogamification(id)
{
	$(".agenda-menu-container").hide();
	$(".user-profile-container").hide(); 
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-agenda-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadgamification();  
}

function changetoagenda(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-agenda-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadagenda();  
}

function changetoticketing(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide();
	$(".agenda-menu-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadticket();  
}

function changetopoints(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadpoints(); 
}


function changetocontacts(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".list-agendalist-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadcontacts(); 
}


function changetonotes(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadnotes(); 
}

function changetosponsors(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".add-friends-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadsponsors();  
}

function changetoallagenda(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
  	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadallagenda();  
}

function changetoteampoints(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadteampoints();  
}

function changetoyourpoints(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadyourpoints();  
}

function changetoyourcontacts(id)
{
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadyourcontacts(); 
}

function changetoagendaitem(id) {
	$('.welcome-container').hide();
	$(".user-profile-container").hide(); 
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
  $(".notes-agenda-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadagendaitem();  
}

function changetoaddcomments(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".list-agendalist-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	localStorage.direct_access_module_href = '';
	showcomments();
}

function changetoseeker(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	showseeker();
}

function changetoaddquestions(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".agenda-item-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	showquestions();
}

function changetoaddquiz(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".agenda-item-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	showquiz();
}

function changetovoting(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".agenda-item-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	showvoting();
}

function changetouserdetail(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".agenda-item-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loaduserdetail();
}

function changetoteamdetailpoint(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".agenda-item-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loaddetailteampoints();
}

function changetoyourdetailpoint(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".agenda-item-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadyourdetailteampoints();
}

function changetoviewfriend(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-item-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".seeker-results-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes')
	{
		$('.dropdown-btn').trigger('click');
	}
	loadfrienddetail();
}

function changetoseekerresults(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-item-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".score-card-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes') 
	{
		$('.dropdown-btn').trigger('click');
	}
	showseekerresults();
}

function changetoscorecard(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-item-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".seeker-results-container").hide();
	$(".scannerDiv").hide();
	$("#tooltipster-409679").hide();
	if(id == 'yes') 
	{
		$('.dropdown-btn').trigger('click');
	}
	loadscorecard();
}

function loadkeywords() {
	$(".loading_index_items").show();
	$(".form-container").hide();
	$(".hideloginbox").hide();
	
	var main_urld = "http://www.oceventmanager.com/api/index.php/main/keywords?XDEBUG_SESSION_START=PHPSTORM";
	jQuery.ajax({
		url: main_urld,
		dataType: "json",
		method: "GET",
		success: function(ss) {
		    //alert(JSON.stringify(ss));
		    if(ss.status == 'error')
		    {
				$(".loading_index_items").hide();
				$(".form-container").show();
				$(".hideloginbox").show(); 
				shownotification("Keywords not loaded!","Login");          
			}
		    else
		    {
				db.transaction(function(tx) {
					tx.executeSql('delete from OCEVENTS_keywords');
					jQuery.each( ss.data, function( key, val ) {
						tx.executeSql("insert into OCEVENTS_keywords (key_constant,key_val) values ('"+key+"','"+escape(val)+"')");
					});
				}); 
				
				db.transaction(function(tx) {
					tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
						var len = results.rows.length; 
						
						var login = '';  
						var fblogin = '';  
						var rstbtn = '';  
						var bkbtn = '';
						var rpw_desc = '';
						var loginsubmit = '';
						var resetpasswordbtn = '';
						for (i = 0; i < len; i++) {

							if(results.rows.item(i).key_constant == 'loginWithCredentials')
							{
								login = unescape(results.rows.item(i).key_val); 
							} 
							if(results.rows.item(i).key_constant == 'fbAccountloginViaFacebook')
							{
								fblogin = unescape(results.rows.item(i).key_val); 
							}
							if(results.rows.item(i).key_constant == 'intranetForgotPassword')
							{
								rstbtn = unescape(results.rows.item(i).key_val); 
							}  
							if(results.rows.item(i).key_constant == 'goback')
							{
								bkbtn = unescape(results.rows.item(i).key_val); 
							}
							if(results.rows.item(i).key_constant == 'passwordRetrivalEmailDescription')
							{
								rpwdesc = unescape(results.rows.item(i).key_val); 
							}
							if(results.rows.item(i).key_constant == 'resetPassword')
							{
								resetpasswordbtn  = unescape(results.rows.item(i).key_val); 
							}						
							if(results.rows.item(i).key_constant == 'IntranetLogin')								
							{
								loginsubmit = unescape(results.rows.item(i).key_val); 
							}
						}
						
						$("#login_button").html('<i class="icon-edit"></i>' + login);
						$("#fblogin").html('<i class="fa fa-facebook"></i>' + fblogin);
						$("#reset_button").html(rstbtn);					
						$("#back_button").html(bkbtn);
						$("#rpw_desc").html(rpwdesc);
						$("#login_submit").html(loginsubmit);
						$("#resetpasswordbtn").html(resetpasswordbtn);
						
						$(".loading_index_items").hide();
						$(".form-container").show();
						$(".hideloginbox").show();
					});
				});
		    }
		}
	});
}

function votingmodal() {
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
			var len = results.rows.length; 
			
			for (i = 0; i < len; i++) {

				if(results.rows.item(i).key_constant == 'voteForwardingUsersSearchTitle')
				{
					var vfust = unescape(results.rows.item(i).key_val); 
				} 
				if(results.rows.item(i).key_constant == 'voteForwardingUsersSearchInputPlaceholder')
				{
					var searchPlaceHolder = 'placeholder="' + unescape(results.rows.item(i).key_val) + '"';
				}
				if(results.rows.item(i).key_constant == 'close')
				{
					var closebttn = unescape(results.rows.item(i).key_val);
				}  
				
			}
					
			$('.vex-dialog-form').html('<div class="vex-dialog-message">' + vfust + '</div><div class="vex-dialog-input"><div class="search-wrapper"><i class="fa fa-search"></i><input type="text"' + searchPlaceHolder + 'class="search" value="" onkeyup="searchcontact(this.value);" ></div><ul class="users-list"></ul></div><div class="vex-dialog-buttons"><button type="button" class="vex-dialog-button-primary vex-dialog-button vex-first vex-last" onclick="closevotingmodal(); return false;">' + closebttn + '</button></div><div class="footer"></div>');  
			
		});
	});
}

function searchcontact(searchText) {
	$('.users-list').html('&nbsp;');

	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';

	if(searchText != '')
    {
        jQuery.ajax({
	        url: main_url,
	        dataType: "json",
	        method: "POST",
	        data: {
                action: 'get_vote_forwarding_users',
                voteSessionId: localStorage.voteSessionId,
                searchString: searchText
            },
	        success: function(obj) {

                if(checkdefined(obj.users) == 'yes') 
                {
			    	$.each(obj.users, function(key, val) {
				        team = '';
						
						if (checkdefined(val.team) == 'yes') {
							team = '&lt;' + val.team + '&gt;';
						}
						else {
							team = '&lt;     &gt;';
						}
						if (checkdefined(val.image) == 'yes') {
							var str = val.image;
							str = localStorage.url + str.replace("\/", "/");
						}

						$('.users-list').append('<li data-event-user-id="' + val.event_user_id + '" onclick="confirmtransfervote(' + val.event_user_id + ');"><div style="background-image: url(' + str + ');" class="image"></div><div class="name">' + val.fullName + '</div><div class="team">' + team + '</div></li>');
							
				    });
				}
            }
            ,fail: function(obj)
            {
              alert('failed') ;
            }
        });
    }

}

function confirmtransfervote(forwardedVoteUserId) {
	localStorage.forwardedVoteUserId = forwardedVoteUserId;
	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
			var len = results.rows.length; 
			var voteGivento = "";
			var revokeButton = "";
			var closeButton = "";
			
			for (i = 0; i < len; i++) {

				if(results.rows.item(i).key_constant == 'yourVoteRightGivenTo')
				{
					var voteGivento =  unescape(results.rows.item(i).key_val); 
				} 
				if(results.rows.item(i).key_constant == 'stopVoteForwarding')
				{
					var revokebttnn = unescape(results.rows.item(i).key_val);
				}
				if(results.rows.item(i).key_constant == 'close')
				{
					var closebttnn = unescape(results.rows.item(i).key_val);
				}  
				
			}

			var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
			jQuery.ajax({
		        url: main_url,
		        dataType: "json",
		        method: "POST",
		        data: {
	                action: 'set_vote_forwarding_user',
	                voteSessionId: localStorage.voteSessionId,
	                eventUserId: forwardedVoteUserId
	            },
		        success: function(obj) {

					if (checkdefined(obj.user.image) == 'yes') {
						var str = obj.user.image;
						str = localStorage.url + str.replace("\/", "/");
					}

					if(obj.user.first_name != "" || obj.user.first_name != undefined || obj.user.first_name != null) {
						var firstName = obj.user.first_name;
					}
					else {
						var firstName = "";
					}

					if(obj.user.last_name != "" || obj.user.last_name != undefined || obj.user.last_name != null) {
						var lastName = obj.user.last_name;
					}
					else {
						var lastName = "";
					}

					var fullName = firstName + " " + lastName;
					
					$('.vex-dialog-form').html('<div class="vex-dialog-message"><p>' + voteGivento + '</p><p><span class="image" id="vexDialogMessageSpanImage"></span></p><p class="pName">' + fullName + '<br /><br />' + obj.user.mobile + ' / <a href="mailto:' + obj.user.email + '">' + obj.user.email + '</a></p></div><div class="vex-dialog-buttons"><button type="button" class="vex-dialog-button-primary vex-dialog-button vex-first" onclick="revokeVoteForwarding();">' + revokebttnn + '</button><button type="button" class="vex-dialog-button-secondary vex-dialog-button vex-last" onclick="closevotingmodal(); return false;">' + closebttnn + '</button></div><div class="footer"></div>'); 

					$("#vexDialogMessageSpanImage").css("background-image","url("+ str +")"); 

	            }
	            ,fail: function(obj)
	            {
	              alert('failed') ;
	            }
	        });
		});
	});
}

function revokeVoteForwarding() {
	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';

	jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            action: 'stop_vote_forwarding',
            voteSessionId: localStorage.voteSessionId
        },
        success: function(obj) {
        	$(".vote-forwarding-dialog").hide();
        	changetovoting();
        }
        ,fail: function(obj) {
        	alert("failed");
        }
    });
}

function forwardedVoteUser() {
	confirmtransfervote(localStorage.forwardedVoteUserId);
	$(".vote-forwarding-dialog").show();
}

function openvoteforwardialog() {
	$('.vex-dialog-form').html('');

	db.transaction(function(tx) {
		tx.executeSql("SELECT * FROM OCEVENTS_keywords", [], function(tx, results) {
			var len = results.rows.length;                             
			for (i = 0; i < len; i++) {  
				if(results.rows.item(i).key_constant == 'voteForwardingConfirmation') {
					var vfc = unescape(results.rows.item(i).key_val);                     
				}
				if(results.rows.item(i).key_constant == 'yes') {
					var yesbttn = unescape(results.rows.item(i).key_val);                     
				}
				if(results.rows.item(i).key_constant == 'no') {
					var nobttn = unescape(results.rows.item(i).key_val);                     
				}
				if(results.rows.item(i).key_constant == 'voteForwardingConfirmationDesc') {
					var vfcd = unescape(results.rows.item(i).key_val);                     
				}
			}  

			$('.vex-dialog-form').html('<div class="vex-dialog-message">' + vfc + '</div><div class="vex-dialog-input"><input type="hidden" value="_vex-empty-value" name="vex"></div><div class="vex-dialog-buttons"><button type="button" class="vex-dialog-button-primary vex-dialog-button vex-first" onclick="votingmodal(); return false;">' + yesbttn + '</button><button type="button" class="vex-dialog-button-secondary vex-dialog-button vex-last" onclick="cancelvotingmodal(); return false;">' + nobttn + '</button></div><div class="footer">' + vfcd + '</div>'); 

			$(".vote-forwarding-dialog").show();
			$('#open-vote-forwarding-users-search-dialog').hide();
		});
	});
	
}

function closevotingmodal() {
	$(".vote-forwarding-dialog").hide();
	$('#open-vote-forwarding-users-search-dialog').show();

	changetovoting();
}

function cancelvotingmodal() {
	$(".vote-forwarding-dialog").hide();
	$('#open-vote-forwarding-users-search-dialog').show();

}

function changeUserForVote(euid) {
	localStorage.euid = euid;

	if(localStorage.user_id == euid) {
		localStorage.voteforwarderid = "";
	}
	else {
		localStorage.voteforwarderid = "/forwarded/" + euid;
	}

	changetovoting();
}

function clearsearchurl() {
	$(".searchUrl").val("");
	$("#fasearch").show();
	$("#fatimes").hide();
	$(".urls-list").html("").hide();
}

function loadUrlEvents() {
	db.transaction(function(tx) {
		tx.executeSql("delete from OCEVENTS_urleventslisting");							
	}); 
	if(localStorage.UrlEvent_modified_time) {
		var  main_urlmt = "https://experience.live/modules/gamification/api/solutions.php?action=get_solutions&modified_time="+localStorage.UrlEvent_modified_time;
		$.ajax({
		    url: main_urlmt,
		    dataType: "json",
		    method: "GET",
		    success: function(obj) {
		    	if(obj.status == "success") {
		    		if(obj.modified == "0") {
		    			var main_url = "https://experience.live/modules/gamification/api/solutions.php?action=get_solutions&modified_time=0";		    			
		    			$.ajax({
						    url: main_url,
						    dataType: "json",
						    method: "GET",
						    success: function(response) {					    	
						    	if(response.status == "success") {
						    		$.each(response.items, function(key, val) {
						    			db.transaction(function(tx) {     
											tx.executeSql('INSERT INTO OCEVENTS_urleventslisting (url_name,url_link,solution_id,event_id,title) VALUES ("' + val.name + '","' + val.url + '","0","0","' + val.name + '")');
										});
										if(checkdefined(val.events) == 'yes') {
											$.each(val.events, function(key, res) {
												db.transaction(function(tx) {      
													tx.executeSql('INSERT INTO OCEVENTS_urleventslisting (url_name,url_link,solution_id,event_id,title) VALUES ("' + val.name + '","' + res.host + '","' + res.solution_id + '","' + res.event_id + '","' + res.title + '")');
												});
											});
										}
								    });
								    
						    	}
						    	else {
						    		shownotification(response.error_msg,"Login");
						    	}
						    }
						});
		    		}
		    		else {
		    			localStorage.UrlEvent_modified_time = obj.modified_time;
		    			loadUrlEvents();
		    		}
		    	}
		    }
		});
	}
	else {
		localStorage.UrlEvent_modified_time = "1467106221";
		loadUrlEvents();
	}
}

function searchurl() {
	var val = $(".searchUrl").val().toLowerCase();
	if(val == "") {
		$("#fasearch").show();
		$("#fatimes").hide();
		$(".urls-list").html("").hide();
	}
	else {
		$("#fasearch").hide();
		$("#fatimes").show();

		var userdata = "";
		db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM OCEVENTS_urleventslisting", [], function(tx, results) {
				var len = results.rows.length;  
				for (i = 0; i < len; i++) {
					//alert("url_name =>" + results.rows.item(i).url_name + " , url_link => " + results.rows.item(i).url_link + " , title => " + results.rows.item(i).title)
					var url_name = results.rows.item(i).url_name;
					var url_link = "'https://" + results.rows.item(i).url_link + "'";
					var url_title = results.rows.item(i).title;
					var url_titles = url_title.replace(/["']/g, "");
					var urls_title = "'" + url_titles + "'";
					var urls_name = "'" + results.rows.item(i).url_name + "'";
					var eventid = results.rows.item(i).event_id;

					var lower_url_title = url_title.toLowerCase(); 
	    			var lowerResult = lower_url_title.search(val);
	    			if(lowerResult != -1) {
	    				userdata += '<li onclick="oneUrlSelected(' + url_link + ', ' + urls_title + ', ' + urls_name + ', ' + eventid + ');"><p class="liofp">' + url_title + ' </p><p class="libyp"> By:  ' + url_name + ' </p></li>';
		    			// userdata += '<li onclick="oneUrlSelected(' + url_link + ', ' + urls_title + ', ' + urls_name + ');"><p class="liofp">' + url_title + ' </p><p class="libyp"> By:  ' + url_name + ' </p></li>';
		    			
	    			}
				}
				// alert(userdata)
				$(".urls-list").html(userdata).show();
			});		
	    });
	}
}


function oneUrlSelected(urllink, urltitle, urlname, eventid) {
// function oneUrlSelected(urllink, urltitle, urlname) {
	if(eventid !== 0) {
		localStorage.event_id = eventid;
	}
	// alert("urllink => " + urllink + " , urltitle => " + urltitle + " , urlname => " + urlname + " , eventid => " + localStorage.event_id )
	$("#autologinbox").show();
	$("#urlselected").show();
	$(".urls-list").html("").hide();
	$("#loginFacebookBox").show();
	$("#select_url").hide();
	$("#selectedurlname").html(urltitle);
	$(".byselected").html("By: " + urlname );
	localStorage.surl = urllink;
}

function resetUrl() {
	$(".searchUrl").val("");
	$("#fasearch").show();
	$("#fatimes").hide();
	$(".urls-list").html("").hide();
	$("#autologinbox").hide();
	$("#select_url").show();
	$("#autologinbox").hide();
	$("#loginBox").hide();
	$("#resetPasswordBox").hide();
	localStorage.surl = "";
}

function deleteCImage(commentId,imagePosition) {
	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';

	jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
            action: 'delete_comment_image',
            commentId: commentId,
            imagePosition: imagePosition
        },
        success: function(obj) {
        	showcomments();
        }
        ,fail: function(obj) {
        	alert("failed");
        }
    });
}

function commentimagespopupslider(commentId,imagePosition) {
	$(".mfp-bg.mfp-ready").show();
	$(".mfp-wrap.mfp-gallery.mfp-close-btn-in.mfp-auto-cursor.mfp-ready").show();
	$(".mfp-preloader").show();
	$(".main-wrapper").css("overflow", "hidden !important");

	localStorage.currentimagePosition = imagePosition;
	localStorage.popupcommentId = commentId;
	
	if(localStorage.popUpObjectData == undefined || localStorage.popUpObjectData == null || localStorage.popUpObjectData == "") {
		var main_urld = localStorage.loadallcomments_url;
	    $.ajax({
	        url: main_urld,
	        dataType: "json",
	        method: "GET",
	        success: function(obj) {
	        	var azx = "";
	        	var i = 0;
	        	$.each(obj.commentInstances, function(key, val) {
	        		
	        		if(val.instance_id == commentId) {
	        			$.each(val.images, function(key, result) {
		        			if(i==0) {
		        				azx = '"' + result.small + '"';
		        			}
		        			else{
		        				azx += ',"' + result.small + '"';
		        			}
		        			i++;
		        		});

	        			localStorage.popUpObjectData = azx; 
	        			var tot_img = val.images.length;
	        			var imageorigin = parseInt(imagePosition) + parseInt("1");
	        			var imgCounter = '<p>' + imageorigin + ' of ' + tot_img + '</p>';
	        			var imagenumbers = parseInt(tot_img) - parseInt("1");

						var popup_image = '<img id="imgmfpimg" class="mfp-img" alt="" src="'+localStorage.url+'resources/files/images/'+val.images[imagePosition].small+'" style="width:100%; height:100%; max-height:480px;" onload="swipepopimage();"><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter" id="mfpCounter">' + imgCounter + '</div></div></figcaption>';
						
						$('.commentpopup_image').html(popup_image);
						$(".mfp-preloader").hide();
						
						if(imagePosition == 0) {
							var imagePositionprev = imagenumbers;
							$('#previousCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionprev+');');
						}
						else {
							var imagePositionprev = parseInt(imagePosition) - parseInt("1");
							$('#previousCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionprev+');');
						}

						if(imagePosition == imagenumbers) {
							var imagePositionnext = parseInt(tot_img) - parseInt(tot_img);
							$('#nextvCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionnext+');');
						}
						else {
							var imagePositionnext = parseInt(imagePosition) + parseInt("1");
							$('#nextvCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionnext+');');
						}
	        		}   
	        	});
	        }
	    });
	}
	else {
		var object = localStorage.popUpObjectData;
		var obj = object.split(",");
		var tot_img = obj.length;
		var imageorigin = parseInt(imagePosition) + parseInt("1");
		var imgCounter = '<p>' + imageorigin + ' of ' + tot_img + '</p>';
		var imagenumbers = parseInt(tot_img) - parseInt("1");
		var imageslider = obj[imagePosition].replace(/"/g,"");
		var popup_image = '<img id="imgmfpimg" class="mfp-img" alt="" src="'+localStorage.url+'resources/files/images/'+imageslider+'" style="width:100%; height:100%; max-height:480px;" onload="swipepopimage();"><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter" id="mfpCounter">' + imgCounter + '</div></div></figcaption>';
		
		$('.commentpopup_image').html(popup_image);
		$(".mfp-preloader").hide();
		
		if(imagePosition == 0) {
			var imagePositionprev = imagenumbers;
			$('#previousCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionprev+');');
		} else {
			var imagePositionprev = parseInt(imagePosition) - parseInt("1");
			$('#previousCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionprev+');');
		}

		if(imagePosition == imagenumbers) {
			var imagePositionnext = parseInt(tot_img) - parseInt(tot_img);
			$('#nextvCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionnext+');');
		} else {
			var imagePositionnext = parseInt(imagePosition) + parseInt("1");
			$('#nextvCommentImage').attr('onclick', 'commentimagespopupslider('+commentId+','+imagePositionnext+');');
		}
	}
}

function closecommentimagespopupslider() {
	localStorage.popUpObjectData = "";
	$(".mfp-bg.mfp-ready").hide();
	$(".mfp-wrap.mfp-gallery.mfp-close-btn-in.mfp-auto-cursor.mfp-ready").hide();

	var popup_image = '<figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter" id="mfpCounter"></div></div></figcaption>'	
	$('.commentpopup_image').html(popup_image);
}

function loadUserImages() {
	var main_urld = localStorage.url + "api/index.php/auth/user?XDEBUG_SESSION_START=PHPSTORM";

	$.ajax({
        url: main_urld,
        dataType: "json",
        method: "GET",
        success: function(obj) {
        	//alert(JSON.stringify(obj));
        	var isusrimg = JSON.stringify(obj.data.image.is_user_image);
			var imgSrc = JSON.stringify(obj.data.image.image_src);
			var fbuserid = JSON.stringify(obj.data.fb_user_id);
			var user_position = JSON.stringify(obj.data.position);

			if(checkdefined(fbuserid) == "yes") {
				localStorage.fid = fbuserid;
			}
			else{
				localStorage.fid = "";
			}

			if(checkdefined(user_position) == "yes") {
				localStorage.usr_position = user_position;
			}

			if(checkdefined(imgSrc) == "yes") {
				if(isusrimg == "true" || isusrimg == true){
					localStorage.profilelogotype = "1";
					localStorage.profilelogo = imgSrc;
				}
				else{
					localStorage.profilelogotype = "2";
					if(localStorage.fid != "" || localStorage.fid != undefined || localStorage.fid != null) {
						localStorage.profilelogo = imgSrc;
					}
					else{
						localStorage.profilelogo = '"http://oceventmanager.com/oc-publisher-framework/beta/resources/gamification/images/mobile/default-user-image.png"';
					}
				}
			}
			else {
				localStorage.profilelogo = '"http://oceventmanager.com/oc-publisher-framework/beta/resources/gamification/images/mobile/default-user-image.png"';
				localStorage.profilelogotype = "0";
			}
			var url = 'url(' + localStorage.profilelogo + ')';
			$("#profile_pic").css("background-image",url);

			var medpropic = 'background-image:url(' + localStorage.profilelogo + ');';
			$("#medium_profile_pic").attr("style", medpropic);
			
			var proimg = 'background-image:url(' + localStorage.profilelogo + ');';
            $(".main-img").attr("style", proimg);

            if (localStorage.profilelogotype == '1') {
                $(".selfie_button").html('<button class="pic-remove" onclick="removeprofileimage();" type="button" name="remove_pic" value="1">Remove image</button>');
            }
            else {
            	$(".selfie_button").html('<div class="pic-upload selfie_capture"><button class="addselfie" onclick="showbuttons();" type="button" name="addselfie" value="1">Add</button><!--span class="addselfietex" onclick="showbuttons();">add</span--></div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Choose a Photo"  onclick="getPhoto(pictureSource.PHOTOLIBRARY);">Choose a Photo</div><div class="pic-upload hidden_button" style="display:none;"><input type="button" value="Take a Photo"  onclick="capturePhoto();">Take a Photo</div>');
            }

            if(localStorage.profileuis == "removed") {
				$(".imageaddedremoved").html('<div class="alert alert-success">I have removed your selfie<br>OC Cloud</div>');
		    }
		    else if (localStorage.profileuis == "added") {
				$(".imageaddedremoved").html('<div class="alert alert-success">Image added</div>');
		    }
		    else {
				$(".imageaddedremoved").html("");
		    }
		}
    });
}

function showhidefacebook() {
	var main_url = localStorage.url + 'user-profile/-/' + localStorage.short_url + '-' + localStorage.event_id + '/?gvm_json=1';
	$.ajax({
        url: main_url,
        dataType: "json",
        method: "GET",
        success: function(obj) {
        	var shfb = obj.allowFacebook;
        	var iststusr = obj.eventuser.is_test_user;
        	localStorage.shfb = obj.allowFacebook;
        	if(shfb == 1 && iststusr != 0){
        		if(localStorage.fid == "" || localStorage.fid == undefined || localStorage.fid == null) {
	                $(".facebook-link").show();
	                $("#unlinkfacebook").hide();
	            }
	            else {
	                $(".facebook-link").hide();
	                $("#unlinkfacebook").show();
	            }
        	}
        	else {
				$(".facebook-link").hide();
                $("#unlinkfacebook").hide();
	        }
        }
    });
}

function swipepopimage() {
	var imagePosition = localStorage.currentimagePosition;
	var commentId = localStorage.popupcommentId
	var object = localStorage.popUpObjectData;
	var obj = object.split(",");
	var tot_img = obj.length;
	var imageorigin = parseInt(imagePosition) + parseInt("1");
	var imagenumbers = parseInt(tot_img) - parseInt("1");
	
	$("img").on("swipeleft",function() {
		if(imagePosition == 0) {
			var imagePositionprev = imagenumbers;
			commentimagespopupslider(commentId,imagePositionprev);
		} else {
			var imagePositionprev = parseInt(imagePosition) - parseInt("1");
			commentimagespopupslider(commentId,imagePositionprev);
		}
	});

	$("img").on("swiperight",function() {
		if(imagePosition == imagenumbers) {		
			var imagePositionnext = parseInt(tot_img) - parseInt(tot_img);
			commentimagespopupslider(commentId,imagePositionnext);
		} else {
			var imagePositionnext = parseInt(imagePosition) + parseInt("1");
			commentimagespopupslider(commentId,imagePositionnext);
		}
    });
}

window.addEventListener('native.hidekeyboard', keyboardHideHandler);
window.addEventListener('native.showkeyboard', keyboardShowHandler);

function keyboardHideHandler(e){
	$(".tempdiv").html("");
}
function keyboardShowHandler(e){
	var isIphone = navigator.userAgent.indexOf('iPhone') >= 0;
	if(isIphone) {
		$(".tempdiv").html("<style>header { position: static; float: left; z-index: 99; } footer { position: static; float: left; z-index: 99; border: 1px solid red; margin-top: 130em;} .container.main-container { position: static; float: left; z-index: 9; border: 5px solid blue; margin:0; display: inline-block;} html.canvas; html.video { background: none; } #gamification-footer-menu { display: none; }</style>");
	}
}

function changetomyscanner(id) {
	$(".welcome-container").hide();
	$(".user-profile-container").hide(); 
	$(".agenda-item-container").hide();
	$(".agenda-menu-container").hide();
	$(".ticketing-container").hide();
	$(".leaderboards-container").hide();
	$(".contacts-container").hide();
	$(".notes-container").hide();
	$(".add-comments-container").hide();
	$(".add-questions-container").hide();
	$(".single-seeker-container").hide();
	$(".quiz-container").hide();
	$(".voting-page-container").hide();
	$(".last-container").hide();
	$(".view-friend-container").hide();
	$(".score-card-container").hide();
	$(".seeker-results-container").hide();
	$(".scannerDiv").show();
	$("#tooltipster-409679").hide();
	if(id == 'yes') 
	{
		$('.dropdown-btn').trigger('click');
	}
	//myscanner();
}

function myscanner() {
    cordova.plugins.barcodeScanner.scan(
        function (result) {
        	// alert(JSON.stringify(result))
            if(!result.cancelled) {
                // In this case we only want to process QR Codes
                if(result.format == "QR_CODE") {
                    var value = result.text;
                	$(".qrdata").html('<h1 clas="qrpdatah"> Qr Data :=> </h1><p class="qrpdata">' + value + '</p>');

                   // var mainurl = localStorage.url + 'modules/event/ajax/frontend_ws.php';
					var mainurl = localStorage.scanner_liveurl + 'modules/event/ajax/frontend_ws.php';
					
					jQuery.ajax({
						url: mainurl,
						dataType: "json",
						method: "POST",
						data:{
							ticket_code: value,
							action: "p_check_ticket_code",
							json_service: "ticketing"
						},
						success: function(obj) {
							// alert(JSON.stringify(obj));
							
						   	$(".qrapistatus").html('<span><h1 clas="qrpdatah"> Status :=> </h1><p class="qrpdata">' + obj.status + '</p></span><span><h1 clas="qrpdatah"> Error Message :=> </h1><p class="qrpdata">' + obj.error_msg + '</p></span><span><h1 clas="qrpdatah"> Message :=> </h1><p class="qrpdata">' + obj.message + '</p></span><span><h1 clas="qrpdatah"> Object :=> </h1><p class="qrpdata">' + JSON.stringify(obj) + '</p></span>');
						}
					});

                } else {
                    alert("Sorry, only QR codes allow ;)");
                }
            } else {
                alert("The user has cancel the scan");
            }
        },
        function (error) {
            alert("An error ocurred: " + error);
        }
    );
 }

function loginscanner() {
	$("#scanner_submit").hide();
	$(".loadingscanner").show();

	localStorage.scanner_liveurl = "https://" + $("#scanner_liveurl").val().replace("http://","").replace("https://","") + "/";
	var username = $("#scanner_username").val();
	var password = md5($("#scanner_password").val());
	var salt = "R#F#GHJ^Hv098jv89j";
	var scannerhash = md5(salt + username + password);

	var mainurl = localStorage.scanner_liveurl + 'modules/event/ajax/frontend_ws.php';
	// var mainurl = localStorage.url + 'modules/event/ajax/frontend_ws.php';

	jQuery.ajax({
		url: mainurl,
		dataType: "json",
		method: "POST",
		data:{
			json_service: "ticketing",
			action: "p_logout"
		},
		success: function(res) {
			// $(".scanner_results").show();
			// console.log(JSON.stringify(res));
				jQuery.ajax({
					url: mainurl,
					dataType: "json",
					method: "POST",
					data:{
						json_service: "ticketing",
						action: "p_login",
						username: username,
						password_md5: password,
						hash: scannerhash
					},
					success: function(obj) {
						console.log(JSON.stringify(obj));
						if(obj.status == "success") {
							
							$(".scaneventtitle").html(obj.p_data.event.title);
							$(".scanpartnertitle").html(obj.p_data.title);
							$(".scanuser").html(obj.p_data.username);

							$("#scannerloginBox").hide();
							$(".scanner-overlay").hide();
							// $("#scannerbtndiv").show();
						}

					},
			        function (error) {
			            alert("An error ocurred: " + error);
			        }
				});
		},
        function (error) {
            alert("An error ocurred: " + error);
        }
	});
}

var md5 = function(value) {
	return CryptoJS.MD5(value).toString();
}

function scannerlogout() {
	var mainurl = localStorage.url + 'modules/event/ajax/frontend_ws.php';
	jQuery.ajax({
		url: mainurl,
		dataType: "json",
		method: "POST",
		data:{
			json_service: "ticketing",
			action: "p_logout"
		},
		success: function(res) {
			if(res.status == "success") {
				$("#scannerloginBox").show();
				$(".scanner-overlay").show();
				$("#scanner_submit").show();
				$(".loadingscanner").hide();
			}
		}
	});
}

function searchscannerurl() {
	var val = $(".searchscanner").val().toLowerCase();
	if(val == "") {
		$("#fasearch").show();
		$("#fatimes").hide();
	}
	else {
		$("#fasearch").hide();
		$("#fatimes").show();
	}
}

function changescannerurlicon() {
	var val = $(".searchscanner").val().toLowerCase();
	if(val == "") {
		$("#fasearch").show();
		$("#fatimes").hide();
	}
	else {
		$("#fasearch").hide();
		$("#fatimes").show();
	}
}


function clearscannersearchurl() {
	$(".searchscanner").val("");
	$("#fasearch").show();
	$("#fatimes").hide();
}

$(".tooltipstered").click(function() {
	$("#notifications").scrollTop(0);
	$("#tooltipster-409679").toggle();
});   

$('.dropdown-btn').click(function() {
	$("#tooltipster-409679").hide();
});   

function innoti() {
	// callpusher();

	var mainurl = localStorage.url + 'api/index.php/main/changeEvent?gvm_json=1';
    jQuery.ajax({
      url: mainurl,
      dataType: "json",
      method: "POST",
      data:{eventId: localStorage.event_id},
      success: function(obj) {

			var main_url = localStorage.url + 'api/index.php/main/homepageSettings?XDEBUG_SESSION_START=PHPSTORM&event_id=' + localStorage.event_id;

			jQuery.ajax({
		        url: main_url,
		        dataType: "json",
		        method: "GET",
		        success: function(obj) {
			    	var textnoti = JSON.parse(obj.data._extra.notifications.inlineNotificationsJSON);
		        	var countnoti = obj.data._extra.notifications.unreadInlineNotificationsCount;
		        	var len = textnoti.length;
		        	localStorage.notilen = len;
		        	var i = 0;
		        	// alert(JSON.stringify(obj.data._extra.notifications));
		        	var pusherKey = obj.data._extra.notifications.pusherKey;
		        	var pusherCluster = obj.data._extra.notifications.pusherCluster; 
		        	var liveurl = localStorage.url.slice(0, -1);
		        	var pusherAuthEndpointLink = liveurl + obj.data._extra.notifications.pusherAuthEndpointLink; 
		        	var pusherUserChannel = obj.data._extra.notifications.pusherUserChannel; 
		        	var pusherEvent = obj.data._extra.notifications.pusherEvent;

		        	$(".pusherscript").html("<script type='text/javascript'> Pusher.logToConsole = true;var pusher = new Pusher('" + pusherKey + "', { cluster: '" + pusherCluster + "', authEndpoint: '" + pusherAuthEndpointLink + "' }); var channel = pusher.subscribe('" + pusherUserChannel + "'); channel.bind('" + pusherEvent + "', function(data) { newinnoti(data); }); </script>");

		        	if(countnoti == 0) {
		        		$("#notifications-count").html(countnoti).hide();
		        	}
		        	else{
		        		$("#notifications-count").html(countnoti).show();
		        	}
		        	if(len > 0) {
						$("#notifications").html("");
			        	$.each(textnoti, function(key, val) {
			        		i++;
			        		var notitime = jQuery.timeago(val.time);
			        		
				        	if(val.read == 0) {
				        		var dtclass = "unread";
				        		var faclass = "fa-circle";
				        	}
				        	else {
				        		var dtclass = "read";
				        		var faclass = "fa-circle-o";
				        	}
				        	// alert(val.instance_id);
				        	if(i < len) {
			        			$("#notifications").append('<dt class="' + dtclass + '" id="dtid'+ val.instance_id +'"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right ' + faclass + '" id="facircle' + val.instance_id + '" onclick="notistatuschange(' + val.instance_id + ')"></i><i class="oc-icon-clock"></i><time datetime="' + val.time + '">' + notitime + '</time></span><div class="text">' + val.text + '</div></dt>');
			        		}
			        		else {
			        			$("#notifications").append('<dt class="' + dtclass + '" id="dtid'+ val.instance_id +'"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right ' + faclass + '" id="facircle' + val.instance_id + '" onclick="notistatuschange(' + val.instance_id + ')"></i><i class="oc-icon-clock"></i><time datetime="' + val.time + '">' + notitime + '</time></span><div class="text">' + val.text + '</div></dt><dd id="load-more-wrapper" class="loader-wrapper" onclick="loadmorenoti(' + len + ');"><i class="fa fa-cog fa-spin"></i><span class="load-more">loadMoreNotifications</span></dd>');
			        		}
			        		$(".slimScrollDiv, #notifications").css("height","380px");

			        	});
			        }
		        }
		    });
		}
	});
}

function newinnoti(val) {

	var noticount = $("#notifications-count").html();
	if(noticount == "" || noticount == undefined || noticount == null) {
		noticount = 0;
	}
	noticount = parseInt(noticount) + parseInt("1");
	if(val.read == 0) {
		var dtclass = "unread";
		var faclass = "fa-circle";
	}
	else {
		var dtclass = "read";
		var faclass = "fa-circle-o";
	}
	
	var notitime = jQuery.timeago(val.time);

	$("#notifications-count").html(noticount).show();		
	$("#notifications").prepend('<dt class="' + dtclass + '" id="dtid'+ val.instance_id +'"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right ' + faclass + '" id="facircle' + val.instance_id + '" onclick="notistatuschange(' + val.instance_id + ')"></i><i class="oc-icon-clock"></i><time datetime="' + val.time + '">' + notitime + '</time></span><div class="text">' + val.text + '</div></dt>');	
}

function notistatuschange(data) {
	var dtclass = $('#dtid'+data).attr('class');
	var noticount = $("#notifications-count").html();
	if(noticount == "" || noticount == undefined || noticount == null) {
		noticount = 0;
	}
	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
	if(dtclass == "unread") {	
		jQuery.ajax({
	        url: main_url,
	        dataType: "json",
	        method: "POST",
	        data: {
				action: 'notification_mark_as',
				instance_id: data,
				read: true
            },
	        success: function(obj) {
	        	if(obj.status == "success"){
		        	$("#facircle" + data).removeClass("fa-circle").addClass("fa-circle-o");	
					$('#dtid' + data).removeClass("unread").addClass("read");
					noticount = parseInt(noticount) - parseInt("1");		
					if(noticount == 0) {
						$("#notifications-count").html(noticount).hide();
					}
					else {
						$("#notifications-count").html(noticount).show();
					}
				}
	        }
	    });
	}
	else {
		jQuery.ajax({
	        url: main_url,
	        dataType: "json",
	        method: "POST",
	        data: {
				action: 'notification_mark_as',
				instance_id: data,
				read: false
            },
	        success: function(obj) {
	        	if(obj.status == "success"){
					$("#facircle" + data).removeClass("fa-circle-o").addClass("fa-circle");
					$('#dtid'+data).removeClass("read").addClass("unread");		
					noticount = parseInt(noticount) + parseInt("1");
					$("#notifications-count").html(noticount).show();
				}
			}
		});
	}
}

function loadmorenoti(data) {

	var main_url = localStorage.url + 'modules/gamification/ajax/frontend_ws.php';
	jQuery.ajax({
        url: main_url,
        dataType: "json",
        method: "POST",
        data: {
			action: 'notifications_load_more',
			current_count: data
        },
        success: function(obj) {
        	if(obj.status == "success") {
	        	var textnoti = obj.notifications;
	        	var len = textnoti.length;
        		var i = 0;	        

				var loadmorenoti = parseInt(data) + parseInt(len);
				localStorage.notilen = loadmorenoti;
	        	if(len > 0) {
	        		$("#load-more-wrapper").remove();
		        	$.each(textnoti, function(key, val) {
		        		i++;
		        		var notitime = jQuery.timeago(val.time);
		        		
			        	if(val.read == 0) {
			        		var dtclass = "unread";
			        		var faclass = "fa-circle";
			        	}
			        	else {
			        		var dtclass = "read";
			        		var faclass = "fa-circle-o";
			        	}

			        	if(i < len) {
		        			$("#notifications").append('<dt class="' + dtclass + '" id="dtid'+ val.instance_id +'"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right ' + faclass + '" id="facircle' + val.instance_id + '" onclick="notistatuschange(' + val.instance_id + ')"></i><i class="oc-icon-clock"></i><time datetime="' + val.time + '">' + notitime + '</time></span><div class="text">' + val.text + '</div></dt>');
		        		}
		        		else {
		        			$("#notifications").append('<dt class="' + dtclass + '" id="dtid'+ val.instance_id +'"><span class="time-wrapper clearfix"><i class="mark-as fa pull-right ' + faclass + '" id="facircle' + val.instance_id + '" onclick="notistatuschange(' + val.instance_id + ')"></i><i class="oc-icon-clock"></i><time datetime="' + val.time + '">' + notitime + '</time></span><div class="text">' + val.text + '</div></dt><dd id="load-more-wrapper" class="loader-wrapper" onclick="loadmorenoti(' + loadmorenoti + ');"><i class="fa fa-cog fa-spin"></i><span class="load-more">loadMoreNotifications</span></dd>');
		        		}
		        		$(".slimScrollDiv, #notifications").css("height","380px");

		        	});
		        }
			}
		}
	});
}

$( "#notifications" ).scroll(function(e) {
	var elem = $(e.currentTarget);
    if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
    	var data = localStorage.notilen;
    	loadmorenoti(data);
    }
});

