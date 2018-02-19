var queryLogicStructure;
var queryLogicStructureRootList;
var visitStack;

var queryViewer;

var predicatesCounter;

var keyElementOnFocus;

var QueryVerbalizator = function () {
	if(QueryVerbalizator.prototype._singletonInstance){
		return QueryVerbalizator.prototype._singletonInstance;
	}

	queryViewer = new QueryViewer();
	resetPredicatesCounter();

	QueryVerbalizator.prototype._singletonInstance = this;
};

QueryVerbalizator.prototype.updateQuery = function(queryRootList, queryMap, elementOnFocus){
	visitStack = [];
	queryLogicStructureRootList = queryRootList;
	queryLogicStructure = queryMap;
	keyElementOnFocus = elementOnFocus;
	verbalizeQuery();
}

function verbalizeQuery(){
	//visit query implicit tree 
	if(queryLogicStructureRootList.length != 0){
		for(var rootListIndex = 0; rootListIndex<queryLogicStructureRootList.length; rootListIndex++){
			var queryLogicStructureRoot = queryLogicStructureRootList[rootListIndex];

			// complete map's info with predicatesCounter
			if(queryLogicStructure[queryLogicStructureRoot].type=='concept' 
				|| queryLogicStructure[queryLogicStructureRoot].type=='everything')
				queryLogicStructure[queryLogicStructureRoot].predicatesCounter = 0;
			else
				queryLogicStructure[queryLogicStructureRoot].predicatesCounter = 1;

			visitStack.push(queryLogicStructure[queryLogicStructureRoot]);

			while(visitStack.length != 0){
				var currentNode = visitStack.pop();
				currentNode.verbalization.current = currentNode.verbalization.standard;
				visitVerbalizator(currentNode);

				for(var i = currentNode.children.length-1; i>=0; i--){
					//update predicatesCouter
					var node = queryLogicStructure[currentNode.children[i]];
					switch(node.type){
						case 'concept':
						case 'something':
						case 'result': //same as concepts
							queryLogicStructure[currentNode.children[i]].predicatesCounter = 0;
							break;
						case 'predicate':
							queryLogicStructure[currentNode.children[i]].predicatesCounter = queryLogicStructure[currentNode.key].predicatesCounter+1;
							break;
						case 'operator':
							queryLogicStructure[currentNode.children[i]].predicatesCounter = queryLogicStructure[currentNode.key].predicatesCounter;
							break;
					}

					if(currentNode.type == 'operator' 
						&& (queryLogicStructure[node.parent].subtype == 'not' || queryLogicStructure[node.parent].subtype == 'optional'))
						queryLogicStructure[currentNode.children[i]].predicatesCounter = 0;

					visitStack.push(queryLogicStructure[currentNode.children[i]]);
					
				}

			}
		}
	}

	queryViewer.updateQuery(queryLogicStructureRootList, queryLogicStructure, keyElementOnFocus);

}

function visitVerbalizator(node){

	if(node.parent == null){
		if(node.type!='operator'){
			node.verbalization.current = node.verbalization.first;
		}
		return;
	}

	var parentNode = queryLogicStructure[node.parent];

	switch(node.type){
		case 'concept':
			if(parentNode.type == 'concept' || parentNode.type == 'everything')
				node.verbalization.current = node.verbalization.modified;
			else if(parentNode.type == 'predicate' && parentNode.direction == 'direct'){ 
				node.verbalization.current = node.verbalization.truncated;
				
				if(parentNode.predicatesCounter != 0){//potentially i can change it
					if(node.predicatesCounter%2 == 0){//i have to change it
						queryLogicStructure[node.parent].verbalization.current = parentNode.verbalization.modified;
					}
				}
				
			}//if my parent is a reverse , I'm not a refinement
			break;

		case 'something':
		case 'result':
		case 'operator':
			break;

		case 'predicate':
			if(parentNode.type == 'predicate' && parentNode.direction == 'direct'){
				if(parentNode.predicatesCounter != 0){//potentially i can change it
					if(node.predicatesCounter%2 == 0){//i have to change it
						queryLogicStructure[node.parent].verbalization.current = parentNode.verbalization.modified;
						node.verbalization.current = node.verbalization.truncated;
					}
				}

			}
		
	}

	//stronger rule
	if(parentNode.type == 'operator'){
		if(parentNode.subtype == 'not'){
			node.verbalization.current = node.verbalization.negated;
		}else if(parentNode.subtype == 'optional'){
			node.verbalization.current = node.verbalization.optional;
		}
	}

}		

function resetPredicatesCounter(){
	predicatesCounter = 0;
}
