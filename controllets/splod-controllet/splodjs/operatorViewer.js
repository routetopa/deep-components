
var operatorManager;
var languageManager;

function initOperatorViewer(){
	operatorManager = new OperatorManager;
	languageManager = new LanguageManager;

	$('#operatorsSpinner').hide();
	$('#operatorsProgress').hide();
	$('#operatorList').show();

	$("#operatorsTab").addClass('disabled');

}

function restartOperatorViewer(){
	operatorManager = new OperatorManager;
	languageManager = new LanguageManager;

	$('#operatorsSpinner').hide();
	$('#operatorsProgress').hide();
	$('#operatorList').show();

	$("#operatorsTab").addClass('disabled');
}

function renderResult(select, labelSelect, results){
	createTable(select, labelSelect, results);
}

function renderOperatorList(operators){

	$('#operatorsBox .card-title').hide();
	$('#searchReusableResultCard').hide();

	$('#rowUserValue').remove();

	$('#pendingQuerySpan').empty();
	var operatorList = $('#operatorList');
	operatorList.empty();
	$('#operatorList').show();
	$('#reusableResultList').hide();

	if(operators.length == 0){
		$("#operatorsTab").addClass('disabled');
		if($("#operatorsTab a").attr('class') != undefined && $("#operatorsTab a").attr('class').includes("active"))
			$('ul#myTabs').tabs('select_tab', ($("#myTabs li:not(.disabled) a")[0].getAttribute('href')).substr(1));
	}
	else
		$("#operatorsTab").removeClass('disabled');

	for(var i = 0; i<operators.length; i++){
		var datatypeOperators = operators[i];
		var datatype = datatypeOperators.datatype;
		var datatypeOperatorList = datatypeOperators.list;

		//datatype operator list title 
		if(datatype != null && datatypeOperatorList.length > 0){
			var li = $("<li/>")
				.attr('class', 'collection-item datatypeTitle')
				.attr('disabled','disabled')
				.html(languageManager.getDatatypeLabel(datatype))
				.appendTo(operatorList);
		}

		for(var j = 0; j<datatypeOperatorList.length;j++){

			var li = $("<li/>")
			.attr('class', 'collection-item addToQuery')
			.attr('meta-value', datatypeOperatorList[j])
			.attr('meta-datatype', datatype);

			if(datatypeOperatorList[j] == 'repeat'){
				//change with language  manager function
				var paramsString =JSON.stringify([datatypeOperators.repeatParameters[0],datatypeOperators.repeatParameters[1]]);
				li.html(datatypeOperators.repeatParameters[0] + ' ' + datatypeOperators.repeatParameters[2])
					.attr('meta-params', paramsString);
			}else{
				li.html(languageManager.getOperatorLabelVerbalization(datatypeOperatorList[j]));
			}

			li.appendTo(operatorList)
				.on('click', function(){
					var condition;
					if($(this).attr('meta-value') == 'repeat'){
						condition = operatorManager.selectedRepeat($(this).attr('meta-params'));
					}
					else{
						condition = operatorManager.selectedOperator($(this).attr('meta-value'), $(this).attr('meta-datatype'));
					}
					
					if(!condition){
						$("#operatorList").hide();
						$('#operatorsSpinner').show();
						$('#operatorsProgress').show();

						var reusableResults = operatorManager.getResultToCompleteOperator();
						renderReusableResultListFromOperator(reusableResults);
					}
					else{
						$("#operatorList").hide();
						$('#operatorsSpinner').show();
						$('#operatorsProgress').show();

						$("#resultsTable").hide();
						$("#resultsPreviewBadge").hide();
						$('#tableResultsSpinner').show();
						$('#tableResultsProgress').show();
					}
				});
				if(j == datatypeOperatorList.length-1)
					li.addClass('operatorListSeparator');
		}
	}

	/*$.each(operators, function(index){
		var element = operators[index];

		var li = $("<li/>")
		.attr('class', 'collection-item addToQuery')
		.attr('meta-value', element)
		.text(languageManager.getOperatorLabelVerbalization(element));

		li.appendTo(operatorList)
			.on('click', function(){
				if(!operatorManager.selectedOperator($(this).attr('meta-value'))){
					$('#operatorsSpinner').show();
					var reusableResults = operatorManager.getResultToCompleteOperator();
					renderReusableResultListFromOperator(reusableResults);
				}
				else{
					$('#tableResultSpinner').show();
				}
			});
	});*/

	$('#operatorsSpinner').hide();
	$('#operatorsProgress').hide();
	$("#operatorList").show();

}

function renderReusableResultListFromOperator(reusableResults){
	var onClickButtonFunction = function(){
					var values = [];
					values.push({value:$('#userValue_0')[0].value, penninculo:''});
					if($('#userValue_1')[0] != undefined)
						values.push({value: $('#userValue_1')[0].value, penninculo:''});

					if(operatorManager.selectedReusableResult(values, true)){
						//$('#reusableResultList').hide();
						//$('#operatorList').show();
						$('#pendingQuerySpan').empty();

						//$('#operatorsBox .card-title').hide();
						$('#resultsTable').hide();
						$('#resultsPreviewBadge').hide();
						$('#tableResultsSpinner').show();
						$('#tableResultsProgress').show();
						
						$('#operatorsSpinner').show();
						$('#operatorsProgress').show();
						$('#reusableResultList').hide();
						$('#rowUserValue').remove();
						$('#searchReusableResultCard').hide();
						$('#operatorsBox .card-title').hide();
					}else{
						$('#rowUserValue input').val('');
						renderPendingQuery();
					}

				}


	var onClickLiFunction = function(){
					var infoResult = {value: $(this).attr('meta-value'), penninculo : $(this).attr('meta-penninculo')};
					if(operatorManager.selectedReusableResult([infoResult], false)){
						//$('#reusableResultList').hide();
						//$('#operatorList').show();
						$('#pendingQuerySpan').empty();

						//$('#operatorsBox .card-title').hide();
						$('#resultsPreviewBadge').hide();
						$('#resultsTable').hide();
						$('#resultSpinner').show();
						$('#resultsProgress').show();

						$('#operatorsSpinner').show();
						$('#operatorsProgress').show();
						$('#reusableResultList').hide();
						$('#rowUserValue').remove();
						$('#searchReusableResultCard').hide();
						$('#operatorsBox .card-title').hide();

					}else{
						$('#rowUserValue input').val('');
						renderPendingQuery();
					}
				}

	$('#operatorsBox .card-title').hide();
	$('#searchReusableResultCard').show();
	renderPendingQuery();
	renderReusableResultList(reusableResults, onClickButtonFunction, onClickLiFunction);
}

function renderReusableResultListFromResult(reusableResults){
	var onClickButtonFunction = function(){
					var values = [];
					values.push({value:$('#userValue_0')[0].value, penninculo:''});
					if($('#userValue_1')[0] != undefined)
						values.push({value:$('#userValue_1')[0].value, penninculo:''});


					$('#resultsTable').hide();
					$('#resultsPreviewBadge').hide();
					$('#tableResultsSpinner').show();
					$('#tableResultsProgress').show();
					
					$('#operatorsSpinner').show();
					$('#operatorsProgress').show();
					$('#reusableResultList').hide();
					$('#rowUserValue').remove();
					$('#searchReusableResultCard').hide();
					$('#operatorsBox .card-title').hide();

					operatorManager.changedReusableResult(values, true);
				}


	var onClickLiFunction = function(){
					$('#resultsTable').hide();
					$('#resultsPreviewBadge').hide();
					$('#tableResultsSpinner').show();
					$('#tableResultsProgress').show();
					
					$('#operatorsSpinner').show();
					$('#operatorsProgress').show();
					$('#reusableResultList').hide();
					$('#rowUserValue').remove();
					$('#searchReusableResultCard').hide();
					$('#operatorsBox .card-title').hide();

					operatorManager.changedReusableResult([{value:$(this).attr('meta-value'), penninculo:$(this).attr('meta-penninculo')}], false);
				}

	$('#operatorsBox .card-title').text(languageManager.getBoxTitle('result'));
	$('#operatorsBox .card-title').show();
	$('#searchReusableResultCard').show();
	//showHint(languageManager.getHintOperatorManager('reusableResult')+"<br>"+reusableResults.cachedQuery);
	renderReusableResultList(reusableResults, onClickButtonFunction, onClickLiFunction);
}

function renderReusableResultList(reusableResults, onClickButtonFunction, onClickLiFunction){

	var operatorList = $('#operatorList').hide();
	$("#searchReusableResultBox").val('');
	$('#searchReusableResultCard').show();

	var reusableResultList = $('#reusableResultList');
	reusableResultList.empty();
	reusableResultList.show();

	$('#rowUserValue').remove();

	$("#operatorsTab").removeClass('disabled');

	//renderPendingQuery();

	//user value
	var type = reusableResults.type;

	if(type != null){

		/*var userInput = $("<li/>")
			.attr('class', 'collection-item');*/

		var userInputDiv = $("<div/>")
			.attr('class', 'row')
			.attr('id', 'rowUserValue');
		//retrieve the type
		var inputClass;
		switch(type){
			case 'date' :
				inputClass = ['datepicker'];
				break;
			case 'time' :
				inputClass = ['timepicker'];
				break;
			case 'dateTime' :
				inputClass = ['datepicker', 'timepicker'];
				break;
			case 'text' :
				inputClass = ['text'];
				break;
			case 'number' :
				inputClass = ['number'];
				break;
		}

		if(type=='number'){
			var div = $('<div/>')
				.attr('class', 'input-field userValueDiv col s5 m5 l5');

			var input = $("<input/>")
				.attr('type', 'number')
				.attr('class', 'userValue')
				.attr('id', 'userValue_0');

			var label = $('<label/>')
				.attr('for', 'userValue_0')
				.text(languageManager.getUserInputHint());

			
			input.appendTo(div);
			label.appendTo(div);

			div.appendTo(userInputDiv);
		}
		else{
			for(var i = 0; i<inputClass.length; i++){

				var div = $('<div/>')
					.attr('class', 'input-field userValueDiv col s5 m5 l5');

				var input = $("<input/>")
					.attr('type', 'text')
					.attr('class', inputClass[i]+' userValue')
					.attr('id', 'userValue_'+[i]);

				var label = $('<label/>')
					.attr('for', 'userValue_'+[i])
					.text(languageManager.getUserInputHint());

				
				input.appendTo(div);
				label.appendTo(div);

				div.appendTo(userInputDiv);
			}
		}

		var button = $('<i/>')
			.attr('class', 'small material-icons blue-text col s1 m1 l1')
			.attr('id', 'userValueButton')
			.attr('title', languageManager.getButtonLabel('confirmUserInput'))
			.text('check_circle')
			.on('click', onClickButtonFunction);

		button.appendTo(userInputDiv);
		userInputDiv.insertBefore($('#contentOperatorBox'));
		//userInputDiv.appendTo(userInput);
		//userInput.appendTo(reusableResultList);

		$('input.number').on('keypress', function(evt){
			var charCode = (evt.which) ? evt.which : event.keyCode;
		    if (charCode > 31 && (charCode < 48 || charCode > 57))
		        return false;
		    return true;
		});

		$('.datepicker').pickadate({
			selectMonths: true,
			selectYears: 100,
			today: 'Today',
			clear: 'Clear',
			close: 'OK',
			closeOnSelect: true,
			format: 'yyyy-mm-dd'
		});

		$('.timepicker').pickatime({
		    default: 'now', // Set default time: 'now', '1:30AM', '16:30'
		    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
		    twelvehour: true, // Use AM/PM or 24-hour format
		    donetext: 'OK', // text for done-button
		    cleartext: 'Clear', // text for clear-button
		    canceltext: 'Cancel', // Text for cancel-button
		    autoclose: true, // automatic close timepicker
		    ampmclickable: true, // make AM PM clickable
		  });

	}

	var collapsibleBody;
	var expandableIcon;

	for(var resultsIndex = 0; resultsIndex<reusableResults.results.length; resultsIndex++){
		if(reusableResults.results[resultsIndex] && reusableResults.results[resultsIndex].length>0){
			var li = $("<li/>")
			.attr('class', 'collection-item withMargin reusableResultTitle')
			.appendTo(reusableResultList)
			.on('click', function(e){
				e.stopPropagation();
				if($(this).next().is(':visible')){
					$(this).next().hide();
					$(this).children()[0].innerHTML = 'expand_more';
				}
				else{
					$(this).next().show();
					$(this).children()[0].innerHTML = 'expand_less';
				}
			});

			expandableIcon = $("<i/>")
				.attr('class', 'tiny material-icons grey-text expandIcon')
				.html('expand_more')
				.appendTo(li);

			var span = $("<span/>")
				.attr('class', 'liContent')
				.html(languageManager.getReusableResultListTitle(resultsIndex))
				.css('margin-left', '0.5em')
				.appendTo(li);
			
			collapsibleBody = $("<div/>")
				.attr('class', 'myCollapsibleBody')
				.appendTo(reusableResultList);

			collapsibleBody.hide();

			$.each(reusableResults.results[resultsIndex], function(index){
				var element = reusableResults.results[resultsIndex][index];

				var li = $("<li/>")
				.attr('class', 'collection-item addToQuery')
				.attr('meta-label', element.value)
				.attr('meta-value', element.value)
				.attr('meta-penninculo', element.penninculo);

				var span = $("<span/>")
					.attr('class', 'liContent')
					.text(element.value)
					.appendTo(li);

				if('url' in element){
					li.attr('meta-url', element.url)
						.attr('meta-value', element.url)
						.attr('title', element.url);
				}

				var badge = $("<span/>")
					.attr('class', 'new badge')
					.attr('data-badge-caption', '')
					.text(element.occurrences)
					.appendTo(li);

				li.appendTo(collapsibleBody)
					.on('click', onClickLiFunction);
			});
		}
	}

	collapsibleBody.show();
	expandableIcon.html('expand_less');

	$('#operatorsSpinner').hide();
	$('#operatorsProgress').hide();

}

function renderPendingQuery(){

	$('#pendingQuerySpan').empty();

	var pendingQueryFields = operatorManager.getPendingQueryFields();

	var pendingQuery = $("<div/>");

	//on focus elem
	var chip = $("<div/>")
		.attr('class', 'chip')
		.text(pendingQueryFields[0])
		.appendTo(pendingQuery);

	//operator elem
	chip = $("<div/>")
		.attr('class', 'chip')
		.html(languageManager.getOperatorLabelVerbalization(pendingQueryFields[1]));

	var discardButton = $('<i/>')
		.attr('class', 'material-icons close')
		.attr('id', 'discardButton')
		.attr('title', languageManager.getButtonLabel('discardButton'))
		.text('close')
		.on('click', function(){
			operatorManager.discardOperator();
			$('#pendingQuerySpan').empty();
			$('#rowUserValue').remove();
			$('#searchReusableResultCard').hide();
			$('#operatorList').show();
			$('#operatorsBox .card-title').hide();
			$('#reusableResultList').hide();
		});
	discardButton.appendTo(chip);

	chip.appendTo(pendingQuery);

	for(var i = 2; i<pendingQueryFields.length; i++){
		if(pendingQueryFields[i] != ' '){
			var toComplete = $("<div/>")
				.attr('class', 'chip')
				.text(pendingQueryFields[i]);
		}else{
			var toComplete = $("<div/>")
			.html(languageManager.getOperatorFieldVerbalization(i-1))
			.attr('class', 'fieldToComplete chip');
		}
		toComplete.appendTo(pendingQuery);
	}

	pendingQuery.appendTo($('#pendingQuerySpan'));

	var toHightlight = $('#pendingQuerySpan .fieldToComplete:first');
	toHightlight.attr('class', toHightlight.attr('class') + ' active');
	
}