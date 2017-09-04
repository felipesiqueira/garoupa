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
			var query = "SELECT * FROM t_animais ORDER BY brinco ASC";

			tx.executeSql(query, [], function (tx, resultSet) 
			{
				for(var x = 0; x < resultSet.rows.length; x++) 
				{		
					$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animal");
					$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#animalED");
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

			tx.executeSql("SELECT COUNT(*) AS total FROM t_ocorrenciaxanimal", [], function (tx, resultSet) 
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
				
				$('#ant').attr('href',"listEventoIndividual.html?page="+novoAnt+"|"+qtdePage);
				$('#prox').attr('href', "listEventoIndividual.html?page="+novoProx+"|"+qtdePage);
				
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
					var query = "SELECT t_ocorrenciaxanimal.id_ocorrencia, t_eventos_sanitarios.evento_sanitario, t_animais.brinco, t_resultados.resultado FROM t_ocorrenciaxanimal INNER JOIN t_eventos_sanitarios ON t_eventos_sanitarios.id_evento_sanitario=t_ocorrenciaxanimal.id_evento INNER JOIN t_animais on t_animais.id_animal=t_ocorrenciaxanimal.id_animal INNER JOIN t_resultados on t_resultados.id_resultado=t_ocorrenciaxanimal.id_resultado LIMIT "+ini+", "+fim;

					tx.executeSql(query, [], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							$('#lsEventos tr:last').after('<tr><td>'+resultSet.rows.item(x).evento_sanitario+'</td><td>'+resultSet.rows.item(x).brinco+'</td><td>'+resultSet.rows.item(x).resultado+'</td><td><a href="editEventoIndividual.html?id_ocorrencia='+resultSet.rows.item(x).id_ocorrencia+'"><img src="img/edit.png" class="iconeTable"></a></td></tr>');
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
		
		var id_ocorrencia = getUrlParameter('id_ocorrencia');

		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_ocorrenciaxanimal WHERE id_ocorrencia=?";

			tx.executeSql(query, [id_ocorrencia], function (tx, resultSet) 
			{ 
				
				$("#id_ocorrenciaED").val(resultSet.rows.item(0).id_ocorrencia);				
				$("#eventoED").val(resultSet.rows.item(0).id_evento).change(); 
				$("#animalED").val(resultSet.rows.item(0).id_animal).change();
				$("#resultadoED").val(resultSet.rows.item(0).id_resultado).change();
				
			});
				
		});
   
	});

		
	//ANIMAIS	

	//FUNÇÃO CADASTRAR
	$("#incluirEvento").click(function() 
	{	
		var evento    = $("#evento").val();
		var animal 	  = $("#animal").val();
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
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento INTEGER, id_animal INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');
					tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?)', [null, null, evento, animal, resultado, null, hash, user, sync]);		

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
		var resultado = $("#resultadoED").val();

		if(evento != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento INTEGER, id_animal INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');
					tx.executeSql('UPDATE t_ocorrenciaxanimal SET id_evento=?, id_animal=?, id_resultado=?, hash=?, user=? WHERE id_ocorrencia=?', [evento, animal, resultado, hash, user, id]);

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




