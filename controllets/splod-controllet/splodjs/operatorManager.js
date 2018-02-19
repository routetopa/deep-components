var resultDatatype;
var operatorMap;
var parameterNumberOperator;

var savedResult;
var literalLang;
var resultLiteralLang;
var cachedResult;

var mapCreator;

var pendingQuery;

var changedFocus;
var onFocusOperator;

//OperatorManager is a singleton
var OperatorManager = function () {
	if(OperatorManager.prototype._singletonInstance){
		return OperatorManager.prototype._singletonInstance;
	}

	mapCreator = new MapCreator();

	changedFocus = false;
	onFocusOperator = null;
	inizializeMaps();

	parameterNumberOperator = {
		'and' : 1, 
		//'or' : 1, or che aggrega tuple, che chiamavamo or inclusivo
		'or' : 1,
		'not' : 1,
		'optional' : 1,

		//'repeat' : 1,
		
		'<' : 2,
		'<=' : 2,
		'>' : 2,
		'>=' : 2,
		'=' : 2,
		'is url' : 2,
		'is string' : 2,
		'starts with' : 2,
		'ends with' : 2,
		'contains' : 2,
		'lang' : 2,
		'is date' : 2,
		'before' : 2,
		'after' : 2,

		'range' : 3,
		'range date' : 3
	};					
						
	operatorMap = {
		'number' : ['<', '<=', '>', '>=', '=', 'range'],

		'string' : ['is string', 'starts with', 'ends with', 'contains'],

		'literal' : ['is string', 'starts with', 'ends with', 'contains', 'lang'],

		'date' : ['is date', 'before', 'after', 'range date'],
		'time' : ['is date', 'before', 'after', 'range date'],
		'dateTime' : ['is date', 'before', 'after', 'range date'],
		'gDay' : ['is date', 'before', 'after', 'range date'],
		'gMonth' : ['is date', 'before', 'after', 'range date'],
		'gMonthDay' : ['is date', 'before', 'after', 'range date'],
		'gYear' : ['is date', 'before', 'after', 'range date'],
		'gYearMonth' : ['is date', 'before', 'after', 'range date'],

		'uri' : ['is url'],

		'boolean' : ['is string'],

		'img' : [],

		'and' : ['or'],
		//'or' : ['and', 'xor'],
		'or' : ['and'],

		'<' : ['not', 'optional'],
		'<=' : ['not', 'optional'],
		'>' : ['not', 'optional'],
		'>=' : ['not', 'optional'],
		'=' : ['not', 'optional'],
		'range' : ['not', 'optional'],

		'starts with': ['not', 'optional'],
		'ends with': ['not', 'optional'],
		'contains': ['not', 'optional'],
		'is string': ['not', 'optional'],
		'is url': ['not', 'optional'],
		'lang': ['not', 'optional'],
		'is date': ['not', 'optional'],
		'before': ['not', 'optional'],
		'after': ['not', 'optional'],
		'range date': ['not', 'optional'],

		//'not' :[],
		//'optional':[]

	};

	OperatorManager.prototype._singletonInstance = this;
};

//mapCreator notify that focus has been changed
OperatorManager.prototype.changedFocus = function(newOnFocus, userChangeFocus){
	changedFocus = true;
	onFocusOperator = newOnFocus;

	if(onFocusOperator!=null){
		if(userChangeFocus){
			manageUpdateOperatorViewer();
		}
	}else{
		inizializeMaps();
		renderOperatorList([]);
	}
}

//queryExecutor notify that results are ready
OperatorManager.prototype.queryResult = function(select, labelSelect, keySelect, results){
	var result = results[0];

	for(var i=0; i<keySelect.length; i++){
		savedResult[keySelect[i]] = new Object();
		literalLang[keySelect[i]] = new Array();
	}

	for(var i=0; i<keySelect.length; i++){
		resultDatatype[keySelect[i]] = new Object(); 
		resultDatatype[keySelect[i]].datatype = new Array(); 
	}

	$.each(results, function(index){

		var result = results[index];

		for(field in result){

			var temp = {};
			temp.value = result[field].value;

			var type = result[field].type;
			// from uri to label for better user experience
			if(type == 'uri'){
				result[field].url = result[field].value;
				result[field].value = createLabel(result[field].value);

				temp.url = result[field].url;
			}

			if('datatype' in result[field])
				temp.penninculo = '<'+result[field].datatype+'>';
			else
				temp.penninculo = '';

			var currentResultDatatype = '';

			var arrayIndex = $.inArray('?'+field, select);
			switch(type){
				case 'uri' : 
				case 'anyURI':
					var url = result[field].url;
					if((url.toLowerCase()).match(/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png|svg)/)!=null){
						currentResultDatatype = 'img';
					}
					else{
						currentResultDatatype = 'uri';
					}
					break;
				
				case 'typed-literal' : 
					var datatype = createLabel(result[field].datatype);

					switch(datatype){
						/*case 'integer':
						case 'nonNegativeInteger':
						case 'negativeInteger':
						case 'nonPositiveInteger':
						case 'positiveInteger':					
						case 'kilometre':
						case 'kilogramPerCubicMetre':
						case 'klometrePerSecond':
						case 'double':
						case 'float':
							var index = $.inArray('?'+field, select);
							resultDatatype[keySelect[index]] = {datatype : 'number'};
							break;			
						*/
						case 'gYear':
						case 'gMonth':
						case 'gDay':
						case 'gMonthDay':
						case 'gYearMonth':
						case 'date':
						case 'dateTime':
						case 'time':
						case 'boolean':
							currentResultDatatype = datatype;
							break;
						case 'squareMetre':
						case 'langString':
							currentResultDatatype = 'string';
							break;
							
						default : 
							if($.isNumeric(result[field].value)){
								currentResultDatatype = 'number';
							}
							else{
								currentResultDatatype = 'string';
							}
							//console.log('type : typed-literal, datatype:' +datatype);
							break;
					}

					break;

				case 'literal':
				case 'boolean': 
					currentResultDatatype = type;
					break;

				default : 
					if($.isNumeric(result[field].value)){
						currentResultDatatype = 'number';
					}
					else{
						currentResultDatatype = 'string';	
					}
					//console.log('type:' +type);
					break;

			}

			if($.inArray(currentResultDatatype, resultDatatype[keySelect[arrayIndex]].datatype)<0)
				resultDatatype[keySelect[arrayIndex]].datatype.push(currentResultDatatype);

			if(!(currentResultDatatype in savedResult[keySelect[arrayIndex]]))
				savedResult[keySelect[arrayIndex]][currentResultDatatype] = [];
			savedResult[keySelect[arrayIndex]][currentResultDatatype].push(temp);

			if(type == 'literal'){
				resultLiteralLang[result[field].value] = (result[field])['xml:lang']; //more equals save last

				var langIndex = valInArray((result[field])['xml:lang'], literalLang[keySelect[arrayIndex]]);
				if(langIndex<0){
					var newLang = {value:(result[field])['xml:lang'], occurrences:1};
					literalLang[keySelect[arrayIndex]].push(newLang);
				}
				else{
					literalLang[keySelect[arrayIndex]][langIndex].occurrences++;
				}

				if(keySelect[arrayIndex] == onFocusOperator && !(onFocusOperator in cachedResult))
					cachedResult[onFocusOperator] = literalLang[onFocusOperator];
			}
			else{
				if(keySelect[arrayIndex] == onFocusOperator && !(onFocusOperator in cachedResult))
					cachedResult[onFocusOperator] = savedResult[onFocusOperator];
			}
		}

	});

	sortAndAggregateResults(keySelect);
	saveDatatype(keySelect, resultDatatype);

	if(changedFocus)
		manageUpdateOperatorViewer();
}

//user selects a operator to filter elementOnFocus
OperatorManager.prototype.selectedOperator = function(operator, datatype){
	pendingQuery = [];
	pendingQuery.push({value: operator, datatype: datatype});

	var isComplete = parameterNumberOperator[operator]==pendingQuery.length;

	if(isComplete){
		mapCreator.selectedOperator(pendingQuery);
		pendingQuery = [];
	}

	return isComplete;
}

//user selects repeat operator
OperatorManager.prototype.selectedRepeat = function(repeatParameters){ // operator and value to repeat
	mapCreator.selectedRepeatOperator($.parseJSON(repeatParameters));
	return true;
}

//return result list to complete selected operator
OperatorManager.prototype.getResultToCompleteOperator = function(){
	var operator = pendingQuery[0];
	var operatorField = onFocusOperator;

	var oldresults = cachedResult[onFocusOperator][operator.datatype];
	var newresults; 

	if(operatorField in resultDatatype){ 
		if(operator.datatype=='literal' && operator.value == 'lang')
			newresults = literalLang[operatorField];
		else 
			newresults = savedResult[operatorField][operator.datatype];
	}else{
		newresults = [];
	}
	var type = getTypeByOperator(operatorField, operator.value, operator.datatype);

	return {type:type, results: [oldresults, newresults]};
}

//user selects a reusable result to complete an operator
OperatorManager.prototype.selectedReusableResult = function(result, fromInput){
	var operator = pendingQuery[0];

	var type;
	if(onFocusOperator in resultDatatype){
		type = operator.datatype;
	}else{
		type = null;
	}

	var value = result[0].value;

	if(fromInput){
		switch(type){
			case 'gYear':
				value = value.split('-')[0];
				break;
			case 'gMonth':
				value = value.split('-')[1];
				break;
			case 'gDay':
				value = value.split('-')[2];
				break;
			case 'gMonthDay':
				value = value.substring(5);
				break;
			case 'gYearMonth':
				value = value.substring(0, 7);
				break;
			case 'dateTime':
				value = value + 'T' + result[1].value;
				break;
			/*case 'img':
			case 'uri':
			case 'time':
			case 'date':
			case 'string':
			case 'literal':
			case 'boolean':
			case 'number':
				value = result[0];
				break;*/
		}
	}

	var lang = null;
	if(value in resultLiteralLang)
		lang = resultLiteralLang[value];
	pendingQuery.push({value: value, penninculo: result[0].penninculo, datatype:type, lang:lang});

	var isComplete = (parameterNumberOperator[operator.value]==pendingQuery.length);

	if(isComplete){
		var resultsKey = mapCreator.selectedOperator(pendingQuery);
		pendingQuery = [];
		cacheResultToChange(resultsKey);
	}

	return isComplete;
}

//user changes result to complete an operator
OperatorManager.prototype.changedReusableResult = function(result, fromInput){

	var onFocusNode = mapCreator.getNodeByKey(onFocusOperator); 

	var type = onFocusNode.datatype;

	var value = result[0].value;
	if(fromInput){
		switch(type){
			case 'gYear':
				value = value.split('-')[0];
				break;
			case 'gMonth':
				value = value.split('-')[1];
				break;
			case 'gDay':
				value = value.split('-')[2];
				break;
			case 'gMonthDay':
				value = value.substring(5);
				break;
			case 'gYearMonth':
				value = value.substring(0, 7);
				break;
			case 'dateTime':
				value = value + 'T' + result[1];
				break;
			/*case 'img':
			case 'uri':
			case 'time':
			case 'date':
			case 'string':
			case 'literal':
			case 'boolean':
			case 'number':
			default:
				value = result[0];
				break;*/
		}
	}

	var cachedResultList = cachedResult[onFocusOperator];
	delete cachedResult[onFocusOperator];

	var lang = null;
	if(value in resultLiteralLang)
		lang = resultLiteralLang[value];
	var newKey = mapCreator.selectedResult({value: value, penninculo:result[0].penninculo, datatype:type, lang:lang});
	cachedResult[newKey] = cachedResultList;
}

//peding query fields to visualize it
OperatorManager.prototype.getPendingQueryFields = function(){
	var pendingQueryFields = [];
	
	//concepts or predicates that fire operator's inserting
	var nodeOnFocus = mapCreator.getNodeByKey(onFocusOperator);
	pendingQueryFields.push(nodeOnFocus.label);
	
	//selected operator and, eventually, selected parameters
	for(var i=0; i<pendingQuery.length; i++){
		pendingQueryFields.push(pendingQuery[i].value);
	}

	//fields to fill
	var operator = pendingQuery[0].value;
	var numParameterOperator = parameterNumberOperator[operator];
	for(var i=pendingQuery.length; i<numParameterOperator; i++){
		pendingQueryFields.push(' ');	
	}

	/*if(numParameterOperator>1){
		for(var i=3; i<pendingQueryFields.length; i=i+2){
			pendingQueryFields.splice(i, 0, 'and');
		}
	}*/
	
	return pendingQueryFields;
}

OperatorManager.prototype.discardOperator = function(){
	pendingQuery = [];
}

function getTypeByOperator(operatorField, operator, datatype){

	var results;
	var type = '';

	switch(datatype){
		case 'img':
		case 'uri':
			type = null;
			break;
		case 'gYear':
		case 'gMonth':
		case 'gDay':
		case 'gMonthDay':
		case 'gYearMonth':
		case 'date':
			type = 'date';
			break;
		case 'dateTime':
			type = 'dateTime';
			break;
		case 'time':
			type = 'time';
			break;
		case 'string':
		case 'literal':
		case 'boolean':
			type = 'text';
			break;
		case 'number':
			type = 'number';
			break;
	}
	
	return type;
}

function sortAndAggregateResults(keySelect){
	for(field in savedResult){
		for(datatype in savedResult[field]){
			sort(savedResult[field][datatype], datatype);

			var originalArray = savedResult[field][datatype];
			var newArray = [];

			var current;
			var j=0;
			while(j<originalArray.length){
				current = originalArray[j];
				var k=j+1;
				var occurrences = 1;
				while(k<originalArray.length && 
						originalArray[k].value == current.value && originalArray[k].url == current.url){
					occurrences++;
					k++;
				}
				j=k;
				current.occurrences = occurrences;
				newArray.push(current);
			}

			savedResult[field][datatype]=newArray;
		}
	}
	
	for(var i=0; i<keySelect.length; i++){
		sort(literalLang[keySelect[i]], 'string');
	}
}

function sort(arr, datatype){
	if(datatype == 'number')
		arr.sort(compareNumber);
	else
		arr.sort(compareString);
}

function compareString(a,b) {
	if (a.value < b.value)
		return -1;
	if (a.value > b.value)
	    return 1;
	return 0;
}

function compareNumber(a,b){
	if ((a.value - b.value)<0)
	    return -1;
	if ((a.value - b.value)>0)
		return 1;
	return 0;
}

function valInArray(val, arr){
	var currentObj;
	for(var i=0; i<arr.length; i++){
		currentObj = arr[i];
		if(currentObj.value == val)
			return i;
	}
	return -1;
}

function manageUpdateOperatorViewer(){
	changedFocus = false;
	var operatorList = [];

	if(onFocusOperator==null){
		renderOperatorList([]);
		return;
	}
	
	var node = mapCreator.getNodeByKey(onFocusOperator);
	if('sameAs' in node){
		onFocusOperator = node.sameAs;
		node = mapCreator.getNodeByKey(node.sameAs);
	}

	if(node.type == 'everything' || node.type == 'predicate'){
		var conjunctionList = mapCreator.getSiblingConjunctionByKey(node.key);
		for(var i=0; i<conjunctionList.length; i++)
			operatorList.push({list:['repeat'], datatype:null, repeatParameters: [conjunctionList[i], node.key, node.label]});
	}

	if(node.type == 'concept'){
		var parentNode = mapCreator.getNodeByKey(node.parent);
		if(parentNode==undefined || !(parentNode.type=='predicate' && parentNode.direction=='reverse')){
			var conjunctionList = mapCreator.getSiblingConjunctionByKey(node.key);
			for(var i=0; i<conjunctionList.length; i++)
				operatorList.push({list:['repeat'], datatype:null, repeatParameters: [conjunctionList[i], node.key, node.label]});
		}
	}

	if(node.type=='result'){
		var operatorNode = mapCreator.getNodeByKey(node.parent);
		var operator = operatorNode.subtype;
		var operatorField = node.relatedTo;
		
		var oldresults;
		var newresults = savedResult[operatorField][node.datatype];

		if(operatorField in resultDatatype){ 
			oldresults = cachedResult[node.key];
		}else{
			oldresults = [];
		} 
		
		var type = getTypeByOperator(operatorField, operator, node.datatype);
		renderReusableResultListFromResult({type:type, results:[oldresults,newresults], cachedQuery: node.cachedQuery});
		return;
	}
	
	if(node.type == 'operator'){
		if(node.subtype in operatorMap){ //onFocusOperator is an operator 
			renderOperatorList([{list : operatorMap[node.subtype], datatype:null}]);
			return;
		}else{
			renderOperatorList([]);
			return;
		}
	}
				
	//concept or predicate that fired operator
	if(node.type == 'predicate'){
		var parentNode = mapCreator.getNodeByKey(node.parent);

		if(parentNode.type=='operator' && parentNode.subtype=='not'){
			renderOperatorList(operatorList);
			return;
		}else if(parentNode.type=='everything'){
			operatorList.push({list:['optional'], datatype:null});
			for(var i=0; i<parentNode.children.length; i=i+2){
				var childNode = mapCreator.getNodeByKey(parentNode.children[i]);
				if(childNode.key!=node.key && !(childNode.type=='operator' && childNode.subtype =='not')){
					operatorList.push({list:['not'], datatype:null});
					break;
				}
			}
		}else if(!(parentNode.type=='operator' && parentNode.subtype=='optional')){
			operatorList.push({list:['optional'], datatype:null});
			operatorList.push({list:['not'], datatype:null});
		}
	}

	if(mapCreator.isRefinement(node.key)){
		operatorList.push({list:['optional'], datatype:null});
		operatorList.push({list:['not'], datatype:null});

		onFocusOperator = mapCreator.getTopElement(node.key);
		node = mapCreator.getNodeByKey(onFocusOperator);

		//TODO check if it has sameAs and eventually if its sameAs is a refinement and loop on it.
	}

	//from here onFocusOperator could be the concept or his ancestor
	if(node.key in resultDatatype){
		for(var i=0; i<resultDatatype[node.key].datatype.length; i++){
			operatorList.push({list:operatorMap[resultDatatype[node.key].datatype[i]], datatype:resultDatatype[node.key].datatype[i]});
		}
	}	
	renderOperatorList(operatorList);
	return;	
}

/*
	Cache result list when a result is used to complete an operator for the first time
	resultsKey could be []
*/
function cacheResultToChange(resultsKey){
	for(var i=0; i<resultsKey.length; i++){
		var resultNode = mapCreator.getNodeByKey(resultsKey[i]);
		var operatorNode = mapCreator.getNodeByKey(resultNode.parent);

		if(resultNode.datatype=='literal' && operatorNode.subtype == 'lang')
			cachedResult[resultNode.key] = literalLang[resultNode.relatedTo];
		else
			cachedResult[resultNode.key] = savedResult[resultNode.relatedTo][resultNode.datatype];
	}
}

function inizializeMaps(){
	resultDatatype = {};
	savedResult = {};
	resultLiteralLang = {};
	literalLang = {};
	cachedResult = {};
	pendingQuery = [];
}