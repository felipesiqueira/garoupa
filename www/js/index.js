$(document).ready(function()
{
	var db;

	document.addEventListener('deviceready', function() {
	  db = window.sqlitePlugin.openDatabase({name: 'database.db', location: 'default'});
	  
		db.transaction(function (tx) 
		{
			var query = "SELECT * FROM t_parametros";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				var data = resultSet.rows.item(0).data;				
				var hora = resultSet.rows.item(0).hora;
				$("#ultSync").append("<center>Última sincronização "+data+" às "+hora+"</center>");
			});
				
		});
		
		db.transaction(function (tx) 
		{
			var query = "SELECT id_fazenda FROM t_fazenda_atual";

			tx.executeSql(query, [], function (tx, resultSet) 
			{ 
				var id_fazenda = resultSet.rows.item(0).id_fazenda;				
				if(id_fazenda==1){$("#fazendaLog").append("<center>Agropecuaria Garoupa</center>");}
				if(id_fazenda==3){$("#fazendaLog").append("<center>Fazenda Frei Paulo</center>");}
			});
									
		});
	
	});
	
	$("#sincronizar").click(function() 
	{	
		navigator.notification.confirm('Deseja sincronizar os dados?', onConfirm, 'Notificação',  ['Sincronizar','Cancelar']);
	});	
		
	//SINCRONIZAR

	function onConfirm(button)
	{	
		if (button == 1) {
		db.transaction(function (tx) 
		{	
			if (navigator.connection.type !== Connection.NONE) 
			{
				var query = "SELECT * FROM t_parametros";
				var hash  = Math.floor(Math.random() * 65536);
				
				now  = new Date;
				var mes = now.getMonth()+1;
				var data = now.getDate()+"/"+mes+"/"+now.getFullYear();
				var hora = now.getHours()+":"+now.getMinutes();
				
				tx.executeSql('UPDATE t_parametros SET hash=?, data=?, hora =?', [hash, data, hora]);
				
				tx.executeSql(query, [], function (tx, resultSet) 
				{ 
					ip      = resultSet.rows.item(0).ip;
					
					checkOnline('http://'+ip+'/serverTablet/teste.php', function() {navigator.notification.alert('Erro ao conectar Webservice. Verifique conexão com o servidor!', alertCallback,  'Erro Conexão', 'OK');},	
					
					function()
					{									
						racasTab();										
					});						
					
				});
		}
		else
		{
			navigator.notification.alert('Verifique sua conexão com a Internet e tente novamente!', alertCallback,  'Erro Conexão', 'OK');			
		}
		});
		}
	};
	
	/////RACAS/////
	function racasTab()
	{
		var url1 = 'http://'+ip+"/serverTablet/raca.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_raca (id_raca INTEGER PRIMARY KEY AUTOINCREMENT, raca text, hash text, user text, sync text, id_fazenda text)');
			
			tx.executeSql("SELECT * FROM t_raca ORDER BY id_raca ASC", [], function (tx, resultSet1) 
			{
				contA = resultSet1.rows.length;
				
				if(contA==0)
				{
					racasMysql();
				}
				else
				{
					var cont=0;
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
							'id_fazenda':resultSet1.rows.item(x).id_fazenda,					
							},
							success: function(data) {},
							error: function(erro){}
						});
						cont=cont+1;
				
						if(cont>=contA)
						{
							racasMysql(); 
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando raças", true);	
						}						

					}
				}				
			});						
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					sanitarioLoteTab();
				}
				else
				{				
					var cont=0;	
					$.each(result, function(i, field)
					{
						var id_raca 	= field.id_raca;
						var raca 		= field.raca;
						var sync    	= 1;
						var id_fazenda 	= field.id_fazenda;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_raca (id_raca INTEGER PRIMARY KEY AUTOINCREMENT, raca text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_raca VALUES (?,?,?,?,?,?)', [id_raca, raca, null, null, sync, id_fazenda]);
							cont=cont+1;

							if(cont>=contA)
							{
								estadosTab();
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando raças", true);	
							}							
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});				
		});			
	}
	
	//ESTADOS/////
	function estadosTab()
	{
		var url2 = 'http://'+ip+"/serverTablet/estado_animal.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_estado_animal (id_estado_animal INTEGER PRIMARY KEY AUTOINCREMENT, estado_animal text, hash text, user text, sync text, id_fazenda text)');

			tx.executeSql("SELECT * FROM t_estado_animal ORDER BY id_estado_animal ASC", [], function (tx, resultSet4) 
			{
				contA = resultSet4.rows.length;
				
				if(contA==0)
				{
					estadosMysql();
				}
				else
				{
					var cont=0;
					
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
							'id_fazenda':resultSet4.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});	
						cont=cont+1;
						if(cont>=contA)
						{
							estadosMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando estados do animal", true);	
						}					
					}
				}				
			});		
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					sanitarioLoteTab();
				}
				else
				{				
					var cont=0;				
					$.each(result, function(i, field)
					{
						var id_estado_animal = field.id_estado_animal;
						var estado_animal    = field.estado_animal;
						var id_fazenda       = field.id_fazenda;
						var sync         	 = 1;
													
						db.transaction(function(tx) 
						{
						tx.executeSql('CREATE TABLE IF NOT EXISTS t_estado_animal (id_estado_animal INTEGER PRIMARY KEY AUTOINCREMENT, estado_animal text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_estado_animal VALUES (?,?,?,?,?,?)', [id_estado_animal, estado_animal, null, null, sync, id_fazenda]);
							
						cont=cont+1;
						if(cont>=contA)
						{
							eventosTab();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando estados do animal", true);	
						}	
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});					
		});			
	}	
	
	//EVENTOS SANITARIOS/////
	function eventosTab()
	{
		var url3 = 'http://'+ip+"/serverTablet/evento_sanitario.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_eventos_sanitarios (id_evento_sanitario INTEGER PRIMARY KEY AUTOINCREMENT, evento_sanitario text, hash text, user text, sync text, id_fazenda text)');
			
			tx.executeSql("SELECT * FROM t_eventos_sanitarios ORDER BY id_evento_sanitario ASC", [], function (tx, resultSet2) 
			{
				contA = resultSet2.rows.length;
				
				if(contA==0)
				{
					eventosMysql();
				}
				else
				{				
					var cont=0;
					
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
							'id_fazenda':resultSet2.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});	
						cont=cont+1;
						if(cont>=contA)
						{
							eventosMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos", true);	
						}					
					}
				}
				
			});			
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					resultadosTab();
				}
				else
				{				
					var cont=0;	
					
					$.each(result, function(i, field)
					{
						var id_evento_sanitario = field.id_evento_sanitario;
						var evento_sanitario 	= field.evento_sanitario;
						var id_fazenda 			= field.id_fazenda;
						var sync   				= 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_eventos_sanitarios (id_evento_sanitario INTEGER PRIMARY KEY AUTOINCREMENT, evento_sanitario text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_eventos_sanitarios VALUES (?,?,?,?,?,?)', [id_evento_sanitario, evento_sanitario, null, null, sync, id_fazenda]);
							
							cont=cont+1;
							if(cont>=contA)
							{
								resultadosTab(); 
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos", true);	
							}	
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});					
		});			
	}	

	function resultadosTab()
	{
		var url4 = 'http://'+ip+"/serverTablet/resultados.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, resultado text, hash text, user text, sync text, id_fazenda text)');

			tx.executeSql("SELECT * FROM t_resultados ORDER BY id_resultado ASC", [], function (tx, resultSet3) 
			{
				contA = resultSet3.rows.length;
	
				if(contA==0)
				{
					resultadosMysql(); 
				}
				else
				{				
					var cont=0;
					
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
							'id_fazenda':resultSet3.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});	
						cont=cont+1;
						if(cont>=contA)
						{
							resultadosMysql(); 
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando resultados 1", true);	
						}					
					}				
				}				
			});			
		});		
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
				
				var contA=0;
				
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				
				if(contA==0)
				{
					animaisTab(); 
				}
				else
				{
					var cont=0;	
					
					$.each(result, function(i, field)
					{
						var id_resultado = field.id_resultado;
						var resultado    = field.resultado;
						var id_fazenda   = field.id_fazenda;
						var sync         = 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_resultados (id_resultado INTEGER PRIMARY KEY AUTOINCREMENT, resultado text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_resultados VALUES (?,?,?,?,?,?)', [id_resultado, resultado, null, null, sync, id_fazenda]);
							
							cont=cont+1;
							if(cont>=contA)
							{
								animaisTab();  
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando resultados 2", true);	
							}
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});				
		});			
	}		
	
	function animaisTab()
	{
		var url0 = 'http://'+ip+"/serverTablet/animais.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT, brinco text, matriz text, sexo text, id_raca INTEGER , id_estado INTEGER , id_animal_pai INTEGER , id_animal_mae INTEGER , ativo text, hash text, user text, sync text, id_fazenda text)');
			
			tx.executeSql("SELECT * FROM t_animais ORDER BY id_animal ASC", [], function (tx, resultSet0) 
			{
				contA = resultSet0.rows.length;
				
				if(contA==0)
				{
					animaisMysql();
				}
				else
				{				
					var cont=0;
					
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
							'id_fazenda':resultSet0.rows.item(x).id_fazenda,								
							},
							success: function(data){},
							error: function(erro){}
						});		
						cont=cont+1;
						if(cont>=contA)
						{
							animaisMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando animais", true);	
						}	
					}
				}				
			});						
		});		
	}	
	
	function animaisMysql()
	{
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					lotesTab();
				}
				else
				{				
					var cont=0;	
					
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
						var id_fazenda 		= field.id_fazenda;	
						var sync    		= 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_animais (id_animal INTEGER PRIMARY KEY AUTOINCREMENT, brinco text, matriz text, sexo text, id_raca INTEGER, id_estado INTEGER, id_animal_pai INTEGER, id_animal_mae INTEGER, ativo text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_animais VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [id_animal, brinco, matriz, sexo, id_raca, id_estado, id_animal_pai, id_animal_mae, ativo, null, null, sync, id_fazenda]);
							
							cont=cont+1;
							if(cont>=contA)
							{
								lotesTab();
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando lotes", true);	
							}					
						
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});					
		});			
	}
	
	function lotesTab()
	{
		var url5 = 'http://'+ip+"/serverTablet/lotes.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotes (id_lote INTEGER PRIMARY KEY AUTOINCREMENT, lote text, data text, hash text, user text, sync text, id_fazenda text)');

			tx.executeSql("SELECT * FROM t_lotes ORDER BY id_lote ASC", [], function (tx, resultSet5) 
			{
				contA = resultSet5.rows.length;
				
				if(contA==0)
				{
					lotesMysql();
				}
				else
				{				
					var cont=0;
						
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
							'id_fazenda':resultSet5.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});	
						cont=cont+1;
						if(cont>=contA)
						{
							lotesMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando lotes", true);	
						}					
					}				
				}				
			});			
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					animalLotesTab();
				}
				else
				{				
					var cont=0;	
					
					$.each(result, function(i, field)
					{
						var id_lote     = field.id_lote;
						var lote    	= field.lote;
						var id_fazenda  = field.id_fazenda;
						var sync    = 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotes (id_lote INTEGER PRIMARY KEY AUTOINCREMENT, lote text, data date default CURRENT_DATE, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_lotes VALUES (?,?,?,?,?,?,?)', [id_lote, lote, null, null, null, sync, id_fazenda]);
						
							cont=cont+1;
							if(cont>=contA)
							{
								animalLotesTab();
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando lotes", true);	
							}
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});				
		});			
	}		


	function animalLotesTab()
	{
		var url6 = 'http://'+ip+"/serverTablet/lotesAnimais.php";
		db.transaction(function (tx) 
		{			
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text, id_fazenda text)');

			tx.executeSql("SELECT * FROM t_lotesxanimal ORDER BY id_animal ASC", [], function (tx, resultSet6) 
			{
				contA = resultSet6.rows.length;
				
				if(contA==0)
				{
					animalLotesMysql();
				}
				else
				{				
					var cont=0;
									
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
						cont=cont+1;
						if(cont>=contA)
						{
							animalLotesMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando lotes de animais", true);	
						}					
					}				
				}				
			});			
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					sanitarioIndividualTab();
				}
				else
				{				
					var cont=0;	
					
					$.each(result, function(i, field)
					{
						var id_lote    = field.id_lote;
						var id_animal  = field.id_animal;
						var sync       = 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_lotesxanimal (id_lote INTEGER, id_animal INTEGER, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_lotesxanimal VALUES (?,?,?,?,?,?)', [id_lote, id_animal, null, null, sync, null]);
							
							cont=cont+1;
							if(cont>=contA)
							{
								sanitarioIndividualTab();
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando lotes de animais", true);	
							}					
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});				
		});			
	}	
	
	function sanitarioIndividualTab()
	{
		var url7 = 'http://'+ip+"/serverTablet/sanitarioIndividual.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento_sanitario  INTEGER, id_animal INTEGER, id_resultado INTEGER, obs text, data text, hash text, user text, sync text, id_fazenda text)');
			
			tx.executeSql("SELECT * FROM t_ocorrenciaxanimal ORDER BY id_ocorrencia ASC", [], function (tx, resultSet7) 
			{
				contA = resultSet7.rows.length;
				
				if(contA==0)
				{
					sanitarioIndividualMysql();
				}
				else
				{				
					var cont=0;
						
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
							'id_ocorrencia_lote':resultSet7.rows.item(x).id_ocorrencia_lote,
							'id_evento_sanitario':resultSet7.rows.item(x).id_evento_sanitario,	
							'id_animal':resultSet7.rows.item(x).id_animal,	
							'id_resultado':resultSet7.rows.item(x).id_resultado,	
							'obs':resultSet7.rows.item(x).obs,							
							'hash':resultSet7.rows.item(x).hash,
							'user':resultSet7.rows.item(x).user,					
							'sync':resultSet7.rows.item(x).sync,					
							'id_fazenda':resultSet7.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});		
						cont=cont+1;
						if(cont>=contA)
						{
							sanitarioIndividualMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos individuais", true);	
						}						
					}				
				}				
			});			
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					sanitarioLoteTab();
				}
				else
				{					
					var cont=0;	
					
					$.each(result, function(i, field)
					{
						var id_ocorrencia 		= field.id_ocorrencia;
						var id_ocorrencia_lote  = field.id_ocorrencia_lote;
						var id_evento_sanitario = field.id_evento_sanitario;
						var id_animal    		= field.id_animal;
						var id_resultado    	= field.id_resultado;
						var obs    				= field.obs;
						var id_fazenda    		= field.id_fazenda;
						var sync    			= 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxanimal (id_ocorrencia INTEGER PRIMARY KEY AUTOINCREMENT, id_ocorrencia_lote INTEGER, id_evento_sanitario  INTEGER, id_animal INTEGER, id_resultado INTEGER, obs text, data text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_ocorrenciaxanimal VALUES (?,?,?,?,?,?,?,?,?,?,?)', [id_ocorrencia, id_ocorrencia_lote, id_evento_sanitario, id_animal, id_resultado, obs, null, null, null, sync, id_fazenda]);		
						
							cont=cont+1;
							if(cont>=contA)
							{
								sanitarioLoteTab();
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos individuais", true);	
							}	
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
			});				
		});			
	}	
	
	function sanitarioLoteTab()
	{
		var url8 = 'http://'+ip+"/serverTablet/sanitarioLote.php";
		db.transaction(function (tx) 
		{
			tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data text, hash text, user text, sync text, id_fazenda text)');

			tx.executeSql("SELECT * FROM t_ocorrenciaxlote ORDER BY id_ocorrencia_sanitaria ASC", [], function (tx, resultSet8) 
			{
				contA = resultSet8.rows.length;
				
				if(contA==0)
				{
					sanitarioLoteMysql();
				}
				else
				{				
					var cont=0;
					
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
							'obs':resultSet8.rows.item(x).obs,	
							'hash':resultSet8.rows.item(x).hash,
							'user':resultSet8.rows.item(x).user,					
							'sync':resultSet8.rows.item(x).sync,					
							'id_fazenda':resultSet8.rows.item(x).id_fazenda,					
							},
							success: function(data){},
							error: function(erro){}
						});
						cont=cont+1;
						if(cont>=contA)
						{
							sanitarioLoteMysql();
						}
						else
						{
							window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos por lote", true);	
						}					
					}				
				}				
			});			
		});		
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
				
				var contA=0;
				$.each(result, function(i, field)
				{
					contA=contA+1;
				});
				if(contA==0)
				{
					navigator.notification.alert('Carga concluída com sucesso!', alertCallback,  'Notificação', 'OK');
					window.plugins.spinnerDialog.hide();
					location.href='menu.html';
				}
				else
				{				
					var cont=0;	
					
					$.each(result, function(i, field)
					{	
						var id_ocorrencia_sanitaria	= field.id_ocorrencia_sanitaria;
						var id_evento_sanitario    	= field.id_evento_sanitario;
						var id_lote    				= field.id_lote;
						var id_resultado    		= field.id_resultado;
						var data    		        = field.data;
						var id_fazenda    		    = field.id_fazenda;
						var sync    				= 1;
													
						db.transaction(function(tx) 
						{
							tx.executeSql('CREATE TABLE IF NOT EXISTS t_ocorrenciaxlote (id_ocorrencia_sanitaria INTEGER PRIMARY KEY AUTOINCREMENT, id_evento_sanitario INTEGER, id_lote INTEGER, id_resultado INTEGER, data text, hash text, user text, sync text, id_fazenda text)');
							tx.executeSql('INSERT INTO t_ocorrenciaxlote VALUES (?,?,?,?,?,?,?,?,?)', [id_ocorrencia_sanitaria, id_evento_sanitario, id_lote, id_resultado, data, null, null, sync, id_fazenda]);		
							cont=cont+1;
							if(cont>=contA)
							{
								navigator.notification.alert('Carga concluída com sucesso!', alertCallback,  'Notificação', 'OK');
								window.plugins.spinnerDialog.hide();
								location.href='menu.html';
							}
							else
							{
								window.plugins.spinnerDialog.show("Sincronização em andamento", "Sincronizando eventos por lote", true);	
							}		
							
						}, function(error) {
						alert('Transaction ERROR: ' + error.message);
						}, function() {});

					});
				}
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
	
	$("#atualizar").click(function() 
	{	
		navigator.notification.confirm('Deseja atualizar o aplicativo com a versão mais recente?', onConfirmUpdate, 'Notificação',  ['Atualizar','Cancelar']);
	});	
	
	
	function onConfirmUpdate(button)
	{	
		if (button == 1) 
		{
			db.transaction(function (tx) 
			{				
				var query = "SELECT * FROM t_parametros";

				tx.executeSql(query, [], function (tx, resultSet) 
				{ 
					var atualizacao = resultSet.rows.item(0).atualizacao;				
					
					var fileTransfer = new FileTransfer();
					var uri 		 = encodeURI(atualizacao);
					var fileURL 	 = cordova.file.externalDataDirectory+'garoupa.apk';
					window.plugins.spinnerDialog.show("Notificação","Fazendo download da atualização", true);
					fileTransfer.download(
						uri,
						fileURL,
						function(entry) {
							window.plugins.spinnerDialog.hide();
							navigator.notification.alert('Download finalizado. Clique em instalar!', alertCallback,  'Notificação', 'OK');
							cordova.plugins.fileOpener2.open(
							fileURL, 
							'application/vnd.android.package-archive'
							);
						},
						function(error) {
							window.plugins.spinnerDialog.hide();
							navigator.notification.alert('Nenhuma atualização disponível no momento!', alertCallback,  'Notificação', 'OK');
							
						},
						false,
						{
							headers: {
								"Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
							}
						}
					);	
				});		
			});
		}
	}
	
});	