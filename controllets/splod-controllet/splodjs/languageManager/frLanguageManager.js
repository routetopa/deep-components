var frLanguageManager = function () {
	if(frLanguageManager.prototype._singletonInstance){
		return frLanguageManager.prototype._singletonInstance;
	}

	frLanguageManager.prototype._singletonInstance = this;
};

//Return a or an according to how noun starts
frLanguageManager.prototype.getArticle = function(noun){
	return '';
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
frLanguageManager.prototype.verbalizeConcept = function(conceptLabel){
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

	verbalization.modified.push('qui est un(e) ');
	verbalization.modified.push(conceptLabel + ' ');
	verbalization.modified.push('');

	verbalization.negated.push('qui ');
	verbalization.negated.push('n\'est pas ');
	verbalization.negated.push('un(e) ');
	verbalization.negated.push(conceptLabel + ' ');
	verbalization.negated.push('');	

	verbalization.optional.push('qui est ');
	verbalization.optional.push('&eacute;ventuellement ');
	verbalization.optional.push('un(e) ');
	verbalization.optional.push(conceptLabel + ' ');
	verbalization.optional.push('');

	verbalization.truncated.push('est un(e) ');
	verbalization.truncated.push(conceptLabel + ' ');
	verbalization.truncated.push('');

	verbalization.first.push(' ');
	verbalization.first.push(conceptLabel + ' ');
	verbalization.first.push('');

	verbalization.current = verbalization.standard;

	return verbalization;

}

frLanguageManager.prototype.verbalizePredicate = function(predicateLabel, predicateDirection){
	verbalization = {
		standard: [],
		modified: [],
		truncated: [],
		negated: [],
		optional: [],
		first: [],
		current: []};


	if(predicateDirection == 'direct'){

		verbalization.standard.push('qui a un(e) ');
		verbalization.standard.push(predicateLabel + ' ');
		verbalization.standard.push('');

		verbalization.modified.push('dont ');
		verbalization.modified.push(predicateLabel + ' ');
		verbalization.modified.push('');

		verbalization.negated.push('qui ');
		verbalization.negated.push('n\'a pas ');
		verbalization.negated.push('un(e) ');
		verbalization.negated.push(predicateLabel + ' ');
		verbalization.negated.push('');

		verbalization.optional.push('qui a ');
		verbalization.optional.push('&acute;ventuellement ');
		verbalization.optional.push('un(e) ');
		verbalization.optional.push(predicateLabel + ' ');
		verbalization.optional.push('');

		verbalization.truncated.push('');
		verbalization.truncated.push(predicateLabel + ' ');
		verbalization.truncated.push('');

		//direct predicate should not be the first node
		verbalization.first.push(' ');
		verbalization.first.push(predicateLabel + ' ');
		verbalization.first.push('');

	}else if(predicateDirection == 'reverse'){
		var postLabel = 'de ';

		verbalization.standard.push('qui est ');
		verbalization.standard.push(predicateLabel + ' ');
		verbalization.standard.push(postLabel);

		verbalization.modified.push('');
		verbalization.modified.push(predicateLabel + ' ');
		verbalization.modified.push(postLabel);

		verbalization.negated.push('qui ');
		verbalization.negated.push('n\'est pas ');
		verbalization.negated.push('');
		verbalization.negated.push(predicateLabel + ' ');
		verbalization.negated.push(postLabel);

		verbalization.optional.push('qui est');
		verbalization.optional.push('&eacute;ventuellement ');
		verbalization.optional.push('');
		verbalization.optional.push(predicateLabel + ' ');
		verbalization.optional.push(postLabel);

		verbalization.truncated.push('');
		verbalization.truncated.push(predicateLabel + ' ');
		verbalization.truncated.push(postLabel);

		verbalization.first.push(' qui ');
		verbalization.first.push(predicateLabel + ' ');
		verbalization.first.push(postLabel);
	}
	
	verbalization.current = verbalization.standard;

	return verbalization;

}

frLanguageManager.prototype.verbalizeSomething = function(){
	verbalization = {
		standard: ['quelque chose '],
		current: ['quelque chose ']};

	return verbalization;
}

frLanguageManager.prototype.getSomethingLabelVerbalization = function(){
	return 'quelque chose ';
}

frLanguageManager.prototype.verbalizeEverything = function(){
	verbalization = {
		standard: [' tout ce '],
		first: [' tout ce '],
		current: [' tout ce ']};

	return verbalization;
}

frLanguageManager.prototype.getEverythingLabelVerbalization = function(){
	return 'tout ce';
}

frLanguageManager.prototype.getOrdinalNumber = function(cardinalNumber){
	var ordinalNumber = '';
	
	switch(cardinalNumber){
		/*case 1 : ordinalNumber = '1st'; break;
		case 2 : ordinalNumber = '2nd'; break;
		case 3 : ordinalNumber = '3rd'; break;*/
		default : ordinalNumber = cardinalNumber+'&ordm;'; break;
	}

	return ordinalNumber;
}

frLanguageManager.prototype.endsWithPreposition = function(label){
	/*var preposition = [" da", " di", " a", " anche", " per"]; 
	for(var i=0; i<preposition.length; i++){
		if(label.endsWith(preposition[i]))
			return true;
	}*/
	return false;
}

frLanguageManager.prototype.verbalizeOperator = function(operator){

	var verbalization = {
		standard: ['qui ', operator+' ', ''],
		truncated: ['', operator+' ', ''],
		negated: ['qui ', 'n\'est pas ', '', operator+' ', ''],
		optional : ['qui est ', '&eacute;ventuellement ','', operator+' ', '']};

	verbalization.current = verbalization.standard;

	switch(operator){
		case '<':
			verbalization.standard = ['qui est ','inf&eacute;rieur ','&agrave; '];
			verbalization.truncated = ['','inf&eacute;rieur ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'inf&acute;rieur ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'inf&acute;rieur ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case '<=':
			verbalization.standard = ['qui est ','inf&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.truncated = ['','inf&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'inf&acute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'inf&acute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case '>=':
			verbalization.standard = ['qui est ','sup&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.truncated = ['','sup&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','sup&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'sup&eacute;rieur ou &eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case '>':
			verbalization.standard = ['qui est ','sup&eacute;rieur ','&agrave; '];
			verbalization.truncated = ['','sup&eacute;rieur ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','sup&eacute;rieur ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'sup&eacute;rieur ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case '=':
			verbalization.standard = ['qui est ','&eacute;gale ','&agrave; '];
			verbalization.truncated = ['','&eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','&eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', '&eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case 'is string':
			verbalization.standard = ['qui est ','&eacute;gale ','&agrave; '];
			verbalization.truncated = ['','&eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','&eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', '&eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case 'is url':
			verbalization.standard = ['qui est ','&eacute;gale ','&agrave; '];
			verbalization.truncated = ['','&eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','&eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', '&eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case 'is date':
			verbalization.standard = ['qui est ','&eacute;gale ','&agrave; '];
			verbalization.truncated = ['','&eacute;gale ','&agrave; '];
			verbalization.negated = ['qui ', 'n\'est pas ', '','&eacute;gale ','&agrave; '];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', '&eacute;gale ','&agrave; '];
			verbalization.current = verbalization.standard;
			break;
		case 'range':
			verbalization.standard = ['qui est ','entre ',''];
			verbalization.truncated = ['','entre ',''];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'entre ',''];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'entre ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'range date':
			verbalization.standard = ['qui est ','compris entre ',''];
			verbalization.truncated = ['','compris entre ',''];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'compris entre ',''];
			verbalization.optional = ['qui est ', '&eacute;ventuellement ', '', 'compris entre ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'and':	
			verbalization.standard = ['et '];
			verbalization.current = verbalization.standard;
			break;
		/*case 'or':	
			verbalization.standard = ['o (inclusivo) '];
			verbalization.current = verbalization.standard;
			break;
		*/
		case 'or':	
			verbalization.standard = ['ou '];
			verbalization.current = verbalization.standard;
			break;
		case 'not':
			verbalization.standard = ['ne '];
			verbalization.current = verbalization.standard;
			break;
		case 'optional':
			verbalization.standard = ['&eacute;ventuellement '];
			verbalization.current = verbalization.standard;
			break;
		case 'lang':
			verbalization.standard = ['qui est ','en ',''];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'en ',''];
			verbalization.optional = ['qui est ','&eacute;ventuellement ', '', 'en ',''];
			verbalization.current = verbalization.standard;
			break;

		case 'before':
			verbalization.standard = ['qui est ','avant ',''];
			verbalization.truncated = ['','avant ',''];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'avant ',''];
			verbalization.optional = ['qui est ','&eacute;ventuellement ', '', 'avant ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'after':
			verbalization.standard = ['qui est ','apr&egrave;s ',''];
			verbalization.truncated = ['','apr&egrave;s ',''];
			verbalization.negated = ['qui ', 'n\'est pas ', '', 'apr&egrave;s ',''];
			verbalization.optional = ['qui est ','&eacute;ventuellement ', '', 'apr&egrave;s ',''];
			verbalization.current = verbalization.standard;
			break;
		case 'starts with':
			verbalization.standard = ['qui ','commence ','par '];
			verbalization.truncated = ['','commence ','par '];
			verbalization.negated = ['qui ', 'ne ', '', 'commence ','pas par '];
			verbalization.optional = ['qui ', '&eacute;ventuellement ', '', 'commence ','par '];
			verbalization.current = verbalization.standard;
			break;
		case 'ends with':
			verbalization.standard = ['qui ','finit ','par '];
			verbalization.truncated = ['','finit ','par '];
			verbalization.negated = ['qui ', 'ne ', '', 'finit ','pas par '];
			verbalization.optional = ['qui ', '&eacute;ventuellement ', '', 'finit ','par '];
			verbalization.current = verbalization.standard;
			break;
		case 'contains':
			verbalization.standard = ['qui ','contient ',''];
			verbalization.truncated = ['','contient ',''];
			verbalization.negated = ['qui ', 'ne ', '', 'contient ','pas '];
			verbalization.optional = ['qui ', '&eacute;ventuellement ', '', 'contient ',''];
			verbalization.current = verbalization.standard;
			break;

	}

	return verbalization;

}

frLanguageManager.prototype.getDefaultConjunction = function(){
	return 'et ';
}

frLanguageManager.prototype.verbalizeResult = function(result){

	var verbalization = {
		standard: [result+' '],
		current: [result+' ']};

	return verbalization;

}

//First part of query verbalization
frLanguageManager.prototype.getQueryStartVerbalization = function(){
	return 'Donne-moi ';
}

//Initialization of query
frLanguageManager.prototype.getQueryInitialVerbalization = function(){
	return 'Donne-moi...';
}

frLanguageManager.prototype.getFocusLabel = function(){
	return 'Focus: ';
}

frLanguageManager.prototype.getFocusInitialVerbalization = function(){
	return '-';
}

frLanguageManager.prototype.getTabTitle = function(tabType){
	var title = '';
	switch(tabType){
		case 'concept' : title = 'Concepts'; break;
		case 'predicate' : title = 'Pr&eacute;dicats'; break;
		case 'operator' : title = 'Op&eacute;rateurs'; break;
		case 'table result' : title = 'Table de r&eacute;sultats'; break;
		case 'settings' : title = 'Configurations'; break; //Paramètres
		case 'direct predicate' : title = 'Direct'; break;
		case 'reverse predicate' : title = 'Inverse'; break;
		case 'help' : title = 'Guide'; break;
	}
	return title;
}

//TEXT
frLanguageManager.prototype.getBoxTitle = function(boxType){
	var title = '';
	switch(boxType){
		case 'result' : title = 'Remplacer le résultat par le focus'; break;
	}
	return title;
}

frLanguageManager.prototype.getInputPlaceholder = function(inputType){
	var placeholder;

	switch(inputType){
		case 'concept' : placeholder = 'Chercher un concept'; break;
		case 'predicate' : placeholder = 'Chercher un prédicat'; break;
		case 'result' : placeholder = 'Chercher un résultat'; break;
	}

	return placeholder;
}

frLanguageManager.prototype.getOperatorLabelVerbalization = function(operator){	
	var label;	

	switch(operator){
		case 'and': 
			label = 'et ';
			break;
		/*case 'or': 
			label = 'o (inclusivo) ';
			break;
		*/
		case 'or': 
			label = 'ou ';
			break;
		case 'not': 
			label = 'ne ';
			break;
		case 'optional': 
			label = '&eacute;ventuellement ';
			break;
		case 'limit': 
			label = '';
			break;
		case '<': 
			label = 'inf&eacute;rieur ';
			break;
		case '<=': 
			label = 'inf&eacute;rieur ou &eacute;gal ';
			break;
		case '>': 
			label = 'sup&egrave;rieur ';
			break;
		case '>=': 
			label = 'sup&eacute;rieur ou &eacute;gal ';
			break;
		case '=': 
			label = '&eacute;gal ';
			break;
		case 'starts with': 
			label = 'commence par ';
			break;
		case 'ends with': 
			label = 'finit par ';
			break;
		case 'contains': 
			label = 'contient ';
			break;
		case 'lang': 
			label = 'dans la langue ';
			break;
		case 'before': 
			label = 'avant ';
			break;
		case 'after': 
			label = 'apr&egrave;s ';
			break;
		case 'is string':
		case 'is url':
		case 'is date':
			label = '&eacute;gal ';
			break;
		case 'range':
		case 'range date':
			label = 'compris entre';
			break;
		default: 
			label = operator;
			break;
	}

	return label;

}

frLanguageManager.prototype.getDatatypeLabel = function(datatype){
	var label;

	switch(datatype){
		case 'number' : 
			label = 'Op&eacute;rateurs sur les nombres'; break;
		case 'string' : 
		case 'literal' : 
			label = 'Op&eacute;rateurs sur les chai&iacute;ne de caract&egrave;res'; break;
		case 'date' : 
		case 'time' : 
		case 'dateTime' : 
		case 'gDay' : 
		case 'gMonth' : 
		case 'gMonthDay' : 
		case 'gYear' : 
		case 'gYearMonth' : 
			label = 'Op&eacute;rateurs sur les dates'; break;
		case 'uri' : 
			label = 'Op&eacute;rateurs sur les URL'; break;
		case 'boolean' : 
			label = 'Op&eacute;rateurs sur les bool&eacute;ens'; break;
		case 'img' : 
			label = 'Op&eacute;rateurs sur les images'; break;
	}

	return label;
}

frLanguageManager.prototype.getReusableResultListTitle = function(position){
	var label;

	switch(position){
		case 0 : 
			label = 'Premiers r&eacute;sultats'; break;
		case 1 : 
			label = 'R&eacute;sultats mis &agrave; jour'; break;
	}

	return label;
}

frLanguageManager.prototype.getUserInputHint = function(){	
	return 'Entrez votre valeur: ';
}

frLanguageManager.prototype.getButtonLabel = function(button){
	var label;

	switch(button){
		case 'confirm' : 
			label = 'OK';
			break;
		case 'remove':
			label = 'Supprimer';
			break;
		case 'close':
			label = 'Ferme';
			break;
		case 'removeFocus': //remove higlighted part of query
			label = 'Retirer le focus et les parties liées';
			break;
		case 'confirmUserInput': //confirm user value to complete operator
			label = 'OK';
			break;
		case 'discardButton':
			label = 'Supprimer l\'opéperateur';
			break;
		case 'visibleFields':
			label = 'Champs visibles';
			break;
		case 'sparqlQuery':
			label = 'Comparez la demande en langage naturel avec la demande SPARQL';
			break;
		case 'saveTable':
			label = 'Enregistrer la table des résultats';
			break;
	}

	return label;
}


frLanguageManager.prototype.startsWithVerb = function(predicateLabel, direction){
	return false;
}


frLanguageManager.prototype.getPredicateVerbalization = function(predicateLabel, direction){
	var label;

	if(direction == 'direct')
		label =	'qui a un(e) ' + predicateLabel; 
	else
		label =	'qui est ' + predicateLabel; 
	
	return label; 
}
/*
frLanguageManager.prototype.getHintOperatorManager = function(about){
	var hint;

	switch(about){
		case 'reusableResult': 
			hint = 'These results are related to the following query: '; break;
	}

	return hint;
}
*/
frLanguageManager.prototype.getFieldTitle = function(select){
 var label; 

 switch(select){
  case 'system lang': label = 'Choisissez la langue du syst&egrave;me'; break;
  case 'num concepts': label = 'Changer le nombre de concepts renvoy&eacute;s'; break;
  case 'num predicates': label = 'Changer le nombre de pr&eacute;dicats renvoy&eacute;s'; break;
  case 'default order table': label = 'Tableau des r&eacute;sultats toujours rang&eacute;s';break;
  case 'selected endpoint': label = 'Endpoint s&eacute;l&eacute;ctionn&eacute;: ';break;
 }

 return label;
}

frLanguageManager.prototype.getHelpGuide = function(){
	var headers = [];

	var overviewObj = {title : 'Vue', content : []};
	overviewObj.content.push('<b>SPLOD </b> vous aidera &agrave; utiliser LOD (Linked Open Data) et afficher les r&eacute;sultats sous forme de tableau. Il n\'est pas n&eacute;cessaire de conna&icirc;tre SPARQL ou la structure des donn&eacute;es sous-jacente pour l\'utiliser: SPLOD cachera la complexit&eacute; sous-jacente et vous guidera &agrave; travers le contenu des box et des feedbacks continus.');
	headers.push(overviewObj);

	var boxesObj = {title : 'Qu\'est-ce qu\'il y a dans chaque box?', content : []};
	boxesObj.content.push('<b> L\'onglet concept </b> contient initialement tous les concepts <i> statements </i> accessibles &agrave; partir du l\'endpoint que vous avez s&eacute;lectionn&eacute; &agrave; la premi&egrave;re &eacute;tape. D&egrave;s la premi&egrave;re interaction, SPLOD recuperera tous les concepts utilis&eacute;s, en quittant peut\-&ecirc;tre l\'endpoint s&eacute;lectionn&eacute;e s\'il est connect&eacute; &agrave; d\'autres vocabulaires ou vice versa. Nous appelons <b>\'concepts\'</b> des classes li&eacute;es &agrave; <i> subject </i> ou <i> object </i> dans les donn&eacute;es en format RDF. <img width="100%" src="./controllets/splod-controllet/splodjs/img/en_concept.png"/>');
	boxesObj.content.push('<b> L\'onglet pr&eacute;dicat </b> contient tous les pr&eacute;dicats <i> utilis&eacute;s </i> et accessibles &agrave; partir du l\'endpoint que vous avez s&eacute;lectionn&eacute; &agrave; la premi&egrave;re &eacute;tape. Dans l\'image vous pouvez voir que le pr&eacute;dicat <i> dbo:birthPlace </i> est utilis&eacute; comme pr&eacute;dicat direct et dans l\'autre cas il est utilis&eacute; comme pr&eacute;dicat inverse, cela d&eacute;pend de la position de l\'&eacute;l&eacute;ment qui vous int&eacute;resse: s\'il appara&igrave;t comme sujet, le pr&eacute;dicat est direct, sinon c\'est l\'inverse. <img width="100%" src="./controllets/splod-controllet/splodjs/img/en_predicate.png"/>');
	boxesObj.content.push('<b> L\'onglet op&eacute;rateur </b> vous permet de filtrer les donn&eacute;es ou d\'appliquer des op&eacute;rateurs au niveau de la demande. Les op&eacute;rateurs d&eacute;pendent du type de donn&eacute;es de l\'élément sur lequel le focus est plac&eacute;. Si l\'op&eacute;rateur doit compl&eacute;ter un ou plusieurs r&eacute;sultats, vous les trouverez dans ce box apr&egrave;s avoir s&eacute;lectionn&eacute; l\'op&eacute;rateur.');
	boxesObj.content.push('<b> L\'onglet de la table des r&eacute;sultats </b> vous montre les r&eacute;sultats de la demande en format de tableau. Vous pouvez cacher des champs ou ranger la table. En posant le curseur sur le badge indiquant le nombre de la dimension du tableau vous pouvez en voir un aperçu.<img width="100%" src="./controllets/splod-controllet/splodjs/img/en_resultsTable.png"/>');
	boxesObj.content.push('<b> L\'onglet des param&egrave;tres </b> vous donne l\'option de <ul> <li> changer le nombre des concepts affich&eacute;s, </ li> <li> changer le nombre des prédicats affich&eacute;s, </ li> <li> changer la langue du syst&egrave;me, </li> <li> demander des r&eacute;sultats toujours rang&eacute;. </li> </ul>');
	headers.push(boxesObj);

	var queryNLObj = {title : 'Demande en langage naturel', content : []};
	queryNLObj.content.push('<b>SPLOD</b> essaie de verbaliser vos interactions en cr&eacute;ant la m&ecirc;me requ&ecirc;te que vous auriez faite &agrave; une autre personne. <br> Les couleurs vous guideront vers une compréhension agr&eacute;able de la demande. <br> <img width="100%" src="./controllets/splod-controllet/splodjs/img/en_NLquery.png"/> <br> ATTENTION: si vous voyez les cha&icirc;nes de caract&egrave;re barr&egrave;es, il est posible que vos interactions n\'ont pas produit une demande valide. Dans l\'example les demandes sont diff&eacute;rentes: la première signifie "Donne-moi des savantes sans lieu de naissance", la deuxi&egrave;me "Donne-moi des savantes qui ne sont pas n&eacute;s dans une &icirc;le". <br> <img width="100%" src="./controllets/splod-controllet/splodjs/img/en_not.png"/> <br>');
	headers.push(queryNLObj);

	var focusObj = {title : 'Focus : comment ça marche', content : []};
	focusObj.content.push('Selon le focus, <b>SPLOD </b> remplira tous les champs et g&eacute;n&eacute;rera votre demande. <br> En fonction de vos interactions, le focus sera mis &agrave; jour. <br> A tout moment, vous pouvez changer l\'&eacute;l&eacute;ment en focus.');
	headers.push(focusObj);

	var querySPARQLObj = {title : 'Demande en SPARQL', content : []};
	querySPARQLObj.content.push('<b>SPARQL</b> est le langage standard pour les demandes s&eacute;mantiques sur LOD. <br> En fonction de vos interactions <b>SPLOD</b> construira automatiquement la votre demande. <br> Vous pouvez en apprendre plus sur SPARQL en ouvrant la fen&ecirc;tre avec des demandes c&ocirc;te &agrave; c&ocirc;te. <br> En changeant le focus, le syst&egrave;me soulignera la partie correspondante dans la demande.');
	headers.push(querySPARQLObj);

	return headers;

}

frLanguageManager.prototype.getOperatorFieldVerbalization = function(cardinalNumber){
	return frLanguageManager.prototype.getOrdinalNumber(cardinalNumber) + ' op&eacute;rande';
}

frLanguageManager.prototype.labels = {
		
		};

