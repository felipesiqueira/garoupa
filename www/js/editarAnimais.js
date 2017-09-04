$(document).ready(function()
{
	var db = null;

	document.addEventListener('deviceready', function() {
	  db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});
	});
	
	
	$(location).attr('href');

	//pure javascript
	var pathname = window.location.pathname;
	
	// to show it in an alert window
    alert(window.location);


	
	
		
	//ANIMAIS

	//LISTAR COMBO RACA
	db.transaction(function (tx) 
	{
		var query = "SELECT id_raca, raca FROM t_raca ORDER BY raca ASC";

		tx.executeSql(query, [], function (tx, resultSet) 
		{
			for(var x = 0; x < resultSet.rows.length; x++) 
			{		
				$('<option>').val(resultSet.rows.item(x).id_raca).html(resultSet.rows.item(x).raca).appendTo("#raca");
			}
		});	
	});	
	
	//LISTAR RESULTADOS
	db.transaction(function (tx) 
	{
		var query = "SELECT id_resultado, resultado FROM t_resultado ORDER BY resultado ASC";

		tx.executeSql(query, [], function (tx, resultSet) 
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
		var query = "SELECT id_estado_animal, estado_animal FROM t_estado_animal ORDER BY estado_animal ASC";

		tx.executeSql(query, [], function (tx, resultSet) 
		{
			for(var x = 0; x < resultSet.rows.length; x++) 
			{		
				$('<option>').val(resultSet.rows.item(x).id_estado_animal).html(resultSet.rows.item(x).estado_animal).appendTo("#estado");
			}
		});	
	});	

	//FUNÇÃO LISTAR ANIMAIS

	db.transaction(function (tx) 
	{
		var query = "SELECT * FROM t_animais WHERE brinco=?";		
		tx.executeSql(query, [sessionStorage.brinco], function (tx, resultSet) 
		{ 
			for(var x = 0; x < resultSet.rows.length; x++) 
			{	
				$("#matrizED").val(resultSet.rows.item(x).matriz);
				$("#racaED").val(resultSet.rows.item(x).id_raca);
				$("#sexoED").val(resultSet.rows.item(x).sexo);
				$("#paiED").val(resultSet.rows.item(x).pai);
				$("#maeED").val(resultSet.rows.item(x).mae);
				$("#brincoED").val(resultSet.rows.item(x).brinco);
				$("#situacaoED").val(resultSet.rows.item(x).situacao);
				$("#estadoED").val(resultSet.rows.item(x).estado);
				
				sessionStorage.brinco = "";
			}
		});
			
	});

	//FUNÇÃO EDITAR - FORM

	/*db.transaction(function (tx) 
	{
		var query = "SELECT * FROM t_animais";

		tx.executeSql(query, [], function (tx, resultSet) 
		{ 
			for(var x = 0; x < resultSet.rows.length; x++) 
			{	
				$('#lsAnimais tr:last').after('<tr><td>'+resultSet.rows.item(x).brinco+'</td><td>'+resultSet.rows.item(x).id_raca+'</td><td>'+resultSet.rows.item(x).matriz+'</td><td>'+resultSet.rows.item(x).sexo+'</td><td><a href="editarAnimais.html">Editar</td></tr>');
			}
		});
			
	});	*/	

		
	//ANIMAIS	
	
	//FUNÇÃO EDITAR
	$("#editarAnimal").click(function() 
	{	
		var matriz   = $("#matrizED").val();
		var raca 	 = $("#racaED").val();
		var sexo 	 = $("#sexoED").val();
		var pai 	 = $("#paiED").val();
		var mae 	 = $("#maeED").val();
		var brinco 	 = $("#brincoED").val();
		var situacao = $("#situacaoED").val();
		var estado 	 = $("#estadoED").val();

		db.transaction(function(tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT , brinco text, matriz text, sexo text, id_raca INTEGER , id_estado INTEGER , id_animal_pai INTEGER , id_animal_mae INTEGER , ativo text)');		
		tx.executeSql('UPDATE t_animais SET (matriz, sexo, raca, estado, pai, mae, situacao) VALUES (?, ?, ?, ?, ?, ?, ?) WHERE brinco=?', [matriz, sexo, raca, estado, pai, mae, situacao, brinco]);
		}, function(error) {
		navigator.notification.alert(error.message, alertCallback,  'Notificação', 'OK');
		}, function() {
		navigator.notification.alert('Animal editado com sucesso!', alertCallback,  'Notificação', 'OK');
		history.back();
		});
	});


	
	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
	
	

	/*$('#lsAnimais').dataTable( {
    "fnDrawCallback": function( oSettings ) {
      alert( 'DataTables has redrawn the table' );
    }
	});*/
	
});	

