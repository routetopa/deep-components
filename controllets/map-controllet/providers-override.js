providerFactory.getProvider = function (dataUrl) {
    if (dataUrl.indexOf("datastore_search?resource_id") > -1)
        return new ckan_Provider();
    else if (dataUrl.indexOf("search.json&resource_id") > -1)
        return new dkan_Provider();
    else if (dataUrl.indexOf("search?dataset") > -1 || dataUrl.indexOf("search/?dataset") > -1)
        return new openDataSoft_Provider();
    else if (dataUrl.indexOf("eurostat") > -1)
        return new eurostat_Provider();
    else if (dataUrl.indexOf("datiopen.istat.it") > -1)
        return new istat_Provider();
    else if (dataUrl.indexOf("ODataApi") > -1)
        return new OData_Provider();
    else if (dataUrl.indexOf("sparql?") > -1 )
        return new SPARQL_Provider();
    else if (dataUrl.indexOf("get-dataset-by-room-id-and-version") > -1 )
        return new SPOD_Provider();
    else if (dataUrl.search(/\Wwms\W?/gi) > -1)
        return new WMS_Provider();
    else if (dataUrl.search(/\Wkml\W?/gi) > -1)
        return new KML_Provider();
    else if (dataUrl.search(/\Wjson|geojson\W?/gi) > -1)
        return new KML_Provider();
    else
        return new generic_Provider();//dkan and mysir --> ckan like
};

providerFactory.getProviderByType = function (provider_type) {
    if (provider_type == "CKAN")
        return new ckan_Provider();
    else if (provider_type == "DKAN")
        return new dkan_Provider();
    else if (provider_type == "ODS")
        return new openDataSoft_Provider();
    else if (provider_type == "SPOD")
        return new SPOD_Provider();
    else if (provider_type.toUpperCase() == "WMS")
        return new WMS_Provider();
    else if (provider_type.toUpperCase() == "KML")
        return new KML_Provider();
    else if (provider_type.toUpperCase() == "GEOJSON")
        return new GEOJSON_Provider();
    else
        return null;
};
