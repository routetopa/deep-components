var systemLang = 'en';

var LanguageManager = function (lang) {
	if(lang && systemLang != lang){

		systemLang = lang;
		LanguageManager.prototype._singletonInstance = new (eval(systemLang+'LanguageManager'))();
		
	}else{

		if(LanguageManager.prototype._singletonInstance){
			return LanguageManager.prototype._singletonInstance;
		}
		LanguageManager.prototype._singletonInstance = new (eval(systemLang+'LanguageManager'))();

	}

};
