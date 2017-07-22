"use strict";
$(document).ready(function(){
	var apps = $('div#apps');
	var locations = $('div#locations');
	var campaigns = $('div#campaigns');
	var appAddBtn = $('button#app-add-btn');
	var appDelBtn = $('button#app-del-btn');
	var locationAddBtn = $('button#location-add-btn');
	var locationDelBtn = $('button#location-del-btn');
	var campaignAddBtn = $('button#campaign-add-btn');
	var campaignDelBtn = $('button#campaign-del-btn');
	var appModal = $('div#app_modal');
	var locationModal = $('div#location_modal');
	var campaignModal = $('div#campaign_modal');

	var enrollCampaignList = $('#enroll-campaign-list');
	var campaignList = $('#campaign-list');
	// var campaignTitle = $('#campaign-title');

	appAddBtn.on('click',function(e){
		if(appModal.hasClass("hidden")){
			appModal.show();
			appModal.removeClass("hidden");
		}else{
			appModal.hide();
			appModal.addClass("hidden");
		}
	});
	// init app-info
	getAppList();

	var appList = $('#app-list');
	var appTitle = $('#app-title');
	appModal.on("click","input[name='ok']",function(e){
		var app_info = []
		var appValue = appTitle.val();
		app_info.push({"title":appValue});
		$.ajax({
			url: 'http://localhost:30022/api/apps',
			contentType: "application/json",
			data: JSON.stringify({"app_info":app_info}),
			method: "post",
			success: function (result) {
				appList.empty();
				getAppList();
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
		appTitle.val('');
	});

	var campaignIds = []
	campaignModal.on("click","a",function(e){
		// console.log(selectedCampaign);
		var selectCampaign = $(this);
		var campaignId = selectCampaign.attr('name');

		console.log(campaignId);
		if(selectCampaign.hasClass('checked')){
			selectCampaign.removeClass('checked');
			campaignIds.splice(campaignId);
		}else{
			selectCampaign.addClass('checked');
			campaignIds.push(campaignId);
		}
	});

	// campaignModal.on("click","input[name='ok']",function(e){
	// 	var campaign_info = []
	// 	var campaignValue = appTitle.val();
	// 	campaign_info.push({"title":appValue});
	// 	$.ajax({
	// 		url: 'http://localhost:30022/api/apps',
	// 		contentType: "application/json",
	// 		data: JSON.stringify({"app_info":app_info}),
	// 		method: "post",
	// 		success: function (result) {
	// 			appList.empty();
	// 			getAppInfo();
	// 		},
	// 		error: function (e) {
	// 			console.log(JSON.stringify(e));
	// 		}
	// 	});
	// 	appTitle.val('');
	// });
	var appId;
	appList.on("click","a",function(e){
		appId = $(this).attr("name");
		locationList.empty();
		campaignList.empty();
		getLocationList(appId);
	});

	$("input[name='cancel']").on("click",function(e){
		appModal.hide();
		locationModal.hide();
		campaignModal.hide();
		appModal.addClass("hidden");
		locationModal.addClass("hidden");
		campaignModal.addClass("hidden");
	});

	appDelBtn.on('click',function(e){

	});

	locationAddBtn.on('click',function(e){
		if(locationModal.hasClass("hidden")){
			locationModal.show();
			locationModal.removeClass("hidden");
		}else{
			locationModal.hide();
			locationModal.addClass("hidden");
		}
	});

	var locationList = $('#location-list');
	var locationId = $('#location-id');
	var locationDesc = $('#location-desc');
	locationModal.on("click","input[name='ok']",function(e){
		var locationIdValue = locationId.val();
		var locationDescValue = locationDesc.val();
		$.ajax({
			url: 'http://localhost:30022/api/apps/'+appId+'/locations',
			contentType: "application/json",
			data:
			JSON.stringify({
				"locationid":locationIdValue,
				"desc":locationDescValue
				}),
			method: "post",
			success: function (result) {
				locationList.empty();
				campaginList.empty();
				getLocationList(appId);
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
		locationId.val('');
		locationDesc.val('');
	});

	locationList.on("click","a",function(e){
		locationId = $(this).text();
		campaignList.empty();
		getCampaignList(appId,locationId);
	});

	locationDelBtn.on('click',function(e){

	});


	campaignAddBtn.on('click',function(e){
		if(campaignModal.hasClass("hidden")){
			getCampaignList();
			campaignModal.show();
			campaignModal.removeClass("hidden");
		}else{
			campaignModal.hide();
			campaignModal.addClass("hidden");
		}
	});

	var campaignList = $('#campaign-list');
	var campaignIDs = [];
	campaignDelBtn.on('click',function(e){

	});


	function getAppList(){
		$.ajax({
			type: "GET",
			url: 'http://localhost:30022/api/apps',
			success: function (result) {
				var count=result.count;
				var appDatas = result.apps;
				for(var i=0;i<count;i++){
					appList.append("<li><a name="+appDatas[i].id+">"+appDatas[i].title+"</a></li>");
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
	}

	function getCampaignList(){
		$.ajax({
			type: "GET",
			url: 'http://localhost:30022/api/campaigns',
			success: function (result) {
				var count = result.result.count;
				var campaignsData = result.result.campaigns;
				for(var i = 0; i < count; i++){
					campaignList.append("<li><a name="+campaignsData[i].id+">"+campaignsData[i].title+"</a></li>");
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
	});
}

function getLocationList(appId){
	$.ajax({
		type: "GET",
		url: 'http://localhost:30022/api/apps/'+appId+'/locations',
		success: function (result) {
			var locationDatas = result.result;
			for(var i=0, length = locationDatas.length;i<length;i++){
				locationList.append("<li><a name="+locationDatas[i].seq+">"+locationDatas[i].location_id+"</a></li>");
			}
		},
		error: function (e) {
			console.log(JSON.stringify(e));
		}
	});
}
function getCampaignList(appId,locationId){
		$.ajax({
			type: "GET",
			url: 'http://localhost:30022/api/apps/'+appId+'/locations/'+locationId+'/campaigns',
			success: function (result) {
				var campaignDatas = result.campaigns;
				campaignIDs = [];
				for(var i=0, length = campaignDatas.length;i<length;i++){
					campaignList.append("<li><a>"+campaignDatas[i].camp_desc+"</a></li>");
					campaignIDs.push(campaignDatas[i].id);
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
	}
});
