function openDataSoft_Provider () {}

openDataSoft_Provider.prototype.selectData = function(data) {
    var selectedData = [];
    for(var i=0; i<data.records.length; i++) {
        if(data.records[i].geometry)
            data.records[i].fields["geometry"] = data.records[i].geometry;
        selectedData.push(data.records[i].fields);
    }
    return selectedData;
};

openDataSoft_Provider.prototype.addLimit = function(url) {
    if(url.indexOf("&rows=") > -1)
        return url;
    return url + "&rows=10000";
};

//openDataSoft_Provider.prototype.getFields = function(data) {
//    var fields = [];
//    for (var key in data.records[0].fields)
//        fields.push(key);
//    return fields;
//};