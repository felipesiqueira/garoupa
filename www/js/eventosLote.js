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
				
				//LISTAR LOTES
				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_lotes WHERE id_fazenda=? ORDER BY lote ASC";

					tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
					{
						for(var x = 0; x < resultSet.rows.length; x++) 
						{		
							$('<option>').val(resultSet.rows.item(x).id_lote).html(resultSet.rows.item(x).lote).appendTo("#lote");
							$('<option>').val(resultSet.rows.item(x).id_lote).html(resultSet.rows.item(x).lote).appendTo("#loteED");
						}
					});	
				});	

						
				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_ocorrenciaxlote INNER JOIN t_eventos_sanitarios ON t_eventos_sanitarios.id_evento_sanitario=t_ocorrenciaxlote.id_evento_sanitario INNER JOIN t_lotes ON t_ocorrenciaxlote.id_lote=t_lotes.id_lote WHERE t_ocorrenciaxlote.id_fazenda=?";

					tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
					{ 
						var dataSet = []; 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{						
							var dados = [resultSet.rows.item(x).evento_sanitario, resultSet.rows.item(x).lote, '<a href="editEventoLote.html?id_ocorrencia_sanitaria='+resultSet.rows.item(x).id_ocorrencia_sanitaria+'"><img src="img/edit.png" class="iconeTable"></a>'];		
							
							dataSet.push(dados);	 
						}
						
						$('#lsEventos').DataTable({
						data: dataSet,
						"order": [[ 0, "desc" ]],
						columns: [
							{ title: "Evento" },
							{ title: "Lote" },
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
				
				var id_ocorrencia = getUrlParameter('id_ocorrencia_sanitaria');

				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_ocorrenciaxlote WHERE id_ocorrencia_sanitaria=?";

					tx.executeSql(query, [id_ocorrencia], function (tx, resultSet) 
					{ 
						
						$("#id_ocorrencia_sanitariaED").val(resultSet.rows.item(0).id_ocorrencia_sanitaria);				
						$("#eventoED").val(resultSet.rows.item(0).id_evento_sanitario).change(); 
						$("#loteED").val(resultSet.rows.item(0).id_lote).change();
						$("#resultadoED").val(resultSet.rows.item(0).id_resultado).change();
						
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
		var lote 	  = $("#lote").val();
		
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
						
						now  = new Date;
						data = now.getFullYear()+"-"+now.getMonth()+"-"+now.getDay();
			
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data text, hash text, user text, sync text, id_fazenda text)');
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento_sanitario INTEGER, id_animal INTEGER, id_resultado INTEGER, obs text, data text, hash text, user text, sync text, id_fazenda text)');
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text, id_fazenda text)');

						tx.executeSql('INSERT INTO t_ocorrenciaxlote VALUES (?,?,?,?,?,?,?,?,?)', [null, evento, lote, null, data, hash, user, sync, id_fazenda]);

						var query = "SELECT * FROM t_ocorrenciaxlote ORDER BY id_ocorrencia_sanitaria DESC LIMIT 1";

						tx.executeSql(query, [], function (tx, resultSet) 
						{ 
							var insertID = resultSet.rows.item(0).id_ocorrencia_sanitaria;

							var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

							tx.executeSql(query, [lote], function (tx, resultSet) 
							{ 
								for(var x = 0; x < resultSet.rows.length; x++) 
								{	
									tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?,?,?)', [null, insertID, evento, resultSet.rows.item(x).id_animal, null, null, null, hash, user, sync, id_fazenda]);							
								}
							});
						});						
					});
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			location.href='listAnimaisLote.html?id_lote='+lote;
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
		var id       = $("#id_ocorrencia_sanitariaED").val();
		var evento    = $("#eventoED").val();
		var lote 	  = $("#loteED").val();

		if(evento != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('UPDATE t_ocorrenciaxlote SET id_evento_sanitario=?, id_lote=?, hash=?, user=?  WHERE id_ocorrencia_sanitaria=?', [evento, lote, hash, user, id]);
					
					var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

					tx.executeSql(query, [lote], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							tx.executeSql('UPDATE t_ocorrenciaxanimal SET id_evento_sanitario=?, hash=?, user=? WHERE id_ocorrencia_lote=?', [evento, hash, user, id]);
						}
					});								
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			location.href='listAnimaisLoteEdit.html?idocorrencia='+id;
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




