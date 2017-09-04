$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});	
				
		//FUNÇÃO LISTAR EVENTOS

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_eventos_sanitarios ORDER BY evento_sanitario ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				for(var x = 0; x < resultSet.rows.length; x++) 
				{	
					$('#lsEventos tr:last').after('<tr><td>'+resultSet.rows.item(x).evento_sanitario+'</td><td><a href="editEventoSanitario.html?id_evento_sanitario='+resultSet.rows.item(x).id_evento_sanitario+'"><img src="img/edit.png" class="iconeTable"></a></td></tr>');
				}
			});
				
		});			  
		
		
		var getUrlParameter = function getUrlParameter(sParam) 
		{
			var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('?'),
			sParameterName,
			i;

			for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
			}
			}
		};
		
		var id_evento_sanitario = getUrlParameter('id_evento_sanitario');

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_eventos_sanitarios WHERE id_evento_sanitario=?";

			tx.executeSql(query, [id_evento_sanitario], function (tx, resultSet) 
			{ 
				$("#id_evento_sanitario").val(resultSet.rows.item(0).id_evento_sanitario);				
				$("#nomeED").val(resultSet.rows.item(0).evento_sanitario);
			});
				
		});
	
	});

	//FUNÇÃO CADASTRAR
	$("#incluirEventoSanitario").click(function() 
	{	
		var nome = $("#nome").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_eventos_sanitarios (id_evento_sanitario INTEGER PRIMARY KEY AUTOINCREMENT, evento_sanitario text, hash text, user text, sync text)');
					tx.executeSql('INSERT INTO t_eventos_sanitarios VALUES (?,?,?,?,?)', [null, nome, hash, user, sync]);		
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Evento cadastrado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});			
		}
		else
		{
			navigator.notification.alert('Preencha o campo nome!', alertCallback,  'Notificação', 'OK');	
			$("#nome").focus();			
		}
		
	});
	
	//FUNÇÃO EDITAR
	$("#editarEventoSanitario").click(function() 
	{	
		var id        = $("#id_evento_sanitario").val();
		var nome      = $("#nomeED").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) {                                  

			tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
			{ 
				var hash = resultSet.rows.item(0).hash;				
				var user = resultSet.rows.item(0).usuario;
				
				tx.executeSql('UPDATE t_eventos_sanitarios SET evento_sanitario=?, hash=?, user=? WHERE id_evento_sanitario=?', [nome, hash, user, id]);
			});			
					
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Evento editado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});			
		}
		else
		{
			navigator.notification.alert('Preencha o campo evento!', alertCallback,  'Notificação', 'OK');	
			$("#nomeED").focus();			
		}		
	});

	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




