var queryLogicStructure;
var queryLogicStructureRootList;
var visitStack;
var queryString;

var resultQuery;

var mapCreator;

var onFocus;

var addBarred;


var languageManager;
function initQueryViewer(){

	languageManager = new LanguageManager();
	$("#queryNaturalLanguage")[0].innerHTML = languageManager.getQueryInitialVerbalization();
	$("#focusLabel")[0].innerHTML = languageManager.getFocusLabel();
	$("#focus")[0].innerHTML = languageManager.getFocusInitialVerbalization();
	$("#modalSparql").html('SELECT...');
	$("#removeButtonA").addClass('disabled');

}

function restartQueryViewer(){
	languageManager = new LanguageManager();
}

var QueryViewer= function () {
	if(QueryViewer.prototype._singletonInstance){
		return QueryViewer.prototype._singletonInstance;
	}

	mapCreator = new MapCreator();
	queryLogicStructure = {}; 
	queryLogicStructureRootList = [];
	visitStack = [];

	cachedResultQuery = {};
	resultQuery = '';

	addBarred = false;

	QueryViewer.prototype._singletonInstance = this;
};

QueryViewer.prototype.updateQuery = function(queryRootList, queryMap, focus){
	visitStack = [];
	queryLogicStructureRootList = queryRootList;
	queryLogicStructure = queryMap;
	onFocus = focus;
	queryString = languageManager.getQueryInitialVerbalization();
	resultQuery = languageManager.getQueryInitialVerbalization();
	addBarred = false;
	renderQuery();
}

function renderQuery(){ 
	if(queryLogicStructureRootList.length != 0){

		queryString = languageManager.getQueryStartVerbalization();
		resultQuery = languageManager.getQueryStartVerbalization();
		queryString += '<span>';
		queryString += '<span id="limit" meta-focusReference="limit">';

		if(!resultLimit){
			 queryString += 'every ';
			 resultQuery += '<span>every </span>';
		}
		else{ 
			queryString += '<input id="limitInput" type="number" min="0" value="'+resultLimit+'"/>';
			resultQuery += '<span>'+resultLimit+' </span>';
		}
		queryString += '</span>';
		queryString += '</span>';

		var addUl;
		(queryLogicStructureRootList.length >= 2)?addUl = true : addUl = false;

		//children
		if(addUl){
			queryString += '<ul>'; 
			resultQuery += '<ul>'; 
		}

		for(var i=0; i<queryLogicStructureRootList.length;i++){
			if(addUl){
				if(i==0 || (i%2)==1){
					queryString += "<li>";
					resultQuery += "<li>";
				}
			}

			var temp = visitRenderer(queryLogicStructureRootList[i]);
			queryString += temp.queryString;
			resultQuery += temp.resultString;

			if(addUl){
				if(i==queryLogicStructureRootList.length-1 || (i%2)==0){
					queryString += "</li>";
					resultQuery += "</li>";
				}
			}
		}

		if(addUl){
			queryString += '</ul>'; 
			resultQuery += '</ul>';
		}
		
	}

	$("#queryNaturalLanguage")[0].innerHTML = queryString;
	removeFocusable();

	//update box with focus from user
	attachEvents();

	//update box with focus from map
	renderFocus();
}

function visitRenderer(key){
	var node = queryLogicStructure[key];
	var nodeQueryString = "";

	switch(node.type){

		case "concept":
			var verbalizationIndex = 0;

			//pre label
			nodeQueryString += '<span>';
			nodeQueryString += node.verbalization.current[verbalizationIndex++];

			//eventually not or optional
			var parentNode = queryLogicStructure[node.parent];
			if(parentNode != undefined && parentNode.type == "operator" && (parentNode.subtype == "not" || parentNode.subtype == "optional")){
				nodeQueryString += '<span class="focusable" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
				nodeQueryString += '<span id="'+encodeURIComponent(parentNode.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
				nodeQueryString += node.verbalization.current[verbalizationIndex++];
				nodeQueryString += '</span>';
				nodeQueryString += '</span>';

				//article
				nodeQueryString += node.verbalization.current[verbalizationIndex++];
			}

			//content
			nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" title="'+node.url+'" class="focusable concept" meta-removeReference="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
			nodeQueryString += node.verbalization.current[verbalizationIndex++];
			nodeQueryString += '</span>';

			//post label
			nodeQueryString += node.verbalization.current[verbalizationIndex++];

			if(addBarred){
				nodeQueryString += '<span class="barred">';
			}

			var addUl;
			(node.children.length >= 2)?addUl = true : addUl = false;


			//children
			if(addUl){
				nodeQueryString += '<ul>'; 
			}

			for(var i=0; i<node.children.length;i++){
				if(addUl){
					if(i==0 || (i%2)==1){
						nodeQueryString += "<li>";
					}
				}

				var temp = visitRenderer(node.children[i]);
				nodeQueryString += temp.queryString;

				if(addUl){
					if(i==node.children.length-1 || (i%2)==0){
						nodeQueryString += "</li>";
					}
				}
			}

			if(addUl){
				nodeQueryString += '</ul>'; 
			}

			if(addBarred){
				nodeQueryString += '</span>';
				addBarred = false;
			}

			nodeQueryString += '</span>';
			break;

		case "result":
			var verbalizationIndex = 0;

			//pre label
			nodeQueryString += '<span>';

			//content
			nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" class="focusable result" meta-removeReference="'+encodeURIComponent(node.parent)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
			nodeQueryString += node.verbalization.current[verbalizationIndex++];
			nodeQueryString += '</span>';

			if(addBarred){
				nodeQueryString += '<span class="barred">';
			}

			var addUl;
			(node.children.length >= 2)?addUl = true : addUl = false;

			//children
			if(addUl){
				nodeQueryString += '<ul>'; 
			}

			for(var i=0; i<node.children.length;i++){
				if(addUl){
					if(i==0 || (i%2)==1){
						nodeQueryString += "<li>";
					}
				}

				var temp = visitRenderer(node.children[i]);
				nodeQueryString += temp.queryString;

				if(addUl){
					if(i==node.children.length-1 || (i%2)==0){
						nodeQueryString += "</li>";
					}
				}
			}

			if(addUl){
				nodeQueryString += '</ul>'; 
			}

			if(addBarred){
				nodeQueryString += '</span>';
				addBarred = false;
			}

			nodeQueryString += '</span>';
			break;

		case "everything":
		case "something":
			var verbalizationIndex = 0;
			var metaRemoveReference;
			if(node.type == "everything")
				metaRemoveReference = encodeURIComponent(node.key);
			else if(node.type == "something")
				metaRemoveReference = encodeURIComponent(node.parent);
			

			nodeQueryString += '<span>';

			//content
			nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" class="focusable '+ node.type +'" meta-removeReference="'+metaRemoveReference+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
			nodeQueryString += node.verbalization.current[verbalizationIndex++];
			nodeQueryString += '</span>';

			if(addBarred){
				nodeQueryString += '<span class="barred">';
			}

			var addUl;
			(node.children.length >= 2)?addUl = true : addUl = false;

			//children
			if(addUl){
				nodeQueryString += '<ul>';
			}

			for(var i=0; i<node.children.length;i++){
				if(addUl){
					if(i==0 || (i%2)==1){
						nodeQueryString += "<li>";
					}
				}

				var temp = visitRenderer(node.children[i]);
				nodeQueryString += temp.queryString;

				if(addUl){
					if(i==node.children.length-1 || (i%2)==0){
						nodeQueryString += "</li>";
					}
				}
			}

			if(addUl){
				nodeQueryString += '</ul>'; 
			}

			if(addBarred){
				nodeQueryString += '</span>';
				addBarred = false;
			}

			nodeQueryString += '</span>';
			break;

		case "predicate":
			if(node.direction == "direct"){

				var verbalizationIndex = 0;

				//pre label
				nodeQueryString += '<span>';
				nodeQueryString += node.verbalization.current[verbalizationIndex++];

				//eventually not or optional
				var parentNode = queryLogicStructure[node.parent];
				if(parentNode != undefined && parentNode.type == "operator" && (parentNode.subtype == "not" || parentNode.subtype == "optional")){
					nodeQueryString += '<span class="focusable" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
					nodeQueryString += '<span id="'+encodeURIComponent(parentNode.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
					nodeQueryString += '</span>';
					nodeQueryString += '</span>';

					//article
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
				}

				//content
				nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" title="'+node.url+'" class="focusable predicate" meta-removeReference="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
				nodeQueryString += node.verbalization.current[verbalizationIndex++];
				nodeQueryString += '</span>';

				//post label
				nodeQueryString += node.verbalization.current[verbalizationIndex++];

				if(addBarred){
					nodeQueryString += '<span class="barred">';
				}

				var addUl;
				(node.children.length >= 2)?addUl = true : addUl = false;


				//children
				if(addUl){
					nodeQueryString += '<ul>'; 
				}

				for(var i=0; i<node.children.length;i++){
					if(addUl){
						if(i==0 || (i%2)==1){
							nodeQueryString += "<li>";
						}
					}

					var temp = visitRenderer(node.children[i]);
					nodeQueryString += temp.queryString;

					if(addUl){
						if(i==node.children.length-1 || (i%2)==0){
							nodeQueryString += "</li>";
						}
					}
				}

				if(addUl){
					nodeQueryString += '</ul>'; 
				}

				if(addBarred){
					nodeQueryString += '</span>';
					addBarred = false;
				}

				nodeQueryString += '</span>';

			}else if(node.direction == "reverse"){
				var verbalizationIndex = 0;

				//pre label
				nodeQueryString += '<span>';
				nodeQueryString += node.verbalization.current[verbalizationIndex++];


				//eventually not or optional
				var parentNode = queryLogicStructure[node.parent];
				if(parentNode != undefined && parentNode.type == "operator" && (parentNode.subtype == "not" || parentNode.subtype == "optional")){
					nodeQueryString += '<span class="focusable" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
					nodeQueryString += '<span id="'+encodeURIComponent(parentNode.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
					nodeQueryString += '</span>';
					nodeQueryString += '</span>';

					//article
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
				}

				//content
				nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" title="'+node.url+'" class="focusable predicate" meta-removeReference="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
				nodeQueryString += node.verbalization.current[verbalizationIndex++];
				nodeQueryString += '</span>';

				//post label
				nodeQueryString += node.verbalization.current[verbalizationIndex++];

				var addUl;
				(node.children.length >= 2)?addUl = true : addUl = false;


				//children
				if(addUl){
					nodeQueryString += '<ul>'; 
				}

				for(var i=0; i<node.children.length;i++){
					if(addUl){
						if(i==0 || (i%2)==1){
							nodeQueryString += "<li>";
						}
					}

					var temp = visitRenderer(node.children[i]);
					nodeQueryString += temp.queryString;

					if(addUl){
						if(i==node.children.length-1 || (i%2)==0){
							nodeQueryString += "</li>";
						}
					}
				}

				if(addUl){
					nodeQueryString += '</ul>'; 
				}

				nodeQueryString += '</span>';
			}
			break;
		
		case "operator":
			switch(node.subtype){
				case "and" :
				case "or" : 
				case "xor" : 
					var verbalizationIndex = 0;
					nodeQueryString += '<span><span id="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'" class="focusable operator">' + node.verbalization.current[verbalizationIndex++] + '</span></span>';
					break;

				case "not" :
					addBarred = true;
					var temp = visitRenderer(node.children[0]);
					nodeQueryString += temp.queryString;
					break;
				case "optional" :
					nodeQueryString += '<span class="optionalBlock">';
					var temp = visitRenderer(node.children[0]);
					nodeQueryString += temp.queryString;
					nodeQueryString += '</span>';
					break;
		
				case "<" :
				case "<=" : 
				case ">" : 
				case ">=" : 
				case "=" : 
				case "is url" : 
				case "is string" : 
				case "starts with" : 
				case "ends with" : 
				case "contains" : 
				case "lang" : 
				case "is date" : 
				case "before" : 
				case "after" : 
					var verbalizationIndex = 0;
					//pre label
					nodeQueryString += '<span>';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];

					//eventually not or optional
					var parentNode = queryLogicStructure[node.parent];
					if(parentNode != undefined && parentNode.type == "operator" && (parentNode.subtype == "not" || parentNode.subtype == "optional")){
						nodeQueryString += '<span class="focusable" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
						nodeQueryString += '<span id="'+encodeURIComponent(parentNode.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
						nodeQueryString += node.verbalization.current[verbalizationIndex++];
						nodeQueryString += '</span>';
						nodeQueryString += '</span>';

						//post Not/Optional
						nodeQueryString += node.verbalization.current[verbalizationIndex++];
					}
					//content
					nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
					nodeQueryString += '</span>';

					//post label
					nodeQueryString += node.verbalization.current[verbalizationIndex++];

					//they have only a child
					var temp = visitRenderer(node.children[0]);
					nodeQueryString += temp.queryString;

					nodeQueryString += '</span>';
					break;

				case "range" : 
				case "range date" : 
					var verbalizationIndex = 0;
					//due figli senza ul e con and in mezzo
					//pre label
					nodeQueryString += '<span>';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];

					//eventually not or optional
					var parentNode = queryLogicStructure[node.parent];
					if(parentNode != undefined && parentNode.type == "operator" && (parentNode.subtype == "not" || parentNode.subtype == "optional")){
						nodeQueryString += '<span class="focusable" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';					
						nodeQueryString += '<span id="'+encodeURIComponent(parentNode.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(parentNode.key)+'" meta-focusReference="'+encodeURIComponent(parentNode.key)+'">';
						nodeQueryString += node.verbalization.current[verbalizationIndex++];
						nodeQueryString += '</span>';
						nodeQueryString += '</span>';
					}

					//content
					nodeQueryString += '<span id="'+encodeURIComponent(node.key)+'" class="focusable operator" meta-removeReference="'+encodeURIComponent(node.key)+'" meta-focusReference="'+encodeURIComponent(node.key)+'">';
					nodeQueryString += node.verbalization.current[verbalizationIndex++];
					nodeQueryString += '</span>';

					//post label
					nodeQueryString += node.verbalization.current[verbalizationIndex++];

					//they have only a child
					var temp = visitRenderer(node.children[0]);
					nodeQueryString += temp.queryString;

					nodeQueryString += languageManager.getDefaultConjunction();

					var temp = visitRenderer(node.children[1]);
					nodeQueryString += temp.queryString;

					nodeQueryString += '</span>';
					break;
			}
			break;
	}

	return {queryString: nodeQueryString};
}

function renderFocus(){

	//kill all pending query
	var size = activeAjaxRequest.length;
	if(size != 0){
		for(var i=size-1; i>=0;i--){
			activeAjaxRequest[i].abort();
		}
		activeAjaxRequest = [];
	}
	//kill user query
	if(userAjaxRequest!=null){
		userAjaxRequest.abort();
		userAjaxRequest = null;
	}


	if(onFocus == null){

		fillConcepts();
		fillPredicates();

		$("#focus").text(languageManager.getFocusInitialVerbalization());
		$("#modalSparql").html('SELECT...');
		$("#removeButtonA").addClass('disabled');

		return;
	}

	//onfocus != null
	var onFocusNode = mapCreator.getNodeByKey(onFocus);

	//if(onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or' ||onFocusNode.subtype == 'xor' )){
	if(onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or' )){
		var siblings = mapCreator.getConjunctionKeysByConjunction(onFocus);

		for(var i = 1; i < siblings.length; i = i+2){
			document.getElementById(encodeURIComponent(siblings[i])).className +=" highlighted";
		}
		
		var focusLabel = queryLogicStructure[onFocus].label;
		$("#focus").html(" <span class='" + mapCreator.getNodeByKey(onFocus).type+"'>" + focusLabel + "</span>");
	}else{
		document.getElementById(encodeURIComponent(onFocus)).className +=" highlighted";
		//it's a node of the map
		//focus text
		var number = queryLogicStructure[onFocus].index; 
		if('sameAs' in onFocusNode)
			number = queryLogicStructure[onFocusNode.sameAs].index;

		var focusLabel = languageManager.getOrdinalNumber(number) + ' ' + queryLogicStructure[onFocus].label;
		$("#focus").html(" <span class='" + mapCreator.getNodeByKey(onFocus).type+"'>" + focusLabel + "</span>");
	}

	if(document.getElementById(encodeURIComponent(onFocus)).getAttribute('meta-removeReference') == undefined){
		$('#removeButtonA').addClass('disabled');
	}else{
		$('#removeButtonA').removeClass('disabled');
	}

	updateBoxes(queryLogicStructure[onFocus]);		
}

function updateBoxes(focusNode){

	switch(focusNode.type){
		case "concept":
			updateBoxesFromConcept(focusNode.url);
			break;
		case "predicate":
			if(focusNode.direction == "direct")
				updateBoxesFromDirectPredicate(focusNode.url);
			else 
				updateBoxesFromReversePredicate();
			break;
		case "something":
			var parent = queryLogicStructure[focusNode.parent];
			updateBoxesFromSomething(parent.url); //pred is reverse predicate
			break;
		case "everything":
			fillConcepts();
			fillPredicates();
			break;
		case "operator":
			updateBoxesFromOperator();
			break;
		case "result":
			updateBoxesFromResult(focusNode.url, focusNode.datatype, focusNode.lang, focusNode.penninculo);
			break;
	}
}

function attachEvents(){

	//all focusable except for limit
	$(".focusable:not(#limit)").click(function(e){
		e.stopPropagation();
		$(".highlighted").removeClass("highlighted");

		//changeFocus notification
		onFocus = decodeURIComponent($(this).attr("meta-focusReference"));
		if($(this).attr('meta-removeReference') == undefined){
			$('#removeButtonA').addClass('disabled');
		}else{
			$('#removeButtonA').removeClass('disabled');
		}

		var onFocusNode = mapCreator.getNodeByKey(onFocus);

		//if(onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or' ||onFocusNode.subtype == 'xor' )){
		if(onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or')){

			var siblings = mapCreator.getConjunctionKeysByConjunction(onFocus);

			for(var i = 1; i < siblings.length; i = i+2){
				document.getElementById(encodeURIComponent(siblings[i])).className +=" highlighted";
			}
			
			var focusLabel = queryLogicStructure[onFocus].label;
			$("#focus").html(" <span class='" + mapCreator.getNodeByKey(onFocus).type+"'>" + focusLabel + "</span>");
		}else{
			document.getElementById(encodeURIComponent(onFocus)).className +=" highlighted";
			//it's a node of the map
			//focus text
			var number = queryLogicStructure[onFocus].index; 
			if('sameAs' in onFocusNode)
				number = queryLogicStructure[onFocusNode.sameAs].index;
		
			var focusLabel = languageManager.getOrdinalNumber(number) + ' ' + queryLogicStructure[onFocus].label;
			$("#focus").html(" <span class='" + mapCreator.getNodeByKey(onFocus).type+"'>" + focusLabel + "</span>");
		}

		$("#operatorsSpinner").show();
		$('#operatorsProgress').show();
		$('#operatorList').hide();
		$('#reusableResultList').hide();

		mapCreator.changeFocus(onFocus);

		var size = activeAjaxRequest.length;
		if(size != 0){
			for(var i=size-1; i>=0;i--){
				activeAjaxRequest[i].abort();
			}
			activeAjaxRequest = [];
		}
		//don't kill user query
		updateBoxes(queryLogicStructure[onFocus]);	

	});

	$("#limitInput").keydown(function(e){
		e.stopPropagation();
		if(e.which == 13 || e.keyCode == 13) {
			var value = e.target.value;
			if(value>10000){
				value = 10000;
				$('#limitInput').val(value);
			}
			
			$('#resultsTable').hide();
			$('#resultsPreviewBadge').hide();
			$('#tableResultsSpinner').show();
			$('#tableResultsProgress').show();
			
			$('#operatorsSpinner').show();
			$('#operatorsProgress').show();
			$('#operatorList').hide();

	        mapCreator.changeResultLimit(value);
	    }else if(!((e.keyCode > 95 && e.keyCode < 106)
	      || (e.keyCode > 47 && e.keyCode < 58) 
	      || e.keyCode == 8)) {
	        return false;
	    }else if(!((e.which > 95 && e.which < 106)
	      || (e.which > 47 && e.which < 58) 
	      || e.which == 8)) {
	    	return false;
	    }
	});

	$("#limitInput").focusout(function(e){
		e.stopPropagation();

		var value = e.target.value;
		if(value>10000){
			value = 10000;
			$('#limitInput').val(value);
		}

		$('#resultsTable').hide();
		$('#resultsPreviewBadge').hide();
		$('#tableResultsSpinner').show();
		$('#tableResultsProgress').show();
		
		$('#operatorsSpinner').show();
		$('#operatorsProgress').show();
		$('#operatorList').hide();
		mapCreator.changeResultLimit(value);
	});

	$(".barred").click(function(e){
		e.stopPropagation();
	});

}

function removeFocusable(){
	var focusable = $(".barred .focusable");
	
	$.each(focusable, function(index){
		focusable[index].classList.remove('focusable');
	});
}

function showUserQueryBox(){
	$('#sparqlVsNl #modalNaturalLanguage').html($('#queryNaturalLanguage').html());
	$('#sparqlVsNl #limit').html(resultLimit+" ");
	$("#sparqlVsNl #limit").addClass("focusable");
	$("#sparqlVsNl .focusable").click(function(e){

		e.stopPropagation();
		$("#sparqlVsNl .highlighted").removeClass("highlighted");

		var id = decodeURIComponent($(this).attr("id"));
		var onFocusNode = null;
		if(id!='limit')
			onFocusNode = mapCreator.getNodeByKey(id);

		//if(onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or' ||onFocusNode.subtype == 'xor' )){
		if(onFocusNode!=null && 
			onFocusNode.type == 'operator' && (onFocusNode.subtype == 'and' || onFocusNode.subtype == 'or' )){
			
			var siblings = mapCreator.getConjunctionKeysByConjunction(id);

			for(var i = 1; i < siblings.length; i = i+2){
				document.querySelector('#sparqlVsNl #'+encodeURIComponent(siblings[i])).className +=" highlighted";
			}
			//highlight sparql query
			$("#modalSparql .SPARQLhighlighted").removeClass("SPARQLhighlighted");
			
			for(var i = 1; i < siblings.length; i = i+2){
				$("#modalSparql span[meta-relatedto~='"+document.querySelector('#sparqlVsNl #'+encodeURIComponent(siblings[i])).
					getAttribute("meta-focusReference")+"']").addClass("SPARQLhighlighted");
			}
		}else{
			$(this).addClass("highlighted");
			//highlight sparql query
			$("#modalSparql .SPARQLhighlighted").removeClass("SPARQLhighlighted");
			$("#modalSparql span[meta-relatedto~='"+$(this).attr("meta-focusReference")+"']").addClass("SPARQLhighlighted");
		}


	});

	$('#sparqlVsNl').modal('open');
}

QueryViewer.prototype.renderUserQuery = function(sparqlQueryArray){
	var sparqlQuery = "";
	//sparqlQueryArray.join("\n");
	var obj;
	sparqlQuery += "<span>"+sparqlQueryArray[0]+"</span><br>";
	sparqlQuery += "<span>"+sparqlQueryArray[1]+"</span><br>";

	for(var i = 2; i<sparqlQueryArray.length-2; i++){
		obj = sparqlQueryArray[i];

		sparqlQuery += "<span meta-relatedTo='";
		for(var j = 0; j<obj.relatedTo.length; j++){
			sparqlQuery += encodeURIComponent(obj.relatedTo[j])+" ";
		}
		sparqlQuery += "'>";
		var text =  obj.content.join(' ').replace(/</g, '&lt').replace(/>/g, '&gt');
		sparqlQuery += text;
		sparqlQuery += "</span>";
		sparqlQuery += "<br>";
	}
	sparqlQuery += "<span>"+sparqlQueryArray[sparqlQueryArray.length-2]+"</span>";
	sparqlQuery += "<span meta-relatedTo='limit'>"+sparqlQueryArray[sparqlQueryArray.length-1]+"</span>";

	$("#modalSparql").html(sparqlQuery);
	
	$('#modalSparql span[meta-relatedto~="'+encodeURIComponent(onFocus)+'"]').addClass("SPARQLhighlighted");
}

QueryViewer.prototype.getCachedQuery = function(){
	return resultQuery;
}