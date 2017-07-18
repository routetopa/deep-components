function OData_Provider () {
}

OData_Provider.prototype.selectData = function(data) {
    return data.value;
};

OData_Provider.prototype.addLimit = function(url) {
    return url;
};