

function createLabel(url){
	var languageManager = new LanguageManager();

	var label = '';

	var splittedParts = url.split('/')
	label = splittedParts[splittedParts.length-1];

	splittedParts = label.split('#')
	label = splittedParts[splittedParts.length-1];	

	label = label.replace(/\_/g, " ");

	var tempLabel = label.toLowerCase();
	if(tempLabel in languageManager.labels)
		label = languageManager.labels[tempLabel];
	/*else
		console.log(label);*/

	return label;
}

function createLongerLabel(url, number){
	var label = '';

	url = url.replace(/\#/g, "/");

	var splittedParts = url.split('/')
	for(var i=number; i>=0; i--){
		label += splittedParts[splittedParts.length-1-i];
		if(i!=0)
			label += '-';
	}

	//label = label.replace(/\#/g, "-");
	label = label.replace(/\_/g, "-");

	return label;
}