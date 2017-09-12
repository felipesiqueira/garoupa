$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});	
		//FAZENDA ATUAL
		db.transaction(function (tx) 
		{
			
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
			
			var id_ocorrencia = getUrlParameter('id_ocorrencia');			
			var id_animal = getUrlParameter('id_animal');			
			
			
			var query = "SELECT id_fazenda FROM t_fazenda_atual";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				var id_fazenda = resultSet.rows.item(0).id_fazenda;	
						
				//LISTAR COMBO EVENTOS
				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_eventos_sanitarios WHERE id_fazenda=? ORDER BY evento_sanitario ASC";

					tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
					{
						for(var x = 0; x < resultSet.rows.length; x++) 
						{		
							$('<option>').val(resultSet.rows.item(x).id_evento_sanitario).html(resultSet.rows.item(x).evento_sanitario).appendTo("#evento");				
							$('<option>').val(resultSet.rows.item(x).id_evento_sanitario).html(resultSet.rows.item(x).evento_sanitario).appendTo("#eventoED");				
						}
					});	
				});	
				
				//LISTAR ANIMAL
				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_animais WHERE id_fazenda=? ORDER BY brinco ASC";

					tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
					{
						for(var x = 0; x < resultSet.rows.length; x++) 
						{		
							$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animal");
							$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animalED");
						}
					});	
				});	
				
				db.transaction(function (tx) 
				{
					var query = "SELECT t_ocorrenciaxanimal.id_ocorrencia, t_eventos_sanitarios.evento_sanitario, t_animais.brinco FROM t_ocorrenciaxanimal INNER JOIN t_eventos_sanitarios ON t_eventos_sanitarios.id_evento_sanitario=t_ocorrenciaxanimal.id_evento_sanitario INNER JOIN t_animais on t_animais.id_animal=t_ocorrenciaxanimal.id_animal WHERE t_ocorrenciaxanimal.id_animal=? AND t_ocorrenciaxanimal.id_fazenda=?";

					tx.executeSql(query, [id_animal, id_fazenda], function (tx, resultSet) 
					{ 
						var dataSet = []; 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{						
							var dados = [resultSet.rows.item(x).evento_sanitario, resultSet.rows.item(x).brinco, '<a href="editEventoIndividual.html?id_ocorrencia='+resultSet.rows.item(x).id_ocorrencia+'"><img src="img/edit.png" class="iconeTable"></a>'];								
							dataSet.push(dados);
						}
						
						$('#lsEventos').DataTable({
						data: dataSet,
						"order": [[ 0, "desc" ]],
						columns: [
							{ title: "Evento" },
							{ title: "Animal" },
							{ title: "Editar" }
							]
						});
						
					});
						
				});

				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_ocorrenciaxanimal WHERE id_ocorrencia=?";

					tx.executeSql(query, [id_ocorrencia], function (tx, resultSet) 
					{ 
						
						$("#id_ocorrenciaED").val(resultSet.rows.item(0).id_ocorrencia);				
						$("#eventoED").val(resultSet.rows.item(0).id_evento_sanitario).change(); 
						$("#animalED").val(resultSet.rows.item(0).id_animal).change();
						$("#obsED").val(resultSet.rows.item(0).obs);
						
					});
						
				});
		   
			});
		});
	});

		
	//ANIMAIS	

	//FUNÇÃO CADASTRAR
	$("#incluirEvento").click(function() 
	{	
		var evento    = $("#evento").val();
		var animal 	  = $("#animal").val();
		var obs       = $("#obs").val();
		
		if(evento != '')
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
						
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento_sanitario INTEGER, id_animal INTEGER, id_resultado INTEGER, obs text, data text, hash text, user text, sync text, id_fazenda text)');
						tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?,?,?)', [null, null, evento, animal, null, obs, null, hash, user, sync, id_fazenda]);		

					});
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
			navigator.notification.alert('Selecione o evento!', alertCallback,  'Notificação', 'OK');	
			$("#evento").focus();			
		}
		
	});
	
	//FUNÇÃO EDITAR
	$("#editarEvento").click(function() 
	{	
		var id        = $("#id_ocorrenciaED").val();
		var evento    = $("#eventoED").val();
		var animal 	  = $("#animalED").val();
		var obs       = $("#obsED").val();

		if(evento != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					
					tx.executeSql('UPDATE t_ocorrenciaxanimal SET id_evento_sanitario=?, id_animal=?, hash=?, user=? , obs=? WHERE id_ocorrencia=?', [evento, animal, hash, user, obs, id]);

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
			navigator.notification.alert('Selecione o evento!', alertCallback,  'Notificação', 'OK');	
			$("#eventoED").focus();			
		}		
	});

	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




