function istat_Provider () {
}

istat_Provider.prototype.selectData = function(data) {
    data =  data.results.bindings;
    var row;
    for(var i_row in data) {
        row = data[i_row];
        for(var value in row) {
            row[value] = row[value]["value"]
            // console.log(row[value]);
        }
    }
    return data;
};

istat_Provider.prototype.addLimit = function(url) {
    return url;
};