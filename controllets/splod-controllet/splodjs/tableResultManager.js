
var tableResultSelect;
var tableResultLabelSelect;
var tableResultResults;
var orderField;
var toOrder;
var ordered;

var TableResultManager = function () {
	if(TableResultManager.prototype._singletonInstance){
		return TableResultManager.prototype._singletonInstance;
	}
	TableResultManager.prototype._singletonInstance = this;

	tableResultSelect = [];
	tableResultLabelSelect = [];
	tableResultResults = [];
	toOrder = false;
	ordered = false;
};

TableResultManager.prototype.updateTable = function(select, labelSelect, results){
	tableResultSelect = select;
	tableResultLabelSelect =labelSelect;
	tableResultResults = results;
	ordered = false;
	if(toOrder)
		orderTable();

	renderResultTable(select, labelSelect, results);
}

TableResultManager.prototype.resetTable = function(){
	tableResultSelect = [];
	tableResultLabelSelect = [];
	tableResultResults = [];
	ordered = false;
	resetResultTable();
	resetFieldsList();
}

function orderTable(){
 	orderField = tableResultSelect[0].split('?')[1];
 	tableResultResults.sort(compareResults);
 	ordered = true;
}

function compareResults(a,b) {
	if (a[orderField].value < b[orderField].value)
		return -1;
	if (a[orderField].value > b[orderField].value)
	    return 1;
	return 0;
}

TableResultManager.prototype.orderAndRenderTable = function(){
	if(!ordered)
		orderTable();
	createTable(tableResultSelect, tableResultResults);
}

/*
TableResultManager.prototype.collapseTable = function(){
	//roba e poi create table 
	if(!ordered){
		orderField = tableResultSelect[0].split('?')[1];
 		tableResultResults.sort(compareResults);
	}
	
	var collapsedResults = [];


	for(var i = 0; i< tableResultResults.length; i++)
		var currentValue = tableResultResults[i][orderField].value;
		var currentObj = {};
		for(field in tableResultResults[i]){
			currentObj[field] = []
		}
		while(tableResultResults[i][orderField].value == currentValue){
			for(){

			}
			i++;
		}
	
	}

}
*/