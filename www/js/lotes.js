$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});	
				
				
		//LISTAR ANIMAL
		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_animais ORDER BY brinco ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				for(var x = 0; x < resultSet.rows.length; x++) 
				{		
					$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animais");
					$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animaisED");
				}
			});	
		});
		
				
		//FUNÇÃO LISTAR LOTES

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_lotes";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				for(var x = 0; x < resultSet.rows.length; x++) 
				{	
					$('#lsLotes tr:last').after('<tr><td>'+resultSet.rows.item(x).lote+'</td><td><a href="editLote.html?id_lote='+resultSet.rows.item(x).id_lote+'"><img src="img/edit.png" class="iconeTable"></a></td></tr>');
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
		
		var id_lote = getUrlParameter('id_lote');

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_lotes WHERE id_lote=?";

			tx.executeSql(query, [id_lote], function (tx, resultSet) 
			{ 
				$("#id_lote").val(resultSet.rows.item(0).id_lote);				
				$("#nomeED").val(resultSet.rows.item(0).lote);
			});
				
		});
		
		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

			tx.executeSql(query, [id_lote], function (tx, resultSet) 
			{ 
				for(var x = 0; x < resultSet.rows.length; x++) 
				{	
					$("#animaisED option[value='" + resultSet.rows.item(x).id_animal + "']").prop("selected", true);
				}
			});			
		});
   
	});

	//FUNÇÃO CADASTRAR
	$("#incluirLote").click(function() 
	{	
		var nome     = $("#nome").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotes (id_lote INTEGER PRIMARY KEY AUTOINCREMENT, lote text, data date default CURRENT_DATE, hash text, user text, sync text)');
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text)');
					tx.executeSql('INSERT INTO t_lotes VALUES (?,?,?,?,?,?)', [null, nome, null, hash, user, sync]);

					var query = "SELECT * FROM t_lotes ORDER BY id_lote DESC LIMIT 1";

					tx.executeSql(query, [], function (tx, resultSet) 
					{ 
						var insertID = resultSet.rows.item(0).id_lote;
						
						var selO = document.getElementById('animais');
						var selValues = [];
						
						for(i=0; i < selO.length; i++)
						{
							if(selO.options[i].selected)
							{
								tx.executeSql('INSERT INTO t_lotesxanimal VALUES (?,?,?,?,?)', [insertID, selO.options[i].value, hash, user, sync]);	
							}
						}
					});	
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Lote cadastrado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});				

		}
		else
		{
			navigator.notification.alert('Preencha o campo nome!', alertCallback,  'Notificação', 'OK');	
			$("#nome").focus();			
		}
		
	});
	
	//FUNCAO EDITAR
	$("#editarLote").click(function() 
	{	
		var id        = $("#id_lote").val();
		var nome      = $("#nomeED").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('UPDATE t_lotes SET lote=?, hash=?, user=? WHERE id_lote=?', [nome, hash, user, id]);
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text)');
					tx.executeSql('DELETE FROM t_lotesxanimal WHERE id_lote=?', [id]);	

					var selO = document.getElementById('animaisED');
					var selValues = [];
					
					for(i=0; i < selO.length; i++)
					{
						if(selO.options[i].selected)
						{
							tx.executeSql('INSERT INTO t_lotesxanimal VALUES (?,?,?,?,?)', [id, selO.options[i].value, hash, user, sync]);	
						}
					}
					
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Lote editado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});				

		}
		else
		{
			navigator.notification.alert('Preencha o campo nome!', alertCallback,  'Notificação', 'OK');	
			$("#nome").focus();			
		}
		
	});	
	

	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




