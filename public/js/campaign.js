$(document).ready(function () {
    // DOM 생성 완료 시 화면 숨김 (파라미터로 전달되는 id는 제외)

    var template = "template";
    // 체크 되어 있는지 확인
    if (!$("input[name=" + template + "]:checked").size()) {
        // default radio 체크 (첫 번째)
        $("input[name=" + template + "]").eq(0).attr("checked", true);
        hideExclude(template, $("input[name=" + template + "]").val());
    }

    // radio change 이벤트
    $("input[name=" + template + "]").change(function () {
        hideExclude(template, $(this).val());
    });

    var urlType = "urlType";
    // 체크 되어 있는지 확인
    if (!$("input[name=" + urlType + "]:checked").size()) {
        // default radio 체크 (첫 번째)
        $("input[name=" + urlType + "]").eq(0).attr("checked", true);
        hideExclude(urlType, $("input[name=" + urlType + "]").val());
    }

    // radio change 이벤트
    $("input[name=" + urlType + "]").change(function () {
        hideExclude(urlType, $(this).val());
    });

    $(".datepicker").val(getTimeStamp(new Date()));
    $(".datepicker").datetimepicker({
        format: 'yyyy-mm-dd hh:ii:ss'
    });
    // $(".datepicker").datepicker("option", "dateFormat", "yy-mm-dd");
    // $(".datepicker").change(function (event) {
    //     $(this).val(getTimeStamp($(this).val));
    // });

    /*
    $(function () {
        $(".datepicker").datepicker();
    });
    */

    $(".ad_expire_day").click(function (event) {
        $("#ad_expire_day").html($(this).context.innerHTML);
        $("input[name=ad_expire_day]").val($(this).context.innerHTML);
    });

    $('#ad_expire_day_title').change(function (event) {
        var title = $(this).val();
        $('.ad_expire_day_title').each(function (index) {
            $(this).html(title);
        }, this);
    });

    $('#urlTypeurlInput').change(function (event) {
        var src = $(this).val();
        $('.templateThumbnail').each(function (index) {
            $(this).attr("src", src);
        }, this);
    });

    $(".ratio").click(function (event) {
        $("#ratio").html($(this).context.innerHTML);
        $("input[name=ratio]").val($(this).parents("li").index());
    });

    var urlPath="image";
    $("input[name=urlType]").click(function (e){
        urlPath=$(this).val();
    });

    $("#submit").click(function (event) {
        var ratioArr = [
            [0, 0],
            [500, 500]
        ];
        var ratio = ratioArr[$("input[name=ratio]").val()];
        if ((ratio == null) || (typeof ratio == 'undefined')) {
            alert('창 크기를 선택해주세요.');
            return false;
        }
        var param = {
            'writer': $("input[name=writer]").val(), 
            'template': $("input[name=template]:checked").val(),
            'ratio_x': ratio[0],
            'ratio_y': ratio[1],
            'is_url': $("input[name=locationType]:checked").val(),
            'redirect_location': $("input[name=redirect_location]").val(),
            'title': $("input[name=title]").val(),
            'desc': $("input[name=desc]").val(),
            'expireDay': $("input[name=ad_expire_day]").val(),
            'urlType': $("input[name=urlType]:checked").val(),
            'uploadImage': $("input[name=uploadImage]")[0].files[0],
            'url': $("input[name=url]").val(),
            'startDate': $("input[name=startDate]").val(),
            'endDate': $("input[name=endDate]").val(),
        };

        var formData = new FormData();

        for (var key in param) {
            if ((param[key] == null) ||
                (typeof param[key] == 'undefined') ||
                (typeof param[key] == "string" && !param[key].length)) {
                alert(key + '항목을 입력해주세요.');
                formData.remove();
                return false;
            }
            formData.append(key,param[key]);
        }
    
        $.ajax({
            type: "POST",
            url: '/api/campaigns/'+urlPath,
            processData: false,
            contentType: false,
            data: formData,
            success: function (e) {
                console.log(e);
                window.location.reload();
            },
            error: function (e) {
                alert(JSON.stringify(e));
            }
        });
        return false;
    });
});

// text area 숨김
function hideExclude(upperDiv, excludeId) {
    $("#" + upperDiv).children().each(function () {
        $(this).hide();
    });
    // 파라미터로 넘겨 받은 id 요소는 show
    $("#" + upperDiv + excludeId).show();
}

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