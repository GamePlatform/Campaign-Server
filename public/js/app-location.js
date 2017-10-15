"use strict";
$(document).ready(function(){
	var apps = $('div#apps');
	var locations = $('div#locations');
	var campaigns = $('div#campaigns');

	var appDelBtn = $('button#app-del-btn');
	var locationDelBtn = $('button#location-del-btn');
	var campaignAddBtn = $('button#campaign-add-btn');
	var campaignDelBtn = $('button#campaign-del-btn');

	var appModal = $('div#app_modal');
	var locationModal = $('div#location_modal');
	var campaignModal = $('div#campaign_modal');

	var appDelModal = $('div#app_del_modal');
	var locationDelModal = $('div#location_del_modal');
	var campaignDelModal = $('div#campaign_del_modal');

	var appList = $('#app-list');
	var appTitle = $('#app-title');
	var locationList = $('#location-list');
	var locationInputId = $('#location-id');
	var locationDesc = $('#location-desc');
	var campaignList = $('#campaign-list');

	var appListDelModal = $('#del-modal-app-list');
	var locationListDelModal = $('#del-modal-location-list');
	var campaignListDelModal = $('#del-modal-campaign-list');

	var modalCampaignList = $('#modal-campaign-list');
	var selModalCampaignList = $('#sel-modal-campaign-list');

	var campaignIds = [];
	// var campaignTitle = $('#campaign-title');
	var checkDelModal = 'delModal';

	appDelBtn.on('click',function(e){
		appListDelModal.empty();
		getAppList(checkDelModal);
	});
	// init app-info
	getAppList();

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
	appDelModal.on("click","input[name='ok']",function(e){
		$.ajax({
			url: '/api/apps',
			contentType: "application/json",
			data: JSON.stringify({"app_list": delAppsIdList}),
			method: "DELETE",
			success: function (result) {
				appList.empty();
				appListDelModal.empty();
				appDelModal.hide();
				appDelModal.addClass("hidden");
				locationList.empty();
				campaignList.empty();
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
		if(highlightApp!=null){
			highlightApp.removeClass('highlight');
		}
		var divParent=$(this).closest('li');
		highlightApp=divParent.addClass('highlight');

		appId = $(this).attr("name");
		locationList.empty();
		campaignList.empty();
		getLocationList(appId);
	});
	var delAppIdList = [];
	appListDelModal.on("click","a",function(e){
		delAppIdList.push({"id": $(this).attr("name")});
	});

	// $("input[name='cancel']").on("click",function(e){
	// 	appModal.hide();
	// 	appDelModal.hide();
	// 	locationModal.hide();
	// 	locationDelModal.hide();
	// 	campaignModal.hide();
	// 	campaignDelModal.hide();

	// 	appModal.addClass("hidden");
	// 	appDelModal.addClass("hidden");
	// 	locationModal.addClass("hidden");
	// 	locationDelModal.addClass("hidden");
	// 	campaignModal.addClass("hidden");
	// 	campaignDelModal.addClass("hidden");
	// });

	locationDelBtn.on('click',function(e){
		locationListDelModal.empty();
		getLocationList(appId, checkDelModal);
	});

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

	var delLocationIdList = [];
	locationDelModal.on("click","input[name='ok']",function(e){
		$.ajax({
			url: '/api/apps/'+appId+'/locations',
			contentType: "application/json",
			data: JSON.stringify({
				"location_list": delLocationIdList
			}),
			method: "DELETE",
			success: function (result) {
				locationList.empty();
				locationListDelModal.empty();
				locationDelModal.hide();
				locationDelModal.addClass("hidden");
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

	var locationSeq;

	var highlightLocation = null;

	locationList.on("click","a",function(e){
		var divParent=$(this).closest('div');
		if(highlightLocation != null){
			divParent.removeClass('highlight');
		}
		highlightLocation=divParent.addClass('highlight');

		locationSelectIdValue = $(this).text();
		locationSeq = $(this).attr("name");
		campaignList.empty();
		getCampaignListForLocation(appId,locationSelectIdValue);
	});

	var delLocationIdList = [];
	locationListDelModal.on("click","a",function(e){
		delLocationIdList.push({"seq": $(this).attr("name")});
	});


	campaignAddBtn.on('click',function(e){
		modalCampaignList.empty();
		getCampaignList();
	});
	campaignDelBtn.on('click',function(e){
		campaignListDelModal.empty();
		getCampaignListForLocation(appId, locationSelectIdValue, checkDelModal);
	});

	

	var delCampaignIdList = [];
	campaignDelModal.on("click","a",function(e){
		var selectCampaign = $(this);
		var campaignId = parseInt(selectCampaign.attr('name'));
		delCampaignIdList.push({"campaign_id": campaignId});
	});

	campaignModal.on("click","input[name='ok']",function(e){
		var selCampaigns = []
		var selLi= selModalCampaignList.children();
		var length =selLi.length;
		//console.log(length);
		for(var i=0;i<length;i++){
			selCampaigns.push({"campaign_id":selLi.eq(i).children().attr("name"),"campaign_order":i+1});
		}
		//console.log(selCampaigns);
		
		$.ajax({
			url: '/api/apps/'+appId+'/locations/'
			+locationSelectIdValue+'/campaigns',
			contentType: "application/json",
			data: JSON.stringify({"campaigns":selCampaigns}),
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

	campaignDelModal.on("click","input[name='ok']",function(e){
		$.ajax({
			url: '/api/apps/'+appId+'/locations/'
			+locationSeq+'/campaigns',
			contentType: "application/json",
			data: JSON.stringify({"campaigns":delCampaignIdList}),
			method: "DELETE",
			success: function (result) {
				campaignList.empty();
				campaignListDelModal.empty();
				campaignDelModal.hide();
				campaignDelModal.addClass("hidden");
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

	function getAppList(checkDelModal){
		$.ajax({
			type: "GET",
			url: '/api/apps',
			success: function (result) {
				var count=result.count;
				var appDatas = result.apps;

				if(checkDelModal === undefined){
					for(var i=0;i<count;i++){
						appList.append("<li><a name="+appDatas[i].id+">"+appDatas[i].title+"</a></li>");
					}
				}else if(checkDelModal === 'delModal'){
					for(var i=0;i<count;i++){
						appListDelModal.append("<li><a name="+appDatas[i].id+">"+appDatas[i].title+"</a></li>");
					}
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
					if(i < campaignIds.length){
						idx = campaignIds.map(function(d){ return d.campaign_id; }).indexOf(campaignsData[i].id);
					}else{
						idx = -1;
					}
					camp_order = "";
					if(idx != -1){
						selModalCampaignList.append("<li><a name='"+campaignsData[i].id+"'>"
							+campaignsData[i].camp_desc+"</a></li>");
					}else{
						modalCampaignList.append("<li><a name='"+campaignsData[i].id+"'>"
							+campaignsData[i].camp_desc+"</a></li>");
					}
					//+"<input type='text' name='order' value='"+camp_order+"'></div>
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
	}

	function getLocationList(appId, checkDelModal){
		$.ajax({
			type: "GET",
			url: '/api/apps/'+appId+'/locations',
			success: function (result) {
				var locationDatas = result.result;

				if(checkDelModal === undefined){
					for(var i=0, length = locationDatas.length;i<length;i++){
						locationList.append("<li><a name="+locationDatas[i].seq+">"+locationDatas[i].location_id+"</a></li>");
					}
				}else if(checkDelModal === 'delModal'){
					for(var i=0, length = locationDatas.length;i<length;i++){
						locationListDelModal.append("<li><a name="+locationDatas[i].seq+">"+locationDatas[i].location_id+"</a></li>");
					}
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			}
		});
	}

	function getCampaignListForLocation(appId,locationId, checkDelModal){
		$.ajax({
			type: "GET",
			url: '/api/apps/'+appId+'/locations/'+locationId+'/campaigns',
			success: function (result) {
				var campaignDatas = result.campaigns;

				campaignDatas.sort(function(a,b){
					return a.campaign_order - b.campaign_order;
				});

				campaignIds = [];
				if(checkDelModal === undefined){
					for(var i=0, length = campaignDatas.length;i<length;i++){
						campaignList.append("<li><a>"+campaignDatas[i].camp_desc+"</a></li>");
						campaignIds.push({"campaign_id":campaignDatas[i].campaign_id,"campaign_order":campaignDatas[i].campaign_order});
					}
				}else if(checkDelModal === 'delModal'){
					for(var i=0, length = campaignDatas.length;i<length;i++){
						campaignListDelModal.append("<li><a name="+campaignDatas[i].campaign_id+">"+campaignDatas[i].camp_desc+"</a></li>");
					}
				}
			},
			error: function (e) {
				console.log(JSON.stringify(e));
			},

		});
	}

	$( function() {
		$( "#modal-campaign-list, #sel-modal-campaign-list" ).sortable({
			connectWith: ".connectedSortable"
		}).disableSelection();
	} );
});


