/*
@license
    The MIT License (MIT)

    Copyright (c) 2015 Dipartimento di Informatica - Universit� di Salerno - Italy

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

/**
 * Developed by :
 * ROUTE-TO-PA Project - grant No 645860. - www.routetopa.eu
 *
*/


var AjaxJsonAlasqlBehavior = {

    properties: {

        /**
         * It contains the json data from async xhr call returned from core-ajax core component
         *
         * @attribute json_results
         * @type object
         * @default 'null'.
         */
        json_results: {
            type: Object,
            value: {}
        }

    },

    /**
     * Make an AJAX call to the dataset URL
     *
     * @method requestData
     */
    requestData: function(){

        var comp = this;

        $.ajax({
            url: this._component.dataUrl,
            dataType: "json",
            success: function(e){
                comp.handleResponse(e);
            }
        });
    },

    /**
     * Called when core-ajax component receive the json data from called url.
     *
     * @method handleResponse
     */
    handleResponse: function(e) {
        this.properties.json_results.value = e;
        this.runWorkcycle();
    },

    /**
     * selectData built a JSONPATH query based on the user selected fields then extract data from the JSON response.
     * This method built an objects <name, data> for every user selected field and push it into the data array.
     *
     * @method selectData
     */
    selectData : function() {
        this._component.fields = JSON.parse(this._component.fields);
        var provider = this._getProvider(this._component.fields[0]);

        var filters = JSON.parse(this._component.getAttribute("filters"));
        var aggregators = JSON.parse(this._component.getAttribute("aggregators"));
        var orders = JSON.parse(this._component.getAttribute("orders"));

        //preview my space
        if(filters && filters[0] && filters[0].constructor == Array){
            filters = filters[0];
            aggregators = aggregators[0];
            orders = orders[0];
        }

        var fields = [];
        for (var i=0; i < this._component.fields.length; i++)
            fields.push(this._fieldName(this._component.fields[i], provider));

        //jsdatachecker
        var _converter = new DataTypeConverter();
        var path2 = this._arrayPath(provider);
        var processingResult = _converter.inferJsonDataType(this.properties.json_results.value, path2);
        var processingResults = _converter.convert(processingResult);
        var jsonData = [processingResults.dataset];

        //WHERE
        var where = "";
        if(filters && filters.length) {

            for (var i=0; i < filters.length; i++)
                filters[i]["field"] = this._fieldName(filters[i]["field"], provider);

            where = "WHERE ";
            for (var i=0; i < filters.length; i++) {
                if(filters[i]["operation"] == "contains")
                    where += filters[i]["field"] + " like '%" + filters[i]["value"] + "%' AND ";
                else if(filters[i]["operation"] == "not contains")
                    where += filters[i]["field"] + " not like '%" + filters[i]["value"] + "%' AND ";
                else if(filters[i]["operation"] == "start")
                    where += filters[i]["field"] + " like '" + filters[i]["value"] + "%' AND ";
                else if(filters[i]["operation"] == "ends")
                    where += filters[i]["field"] + " like '%" + filters[i]["value"] + "' AND ";
                else
                    where += filters[i]["field"] + " " + filters[i]["operation"] + " " + filters[i]["value"] + " AND ";
            }
            where = where.slice(0, -5);
        }

        //ORDER BY
        var orderBy = "";
        if(orders && orders.length) {

            for (var i=0; i < orders.length; i++)
                orders[i]["field"] = this._fieldName(orders[i]["field"], "");

            orderBy = "ORDER BY ";
            for (var i = 0; i < orders.length; i++)
                orderBy += orders[i]["field"] + " " + orders[i]["operation"] + ", ";
            orderBy = orderBy.slice(0, -2);
        }

        //SELECT
        var pureSelect = "SELECT ";
        for (var i = 0; i < fields.length; i++)
            pureSelect += fields[i] + " as " + this._fieldName(this._component.fields[i], "") + ", ";
        pureSelect = pureSelect.slice(0, -2);

        //GROUP BY
        var groupBy = "";
        var select = "";
        if(aggregators && aggregators.length) {

            for (var i=0; i < aggregators.length; i++)
                aggregators[i]["field"] = this._fieldName(aggregators[i]["field"], "");

            groupBy = "GROUP BY " + aggregators[0]["field"];
            select = "SELECT "  + aggregators[0]["field"];
            for (var i = 1; i < aggregators.length; i++)
                select += ", " + aggregators[i]["operation"] + "(" + aggregators[i]["field"] + ") as " + aggregators[i]["field"];

            if(aggregators[1] && aggregators[1]["operation"] == "GROUP BY") {
                groupBy = "GROUP BY " + aggregators[0]["field"] + ", " + aggregators[1]["field"];
                select = "SELECT "  + aggregators[0]["field"] + ", " + aggregators[1]["field"];
                for (var i = 2; i < aggregators.length; i++)
                    select += ", " + aggregators[i]["operation"] + "(" + aggregators[i]["field"] + ") as " + aggregators[i]["field"];
            }
        }

        //QUERY
        var path = this._path(this._component.fields[0], provider);
        var query;

        query = "SELECT "+ path +" FROM ?";
        //console.log(query);
        var res = alasql(query, [jsonData]);

        var records = res[0][path];

        query = pureSelect + " FROM ? " + where  + " " + orderBy;
        //console.log(query);
        var obj = alasql(query, [records]);

        if (groupBy != "") {
            query = select + " FROM ? " + groupBy + " " + orderBy;
            //console.log(query);
            obj = alasql(query, [obj]);
        }

        //PUSH DATA
        if(!obj || obj.length == 0)
            this.data = []
        else
            this._pushData(obj, fields);

        this._deleteWaitImage();
    },

    _pushData : function(obj, keys) {
        this.data = [];

        if (typeof keys == 'undefined')
            keys = Object.keys(obj[0]);

        for (var key in keys){

            var name = keys[key].replace(/(\[|\]|fields->)/g, "");
            var data = [];

            for (var i in obj) {
                var v = obj[i][name];
                if(!isNaN(v) && v % 1 != 0)
                    v = Math.floor(v * 100) / 100;
                data.push(v);

                //data.push(obj[i][name]);
            }

            this.data.push({
                name: name,
                data: data
            });
        }
    },

    _getProvider : function(field) {
        if(field.indexOf("result,records") > -1)
            return "ckan";
        else if(field.indexOf("records,fields") > -1)
            return "openDataSoft";
        else
            return "provider";
    },

    _fieldName : function(field, provider) {
        if(provider.indexOf("ckan") > -1) {
            return "[" + field.substring(field.lastIndexOf(",") + 1, field.length) + "]";
        }
        else if(provider.indexOf("openDataSoft") > -1) {
            return "fields->[" + field.substring(field.lastIndexOf(",") + 1, field.length)+ "]";
        }
        else {
            return "[" + field.substring(field.lastIndexOf(",") + 1, field.length) + "]";
        }
    },

    _path : function(field, provider) {
        if(provider.indexOf("ckan") > -1) {
            return "result->records"
        }
        else if(provider.indexOf("openDataSoft") > -1) {
            return "records";
        }
        else {
            return field.substring(0, field.lastIndexOf(",")).replace(",", "->");
        }
    },

    _arrayPath : function(provider) {
        if(provider.indexOf("ckan") > -1) {
            return ["result", "records", "*"];
        }
        else if(provider.indexOf("openDataSoft") > -1) {
            return ["records", "fields", "*"];
        }
        else {
            return ["*"];
        }
    },

    /**
     * Delete a image after loading a datalet
     */
    _deleteWaitImage : function() {
        $("img[src$='spin.svg']").remove();
    }

};