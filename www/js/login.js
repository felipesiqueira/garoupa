$(document).ready(function()
{
	var db;
	document.addEventListener('deviceready', function() 
	{
		db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});
	});	
	
	$("#login").click(function() 
	{	
		var fazenda = $("#fazenda").val();

		if(fazenda != '')
		{
			db.transaction(function(tx) 
			{
				tx.executeSql('DROP TABLE IF EXISTS t_fazenda_atual');
			}, function(error) {
			alert('Transaction ERROR: ' + error.message);
			}, function() {

			});			
			
			
			db.transaction(function(tx, results) 
			{
				tx.executeSql('CREATE TABLE IF NOT EXISTS t_fazenda_atual (id_fazenda text)');
				tx.executeSql('INSERT INTO t_fazenda_atual VALUES (?)', [fazenda]);		
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			location.href='menu.html';
			});					
		}
		else
		{
			navigator.notification.alert('Selecione a fazenda!', alertCallback,  'Notificação', 'OK');	
			$("#fazenda").focus();			
		}
	});
	
	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
});	