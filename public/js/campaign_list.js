$(document).ready(function() {
 var camplist=$("ol#camplist");

  $.ajax({
    type: "GET",
    url:"http://211.253.28.194:30022/api/campaigns",
    success: function(data){
      var result=data.result;
      var campaigns = result.campaigns;
      for(var i=0, length = campaigns.length; i<length;i++){
        var camp_id=campaigns[i].id;
        var camp_desc=campaigns[i].camp_desc;
        camplist.append('<li size=10><a href="#" name="'+camp_id+'">'+camp_desc+'</a></li>');
      }
    }
  });

//캠페인 클릭하면 modal 창 뜨면서 한건에 대해 값 채워넣기.
var modalButton = $("button.morphbutton-open");
camplist.on("click","a",function(){
  var camp_id = $(this).attr("name");
  modalButton.click();
  getCampaignInfo(camp_id);

  return false;
});

});

function getCampaignInfo(id){
  $.ajax({
    type: "GET",
    url:"http://211.253.28.194:30022/api/campaigns/"+id,
    success: function(data){
      var campaign=data.result;
      var camp_id=campaign.id;
      var camp_desc=campaign.camp_desc;
      var camp_title=campaign.title;
      var camp_url=campaign.url;
      var ad_expire_day=campaign.ad_expire_day;
      var start_day=campaign.start_day;
      var end_day=campaign.end_day;

      $("input[name='camp_desc']").val(camp_desc);
      $("input[name='camp_title']").val(camp_title);
      $("input[name='camp_url']").val(camp_url);
      $("input[name='ad_expire_day']").val(ad_expire_day);
      $("input[name='start_day']").val(start_day);
      $("input[name='end_day']").val(end_day);


    }


  });
}

(function($){
  $.fn.extend({
    morphButton: function(options) {

      this.defaultOptions = {};
      var settings = $.extend({}, this.defaultOptions, options);

      return this.each(function() {
        var $this = $(this);
        var $button = $this.find('button.morphbutton-open');
        var $buttonClose = $this.find('button.morphbutton-close');
        var $content = $this.find('.morphbutton-content');

        $content.css({
          top: $this.offset().top,
          left: $this.offset().left,
          width: $this.css('width'),
          height: $this.css('height')
        });

        $button.click(function(){

          $content.css('opacity', 1);

          $content.delay(300).queue(function(){
            $this.addClass('active');
            $(this).dequeue();
          }).delay(500).queue(function(){
            $this.addClass('open');
            $(this).dequeue();
          });

        });

        $buttonClose.click(function(){
          $this.removeClass('active');
          $this.removeClass('open');

          $content.delay(500).queue(function(){
            $content.css('opacity', 0);
            $(this).dequeue();
          });

        });
      });
    }
  });
  //Auto Init
  $(document).ready(function(){
    $(".morphbutton").morphButton();
  });
}(jQuery));
