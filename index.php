<?php
require_once( dirname( __FILE__ ).'/libs/init.php' );
echo getJsPois();
echo htmlHeader();
?>
	<div id="header">
		POIs viewer
	</div>
	<div id="mainContainer">
		<div id="mapTools">
			
		</div>
		<div id="mapContainer">
		</div>
		<div id="console">
			<div id="consoleHeader" onclick="showConsole( false );" title="hide console">
				&gt;&gt;&gt;&gt;
			</div>
			ready
		</div>
		
		
		<div id="consoleReveal" onclick="showConsole( true );">
			<img src="img/console.png" alt="console" title="view console" />
		</div>
	</div>
	
	
	<div style="color:#FFF;">
		
	</div>
	
<?php
echo getJsIcons();
echo htmlFooter();
?>