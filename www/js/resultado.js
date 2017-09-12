$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});
	
		//FAZENDA ATUAL
		db.transaction(function (tx) 
		{
			var query = "SELECT id_fazenda FROM t_fazenda_atual";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				var id_fazenda = resultSet.rows.item(0).id_fazenda;		
				
			//FUNÇÃO LISTAR RESULTADOS
			db.transaction(function (tx) 
			{
				var query = "SELECT * FROM t_resultados wHERE id_fazenda=? ORDER BY resultado ASC";

				tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
				{ 
					var dataSet = []; 
					for(var x = 0; x < resultSet.rows.length; x++) 
					{											
						var dados = [resultSet.rows.item(x).resultado, '<a href="editResultados.html?id_resultado='+resultSet.rows.item(x).id_resultado+'"><img src="img/edit.png" class="iconeTable"></a>'];		
						
						dataSet.push(dados);
					}
					
					$('#lsResultados').DataTable({
					data: dataSet,
					"order": [[ 0, "desc" ]],
					columns: [
						{ title: "Resultado" },
						{ title: "Editar" }
						]
					});	
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
			
			var id_resultado = getUrlParameter('id_resultado');

			db.transaction(function (tx) 
			{
				var query = "SELECT * FROM t_resultados WHERE id_resultado=?";

				tx.executeSql(query, [id_resultado], function (tx, resultSet) 
				{ 
					$("#id_resultado").val(resultSet.rows.item(0).id_resultado);				
					$("#nomeED").val(resultSet.rows.item(0).resultado);
				});
					
			});
		
		});
		});
	});

	//FUNÇÃO CADASTRAR
	$("#incluirResultado").click(function() 
	{	
		var nome = $("#nome").val();

		if(nome != '')
		{		
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_fazenda_atual", [], function (tx, resultSet) 
				{ 
					var id_fazenda = resultSet.rows.item(0).id_fazenda;					
				
					tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
					{ 
						var hash = resultSet.rows.item(0).hash;				
						var user = resultSet.rows.item(0).usuario;
						var sync = 0;
						
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, resultado text, hash text, user text, sync text, id_fazenda text)');
						tx.executeSql('INSERT INTO t_resultados VALUES (?,?,?,?,?,?)', [null, nome, hash, user, sync, id_fazenda]);
					});
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Resultado cadastrado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});			
		}
		else
		{
			navigator.notification.alert('Preencha o campo resultado!', alertCallback,  'Notificação', 'OK');	
			$("#nome").focus();			
		}
		
	});
	
	//FUNÇÃO EDITAR
	$("#editarResultado").click(function() 
	{	
		var id        = $("#id_resultado").val();
		var nome      = $("#nomeED").val();

		if(nome != '')
		{
			db.transaction(function(tx, results) {                                  

			tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
			{ 
				var hash = resultSet.rows.item(0).hash;				
				var user = resultSet.rows.item(0).usuario;
				
				tx.executeSql('UPDATE t_resultados SET resultado=?, hash=?, user=? WHERE id_resultado=?', [nome, hash, user, id]);
			});			
					
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Resultado editado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});			
		}
		else
		{
			navigator.notification.alert('Preencha o campo resultado!', alertCallback,  'Notificação', 'OK');	
			$("#nomeED").focus();			
		}		
	});

	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




