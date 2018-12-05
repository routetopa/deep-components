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

ckan_Provider.prototype.getHTMLFormattedMetadata = function(dataset, resourceIndex) {
    dataset = dataset.result;

    var html = '';

    html += '<b>Resource Name:</b> <b style="color: #2196F3;">' + dataset.resources[resourceIndex].name + '</b><br>';
    html += '<b>Resource Description:</b> ' + dataset.resources[resourceIndex].description + '</b><div style="height: 1px; background: #2196F3; margin: 12px 0;"></div>';

    html += '<b>Organization:</b> ' + ((dataset.organization) ? dataset.organization.name : "") + '<br>';
    html += '<b>Dataset Name:</b> ' + dataset.name + '<br>';
    html += '<b>Dataset Title:</b> ' + dataset.title + '<div style="height: 1px; background: #2196F3; margin: 12px 0;"></div>';
    // html += '<b>Resource Name:</b> <b style="color: #F44336;">' + dataset.resources[resourceIndex].name + '</b><div style="height: 1px; background: #F44336; margin: 12px 0;"></div>';
    // html += '<b>Resource Description:</b> ' + dataset.resources[resourceIndex].description + '</b><div style="height: 1px; background: #F44336; margin: 12px 0;"></div>';

    filters = ["id", "creator_user_id", "license_id", "owner_org", "revision_id", "name", "title", "notes", "num_resources", "num_tags", "state", "type"];

    var orderedKeys = Object.keys(dataset).sort();

    for(var i in orderedKeys) {
        var key = orderedKeys[i];
        var value = dataset[key];
        if (value != null && value != undefined && String(value).trim() != "" && typeof(value) != 'object' && $.inArray(key, filters) == -1)
            html += '<b>' + key + ':</b> ' + value + '<br>';
    }

    return html;
};

ckan_Provider.prototype.getDatasetUrl = function(providerUrl, datasetId) {
    return providerUrl + '/api/3/action/package_show?id=' + datasetId;
};

ckan_Provider.prototype.getResourceUrl = function(providerUrl, dataset, resourceIndex, datasetId)
{
    if (dataset.resourceUrl)
        return dataset.resourceUrl;

    var resourceId = (dataset.result) ? dataset.result.resources[resourceIndex].id : datasetId;
    return providerUrl + '/api/3/action/datastore_search?resource_id=' + resourceId;

};