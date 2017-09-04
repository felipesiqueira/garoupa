$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});	
				
		//LISTAR COMBO EVENTOS
		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_eventos_sanitarios ORDER BY evento_sanitario ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
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
			var query = "SELECT * FROM t_lotes ORDER BY lote ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				for(var x = 0; x < resultSet.rows.length; x++) 
				{		
					$('<option>').val(resultSet.rows.item(x).id_lote).html(resultSet.rows.item(x).lote).appendTo("#lote");
					$('<option>').val(resultSet.rows.item(x).id_lote).html(resultSet.rows.item(x).lote).appendTo("#loteED");
				}
			});	
		});	
		
		//LISTAR RESULTADOS
		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_resultados ORDER BY resultado ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				for(var x = 0; x < resultSet.rows.length; x++) 
				{		
					$('<option>').val(resultSet.rows.item(x).id_resultado).html(resultSet.rows.item(x).resultado).appendTo("#resultado");
					$('<option>').val(resultSet.rows.item(x).id_resultado).html(resultSet.rows.item(x).resultado).appendTo("#resultadoED");
				}
			});	
		});
		
		db.transaction(function(tx, results) 
		{                                  

			tx.executeSql("SELECT COUNT(*) AS total FROM t_ocorrenciaxlote", [], function (tx, resultSet) 
			{ 
				totalReg = resultSet.rows.item(0).total;

				var page = getUrlParameter('page');
				var qtdePage = 10;

				if (typeof page != 'undefined')
				{
					var ini = page.split("|")[0];
					var fim = page.split("|")[1];
				}

				if (typeof ini == 'undefined') {var ini=0;}
				if (typeof fim == 'undefined') {var fim=qtdePage;}

				var novoAnt = eval(ini)-eval(qtdePage);
				
				var novoProx = eval(ini)+eval(qtdePage);
				
				$('#ant').attr('href',"listEventoLote.html?page="+novoAnt+"|"+qtdePage);
				$('#prox').attr('href', "listEventoLote.html?page="+novoProx+"|"+qtdePage);
				
				if(novoAnt<0)
				{
					$('#ant').hide();
				}
				if(novoProx>=totalReg)
				{
					$('#prox').hide();
				}

				db.transaction(function (tx) 
				{
					var query = "SELECT * FROM t_ocorrenciaxlote INNER JOIN t_eventos_sanitarios ON t_eventos_sanitarios.id_evento_sanitario=t_ocorrenciaxlote.id_evento_sanitario INNER JOIN t_lotes ON t_ocorrenciaxlote.id_lote=t_lotes.id_lote INNER JOIN t_resultados ON t_ocorrenciaxlote.id_resultado=t_resultados.id_resultado LIMIT "+ini+", "+fim;

					tx.executeSql(query, [], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							$('#lsEventos tr:last').after('<tr><td>'+resultSet.rows.item(x).evento_sanitario+'</td><td>'+resultSet.rows.item(x).lote+'</td><td>'+resultSet.rows.item(x).resultado+'</td><td><a href="editEventoLote.html?id_ocorrencia_sanitaria='+resultSet.rows.item(x).id_ocorrencia_sanitaria+'"><img src="img/edit.png" class="iconeTable"></a></td></tr>');
						}
					});
						
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

		
	//ANIMAIS	

	//FUNÇÃO CADASTRAR
	$("#incluirEvento").click(function() 
	{	
		var evento    = $("#evento").val();
		var lote 	  = $("#lote").val();
		var resultado = $("#resultado").val();
		
		if(evento != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER id_evento INTEGER, id_animal INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');

					tx.executeSql('INSERT INTO t_ocorrenciaxlote VALUES (?,?,?,?,?,?,?,?)', [null, evento, lote, resultado, null, hash, user, sync]);

					var query = "SELECT * FROM t_ocorrenciaxlote ORDER BY id_lote DESC LIMIT 1";

					tx.executeSql(query, [], function (tx, resultSet) 
					{ 
						var insertID = resultSet.rows.item(0).id_ocorrencia_sanitaria;

						var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

						tx.executeSql(query, [lote], function (tx, resultSet) 
						{ 
							for(var x = 0; x < resultSet.rows.length; x++) 
							{	
								tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?)', [null, insertID, evento, resultSet.rows.item(x).id_animal, resultado, null, hash, user, sync]);
							}
						});
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
		var id       = $("#id_ocorrencia_sanitariaED").val();
		var evento    = $("#eventoED").val();
		var lote 	  = $("#loteED").val();
		var resultado = $("#resultadoED").val();

		if(evento != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					tx.executeSql('UPDATE t_ocorrenciaxlote SET id_evento_sanitario=?, id_lote=?, id_resultado=?, hash=?, user=?  WHERE id_ocorrencia_sanitaria=?', [evento, lote, resultado, hash, user, id]);

					tx.executeSql('DELETE FROM t_ocorrenciaxanimal WHERE id_ocorrencia_lote=?', [id]);	
					
					var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

					tx.executeSql(query, [lote], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?)', [null, id, evento, resultSet.rows.item(x).id_animal, resultado, null, hash, user, sync]);
						}
					});								
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




