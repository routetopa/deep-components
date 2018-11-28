function manageResultMap(arrayData){
	var resultMap = {};
	var element;
	var label;
 
 	for(i=0; i<arrayData.length; i++){
		element = arrayData[i];
		if(!isEmpty(element)){
			if(element.label == undefined){
				label = createLabel(element.url.value);
				element.label = {value:label};
			}
			resultMap[element.url.value] = {url:element.url.value, label:element.label.value, numberOfInstances: 0, parent: [], children: []};
		}
	}

	return resultMap;
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function manageClassHierarchy(data){
	var arrayData = data.results.bindings;
	var element; 
	var label;
	var parent = null;

	$.each(arrayData, function(index){
		element = arrayData[index];

		if('superclass' in element){
			if(!(element.superclass.value in language_classHierarchyMap[systemLang])){
			
				label = element.label_superclass;
				if(label == undefined)
					label = createLabel(element.superclass.value);
				else 
					label = element.label_superclass.value;

				language_classHierarchyMap[systemLang][element.superclass.value] = {url:element.superclass.value, label: label, children : [], parent:[], numberOfInstances:0};
			}

			language_classHierarchyMap[systemLang][element.superclass.value].children.push(element.subclass.value);
			parent = element.superclass.value;
		}else{
			parent = null;
		}

		if(!(element.subclass.value in language_classHierarchyMap[systemLang])){

			var subclass_label = element.label_subclass;
			if(subclass_label == undefined)
				subclass_label = createLabel(element.subclass.value);
			else 
				subclass_label = element.label_subclass.value;

			language_classHierarchyMap[systemLang][element.subclass.value] = {url:element.subclass.value, label: subclass_label, children : [], numberOfInstances:0, parent: []};

		}

		if(parent)
			language_classHierarchyMap[systemLang][element.subclass.value].parent.push(parent);

	});
}

function cut(originalMap, limit){
	var stack = $.extend(true, [], language_classHierarchyMapRoots[systemLang]); 

	var map = {};
	var current;

	var counter = 0;
	while(stack.length!=0){
		//limit could be false
		if(counter == limit)
			return map;

		current = stack.pop();
		if(!(current in map)){
			map[current] = $.extend(true, {}, originalMap[current]);
			map[current].children = [];

			counter++;

			stack = originalMap[current].children.concat(stack);
		}

		for(var i=0; i<map[current].parent.length; i++){
			if(map[current].parent[i] in map && $.inArray(current, map[map[current].parent[i]].children)<0)
				map[map[current].parent[i]].children.push(current);
		}
		
	}

	return map;
}

function buildSubmapHierarchy(selectedClass, limit){
	var map = {};
	if(!(selectedClass in language_classHierarchyMap[systemLang])){
		map[selectedClass] = {url:selectedClass, label: createLabel(selectedClass), children : [], parent:[], numberOfInstances:0};
		return map;
	}

	map[selectedClass] = $.extend(true, {}, language_classHierarchyMap[systemLang][selectedClass]);
	//map[selectedClass].children = [];
	map[selectedClass].parent = [];

	var counter=0;

	var stack = $.extend(true, [], language_classHierarchyMap[systemLang][selectedClass].children);
	
	var current;	
	while(stack.length!=0){

		//limit could be false
		if(counter == limit){
			/*console.log(limit);
			console.log(map);*/
			return map;
		}

		current = stack.pop();

		if(!(current in map)){
			map[current] = $.extend(true, {}, language_classHierarchyMap[systemLang][current]);
			map[current].children = [];
			
			counter++;
		
			stack = language_classHierarchyMap[systemLang][current].children.concat(stack);
		}

		for(var i=0; i<map[current].parent.length; i++){
			if(map[current].parent[i] in map && $.inArray(current, map[map[current].parent[i]].children)<0)
				map[map[current].parent[i]].children.push(current);
		}
	
	}
	return map;
}

//DELETE
function getResultMap(arrayData){
	var map = {};
	var label;

	$.each(arrayData, function(index){
		element = arrayData[index];

		label = element.label;
		if(label == undefined)
			label = createLabel(element.url.value);
		else 
			label = element.url.value;

		//it doesn't clone map entry, but it clone entry status
		if(element.url.value in language_classHierarchyMap[systemLang]){
			map[element.url.value] = $.extend(true, {}, language_classHierarchyMap[systemLang][element.url.value]);
			map[element.url.value].children = [];
			map[element.url.value].numberOfInstances = 0;
		}else{
			map[element.url.value] = {url: element.url.value, label: label, children: [], parent: [], numberOfInstances:0};
		}

	});

	for(key in map){
		var parents = map[key].parent;
		for(var i=0; i<parents.length; i++){
			if(!(parents[i] in map))
				map[key].parent.splice(i, 1);


		}
	}

	return map;
}

//data must contain class to identify url class and numberOfInstances
function addInstancesOccurenceClassHierarchy(arrayData, map){

	$.each(arrayData, function(index){
		element = arrayData[index];

		if(element.class.value in map){
			map[element.class.value].numberOfInstances = element.numberOfInstances.value;
		}
		/*else{
			console.log("dbpediaLike : " + element.class.value + " not in map");
		}*/
	});
	return map; 
}

function cleanMap(map){

/*	

	for(key in map){
		var element = map[key];

		if(element.numberOfInstances == 0){

			var parents = element.parent;
			var children = element.children;

			for(var i=0; i<children.length; i++){
				var index = $.inArray(key, map[children[i]].parent);
				map[children[i]].parent.splice(index, 1);
			}

			for(var i=0; i<parents.length; i++){
				var index = $.inArray(key, map[parents[i]].children);
				map[parents[i]].children.splice(index, 1);
			}

			for(var i=0; i<parents.length; i++){
				for(var j=0; j<children.length; j++){
					map[parents[i]].children.push(children[j]);
					map[children[j]].parent.push(parents[i]);
				}
			}

			delete map[key];
		}
	}
*/


	var element;
	var elementsToCheck = [];
	for(key in map){
		element = map[key];
		if(element.numberOfInstances == 0){
			var  parents = element.parent;
			var children = element.children;
			for(var i=0; i<parents.length; i++){
				if(map[parents[i]]!= undefined){
					var index = $.inArray(element.url, map[parents[i]].children);
					map[parents[i]].children.splice(index, 1);
					map[parents[i]].children = map[parents[i]].children.concat(children);
				}else{
					//console.log(element);
				}
			}
			for(var i=0; i<children.length; i++){
				if(map[children[i]]!=undefined){
					var index = $.inArray(element.url, map[children[i]].parent);
					map[children[i]].parent.splice(index, 1);
					map[children[i]].parent = map[children[i]].parent.concat(parents);
				}else{
					//console.log(element);
				}
			}
			delete map[key];
		}
	}
	return map;
}

function getMapRoots(map){
	var roots = [];
	for(element in map){
		if(map[element].parent.length==0){
			roots.push(element);
		}
	}
	return roots;
}