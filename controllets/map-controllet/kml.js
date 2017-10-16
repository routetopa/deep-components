function KML_Provider() { //--> dataUrl inutile
    //this.dataUrl = dataUrl;
    //this.path = "result->records";
    //this.arrayPath = ["result", "records", "*"];
    this.isOGC = true;
    this.isKML = true;
    this.Format = 'KML';
}

KML_Provider.prototype.addLimit = function (url) {
    return url;
};

KML_Provider.prototype.getHTMLFormattedMetadata = function (detail) {
    var html = '';
    var ds = detail.dataset;
    var info = detail.info;
    if (ds && info) {
        html += '<b>Resource Name:</b> <b style="color: #2196F3;">' + (ds.rsTitle || ds.dsTitle) + '</b><br>';
        html += '<div style="height: 1px; background: #2196F3; margin: 12px 0;"></div>';

        html += '<b>Geometry Type:</b> ' + info.geometryType + '<br>';
        html += '<b>Features Count:</b> ' + info.featuresCount + '<br>';
        html += '<b>Properties length:</b> ' + info.propertiesName.length + '<br>';

        var properties = [];
        for (p in info.propertiesName) properties.push(info.propertiesName[p]);

        html += '<b>Properties:</b> ' + properties.join(' , ') + '<br>';
    }
    return html;
};

KML_Provider.prototype.getDatasetUrl = function (providerUrl) {
    return providerUrl;
};
