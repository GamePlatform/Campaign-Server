$(document).ready(function() {

  $.ajax({
    type: "GET",
    url:"http://211.253.28.194:30022/api/campaigns",
    success: function(data){
      var result=data.result;
      var campaigns = result.campaigns;
      for(var i=0, length = campaigns.length; i<length;i++){
        var camp_id=campaigns[i].id;
        var camp_desc=campaigns[i].camp_desc;
        $("#camplist").append('<li size=10><a>'+camp_desc+'</a></li>');
      }
    }


  });

});
