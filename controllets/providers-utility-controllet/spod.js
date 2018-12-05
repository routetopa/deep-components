function SPOD_Provider () {
}

SPOD_Provider.prototype.selectData = function(data) {
    return data.records;
};

SPOD_Provider.prototype.addLimit = function(url) {
    return url;
};

SPOD_Provider.prototype.getHTMLFormattedMetadata = function(dataset, resourceIndex) {
    var html = '';
    var userLang = navigator.language || navigator.userLanguage;

    var users = dataset.users;
    var metas = JSON.parse(dataset.metas);


    html += '<b>' + ln["room_" + ln["localization"]] + ':</b>' + dataset.roomName + '<br>';
    html += '<b>' + ln["resourceName_" + ln["localization"]] + ':</b> <b style="color: #2196F3;">' + ((metas.title) ? metas.title : "") + '</b><br>';
    html += '<b>' + ln["resourceDescription_" + ln["localization"]] + ':</b>' + ((metas.description) ? metas.description : "") + '</b><br>';

    html += '<b>' + ln["users_" + ln["localization"]] + ':</b> <div class="user_icons" style="display: flex; flex-direction: row;">';

    for(var j in users) {
        html += '<a href="' + users[j].href + '">';
        html += '<div class="user_icon" style="background-image: url(' + users[j].src + '); background-size: 40px 40px; height:40px; width:40px; border-radius: 50%; cursor: pointer; margin-right: 12px;" title="' + users[j].user + '"></div>';
        html += '</a>';

    }
    html += '</div>';

    html += '<div style="height: 1px; background: #2196F3; margin: 12px 0;"></div>';

    // for(var i in metas)
    //     html += '<b>' + i + ':</b> ' + metas[i] + '<br>';

    filters = ["title", "description"];

    var orderedKeys = Object.keys(metas).sort()

    for(var i in orderedKeys) {
        var key = orderedKeys[i];
        var value = metas[key];
        if (value != null && value != undefined && String(value).trim() != "" && typeof(value) != 'object' && $.inArray(key, filters) == -1)
            html += '<b>' + key + ':</b> ' + value + '<br>';
    }

    return html;
};

SPOD_Provider.prototype.getDatasetUrl = function(providerUrl, datasetId) {
    return parent.ODE.ow_url_home + 'cocreation/ajax/get-dataset-by-id?id=' + datasetId;
};

SPOD_Provider.prototype.getResourceUrl = function(providerUrl, dataset, resourceIndex, datasetId)
{
    // "http://172.16.15.128/cocreation/ajax/get-dataset-by-room-id-and-version/?room_id=7&version=3"
   // return '/cocreation/ajax/get-dataset-by-room-id-and-version/?room_id=' + roomId + '&version=' + version;

    if (dataset.resourceUrl)
        return dataset.resourceUrl;

    return;
};