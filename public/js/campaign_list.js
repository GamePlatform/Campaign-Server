$(document).ready(function() {
  var camplist=$("ol#camplist");

  $(".datepicker").val(getTimeStamp(new Date()));
  $(".datepicker").datetimepicker({
    format: 'yyyy-mm-dd hh:ii:ss'
  });

  var camp_size;
  var pages;
  $.ajax({
    type: "GET",
    url:"http://211.253.28.194:30022/api/campaigns/size",
    success: function(data){
      camp_size=data.result.camp_size;
      pages=camp_size%20+1
    }

  });

  $('#pagination-demo').twbsPagination({
    totalPages:pages,
    onPageClick: function (event, page) {
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

function getTimeStamp(d) {
  // var d = new Date();
  var s =
  leadingZeros(d.getFullYear(), 4) + '-' +
  leadingZeros(d.getMonth() + 1, 2) + '-' +
  leadingZeros(d.getDate(), 2) + ' ' +
  leadingZeros(d.getHours(), 2) + ':' +
  leadingZeros(d.getMinutes(), 2) + ':' +
  leadingZeros(d.getSeconds(), 2);
  return s;
}

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();
  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
    zero += '0';
  }
  return zero + n;
}

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
      var start_date=campaign.start_date;
      var end_date=campaign.end_date;

      $("input[name='camp_desc']").val(camp_desc);
      $("input[name='camp_title']").val(camp_title);
      $("input[name='camp_url']").val(camp_url);
      $("input[name='ad_expire_day']").val(ad_expire_day);
      $("input[name='start_date']").val(getTimeStamp(new Date(start_date)));
      $("input[name='end_date']").val(getTimeStamp(new Date(end_date)));


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
