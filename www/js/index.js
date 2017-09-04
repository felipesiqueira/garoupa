$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	  db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});
	  
	});
	


		
	//SINCRONIZAR
	$("#sincronizar").on('touchstart', function() 
	{	
		db.transaction(function (tx) 
		{	
			if (navigator.connection.type !== Connection.NONE) 
			{
				var query = "SELECT * FROM t_parametros";
				var hash  = Math.floor(Math.random() * 65536);
				
				tx.executeSql('UPDATE t_parametros SET hash=?', [hash]);
				
				tx.executeSql(query, [], function (tx, resultSet) 
				{ 
					ip      = resultSet.rows.item(0).ip;
					
					checkOnline('http://'+ip+'/serverTablet/teste.php', function() {navigator.notification.alert('Erro ao conectar Webservice. Verifique conexão com o servidor!', alertCallback,  'Erro Conexão', 'OK');},	
					
					function()
					{
						window.plugins.spinnerDialog.show("Notificação","Sincronização em andamento", true);
						
						window.setTimeout(function() {
							racasTab();	  	  racasMysql();
						}, 1000);
						
						window.setTimeout(function() {
							estadosTab(); 	  estadosMysql();
						}, 2000);
						
						window.setTimeout(function() {
							eventosTab(); 	  eventosMysql();
						}, 3000);
						
						window.setTimeout(function() {
							resultadosTab(); 	  resultadosMysql();
						}, 4000);
						
						window.setTimeout(function() {
							animaisTab(); 	  animaisMysql();
						}, 5000);					
						
						window.setTimeout(function() {
							lotesTab();       lotesMysql();
						}, 6000);						
						
						window.setTimeout(function() {
							animalLotesTab(); animalLotesMysql();
						}, 7000);						
						
						window.setTimeout(function() {
							sanitarioIndividualTab(); sanitarioIndividualMysql();
						}, 8000);							
						
						window.setTimeout(function() {
							sanitarioLoteTab(); sanitarioLoteMysql();
							window.plugins.spinnerDialog.hide();
							navigator.notification.alert('Sincronização concluída!', alertCallback,  'Notificação', 'OK');
						}, 9000);	

					});					

				});
			}
			else
			{
				navigator.notification.alert('Verifique sua conexão com a Internet e tente novamente!', alertCallback,  'Erro Conexão', 'OK');			
			}
		});
	});
	
	/////RACAS/////
	function racasTab()
	{
		var url1 = 'http://'+ip+"/serverTablet/raca.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_raca (id_raca INTEGER PRIMARY KEY AUTOINCREMENT, raca text, hash text, user text, sync text)');
			
			tx.executeSql("SELECT * FROM t_raca ORDER BY id_raca ASC", [], function (tx, resultSet1) 
			{
				for(var x = 0; x < resultSet1.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url1,
						async: false,
						data: 
						{
						'insert':true,
						'id_raca':resultSet1.rows.item(x).id_raca,
						'raca':resultSet1.rows.item(x).raca,	
						'hash':resultSet1.rows.item(x).hash,
						'user':resultSet1.rows.item(x).user,					
						'sync':resultSet1.rows.item(x).sync,					
						},
						success: function(data) {},
						error: function(erro){}
					});								
				}				
			});						
		});		
		return racasMysql();
	}	
	
	function racasMysql()
	{
		var url1 = 'http://'+ip+"/serverTablet/raca.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url1,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_raca');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_raca = field.id_raca;
					var raca 	= field.raca;
					var sync    = 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_raca (id_raca INTEGER PRIMARY KEY AUTOINCREMENT, raca text, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_raca VALUES (?,?,?,?,?)', [id_raca, raca, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}
	
	/////ESTADOS/////
	function estadosTab()
	{
		var url2 = 'http://'+ip+"/serverTablet/estado_animal.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_estado_animal (id_estado_animal INTEGER PRIMARY KEY AUTOINCREMENT, estado_animal text, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_estado_animal ORDER BY id_estado_animal ASC", [], function (tx, resultSet4) 
			{
				for(var x = 0; x < resultSet4.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url2,
						async: false,
						data: 
						{
						'insert':true,
						'id_estado_animal':resultSet4.rows.item(x).id_estado_animal,
						'estado_animal':resultSet4.rows.item(x).estado_animal,	
						'hash':resultSet4.rows.item(x).hash,
						'user':resultSet4.rows.item(x).user,					
						'sync':resultSet4.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}	
			});		
		});		
		return estadosMysql();
	}	
	
	function estadosMysql()
	{
		var url2 = 'http://'+ip+"/serverTablet/estado_animal.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url2,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_estado_animal');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_estado_animal = field.id_estado_animal;
					var estado_animal    = field.estado_animal;
					var sync         	 = 1;
												
					db.transaction(function(tx) 
					{
					tx.executeSql('CREATE TABLE IF NOT EXISTS t_estado_animal (id_estado_animal INTEGER PRIMARY KEY AUTOINCREMENT, estado_animal text, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_estado_animal VALUES (?,?,?,?,?)', [id_estado_animal, estado_animal, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});					
		});			
	}	
	
	/////EVENTOS SANITARIOS/////
	function eventosTab()
	{
		var url3 = 'http://'+ip+"/serverTablet/evento_sanitario.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_eventos_sanitarios (id_evento_sanitario INTEGER PRIMARY KEY AUTOINCREMENT, evento_sanitario text, hash text, user text, sync text)');
			
			tx.executeSql("SELECT * FROM t_eventos_sanitarios ORDER BY id_evento_sanitario ASC", [], function (tx, resultSet2) 
			{
				for(var x = 0; x < resultSet2.rows.length; x++) 
				{		
						
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,
						url: url3,
						async: false,
						data: 
						{
						'insert':true,
						'id_evento_sanitario':resultSet2.rows.item(x).id_evento_sanitario,
						'evento_sanitario':resultSet2.rows.item(x).evento_sanitario,	
						'hash':resultSet2.rows.item(x).hash,
						'user':resultSet2.rows.item(x).user,					
						'sync':resultSet2.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}
				
			});			
		});		
		return eventosMysql();
	}	
	
	function eventosMysql()
	{
		var url3 = 'http://'+ip+"/serverTablet/evento_sanitario.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url3,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_eventos_sanitarios');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_evento_sanitario = field.id_evento_sanitario;
					var evento_sanitario 	= field.evento_sanitario;
					var sync    = 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_eventos_sanitarios (id_evento_sanitario INTEGER PRIMARY KEY AUTOINCREMENT, evento_sanitario text, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_eventos_sanitarios VALUES (?,?,?,?,?)', [id_evento_sanitario, evento_sanitario, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});					
		});			
	}	


	
	/////RESULTADOS/////
	function resultadosTab()
	{
		var url4 = 'http://'+ip+"/serverTablet/resultados.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, resultado text, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_resultados ORDER BY id_resultado ASC", [], function (tx, resultSet3) 
			{
				for(var x = 0; x < resultSet3.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url4,
						async: false,
						data: 
						{
						'insert':true,
						'id_resultado':resultSet3.rows.item(x).id_resultado,
						'resultado':resultSet3.rows.item(x).resultado,	
						'hash':resultSet3.rows.item(x).hash,
						'user':resultSet3.rows.item(x).user,					
						'sync':resultSet3.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}				
			});			
		});		
		return resultadosMysql();
	}	
	
	function resultadosMysql()
	{
		var url4 = 'http://'+ip+"/serverTablet/resultados.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url4,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_resultados');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_resultado = field.id_resultado;
					var resultado    = field.resultado;
					var sync         = 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, resultado text, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_resultados VALUES (?,?,?,?,?)', [id_resultado, resultado, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}		
	
	/////ANIMAIS/////
	function animaisTab()
	{
		//ANIMAIS
		var url0 = 'http://'+ip+"/serverTablet/animais.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT, brinco text, matriz text, sexo text, id_raca INTEGER , id_estado INTEGER , id_animal_pai INTEGER , id_animal_mae INTEGER , ativo text, hash text, user text, sync text)');
			
			tx.executeSql("SELECT * FROM t_animais ORDER BY id_animal ASC", [], function (tx, resultSet0) 
			{
				for(var x = 0; x < resultSet0.rows.length; x++) 
				{			
					$.ajax(
					{
						type: 'POST',
						dataType: 'text',
						cache: false,
						url: url0,
						async: false,
						data: 
						{
						'insert':true,
						'id_animal':resultSet0.rows.item(x).id_animal,	
						'brinco':resultSet0.rows.item(x).brinco,	
						'matriz':resultSet0.rows.item(x).matriz,	
						'id_raca':resultSet0.rows.item(x).id_raca,	
						'sexo':resultSet0.rows.item(x).sexo,	
						'id_animal_pai':resultSet0.rows.item(x).id_animal_pai,	
						'id_animal_mae':resultSet0.rows.item(x).id_animal_mae,	
						'ativo':resultSet0.rows.item(x).ativo,	
						'id_estado':resultSet0.rows.item(x).id_estado,	
						'hash':resultSet0.rows.item(x).hash,
						'user':resultSet0.rows.item(x).user,					
						'sync':resultSet0.rows.item(x).sync,								
						},
						success: function(data){},
						error: function(erro){}
					});		
				}

							
			});						
		});		
		return animaisMysql();
	}	
	
	function animaisMysql()
	{
		//ANIMAIS
		var url0 = 'http://'+ip+"/serverTablet/animais.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url0,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_animais');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_animal 		= field.id_animal;	
					var brinco 			= field.brinco;	
					var matriz 			= field.matriz;	
					var id_raca 		= field.id_raca;	
					var sexo 			= field.sexo;	
					var id_animal_pai 	= field.id_animal_pai;	
					var id_animal_mae 	= field.id_animal_mae;	
					var ativo 			= field.ativo;	
					var id_estado 		= field.id_estado;	
					var sync    		= 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT, brinco text, matriz text, sexo text, id_raca INTEGER, id_estado INTEGER, id_animal_pai INTEGER, id_animal_mae INTEGER, ativo text, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_animais VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', [id_animal, brinco, matriz, sexo, id_raca, id_estado, id_animal_pai, id_animal_mae, ativo, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});					
		});			
	}
	
	/////LOTES/////
	function lotesTab()
	{
		var url5 = 'http://'+ip+"/serverTablet/lotes.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotes (id_lote INTEGER PRIMARY KEY AUTOINCREMENT, lote text, data date default CURRENT_DATE, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_lotes ORDER BY id_lote ASC", [], function (tx, resultSet5) 
			{
				for(var x = 0; x < resultSet5.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url5,
						async: false,
						data: 
						{
						'insert':true,
						'id_lote':resultSet5.rows.item(x).id_lote,
						'lote':resultSet5.rows.item(x).lote,	
						'hash':resultSet5.rows.item(x).hash,
						'user':resultSet5.rows.item(x).user,					
						'sync':resultSet5.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}				
			});			
		});		
		return lotesMysql();
	}	
	
	function lotesMysql()
	{
		var url5 = 'http://'+ip+"/serverTablet/lotes.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url5,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_lotes');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_lote = field.id_lote;
					var lote    = field.lote;
					var sync    = 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotes (id_lote INTEGER PRIMARY KEY AUTOINCREMENT, lote text, data date default CURRENT_DATE, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_lotes VALUES (?,?,?,?,?,?)', [id_lote, lote, null, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}		

	/////LOTES ANIMAIS/////
	function animalLotesTab()
	{
		var url6 = 'http://'+ip+"/serverTablet/lotesAnimais.php";
		db.transaction(function (tx) 
		{			
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_lotesxanimal ORDER BY id_animal ASC", [], function (tx, resultSet6) 
			{
				for(var x = 0; x < resultSet6.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url6,
						data: 
						{
						'insert':true,
						'id_lote':resultSet6.rows.item(x).id_lote,
						'id_animal':resultSet6.rows.item(x).id_animal,	
						'hash':resultSet6.rows.item(x).hash,
						'user':resultSet6.rows.item(x).user,					
						'sync':resultSet6.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}				
			});			
		});		
		return animalLotesMysql();
	}	
	
	function animalLotesMysql()
	{
		var url6 = 'http://'+ip+"/serverTablet/lotesAnimais.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url6,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_lotesxanimal');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_lote   = field.id_lote;
					var id_animal = field.id_animal;
					var sync      = 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_lotesxanimal VALUES (?,?,?,?,?)', [id_lote, id_animal, null, null, sync]);
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}	
	
	/////SANITARIO INDIVIDUAL/////
	function sanitarioIndividualTab()
	{
		var url7 = 'http://'+ip+"/serverTablet/sanitarioIndividual.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento INTEGER, id_animal INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_ocorrenciaxanimal ORDER BY id_ocorrencia ASC", [], function (tx, resultSet7) 
			{
				for(var x = 0; x < resultSet7.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url7,
						async: false,
						data: 
						{
						'insert':true,
						'id_ocorrencia':resultSet7.rows.item(x).id_ocorrencia,
						'id_evento':resultSet7.rows.item(x).id_evento,	
						'id_animal':resultSet7.rows.item(x).id_animal,	
						'id_resultado':resultSet7.rows.item(x).id_resultado,	
						'hash':resultSet7.rows.item(x).hash,
						'user':resultSet7.rows.item(x).user,					
						'sync':resultSet7.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}				
			});			
		});		
		return sanitarioIndividualMysql();
	}	
	
	function sanitarioIndividualMysql()
	{
		var url7 = 'http://'+ip+"/serverTablet/sanitarioIndividual.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url7,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_ocorrenciaxanimal');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{
					var id_ocorrencia 	= field.id_ocorrencia;
					var id_evento    	= field.id_evento;
					var id_animal    	= field.id_animal;
					var id_resultado    = field.id_resultado;
					var sync    		= 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento INTEGER, id_animal INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?)', [id_ocorrencia, null, id_evento, id_animal, id_resultado, null, null, null, sync]);		
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}	
	
	
	
	/////SANITARIO POR LOTE/////
	function sanitarioLoteTab()
	{
		var url8 = 'http://'+ip+"/serverTablet/sanitarioLote.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');

			tx.executeSql("SELECT * FROM t_ocorrenciaxlote ORDER BY id_ocorrencia_sanitaria ASC", [], function (tx, resultSet8) 
			{
				for(var x = 0; x < resultSet8.rows.length; x++) 
				{			
					$.ajax({
						type: 'POST',
						dataType: 'text',
						cache: false,	
						url: url8,
						async: false,
						data: 
						{
						'insert':true,
						'id_ocorrencia_sanitaria':resultSet8.rows.item(x).id_ocorrencia_sanitaria,
						'id_evento_sanitario':resultSet8.rows.item(x).id_evento_sanitario,	
						'id_lote':resultSet8.rows.item(x).id_lote,	
						'id_resultado':resultSet8.rows.item(x).id_resultado,	
						'hash':resultSet8.rows.item(x).hash,
						'user':resultSet8.rows.item(x).user,					
						'sync':resultSet8.rows.item(x).sync,					
						},
						success: function(data){},
						error: function(erro){}
					});								
				}				
			});			
		});		
		return sanitarioLoteMysql();
	}	
	
	function sanitarioLoteMysql()
	{
		var url8 = 'http://'+ip+"/serverTablet/sanitarioLote.php";
		db.transaction(function (tx) 
		{
			$.getJSON(url8,function(result)
			{
				db.transaction(function(tx) 
				{
					tx.executeSql('DROP TABLE IF EXISTS t_ocorrenciaxlote');
				}, function(error) {
				alert('Transaction ERROR: ' + error.message);
				}, function() {

				});
				
				$.each(result, function(i, field)
				{	
					var id_ocorrencia_sanitaria	= field.id_ocorrencia_sanitaria;
					var id_evento_sanitario    	= field.id_evento_sanitario;
					var id_lote    				= field.id_lote;
					var id_resultado    		= field.id_resultado;
					var sync    				= 1;
												
					db.transaction(function(tx) 
					{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data date default CURRENT_DATE, hash text, user text, sync text)');
						tx.executeSql('INSERT INTO t_ocorrenciaxlote VALUES (?,?,?,?,?,?,?,?)', [id_ocorrencia_sanitaria, id_evento_sanitario, id_lote, id_resultado, null, null, null, sync]);		
					}, function(error) {
					alert('Transaction ERROR: ' + error.message);
					}, function() {});

				});
			});				
		});			
	}	
	
	function alertCallback(){
		console.log("Alert is Dismissed!");
	}
	
	function checkOnline(url, error, ok) 
	{
		try 
		{
			var scriptElem = document.createElement('script');
			scriptElem.type = 'text/javascript';
			scriptElem.onerror = function(){error();};
			scriptElem.onload = function(){ok();};
			scriptElem.src = url;
			document.getElementsByTagName("body")[0].appendChild(scriptElem);
		} 
		catch(err) 
		{
			error(err);
		}
	}
	
	//SAIR
	$("#sair").click(function() 
	{
        navigator.app.exitApp();
    });	
	
		//FUNÇÃO EDITAR
	$("#atualizar").click(function() 
	{	
		downloader.get("/reports/myCsvReport", "report.csv")
  .then(function (filename) {
    alert("File " + filename + " has been downloaded!");
  });
	});
	
});	