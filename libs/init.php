<?php
session_start();
if( !isset( $_SESSION['customQuery'] ) ){
	$_SESSION['customQuery'] = array();
}

require_once( dirname( __FILE__ ).'/functions.php' );
require_once( dirname( __FILE__ ).'/html_functions.php' );

global $ConfIni;
loadIniConf();
?>