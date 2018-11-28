var itLanguageManager = function () {
	if(itLanguageManager.prototype._singletonInstance){
		return itLanguageManager.prototype._singletonInstance;
	}

	itLanguageManager.prototype._singletonInstance = this;
};

//Return a or an according to how noun starts
itLanguageManager.prototype.getArticle = function(noun){
	var article;
	
	if(noun in itLanguageManager.prototype.labelsinfo){
		var info = itLanguageManager.prototype.labelsinfo[noun];
		if(info[0]=='f'){
			if(info[1]=='s')
				article = 'la';
			else
				article = 'le';
		}else
			article = 'i';

	}else
		article = 'il';

	return article;
}

/*
	Return verbalization object given a conceprLabel
	Verbalization object's structure : 
		verbalization = {
			standard: [], // standard one
			modified: [], // when specialize a prev noun (concept or predicate)
			negated: [], // when 'not' is its father
			optional: [], // when 'optional' is its father
			truncated: [],  
			first: [], // when concept is the query's subject
			current: []};
*/
itLanguageManager.prototype.verbalizeConcept = function(conceptLabel){
	verbalization = {
		standard: [],
		modified: [],
		negated: [],
		optional: [],
		truncated: [],
		first: [],
		current: []};

	verbalization.standard.push('');
	verbalization.standard.push(conceptLabel + ' ');
	verbalization.standard.push('');

	verbalization.modified.push('che &egrave; ');
	verbalization.modified.push(conceptLabel + ' ');
	verbalization.modified.push('');

	verbalization.negated.push('che ');
	verbalization.negated.push('non ');
	verbalization.negated.push('&egrave; ');
	verbalization.negated.push(conceptLabel + ' ');
	verbalization.negated.push('');	

	verbalization.optional.push('che &egrave; ');
	verbalization.optional.push('opzionalmente ');
	verbalization.optional.push('');
	verbalization.optional.push(conceptLabel + ' ');
	verbalization.optional.push('');

	verbalization.truncated.push('&egrave; ');
	verbalization.truncated.push(conceptLabel + ' ');
	verbalization.truncated.push('');

	verbalization.first.push(' ');
	verbalization.first.push(conceptLabel + ' ');
	verbalization.first.push('');

	verbalization.current = verbalization.standard;

	return verbalization;

}

itLanguageManager.prototype.verbalizePredicate = function(predicateLabel, predicateDirection){
	verbalization = {
		standard: [],
		modified: [],
		truncated: [],
		negated: [],
		optional: [],
		first: [],
		current: []};


	if(predicateDirection == 'direct'){

		if(itLanguageManager.prototype.startsWithVerb(predicateLabel, predicateDirection)){
			verbalization.standard.push('che ');
			verbalization.standard.push(predicateLabel + ' ');
			verbalization.standard.push('');

			verbalization.modified.push('il cui ');
			verbalization.modified.push(predicateLabel + ' ');
			verbalization.modified.push('');

			verbalization.negated.push('che ');
			verbalization.negated.push('non ');
			verbalization.negated.push('');
			verbalization.negated.push(predicateLabel + ' ');
			verbalization.negated.push('');

			verbalization.optional.push('che ');
			verbalization.optional.push('opzionalmente ');
			verbalization.optional.push('');
			verbalization.optional.push(predicateLabel + ' ');
			verbalization.optional.push('');

			verbalization.truncated.push('');
			verbalization.truncated.push(predicateLabel + ' ');
			verbalization.truncated.push('');

			//direct predicate should not be the first node
			verbalization.first.push(' che ');
			verbalization.first.push(predicateLabel + ' ');
			verbalization.first.push('');

		}else{
			verbalization.standard.push('che ha ');
			verbalization.standard.push(predicateLabel + ' ');
			verbalization.standard.push('');

			verbalization.modified.push(itLanguageManager.prototype.getArticle(predicateLabel)+' cui ');
			verbalization.modified.push(predicateLabel + ' ');
			verbalization.modified.push('');

			verbalization.negated.push('che ');
			verbalization.negated.push('non ');
			verbalization.negated.push('ha ');
			verbalization.negated.push(predicateLabel + ' ');
			verbalization.negated.push('');

			verbalization.optional.push('che ha ');
			verbalization.optional.push('opzionalmente ');
			verbalization.optional.push('');
			verbalization.optional.push(predicateLabel + ' ');
			verbalization.optional.push('');

			verbalization.truncated.push('ha ');
			verbalization.truncated.push(predicateLabel + ' ');
			verbalization.truncated.push('');

			//direct predicate should not be the first node
			verbalization.first.push(' che ha ');
			verbalization.first.push(predicateLabel + ' ');
			verbalization.first.push('');

		}

	}else if(predicateDirection == 'reverse'){
		var postLabel = 'di ';
		if(itLanguageManager.prototype.endsWithPreposition(predicateLabel, predicateDirection))
			postLabel = ' ';

		if(itLanguageManager.prototype.startsWithVerb(predicateLabel, predicateDirection)){

			verbalization.standard.push('che ');
			verbalization.standard.push(predicateLabel + ' ');
			verbalization.standard.push(postLabel);

			verbalization.modified.push('');
			verbalization.modified.push(predicateLabel + ' ');
			verbalization.modified.push(postLabel);

			verbalization.negated.push('che ');
			verbalization.negated.push('non ');
			verbalization.negated.push('');
			verbalization.negated.push(predicateLabel + ' ');
			verbalization.negated.push(postLabel);

			verbalization.optional.push('che ');
			verbalization.optional.push('opzionalmente ');
			verbalization.optional.push('');
			verbalization.optional.push(predicateLabel + ' ');
			verbalization.optional.push(postLabel);

			verbalization.truncated.push('');
			verbalization.truncated.push(predicateLabel + ' ');
			verbalization.truncated.push(postLabel);

			verbalization.first.push(' che ');
			verbalization.first.push(predicateLabel + ' ');
			verbalization.first.push(postLabel);

		}else{
			verbalization.standard.push('che &egrave; ');
			verbalization.standard.push(predicateLabel + ' ');
			verbalization.standard.push(postLabel);

			verbalization.modified.push('');
			verbalization.modified.push(predicateLabel + ' ');
			verbalization.modified.push(postLabel);

			verbalization.negated.push('che ');
			verbalization.negated.push('non ');
			verbalization.negated.push('&egrave; ');
			verbalization.negated.push(predicateLabel + ' ');
			verbalization.negated.push(postLabel);

			verbalization.optional.push('che ');
			verbalization.optional.push('opzionalmente ');
			verbalization.optional.push('&egrave; ');
			verbalization.optional.push(predicateLabel + ' ');
			verbalization.optional.push(postLabel);

			verbalization.truncated.push('&egrave; ');
			verbalization.truncated.push(predicateLabel + ' ');
			verbalization.truncated.push(postLabel);

			verbalization.first.push(' che &egrave; ');
			verbalization.first.push(predicateLabel + ' ');
			verbalization.first.push(postLabel);
		}
	}
	
	verbalization.current = verbalization.standard;

	return verbalization;

}

itLanguageManager.prototype.verbalizeSomething = function(){

	verbalization = {
		standard: ['qualcosa '],
		current: ['qualcosa ']};

	return verbalization;

}

itLanguageManager.prototype.getSomethingLabelVerbalization = function(){

	return 'qualcosa ';

}

itLanguageManager.prototype.verbalizeEverything = function(){

	verbalization = {
		standard: [' tutto ci&ograve; '],
		first: [' tutto ci&ograve; '],
		current: [' tutto ci&ograve; ']};

	return verbalization;

}

itLanguageManager.prototype.getEverythingLabelVerbalization = function(){

	return 'tutto ci&ograve;  ';

}

itLanguageManager.prototype.getOrdinalNumber = function(cardinalNumber){
	var ordinalNumber = '';
	
	switch(cardinalNumber){
		/*case 1 : ordinalNumber = '1st'; break;
		case 2 : ordinalNumber = '2nd'; break;
		case 3 : ordinalNumber = '3rd'; break;*/
		default : ordinalNumber = cardinalNumber+'&ordm;'; break;
	}

	return ordinalNumber;
}

itLanguageManager.prototype.endsWithPreposition = function(label){
	var preposition = [" da", " di", " a", " anche", " per"]; 
	for(var i=0; i<preposition.length; i++){
		if(label.endsWith(preposition[i]))
			return true;
	}
	return false;
}

itLanguageManager.prototype.verbalizeOperator = function(operator){

	var verbalization = {
		standard: ['che ', operator+' ', ''],
		truncated: ['', operator+' ', ''],
		negated: ['che ', 'non ', '&egrave; ', operator+' ', ''],
		optional : ['che &egrave; ', 'opzionalmente ','', operator+' ', '']};

	verbalization.current = verbalization.standard;

	switch(operator){
		case '<':
			verbalization.standard = ['che &egrave; ','minore ','di '];
			verbalization.truncated = ['','minore ','di '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'minore ','di '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'minore ','di '];
			verbalization.current = verbalization.standard;
			break;
		case '<=':
			verbalization.standard = ['che &egrave; ','minore o uguale ','di '];
			verbalization.truncated = ['','minore o uguale ','di '];
			verbalization.negated = ['che ', 'non ', '&egrave; ','minore o uguale ','di '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '','minore o uguale ','di '];
			verbalization.current = verbalization.standard;
			break;
		case '>':
			verbalization.standard = ['che &egrave; ','maggiore ','di '];
			verbalization.truncated = ['','maggiore ','di '];
			verbalization.negated = ['che ', 'non ', '&egrave; ','maggiore ','di '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'maggiore ','di '];
			verbalization.current = verbalization.standard;
			break;
		case '>=':
			verbalization.standard = ['che &egrave; ','maggiore o uguale ','di '];
			verbalization.truncated = ['','maggiore o uguale ','di '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'maggiore o uguale ','di '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'maggiore o uguale ','di '];
			verbalization.current = verbalization.standard;
			break;
		case '=':
			verbalization.standard = ['che &egrave; ','uguale ','a '];
			verbalization.truncated = ['','uguale ','a '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'uguale ','a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'uguale ','a '];
			verbalization.current = verbalization.standard;
			break;
		case 'is string':
			verbalization.standard = ['che &egrave; ','uguale ','a '];
			verbalization.truncated = ['','uguale ','a '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'uguale ','a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'uguale ','a '];
			verbalization.current = verbalization.standard;
			break;
		case 'is url':
			verbalization.standard = ['che &egrave; ','uguale ','a '];
			verbalization.truncated = ['','uguale ','a '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'uguale ','a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'uguale ','a '];
			verbalization.current = verbalization.standard;
			break;
		case 'is date':
			verbalization.standard = ['che &egrave; ','uguale ','a '];
			verbalization.truncated = ['','',''];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'uguale ', 'a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'uguale ', 'a '];
			verbalization.current = verbalization.standard;
			break;
		case 'range':
			verbalization.standard = ['che &egrave; ','tra ',''];
			verbalization.truncated = ['','tra ',''];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'tra ',''];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'tra ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'range date':
			verbalization.standard = ['che &egrave; ','tra ',''];
			verbalization.truncated = ['','tra ',''];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'tra ',''];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'tra ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'and':	
			verbalization.standard = ['e '];
			verbalization.current = verbalization.standard;
			break;
		/*case 'or':	
			verbalization.standard = ['o (inclusivo) '];
			verbalization.current = verbalization.standard;
			break;
		*/
		case 'or':	
			verbalization.standard = ['o '];
			verbalization.current = verbalization.standard;
			break;
		case 'not':
			verbalization.standard = ['non '];
			verbalization.current = verbalization.standard;
			break;
		case 'optional':
			verbalization.standard = ['opzionalmente '];
			verbalization.current = verbalization.standard;
			break;
		case 'lang':
			verbalization.standard = ['che &egrave; ','in lingua ',''];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'in lingua ',''];
			verbalization.optional = ['che &egrave; ','opzionalmente ', '', 'in lingua ',''];
			verbalization.current = verbalization.standard;
			break;

		case 'before':
			verbalization.standard = ['che &egrave; ','precedente ','a '];
			verbalization.truncated = ['','precedente ','a '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'precedente ','a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'precedente ','a '];
			verbalization.current = verbalization.standard;
			break;
		case 'after':
			verbalization.standard = ['che &egrave; ','successiva ','a '];
			verbalization.truncated = ['','successiva ','a '];
			verbalization.negated = ['che ', 'non ', '&egrave; ', 'successiva ','a '];
			verbalization.optional = ['che &egrave; ', 'opzionalmente ', '', 'successiva ','a '];
			verbalization.current = verbalization.standard;
			break;
		case 'starts with':
			verbalization.standard = ['che ','inizia ','per '];
			verbalization.truncated = ['','inizia ','per '];
			verbalization.negated = ['che ', 'non ', '', 'inizia ','per '];
			verbalization.optional = ['che ', 'opzionalmente ', '', 'inizia ','per '];
			verbalization.current = verbalization.standard;
			break;
		case 'ends with':
			verbalization.standard = ['che ','termina ','con '];
			verbalization.truncated = ['','termina ','con '];
			verbalization.negated = ['che ', 'non ', '', 'termina ','con '];
			verbalization.optional = ['che ', 'opzionalmente ', '', 'termina ','con '];
			verbalization.current = verbalization.standard;
			break;
		case 'contains':
			verbalization.standard = ['che ','contiene ',''];
			verbalization.truncated = ['','contiene ',''];
			verbalization.negated = ['che ', 'non ', '', 'contiene ',''];
			verbalization.optional = ['che ', 'opzionalmente ', '', 'contiene ',''];
			verbalization.current = verbalization.standard;
			break;

	}

	return verbalization;

}

itLanguageManager.prototype.getDefaultConjunction = function(){
	return 'e ';
}

itLanguageManager.prototype.verbalizeResult = function(result){

	var verbalization = {
		standard: [result+' '],
		current: [result+' ']};

	return verbalization;

}

//First part of query verbalization
itLanguageManager.prototype.getQueryStartVerbalization = function(){
	return 'Dammi ';
}

//Initialization of query
itLanguageManager.prototype.getQueryInitialVerbalization = function(){
	return 'Dammi...';
}

itLanguageManager.prototype.getFocusLabel = function(){
	return 'Focus: ';
}

itLanguageManager.prototype.getFocusInitialVerbalization = function(){
	return '-';
}

itLanguageManager.prototype.getTabTitle = function(tabType){
	var title = '';
	switch(tabType){
		case 'concept' : title = 'Concetti'; break;
		case 'predicate' : title = 'Predicati'; break;
		case 'operator' : title = 'Operatori'; break;
		case 'table result' : title = 'Tabella dei risultati'; break;
		case 'settings' : title = 'Impostazioni'; break;
		case 'direct predicate' : title = 'Diretti'; break;
		case 'reverse predicate' : title = 'Inversi'; break;
		case 'help' : title = 'Guida'; break;
	}
	return title;
}

itLanguageManager.prototype.getBoxTitle = function(boxType){
	var title = '';
	switch(boxType){
		case 'result' : title = 'Sostituisci il risultato in focus'; break;
	}
	return title;
}

itLanguageManager.prototype.getInputPlaceholder = function(inputType){
	var placeholder;

	switch(inputType){
		case 'concept' : placeholder = "Cerca un concetto"; break;
		case 'predicate' : placeholder = "Cerca un predicato"; break;
		case 'result' : placeholder = "Cerca un risultato"; break;
	}

	return placeholder;
}

itLanguageManager.prototype.getOperatorLabelVerbalization = function(operator){	
	var label;	

	switch(operator){
		case 'and': 
			label = 'e ';
			break;
		/*case 'or': 
			label = 'o (inclusivo) ';
			break;
		*/
		case 'or': 
			label = 'o ';
			break;
		case 'not': 
			label = 'non ';
			break;
		case 'optional': 
			label = 'opzionalmente ';
			break;
		case 'limit': 
			label = '';
			break;
		case '<': 
			label = 'minore ';
			break;
		case '<=': 
			label = 'minore o uguale ';
			break;
		case '>': 
			label = 'maggiore ';
			break;
		case '>=': 
			label = 'maggiore o uguale ';
			break;
		case '=': 
			label = 'uguale ';
			break;
		case 'starts with': 
			label = 'inizia con ';
			break;
		case 'ends with': 
			label = 'finisce con ';
			break;
		case 'contains': 
			label = 'contiene ';
			break;
		case 'lang': 
			label = 'in lingua  ';
			break;
		case 'before': 
			label = 'precedente a ';
			break;
		case 'after': 
			label = 'successiva a ';
			break;
		case 'is string':
		case 'is url':
		case 'is date':
			label = '&egrave;';
			break;
		case 'range':
		case 'range date':
			label = 'tra';
			break;
		default: 
			label = operator;
			break;
	}

	return label;

}

itLanguageManager.prototype.getDatatypeLabel = function(datatype){
	var label;

	switch(datatype){
		case 'number' : 
			label = 'Operatori su numeri'; break;
		case 'string' : 
		case 'literal' : 
			label = 'Operatori su stringhe'; break;
		case 'date' : 
		case 'time' : 
		case 'dateTime' : 
		case 'gDay' : 
		case 'gMonth' : 
		case 'gMonthDay' : 
		case 'gYear' : 
		case 'gYearMonth' : 
			label = 'Operatori su date'; break;
		case 'uri' : 
			label = 'Operatori su url'; break;
		case 'boolean' : 
			label = 'Operatori su booleani'; break;
		case 'img' : 
			label = 'Operatori su immagini'; break;
	}

	return label;
}

itLanguageManager.prototype.getReusableResultListTitle = function(position){
	var label;

	switch(position){
		case 0 : 
			label = 'Risultati iniziali'; break;
		case 1 : 
			label = 'Risultati aggiornati'; break;
	}

	return label;
}

itLanguageManager.prototype.getUserInputHint = function(){	
	return 'Inserisci il tuo valore: ';
}

itLanguageManager.prototype.getButtonLabel = function(button){
	var label;

	switch(button){
		case 'confirm' : 
			label = 'OK';
			break;
		case 'remove':
			label = 'Rimuovi';
			break;
		case 'close':
			label = 'Chiudi';
			break;
		case 'removeFocus': //remove higlighted part of query
			label = 'Rimuovi il focus e le parti relate';
			break;
		case 'confirmUserInput': //confirm user value to complete operator
			label = 'OK';
			break;
		case 'discardButton':
			label = "Cancella l'operatore";
			break;
		case 'visibleFields':
			label = 'Campi visibili';
			break;
		case 'sparqlQuery':
			label = 'Confronta la query in linguaggio naturale con la query SPARQL';
			break;
		case 'saveTable':
			label = 'Salva la tabella dei risultati';
			break;
	}

	return label;
}


itLanguageManager.prototype.startsWithVerb = function(predicateLabel, direction){
	return predicateLabel.startsWith('ha ')||predicateLabel.startsWith('è ');
}


itLanguageManager.prototype.getPredicateVerbalization = function(predicateLabel, direction){
	var label;

	if(itLanguageManager.prototype.startsWithVerb(predicateLabel, direction))
		label = 'che '+ predicateLabel;
	else if(direction == 'direct')
		label =	'che ha ' + predicateLabel; 
	else
		label =	'che &egrave; ' + predicateLabel; 
	
	return label; 
}
/*
itLanguageManager.prototype.getHintOperatorManager = function(about){
	var hint;

	switch(about){
		case 'reusableResult': 
			hint = 'These results are related to the following query: '; break;
	}

	return hint;
}
*/
itLanguageManager.prototype.getFieldTitle = function(select){
 var label; 

 switch(select){
  case 'label lang': label = 'Scegli la lingua delle label'; break;
  case 'system lang': label = 'Scegli la lingua del sistema'; break;
  case 'num concepts': label = 'Cambia il numero di concetti restituiti'; break;
  case 'num predicates': label = 'Cambia il numero di predicati restituiti'; break;
  case 'default order table': label = 'Tabella dei risultati sempre ordinata';break;
  case 'selected endpoint': label = 'Endpoint selezionato: ';break;
 }

 return label;
}

itLanguageManager.prototype.getHelpGuide = function(){
	var headers = [];

	var overviewObj = {title : 'Panoramica', content : []};
	overviewObj.content.push('<b>SPLOD</b> ti aiuter&agrave; a usare i LOD (Linked Open Data) e a visualizzare i risultati in formato tabellare. Non &egrave; necessario conoscere SPARQL o la struttura dei dati sottostanti per usarlo: SPLOD nasconderà la complessità sottostante e ti guiderà attraverso il contenuto dei box e continui feedback.');
	headers.push(overviewObj);

	var boxesObj = {title : 'Cosa c\'&egrave; in ogni box?', content : []};
	boxesObj.content.push('<b>Il tab dei concetti</b> contiene, inizialmente, tutti i concetti <i>dichiarati</i> e accessibili dall\'endpoint che hai selezionato al primo passo. Dalla prima interazione, SPLOD recuperer&agrave; tutti i concetti usati, forse addirittura uscendo dall\'endpoint selezionato se lui &egrave; connesso a altri vocabolari o viceversa. Chiamiamo <b>concetti</b> le classi connesse a <i>subject</i> o <i>object</i> nei dati in formato RDF. <img width="100%" src="./controllets/splod-controllet/splodjs/img/it_concept.png"/>');
	boxesObj.content.push('<b>Il tab dei predicati</b> contiene tutti i predicati <i>usati</i> e accessibili dall\'endpoint che hai selezionato al primo passo. Nell\'immagine puoi vedere il predicato <i>dbo:birthPlace</i> usato in un caso come predicato diretto e nell\'altro come predicato inverso, dipende dalla posizione dell\'elemento a cui sei interessato: se appare come subject, il predicato &egrave; diretto, altrimento &egrave; inverso. <img width="100%" src="./controllets/splod-controllet/splodjs/img/it_predicate.png"/>');
	boxesObj.content.push('<b>Il tab degli operatori</b> ti fornisce la possibilit&agrave; di filtrare i dati o applicare operatori a livello di query. Gli operatori dipendono dal datatype dell\'elemento su cui &egrave; posto il focus. Se l\'operatore deve essere completato da uno o pi&ugrave; risultati, tu li troverai in questo stesso box dopo aver selezionato l\'operatore.');
	boxesObj.content.push('<b>Il tab della tabella dei risultati</b> ti mostra i risultati della query in formato tabellare. Tu puoi nascondere dei campi o ordinare la tabella. Sorvolando sul badge del numero di elementi nella tabella, puoi vedere una sua anteprima.<img width="100%" src="./controllets/splod-controllet/splodjs/img/it_resultsTable.png"/>');
	boxesObj.content.push('<b>Il tab delle impostazioni</b> ti fornisce la possibilit&agrave; di <ul><li>cambiare il numero di concetti mostrati,</li><li>cambiare il numero di predicati mostrati,</li><li>cambiare la lingua del sistema,</li><li>chiedere risultati sempre ordinati.</li></ul>');
	headers.push(boxesObj);

	var queryNLObj = {title : 'Query in linguaggio naturale', content : []};
	queryNLObj.content.push('<b>SPLOD</b> cerca di verbalizzare le tue interazioni creando la stessa richiesta che avresti posto tu ad un\'altra persona.<br>I colori ti guideranno a una piacevole comprensione della richiesta.<br><img width="100%" src="./controllets/splod-controllet/splodjs/img/it_NLquery.png"/><br>ATTENZIONE: se vedi della parole barrate forse le tue interazioni non hanno prodotto una richiesta valida. Ad esempio le query nell\' esempio sono diverse: la prima significa "Dammi gli scienziati senza luogo di nascita", la seconda "Dammi gli scienziati che non sono nati a Barlino".<br><img width="100%" src="./controllets/splod-controllet/splodjs/img/it_not.png"/><br>');
	headers.push(queryNLObj);

	var focusObj = {title : 'Focus : come funziona', content : []};
	focusObj.content.push('In funzione dell\'elemento evidenziato, <b>SPLOD</b> riempir&agrave; tutti i campi e costruir&agrave; la tua richiesta.<br>In funzione delle tue interazioni il focus verr&agrave; aggiornato.<br>In qualsiasi momento potrai cambiare l\'elemento in focus.');
	headers.push(focusObj);

	var querySPARQLObj = {title : 'Query SPARQL', content : []};
	querySPARQLObj.content.push('<b>SPARQL</b> &egrave; il linguaggio standard per le query semantiche sui LOD.<br>In funzione delle tue interazioni <b>SPLOD</b> costruir&agrave; automaticamente la tua query.<br>Puoi imparare qualcosa di pi&ugrave; su SPARQL aprendo la visualizzazione con query affiancate.<br>Cambiando il focus il sistema sottolineer&agrave; la corrispettiva parte nella query.');
	headers.push(querySPARQLObj);

	return headers;

}

itLanguageManager.prototype.getOperatorFieldVerbalization = function(cardinalNumber){
	return itLanguageManager.prototype.getOrdinalNumber(cardinalNumber) + ' operando';
}

itLanguageManager.prototype.labels = {
		'type' : 'tipo',
		'seealso' : 'vedi anche',
		'sameas' : 'uguale a',
		'subject' : 'argomento',
		'label' : 'etichetta',
		'wasderivedfrom' : 'deriva da',
		'primarytopic' : 'argomento principale',
		'isprimarytopicof' : 'è argomento principale di',
		'language' : 'lingua',
		'abstract' : 'sommario',
		'comment' : 'commento',
		'name' : 'nome',
		'hasphotocollection' : 'ha una collezione di foto',
		'rights' : 'diritti',
		'description' : 'descrizione',
		'team' : 'squadra',
		'depiction' : 'raffigurazione',
		'title' : 'titolo',
		'subdivisiontype' : 'tipo di suddivisione',
		'thumbnail' : 'miniatura',
		'givenname' : 'nome dato',
		'point' : 'punto',
		'shortdescription' : 'breve descrizione',
		'surname' : 'cognome',
		'birthplace' : 'luogo di nascita',
		'birthdate' : 'data di nascita',
		'subdivisionname' : 'nome di suddivisione',
		'birthyear' : 'anno di nascita',
		'dateofbirth' : 'data di nascita',
		'lat' : 'latitudine',
		'long' : 'longitudine',
		'goals' : 'obiettivi',
		'placeofbirth' : 'luogo di nascita',
		'ispartof' : 'è parte di',
		'years' : 'anni',
		'length' : 'lunghezza',
		'date' : 'data',
		'careerstation' : 'stazione di carriera',
		'genre' : 'genere',
		'country' : 'paese',
		'clubs' : 'club',
		'location' : 'luogo',
		'numberofgoals' : 'numero di goal',
		'numberofmatches' : 'numero di partite',
		'deathdate' : 'data di morte',
		'deathyear' : 'anno di morte',
		'dateofdeath' : 'data di morte',
		'equivalentclass' : 'classe equivalente',
		'caption' : 'didascalia',
		'subclassof' : 'sottoclasse di',
		'votes' : 'voti',
		'percentage' : 'percentuale',
		'caps' : 'berretto',
		'candidate' : 'candidato',
		'starring' : 'interprete',
		'family' : 'famiglia',
		'settlementtype' : 'tipo di insediamento',
		'populationtotal' : 'popolazione totale',
		'producer' : 'produttore',
		'occupation' : 'occupazione',
		'writer' : 'scrittore',
		'order' : 'ordine',
		'episodenumber' : 'numero di episodio',
		'deathplace' : 'luogo di morte',
		'class' : 'classe',
		'children' : 'figli',
		'gender' : 'genere',
		'height' : 'altezza',
		'weight' : 'peso',
		'associatedact' : 'atto associato',
		'birthname' : 'nome di nascita',
		'child' : 'figlio',
		'knownfor' : 'conosciuto per',
		'nationality' : 'nazionalità',
		'numberoffilms' : 'numero di film',
		'parent' : 'genitore',
		'spouse' : 'sposa',
		'stateoforigin' : 'stato di origine',
		'voicetype' : 'tipo di voce',
		'eyecolor' : 'colore degli occhi',
		'haircolor' : 'colore di capelli',
		'after' : 'dopo',
		'ancestry' : 'ascendenza',
		'before' : 'prima',
		'honorificprefix' : 'prefisso onorifico',
		'imagesize' : 'dimensione dell\'immagine',
		'origin' : 'origine',
		'religion' : 'religione',
		'residence' : 'residenza',
		'species' : 'specie',
		'only' : 'solo',
		'differentfrom' : 'diverso da',
		'instrument' : 'strumento',
		'artist' : 'artista',
		'author' : 'autore',
		'bandmember' : 'membro della band',
		'cinematography' : 'cinematografia',
		'creator' : 'creatore',
		'currentmember' : 'membro corrente',
		'director' : 'direttore',
		'foundedby' : 'fondato da',
		'guest' : 'ospite',
		'head' : 'testa',
		'influenced' : 'influenzato',
		'influencedby' : 'influenzato da',
		'keyperson' : 'persona chiave',
		'musicalartist' : 'artista musicale',
		'musicalband' : 'gruppo musicale',
		'narrator' : 'narratore',
		'partner' : 'collaboratore',
		'portrayer' : 'ritrattista',
		'presenter' : 'presentatore',
		'president' : 'presidente',
		'relation' : 'relazione',
		'trainer' : 'allenatore',
		'voice' : 'voce',
		'judges' : 'giudici',
		'directedby' : 'diretto da',
		'music' : 'musica',
		'note' : 'nota',
		'story' : 'storia',
		'students' : 'studenti',
		'teacher' : 'insegnante',
		'winner' : 'vincitore',
		'writtenby' : 'scritto da',
		'guests' : 'ospiti',
		'lyrics' : 'testi',
		'composer' : 'compositore',
		'executiveproducer' : 'produttore esecutivo',
		'musiccomposer' : 'compositore di musica',
		'acts' : 'atti',
		'presenters' : 'presentatori',
		'associatedband' : 'gruppo associato',
		'associatedmusicalartist' : 'artista musicale associato',
		'winningteam' : 'squadra vincitrice',
		'actor' : 'attore',
		'influences' : 'influenze',
		'voiceactor' : 'voce dell\'attore ',
		'originalartist' : 'artista originale',
		'voices' : 'voci',
		'game' : 'gioco',
		'archeologist' : 'archeologo',
		'aristocrat' : 'aristocratico',
		'economist' : 'economista',
		'egyptologist' : 'egittologo',
		'farmer' : 'contadino',
		'horsetrainer' : 'allenatore di cavalli',
		'lawyer' : 'legale',
		'linguist' : 'linguista',
		'memberresistancemovement' : 'membro del movimento di resistenza',
		'model' : 'modello',
		'moviedirector' : 'regista',
		'noble' : 'nobile',
		'officeholder' : 'titolare dell\'ufficio',
		'organisationmember' : 'membro dell\'organizzazione',
		'orphan' : 'orfano',
		'philosopher' : 'filosofo',
		'politician' : 'politico',
		'politicianspouse' : 'moglie del politico',
		'presenter' : 'presentatore',
		'producer' : 'produttore',
		'psychologist' : 'psicologo',
		'religious' : 'religioso',
		'romanemperor' : 'imperatore romano',
		'royalty' : 'reali',
		'scientist' : 'scienziato',
		'televisiondirector' : 'regista televisivo',
		'televisionpersonality' : 'personalità televisiva',
		'theatredirector' : 'regista teatrale',
		'writer' : 'scrittore',
		'voiceactor' : 'voce dell\'attore',
		'clericaladministrativeregion' : 'regione amministrativa clericale',
		'governmentaladministrativeregion' : 'regione amministrativa di governo',
		'historicalareaofauthority' : 'area storica dell\'autorità',
		'employer' : 'impiegato',
		'family' : 'famiglia',
		'organisation' : 'organizzazione',
		'embryology' : 'embriologia',
		'ligament' : 'legamento',
		'muscle' : 'muscolo',
		'nerve' : 'nervo',
		'vein' : 'vena',
		'crustacean' : 'crostaceo',
		'fish' : 'pesce',
		'insect' : 'insetto',
		'mollusca' : 'molluschi',
		'reptile' : 'rettile',
		'amusementparkattraction' : 'attrazione del parco di divertimento',
		'gate' : 'cancello',
		'infrastructure' : 'infrastruttura',
		'militarystructure' : 'struttura militare',
		'pyramid' : 'piramide',
		'square' : 'piazza',
		'tower' : 'torre',
		'venue' : 'strada',
		'comedian' : 'comico',
		'comicscreator' : 'disegnatore di fumetti',
		'humorist' : 'umorista',
		'musicalartist' : 'artista musicale',
		'painter' : 'pittore',
		'sculptor' : 'scultore',
		'painting' : 'dipinto',
		'cyclist' : 'ciclista',
		'golfplayer' : 'giocatore di golf',
		'gymnast' : 'ginnasta',
		'horserider' : 'cavallerizzo',
		'pokerplayer' : 'giocatore di poker',
		'soccerplayer' : 'calciatore',
		'rugbyplayer' : 'giocatore di rugby',
		'tabletennisplayer' : 'giocatore di ping pong',
		'teammember' : 'membro di un gruppo',
		'tennisplayer' : 'giocatore di tennis',
		'volleyballplayer' : 'giocatore di pallavolo',
		'gene' : 'gene',
		'hormone' : 'ormone',
		'wintersportplayer' : 'giocatore di sport invernali',
		'lake' : 'lago',
		'ocean' : 'oceano',
		'sea' : 'mare',
		'radiostation' : 'stazione radio',
		'historicbuilding' : 'costruzione storica',
		'hospital' : 'ospedale',
		'library' : 'biblioteca',
		'museum' : 'museo',
		'restaurant' : 'ristorante',
		'shoppingmall' : 'centro commerciale',
		'galaxy' : 'galassia',
		'planet' : 'pianeta',
		'satellite' : 'satellite',
		'drug' : 'droga',
		'capitalofregion' : 'capitale della regione',
		'pope' : 'papa',
		'saint' : 'santo',
		'vicar' : 'vicario',
		'comicstrip' : 'fumetto',
		'lunarcrater' : 'cratere lunare',
		'image' : 'immagine',
		'sound' : 'suono',
		'guitar' : 'chitarra',
		'organ' : 'organo',
		'cat' : 'gatto',
		'dog' : 'cane',
		'horse' : 'cavallo',
		'earthquake' : 'terremoto',
		'monastery' : 'monastero',
		'mosque' : 'moschea',
		'synagogue' : 'sinagoga',
		'river' : 'fiume',
		'populatedplace' : 'posto popolato',
		'religiousorganisation' : 'organizzazione religiosa',
		'settlement' : 'insediamento',
		'theologicalconcept' : 'concetto teologico',
		'device' : 'dispositivo',
		'naturalplace' : 'posto naturale',
		'food' : 'cibo',
		'socialperson' : 'persona sociale',
		'engine' : 'motore',
		'island' : 'isola',
		'work' : 'lavoro',
		'place' : 'posto',
		'species' : 'specie',
		'sportsteam' : 'squadra sportiva',
		'company' : 'compagnia',
		'eukaryote' : 'eucariote',
		'periodicalliterature' : 'letteratura periodica',
		'thing' : 'cosa',
		'educationalinstitution' : 'istituzione educativa',
		'societalevent' : 'evento sociale',
		'region' : 'regione',
		'race' : 'corsa',
		'organization' : 'organizzazione',
		'organisation' : 'organizzazione',
		'product' : 'prodotto',
		'event' : 'evento',
		'station' : 'stazione',
		'name' : 'name',
		'publisher' : 'editore',
		'language' : 'lingua',
		'academicsubject' : 'argomento accademico',
		'sportsevent' : 'evento sportivo',
		'departement' : 'dipartimento',
		'agglomeration' : 'agglomerato',
		'altitude' : 'altitudine',
		'annotation' : 'annotazione',
		'archipelago' : 'arcipelago',
		'archive' : 'archivio',
		'area' : 'area',
		'article' : 'articolo',
		'artificialsatellite' : 'satellite artificiale',
		'artisticgenre' : 'genere artistico',
		'athletics' : 'atletica',
		'attack' : 'attacco',
		'baseballseason' : 'stagione di baseball',
		'beach' : 'spiaggia',
		'biologist' : 'biologo',
		'personalevent' : 'evento personale',
		'birth' : 'nascita',
		'cardgame' : 'giochi di carte',
		'timeperiod' : 'periodo di tempo',
		'careerstation' : 'stazione di carriera',
		'unitofwork' : 'unità di lavoro',
		'case' : 'caso',
		'citydistrict' : 'distretto della città',
		'classicalmusicartist' : 'artista di musica classica',
		'colour' : 'colore',
		'community' : 'comunità',
		'competition' : 'competizione',
		'concentrationcamp' : 'campo di concentramento',
		'contest' : 'contesto',
		'convention' : 'convenzione',
		'country' : 'paese',
		'currency' : 'moneta',
		'diploma' : 'diploma',
		'death' : 'morte',
		'diocese' : 'diocesi',
		'district' : 'distretto',
		'divorce' : 'divorzio',
		'documenttype' : 'tipo di documento',
		'drama' : 'dramma',
		'escalator' : 'scala mobile',
		'governmentagency' : 'agenzia governamentale',
		'geopoliticalorganisation' : 'organizzazione geopolitica',
		'geologicalperiod' : 'periodo geologico',
		'formulaoneracing' : 'corsa della formula 1',
		'formulaoneracer' : 'pilota della formula 1',
		'municipality' : 'municipalità',
		'forest' : 'foresta',
		'flag' : 'bandiera',
		'footballmatch' : 'partita di football',
		'depth' : 'profondità',
		'genelocation' : 'posizione del gene',
		'gatedcommunity' : 'comunità chiusa',
		'fungus' : 'fungo',
		'fort' : 'fortezza',
		'fillingstation' : 'stazione di rifornimento',
		'fiefdom' : 'feudo',
		'desert' : 'deserto',
		'formermunicipality' : 'ex comune',
		'employersorganisation' : 'organizzazione degli impiegati',
		'demographics' : 'demografia',
		'deanery' : 'decanato',
		'deputy' : 'vice',
		'cemetery' : 'cimitero',
		'activeyearsendyear' : 'ultimo anno di attività',
		'activeyearsstartyear' : 'primo anno di attività',
		'award' : 'premio',
		'restingplace' : 'luogo di riposo',
		'hongkongfilmwards' : 'premio cinematografico di Hong Kong',
		'almamater' : 'università',
		'commons' : 'popolo',
		'hometown' : 'città natale',
		'spelling' : 'ortografia',
		'yearsactive' : 'anni di attività',
		'goldenhorseawards' : 'premio cinematografico Golden Horse',
		'hypernym' : 'iperonimo',
		'endingtheme' : 'tema finale',
		'formerbandmember' : 'ex membro del gruppo',
		'nonfictionsubject' : 'soggetto non di fantasia',
		'pastmember' : 'ex membro',
		'japanactor' : 'attore giapponese',
		'openingtheme' : 'tema di apertura',
		'holder' : 'titolare',
		'host' : 'ospite',
		'celebritywinner' : 'celebrità vincitrice',
		'bestactor' : 'migliore attore',
		'engvoice' : 'voce inglese',
		'japanvoice' : 'voce giapponese',
		'relative' : 'parenti',
		'goalie' : 'portiere',
		'hypernym' : 'iperonimo',
		'expartner' : 'ex partner',
		'data' : 'dati',
		'contestant\'sandpeople\'schoice' : 'scelta dei concorrenti e del popolo',
		'japvoice' : 'voce giapponese',
		'preshow' : 'avanspettacolo',
		'brakes' : 'freni',
		'voices' : 'voci',
		'sales' : 'saldi',
		'fictionalcharacter' : 'personaggio di fantasia',
		'memberresistancemovement' : 'membro del movimento di resistenza',
		'sportsmanager' : 'manager sportivo',
		'deity' : 'divinità',
		'militaryaircraft' : 'aereo militare',
		'bloodvessel' : 'vaso sanguigno',
		'sportfacility' : 'struttura per lo sport',
		'zoo' : 'zoo',
		'fashiondesigner' : 'stilista di moda',
		'archerplayer' : 'giocatore di tiro con l\'arco',
		'cricketer' : 'giocatore di cricket',
		'dartsplayer' : 'giocatore di freccette',
		'fencer' : 'schermitore',
		'gaelicgamesplayer' : 'giocatore di giochi gaelici',
		'gridironfootballplayer' : 'giocatore di football in griglia',
		'handballplayer' : 'giocatore di pallamano',
		'highdiver' : 'sommozzatore',
		'jockey' : 'fantino',
		'lacrosseplayer' : 'giocatore di lacrosse',
		'martialartist' : 'praticante di arti marziali',
		'motorsportracer' : 'pilota automobilistico',
		'nationalcollegiateathleticassociationathlete' : 'atleta dell\'associazione atletica nazionale collegiale',
		'snookerplayer' : 'giocatore di biliardo',
		'surfer' : 'surfista',
		'wrestler' : 'wrestler',
		'lipid' : 'lipido',
		'polysaccharide' : 'polisaccaride',
		'bay' : 'baia',
		'skyscraper' : 'grattacielo',
		'digitalcamera' : 'camera digitale',
		'hollywoodcartoon' : 'cartone hollywoodiani',
		'collegecoach' : 'allenatore collegiale',
		'file' : 'file',
		'treadmill' : 'routine',
		'windmotor' : 'motore a vento',
		'serialkiller' : 'killer seriale',
		'musical' : 'musical',
		'nationalanthem' : 'inno nazionale',
		'single' : 'single',
		'stormsurge' : 'tempesta',
		'lightnovel' : 'romanzo leggero',
		'conifer' : 'conifero',
		'cultivatedvariety' : 'varietà coltivata',
		'eurovisionsongcontestentry' : 'pezzo presentato al Eurovision Song Contest',
		'greenalga' : 'alga verde',
		'browndwarf' : 'nana bruna',
		'creek' : 'torrente',
		'globularswarm' : 'sciame globulare',
		'openswarm' : 'sciame aperto',
		'soccertournament' : 'torneo di calcio',
		'meanoftransportation' : 'mezzo di trasporto',
		'sportsleague' : 'federazione sportiva',
		'comicscharacter' : 'personaggio dei fumetti',
		'musicgroup' : 'gruppo musicale',
		'database' : 'database',
		'writtenwork' : 'lavoro scritto',
		'routeoftransportation' : 'percorso del mezzo di trasporto',
		'instrumentalist' : 'strumentista',
		'racetrack' : 'pista',
		'topicalconcept' : 'concetto attuale',
		'software' : 'software',
		'collectionofvaluables' : 'raccolta di oggetti di valore',
		'backscene' : 'retroscena',
		'sportsteamseason' : 'stagione della squadra sportiva',
		'baseballseason' : 'stagione di baseball',
		'biathlete' : 'biatleta',
		'blazon' : 'blasone',
		'bobsleighathlete' : 'atleta di bob',
		'boxing' : 'pugilato',
		'boxingcategory' : 'categoria di pugilato',
		'boxingstyle' : 'stile di pugilato',
		'buscompany' : 'compagnia di pullman',
		'canton' : 'cantone',
		'cape' : 'mantellina',
		'cardinaldirection' : 'direzione cardinale',
		'caterer' : 'approvvigionatore',
		'chartsplacements' : 'posizionamento dei grafici',
		'citydistrict' : 'distretto urbano',
		'mine' : 'miniera',
		'coalpit' : 'pozzo di carbone',
		'college' : 'college',
		'on-sitetransportation' : 'trasporto in loco',
		'conveyorsystem' : 'sistema di trasporto',
		'countryseat' : 'sede del paese',
		'cricketleague' : 'federazione di cricket',
		'crosscountryskier' : 'sciatore di fondo',
		'curler' : 'giocatore di curl',
		'curlingleague' : 'federazione di curl',
		'cyclingleague' : 'federazione di ciclismo',
		'racingdriver' : 'pilota da corsa',
		'disneycharacter' : 'personaggio della Disney',
		'dtmracer' : 'pilota DTM',
		'districtwaterboard' : 'comitato idrico distrettuale',
		'electiondiagram' : 'diagramma elettorale',
		'electricalsubstation' : 'sottostazione elettrica',
		'fashion' : 'moda',
		'fieldhockeyleague' : 'federazione di hockey sul prato',
		'figureskater' : 'pattinatore',
		'film' : 'film',
		'filmfestival' : 'festival cinematografico',
		'festival' : 'festival',
		'footballleagueseason' : 'stagione della federazione di football',
		'golfleague' : 'federazione di golf',
		'lymph' : 'linfa',
		'comedygroup' : 'gruppo comico',
		'department' : 'dipartimento',
		'clubmoss' : 'licopodio',
		'cycad' : 'cicadofite'
		};

//default : m, s
itLanguageManager.prototype.labelsinfo = {
		'etichetta' : ['f', 's'],
		'lingua' : ['f', 's'],
		'diritti' : ['m', 'p'],
		'descrizione' : ['f', 's'],
		'squadra' : ['f', 's'],
		'didascalia' : ['f', 's'],
		'miniatura' : ['f', 's'],
		'breve descrizione' : ['f', 's'],
		'data di nascita' : ['f', 's'],
		'latitudine' : ['f', 's'],
		'longitudine' : ['f', 's'],
		'obiettivi' : ['m', 'p'],
		'anni' : ['m', 'p'],
		'lunghezza' : ['f', 's'],
		'data' : ['f', 's'],
		'stazione di carriera' : ['f', 's'],
		'data di morte' : ['f', 's'],
		'data di morte' : ['f', 's'],
		'classe equivalente' : ['f', 's'],
		'raffigurazione' : ['f', 's'],
		'sottoclasse di' : ['f', 's'],
		'voti' : ['m', 'p'],
		'percentuale' : ['f', 's'],
		'famiglia' : ['f', 's'],
		'popolazione totale' : ['f', 's'],
		'occupazione' : ['f', 's'],
		'classe' : ['f', 's'],
		'figli' : ['m', 'p'],
		'altezza' : ['f', 's'],
		'nazionalità' : ['f', 's'],
		'sposa' : ['f', 's'],
		'ascendenza' : ['f', 's'],
		'dimensione dell\'immagine' : ['f', 's'],
		'religione' : ['f', 's'],
		'residenza': ['f', 's'],
		'specie' : ['f', 's'],
		'cinematografia' : ['f', 's'],
		'testa' : ['f', 's'],
		'persona chiave' : ['f', 's'],
		'relazione' : ['f', 's'],
		'voce' : ['f', 's'],
		'giudici' : ['m', 'p'],
		'musica' : ['f', 's'],
		'nota' : ['f', 's'],
		'storia' : ['f', 's'],
		'studenti' : ['m', 'p'],
		'ospiti' : ['m', 'p'],
		'testi' : ['m', 'p'],
		'atti' : ['m', 'p'],
		'presentatori' : ['m', 'p'],
		'squadra vincitrice' : ['f', 's'],
		'influenze' : ['f', 'p'],
		'voce dell\'attore ' : ['f', 's'],
		'voci' : ['f', 'p'],
		'moglie del politico' : ['f', 's'],
		'reali' : ['m', 'p'],
		'personalità televisiva' : ['f', 's'],
		'voce dell\'attore' : ['f', 's'],
		'regione amministrativa clericale' : ['f', 's'],
		'regione amministrativa di governo': ['f', 's'],
		'area storica dell\'autorità' : ['f', 's'],
		'famiglia' : ['f', 's'],
		'organizzazione' : ['f', 's'],
		'embriologia' : ['f', 's'],
		'vena' : ['f', 's'],
		'molluschi' : ['m', 'p'],
		'attrazione del parco di divertimento' : ['f', 's'],
		'infrastruttura' : ['f', 's'],
		'struttura militare' : ['f', 's'],
		'piramide' : ['f', 's'],
		'piazza' : ['f', 's'],
		'torre' : ['f', 's'],
		'strada' : ['f', 's'],
		'stazione radio' : ['f', 's'],
		'costruzione storica' : ['f', 's'],
		'biblioteca' : ['f', 's'],
		'galassia' : ['f', 's'],
		'droga' : ['f', 's'],
		'capitale della regione' : ['f', 's'],
		'immagine' : ['f', 's'],
		'chitarra' : ['f', 's'],
		'moschea' : ['f', 's'],
		'sinagoga' : ['f', 's'],
		'organizzazione religiosa' : ['f', 's'],
		'persona sociale' : ['f', 's'],
		'isola' : ['f', 's'],
		'specie' : ['f', 's'],
		'squadra sportiva' : ['f', 's'],
		'compagnia' : ['f', 's'],
		'letteratura periodica' : ['f', 's'],
		'cosa' : ['f', 's'],
		'istituzione educativa' : ['f', 's'],
		'regione' : ['f', 's'],
		'corsa' : ['f', 's'],
		'organizzazione' : ['f', 's'],
		'stazione' : ['f', 's'],
		'lingua' : ['f', 's'],
		'altitudine' : ['f', 's'],
		'annotazione' : ['f', 's'],
		'area' : ['f', 's'],
		'atletica' : ['f', 's'],
		'stagione di baseball' : ['f', 's'],
		'spiaggia' : ['f', 's'],
		'nascita' : ['f', 's'],
		'stazione di carriera' : ['f', 's'],
		'unità di lavoro' : ['f', 's'],
		'comunità' : ['f', 's'],
		'competizione' : ['f', 's'],
		'convenzione' : ['f', 's'],
		'moneta' : ['f', 's'],
		'morte' : ['f', 's'],
		'diocesi' : ['f', 's'],
		'scala mobile' : ['f', 's'],
		'agenzia governamentale' : ['f', 's'],
		'organizzazione geopolitica' : ['f', 's'],
		'corsa della formula 1' : ['f', 's'],
		'foresta' : ['f', 's'],
		'bandiera' : ['f', 's'],
		'partita di football' : ['f', 's'],
		'profondità' : ['f', 's'],
		'posizione del gene' : ['f', 's'],
		'comunità chiusa' : ['f', 's'],
		'fortezza' : ['f', 's'],
		'stazione di rifornimento' : ['f', 's'],
		'organizzazione degli impiegati' : ['f', 's'],
		'demografia' : ['f', 's'],
		'università' : ['f', 's'],
		'città natale' : ['f', 's'],
		'ortografia' : ['f', 's'],
		'anni di attività' : ['m', 'p'],
		'celebrità vincitrice' : ['f', 's'],
		'voce inglese' : ['f', 's'],
		'voce giapponese' : ['f', 's'],
		'parenti' : ['m', 'p'],
		'dati' : ['m', 'p'],
		'scelta dei concorrenti e del popolo' : ['f', 's'],
		'voce giapponese' : ['f', 's'],
		'freni' : ['m', 'p'],
		'voci' : ['m', 'p'],
		'saldi' : ['m', 'p'],
		'divinità' : ['f', 's'],
		'struttura per lo sport' : ['f', 's'],
		'baia' : ['f', 's'],
		'camera digitale' : ['f', 's'],
		'routine' : ['f', 's'],
		'tempesta' : ['f', 's'],
		'varietà coltivata' : ['f', 's'],
		'alga verde' : ['f', 's'],
		'nana bruna' : ['f', 's'],
		'federazione sportiva' : ['f', 's'],
		'pista' : ['f', 's'],
		'raccolta di oggetti di valore' : ['f', 's'],
		'stagione della squadra sportiva' : ['f', 's'],
		'stagione di baseball' : ['f', 's'],
		'categoria di pugilato' : ['f', 's'],
		'compagnia di pullman' : ['f', 's'],
		'mantellina' : ['f', 's'],
		'direzione cardinale' : ['f', 's'],
		'miniera' : ['f', 's'],
		'sede del paese' : ['f', 's'],
		'federazione di cricket' : ['f', 's'],
		'federazione di curl' : ['f', 's'],
		'federazione di ciclismo' : ['f', 's'],
		'sottostazione elettrica' : ['f', 's'],
		'moda' : ['f', 's'],
		'federazione di hockey sul prato' : ['f', 's'],
		'stagione della federazione di football' : ['f', 's'],
		'federazione di golf' : ['f', 's'],
		'linfa' : ['f', 's']
		};
