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
        var jsonData = [this.properties.json_results.value];

        this._component.fields = JSON.parse(this._component.fields);

        var filters = JSON.parse(this._component.getAttribute("filters"));
        var aggregators = JSON.parse(this._component.getAttribute("aggregators"));
        var orders = JSON.parse(this._component.getAttribute("orders"));

        //preview my space
        if(filters[0] && filters[0].constructor == Array){
            filters = filters[0];
            aggregators = aggregators[0];
            orders = orders[0];
        }

        var provider = this._getProvider(this._component.fields[0]);

        var path = this._path(this._component.fields[0], provider);

        var fields = [];
        for (var i=0; i < this._component.fields.length; i++)
            fields.push(this._fieldName(this._component.fields[i], provider));

        //WHERE
        var where = "";
        if(filters && filters.length) {

            for (var i=0; i < filters.length; i++)
                filters[i]["field"] = this._fieldName(filters[i]["field"], provider);

            where = "WHERE ";
            for (var i=0; i < filters.length; i++) {
                if(filters[i]["operation"] == "contains")
                    where += filters[i]["field"] + " like '%" + filters[i]["value"] + "%' AND ";
                else if(filters[i]["operation"] == "start")
                    where += filters[i]["field"] + " like '" + filters[i]["value"] + "%' AND ";
                else if(filters[i]["operation"] == "ends")
                    where += filters[i]["field"] + " like '%" + filters[i]["value"] + "' AND ";
                else
                    where += filters[i]["field"] + " " + filters[i]["operation"] + " " + filters[i]["value"] + " AND ";
            }
            where = where.slice(0, -5);
        }

        provider="";

        //ORDER BY
        var orderBy = "";
        if(orders && orders.length) {

            for (var i=0; i < orders.length; i++)
                orders[i]["field"] = this._fieldName(orders[i]["field"], provider);

            orderBy = "ORDER BY ";
            for (var i = 0; i < orders.length; i++)
                orderBy += orders[i]["field"] + " " + orders[i]["operation"] + ", ";
            orderBy = orderBy.slice(0, -2);
        }

        //SELECT
        var select = "SELECT ";
        for (var i = 0; i < fields.length; i++)
            select += fields[i] + " as " + this._fieldName(this._component.fields[i], "") + ", ";
        select = select.slice(0, -2);

        var pureSelect = select;

        /**/
        var res = alasql("SELECT "+ path +" FROM ?", [jsonData]);
        var records = res[0][path];
        var obj = alasql(pureSelect + " FROM ?", [records]);
        //console.log(obj);

        var select = "SELECT ";
        for (var i = 0; i < fields.length; i++) {
            var key = Object.keys(obj[0])[i];
            var v = obj[0][key];
            if (!isNaN(v))
                select += fields[i] + "::NUMBER as " + this._fieldName(this._component.fields[i], "") + ", ";
            else
                select += fields[i] + " as " + this._fieldName(this._component.fields[i], "") + ", ";
        }
        select = select.slice(0, -2);

        var pureSelect = select;
        /**/

        //GROUP BY
        var groupBy = "";
        if(aggregators && aggregators.length) {

            for (var i=0; i < aggregators.length; i++)
                aggregators[i]["field"] = this._fieldName(aggregators[i]["field"], provider);

            groupBy = "GROUP BY " + aggregators[0]["field"];
            select = "SELECT "  + aggregators[0]["field"];
            for (var i = 1; i < aggregators.length; i++)
                select += ", " + aggregators[i]["operation"] + "(" + aggregators[i]["field"] + ") as " + aggregators[i]["field"];
        }

        //QUERY
        console.log('SELECT '+ path +' FROM ?');
        var res = alasql("SELECT "+ path +" FROM ?", [jsonData]);

        var records = res[0][path];

        //console.log(select + ' FROM ? ' + where + ' ' + groupBy + ' ' + orderBy + '');
        //var obj = alasql(select + " FROM ? " + where + " " + groupBy + " " + orderBy + "", [records]);

        console.log(pureSelect + ' FROM ? ' + where);
        var obj = alasql(pureSelect + " FROM ? " + where, [records]);

        if (groupBy != "") {
            console.log(select + ' FROM ? ' + groupBy + ' ' + orderBy + '');
            var obj = alasql(select + " FROM ? " + groupBy + " " + orderBy + "", [obj]);
        }

        //PUSH DATA
        if(!obj || obj.length == 0)
            this.data = []
        else
            this._pushData(obj);

        this._deleteWaitImage();
    },

    _pushData : function(obj) {
        this.data = [];

        for (var key in Object.keys(obj[0])){

            var name = Object.keys(obj[0])[key];
            var data = [];
            var value;

            for (var i in obj) {
                data.push(obj[i][name]);
                //value = obj[i][name];
                //if(!isNaN(value) && value != "")
                //    value = parseFloat(obj[i][name]);
                //data.push(value);
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
            return "fields->["+field.substring(field.lastIndexOf(",")+1, field.length)+"]";
        }
        else {
            return "["+field.substring(field.lastIndexOf(",")+1, field.length)+"]";
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

    /**
     * Delete a image after loading a datalet
     */
    _deleteWaitImage : function() {
        $("img[src$='spin.svg']").remove();
    }

};