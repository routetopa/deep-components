function openDataSoft_Provider (url) {
    this.url = url;
    this.path = "result->records";
}

openDataSoft_Provider.prototype.getData = function() {
    return 'openDataSoft';
};