<?php
function htmlHeader(){
	$res = '<html>
		<head>
			<meta charset="utf-8">
			<title>OSM Garrigues</title>
			<link rel="stylesheet" href="css/styles.css" type="text/css" />
			<link rel="stylesheet" href="js/leaflet/leaflet.css" type="text/css" />
			<script src="js/jquery-2.1.4.min.js"></script>
			<script src="js/leaflet/leaflet.js"></script>
			<script src="js/functions.js"></script>
		</head>
		<body onload="init();">
			<div id="main">';
	return $res;
}


function htmlFooter(){
	$res = '</div>
		</body>
	</html>';
	return $res;
}
?>