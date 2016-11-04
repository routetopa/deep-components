function eurostat_Provider () {}

eurostat_Provider.prototype.selectData = function(data) {
    return JSONstat(data).Dataset( 0 ).toTable( { type : "arrobj" });
};

eurostat_Provider.prototype.addLimit = function(url) {
    return url;
};