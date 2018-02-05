/*
var systemEndpoint = 'http://live.dbpedia.org/sparql';
var systemGraph = null;
var systemQueryExecutor = 'livedbpediaLike';
*/

var systemEndpoint = 'http://dbpedia.org/sparql';
var systemGraph = '<http://dbpedia.org>';
var systemQueryExecutor = 'dbpediaLike';

var QueryExecutor = function () { 
	if(QueryExecutor.prototype._singletonInstance){
		return QueryExecutor.prototype._singletonInstance;
	}

 	QueryExecutor.prototype._singletonInstance = new (eval(systemQueryExecutor+''))(systemEndpoint, systemGraph);

 //funzione negli executor specifici che cambia la label di default e chiede per le label degli elemnti gia inseriti
//OGNI funzione deve controllare che sta restituendo le label nella lingua giusta (accede a mamma di traduzione) 

};