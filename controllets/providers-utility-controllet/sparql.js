function SPARQL_Provider () {
}

SPARQL_Provider.prototype.selectData = function(data) {
    return createJsonOutput(data.results.bindings);
};

function createJsonOutput(results)
{
    var recordsObj = [];

    $.each(results, function(index){
        var element = results[index];

        var newElement = {};

        for(var field in element) {

            var label = field.replace('_', " ");

            let url = element[field].value;

            newElement[label] = url.substring(url.lastIndexOf("/")+1, url.length).replace("_", " ");
            newElement[label+' url'] = url;
/*            if('url' in element[field]){
                if(!isImage(element[field].url))
                    newElement[label+' url'] = element[field].url;
                else
                    newElement[label] = element[field].url;
            }
            if('xml:lang' in element[field]){
                newElement[label+' lang'] = element[field]['xml:lang'];
            }*/
        }

        recordsObj.push(newElement);
    });

    return recordsObj;
}

function isImage(url){
    return ((url.toLowerCase()).match(/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png|svg)/)!=null);
}