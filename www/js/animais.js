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
			

			//LISTAR COMBO RACA
			db.transaction(function (tx) 
			{
				var query = "SELECT id_raca, raca FROM t_raca WHERE id_fazenda=? ORDER BY raca ASC";

				tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
				{
					for(var x = 0; x < resultSet.rows.length; x++) 
					{		
						$('<option>').val(resultSet.rows.item(x).id_raca).html(resultSet.rows.item(x).raca).appendTo("#raca");		
						$('<option>').val(resultSet.rows.item(x).id_raca).html(resultSet.rows.item(x).raca).appendTo("#racaED");		
					}
				});	
			});	
			
			//LISTAR PAI
			db.transaction(function (tx) 
			{
				var query = "SELECT * FROM t_animais WHERE sexo=? AND id_fazenda=? ORDER BY brinco ASC";

				tx.executeSql(query, ['M', id_fazenda], function (tx, resultSet) 
				{
					for(var x = 0; x < resultSet.rows.length; x++) 
					{		
						$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#pai");
						$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#paiED");
					}
				});	
			});	
			
			//LISTAR MAE
			db.transaction(function (tx) 
			{
				var query = "SELECT * FROM t_animais WHERE sexo=? AND id_fazenda=? ORDER BY brinco ASC";

				tx.executeSql(query, ['F', id_fazenda], function (tx, resultSet) 
				{
					for(var x = 0; x < resultSet.rows.length; x++) 
					{		
						$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#mae");
						$('<option>').val(resultSet.rows.item(x).id_animal).html(resultSet.rows.item(x).brinco).appendTo("#maeED");
					}
				});	
			});	
			
			//LISTAR RESULTADOS
			db.transaction(function (tx) 
			{
				var query = "SELECT id_resultado, resultado FROM t_resultado WHERE id_fazenda=?  ORDER BY resultado ASC";

				tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
				{
					for(var x = 0; x < resultSet.rows.length; x++) 
					{		
						$('<option>').val(resultSet.rows.item(x).id_resultado).html(resultSet.rows.item(x).resultado).appendTo("#resultado");
					}
				});	
			});	
			
			//LISTAR ESTADO ANIMAL
			db.transaction(function (tx) 
			{
				var query = "SELECT id_estado_animal, estado_animal FROM t_estado_animal WHERE id_fazenda=?  ORDER BY estado_animal ASC";

				tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
				{
					for(var x = 0; x < resultSet.rows.length; x++) 
					{		
						$('<option>').val(resultSet.rows.item(x).id_estado_animal).html(resultSet.rows.item(x).estado_animal).appendTo("#estado");
						$('<option>').val(resultSet.rows.item(x).id_estado_animal).html(resultSet.rows.item(x).estado_animal).appendTo("#estadoED");
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
			
			var id_animal = getUrlParameter('id_animal');
		
				
			db.transaction(function (tx) 
			{
				var query = "SELECT t_animais.hash, t_animais.user, t_animais.sync, t_animais.id_animal, t_animais.brinco, t_animais.matriz, t_animais.sexo, t_raca.raca FROM t_animais INNER JOIN t_raca ON t_animais.id_raca=t_raca.id_raca WHERE t_animais.id_fazenda=? ";

				tx.executeSql(query, [id_fazenda], function (tx, resultSet) 
				{ 
					var dataSet = []; 
					for(var x = 0; x < resultSet.rows.length; x++) 
					{						
						var matriz = (resultSet.rows.item(x).matriz=='S')?'Sim':'Não';
						if(resultSet.rows.item(x).sexo=='M'){
							var sexo = "Macho";
						}else{	
							var sexo = "Fêmea";
						}
					
						var dados = [ resultSet.rows.item(x).brinco, resultSet.rows.item(x).raca, matriz, sexo, '<a href="editAnimais.html?id_animal='+resultSet.rows.item(x).id_animal+'"><img src="img/edit.png" class="iconeTable"></a>'];		
						
						dataSet.push(dados);
					 
					}
					
					$('#lsAnimais').DataTable({
					data: dataSet,
					"order": [[ 0, "desc" ]],
					columns: [
						{ title: "Brinco" },
						{ title: "Raça" },
						{ title: "Matriz" },
						{ title: "Sexo" },
						{ title: "Editar" }
						]
					});
					
				});
					
			});			
		
			db.transaction(function (tx) 
			{
				var query = "SELECT * FROM t_animais where id_animal=?";

				tx.executeSql(query, [id_animal], function (tx, resultSet) 
				{ 
					for(var x = 0; x < resultSet.rows.length; x++) 
					{	
						$("#id_animalED").val(resultSet.rows.item(x).id_animal);				
						$("#brincoED").val(resultSet.rows.item(x).brinco);				
						$("#matrizED").val(resultSet.rows.item(x).matriz).change();
						$("#racaED").val(resultSet.rows.item(x).id_raca).change();
						$("#sexoED").val(resultSet.rows.item(x).sexo).change();
						$("#paiED").val(resultSet.rows.item(x).id_animal_pai).change();
						$("#maeED").val(resultSet.rows.item(x).id_animal_mae).change();
						$("#situacaoED").val(resultSet.rows.item(x).ativo).change();
						$("#estadoED").val(resultSet.rows.item(x).id_estado).change();
					}
				});
					
			});
			
		});
		});	
	});	
		
	//ANIMAIS	

	//FUNÇÃO CADASTRAR
	$("#incluirAnimal").on('touchstart', function() 
	{	
		var matriz   = $("#matriz").val();
		var raca 	 = $("#raca").val();
		var sexo 	 = $("#sexo").val();
		var pai 	 = $("#pai").val();
		var mae 	 = $("#mae").val();
		var brinco 	 = $("#brinco").val();
		var situacao = $("#situacao").val();
		var estado 	 = $("#estado").val();
		
		if(brinco != '')
		{
			
			db.transaction(function(tx, results) {                                  

			tx.executeSql("SELECT * FROM t_fazenda_atual", [], function (tx, resultSet) 
			{ 
				var id_fazenda = resultSet.rows.item(0).id_fazenda;
				
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					var sync = 0;
				
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT, brinco text, matriz text, sexo text, id_raca INTEGER , id_estado INTEGER , id_animal_pai INTEGER , id_animal_mae INTEGER , ativo text, hash text, user text, sync text, id_fazenda text)');
					tx.executeSql('INSERT INTO t_animais VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [null, brinco, matriz, sexo, raca, estado, pai, mae, situacao, hash, user, sync, id_fazenda]);
				
				});			
			});			
					
			}, function(error) {
			navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
			}, function() {
			navigator.notification.alert('Animal cadastrado com sucesso!', alertCallback,  'Notificação', 'OK');
			history.back();
			});			

		}
		else
		{
			navigator.notification.alert('Preencha o campo Brinco!', alertCallback,  'Notificação', 'OK');	
			$("#brinco").focus();			
		}
		
	});
	
	//FUNÇÃO EDITAR
	$("#editarAnimal").on('touchstart', function()
	{	
		var id_animal= $("#id_animalED").val();
		var matriz   = $("#matrizED").val();
		var raca 	 = $("#racaED").val();
		var sexo 	 = $("#sexoED").val();
		var pai 	 = $("#paiED").val();
		var mae 	 = $("#maeED").val();
		var brinco 	 = $("#brincoED").val();
		var situacao = $("#situacaoED").val();
		var estado 	 = $("#estadoED").val();
		
		if(brinco != '')
		{		
			if(raca != '')
			{
				db.transaction(function(tx, results) {  
				tx.executeSql("SELECT * FROM t_parametros", [], function (tx, resultSet) 
				{ 
					var hash = resultSet.rows.item(0).hash;				
					var user = resultSet.rows.item(0).usuario;
					
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT , brinco text, matriz text, sexo text, id_raca INTEGER , id_estado INTEGER , id_animal_pai INTEGER , id_animal_mae INTEGER , ativo text, hash text, user text, sync text, id_fazenda text)');		
					tx.executeSql('UPDATE t_animais SET brinco=?, matriz=?, sexo=?, id_raca=?, id_estado=?, id_animal_pai=?, id_animal_mae=?, ativo=?, hash=?, user=?  WHERE id_animal=?', [brinco, matriz, sexo, raca, estado, pai, mae, situacao, hash, user, id_animal]);
			
				});			
							
						
				}, function(error) {
				navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
				}, function() {
				navigator.notification.alert('Animal editado com sucesso!', alertCallback,  'Notificação', 'OK');
				history.back();
				});			

			}
			else
			{
				navigator.notification.alert('Preencha o campo Raça!', alertCallback,  'Notificação', 'OK');	
				$("#raca").focus();			
			}
		}
		else
		{
			navigator.notification.alert('Preencha o campo Brinco!', alertCallback,  'Notificação', 'OK');	
			$("#brinco").focus();			
		}
		
	});
	
	//FUNÇÃO CADASTRAR
	$("#listEventoIndividualAnimal").click(function() 
	{	
		var id_animal    = $("#id_animalED").val();
		location.href='listEventoIndividualAnimal.html?id_animal='+id_animal;
	});

	/*$("#brinco").keyup(function(){
		$(this).val($(this).val().toUpperCase());
	});	*/
	
	/*$("#brincoED").keyup(function(){
		$(this).val($(this).val().toUpperCase());
	});*/
	
	
	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
	

	
});	



