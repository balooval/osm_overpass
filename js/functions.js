var MapObj;
var MapLat;
var MapLon;
var MapZoom;
var MarkersListType;
var Icons;
var PoisToLoad;
var PoisSelected;
var TypeDefaultActive;
var PoisGroupsList;
var PoisElementsList;
var IconsFile;
var AjaxRequest;
var LastQueryId;
var CustomQueryTabId;



function init(){
	var i;
	PoisSelected = [];

	MapLat=43.795;
	MapLon=4.15;
	MapZoom=14;
	MarkersListType = {};
	Icons = {};
	AjaxRequest = undefined;
	LastQueryId = -1;
	CustomQueryTabId = [];
	
	MapObj = L.map('mapContainer').setView( [MapLat, MapLon], MapZoom );
	var osmStandard   = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Openstreetmap France - Données <a href="http://www.openstreetmap.org/copyright">© les contributeurs OpenStreetMap</a>',
		maxZoom: 20
	});
	
	var cycleMap   = L.tileLayer('http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
		attribution: 'Openstreetmap France - Données <a href="http://www.openstreetmap.org/copyright">© les contributeurs OpenStreetMap</a>',
		maxZoom: 20
	});
	
	var topoMap   = L.tileLayer('http://opentopomap.org/{z}/{x}/{y}.png', {
		attribution: 'map data: © OpenStreetMap contributors, SRTM | map style: © OpenTopoMap (CC-BY-SA)',
		maxZoom: 20
	});
	
	
	var transparentMap   = L.tileLayer('http://www.opensnowmap.org/opensnowmap-overlay/{z}/{x}/{y}.png', {
		attribution: 'Openstreetmap France - Données <a href="http://www.openstreetmap.org/copyright">© les contributeurs OpenStreetMap</a>',
		maxZoom: 20
	});
	
	
	
	var baseMaps  = {
		"Mapnik": osmStandard, 
		"OpenTopoMap": topoMap, 
		"Cycle Map": cycleMap
	};
	
	var extMaps  = {
		"Hillshading": transparentMap
	};
	L.control.layers( baseMaps, extMaps ).addTo( MapObj );
	MapObj.addLayer( osmStandard );
	MapObj.on( 'moveend', function(e) {
		queryPois();
	});
	
	PoisToLoad = [];
	
	makePoisGroupsMenu();
	makePoisElementsMenu();
	
	for( i = 0; i < PoisElementsList.length; i ++ ){
		MarkersListType['MARKERS_'+PoisElementsList[i]["id"]] = [];
		Icons['ICO_'+PoisElementsList[i]["id"]] = L.icon({
			iconUrl: 'img/pois/'+PoisElementsList[i]["name"]+'.png',
			iconSize: [24, 24],
			iconAnchor: [10, 24],
			popupAnchor: [0, -30]
			});
		if( PoisElementsList[i]["active"] == 1 ){
			$("#choice_"+PoisElementsList[i]["id"]).prop('checked', true );
			activatePoi( PoisElementsList[i]["id"], true );
		}
	}
	
	queryPois();
	
	$('input.poiGroupeCheckbox:checkbox').change(function () {
		var check = $(this).prop('checked');
		activateGroupOfPois( $(this).data( 'groupe' ), check);
	});
	
	$('input.poiTypeCheckbox:checkbox').change(function () {
		onPoiCheckChange( $(this).data( 'poiid' ), $(this).prop('checked'), $(this).data( 'query' ) );
	});
	
	
	loadCustomsQuery();
}


function onPoiCheckChange( _poiId, _checked, _query ){
	log( "onPoiCheckChange " + _poiId + ", " + _checked + ', ' + _query );
	activatePoi( _poiId, _checked );
	loadNextPoiType();
}


function activateGroupOfPois( _groupeId, _state ){
	$("#poiGroupe_" + _groupeId).children().find(".poiTypeCheckbox").prop('checked', _state );
	$("#poiGroupe_" + _groupeId).find(".poiSelectorElement").find("[data-groupe='" + _groupeId + "']").each( function( index){
		activatePoi( $( this ).data( 'poiid' ), _state );
	});
	loadNextPoiType();
}


function getPoiIndexjFromId( _id ){
	var i = 0;
	for( i = 0; i < PoisElementsList.length; i ++ ){
		if( PoisElementsList[i]['id'] == _id ){
			return i;
		}
	}
}

function activatePoi( _id, _state ){
	var i = getPoiIndexjFromId( _id );
	var poiName = PoisElementsList[i]["name"];
	if( _state ){
		if( $.inArray( _id, PoisSelected) < 0 ){
			PoisSelected.push( _id );
			PoisToLoad.push( _id );
			$("#label_"+_id).addClass( "selected" );
		}
	}else{
		clearMarkers( _id );
		$("#label_"+_id).removeClass( "selected" );
		for( var i = 0; i < PoisSelected.length; i ++ ){
			if( PoisSelected[i] == _id ){
				PoisSelected.splice( i, 1 );
				$("#infos_" + _id).text( '' );
				break;
			}
		}
	}
}


function makePoisGroupsMenu(){
	var i;
	for( i = 0; i < PoisGroupsList.length; i ++ ){
		$("#mapTools").append( '<div id="poiGroupe_'+i+'" class="poiGroupeBox"><div class="title"><input type="checkbox" data-groupe="'+i+'" class="poiGroupeCheckbox" name="poiGroupe_'+i+'" id="poiGroupe_'+i+'" /> '+PoisGroupsList[i]+'</div></div>' );
	}
	
	$("#mapTools").append( '<div id="poiGroupe_9999" class="poiGroupeBox"><div class="title"><input type="checkbox" data-groupe="9999" class="poiGroupeCheckbox" name="poiGroupe_9999" id="poiGroupe_9999" /> Personalisé</div><div class="poiSelectorElement addPoi"><div class="container"><span style="position:relative;"><img width="24" onclick="icoChoice();" src="img/pois/poi.png" alt="poi" title="change icon" id="icoPoiPreview" /><div id="icosList"></div></span> <input id="customQuery" type="text" size="10" name="customQuery" placeholder="[key=value]" value="" /> <input type="hidden" name="poiIcoId" id="poiIcoId" value="0" /> <img id="imgAddQuery" width="16" src="img/add.png" alt="add" title="ajouter" onClick="submitCustomQuery();" /></div></div></div>' );
}


function icoChoice(){
	$("#icosList").html( '' );
	var i;
	for( i = 0; i < IconsFile.length; i ++ ){
		$("#icosList").append( '<img onclick="selectIco('+i+');return false;" width="24" src="img/pois/'+IconsFile[i]+'" alt="'+IconsFile[i]+'" />' );
	}
	if( $("#icosList").css( 'display' ) == 'none' ){
		showIcoChoice( true );
	}else{
		showIcoChoice( false );
	}
}

function selectIco( _id ){
	$("#poiIcoId").val( _id );
	$("#icoPoiPreview").attr( 'src', 'img/pois/' + IconsFile[_id] );
	showIcoChoice( false );
}


function showIcoChoice( _state ){
	if( _state ){
		$("#icosList").css( 'display', 'block' );
	}else{
		$("#icosList").css( 'display', 'none' );
	}
}


function makePoisElementsMenu(){
	var i;
	for( i = 0; i < PoisElementsList.length; i ++ ){
		$("#poiGroupe_"+PoisElementsList[i]["groupe"]).append( '<div class="poiSelectorElement"><label class="container" title="'+PoisElementsList[i]["query"]+'" id="label_'+PoisElementsList[i]["id"]+'"><input class="poiTypeCheckbox" type="checkbox" name="query_element" id="choice_'+PoisElementsList[i]["id"]+'" data-groupe="'+PoisElementsList[i]["groupe"]+'" data-query="'+htmlentities( PoisElementsList[i]["query"] )+'" data-poiid="'+PoisElementsList[i]["id"]+'" value="1" /> <img width="24" src="img/pois/'+PoisElementsList[i]["name"]+'.png" alt="'+PoisElementsList[i]["name"]+'" title="'+PoisElementsList[i]["name"]+'" /> '+PoisElementsList[i]["desc"]+' <span id="infos_'+PoisElementsList[i]["id"]+'"></span></label></div>' );
		if( LastQueryId < PoisElementsList[i]["id"] ){
			LastQueryId = PoisElementsList[i]["id"];
		}
	}
}


function loadCustomsQuery(){
	if( sessionStorage.getItem( 'QUERY_TAB' ) ){
		CustomQueryTabId = JSON.parse( sessionStorage.getItem( 'QUERY_TAB' ) );
		for( var i = 0; i < CustomQueryTabId.length; i ++ ){
			MarkersListType['MARKERS_'+CustomQueryTabId[i]] = [];
			addCustomQuery( JSON.parse( sessionStorage.getItem( 'CUSTOM_QUERY_'+CustomQueryTabId[i] ) ) );
			
			if( LastQueryId < CustomQueryTabId[i] ){
				LastQueryId = CustomQueryTabId[i];
			}
		}
	}

	console.log( "LastQueryId: " + LastQueryId );
}


function submitCustomQuery(){
	LastQueryId ++;
	var id = LastQueryId;
	var customQuery = { 'id':id, 'query':htmlentities( $("#customQuery").val() ), 'groupe':9999, 'desc':'desc_perso', 'name':'name_perso_'+id, 'active':0, 'icoId':$("#poiIcoId").val() };
	sessionStorage.setItem( 'CUSTOM_QUERY_'+id, JSON.stringify( customQuery ) );
	
	CustomQueryTabId.push( id );
	sessionStorage.setItem( 'QUERY_TAB', JSON.stringify( CustomQueryTabId ) );
	console.log( "CustomQueryTabId " + CustomQueryTabId );
	
	addCustomQuery( customQuery );
}



function deleteCustomQuery( _id ){
	var i;
	console.log( "deleteCustomQuery " + _id );
	// log( "Delete custom query " + PoisElementsList[_id]['query'] );
	$("#queryCOntainer_"+_id).remove();
	sessionStorage.removeItem( 'CUSTOM_QUERY_'+_id );
	
	
	for( i = 0; i < PoisElementsList.length; i ++ ){
		if( PoisElementsList[i]['id'] == _id ){
			PoisElementsList.splice( i, 1 );
		}
	}
	
	
	for( i = 0; i < CustomQueryTabId.length; i ++ ){
		if( CustomQueryTabId[i] == _id ){
			CustomQueryTabId.splice( i, 1 );
			break;
		}
	}
	sessionStorage.setItem( 'QUERY_TAB', JSON.stringify( CustomQueryTabId ) );
}


function addCustomQuery( _query ){
	log( "Add query : " + _query['query'] );
	var id = _query['id'];
	PoisElementsList.push( _query );
	$("#poiGroupe_9999").append( '<div class="poiSelectorElement" id="queryCOntainer_'+id+'"><label class="container" title="'+_query['query']+'" id="label_'+id+'"><img onclick="deleteCustomQuery('+id+');" width="16" src="img/delete.png" alt="delete" title="delete poi" /> <input class="poiTypeCheckbox" onchange="onPoiCheckChange('+id+', this.checked, \''+htmlentities( _query['query'] )+'\');" type="checkbox" name="query_element" id="choice_'+id+'" data-groupe="9999" data-poiid="'+id+'" data-query="'+htmlentities( _query['query'] )+'" value="1" /> <img width="24" src="img/pois/'+IconsFile[_query['icoId']]+'" /> '+_query['query']+' <span id="infos_'+id+'"></span></label></div>' );
	
	MarkersListType['MARKERS_'+id] = [];
	
	Icons['ICO_'+id] = L.icon({
				iconUrl: 'img/pois/'+IconsFile[_query['icoId']]+'',
				iconSize: [24, 24],
				iconAnchor: [10, 24],
				popupAnchor: [0, -30]
				});
	
	// console.log( Icons['ICO_'+id] );
}


function queryPois(){
	if( MapObj.getZoom() > 11 ){
		var i;
		for( i = 0; i < PoisSelected.length; i ++ ){
			PoisToLoad.push( PoisSelected[i] );
		}
		loadNextPoiType();
	}else{
		log( "Please zoom-in :/" );
	}
}


function loadNextPoiType(){
	var poiToLoad;
	var poiQuery;
	var poiIdToLoad;
	var i;
	if( PoisToLoad.length > 0 ){
		if( AjaxRequest != undefined ){
			// AjaxRequest.abort();
		}
		poiIdToLoad = PoisToLoad.shift();
		var index = getPoiIndexjFromId( poiIdToLoad );
		poiToLoad = PoisElementsList[index]["name"]
		poiQuery = PoisElementsList[index]["query"]
		log( 'loading ' + poiToLoad + '...' );
		$("#infos_"+poiIdToLoad).html( '<img width="20" src="img/loading.gif" alt="loading" title="loading" />' );
		AjaxRequest = $.ajax({
			type: "GET",
			url: 'libs/ajax_req.php',
			dataType: "json",
			data: { queryOSM:1, poiType:poiToLoad, poiQuery:poiQuery, south:MapObj.getBounds().getSouth(), west:MapObj.getBounds().getWest(), north:MapObj.getBounds().getNorth(), east:MapObj.getBounds().getEast() },
			success: function( res ){
				clearMarkers( poiIdToLoad );
				if( res['elements'].length > 0 ){
					log( res['elements'].length + " " + poiToLoad + " founds" );
				}else{
					log( res['elements'].length + " " + poiToLoad + " founds", 'error' );
				}
				$("#infos_"+poiIdToLoad).html( '('+res['elements'].length+')' );
				for( i = 0; i < res['elements'].length; i ++ ){
					placeMarker( poiIdToLoad, poiToLoad, res['elements'][i]['lat'], res['elements'][i]['lon'], res['elements'][i]['tags'] );
				}
				loadNextPoiType();
			}
		});
	}
}


function clearMarkers( _id ){
	for( i = 0; i < MarkersListType["MARKERS_"+_id].length; i ++ ){
		MapObj.removeLayer( MarkersListType["MARKERS_"+_id][i] );
	}
	MarkersListType["MARKERS_"+_id] = [];
}


function placeMarker( _id, _type, _lat, _lon, _tags ){
	var marker = L.marker([_lat, _lon], {icon: Icons['ICO_'+_id], riseOnHover:true, title:_type }).addTo( MapObj );
	var popupContent = _type + ' informations<br />';
	marker.bindPopup( parsePoisTags( _tags ) );
	MarkersListType["MARKERS_"+_id].push( marker );
}


function parsePoisTags( _tags ){
	var res = '';
	for( var tag in _tags ){
		if( tag == 'image' ){
			res += '<a href="'+_tags["image"]+'"><img width="150" src="' + _tags["image"] + '" /></a><br />';
		}else{
			res += tag + ' : ' + _tags[tag] + '<br />';
		}
	}
	return res;
}


function showConsole( _state ){
	if( _state ){
		$("#console").css( "display", "block" );
		$("#consoleReveal").css( "display", "none" );
	}else{
		$("#console").css( "display", "none" );
		$("#consoleReveal").css( "display", "block" );
	}
}


function log( _msg, _level ){
	// console.log( _msg );
	if (typeof _level === 'undefined') { _level = 'default'; }
	var i;
	var maxLines = 20;
	var levelClass = '';
	var logLines = $("#console").html().split(/<br>/);
	while( logLines.length > maxLines ){
		logLines.shift();
	}
	$("#console").html( '' );
	for( i = 0; i < logLines.length; i ++ ){
		$("#console").append( logLines[i] + '<br>' );
	}
	
	
	if( _level == 'error' ){
		levelClass = 'error';
	}
	
	$("#console").append( '- <span class="'+levelClass+'">'+_msg + '</span>' );
}


function htmlentities( str ) {
	return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
