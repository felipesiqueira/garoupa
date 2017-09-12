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
				
			var idLote = getUrlParameter('id_lote');
			
			var idocorrenciaED = getUrlParameter('idocorrencia');
			
			$("#lote").val(idLote);		
			
			$("#EDidocorrencia").val(idocorrenciaED);	

			
			//FUNÇÃO EDITAR
			
			var query = "SELECT * FROM t_ocorrenciaxlote ORDER BY id_ocorrencia_sanitaria DESC LIMIT 1";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				var insertID = resultSet.rows.item(0).id_ocorrencia_sanitaria;
				
				$("#idocorrencia").val(insertID);	
			});	


			var query = "SELECT * FROM t_ocorrenciaxlote ORDER BY id_ocorrencia_sanitaria=?";

			tx.executeSql(query, [idocorrenciaED], function (tx, resultSet) 
			{ 
				var EDlote = resultSet.rows.item(0).id_lote;
				
				$("#EDlote").val(EDlote);	
			});			
			
			db.transaction(function (tx) 
			{
				var query = "SELECT t_animais.brinco, t_animais.id_animal FROM t_lotesxanimal INNER JOIN t_animais ON t_lotesxanimal.id_animal=t_animais.id_animal WHERE t_lotesxanimal.id_lote=?";

				tx.executeSql(query, [idLote], function (tx, resultSet) 
				{ 
					var dataSet = []; 
					for(var x = 0; x < resultSet.rows.length; x++) 
					{						
						var dados2 = ['<input type="hidden" id="id_animal'+resultSet.rows.item(x).id_animal+'" class="animaisLot" value="'+resultSet.rows.item(x).id_animal+'" disabled="disabled">'+resultSet.rows.item(x).brinco, '<input type="text" id="obs'+resultSet.rows.item(x).id_animal+'" class="animaisLot">'];		
						
						dataSet.push(dados2);	
					}
					
					$('#lsEventos').DataTable({
					data: dataSet,
					"order": [[ 0, "desc" ]],
					columns: [
						{ title: "Brinco" },
						{ title: "Observações" }
						]
					});
				});	
			});	
			
			
			db.transaction(function (tx) 
			{
				var query = "SELECT t_animais.brinco, t_animais.id_animal, t_ocorrenciaxanimal.obs  FROM t_ocorrenciaxanimal INNER JOIN t_animais ON t_ocorrenciaxanimal.id_animal=t_animais.id_animal WHERE t_ocorrenciaxanimal.id_ocorrencia_lote=?";

				tx.executeSql(query, [idocorrenciaED], function (tx, resultSet) 
				{ 
					var dataSet = []; 
					for(var x = 0; x < resultSet.rows.length; x++) 
					{						
						var dados2 = ['<input type="hidden" id="EDid_animal'+resultSet.rows.item(x).id_animal+'" class="animaisLot" value="'+resultSet.rows.item(x).id_animal+'" disabled="disabled">'+resultSet.rows.item(x).brinco, '<input type="text" id="EDobs'+resultSet.rows.item(x).id_animal+'" value="'+resultSet.rows.item(x).obs+'" class="animaisLot">'];		
						
						dataSet.push(dados2);	
					}
					
					$('#lsEventosED').DataTable({
					data: dataSet,
					"order": [[ 0, "desc" ]],
					columns: [
						{ title: "Brinco" },
						{ title: "Observações" }
						]
					});
				});	
			});				
			
		});	
	});	
	
	$("#incluir").on('touchstart', function()
	{	
		var lote 	     = $("#lote").val();
		var idocorrencia = $("#idocorrencia").val();

		if(lote != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

					tx.executeSql(query, [lote], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							var id_animal = $("#id_animal"+resultSet.rows.item(x).id_animal).val();
							var obs 	  = $("#obs"+resultSet.rows.item(x).id_animal).val();
							
							tx.executeSql('UPDATE t_ocorrenciaxanimal SET obs=? WHERE id_animal=? AND id_ocorrencia_lote=?', [obs, id_animal, idocorrencia]);
						}
					});								
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Evento incluido com sucesso!', alertCallback,  'Notificação', 'OK');
			location.href='listEventoLote.html';
			});
		}
		else
		{
			navigator.notification.alert('Selecione o evento!', alertCallback,  'Notificação', 'OK');	
			$("#eventoED").focus();			
		}
	});
	

	$("#editar").on('touchstart', function()
	{	
		var lote 	     = $("#EDlote").val();
		var idocorrencia = $("#EDidocorrencia").val();

		if(lote != '')
		{
			db.transaction(function(tx, results) 
			{
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
					
					var query = "SELECT * FROM t_lotesxanimal WHERE id_lote=?";

					tx.executeSql(query, [lote], function (tx, resultSet) 
					{ 
						for(var x = 0; x < resultSet.rows.length; x++) 
						{	
							var id_animal = $("#EDid_animal"+resultSet.rows.item(x).id_animal).val();
							var obs 	  = $("#EDobs"+resultSet.rows.item(x).id_animal).val();
							
							tx.executeSql('UPDATE t_ocorrenciaxanimal SET obs=? WHERE id_animal=? AND id_ocorrencia_lote=?', [obs, id_animal, idocorrencia]);
						}
					});								
				});
				
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Evento editado com sucesso!', alertCallback,  'Notificação', 'OK');
			location.href='listEventoLote.html';
			});
		}
		else
		{
			navigator.notification.alert('Selecione o evento!', alertCallback,  'Notificação', 'OK');	
			$("#eventoED").focus();			
		}
	});
	
	
}); 



	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
		
});	




