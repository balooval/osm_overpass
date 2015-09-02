<?php
function queryOSM( $_type, $_west, $_east, $_north, $_south, $_query ){
	global $ConfIni;
	$nodeType = $ConfIni['POIS']['query_'.$ConfIni['POIS'][$_type.'_id']];
	// $url = 'http://www.overpass-api.de/api/interpreter?data=[out:json];node'.$nodeType.'('.round( $_south, 3 ).','.round( $_west, 3 ).','.round( $_north, 3 ).','.round( $_east, 3 ).');out;';
	$url = 'http://www.overpass-api.de/api/interpreter?data=[out:json];node'.html_entity_decode( $_query ).'('.round( $_south, 3 ).','.round( $_west, 3 ).','.round( $_north, 3 ).','.round( $_east, 3 ).');out;';
	$res = file_get_contents( $url );
	return $res;
}

function loadIniConf(){
	global $ConfIni;
	$ConfIni = parse_ini_file( dirname( __FILE__ ).'/../configPoi.ini', true );
	$id = 0;
	while( isset( $ConfIni['POIS']['name_'.$id] ) ){
		$ConfIni['POIS'][$ConfIni['POIS']['name_'.$id].'_id'] = $id;
		$id ++;
	}
}

function getJsPois(){
	global $ConfIni;
	$res = '<script>
		PoisGroupsList = [];
		PoisElementsList = [];
		TypeDefaultActive = [];
		';
		
	$id = 0;
	while( isset( $ConfIni['POIS_GROUPS']['groupe_'.$id] ) ){
		$res .= 'PoisGroupsList.push( "'.$ConfIni['POIS_GROUPS']['groupe_'.$id].'" );';
		$id ++;
	}
	
	$id = 0;
	while( isset( $ConfIni['POIS']['name_'.$id] ) ){
		$res .= 'PoisElementsList.push( { "id":'.$id.', "query":"'.htmlentities( $ConfIni['POIS']['query_'.$id] ).'", "groupe":'.$ConfIni['POIS']['groupe_'.$id].', "desc":"'.$ConfIni['POIS']['desc_'.$id].'", "name":"'.$ConfIni['POIS']['name_'.$id].'", "active":"'.$ConfIni['POIS']['default_activ_'.$id].'"} );';
		$res .= 'TypeDefaultActive.push( "'.$ConfIni['POIS']['default_activ_'.$id].'" );';
		$id ++;
	}
	
	$res .= '</script>';
	return $res;
}


function getJsIcons(){
	$res = '<script>
		IconsFile = [];';
	$icoDir = opendir( dirname( __FILE__ ).'/../img/pois' ) or die('Erreur');
	while( ( $file = readdir( $icoDir ) ) !== false ){
		if( $file != '.' && $file != '..' ){
			if( substr( $file, -3 ) == 'png' ){
				$res .= 'IconsFile.push( "'.$file.'" );';
			}
		}
	}
	closedir( $icoDir );
	$res .= '</script>';
	return $res;
}

?>