function updateTextInput(v,c) {

      //$(this).prepend($(this).val());
      console.log(document.getElementById(c));  
      console.log(c);  
      
      document.getElementById(c).innerHTML=v.value;
      
}

var username = "coffe"
var password = "kafe";

function make_base_auth(user, password) {
  var tok = user + ':' + password;
  var hash = Base64.encode(tok);
  return "Basic " + hash;
}

function makeAuth() {
$.ajax
  ({
    type: "GET",
    url: url+"?cmd=getTypesList",
    dataType: 'json',
    async: false,
    data: '{"username": "' + username + '", "password" : "' + password + '"}',
    success: function (){
    alert('Thanks for your comment!');
    }
});
}

$(function() {
  




function getTypesList(url)  {
  
$.getJSON( url+"?cmd=getTypesList", function( data ) {
  var items = [];
  var html="";
  $.each( data, function( key, val ) {
    //items.push(val["typ"]);
    html+="<label for='"+val["typ"]+"'>"+val["typ"]+"</label>";
    html+="<b id='count"+val["typ"]+"'>0</b><input type='range' class='range' name='type[]'"+
     "value='0'  min='0' max='10' onchange='updateTextInput(this, \"count"+val["typ"]+"\")'><br>";

  });
  $("#form").prepend(html); 
  

});
  }
function getPeopleList(url) {  
  
$.getJSON( url+"?cmd=getPeopleList", function( data ) {
  var items = [];
  var html="";
  console.log(data);
  $.each( data, function( key, val ) {
    //items.push(val["typ"]);

    html+="<input type='radio' id='"+val["name"]+"' name='user' value='"+val["ID"]+"' required>";
        html+="<label for='"+val["name"]+"' class='userLabel'>"+val["name"]+"</label><br>";

  });
  $("#form").prepend(html); 
  

});  
}
  
url="https://lm/procedure.php"; 
url="http://ajax1.lmsoft.cz/procedure.php";
//makeAuth();
getTypesList(url);
getPeopleList(url);


//https://jquery-form.github.io/form/examples/
//form submit processing  
var options = {
    beforeSubmit:  showRequest,  // pre-submit callback
    success:       processJson,  // post-submit callback
    dataType:  'json'
  }
  $('form').ajaxForm(options);
  function showRequest(formData, jqForm, options) {
  
  console.log(formData);
  sum=0;
  $.each( formData, function( key, val ) { 
      console.log(val);
      if (val["name"]=="type[]") sum+=parseInt(val["value"]); 
  });
  console.log(sum);
  if (sum<=0) {alert ("zvolte kolik čeho jste vypili");return false}
  
  
  var queryString = $.param(formData);

  console.log('About to submit: \n\n' + queryString);

  return true;
}

// post-submit callback

function processJson(data) {
    console.log(data.msg);
    
    if (data.msg==-1) $("#output1").html("Error");
    else {$("#output1").html("OK"); $("form").hide();} 
}

});//ready