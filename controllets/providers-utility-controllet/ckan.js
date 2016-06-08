function ckan_Provider () { //--> dataUrl inutile
    //this.dataUrl = dataUrl;
    //this.path = "result->records";
    //this.arrayPath = ["result", "records", "*"];
}

ckan_Provider.prototype.selectData = function(data) {
    return data.result.records;
};

ckan_Provider.prototype.addLimit = function(url) {
    if(url.indexOf("&limit=") > -1)
        return url;
    return url + "&limit=99999";
};

//ckan_Provider.prototype.getFields = function(data) {
//    var fields = [];
//    for (var key in data.result.records[0])
//        fields.push(key);
//    return fields;
//};

//ckan_Provider.prototype.requestData = function() {
//    var that = this;
//
//    $.ajax({
//        url: this.dataUrl,
//        dataType: "json",
//        success: function(data){
//            that.data = data.result.records;
//        }
//    });
//};