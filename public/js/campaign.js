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

    $(function () {
        $(".datepicker").datepicker();
    });

    $(".ad_expire_day").click(function (event) {
        $("#ad_expire_day").html($(this).context.innerHTML + '  <span class="caret"></span>');
        $("#expireDay").val($(this).context.innerHTML);
    });

    $('#ad_expire_day_title').change(function (event) {
        var title = $(this).val();
        $('.ad_expire_day_title').each(function (index) {
            $(this).html('<input type="checkbox">' + title);
        }, this);
    });

    $('#urlTypeurlInput').change(function (event) {
        var src = $(this).val();
        $('.templateThumbnail').each(function (index) {
            $(this).attr("src", src);
        }, this);
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