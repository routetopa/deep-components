//function _path() {
//    return "result->records"
//}
//
//function _arrayPath() {
//    return ["result", "records", "*"];
//}

function ckan_Provider (url) {
    this.url = url;
    this.path = "result->records";
}

ckan_Provider.prototype.getData = function() {
    console.log("ckan");
    return 'ckan';
};