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

	var modalCampaignList = $('#modal-campaign-list');
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
			url: '/api/apps',
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

	var appId;
	var highlightApp
	appList.on("click","a",function(e){
		var divParent=$(this).closest('div');
		if(highlightApp!=null){
			highlightApp.removeClass('highlight');
		}
		highlightApp=divParent.addClass('highlight');

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
	var locationInputId = $('#location-id');
	var locationDesc = $('#location-desc');
	locationModal.on("click","input[name='ok']",function(e){
		var locationInputIdValue = locationInputId.val();
		var locationDescValue = locationDesc.val();
		$.ajax({
			url: '/api/apps/'+appId+'/locations',
			contentType: "application/json",
			data:
			JSON.stringify({
				"locationid":locationInputIdValue,
				"desc":locationDescValue
			}),
			method: "post",
			success: function (result) {
				locationList.empty();
				campaignList.empty();
				getLocationList(appId);
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
		locationInputId.val('');
		locationDesc.val('');
	});

	var locationSelectIdValue;
	var highlightLocation;
	locationList.on("click","a",function(e){
		var divParent=$(this).closest('div');
		if(highlightLocation!=null){
			highlightLocation.removeClass('highlight');
		}
		highlightLocation=divParent.addClass('highlight');

		locationSelectIdValue = $(this).text();
		campaignList.empty();
		getCampaignListForLocation(appId,locationSelectIdValue);
	});

	locationDelBtn.on('click',function(e){

	});


	campaignAddBtn.on('click',function(e){
		if(campaignModal.hasClass("hidden")){
			modalCampaignList.empty();
			getCampaignList();
			campaignModal.show();
			campaignModal.removeClass("hidden");
		}else{
			campaignModal.hide();
			campaignModal.addClass("hidden");
		}
	});

	var campaignList = $('#campaign-list');

	var campaignIds = []
	campaignModal.on("click","a",function(e){
		var divParent=$(this).closest('div');
		if(divParent.hasClass('highlight')){
			divParent.removeClass('highlight');
		}else{
			divParent.addClass('highlight');
		}
		var selectCampaign = $(this);
		var campaignId = parseInt(selectCampaign.attr('name'));
		var campaignOrderInput = selectCampaign.siblings('input[name="order"]').eq(0);

		var campaignOrder = campaignOrderInput.val();
		if(selectCampaign.hasClass('selectedCampaign')){
			var index = campaignIds.map(function(d){ return d.campaign_id; }).indexOf(campaignId);
			selectCampaign.removeClass('selectedCampaign');
			campaignIds.splice(index,1);
			campaignOrderInput.val('');
		}else{
			selectCampaign.addClass('selectedCampaign');
			campaignIds.push({"campaign_id":campaignId,"campaign_order":parseInt(campaignOrder)});
		}
	});

	campaignDelBtn.on('click',function(e){

	});

	campaignModal.on("click","input[name='ok']",function(e){
		$.ajax({
			url: '/api/apps/'+appId+'/locations/'
				+locationSelectIdValue+'/campaigns',
			contentType: "application/json",
			data: JSON.stringify({"campaigns":campaignIds}),
			method: "post",
			success: function (result) {
				campaignList.empty();
				getCampaignListForLocation(appId,locationSelectIdValue);
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
		modalCampaignList.empty();
		campaignModal.hide();
		campaignModal.addClass("hidden");
	});
	

	function getAppList(){
		$.ajax({
			type: "GET",
			url: '/api/apps',
			success: function (result) {
				var count=result.count;
				var appDatas = result.apps;
				for(var i=0;i<count;i++){
					appList.append("<li><div><a name="+appDatas[i].id+">"+appDatas[i].title+"</a></div></li>");
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
			url: '/api/campaigns',
			success: function (result) {
				var count = result.result.count;
				var campaignsData = result.result.campaigns;
				var existCamp = "";
				var idx ="";
				var camp_order = "";
				for(var i = 0; i < count; i++){
					existCamp = "";
					if(i < campaignIds.length){
						idx = campaignIds.map(function(d){ return d.campaign_id; }).indexOf(campaignsData[i].id);
					}else{
						idx = -1;
					}
					camp_order = "";
					if(idx != -1){
						existCamp = "class='highlight'";
						camp_order = campaignIds[idx].campaign_order;
					}
					modalCampaignList.append("<li><div "+existCamp+"><a name='"+campaignsData[i].id+"'>"
						+campaignsData[i].camp_desc+"</a>"
						+"<input type='text' name='order' value='"+camp_order+"'></div></li>");
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
			url: '/api/apps/'+appId+'/locations',
			success: function (result) {
				var locationDatas = result.result;
				for(var i=0, length = locationDatas.length;i<length;i++){
					locationList.append("<li><div><a name="+locationDatas[i].seq+">"+locationDatas[i].location_id+"</a></div></li>");
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
	}

	function getCampaignListForLocation(appId,locationId){
		$.ajax({
			type: "GET",
			url: '/api/apps/'+appId+'/locations/'+locationId+'/campaigns',
			success: function (result) {
				var campaignDatas = result.campaigns;

				campaignDatas.sort(function(a,b){
					return a.campaign_order - b.campaign_order;
				});

				campaignIds = [];
				for(var i=0, length = campaignDatas.length;i<length;i++){
					campaignList.append("<li><a>"+campaignDatas[i].camp_desc+"</a></li>");
					campaignIds.push({"campaign_id":campaignDatas[i].campaign_id,"campaign_order":campaignDatas[i].campaign_order});
				}

			},
			error: function (e) {
				console.log(JSON.stringify(e));
			},

		});
	}
});
