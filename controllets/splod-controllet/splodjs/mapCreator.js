// Map that contains all the information to build query in natural language and in SPARQL
var queryLogicMap;
var rootListQueryLogicMap;

// Map that counts concepts and predicates occurences.
var indexMap;

var languageManager;

var queryBuilder = null;
var queryVerbalizator = null;
var operatorManager = null;
var tableResultManager = null;
var queryViewer = null;

var elementOnFocus;

var MapCreator = function () {

	if(MapCreator.prototype._singletonInstance){
		return MapCreator.prototype._singletonInstance;
	}
	
	elementOnFocus = null;	
	initializeMap();

 	languageManager = new LanguageManager();

	MapCreator.prototype._singletonInstance = this;
 };

function beginFromMap(rootList, map, focus){
	//clean map
	elementOnFocus = null;	
	initializeMap();

	//inizialize map 
	rootListQueryLogicMap = rootList;
	queryLogicMap = map;
	elementOnFocus = focus;

	//eventuale cambiamento lingua label nella mappa

	updateAndNotifyFocus(elementOnFocus);

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);
}
/*
	Notify to the queryVerbalizator the selected concept.
	url : concept's url
	label : concept's label
*/
MapCreator.prototype.selectedConcept = function(selectedUrl, selectedLabel) {

	//console.log(selectedUrl + " - CONCEPT selected");

	var verbalization = languageManager.verbalizeConcept(selectedLabel);

	if(!(selectedUrl in indexMap)){
		indexMap[selectedUrl] = 1;
	}
	else{
		indexMap[selectedUrl] += 1;
	}
	var key = selectedUrl + "_" + indexMap[selectedUrl];
	var index = indexMap[selectedUrl];

	// new element in logic map
	var newLogicElement = {key: key, index: index,
						   url: selectedUrl, label: selectedLabel, 
						   type:'concept', direction: false, 
						   verbalization: verbalization, 
						   parent:null, children: [],
						   mySameAsReferences : []};
	queryLogicMap[key] = newLogicElement;

	if(rootListQueryLogicMap.length==0){ // selectedConcept is the query's subject 
		
		rootListQueryLogicMap.push(key);

	}else{

		var precLogicElement = queryLogicMap[elementOnFocus];

		if(precLogicElement.type=='something'){ // replace something
			
			//update newLogicElement
			//newLogicElement.children = precLogicElement.children;
			newLogicElement.parent = precLogicElement.parent;

			//update map
			var indexSomething = $.inArray(precLogicElement.key, queryLogicMap[precLogicElement.parent].children);
			queryLogicMap[precLogicElement.parent].children[indexSomething] = newLogicElement.key;
			removeMeAndMyDescendents(queryLogicMap[precLogicElement.key], queryLogicMap);

		}else{ // concept refining parent node

			if(precLogicElement.children.length>0){
				var operator;
				if(precLogicElement.children.length>1)//new operator has to be the same type of operator
					operator = queryLogicMap[precLogicElement.children[1]].subtype;
				else//default conjunction
					operator = 'and';
				 
				var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

				if(!(operator in indexMap)){
					indexMap[operator] = 1;
				}
				else{
					indexMap[operator] += 1;
				}

				var newOperatorIndex = indexMap[operator];
				var newOperatorKey = operator + "_" + newOperatorIndex;

				var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
									   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
									   type:'operator', subtype: operator, direction: false, 
									   verbalization: newOperatorVerbalization, 
									   parent:precLogicElement.key, children: []};
				queryLogicMap[newOperatorKey] = newOperatorLogicElement;

				precLogicElement.children.push(newOperatorKey);
			}

			newLogicElement.parent = precLogicElement.key;
			precLogicElement.children.push(newLogicElement.key);

		}

	} 

	updateAndNotifyFocus(key);	

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);
}

/*
	Notify to the MapCreator the selected predicate.
	url : predicate's url
	label : predicate's label
	predicateDirection : 'direct' if the selected predicate is a direct relation,
						 'reverse' if the selected predicate is a reverse relation.
*/
MapCreator.prototype.selectedPredicate = function(selectedUrl, selectedLabel, predicateDirection) {
	//console.log(selectedUrl + " - PREDICATE selected - " + predicateDirection);

	// new element in logic map
	var verbalization = languageManager.verbalizePredicate(selectedLabel, predicateDirection);

	if(!(selectedUrl in indexMap)){
		indexMap[selectedUrl] = 1;
	}
	else{
		indexMap[selectedUrl] += 1;
	}
	var key = selectedUrl + "_" + indexMap[selectedUrl];
	var index = indexMap[selectedUrl];

	var newLogicElement = {key: key, index: index,
						   url: selectedUrl, label: selectedLabel, 
						   type:'predicate', direction: predicateDirection,
						   verbalization: verbalization, 
						   parent:null, children: [],
						   mySameAsReferences : []};
	queryLogicMap[key] = newLogicElement;

	if(rootListQueryLogicMap.length==0){ // first element selected

		// add predicate's subject -> everything
		var verbalizationEverything = languageManager.verbalizeEverything();

		if(!indexMap.hasOwnProperty('everything')){
			indexMap['everything'] = 1;
		}
		else{
			indexMap['everything'] += 1;
		}
		var everythingKey = 'everything' + "_" + indexMap['everything'];
		var everythingIndex = indexMap['everything'];

		var everythingElement = {key: everythingKey, index: everythingIndex,
							  url: 'everything', label:languageManager.getEverythingLabelVerbalization(),
							  type:'everything', direction:false,
							  verbalization:verbalizationEverything,
							  parent:null, children:[key],
							  counterDirectPredicatesChildren: 1, 
							  mySameAsReferences : []};
		queryLogicMap[everythingKey] = everythingElement;

		rootListQueryLogicMap.push(everythingKey);
		newLogicElement.parent = everythingKey;
	
	}else{ //there's a prec 

		var precLogicElement = queryLogicMap[elementOnFocus];

		//if i have sibling i put and before me
		if(precLogicElement.children.length>0){
			var operator;
			if(precLogicElement.children.length>1)//new operator has to be the same type of operator
				operator = queryLogicMap[precLogicElement.children[1]].subtype;
			else//default conjunction
				operator = 'and';
			 
			var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

			if(!(operator in indexMap)){
				indexMap[operator] = 1;
			}
			else{
				indexMap[operator] += 1;
			}

			var newOperatorIndex = indexMap[operator];
			var newOperatorKey = operator + "_" + newOperatorIndex;

			var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
								   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
								   type:'operator', subtype: operator, direction: false, 
								   verbalization: newOperatorVerbalization, 
								   parent:precLogicElement.key, children: []};
			queryLogicMap[newOperatorKey] = newOperatorLogicElement;

			precLogicElement.children.push(newOperatorKey);
		}

		// add me to parent's children list
		precLogicElement.children.push(key);
		newLogicElement.parent = precLogicElement.key;

		if(predicateDirection == 'direct' && precLogicElement.type == 'everything')
			precLogicElement.counterDirectPredicatesChildren++;
	}
		
	if(predicateDirection=='reverse'){

		// add something node to complete myself
		var verbalization = languageManager.verbalizeSomething();

		if(!indexMap.hasOwnProperty('something')){
			indexMap['something'] = 1;
		}
		else{
			indexMap['something'] += 1;
		}
		var somethingIndex = indexMap['something'];
		var somethingKey = 'something' + "_" + somethingIndex;

		var somethingLogic = {key: somethingKey, index: somethingIndex,
							  //url: somethingKey, label:'thing', 
							  url: 'something', label:languageManager.getSomethingLabelVerbalization(), 
							  type:'something', direction:false,
							  verbalization:verbalization,
							  parent:null, children:[],
							  mySameAsReferences : []};
		queryLogicMap[somethingKey] = somethingLogic;

		queryLogicMap[key].children.push(somethingKey);	
		queryLogicMap[somethingKey].parent = key;

		elementOnFocus = somethingKey;

	}else{
	
		elementOnFocus = key;

	} 

		//console.log(queryLogicMap);

	
	updateAndNotifyFocus(elementOnFocus);

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);

}

//pendingQuery : array of elements to add to map
MapCreator.prototype.selectedOperator = function(pendingQuery){
	var resultsKey = [];
	var operator = pendingQuery[0].value;

	switch(operator){
		case 'is string':
		case 'is url':
		case 'is date':
		case 'starts with':
		case 'ends with':
		case 'contains':
		case 'lang':
		case '<':
		case '<=':
		case '>':
		case '>=':
		case '=':
		case 'before':
		case 'after':

		case 'range date':
		case 'range':

			var parentNode = queryLogicMap[elementOnFocus];
			if(parentNode.type == 'predicate' && parentNode.direction == 'reverse' && queryLogicMap[parentNode.parent].type == 'everything')
				parentNode = queryLogicMap[parentNode.parent];

			if(parentNode.children.length>0){
				var tempOperator;
				if(parentNode.children.length>1)//new operator has to be the same type of operator
					tempOperator = queryLogicMap[parentNode.children[1]].subtype;
				else//default conjunction
					tempOperator = 'and';
				 
				var newOperatorVerbalization = languageManager.verbalizeOperator(tempOperator);

				if(!(tempOperator in indexMap)){
					indexMap[tempOperator] = 1;
				}
				else{
					indexMap[tempOperator] += 1;
				}

				var newOperatorIndex = indexMap[tempOperator];
				var newOperatorKey = tempOperator + "_" + newOperatorIndex;

				var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
									   url: tempOperator, label: languageManager.getOperatorLabelVerbalization(tempOperator), 
									   type:'operator', subtype: tempOperator, direction: false, 
									   verbalization: newOperatorVerbalization, 
									   parent:parentNode.key, children: []};
				queryLogicMap[newOperatorKey] = newOperatorLogicElement;

				parentNode.children.push(newOperatorKey);			
			}

			var verbalization = languageManager.verbalizeOperator(operator);

			if(!(operator in indexMap)){
				indexMap[operator] = 1;
			}
			else{
				indexMap[operator] += 1;
			}
			var index = indexMap[operator];
			var key = operator + "_" + index;

			var newLogicElement = {key: key, index: index,
						   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
						   type:'operator', subtype: operator,  direction: false,
						   verbalization: verbalization, 
						   parent:parentNode.key, children: []};
			queryLogicMap[key] = newLogicElement;	

			parentNode.children.push(key);				

			var resultOnFocus;
			for(var i=1; i<pendingQuery.length; i++){
				var resultValue = pendingQuery[i].value;
				var resultDatatype = pendingQuery[i].datatype;
				var resultPenninculo = pendingQuery[i].penninculo;
				var resultLang = pendingQuery[i].lang;
				var verbalizationChildren = languageManager.verbalizeResult(resultValue);

				if(!(resultValue in indexMap)){
					indexMap[resultValue] = 1;
				}
				else{
					indexMap[resultValue] += 1;
				}

				var indexChildren = indexMap[resultValue];
				var keyChildren = resultValue + "_" + indexChildren;

				var relatedToValue = elementOnFocus;
				if(MapCreator.prototype.isRefinement(elementOnFocus))
					relatedToValue = MapCreator.prototype.getTopElement(elementOnFocus);

				if('sameAs' in queryLogicMap[relatedToValue])
					relatedToValue = queryLogicMap[relatedToValue].sameAs;

				var newLogicChildren = {key: keyChildren, index: indexChildren,
							   url: resultValue, label: resultValue, 
							   type:'result', direction: false,
							   verbalization: verbalizationChildren, 
							   parent:key, children: [], 
							   datatype: resultDatatype, penninculo: resultPenninculo,
							   lang: resultLang,
							   relatedTo: relatedToValue,
							   mySameAsReferences : []};

				if(queryViewer == null)
					queryViewer = new QueryViewer();
				newLogicChildren.cachedQuery = queryViewer.getCachedQuery();
				queryLogicMap[keyChildren] = newLogicChildren;

				newLogicElement.children.push(keyChildren);

				resultOnFocus = keyChildren;

				//keys to return 
				resultsKey.push(keyChildren);
			}	
			updateAndNotifyFocus(resultOnFocus);
			break;

		case 'not':
		case 'optional':

			var precElem = queryLogicMap[elementOnFocus];
			if(precElem.type == 'operator' && (precElem.subtype == 'not' || precElem.subtype == 'optional')){
				//updateAndNotifyFocus(precElem);
				break;
			}

			var verbalization = languageManager.verbalizeOperator(operator);

			if(!(operator in indexMap)){
				indexMap[operator] = 1;
			}
			else{
				indexMap[operator] += 1;
			}

			var index = indexMap[operator];
			var key = operator + "_" + index;

			var parent = queryLogicMap[elementOnFocus].parent;

			var newLogicElement = {key: key, index: index,
						   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
						   type:'operator', subtype: operator,  direction: false,
						   verbalization: verbalization, 
						   parent:parent, children: [elementOnFocus]};
			queryLogicMap[key] = newLogicElement;

			var index = $.inArray(elementOnFocus, queryLogicMap[parent].children);
			queryLogicMap[parent].children[index] = key;

			queryLogicMap[elementOnFocus].parent = key;

			updateAndNotifyFocus(key);

			break;

		case 'and': 
		//case 'or': 
		case 'or':

			var elementOnFocusNode = queryLogicMap[elementOnFocus];
			var elementOnFocusOperatorSiblings = [];
			var elementOnFocusAllSiblings = queryLogicMap[elementOnFocusNode.parent].children;
			for(var i = 1; i < elementOnFocusAllSiblings.length; i = i+2){
				elementOnFocusOperatorSiblings.push(elementOnFocusAllSiblings[i]);
			}
			
			var conjunctionVerbalization = languageManager.verbalizeOperator(operator);

			for(var i = 0; i<elementOnFocusOperatorSiblings.length; i++){

				if(!(operator in indexMap)){
					indexMap[operator] = 1;
				}
				else{
					indexMap[operator] += 1;
				}

				var conjunctionIndex = indexMap[operator];
				var conjunctionKey = operator + "_" + conjunctionIndex;

				var conjunctionLogicElement = {key: conjunctionKey, index: conjunctionIndex,
									   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
									   type:'operator', subtype: operator, direction: false, 
									   verbalization: conjunctionVerbalization, 
									   parent:elementOnFocusNode.parent, children: []};
				queryLogicMap[conjunctionKey] = conjunctionLogicElement;

				var index = $.inArray(elementOnFocusOperatorSiblings[i], queryLogicMap[elementOnFocusNode.parent].children);
				queryLogicMap[elementOnFocusNode.parent].children[index] = conjunctionKey;
			
				decreaseIndexIfIAmLast(queryLogicMap[elementOnFocusOperatorSiblings[i]]);
				delete queryLogicMap[elementOnFocusOperatorSiblings[i]];
			}

			updateAndNotifyFocus(conjunctionKey);
			break;
	}

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);

	return resultsKey;
}

MapCreator.prototype.selectedRepeatOperator  = function(repeatParameters){
	var operator = repeatParameters[0];
	var keyToRepeat = repeatParameters[1];
	var nodeToRepeat = queryLogicMap[keyToRepeat];

	//manage who is the parent
	var parent = nodeToRepeat.parent; 
	if(parent !=null){
		if(queryLogicMap[parent].type == 'operator' && 
			(queryLogicMap[parent].subtype == 'not' || queryLogicMap[parent].subtype == 'operator'))
				parent = queryLogicMap[parent].parent;
	}

	//conjunction
	var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

	if(!(operator in indexMap)){
		indexMap[operator] = 1;
	}
	else{
		indexMap[operator] += 1;
	}

	var newOperatorIndex = indexMap[operator];
	var newOperatorKey = operator + "_" + newOperatorIndex;

	var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
						   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
						   type:'operator', subtype: operator, direction: false, 
						   verbalization: newOperatorVerbalization, 
						   parent:parent, children: []};
	queryLogicMap[newOperatorKey] = newOperatorLogicElement;

	//repeated node
	if(!(nodeToRepeat.url in indexMap)){
		indexMap[nodeToRepeat.url] = 1;
	}
	else{
		indexMap[nodeToRepeat.url] += 1;
	}

	var index = indexMap[nodeToRepeat.url];
	var key = nodeToRepeat.url + "_" + index;

	var newLogicElement = {key: key, index: index,
						   url: nodeToRepeat.url, label: nodeToRepeat.label, 
						   type:nodeToRepeat.type, direction: nodeToRepeat.direction,
						   verbalization: $.extend(true, {}, nodeToRepeat.verbalization), 
						   parent:parent, children: [],
						   mySameAsReferences : []};

	if('sameAs' in nodeToRepeat)
		newLogicElement['sameAs'] = nodeToRepeat['sameAs'];
	else
		newLogicElement['sameAs'] = keyToRepeat;

	nodeToRepeat['mySameAsReferences'].push(key);

	queryLogicMap[key] = newLogicElement;

	if(nodeToRepeat.type == 'predicate' && nodeToRepeat.direction == 'reverse'){
		// add something node to complete reverse predicate
		var somethingVerbalization = languageManager.verbalizeSomething();

		if(!indexMap.hasOwnProperty('something')){
			indexMap['something'] = 1;
		}
		else{
			indexMap['something'] += 1;
		}

		var somethingIndex = indexMap['something'];
		var somethingKey = 'something' + "_" + somethingIndex;

		var somethingLogic = {key: somethingKey, index: somethingIndex,
							  //url: somethingKey, label:'thing', 
							  url: 'something', label:languageManager.getSomethingLabelVerbalization(), 
							  type:'something', direction:false,
							  verbalization:somethingVerbalization,
							  parent:key, children:[],
							  mySameAsReferences : []};
		queryLogicMap[somethingKey] = somethingLogic;

		queryLogicMap[key].children.push(somethingKey);	
	}

	if(parent!=null){
		queryLogicMap[parent].children.push(newOperatorKey);
		queryLogicMap[parent].children.push(key);
	}else{
		rootListQueryLogicMap.push(newOperatorKey);
		rootListQueryLogicMap.push(key);
	}

	elementOnFocus = key;
	updateAndNotifyFocus(elementOnFocus);

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);

}

MapCreator.prototype.selectedResult = function(result){
	var elementOnFocusNode = queryLogicMap[elementOnFocus];

	var verbalization = languageManager.verbalizeResult(result.value);

	if(!(result.value in indexMap)){
		indexMap[result.value] = 1;
	}
	else{
		indexMap[result.value] += 1;
	}

	var index = indexMap[result.value];
	var key = result.value + "_" + index;

	var newLogicElement = {key: key, index: index,
				   url: result.value, label: result.value, 
				   type:'result', direction: false,
				   verbalization: verbalization, 
				   parent:elementOnFocusNode.parent, children: [], 
				   datatype: result.datatype, penninculo: result.penninculo, 
				   lang: result.lang,
				   relatedTo: elementOnFocusNode.relatedTo,
				   cachedQuery: elementOnFocusNode.cachedQuery,
				   mySameAsReferences : []};

	queryLogicMap[key] = newLogicElement;

	var indexInParent = $.inArray(elementOnFocus, queryLogicMap[elementOnFocusNode.parent].children);
	queryLogicMap[elementOnFocusNode.parent].children[indexInParent] = key;
		
	removeMeAndMyDescendents(elementOnFocusNode, queryLogicMap);

	updateAndNotifyFocus(key);

	//console.log(queryLogicMap);

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);

	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);

	return key;
}

// remove element in map
MapCreator.prototype.removeElement = function(key){
	
	var node = queryLogicMap[key];

	updateSameAsReferences(node);

	if(node.type=='operator')
		removeOperator(node);
	else if(iReplaceASomethingNode(key)){// check if concept replaced something
		var somethingKey = substituteMeWithSomethingNode(key);
		elementOnFocus = somethingKey;
	}
	else{

		elementOnFocus = node.parent;
		removeMeAndMyDescendents(node, queryLogicMap);

		// update parent's children list
		if(node.parent!=null){

			cleanMyParentList(node);
			
			//removed node is query's subject
			if(queryLogicMap[node.parent].type == 'everything'){

				var everythingNode = queryLogicMap[node.parent];

				//update counter direct predicates
				if(node.type == 'predicate' && node.direction == 'direct')
					everythingNode.counterDirectPredicatesChildren--;

				//if I have to remove everything node...
				if(everythingNode.children.length==0){
					decreaseIndexIfIAmLast(everythingNode);
					delete queryLogicMap[everythingNode.key];
					
					var rootIndex = rootListQueryLogicMap.indexOf(everythingNode.key);
					if(rootIndex==0){
						rootListQueryLogicMap.splice(rootIndex, 2);
					}else if(rootIndex>0){
						rootListQueryLogicMap.splice(rootIndex-1, 2);
					}

					if(rootListQueryLogicMap.length>0)
						elementOnFocus = rootListQueryLogicMap[0];
					else
						elementOnFocus = null;
	
				}/*else if(everythingNode.children.length==1 && everythingNode.counterDirectPredicatesChildren==0){
					decreaseIndexIfIAmLast(everythingNode);
					delete queryLogicMap[everythingNode.key];

					queryLogicMap[everythingNode.children[0]].parent = null;
					rootQueryLogicMap = everythingNode.children[0];
					elementOnFocus = everythingNode.children[0];
				}*/else{
					elementOnFocus = everythingNode.key;
				}
			}else if(queryLogicMap[node.parent].type == 'operator'){//should be 'not' or 'optional' 
				var operatorNode = queryLogicMap[node.parent];
				removeMeAndMyDescendents(operatorNode, queryLogicMap);
				cleanMyParentList(operatorNode);
				elementOnFocus = operatorNode.parent;
			}
			else{
				elementOnFocus = node.parent;
			}
		}

		if(node.type == 'something'){
			node = queryLogicMap[node.parent];
			cleanMyParentList(node);

			decreaseIndexIfIAmLast(node);
			delete queryLogicMap[node.key];

			elementOnFocus = node.parent;
		}

	}

	var rootIndex = rootListQueryLogicMap.indexOf(key);
	if(rootIndex==0){
		rootListQueryLogicMap.splice(rootIndex, 2);
	}else if(rootIndex>0){
		rootListQueryLogicMap.splice(rootIndex-1, 2);
	}

	if(node.parent==null){
		if(rootListQueryLogicMap.length>0)
			elementOnFocus = rootListQueryLogicMap[0];
		else
			elementOnFocus = null;
	}

	updateAndNotifyFocus(elementOnFocus);

	if(elementOnFocus == null)
		indexMap = {};

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);	
}

//update focus and notify operatorManager when USER change focus
MapCreator.prototype.changeFocus = function(newElementOnFocus){
	elementOnFocus = newElementOnFocus;

	if(operatorManager == null)
		operatorManager = new OperatorManager;
	operatorManager.changedFocus(elementOnFocus, true);
}

MapCreator.prototype.changeResultLimit = function(resultLimitValue){
	resultLimit = resultLimitValue;

	/*if(operatorManager == null)
		operatorManager = new OperatorManager;
	operatorManager.changedFocus(elementOnFocus, false);

	if(queryVerbalizator == null)
		queryVerbalizator = new QueryVerbalizator;
	queryVerbalizator.updateQuery(rootQueryLogicMap, queryLogicMap, elementOnFocus);*/
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);
}

MapCreator.prototype.systemLangChanged = function(){

	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;

	queryBuilder.getMapElementsLabel(
		queryLogicMap,
		function(newMap){//set delle nuove label
			queryLogicMap = newMap;

			for(key in queryLogicMap){
				var element = queryLogicMap[key];
				switch(element.type){
					case 'predicate':
						//change verbalization. label will be changed by querybuilder
						element.verbalization = languageManager.verbalizePredicate(element.label, element.direction);
						break;
					case 'concept':
						//change verbalization. label will be changed by querybuilder
						element.verbalization = languageManager.verbalizeConcept(element.label);
						break;
					case 'result':
						//change only verbalization
						element.verbalization = languageManager.verbalizeResult(element.label);
						break;
					case 'everything':
					case 'something':
						var tempType = element.type.charAt(0).toUpperCase() + element.type.slice(1);
						element.label = eval('languageManager.get'+tempType+'LabelVerbalization')();
						element.verbalization = eval('languageManager.verbalize'+tempType)(element.label);
						break;
					case 'operator':
						element.label = languageManager.getOperatorLabelVerbalization(element.subtype);
						element.verbalization = languageManager.verbalizeOperator(element.subtype);
						break;

				}		
			}

			updateAndNotifyFocus(elementOnFocus);

			if(queryVerbalizator == null)
				queryVerbalizator = new QueryVerbalizator;
			queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
			
			if(queryBuilder == null)
				queryBuilder = new QueryBuilder;
			queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);
		});
}

/*
MapCreator.prototype.labelLangChanged = function(){
	
	//chiamata a executor per tradurre elementi nella mappa creta fino a quel momento
	//set della nuova label nell'executor (anche in un unica chiamata)

	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;

	queryBuilder.getMapElementsLabel(
		queryLogicMap,
		function(newMap){//set delle nuove label
			queryLogicMap = newMap;

			updateAndNotifyFocus(elementOnFocus);

			if(queryVerbalizator == null)
				queryVerbalizator = new QueryVerbalizator;
			queryVerbalizator.updateQuery(rootListQueryLogicMap, queryLogicMap, elementOnFocus);
			
			if(queryBuilder == null)
				queryBuilder = new QueryBuilder;
			queryBuilder.updateQuery(rootListQueryLogicMap, queryLogicMap);
		});
}*/

MapCreator.prototype.getNodeByKey = function(key){
	return queryLogicMap[key];
}

MapCreator.prototype.isRefinement = function(key){
	var node = queryLogicMap[key];
	if(node.parent == null)
		return false;

	var parent = queryLogicMap[node.parent];

	if(node.type == 'concept' && (parent.type == 'concept' || parent.type == 'everything' || (parent.type == 'predicate' && parent.direction == 'direct'))){
		return true;
	}

	return false;
}

MapCreator.prototype.getTopElement = function(key){
	var node = queryLogicMap[key];
	var parent = queryLogicMap[node.parent];

	while(node.type == 'concept' && (parent != undefined && (parent.type == 'concept' || (parent.type == 'predicate' && parent.direction == 'direct')))){
		node = parent;
		parent = queryLogicMap[node.parent];
	}

	return node.key;
}

MapCreator.prototype.getSiblingConjunctionByKey = function(key){
	var conjunction=[];

	var node = queryLogicMap[key];
	if(node.parent !=null){
		var parentNode =  queryLogicMap[node.parent];
		if(parentNode.type=='operator' && (parentNode.subtype=='not' || parentNode.subtype=='optional'))
			parentNode = queryLogicMap[parentNode.parent]; //it should not be NULL

		if(parentNode.children.length>1)
			conjunction.push(queryLogicMap[parentNode.children[1]].subtype);
		else{
			conjunction.push('and');
			//conjunction.push('or');
			conjunction.push('or');
		}
	}else{
		if(rootListQueryLogicMap.length>1){
			conjunction.push(queryLogicMap[rootListQueryLogicMap[1]].subtype);
		}else{
			conjunction.push('and');
			//conjunction.push('or');
			conjunction.push('or');
		}
	}

	return conjunction;
}

MapCreator.prototype.getConjunctionKeysByConjunction = function(key){
	var conjunction=[];

	var node = queryLogicMap[key];
	if(node.parent !=null){
		conjunction = queryLogicMap[node.parent].children;
	}else{
		conjunction = rootListQueryLogicMap;
	}

	return conjunction;

}

MapCreator.prototype.addFictionalConcept = function(keyword, callback){

	var mapWithFictionalConcept = $.extend(true, {}, queryLogicMap);

	var key = 'SPLODFictionalConcept';
	var index = 1;

	// new element in logic map
	var newLogicElement = {key: key, index: index,
						   url: key, label: key, 
						   type:'concept', direction: false, 
						   parent:null, children: [],
						   mySameAsReferences : [], 
						   fictional:'', keyword:keyword};
	mapWithFictionalConcept[key] = newLogicElement;

	var precLogicElement = mapWithFictionalConcept[elementOnFocus];

	if(precLogicElement.type=='something'){ // replace something
		
		//update newLogicElement
		//newLogicElement.children = precLogicElement.children;
		newLogicElement.parent = precLogicElement.parent;

		//update map
		var indexSomething = $.inArray(precLogicElement.key, mapWithFictionalConcept[precLogicElement.parent].children);
		mapWithFictionalConcept[precLogicElement.parent].children[indexSomething] = newLogicElement.key;
		fictionalRemoveMeAndMyDescendents(mapWithFictionalConcept[precLogicElement.key], mapWithFictionalConcept);	

	}else{ // concept refining parent node

		if(precLogicElement.children.length>0){
			var operator;
			if(precLogicElement.children.length>1)//new operator has to be the same type of operator
				operator = mapWithFictionalConcept[precLogicElement.children[1]].subtype;
			else//default conjunction
				operator = 'and';
			 
			var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

			var newOperatorIndex = 1;
			if(operator in indexMap){
				newOperatorIndex = indexMap[operator] + 1;
			}
			
			var newOperatorKey = operator + "_" + newOperatorIndex;

			var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
								   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
								   type:'operator', subtype: operator, direction: false, 
								   verbalization: newOperatorVerbalization, 
								   parent:precLogicElement.key, children: []};
			mapWithFictionalConcept[newOperatorKey] = newOperatorLogicElement;

			precLogicElement.children.push(newOperatorKey);
			
		}
		newLogicElement.parent = precLogicElement.key;
		precLogicElement.children.push(newLogicElement.key);	

	} 

	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.getConcepts(rootListQueryLogicMap, mapWithFictionalConcept, callback);
}

/*
	var resultObj = {
			directArray: directData,
			reverseArray: reverseData
		};
*/
MapCreator.prototype.addFictionalDirectPredicate = function(keyword, callback){

	var mapWithFictionalPredicate = $.extend(true, {}, queryLogicMap);

	var key = 'SPLODFictionalDirectPredicate';
	var index = 1;

	var newLogicElement = {key: key, index: index,
						   url: key, label: key, 
						   type:'predicate', direction: 'direct', 
						   parent:null, children: [],
						   mySameAsReferences : [], 
						   fictional:'', keyword: keyword};
	mapWithFictionalPredicate[key] = newLogicElement;


	var precLogicElement = mapWithFictionalPredicate[elementOnFocus];
		
	//if i have sibling i put and before me
	if(precLogicElement.children.length>0){
		var operator;
		if(precLogicElement.children.length>1)//new operator has to be the same type of operator
			operator = mapWithFictionalPredicate[precLogicElement.children[1]].subtype;
		else//default conjunction
			operator = 'and';
		 
		var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

		var newOperatorIndex = 1;

		if(operator in indexMap){
			newOperatorIndex = indexMap[operator] + 1;
		}

		var newOperatorKey = operator + "_" + newOperatorIndex;

		var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
							   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
							   type:'operator', subtype: operator, direction: false, 
							   verbalization: newOperatorVerbalization, 
							   parent:precLogicElement.key, children: []};
		mapWithFictionalPredicate[newOperatorKey] = newOperatorLogicElement;

		precLogicElement.children.push(newOperatorKey);
	}

	// add me to parent's children list
	precLogicElement.children.push(key);
	newLogicElement.parent = precLogicElement.key;
	
	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.getDirectPredicates(rootListQueryLogicMap, mapWithFictionalPredicate, callback);

}

MapCreator.prototype.addFictionalReversePredicate = function(keyword, callback){

	var mapWithFictionalPredicate = $.extend(true, {}, queryLogicMap);

	var key = 'SPLODFictionalReversePredicate';
	var index = 1;

	var newLogicElement = {key: key, index: index,
						   url: key, label: key, 
						   type:'predicate', direction: 'reverse', 
						   parent:null, children: [],
						   mySameAsReferences : [], 
						   fictional:'', keyword:keyword};
	mapWithFictionalPredicate[key] = newLogicElement;


	var precLogicElement = mapWithFictionalPredicate[elementOnFocus];
		
	//if i have sibling i put and before me
	if(precLogicElement.children.length>0){
		var operator;
		if(precLogicElement.children.length>1)//new operator has to be the same type of operator
			operator = mapWithFictionalPredicate[precLogicElement.children[1]].subtype;
		else//default conjunction
			operator = 'and';
		 
		var newOperatorVerbalization = languageManager.verbalizeOperator(operator);

		var newOperatorIndex = 1;

		if(operator in indexMap){
			newOperatorIndex = indexMap[operator] + 1;
		}

		var newOperatorKey = operator + "_" + newOperatorIndex;

		var newOperatorLogicElement = {key: newOperatorKey, index: newOperatorIndex,
							   url: operator, label: languageManager.getOperatorLabelVerbalization(operator), 
							   type:'operator', subtype: operator, direction: false, 
							   verbalization: newOperatorVerbalization, 
							   parent:precLogicElement.key, children: []};
		mapWithFictionalPredicate[newOperatorKey] = newOperatorLogicElement;

		precLogicElement.children.push(newOperatorKey);
	}

	// add me to parent's children list
	precLogicElement.children.push(key);
	newLogicElement.parent = precLogicElement.key;

	if(queryBuilder == null)
		queryBuilder = new QueryBuilder;
	queryBuilder.getReversePredicates(rootListQueryLogicMap, mapWithFictionalPredicate, callback);
}

MapCreator.prototype.focusHasNotAsParent = function(){
	return queryLogicMap[elementOnFocus].parent!=null &&
		queryLogicMap[queryLogicMap[elementOnFocus].parent].type == 'operator' 
		&& queryLogicMap[queryLogicMap[elementOnFocus].parent].subtype == 'not';
}

function initializeMap(){
	queryLogicMap = {};
 	rootListQueryLogicMap = [];
	indexMap = {};

	if(tableResultManager == null)
		tableResultManager = new TableResultManager;
	tableResultManager.resetTable();
}
//update focus and notify operatorManager when focus changes because of map updates
function updateAndNotifyFocus(key){
	elementOnFocus = key;

	if(elementOnFocus==null) 
		initializeMap();

	if(operatorManager == null)
		operatorManager = new OperatorManager;
	operatorManager.changedFocus(elementOnFocus, false);
}

function iReplaceASomethingNode(key){
	var node = queryLogicMap[key];
	return node.type == 'concept' && 
		node.parent!=null && 
		queryLogicMap[node.parent].type == 'predicate' && 
			queryLogicMap[node.parent].direction == 'reverse';
}

function substituteMeWithSomethingNode(key){
	var node = queryLogicMap[key];

	var somethingVerbalization = languageManager.verbalizeSomething();

	if(!indexMap.hasOwnProperty('something')){
		indexMap['something'] = 1;
	}
	else{
		indexMap['something'] += 1;
	}
	var somethingKey = 'something' + "_" + indexMap['something'];
	var somethingIndex = indexMap['something'];

	/*
		To inherite node.children list and update child's parent

		// new element in logic map
		var somethingLogic = {key: somethingKey, index: somethingIndex,
							  url: somethingKey, label:'thing', 
							  type:'something', direction:false,
							  verbalization:somethingVerbalization,
							  parent:node.parent, children:node.children};
		queryLogicMap[somethingKey] = somethingLogic;

		for(var i=0; i<node.children.length; i++)
			queryLogicMap[node.children[i]].parent = somethingKey;
	*/

	// to remove all node.children element
	// new element in logic map
	var somethingLogic = {key: somethingKey, index: somethingIndex,
							  url: 'something', label:languageManager.getSomethingLabelVerbalization(),
							  type:'something', direction:false,
							  verbalization:somethingVerbalization,
							  parent:node.parent, children:[],
							  mySameAsReferences : []};
	queryLogicMap[somethingKey] = somethingLogic;

	for(var i=0; i<node.children.length; i++){
		decreaseIndexIfIAmLast(queryLogicMap[node.children[i]]);
		delete queryLogicMap[node.children[i]];
	}

	var index = $.inArray(node.key, queryLogicMap[node.parent].children);
	queryLogicMap[node.parent].children[index] = somethingKey;
	
	decreaseIndexIfIAmLast(node);
	delete queryLogicMap[node.key];

	return somethingKey;
}

function removeMeAndMyDescendents(node, map){
	// remove node and his children 
	var visitStack = [];
	visitStack.push(node);

	while(visitStack.length != 0){
		var currentNode = visitStack.pop();

		for(var i = currentNode.children.length-1; i>=0; i--){
			visitStack.push(map[currentNode.children[i]]);
		}

		decreaseIndexIfIAmLast(currentNode);
		delete map[currentNode.key];
	}
}

function fictionalRemoveMeAndMyDescendents(node, map){
	// remove node and his children 
	var visitStack = [];
	visitStack.push(node);

	while(visitStack.length != 0){
		var currentNode = visitStack.pop();

		for(var i = currentNode.children.length-1; i>=0; i--){
			visitStack.push(map[currentNode.children[i]]);
		}

		delete map[currentNode.key];
	}
}

//remove me and related conjunctions and/or from my parent's list
function cleanMyParentList(node){
	var childrenList = queryLogicMap[node.parent].children;
	var index = $.inArray(node.key, childrenList);
	if(childrenList.length>1){
		if(index==0){
			decreaseIndexIfIAmLast(queryLogicMap[childrenList[index+1]]);
			delete queryLogicMap[childrenList[index+1]];
			
			childrenList.splice(index, 2);//removed me and 'and' after me
		}
		else{
			decreaseIndexIfIAmLast(queryLogicMap[childrenList[index-1]]);
			delete queryLogicMap[childrenList[index-1]];
			
			queryLogicMap[node.parent].children.splice(index-1, 2);//removed me and 'and' before me
		}
	}else{
		queryLogicMap[node.parent].children.splice(index, 1);
	}
}

function removeOperator(node){
	var operator = node.subtype;

	switch(operator){
		case 'is string':
		case 'is url':
		case 'is date':
		case 'starts with':
		case 'ends with':
		case 'contains':
		case 'lang':
		case '<':
		case '<=':
		case '>':
		case '>=':
		case '=':
		case 'before':
		case 'after':

		case 'range date':
		case 'range':

			var nodeToRemove = node;
			var parentNode = queryLogicMap[node.parent];
			if(parentNode.type == 'operator' && parentNode.subtype == 'not')
				nodeToRemove = parentNode;

			removeMeAndMyDescendents(nodeToRemove, queryLogicMap);
			cleanMyParentList(nodeToRemove);
			updateAndNotifyFocus(nodeToRemove.parent);

			break;

		case 'not':
		case 'optional':

			var child = queryLogicMap[node.children[0]];
			
			child.parent = node.parent;	

			var index = $.inArray(node.key, queryLogicMap[node.parent].children);
			queryLogicMap[node.parent].children[index] = child.key;
			
			decreaseIndexIfIAmLast(node);
			delete queryLogicMap[node.key];

			updateAndNotifyFocus(child.key);
			
			break;

		/*case 'and': //focus su or
		case 'or': //focus su and
			operator = (operator == 'and' ? 'or' : 'and');
			var conjunctionVerbalization = languageManager.verbalizeOperator(operator);

			if(!(operator in indexMap)){
				indexMap[operator] = 1;
			}
			else{
				indexMap[operator] += 1;
			}

			var conjunctionIndex = indexMap[operator];
			var conjunctionKey = operator + "_" + conjunctionIndex;

			var conjunctionLogicElement = {key: conjunctionKey, index: conjunctionIndex,
								   url: operator, label: operator, 
								   type:'operator', direction: false, 
								   verbalization: conjunctionVerbalization, 
								   parent:node.parent, children: []};
			queryLogicMap[conjunctionKey] = conjunctionLogicElement;

			var index = $.inArray(node.key, queryLogicMap[node.parent].children);
			queryLogicMap[node.parent].children[index] = conjunctionKey;
			
			decreaseIndexIfIAmLast(node);
			delete queryLogicMap[node.key];

			updateAndNotifyFocus(conjunctionKey);

			break;
		case 'xor':
			operator = 'and';
			var conjunctionVerbalization = languageManager.verbalizeOperator(operator);

			if(!(operator in indexMap)){
				indexMap[operator] = 1;
			}
			else{
				indexMap[operator] += 1;
			}

			var conjunctionIndex = indexMap[operator];
			var conjunctionKey = operator + "_" + conjunctionIndex;

			var conjunctionLogicElement = {key: conjunctionKey, index: conjunctionIndex,
								   url: operator, label: operator, 
								   type:'operator', direction: false, 
								   verbalization: conjunctionVerbalization, 
								   parent:node.parent, children: []};
			queryLogicMap[conjunctionKey] = conjunctionLogicElement;

			var index = $.inArray(node.key, queryLogicMap[node.parent].children);
			queryLogicMap[node.parent].children[index] = conjunctionKey;
			
			decreaseIndexIfIAmLast(node);
			delete queryLogicMap[node.key];

			updateAndNotifyFocus(conjunctionKey);

			break;*/
			//case 'or':
			case 'or':
			case 'and':
				break;

	}
	//console.log(queryLogicMap);
}

function decreaseIndexIfIAmLast(node){
	if(node.index == indexMap[node.url])
		indexMap[node.url] = indexMap[node.url]-1;
}

function updateSameAsReferences(node){
	//if I have sameAs, I have to update its references list
	if('sameAs' in node){
		var index = queryLogicMap[node.sameAs].mySameAsReferences.indexOf(node.key);
		queryLogicMap[node.sameAs].mySameAsReferences.splice(index, 1);
	}

	if('mySameAsReferences' in node && node.mySameAsReferences.length!=0){
		//if I am sameAs of something 
		var newSameAsKey = node.mySameAsReferences[0];
		var newSameAsNode = queryLogicMap[newSameAsKey];
		delete newSameAsNode.sameAs;

		newSameAsNode.mySameAsReferences = node.mySameAsReferences.splice(1,node.mySameAsReferences.length-1);
		for(var i=0; i<newSameAsNode.mySameAsReferences.length; i++){
			queryLogicMap[newSameAsNode.mySameAsReferences[i]].sameAs = newSameAsKey;
		}
	}
}