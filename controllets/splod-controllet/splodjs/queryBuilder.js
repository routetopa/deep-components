
var queryLogicStructure;
var queryLogicStructureRootList;
var visitStack;
var querySPARQL;

var executor;

var addNot;
var tempReverseWhere = {};

var notInSelect;

var QueryBuilder = function () {
	if(QueryBuilder.prototype._singletonInstance){
		return QueryBuilder.prototype._singletonInstance;
	}
	
	executor = new QueryExecutor();
	addNot = false;

	notInSelect = {};

	QueryBuilder.prototype._singletonInstance = this;
};

QueryBuilder.prototype.updateQuery = function(queryLogicRootList, queryLogicMap){
	queryLogicStructure = queryLogicMap;
	queryLogicStructureRootList = queryLogicRootList;
	notInSelect = {};
	visitStack = [];
	querySPARQL = {select:[], labelSelect:[], keySelect:[], where:[]}; //add other field
	buildQuery();
}

function buildQuery(){
	if(queryLogicStructureRootList.length != 0){
		createAllVariable(queryLogicStructure);

		var nodeSelect = [];
		var nodeLabelSelect = [];
		var nodeKeySelect = [];
		var nodeWhere = [];

		var childWhere = [];	
		var childQuery = {};

		for(var rootListIndex = 0; rootListIndex<queryLogicStructureRootList.length; rootListIndex++){
			var queryLogicStructureRoot = queryLogicStructureRootList[rootListIndex];

			childQuery = visitSPARQL(queryLogicStructureRoot); 

			nodeSelect = nodeSelect.concat(childQuery.select);
			nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
			nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

			childWhere.push(childQuery.where);
		}
			
		var sameLevelOperator = null;
		if(queryLogicStructureRootList.length==1){

			for(var j=0; j<childWhere[0].length; j++)
				nodeWhere = nodeWhere.concat([{relatedTo: childWhere[0][j].relatedTo, 
					content: childWhere[0][j].content}]);

		}else if(queryLogicStructureRootList.length>1){
			sameLevelOperator = queryLogicStructure[queryLogicStructureRootList[1]].subtype;
		}

		var child = [];
		for(var i = 1; i<queryLogicStructureRootList.length; i = i+2)
			child.push(queryLogicStructureRootList[i]);

		switch(sameLevelOperator){
			case 'and':

				for(var i = 0; i < childWhere.length; i = i+2){
					for(var j=0; j<childWhere[i].length; j++)
						nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
							content: childWhere[i][j].content}]);
				}
				break;
			/*case 'or':
				var block = [];
				for(var i=0; i<childWhere.length; i = i+2){
					block.push(childWhere[i]);
				}
				for(var z = 0; z < block.length; z++){

					var fixedBlock = block.splice(0,1)[0];
					nodeWhere = nodeWhere.concat([{relatedTo: [], content:['{']}]);

					for(var t=0; t<fixedBlock.length; t++)
						nodeWhere = nodeWhere.concat([{relatedTo: fixedBlock[t].relatedTo, 
							content:fixedBlock[t].content}]);

					block.splice(block.length,0,fixedBlock);

					for(var numberOfOptional = 0; numberOfOptional < block.length-1; numberOfOptional++){
						var optionalBlock = block.splice(0,1)[0];
						nodeWhere = nodeWhere.concat([{relatedTo: [], content:['OPTIONAL{']}]);

						for(var t=0; t<optionalBlock.length; t++)
							nodeWhere = nodeWhere.concat([{relatedTo: optionalBlock[t].relatedTo,
								content:optionalBlock[t].content}]);

						nodeWhere = nodeWhere.concat([{relatedTo: [], content:['}']}]);

						block.splice(block.length, 0, optionalBlock);
					}

					block.splice(block.length,0,(block.splice(0,1)[0]));

					nodeWhere = nodeWhere.concat([{relatedTo: [], content:['}']}]);
					if(z != block.length-1)
						nodeWhere = nodeWhere.concat([{relatedTo: [], content:['UNION']}]);
				}

				break;
			*/
			case 'or':
				for(var i = 0; i < childWhere.length; i = i+2){
					nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);

					for(var j=0; j<childWhere[i].length; j++)
						nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
							content:childWhere[i][j].content}]);

					if(i == childWhere.length-1)
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
					else
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

				}
				break;
		}

		querySPARQL = {select:nodeSelect, labelSelect:nodeLabelSelect, keySelect:nodeKeySelect, where:nodeWhere};

	}
	executor.executeUserQuery(querySPARQL);
}

function createAllVariable(queryLogicStructure){
	var variables = {};
	var tempVariable;
	for(key in queryLogicStructure){
		var node = queryLogicStructure[key];
		if('sameAs' in node) //sameAs variable 
			node.variable = queryLogicStructure[node.sameAs].variable;
		else{
			//tempVariable = "?"+createVariableFromLabel(node.label, node.index);

			//var tempLabel = node.label;
			var tentativeNumber = 0;
			do{
				tempLabel = createLongerLabel(node.url, tentativeNumber++);
				tempVariable = "?"+createVariableFromLabel(tempLabel, node.index);
			}while(tempVariable in variables)

			node.variable = tempVariable;
			variables[node.variable] = '';
		}
	}
}

function visitSPARQL(key){
	var node = queryLogicStructure[key];

	var nodeSelect = [];
	var nodeLabelSelect = [];
	var nodeKeySelect = [];
	var nodeWhere = [];

	var childWhere = [];	

	var nodeQuery = {};
	var childQuery = {};

	//'console.log'(node);

	switch(node.type){
		case 'everything' : 
			var firstReverseChild = null;
			for(var i=0; i<node.children.length; i++){ 
				var child = queryLogicStructure[node.children[i]];
				if(child.type == 'predicate' && child.direction == 'reverse'){
					firstReverseChild = child;
					break;
				}
			}

			if(!('sameAs' in node)){
				if(firstReverseChild == null){
					nodeSelect.push(node.variable);
					nodeLabelSelect.push(node.label);
					nodeKeySelect.push(node.key);
				}
				else{	
					node.variable = firstReverseChild.variable;

					nodeSelect.push(firstReverseChild.variable);
					nodeLabelSelect.push(firstReverseChild.label);
					nodeKeySelect.push(firstReverseChild.key);
				}
			}

			//set variable 
			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}

			if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
				nodeWhere = nodeWhere.concat([{relatedTo: [node.key], content:[node.variable+ ' a ?_.']}]);
			}

			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitSPARQL(node.children[i]); 

				nodeSelect = nodeSelect.concat(childQuery.select);
				nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
				nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){

				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([{relatedTo: childWhere[0][j].relatedTo, 
						content: childWhere[0][j].content}]);

			}else if(node.children.length>1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':

					for(var i = 0; i < childWhere.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo.concat(node.key), 
								content: childWhere[i][j].content}]);
					}
					break;
				/*case 'or':
					var block = [];
					for(var i=0; i<childWhere.length; i = i+2){
						block.push(childWhere[i]);
					}
					for(var z = 0; z < block.length; z++){

						var fixedBlock = block.splice(0,1)[0];
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);

						for(var t=0; t<fixedBlock.length; t++)
							nodeWhere = nodeWhere.concat([{relatedTo: fixedBlock[t].relatedTo.concat(child), 
								content:fixedBlock[t].content}]);

						block.splice(block.length,0,fixedBlock);

						for(var numberOfOptional = 0; numberOfOptional < block.length-1; numberOfOptional++){
							var optionalBlock = block.splice(0,1)[0];
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['OPTIONAL{']}]);

							for(var t=0; t<optionalBlock.length; t++)
								nodeWhere = nodeWhere.concat([{relatedTo: optionalBlock[t].relatedTo.concat(child),
									content:optionalBlock[t].content}]);

							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);

							block.splice(block.length, 0, optionalBlock);
						}

						block.splice(block.length,0,(block.splice(0,1)[0]));

						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
						if(z != block.length-1)
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['UNION']}]);
					}

					break;
				*/
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);
						nodeWhere = nodeWhere.concat([{relatedTo: [node.key], content:[node.variable+ ' a ?_.']}]);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
								content:childWhere[i][j].content}]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
						else
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

					}
					break;
			}

			break;
		case 'concept' :
			//set variable 
			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}else{
				//eventually change of variable and select management
				var parentNode = queryLogicStructure[node.parent];
				if(parentNode!=undefined){
					switch(parentNode.type){
						case 'everything': 
						case 'concept' : 
						case 'operator':
							node.variable = parentNode.variable;
							break;

						case 'predicate':
							if(parentNode.direction == 'direct'){
								node.variable = parentNode.variable;
							}else if(parentNode.direction == 'reverse'){
								nodeSelect.push(node.variable);
								nodeLabelSelect.push(node.label);
								nodeKeySelect.push(node.key);
							}
							break; 
					} 
				}else{
					nodeSelect.push(node.variable);
					nodeLabelSelect.push(node.label);
					nodeKeySelect.push(node.key);
				}
			}

			//where management

			if(!addNot){
				if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
					nodeWhere.push({relatedTo:[node.key], content:[node.variable+' a'+' <'+node.url+'>.']});
				}
			}else{
				//concepts' refinement
				nodeWhere.push({relatedTo:[node.key], content:['FILTER(!EXISTS{'+node.variable+' a'+' <'+node.url+'>})']});				
				
			}

			if(!addNot){
				for(var i=0; i<node.children.length; i++){ 
					childQuery = visitSPARQL(node.children[i]);

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

					childWhere.push(childQuery.where);
				}

				var sameLevelOperator = null;
				if(node.children.length==1){
					nodeWhere = nodeWhere.concat(childWhere[0]);
				}else if(node.children.length > 1){
					sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
				}

				var child = [];
				for(var i = 1; i<node.children.length; i = i+2)
					child.push(node.children[i]);

				switch(sameLevelOperator){
					case 'and':
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat(childWhere[i]);
						}
						break;
					case 'or':
						var parentNode = queryLogicStructure[node.parent];
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);
							nodeWhere.push({relatedTo:[node.key], content:[node.variable+' a'+' <'+node.url+'>.']});

							if(parentNode != undefined && parentNode.type == 'predicate' && parentNode.direction == 'reverse'){
								nodeWhere = nodeWhere.concat([{relatedTo: tempReverseWhere.relatedTo.concat(node.key), 
									content:tempReverseWhere.content}]);
							}
							

							for(var j=0; j<childWhere[i].length; j++)
								nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
									content:childWhere[i][j].content}]);

							if(i == node.children.length-1)
								nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
							else
								nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

						}
						break;
				}
			}

			if(addNot){
				addNot = false;
			}
			break;

		case 'predicate' :
			if(node.direction == 'direct'){

				//set variable 
				if('sameAs' in node){
					node.variable = queryLogicStructure[node.sameAs].variable;
					if(node.sameAs in notInSelect){
						nodeSelect.push(node.variable);
						nodeLabelSelect.push(node.label);
						nodeKeySelect.push(node.sameAs);
						delete notInSelect[node.sameAs];
					}
				}else{
					if(!addNot){
						nodeSelect.push(node.variable);
						nodeLabelSelect.push(node.label);
						nodeKeySelect.push(node.key);
					}else{
						notInSelect[node.key] = '';
					}
				}

				//where management
				var parentVariable = queryLogicStructure[node.parent].variable;

				if(addNot){
					nodeWhere = nodeWhere.concat([{relatedTo: [node.parent, node.key], content:['FILTER(!EXISTS{'+parentVariable+ ' <'+node.url+'> '+ node.variable+'.'+'})']}]);	
				}
				else{
					if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
						nodeWhere = nodeWhere.concat([{relatedTo: [node.key], content:[parentVariable+ ' <'+node.url+'> '+ node.variable+'.']}]);
					}
				}

				if(!addNot){
					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitSPARQL(node.children[i]); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
						nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

						childWhere.push(childQuery.where);
					}

					var sameLevelOperator = null;
					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}else if(node.children.length > 1){
						sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
					}

					var child = [];
					for(var i = 1; i<node.children.length; i = i+2)
						child.push(node.children[i]);

					switch(sameLevelOperator){
						case 'and':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat(childWhere[i]);
							}
							break;
						/*case 'or':
							var block = [];
							for(var i=0; i<childWhere.length; i = i+2){
								block.push(childWhere[i]);
							}
							
							for(var z = 0; z < block.length; z++){

								var fixedBlock = block.splice(0,1)[0];
								nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);

								for(var t=0; t<fixedBlock.length; t++)
									nodeWhere = nodeWhere.concat([{relatedTo: fixedBlock[t].relatedTo.concat(child), 
										content:fixedBlock[t].content}]);

								block.splice(block.length,0,fixedBlock);

								for(var numberOfOptional = 0; numberOfOptional < block.length-1; numberOfOptional++){
									var optionalBlock = block.splice(0,1)[0];
									nodeWhere = nodeWhere.concat([{relatedTo: child, content:['OPTIONAL{']}]);

									for(var t=0; t<optionalBlock.length; t++)
										nodeWhere = nodeWhere.concat([{relatedTo: optionalBlock[t].relatedTo.concat(child),
											content:optionalBlock[t].content}]);

									nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);

									block.splice(block.length, 0, optionalBlock);
								}

								block.splice(block.length,0,(block.splice(0,1)[0]));

								nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
								if(z != block.length-1)
									nodeWhere = nodeWhere.concat([{relatedTo: child, content:['UNION']}]);
							}

							break;
						*/
						case 'or':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);
								nodeWhere = nodeWhere.concat([{relatedTo: [node.key], content:[parentVariable+ ' <'+node.url+'> '+ node.variable+'.']}]);

								for(var j=0; j<childWhere[i].length; j++)
									nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
										content:childWhere[i][j].content}]);

								if(i == node.children.length-1)
									nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
								else
									nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

							}
							break;
					}
					
				}   

				if(addNot){
					addNot = false;
				}

			}else if(node.direction == 'reverse'){

				var parentVariable = queryLogicStructure[node.parent].variable;

				var childNode = queryLogicStructure[node.children[0]];
				node.variable = childNode.variable;

				if(addNot){
					if(childNode.type == 'something'){
						nodeWhere = nodeWhere.concat([{relatedTo: [node.parent, node.key, childNode.key], 
							content:['FILTER(!EXISTS{'+node.variable+ ' <'+node.url+'> '+ parentVariable+'.})']}]);
					}else if(childNode.type == 'concept'){
						nodeWhere = nodeWhere.concat([{relatedTo: [node.parent], 
							content:['FILTER(!EXISTS{']}]);

						nodeWhere = nodeWhere.concat([{relatedTo: [node.key, childNode.key], 
							content:[node.variable+ ' <'+node.url+'> '+ parentVariable+'.']}]);

						nodeWhere = nodeWhere.concat([{relatedTo: [childNode.key], 
							content:[node.variable+ ' a <'+ childNode.url+'>']}]);

						nodeWhere = nodeWhere.concat([{relatedTo: [node.parent], 
							content:['})']}]);
					}
				}else{
					nodeWhere = nodeWhere.concat([{relatedTo: [node.key, childNode.key], 
							content:[node.variable+ ' <'+node.url+'> '+ parentVariable+'.']}]);
					tempReverseWhere = {relatedTo: [node.key, childNode.key], 
							content:[node.variable+ ' <'+node.url+'> '+ parentVariable+'.']};

					childQuery = visitSPARQL(childNode.key); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

					nodeWhere = nodeWhere.concat(childQuery.where);

					addNot = false;
				}
			}
			
			break;
		case 'something' : 

			//set variable 
			nodeSelect.push(node.variable);
			nodeLabelSelect.push(node.label);
			nodeKeySelect.push(node.key);

			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitSPARQL(node.children[i]); 

				nodeSelect = nodeSelect.concat(childQuery.select);
				nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
				nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([{relatedTo: childWhere[0][j].relatedTo.concat(node.key), 
						content: childWhere[0][j].content}]);				
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo.concat(node.key), 
								content: childWhere[i][j].content}]);
					}
					break;
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);
						nodeWhere = nodeWhere.concat([{relatedTo: tempReverseWhere.relatedTo.concat(node.key), 
							content:tempReverseWhere.content}]);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
								content:childWhere[i][j].content}]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
						else
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

					}
					break;
			
			}

			break;
		case 'operator': 
			var parentVariable = null;
			if(node.parent!=null)
				parentVariable = queryLogicStructure[node.parent].variable;

			/*var notLabel = "";
			if(addNot){
				notLabel = "!";
				addNot=false;
			}*/

			var claus = [];
			var operatorLabel = node.label;
			var switchOperatorLabel = node.subtype;

			switch(switchOperatorLabel){
				case 'is url': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]);
					if(addNot){
						operatorLabel = '!=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', parentVariable + operatorLabel + '<'+queryLogicStructure[node.children[0]].label+'>' , ')']});
					
					queryLogicStructure[node.children[0]].variable = '<'+queryLogicStructure[node.children[0]].label+'>';

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case 'is string': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]);
					if(addNot){
						operatorLabel = '!=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');
					if(queryLogicStructure[node.children[0]].lang != null){
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', parentVariable + operatorLabel + '"'+tempLabel +'"@' + queryLogicStructure[node.children[0]].lang, ')']});
						queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"@'+ queryLogicStructure[node.children[0]].lang;
					}
					else{
						if(queryLogicStructure[node.children[0]].penninculo!=''){
							nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(',parentVariable +' '+ operatorLabel + '"'+tempLabel+ '"^^'+queryLogicStructure[node.children[0]].penninculo, ')']});
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"^^'+queryLogicStructure[node.children[0]].penninculo;
						}
						else{
							nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'str(' + parentVariable +')'+ operatorLabel + '"'+tempLabel+ '"', ')']});
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';
						}
					}

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'contains': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]);
					if(addNot){
						operatorLabel = '!contains';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}else{
						operatorLabel = 'contains';
					}
				
					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')']});
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'starts with':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '!strStarts';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = 'strStarts';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')']});
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'ends with': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '!strEnds';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = 'strEnds';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')']});
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'lang': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '!lang';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = 'lang';
					}
					
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', operatorLabel + '('+parentVariable+')="'+queryLogicStructure[node.children[0]].label+'"', ')']});
					queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case '<': 
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '>=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '<';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')']});
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '<=':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '>';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '<=';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')']});
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '<=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '>';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')']});
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>=':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '<';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '>=';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')']});
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '=':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '!=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')']});
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'is date':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '!=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}else{
						operatorLabel = '=';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}

					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'range':
					//se padre not riscriviamo query else
					if(addNot){
						nodeWhere.push({relatedTo:[node.children[0],node.children[1], node.key, node.parent], content:['FILTER(', '('+parentVariable+' < '+queryLogicStructure[node.children[0]].label+' || '+parentVariable+' > '+queryLogicStructure[node.children[1]].label+')',')']});
						addNot = false;
					}else{
						nodeWhere.push({relatedTo:[node.children[0],node.children[1], node.key], content:['FILTER(','(' + parentVariable+' >= '+queryLogicStructure[node.children[0]].label+' && '+parentVariable+' <= '+queryLogicStructure[node.children[1]].label+')' , ')']});
					}	
					
					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = queryLogicStructure[node.children[i]].label;
						childQuery = visitSPARQL(node.children[i]); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
						nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;
				case 'before':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '>=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}else{
						operatorLabel = '<';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(', parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					
					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'after':
					var tempRelatedTo= [];
					tempRelatedTo = tempRelatedTo.concat([node.children[0], node.key]); 
					if(addNot){
						operatorLabel = '<=';
						tempRelatedTo.push(node.parent);
						addNot=false;
					}else{
						operatorLabel = '>';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push({relatedTo:tempRelatedTo, content:['FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')']});
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					childQuery = visitSPARQL(node.children[0]); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
					nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				case 'range date':
					var rangeChildren=[];
					if(queryLogicStructure[node.children[0]].penninculo != '')
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					else
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"';

					if(queryLogicStructure[node.children[1]].penninculo != '')
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"^^'+queryLogicStructure[node.children[1]].penninculo;
					else
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"';

					if(addNot){
						nodeWhere.push({relatedTo:[node.children[0], node.children[1], node.key, node.parent], content:['FILTER(', '(' + parentVariable+' < '+rangeChildren[0]+') || ('+parentVariable+' > '+rangeChildren[1]+ ')', ')']});
						addNot = false;
					}else{
						nodeWhere.push({relatedTo:[node.children[0], node.children[1], node.key], content:['FILTER(', '(' + parentVariable+' >= '+rangeChildren[0]+') && ('+parentVariable+' <= '+rangeChildren[1]+ ')', ')']});
					}	

					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = rangeChildren[i];
						childQuery = visitSPARQL(node.children[i]); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
						nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;

				/*case 'or':
					break;
				*/
				case 'or':
					break;
				case 'and':
					break;

				case 'not':
					addNot = true;
					node.variable = parentVariable;

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitSPARQL(node.children[i]); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
						nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}

					break;

				case 'optional':
					node.variable = parentVariable; // ??? 

					nodeWhere.push({relatedTo:[node.key], content:['OPTIONAL{']});

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitSPARQL(node.children[i]); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
						nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						for(var j=0; j<childWhere[0].length; j++){
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[0][j].relatedTo.concat(node.key), content:childWhere[0][j].content}]);
						}
					}else{
						console.log('OPTIONAL - Are you sure that I can have more than one child or zero?');
					}

					nodeWhere.push({relatedTo:[node.key], content:['}']});
					
					break;

			}

			break;
		case 'result' : 
			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitSPARQL(node.children[i]);

				nodeSelect = nodeSelect.concat(childQuery.select);
				nodeLabelSelect = nodeLabelSelect.concat(childQuery.labelSelect);
				nodeKeySelect = nodeKeySelect.concat(childQuery.keySelect);

				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				nodeWhere = nodeWhere.concat(childWhere[0]);
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(childWhere[i]);
					}
					break;
				/*case 'or':
					var block = [];
					for(var i=0; i<childWhere.length; i = i+2){
						block.push(childWhere[i]);
					}
					
					for(var z = 0; z < block.length; z++){

						var fixedBlock = block.splice(0,1)[0];
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);

						for(var t=0; t<fixedBlock.length; t++)
							nodeWhere = nodeWhere.concat([{relatedTo: fixedBlock[t].relatedTo.concat(child), 
								content:fixedBlock[t].content}]);

						block.splice(block.length,0,fixedBlock);

						for(var numberOfOptional = 0; numberOfOptional < block.length-1; numberOfOptional++){
							var optionalBlock = block.splice(0,1)[0];
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['OPTIONAL{']}]);

							for(var t=0; t<optionalBlock.length; t++)
								nodeWhere = nodeWhere.concat([{relatedTo: optionalBlock[t].relatedTo.concat(child),
									content:optionalBlock[t].content}]);

							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);

							block.splice(block.length, 0, optionalBlock);
						}

						block.splice(block.length,0,(block.splice(0,1)[0]));

						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
						if(z != block.length-1)
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['UNION']}]);
					}

					break;
				*/
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat([{relatedTo: child, content:['{']}]);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([{relatedTo: childWhere[i][j].relatedTo, 
								content:childWhere[i][j].content}]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['}']}]);
						else
							nodeWhere = nodeWhere.concat([{relatedTo: child, content:['} UNION']}]);

					}
					break;
			}
			
			break;
	}

	nodeQuery.select = nodeSelect;
	nodeQuery.labelSelect = nodeLabelSelect;
	nodeQuery.keySelect = nodeKeySelect;
	nodeQuery.where = nodeWhere;

	//console.log(nodeQuery.where);

	return nodeQuery;

}

function createVariableFromLabel(label, index){
	//return label.replace( /[\s \- \' \\ \/ \^ \$ \* \+ \? \. \( \) \| \{ \} \[ \] \! \@ \# \% \^ \& \= \; \: \" \, \< \>]/g, "") + "_" + index;
	return label.replace( /\W/g, "") + "_" + index;

}

QueryBuilder.prototype.getConcepts = function(queryLogicRootList, queryLogicMap, callback){
	visitStack = [];
	buildConceptsQuery(queryLogicRootList, queryLogicMap, callback);
}

function buildConceptsQuery(queryLogicStructureRootList, queryLogicStructure, callback){

	var	queryGetConcepts = {select:[], where:[]}; //add other field


	if(queryLogicStructureRootList.length != 0){
		createAllVariable(queryLogicStructure);

		var nodeSelect = [];
		var nodeWhere = [];

		var childWhere = [];	
		var childQuery = {};

		for(var rootListIndex = 0; rootListIndex<queryLogicStructureRootList.length; rootListIndex++){
			var queryLogicStructureRoot = queryLogicStructureRootList[rootListIndex];

			childQuery = visitGetConcepts(queryLogicStructureRoot, queryLogicStructure); 

			nodeSelect = nodeSelect.concat(childQuery.select);
			childWhere.push(childQuery.where);
		}
			
		var sameLevelOperator = null;
		if(queryLogicStructureRootList.length==1){

			for(var j=0; j<childWhere[0].length; j++)
				nodeWhere = nodeWhere.concat([childWhere[0][j]]);

		}else if(queryLogicStructureRootList.length>1){
			sameLevelOperator = queryLogicStructure[queryLogicStructureRootList[1]].subtype;

			/*
			var child = [];
			for(var i = 1; i<queryLogicStructureRootList.length; i = i+2)
				child.push(queryLogicStructureRootList[i]);
			*/

			switch(sameLevelOperator){
				case 'and':

					for(var i = 0; i < childWhere.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < childWhere.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == childWhere.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}
		}

		queryGetConcepts = {select:nodeSelect, where:nodeWhere};

	}
	executor.executeGetConcepts(queryGetConcepts, callback);
}

function visitGetConcepts(key, queryLogicStructure){
	var node = queryLogicStructure[key];

	var nodeSelect = [];
	var nodeWhere = [];

	var childWhere = [];	

	var nodeQuery = {};
	var childQuery = {};

	//'console.log'(node);

	switch(node.type){
		case 'everything' : 
			var firstReverseChild = null;
			for(var i=0; i<node.children.length; i++){ 
				var child = queryLogicStructure[node.children[i]];
				if(child.type == 'predicate' && child.direction == 'reverse'){
					firstReverseChild = child;
					break;
				}
			}

			if(!('sameAs' in node)){
				if(firstReverseChild != null){
					node.variable = firstReverseChild.variable;
				}
			}

			//set variable 
			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}

			if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
				nodeWhere = nodeWhere.concat([node.variable+ ' a ?_.']);
			}

			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

				nodeSelect = nodeSelect.concat(childQuery.select);
				
				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){

				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([childWhere[0][j]]);

			}else if(node.children.length>1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':

					for(var i = 0; i < childWhere.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);
						nodeWhere = nodeWhere.concat([node.variable+ ' a ?_.']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}

			break;
		case 'concept' :
			//set variable 
			var fictionalVariable = '?url'

			if('fictional' in node){
				nodeSelect.push(fictionalVariable);
				nodeSelect.push('?label');
			}

			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}else{
				//eventually change of variable and select management
				var parentNode = queryLogicStructure[node.parent];
				if(parentNode!=undefined){
					switch(parentNode.type){
						case 'everything': 
						case 'concept' : 
						case 'operator':
							node.variable = parentNode.variable;
							break;

						case 'predicate':
							if(parentNode.direction == 'direct'){
								node.variable = parentNode.variable;
							}
							break; 
					} 
				} 
			}

			//where management

			if(!addNot){
				if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
					if('fictional' in node){
						if(node.keyword.length>0)
							askForSpecificKeyword = "FILTER(CONTAINS(lcase(?label), '"+node.keyword+"'))";
						else 
							askForSpecificKeyword = "";
						nodeWhere.push(node.variable+' a '+ fictionalVariable+'.');
						nodeWhere.push("OPTIONAL {"+fictionalVariable+" rdfs:label ?label. " + askForSpecificKeyword + " FILTER (lang(?label) = '" + systemLang + "')}");
					}
					else
						nodeWhere.push(node.variable+' a'+' <'+node.url+'>.');
				}
			}else{
				//concepts' refinement
				nodeWhere.push('FILTER(!EXISTS{'+node.variable+' a'+' <'+node.url+'>})');				
				
			}

			if(!addNot){
				for(var i=0; i<node.children.length; i++){ 
					childQuery = visitGetConcepts(node.children[i], queryLogicStructure);

					nodeSelect = nodeSelect.concat(childQuery.select);

					childWhere.push(childQuery.where);
				}

				var sameLevelOperator = null;
				if(node.children.length==1){
					nodeWhere = nodeWhere.concat(childWhere[0]);
				}else if(node.children.length > 1){
					sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
				}

				var child = [];
				for(var i = 1; i<node.children.length; i = i+2)
					child.push(node.children[i]);

				switch(sameLevelOperator){
					case 'and':
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat(childWhere[i]);
						}
						break;
					case 'or':
						var parentNode = queryLogicStructure[node.parent];
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat(['{']);
							nodeWhere.push(node.variable+' a'+' <'+node.url+'>.');

							if(parentNode != undefined && parentNode.type == 'predicate' && parentNode.direction == 'reverse'){
								nodeWhere = nodeWhere.concat([tempReverseWhere]);
							}
							

							for(var j=0; j<childWhere[i].length; j++)
								nodeWhere = nodeWhere.concat([childWhere[i][j]]);

							if(i == node.children.length-1)
								nodeWhere = nodeWhere.concat(['}']);
							else
								nodeWhere = nodeWhere.concat(['} UNION']);

						}
						break;
				}
			}

			if(addNot){
				addNot = false;
			}
			break;

		case 'predicate' :
			if(node.direction == 'direct'){

				//set variable 
				if('sameAs' in node){
					node.variable = queryLogicStructure[node.sameAs].variable;
				}

				//where management
				var parentVariable = queryLogicStructure[node.parent].variable;

				if(addNot){
					nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{'+parentVariable+ ' <'+node.url+'> '+ node.variable+'.'+'})']);	
				}
				else{
					if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
						nodeWhere = nodeWhere.concat([parentVariable+ ' <'+node.url+'> '+ node.variable+'.']);
					}
				}

				if(!addNot){
					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
					
						childWhere.push(childQuery.where);
					}

					var sameLevelOperator = null;
					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}else if(node.children.length > 1){
						sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
					}

					var child = [];
					for(var i = 1; i<node.children.length; i = i+2)
						child.push(node.children[i]);

					switch(sameLevelOperator){
						case 'and':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat(childWhere[i]);
							}
							break;
						
						case 'or':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat(['{']);
								nodeWhere = nodeWhere.concat([parentVariable+ ' <'+node.url+'> '+ node.variable+'.']);

								for(var j=0; j<childWhere[i].length; j++)
									nodeWhere = nodeWhere.concat([childWhere[i][j]]);

								if(i == node.children.length-1)
									nodeWhere = nodeWhere.concat(['}']);
								else
									nodeWhere = nodeWhere.concat(['} UNION']);

							}
							break;
					}
					
				}   

				if(addNot){
					addNot = false;
				}

			}else if(node.direction == 'reverse'){

				var parentVariable = queryLogicStructure[node.parent].variable;

				var childNode = queryLogicStructure[node.children[0]];
				node.variable = childNode.variable;

				if(addNot){
					if(childNode.type == 'something'){
						nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{'+node.variable+ ' <'+node.url+'> '+ parentVariable+'.})']);
					}else if(childNode.type == 'concept'){
						nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{']);

						nodeWhere = nodeWhere.concat([node.variable+ ' <'+node.url+'> '+ parentVariable+'.']);

						nodeWhere = nodeWhere.concat([node.variable+ ' a <'+ childNode.url+'>']);

						nodeWhere = nodeWhere.concat(['})']);
					}
				}else{
					nodeWhere = nodeWhere.concat([node.variable+ ' <'+node.url+'> '+ parentVariable+'.']);
					tempReverseWhere = node.variable+ ' <'+node.url+'> '+ parentVariable+'.';

					childQuery = visitGetConcepts(childNode.key, queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);

					nodeWhere = nodeWhere.concat(childQuery.where);

					addNot = false;
				}
			}
			
			break;
		case 'something' : 

			//set variable 
			nodeSelect.push(node.variable);

			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

				nodeSelect = nodeSelect.concat(childQuery.select);

				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([childWhere[0][j]]);				
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);
						nodeWhere = nodeWhere.concat([tempReverseWhere]);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			
			}

			break;
		case 'operator': 
			var parentVariable = null;
			if(node.parent!=null)
				parentVariable = queryLogicStructure[node.parent].variable;

			/*var notLabel = "";
			if(addNot){
				notLabel = "!";
				addNot=false;
			}*/

			var claus = [];
			var operatorLabel = node.label;
			var switchOperatorLabel = node.subtype;

			switch(switchOperatorLabel){
				case 'is url': 
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push('FILTER(', parentVariable + operatorLabel + '<'+queryLogicStructure[node.children[0]].label+'>' , ')');
					
					queryLogicStructure[node.children[0]].variable = '<'+queryLogicStructure[node.children[0]].label+'>';

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);

					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case 'is string': 
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');
					if(queryLogicStructure[node.children[0]].lang != null){
						nodeWhere.push('FILTER(', parentVariable + operatorLabel + '"'+tempLabel +'"@' + queryLogicStructure[node.children[0]].lang, ')');
						queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"@'+ queryLogicStructure[node.children[0]].lang;
					}
					else{
						if(queryLogicStructure[node.children[0]].penninculo!=''){
							nodeWhere.push('FILTER(',parentVariable +' '+ operatorLabel + '"'+tempLabel+ '"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"^^'+queryLogicStructure[node.children[0]].penninculo;
						}
						else{
							nodeWhere.push('FILTER(', 'str(' + parentVariable +')'+ operatorLabel + '"'+tempLabel+ '"', ')');
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';
						}
					}

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'contains': 
					if(addNot){
						operatorLabel = '!contains';
						addNot=false;
					}else{
						operatorLabel = 'contains';
					}
				
					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
			
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'starts with':
					if(addNot){
						operatorLabel = '!strStarts';
						addNot=false;
					}
					else{
						operatorLabel = 'strStarts';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'ends with': 
					
					if(addNot){
						operatorLabel = '!strEnds';
						addNot=false;
					}
					else{
						operatorLabel = 'strEnds';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'lang': 
					if(addNot){
						operatorLabel = '!lang';
						addNot=false;
					}
					else{
						operatorLabel = 'lang';
					}
					
					nodeWhere.push('FILTER(', operatorLabel + '('+parentVariable+')="'+queryLogicStructure[node.children[0]].label+'"', ')');
					queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
				
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case '<': 
					if(addNot){
						operatorLabel = '>=';
						addNot=false;
					}
					else{
						operatorLabel = '<';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '<=':
					if(addNot){
						operatorLabel = '>';
						addNot=false;
					}
					else{
						operatorLabel = '<=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>':
					if(addNot){
						operatorLabel = '<=';
						addNot=false;
					}
					else{
						operatorLabel = '>';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>=':
					if(addNot){
						operatorLabel = '<';
						addNot=false;
					}
					else{
						operatorLabel = '>=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '=':
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'is date':
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}else{
						operatorLabel = '=';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}

					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'range':
					if(addNot){
						nodeWhere.push('FILTER(', '('+parentVariable+' < '+queryLogicStructure[node.children[0]].label+' || '+parentVariable+' > '+queryLogicStructure[node.children[1]].label+')',')');
						addNot = false;
					}else{
						nodeWhere.push('FILTER(','(' + parentVariable+' >= '+queryLogicStructure[node.children[0]].label+' && '+parentVariable+' <= '+queryLogicStructure[node.children[1]].label+')' , ')');
					}	
					
					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = queryLogicStructure[node.children[i]].label;
						childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;
				case 'before':
					if(addNot){
						operatorLabel = '>=';
						addNot=false;
					}else{
						operatorLabel = '<';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(', parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					
					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'after':
					if(addNot){
						operatorLabel = '<=';
						addNot=false;
					}else{
						operatorLabel = '>';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					childQuery = visitGetConcepts(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				case 'range date':
					var rangeChildren=[];
					if(queryLogicStructure[node.children[0]].penninculo != '')
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					else
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"';

					if(queryLogicStructure[node.children[1]].penninculo != '')
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"^^'+queryLogicStructure[node.children[1]].penninculo;
					else
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"';

					if(addNot){
						nodeWhere.push('FILTER(', '(' + parentVariable+' < '+rangeChildren[0]+') || ('+parentVariable+' > '+rangeChildren[1]+ ')', ')');
						addNot = false;
					}else{
						nodeWhere.push('FILTER(', '(' + parentVariable+' >= '+rangeChildren[0]+') && ('+parentVariable+' <= '+rangeChildren[1]+ ')', ')');
					}	

					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = rangeChildren[i];
						childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;

				case 'or':
					break;
				case 'and':
					break;

				case 'not':
					addNot = true;
					node.variable = parentVariable;

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}

					break;

				case 'optional':
					node.variable = parentVariable; // ??? 

					nodeWhere.push('OPTIONAL{');

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetConcepts(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						for(var j=0; j<childWhere[0].length; j++){
							nodeWhere = nodeWhere.concat([childWhere[0][j]]);
						}
					}else{
						console.log('OPTIONAL - Are you sure that I can have more than one child or zero?');
					}

					nodeWhere.push('}');
					
					break;

			}

			break;
		case 'result' : 
			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetConcepts(node.children[i], queryLogicStructure);

				nodeSelect = nodeSelect.concat(childQuery.select);
				
				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				nodeWhere = nodeWhere.concat(childWhere[0]);
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(childWhere[i]);
					}
					break;
				
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}
			
			break;
	}

	nodeQuery.select = nodeSelect;
	nodeQuery.where = nodeWhere;

	return nodeQuery;

}

QueryBuilder.prototype.getDirectPredicates = function(queryLogicRootList, queryLogicMap, callback){
	visitStack = [];
	buildPredicatesQuery(queryLogicRootList, queryLogicMap, callback);
}

QueryBuilder.prototype.getReversePredicates = function(queryLogicRootList, queryLogicMap, callback){
	visitStack = [];
	buildPredicatesQuery(queryLogicRootList, queryLogicMap, callback);
}

function buildPredicatesQuery(queryLogicStructureRootList, queryLogicStructure, callback){
	var	queryGetPredicates = {select:[], where:[]}; //add other field

	if(queryLogicStructureRootList.length != 0){
		createAllVariable(queryLogicStructure);

		var nodeSelect = [];
		var nodeWhere = [];

		var childWhere = [];	
		var childQuery = {};

		for(var rootListIndex = 0; rootListIndex<queryLogicStructureRootList.length; rootListIndex++){
			var queryLogicStructureRoot = queryLogicStructureRootList[rootListIndex];

			childQuery = visitGetPredicates(queryLogicStructureRoot, queryLogicStructure); 

			nodeSelect = nodeSelect.concat(childQuery.select);
			childWhere.push(childQuery.where);
		}
			
		var sameLevelOperator = null;
		if(queryLogicStructureRootList.length==1){

			for(var j=0; j<childWhere[0].length; j++)
				nodeWhere = nodeWhere.concat([childWhere[0][j]]);

		}else if(queryLogicStructureRootList.length>1){
			sameLevelOperator = queryLogicStructure[queryLogicStructureRootList[1]].subtype;

			/*
			var child = [];
			for(var i = 1; i<queryLogicStructureRootList.length; i = i+2)
				child.push(queryLogicStructureRootList[i]);
			*/
			switch(sameLevelOperator){
				case 'and':

					for(var i = 0; i < childWhere.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < childWhere.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == childWhere.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}
		}
		
		queryGetPredicates = {select:nodeSelect, where:nodeWhere};
	}

	executor.executeGetPredicates(queryGetPredicates, callback);
}

function visitGetPredicates(key, queryLogicStructure){
	var node = queryLogicStructure[key];

	var nodeSelect = [];
	var nodeWhere = [];

	var childWhere = [];	

	var nodeQuery = {};
	var childQuery = {};

	//'console.log'(node);

	switch(node.type){
		case 'everything' : 
			var firstReverseChild = null;
			for(var i=0; i<node.children.length; i++){ 
				var child = queryLogicStructure[node.children[i]];
				if(child.type == 'predicate' && child.direction == 'reverse'){
					firstReverseChild = child;
					break;
				}
			}

			if(!('sameAs' in node)){
				if(firstReverseChild != null){
					node.variable = firstReverseChild.variable;
				}
			}

			//set variable 
			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}

			if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
				nodeWhere = nodeWhere.concat([node.variable+ ' a ?_.']);
			}

			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

				nodeSelect = nodeSelect.concat(childQuery.select);
				
				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){

				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([childWhere[0][j]]);

			}else if(node.children.length>1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':

					for(var i = 0; i < childWhere.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);
						nodeWhere = nodeWhere.concat([node.variable+ ' a ?_.']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}

			break;
		case 'concept' :
			//set variable 

			if('sameAs' in node){
				node.variable = queryLogicStructure[node.sameAs].variable;
			}else{
				//eventually change of variable and select management
				var parentNode = queryLogicStructure[node.parent];
				if(parentNode!=undefined){
					switch(parentNode.type){
						case 'everything': 
						case 'concept' : 
						case 'operator':
							node.variable = parentNode.variable;
							break;

						case 'predicate':
							if(parentNode.direction == 'direct'){
								node.variable = parentNode.variable;
							}
							break; 
					} 
				} 
			}

			//where management

			if(!addNot){
				if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
					nodeWhere.push(node.variable+' a'+' <'+node.url+'>.');
				}
			}else{
				//concepts' refinement
				nodeWhere.push('FILTER(!EXISTS{'+node.variable+' a'+' <'+node.url+'>})');				
				
			}

			if(!addNot){
				for(var i=0; i<node.children.length; i++){ 
					childQuery = visitGetPredicates(node.children[i], queryLogicStructure);

					nodeSelect = nodeSelect.concat(childQuery.select);

					childWhere.push(childQuery.where);
				}

				var sameLevelOperator = null;
				if(node.children.length==1){
					nodeWhere = nodeWhere.concat(childWhere[0]);
				}else if(node.children.length > 1){
					sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
				}

				var child = [];
				for(var i = 1; i<node.children.length; i = i+2)
					child.push(node.children[i]);

				switch(sameLevelOperator){
					case 'and':
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat(childWhere[i]);
						}
						break;
					case 'or':
						var parentNode = queryLogicStructure[node.parent];
						for(var i = 0; i < node.children.length; i = i+2){
							nodeWhere = nodeWhere.concat(['{']);
							nodeWhere.push(node.variable+' a'+' <'+node.url+'>.');

							if(parentNode != undefined && parentNode.type == 'predicate' && parentNode.direction == 'reverse'){
								nodeWhere = nodeWhere.concat([tempReverseWhere]);
							}
							

							for(var j=0; j<childWhere[i].length; j++)
								nodeWhere = nodeWhere.concat([childWhere[i][j]]);

							if(i == node.children.length-1)
								nodeWhere = nodeWhere.concat(['}']);
							else
								nodeWhere = nodeWhere.concat(['} UNION']);

						}
						break;
				}
			}

			if(addNot){
				addNot = false;
			}
			break;

		case 'predicate' :
			var fictionalVariable = '?url'

			if('fictional' in node){
				nodeSelect.push(fictionalVariable);
				nodeSelect.push('?label');
			}

			if(node.direction == 'direct'){

				//set variable 
				if('sameAs' in node){
					node.variable = queryLogicStructure[node.sameAs].variable;
				}

				//where management
				var parentNode = queryLogicStructure[node.parent];
				var parentVariable = parentNode.variable;

				if(addNot){
					nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{'+parentVariable+ ' <'+node.url+'> '+ node.variable+'.'+'})']);	
				}
				else{
					if('fictional' in node){
						if(node.keyword.length>0)
							askForSpecificKeyword = "FILTER(CONTAINS(lcase(?label), '"+node.keyword+"'))";
						else 
							askForSpecificKeyword = "";
						nodeWhere.push(parentVariable+" "+fictionalVariable+" ?o.");						
						nodeWhere.push("OPTIONAL {"+fictionalVariable+" rdfs:label ?label. "+askForSpecificKeyword+ "FILTER (lang(?label) = '" + systemLang + "')}");
					}
					else if(!(node.children.length>1 && queryLogicStructure[node.children[1]].type=='operator' && queryLogicStructure[node.children[1]].subtype=='or')){
						nodeWhere = nodeWhere.concat([parentVariable+ ' <'+node.url+'> '+ node.variable+'.']);
					}
				}

				if(!addNot){
					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
					
						childWhere.push(childQuery.where);
					}

					var sameLevelOperator = null;
					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}else if(node.children.length > 1){
						sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
					}

					var child = [];
					for(var i = 1; i<node.children.length; i = i+2)
						child.push(node.children[i]);

					switch(sameLevelOperator){
						case 'and':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat(childWhere[i]);
							}
							break;
						
						case 'or':
							for(var i = 0; i < node.children.length; i = i+2){
								nodeWhere = nodeWhere.concat(['{']);
								nodeWhere = nodeWhere.concat([parentVariable+ ' <'+node.url+'> '+ node.variable+'.']);

								for(var j=0; j<childWhere[i].length; j++)
									nodeWhere = nodeWhere.concat([childWhere[i][j]]);

								if(i == node.children.length-1)
									nodeWhere = nodeWhere.concat(['}']);
								else
									nodeWhere = nodeWhere.concat(['} UNION']);

							}
							break;
					}
					
				}   

				if(addNot){
					addNot = false;
				}

			}else if(node.direction == 'reverse'){

				var parentNode = queryLogicStructure[node.parent];
				var parentVariable = parentNode.variable;

				var childNode;
				if(!('fictional' in node)){
					childNode = queryLogicStructure[node.children[0]];
					node.variable = childNode.variable;
				}

				if(addNot){
					if(childNode.type == 'something'){
						nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{'+node.variable+ ' <'+node.url+'> '+ parentVariable+'.})']);
					}else if(childNode.type == 'concept'){
						nodeWhere = nodeWhere.concat(['FILTER(!EXISTS{']);
						nodeWhere = nodeWhere.concat([node.variable+ ' <'+node.url+'> '+ parentVariable+'.']);
						nodeWhere = nodeWhere.concat([node.variable+ ' a <'+ childNode.url+'>']);
						nodeWhere = nodeWhere.concat(['})']);
					}
				}else{
					if('fictional' in node){
						if(node.keyword.length>0)
							askForSpecificKeyword = "FILTER(CONTAINS(lcase(?label), '"+node.keyword+"'))";
						else 
							askForSpecificKeyword = "";

						nodeWhere.push('?o '+fictionalVariable+' '+ parentVariable+'.');
						nodeWhere.push("OPTIONAL {"+fictionalVariable+" rdfs:label ?label. "+askForSpecificKeyword+"FILTER (lang(?label) = '" + systemLang + "')}");
					}else{
						nodeWhere = nodeWhere.concat([node.variable+ ' <'+node.url+'> '+ parentVariable+'.']);
					
						tempReverseWhere = node.variable+ ' <'+node.url+'> '+ parentVariable+'.';
						childQuery = visitGetPredicates(childNode.key, queryLogicStructure); 
						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}
					addNot = false;
				}
			}
			
			break;
		case 'something' : 

			//set variable 
			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

				nodeSelect = nodeSelect.concat(childQuery.select);

				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				for(var j=0; j<childWhere[0].length; j++)
					nodeWhere = nodeWhere.concat([childWhere[0][j]]);				
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);
					}
					break;
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);
						nodeWhere = nodeWhere.concat([tempReverseWhere]);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			
			}

			break;
		case 'operator': 
			var parentVariable = null;
			if(node.parent!=null)
				parentVariable = queryLogicStructure[node.parent].variable;

			/*var notLabel = "";
			if(addNot){
				notLabel = "!";
				addNot=false;
			}*/

			var claus = [];
			var operatorLabel = node.label;
			var switchOperatorLabel = node.subtype;

			switch(switchOperatorLabel){
				case 'is url': 
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push('FILTER(', parentVariable + operatorLabel + '<'+queryLogicStructure[node.children[0]].label+'>' , ')');
					
					queryLogicStructure[node.children[0]].variable = '<'+queryLogicStructure[node.children[0]].label+'>';

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);

					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case 'is string': 
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');
					if(queryLogicStructure[node.children[0]].lang != null){
						nodeWhere.push('FILTER(', parentVariable + operatorLabel + '"'+tempLabel +'"@' + queryLogicStructure[node.children[0]].lang, ')');
						queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"@'+ queryLogicStructure[node.children[0]].lang;
					}
					else{
						if(queryLogicStructure[node.children[0]].penninculo!=''){
							nodeWhere.push('FILTER(',parentVariable +' '+ operatorLabel + '"'+tempLabel+ '"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"^^'+queryLogicStructure[node.children[0]].penninculo;
						}
						else{
							nodeWhere.push('FILTER(', 'str(' + parentVariable +')'+ operatorLabel + '"'+tempLabel+ '"', ')');
							queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';
						}
					}

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'contains': 
					if(addNot){
						operatorLabel = '!contains';
						addNot=false;
					}else{
						operatorLabel = 'contains';
					}
				
					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
			
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'starts with':
					if(addNot){
						operatorLabel = '!strStarts';
						addNot=false;
					}
					else{
						operatorLabel = 'strStarts';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'ends with': 
					
					if(addNot){
						operatorLabel = '!strEnds';
						addNot=false;
					}
					else{
						operatorLabel = 'strEnds';
					}

					var tempLabel = queryLogicStructure[node.children[0]].label.replace(/\"/g, '\\\"');

					nodeWhere.push('FILTER(', operatorLabel + '(xsd:string('+parentVariable+'),"'+tempLabel+'")', ')');
					queryLogicStructure[node.children[0]].variable = '"'+tempLabel+'"';

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'lang': 
					if(addNot){
						operatorLabel = '!lang';
						addNot=false;
					}
					else{
						operatorLabel = 'lang';
					}
					
					nodeWhere.push('FILTER(', operatorLabel + '('+parentVariable+')="'+queryLogicStructure[node.children[0]].label+'"', ')');
					queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
				
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				
				case '<': 
					if(addNot){
						operatorLabel = '>=';
						addNot=false;
					}
					else{
						operatorLabel = '<';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '<=':
					if(addNot){
						operatorLabel = '>';
						addNot=false;
					}
					else{
						operatorLabel = '<=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>':
					if(addNot){
						operatorLabel = '<=';
						addNot=false;
					}
					else{
						operatorLabel = '>';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '>=':
					if(addNot){
						operatorLabel = '<';
						addNot=false;
					}
					else{
						operatorLabel = '>=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case '=':
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}
					else{
						operatorLabel = '=';
					}
					nodeWhere.push('FILTER(', 'xsd:double('+parentVariable+') '+operatorLabel+' '+queryLogicStructure[node.children[0]].label, ')');
					queryLogicStructure[node.children[0]].variable = queryLogicStructure[node.children[0]].label;

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'is date':
					if(addNot){
						operatorLabel = '!=';
						addNot=false;
					}else{
						operatorLabel = '=';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}

					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'range':
					if(addNot){
						nodeWhere.push('FILTER(', '('+parentVariable+' < '+queryLogicStructure[node.children[0]].label+' || '+parentVariable+' > '+queryLogicStructure[node.children[1]].label+')',')');
						addNot = false;
					}else{
						nodeWhere.push('FILTER(','(' + parentVariable+' >= '+queryLogicStructure[node.children[0]].label+' && '+parentVariable+' <= '+queryLogicStructure[node.children[1]].label+')' , ')');
					}	
					
					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = queryLogicStructure[node.children[i]].label;
						childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;
				case 'before':
					if(addNot){
						operatorLabel = '>=';
						addNot=false;
					}else{
						operatorLabel = '<';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(', parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					
					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;

				case 'after':
					if(addNot){
						operatorLabel = '<=';
						addNot=false;
					}else{
						operatorLabel = '>';
					}

					if(queryLogicStructure[node.children[0]].penninculo!=''){
						nodeWhere.push('FILTER(',parentVariable+ ' '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo, ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					}else{
						nodeWhere.push('FILTER(','str(' + parentVariable+ ') '+operatorLabel +' "'+queryLogicStructure[node.children[0]].label+'"', ')');
						queryLogicStructure[node.children[0]].variable = '"'+queryLogicStructure[node.children[0]].label+'"';
					}
					childQuery = visitGetPredicates(node.children[0], queryLogicStructure); 

					nodeSelect = nodeSelect.concat(childQuery.select);
					nodeWhere = nodeWhere.concat(childQuery.where);

					break;
				case 'range date':
					var rangeChildren=[];
					if(queryLogicStructure[node.children[0]].penninculo != '')
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"^^'+queryLogicStructure[node.children[0]].penninculo;
					else
						rangeChildren[0] = '"'+queryLogicStructure[node.children[0]].label+'"';

					if(queryLogicStructure[node.children[1]].penninculo != '')
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"^^'+queryLogicStructure[node.children[1]].penninculo;
					else
						rangeChildren[1] = '"'+queryLogicStructure[node.children[1]].label+'"';

					if(addNot){
						nodeWhere.push('FILTER(', '(' + parentVariable+' < '+rangeChildren[0]+') || ('+parentVariable+' > '+rangeChildren[1]+ ')', ')');
						addNot = false;
					}else{
						nodeWhere.push('FILTER(', '(' + parentVariable+' >= '+rangeChildren[0]+') && ('+parentVariable+' <= '+rangeChildren[1]+ ')', ')');
					}	

					for(var i=0; i<node.children.length; i++){
						queryLogicStructure[node.children[i]].variable = rangeChildren[i];
						childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);
						nodeWhere = nodeWhere.concat(childQuery.where);
					}

					break;

				case 'or':
					break;
				case 'and':
					break;

				case 'not':
					addNot = true;
					node.variable = parentVariable;

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						nodeWhere = nodeWhere.concat(childWhere[0]);
					}

					break;

				case 'optional':
					node.variable = parentVariable; // ??? 

					nodeWhere.push('OPTIONAL{');

					for(var i=0; i<node.children.length; i++){ 
						childQuery = visitGetPredicates(node.children[i], queryLogicStructure); 

						nodeSelect = nodeSelect.concat(childQuery.select);

						childWhere.push(childQuery.where);
					}

					if(node.children.length==1){
						for(var j=0; j<childWhere[0].length; j++){
							nodeWhere = nodeWhere.concat([childWhere[0][j]]);
						}
					}else{
						console.log('OPTIONAL - Are you sure that I can have more than one child or zero?');
					}

					nodeWhere.push('}');
					
					break;

			}

			break;
		case 'result' : 
			for(var i=0; i<node.children.length; i++){ 
				childQuery = visitGetPredicates(node.children[i], queryLogicStructure);

				nodeSelect = nodeSelect.concat(childQuery.select);
				
				childWhere.push(childQuery.where);
			}

			var sameLevelOperator = null;
			if(node.children.length==1){
				nodeWhere = nodeWhere.concat(childWhere[0]);
			}else if(node.children.length > 1){
				sameLevelOperator = queryLogicStructure[node.children[1]].subtype;
			}

			var child = [];
			for(var i = 1; i<node.children.length; i = i+2)
				child.push(node.children[i]);

			switch(sameLevelOperator){
				case 'and':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(childWhere[i]);
					}
					break;
				
				case 'or':
					for(var i = 0; i < node.children.length; i = i+2){
						nodeWhere = nodeWhere.concat(['{']);

						for(var j=0; j<childWhere[i].length; j++)
							nodeWhere = nodeWhere.concat([childWhere[i][j]]);

						if(i == node.children.length-1)
							nodeWhere = nodeWhere.concat(['}']);
						else
							nodeWhere = nodeWhere.concat(['} UNION']);

					}
					break;
			}
			
			break;
	}

	nodeQuery.select = nodeSelect;
	nodeQuery.where = nodeWhere;

	return nodeQuery;

}
function createVariableFromLabel(label, index){
	//return label.replace( /[\s \- \' \\ \/ \^ \$ \* \+ \? \. \( \) \| \{ \} \[ \] \! \@ \# \% \^ \& \= \; \: \" \, \< \>]/g, "") + "_" + index;
	return label.replace( /\W/g, "") + "_" + index;

}

QueryBuilder.prototype.getMapElementsLabel = function(queryLogicMap, callback){
	if(Object.keys(queryLogicMap).length == 0){
		callback(queryLogicMap);
		return;
	}

	var associatedVariable = {};
	var counter = 1;
	var tempQuery = {select:[], where: []};

	var mapElement;
	for(field in queryLogicMap){
		mapElement=queryLogicMap[field];
		if(mapElement.type=='concept' || mapElement.type=='predicate'){
			tempQuery.select.push('?'+counter);
			tempQuery.where.push('OPTIONAL{<'+queryLogicMap[field].url+'> rdfs:label ?'+counter+'.FILTER (lang(?'+counter+') = "' + systemLang + '")}');
			associatedVariable[counter++] = field;
		}
	}

	executor.executeMapElementsLabelQuery(
		tempQuery,
		function(data){
			for(variable in associatedVariable){
				if(variable in data){
					queryLogicMap[associatedVariable[variable]].label = data[variable].value;
				}else{
					queryLogicMap[associatedVariable[variable]].label = createLabel(queryLogicMap[associatedVariable[variable]].url);
				}
			}
			//console.log(data);
			callback(queryLogicMap);
		});


}



