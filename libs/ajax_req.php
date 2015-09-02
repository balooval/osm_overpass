<?php
require( dirname( __FILE__ ).'/init.php' );

$res = '';

if( isset( $_GET['queryOSM'] ) ){
	$res = queryOSM( $_GET['poiType'], $_GET['west'], $_GET['east'], $_GET['north'], $_GET['south'], $_GET['poiQuery'] );
	
}else if( isset( $_GET['postCustomQuery'] ) ){
	$_SESSION['customQuery'][] = $_GET['query'];
	$objId = 9999 + count( $_SESSION['customQuery'] );
	$res = json_encode( array( 'RESULT'=>'OK', 'QUERY'=>$_GET['query'], 'ID'=>$objId ) );

}else if( isset( $_GET['debug'] ) ){
	if( $_GET['cmd'] == 'clearSession' ){
		$_SESSION['customQuery'] = array();
		$res = json_encode( array( 'RESULT'=>'OK' ) );
	}
}

header( 'Content-Type:application/json' );
echo $res;
?>