
var boxFiller;
var languageManager;
var mapCreator;

var hierarchyOnFlag;

var lastMap;
var lastRootMap;

/*
	To get all label's lang : 

	prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
	SELECT DISTINCT ?lang
	WHERE {
	?s rdfs:label ?label. 
	BIND (lang(?label) AS ?lang)
	}ORDER BY ?lang
*/
/*var labelLangList = [{langCode : 'ar'}, 
					 {langCode : 'be'},
					 {langCode : 'bg'},
					 {langCode : 'bn'},
					 {langCode : 'ca'},
					 {langCode : 'cs'},
					 {langCode : 'de'},
					 {langCode : 'el'},
					 {langCode : 'en'},
					 {langCode : 'es'},
					 {langCode : 'eu'},
					 {langCode : 'fr'},
					 {langCode : 'ga'},
					 {langCode : 'gl'},
					 {langCode : 'hi'},
					 {langCode : 'hy'},
					 {langCode : 'in'},
					 {langCode : 'it'},
					 {langCode : 'ja'},
					 {langCode : 'ko'},
					 {langCode : 'kr'},
					 {langCode : 'lv'},
					 {langCode : 'nl'},
					 {langCode : 'pl'},
					 {langCode : 'pt'},
					 {langCode : 'ro'},
					 {langCode : 'ru'},
					 {langCode : 'sk'},
					 {langCode : 'sl'},
					 {langCode : 'sr'},
					 {langCode : 'tr'},
					 {langCode : 'zh'}];
*/
/*var systemLangList = [{langCode : 'en'},
					  {langCode : 'it'}];*/

var systemLangList = [];

var conceptsLimit = 500;
var predicatesLimit = 100;

function initBoxViewer(){

	languageManager = new LanguageManager();
	boxFiller = new BoxFiller();
	mapCreator = new MapCreator();

	initializeLabelsAndTitle();

	fillConcepts();
	fillPredicates();
	fillSettings();
	fillHelp();
}

function restartBoxViewer(){

	languageManager = new LanguageManager();
	boxFiller = new BoxFiller();
	mapCreator = new MapCreator();

	initializeLabelsAndTitle();

	fillSettings();
	fillHelp();
}

function initializeLabelsAndTitle(){
	hierarchyOnFlag = true;
	$("#hierarchySpan").html('<i class="small material-icons white-text right" style="margin:0" onClick="hierarchyOff();">format_list_bulleted</i>');

	$("#conceptsTabTitle").html(languageManager.getTabTitle('concept'));
	$("#predicatesTabTitle").html(languageManager.getTabTitle('predicate'));
	$("#operatorsTabTitle").html(languageManager.getTabTitle('operator'));
	$("#tableResultTabTitle").html(languageManager.getTabTitle('table result'));
	$("#settingsTabTitle").html(languageManager.getTabTitle('settings'));
	$("#helpTabTitle").html(languageManager.getTabTitle('help'));
	$("#directPredicateTabTitle").html(languageManager.getTabTitle('direct predicate'));
	$("#reversePredicateTabTitle").html(languageManager.getTabTitle('reverse predicate'));

	//$("#hintBox").hide();

	//settings
	//$("#labelLangSelectLabel").html(languageManager.getFieldTitle('label lang'));
	$("#systemLangSelectLabel").html(languageManager.getFieldTitle('system lang'));
	$("#numConceptsLabel").html(languageManager.getFieldTitle('num concepts'));
	$("#numPredicatesLabel").html(languageManager.getFieldTitle('num predicates'));
	$("#defaultOrderTableLabel").html(languageManager.getFieldTitle('default order table'));


	//search bars
	placeholder="Search for a concept..."
	$("#searchConceptsBox").attr("placeholder", languageManager.getInputPlaceholder('concept'));
	$("#searchPredicatesBox").attr("placeholder", languageManager.getInputPlaceholder('predicate'));
	$("#searchReusableResultsBox").attr("placeholder", languageManager.getInputPlaceholder('result'));
	$("#searchReusableResultCard").hide();

	//buttontitle
	$("#removeButtonA").attr('title', languageManager.getButtonLabel('removeFocus'));
	$("#saveTable").attr('title', languageManager.getButtonLabel('saveTable'));
	$("#openSparqlQuery").attr('title', languageManager.getButtonLabel('sparqlQuery'));
}
//get and render concepts
function fillConcepts(){
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();
	$('#conceptsListBox').hide();

	boxFiller.retrieveConcepts(conceptsLimit, function (rootMap, map){
		lastMap = map;
		lastRootMap = rootMap;
		renderConcept(rootMap, map);
	});
}

function updateBoxesFromConcept(conceptUrl){
	$("#searchConceptsBox").val('');
	$("#searchPredicatesBox").val('');
	
	$('#conceptsListBox').hide();
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();
	
	$("#directPredicatesList").hide();
	$("#reversePredicatesList").hide();
	$('#predicatesSpinner').show();
	$('#directPredicatesProgress').show();
	$('#reversePredicatesProgress').show();

	//boxFiller.updateConceptsFromConcept(conceptUrl, conceptsLimit, renderConcept);
	//boxFiller.updatePredicatesFromConcept(conceptUrl, predicatesLimit, renderPredicates);
	boxFiller.updateConcepts(renderConcept);
	boxFiller.updatePredicates(renderPredicates);
}

function renderConcept(rootMap, map){
	lastRootMap = rootMap;
	lastMap = map;

	if(hierarchyOnFlag)
		renderConceptsHierarchy(rootMap, map);
	else
		renderConceptsList(rootMap, map);

	if(rootMap.length == 0){
		$("#conceptsTab").addClass('disabled');
		if($("#conceptsTab a").attr('class') != undefined && $("#conceptsTab a").attr('class').includes("active"))
			$('ul#myTabs').tabs('select_tab', ($("#myTabs li:not(.disabled) a")[0].getAttribute('href')).substr(1));
	}
	else
		$("#conceptsTab").removeClass('disabled');		

	$('#conceptsSpinner').hide();
	$('#conceptsProgress').hide();
	$('#conceptsListBox').show();
}

function renderConceptsList(roots, concepts){
	var conceptsList = $("#conceptsList");
	conceptsList.removeClass("conceptsListBoxHierarchy");
	conceptsList.empty();
	var orderedKeys = Object.keys(concepts).sort(function(a,b){
		var x = concepts[a].label.toLowerCase();
	    var y = concepts[b].label.toLowerCase();
	    return x < y ? -1 : (x > y ? 1 : 0);
	});

	for(var i=0; i<orderedKeys.length; i++){
		var concept = concepts[orderedKeys[i]];

		var li = $("<li/>")
			.attr('class', 'collection-item addToQuery')
			.appendTo(conceptsList)		
			.on('click', function(){
				e.stopPropagation();
				$('#operatorsSpinner').show();
				$('#operatorProgress').show();
				$('#operatorList').hide();

				$('#tableResultsSpinner').show();
				$('#tableResultsProgress').show();
				$('#resultsTable').hide();
				$('#resultsPreviewBadge').hide();
	
				mapCreator.selectedConcept($(this).find('.liContent').attr('meta-url'), $(this).find('.liContent').attr('meta-label'));
			});

		var span = $('<span/>')
			.attr('class', 'liContent')
			.attr('title', concept.url)
			.attr('meta-url', concept.url)
			.attr('meta-label', concept.label)
			.html(concept.label)
			.appendTo(li);

		var badge;
		if(concept.numberOfInstances == 0){
			badge = $("<i/>")
			.attr('class', 'tiny material-icons right conceptInfo')
			.html('info')
			.attr('meta-url', concept.url)
			.appendTo(li)
			.on('click', function(evt){
				evt.stopPropagation();
				boxFiller.getConceptStats($(this).attr('meta-url'), function(numberOfInstances){
					var badge = $("<span/>")
						.attr('class', 'new badge')
						.attr('data-badge-caption', '')
						.text(numberOfInstances);

					$(evt.target).replaceWith(badge);
				});
			});
		}else{
			badge = $("<span/>")
			.attr('class', 'new badge')
			.attr('data-badge-caption', '')
			.text(concept.numberOfInstances)
			.appendTo(li);
		}
	
	}
}

function renderConceptsHierarchy(roots, concepts){
	var conceptsList = $("#conceptsList");
	conceptsList.addClass("conceptsListBoxHierarchy");
	conceptsList.empty();

	for(var i=0; i<roots.length; i++)
		iterativePreorderVisit(roots[i], concepts, conceptsList, 0);
}

function iterativePreorderVisit(concept, concepts, toAppend, level){
	var children = concepts[concept].children;

	var childrenLevel=level+1;

	var li = $("<li/>")
		.attr('class', 'collection-item addToQuery withMargin')
		.css('margin-left', level*2+0.1+'em')
		.appendTo(toAppend)
		.on('click', function(e){
			e.stopPropagation();
			$('#operatorsSpinner').show();
			$('#operatorList').hide();
			$('#operatorsProgress').show();

			$('#tableResultsSpinner').show();
			$('#resultsTable').hide();
			$('#tableResultsProgress').show();
			$('#resultsPreviewBadge').hide();

			mapCreator.selectedConcept($(this).find('.liContent').attr('meta-url'), $(this).find('.liContent').attr('meta-label'));
		});

	var expandableIcon;
	if(children.length>0){
		expandableIcon = $("<i/>")
			.attr('class', 'tiny material-icons grey-text expandIcon')
			.html('expand_less')
			.appendTo(li);
	}

	var span = $("<span/>")
			.attr('class', 'liContent')
			.attr('title', concepts[concept].url)
			.attr('meta-url', concepts[concept].url)
			.attr('meta-label', concepts[concept].label)
			.html(concepts[concept].label)
			.css('margin-left', '0.5em')
			.appendTo(li);
		
	var badge;
	if(concepts[concept].numberOfInstances == 0){
		//not the first interaction
		badge = $("<i/>")
			.attr('class', 'tiny material-icons right conceptInfo')
			.html('info')
			.attr('meta-url', concepts[concept].url)
			.appendTo(li)
			.on('click', function(evt){
				evt.stopPropagation();
				boxFiller.getConceptStats($(this).attr('meta-url'), function(numberOfInstances){
					var badge = $("<span/>")
						.attr('class', 'new badge')
						.attr('data-badge-caption', '')
						.text(numberOfInstances);

					$(evt.target).replaceWith(badge);
				});
			});
	}else{
		badge = $("<span/>")
		.attr('class', 'new badge')
		.attr('data-badge-caption', '')
		.text(concepts[concept].numberOfInstances)
		.appendTo(li);
	}
		
	if(children.length>0){
		var div = $("<div/>")
			.attr('class', 'myCollapsibleBody')
			.appendTo(toAppend);

		expandableIcon.on('click', function(e){
			e.stopPropagation();
			if($(this).parent().next().is(':visible')){
				$(this).parent().next().hide();
				$(this)[0].innerHTML = 'expand_more';
			}
			else{
				$(this).parent().next().show();
				$(this)[0].innerHTML = 'expand_less';
			}
		});

		for(var i=0; i<children.length; i++){
			iterativePreorderVisit(children[i], concepts, div, childrenLevel);
		}		
	}
}

//get and render predicates
function fillPredicates(){
	$('#predicatesSpinner').show();
	$('#directPredicatesProgress').show();
	$('#reversePredicatesProgress').show();
	$("#directPredicatesList").hide();
	$("#reversePredicatesList").hide();

	boxFiller.retrievePredicates(predicatesLimit, function (predicates){
		renderPredicates(predicates);
	});
}

function updateBoxesFromDirectPredicate(predicateUrl){
	$("#searchConceptsBox").val('');
	$("#searchPredicatesBox").val('');

	$('#conceptsListBox').hide();
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();

	$("#directPredicatesList").hide();
	$("#reversePredicatesList").hide();
	$('#predicatesSpinner').show();
	$('#directPredicatesProgress').show();
	$('#reversePredicatesProgress').show();

	//boxFiller.updateConceptsFromDirectPredicate(predicateUrl, conceptsLimit, renderConcept);
	//boxFiller.updatePredicatesFromDirectPredicate(predicateUrl, predicatesLimit, renderPredicates);
	boxFiller.updateConcepts(renderConcept);
	boxFiller.updatePredicates(renderPredicates);
}

function updateBoxesFromReversePredicate(){
	$("#searchConceptsBox").val('');
	$("#searchPredicatesBox").val('');

	$("#conceptsList").empty();
	$("#directPredicatesList").empty();	
	$("#reversePredicatesList").empty();		
}

function renderPredicates(predicates){
	/*var predicatesList = $("#predicatesList");
	predicatesList.empty();*/

	var directArray = predicates.directArray;
	var reverseArray = predicates.reverseArray;

	if(Object.keys(directArray).length == 0 && Object.keys(reverseArray).length == 0){
		$("#predicatesTab").addClass('disabled');
		if($("#predicatesTab a").attr('class') != undefined && $("#predicatesTab a").attr('class').includes("active"))
			$('ul#myTabs').tabs('select_tab', ($("#myTabs li:not(.disabled) a")[0].getAttribute('href')).substr(1));
	}
	else{
		$("#predicatesTab").removeClass('disabled');
		if($("#predicatesTab a").attr('class') != undefined && $("#predicatesTab a").attr('class').includes("active")){
			if(Object.keys(directArray).length == 0){
				$('ul#predicatesTabBox').tabs('select_tab', 'reverse');
			}else{
				$('ul#predicatesTabBox').tabs('select_tab', 'direct');
			}
		}
	}

	renderDirectPredicates(directArray);
	renderReversePredicates(reverseArray);

	$('#predicatesSpinner').hide();	
}

function renderDirectPredicates(directMap){

	var directPredicatesList = $("#directPredicatesList");
	directPredicatesList.empty();

	for(key in directMap){
		element = directMap[key];
		
		var li = $("<li/>")
			.attr('class', 'collection-item withMargin addToQuery')
			.attr('id', element.url + "item")
			.appendTo(directPredicatesList)
			.on('click', function(){
				$('#operatorsSpinner').show();
				$('#operatorList').hide();
				$('#operatorsProgress').show();

				$('#resultsTable').hide();
				$('#resultsPreviewBadge').hide();
				$('#tableResultsSpinner').show();
				$('#tableResultsProgress').show();
				mapCreator.selectedPredicate($(this).find('.liContent').attr('meta-url'), $(this).find('.liContent').attr('meta-label'), $(this).find('.liContent').attr('meta-predicateDirection'));
			});

		var span = $("<span/>")
			.attr('title', element.url)
			.attr('class', 'addToQuery liContent')
			.attr('meta-url', element.url)
			.attr('meta-label', element.label)
			.attr('meta-predicateDirection', 'direct') 
			.html(languageManager.getPredicateVerbalization(element.label, 'direct'))
			.css('margin-left', '0.5em')
			.appendTo(li);

		var info = $("<i/>")
			.attr('class', 'tiny material-icons right predicateInfo')
			.html('info')
			.attr('meta-url', element.url)
			.appendTo(li)
			.on('click', function(evt){
				evt.stopPropagation();
				boxFiller.getPredicateStats($(this).attr('meta-url'), function(numberOfInstances){
					var badge = $("<span/>")
						.attr('class', 'new badge')
						.attr('data-badge-caption', '')
						.text(numberOfInstances);

					$(evt.target).replaceWith(badge);
				});
			});
	}

	$('#directPredicatesProgress').hide();
	$("#directPredicatesList").show();
}

function renderReversePredicates(reverseArray){

	var reversePredicatesList = $("#reversePredicatesList");
	reversePredicatesList.empty();

	$.each(reverseArray, function(index){
		element = reverseArray[index];

		var li = $("<li/>")
			.attr('class', 'collection-item withMargin addToQuery')
			.attr('id', element.url + "item")
			.appendTo(reversePredicatesList)
			.on('click', function(){
				$('#operatorsSpinner').show();
				$('#operatorList').hide();
				$('#operatorsProgress').show();

				$('#tableResultsSpinner').show();
				$('#resultsTable').hide();
				$('#tableResultsProgress').show();
				$('#resultsPreviewBadge').hide();
				mapCreator.selectedPredicate($(this).find('.liContent').attr('meta-url'), $(this).find('.liContent').attr('meta-label'), $(this).find('.liContent').attr('meta-predicateDirection'));
			});

		var span = $("<span/>")
			.attr('title', element.url)
			.attr('class', 'addToQuery liContent')
			.attr('meta-url', element.url)
			.attr('meta-label', element.label)
			.attr('meta-predicateDirection', 'reverse') 
			.html(languageManager.getPredicateVerbalization(element.label, 'reverse'))
			.css('margin-left', '0.5em')
			.appendTo(li);

		var info = $("<i/>")
			.attr('class', 'tiny material-icons right predicateInfo')
			.html('info')
			.attr('meta-url', element.url)
			.appendTo(li)
			.on('click', function(evt){
				evt.stopPropagation();
				boxFiller.getPredicateStats($(this).attr('meta-url'), function(numberOfInstances){
					var badge = $("<span/>")
						.attr('class', 'new badge')
						.attr('data-badge-caption', '')
						.text(numberOfInstances);

					$(evt.target).replaceWith(badge);
				});
			});

	});

	$('#reversePredicatesProgress').hide();
	$("#reversePredicatesList").show();
}

//manage update boxes when focus is on 'something' node
function updateBoxesFromSomething(predicateUrl){
	$("#searchConceptsBox").val('');
	$("#searchPredicatesBox").val('');

	$('#conceptsListBox').hide();
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();
	
	$("#directPredicatesList").hide();
	$("#reversePredicatesList").hide();
	$('#predicatesSpinner').show();
	$('#directPredicatesProgress').show();
	$('#reversePredicatesProgress').show();
	
	//boxFiller.updateConceptsFromSomething(predicateUrl, conceptsLimit, renderConcept);
	//boxFiller.updatePredicatesFromSomething(predicateUrl, predicatesLimit, renderPredicates);	
	boxFiller.updateConcepts(renderConcept);
	boxFiller.updatePredicates(renderPredicates);
}

//manage update boxes when focus is on an operator
function updateBoxesFromOperator(){
	$("#conceptsList").empty();
	$("#directPredicatesList").empty();	
	$("#reversePredicatesList").empty();

	$("#conceptsTab").addClass('disabled');
	$("#predicatesTab").addClass('disabled');

	if(($("#conceptsTab a").attr('class') != undefined && $("#conceptsTab a").attr('class').includes("active") )||($("#predicatesTab a").attr('class') != undefined && $("#predicatesTab a").attr('class').includes("active")) )
		$('ul#myTabs').tabs('select_tab', ($("#myTabs li:not(.disabled) a")[0].getAttribute('href')).substr(1));


	//$('ul#myTabs').tabs('select_tab', 'operatorsBox');
	
}

//manage update boxes when focus is on an result
function updateBoxesFromResult(resultUrl, resultDatatype, resultLang, resultPenninculo){
	$("#searchConceptsBox").val('');
	$("#searchPredicatesBox").val('');

	$("#conceptsList").empty();
	$("#conceptsTab").addClass('disabled');
	if($("#conceptsTab a").attr('class') != undefined && $("#conceptsTab a").attr('class').includes("active"))
		$('ul#myTabs').tabs('select_tab', ($("#myTabs li:not(.disabled) a")[0].getAttribute('href')).substr(1));

	$("#directPredicatesList").hide();
	$("#reversePredicatesList").hide();
	$('#predicatesSpinner').show();	
	$('#directPredicatesProgress').show();
	$('#reversePredicatesProgress').show();

	//boxFiller.updatePredicatesFromResult(resultUrl, resultDatatype, resultLang, resultPenninculo, predicatesLimit, renderPredicates);
	boxFiller.updatePredicates(renderPredicates);
}

//manage settings
function fillSettings(){
	//fillLabelLang();
	fillSystemLang();
	fillNumberOfConceptsAndPredicates();
}

/*
function fillLabelLang(){
	var labelLangSelect = $('#labelLangSelect');
	labelLangSelect.empty();

	$.each(labelLangList, function(langKey){
		var lang = labelLangList[langKey];
		var option = $("<option/>")
			.attr('value', lang.langCode)
			.text(lang.langCode)
			.appendTo(labelLangSelect);
	});

	$('#labelLangSelect option[value="'+labelLang+'"]').attr('selected', 'selected');

	$('#labelLangSelect').material_select();
}
*/
function fillSystemLang(){
	var systemLangSelect = $('#systemLangSelect');
	systemLangSelect.empty();

	$.each(systemLangList, function(langKey){
		var lang = systemLangList[langKey];
		var option = $("<option/>")
			.attr('value', lang.langCode)
			.text(lang.langCode)
			.appendTo(systemLangSelect);
	});

	$('#systemLangSelect option[value="'+systemLang+'"]').attr('selected', 'selected');

	$('#systemLangSelect').material_select();
}

function fillNumberOfConceptsAndPredicates(){
	if(conceptsLimit)
		$('#numConcepts').attr('placeholder', conceptsLimit);
	if(predicatesLimit)
		$('#numPredicates').attr('placeholder', predicatesLimit);
}

/*
function changeLabelLanguage(){
	if(langAjaxRequest != null)
		langAjaxRequest.abort();

	labelLang = $('#labelLangSelect').find(":selected").val();
	
	restartBoxViewer();
	restartQueryViewer();
	restartOperatorViewer();
	restartTableResultViewer();

	mapCreator.labelLangChanged();
}*/

function setLimit(type){
	if(type == 'concept')
		conceptsLimit = $('#numConcepts').val();
	else if(type == 'predicate')
		predicatesLimit = $('#numPredicates').val();
}

function changeSystemLanguage(){
	languageManager = new LanguageManager($('#systemLangSelect').find(":selected").val());
	//salvare mappa e farne un clean delle verbalizzazioni per non perdere lo stato attuale
	restartBoxViewer();
	restartQueryViewer();
	restartOperatorViewer();
	restartTableResultViewer();

	mapCreator.systemLangChanged();
}

function hierarchyOff(){
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();
	$('#conceptsListBox').hide();

	$("#searchConceptsBox").val('');
	hierarchyOnFlag = false;
	$("#hierarchySpan").html('<i class="small material-icons white-text right" style="margin:0" onClick="hierarchyOn();">device_hub</i>');
	renderConcept(lastRootMap, lastMap);
}

function hierarchyOn(){
	$('#conceptsSpinner').show();
	$('#conceptsProgress').show();
	$('#conceptsListBox').hide();

	$("#searchConceptsBox").val('');
	hierarchyOnFlag = true;
	$("#hierarchySpan").html('<i class="small material-icons white-text right" style="margin:0" onClick="hierarchyOff();">format_list_bulleted</i>');
	renderConcept(lastRootMap, lastMap);
}

function fillHelp(){
	var helpUl = $('#helpUl');
	helpUl.empty();
	var helpContent = languageManager.getHelpGuide();

	for(var i = 0; i<helpContent.length; i++){

		var li = $('<li/>');

		var titleDiv = $('<div/>')
			.attr('class', 'collapsible-header')
			.html(helpContent[i].title)
			.appendTo(li);

		if(helpContent[i].content.length == 1){	
			var contentDiv = $('<div/>')
				.attr('class', 'collapsible-body')
				.html('<p>'+helpContent[i].content[0]+'</p>')
				.appendTo(li);
		}else{
			var contentDiv = $('<div/>')
				.attr('class', 'collapsible-body')
				.appendTo(li);

			var innerUl = $('<ul/>')
				.attr('class', 'collapsible')
				.appendTo(contentDiv);

			for(var j = 0; j < helpContent[i].content.length; j++){
				var innerLi = $('<li/>');

				var contentInnerHeader = $('<div/>')
					.attr('class', 'collapsible-header')
					.html(helpContent[i].title + " - " + (j+1))
					.appendTo(innerLi);

				var contentInnerDiv = $('<div/>')
					.attr('class', 'collapsible-body')
					.html('<p>'+helpContent[i].content[j]+'</p>')
					.appendTo(innerLi);

				innerLi.appendTo(innerUl);
				
			}
		}
		
		li.appendTo(helpUl);
	}
    $('.collapsible').collapsible();
}

//delete highlighted element in natural language query
function removeHighlightElements(keyToRemove){
	$('#resultsPreviewBadge').hide();
	$('#resultsTable').hide();
	$('#tableResultsSpinner').show();
	$('#tableResultsProgress').show();

	if(keyToRemove != 'undefined')
		mapCreator.removeElement(keyToRemove);
}

function setDefaultOrderTable(value){
	if(value[0].checked)
		toOrder = true;
	else toOrder = false;
}