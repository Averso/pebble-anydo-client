module.exports = function(minified) {
  var clayConfig = this;
  


  //we get auth key for user in clay settings  
  function get_auth_key()
  { 
    //notify user that key is retrevied
    clayConfig.getItemByAppKey('auth_text').set("Loading..."); 
    
    //get user login data
    var email = clayConfig.getItemByAppKey('email').get();
    var pass = clayConfig.getItemByAppKey('password').get(); 
      
    var base_url = "https://sm-prod2.any.do/";
    var xhr = new XMLHttpRequest();
      
    xhr.open('POST', base_url + 'j_spring_security_check');    
       
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('j_username=' + email + '&j_password=' + pass + '&_spring_security_remember_me=on');
      
    xhr.onload = function () {    
       
       //get authentication key and put it in text label in stettings
       var auth_key = this.getResponseHeader('X-Anydo-Auth');
      
       //check if null - which means wrong login data
       if(auth_key === null)
       {
        clayConfig.getItemByAppKey('auth_text').set("Wrong login data!"); 
       }
       else
       {
        clayConfig.getItemByAppKey('auth_text').set(auth_key);     
       }
                 
    };
    
    //show error message
    xhr.onerror = function () {    
       
       clayConfig.getItemByAppKey('auth_text').set("Problem with internet connection!");       
        
    };
     
  }
  
  //after page loaded
  clayConfig.on(clayConfig.EVENTS.AFTER_BUILD, function() {
        
    var auth_button = clayConfig.getItemByAppKey('auth_button');
    auth_button.on('click',get_auth_key);
  });
  

};