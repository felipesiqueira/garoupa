$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});	
				
		//FUNÇÃO LISTAR EVENTOS

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_raca ORDER BY raca ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				for(var x = 0; x < resultSet.rows.length; x++) 
				{	
					$('#lsRacas tr:last').after('<tr><td>'+resultSet.rows.item(x).raca+'</td><td><a href="editRacas.html?id_raca='+resultSet.rows.item(x).id_raca+'"><img src="img/edit.png" class="iconeTable"></a></td></tr>');
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
		
		var id_raca = getUrlParameter('id_raca');

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_raca WHERE id_raca=?";

			tx.executeSql(query, [id_raca], function (tx, resultSet) 
			{ 
				$("#id_raca").val(resultSet.rows.item(0).id_raca);				
				$("#nomeED").val(resultSet.rows.item(0).raca);
			});
				
		});
	
	});

	//FUNÇÃO CADASTRAR
	$("#incluirRaca").click(function() 
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
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_raca (id_raca INTEGER PRIMARY KEY AUTOINCREMENT, raca text, hash text, user text, sync text)');
					tx.executeSql('INSERT INTO t_raca VALUES (?,?,?,?,?)', [null, nome, hash, user, sync]);
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Raça cadastrada com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});
		}
		else
		{
			navigator.notification.alert('Preencha o campo raca!', alertCallback,  'Notificação', 'OK');	
			$("#nome").focus();			
		}
		
	});
	
	//FUNÇÃO EDITAR
	$("#editarRaca").click(function() 
	{	
		var id        = $("#id_raca").val();
		var nome      = $("#nomeED").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) {                                  

			tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
			{ 
				var hash = resultSet.rows.item(0).hash;				
				var user = resultSet.rows.item(0).usuario;
				
				tx.executeSql('UPDATE t_raca SET raca=?, hash=?, user=? WHERE id_raca=?', [nome, hash, user, id]);
			});			
					
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Raça editada com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});
		}
		else
		{
			navigator.notification.alert('Preencha o campo raça!', alertCallback,  'Notificação', 'OK');	
			$("#nomeED").focus();			
		}		
	});

	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




