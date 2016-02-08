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
     * Check if input field(passed as an array of separated value that mach with field path in received object) is an array of objet.
     * The field is checked on current json object retrieved from the async request.
     *
     * @param field
     */
    isFieldArray : function(field){
       if(field.length == 0) return false;

       var obj = this.properties.json_results.value[field[0]];
       for(var i=1; i < field.length; i++){
          obj = (obj.constructor == Array) ? obj[0][field[i]] : obj[field[i]];
       }

       if(obj == null) return false;
       return (obj.constructor === Array && obj[0].constructor == Object) ? true : false;
    },

    /**
     * selectData built a JSONPATH query based on the user selected fields then extract data from the JSON response.
     * This method built an objects <name, data> for every user selected field and push it into the data array.
     *
     * @method selectData
     */
    selectData : function() {

        this.data = [];

        this._component.fields = JSON.parse(this._component.fields);

        var jsonData = [this.properties.json_results.value];

        var res = alasql('SELECT result->records FROM ?', [jsonData]);

        var records = res[0]["result->records"];

        var obj = alasql('SELECT Lat, COUNT(Lng) as CLng \
        FROM ? \
        WHERE Lat >= 53.298164\
        GROUP BY Lat \
        ORDER BY Lng ASC', [records]);
        console.log(obj);
        console.log(JSON.stringify(obj));

        this.pushData(obj);

        //var jsonArray = [
        //    { "user": { "id": 100, "screen_name": "pippo" }, "text": "bla bla" , "num": 5},
        //    { "user": { "id": 130, "screen_name": "pippo" }, "text": "gigggggggggginho", "num": 2 },
        //    { "user": { "id": 155, "screen_name": "ciao" }, "text": "kabushiki kaisha", "num": 44 },
        //    { "user": { "id": 301, "screen_name": "wow" }, "text": "halo reach", "num": 51 }
        //];
        //
        //var data=[
        //    { "category" : "Search Engines", "hits" : 5, "bytes" : 50189 },
        //    { "category" : "Content Server", "hits" : 10, "bytes" : 17308 },
        //    { "category" : "Content Server", "hits" : 1, "bytes" : 47412 },
        //    { "category" : "Search Engines", "hits" : 1, "bytes" : 7601 },
        //    { "category" : "Business", "hits" : 1, "bytes" : 2847 },
        //    { "category" : "Content Server", "hits" : 1, "bytes" : 24210 },
        //    { "category" : "Internet Services", "hits" : 1, "bytes" : 3690 },
        //    { "category" : "Search Engines", "hits" : 6, "bytes" : 613036 },
        //    { "category" : "Search Engines", "hits" : 1, "bytes" : 2858 }
        //];
        //
        //var res = alasql('SELECT category, sum(hits) AS hits, sum(bytes) as bytes \
        //FROM ? \
        //GROUP BY category \
        //ORDER BY bytes DESC',[data]);
        //
        //
        //var res = alasql('SELECT user->screen_name as name, user->id as id, text, num \
        //FROM ? ORDER BY num DESC', [jsonArray]);

        //jsonPath

            //for (var i = 0; i < this._component.fields.length; i++) {
            //    var query = "$";
            //    var query_elements = this._component.fields[i].split(',');
            //    for (var j = 0; j < query_elements.length; j++) {
            //        query += "['" + query_elements[j] + "']";
            //        if (this.isFieldArray(query_elements.slice(0, j + 1))) {
            //            query += "[*]";
            //        }
            //    }
            //    this.data.push({
            //        name: query_elements[query_elements.length - 1],
            //        data: jsonPath(this.properties.json_results.value, query)
            //    });
            //}

        this.deleteWaitImage();
    },

    pushData : function(obj) {
        //qui è possibile modificare valori nulli o errati

        for (var key in Object.keys(obj[0])){

            var name = Object.keys(obj[0])[key];
            var data = [];

            for (var i in obj) {
                data.push(obj[i][name]);
            }

            //console.log(data);//attenzione i dati vengono ORDINATI ALTROVE!

            this.data.push({
                name: name,
                data: data
            });
        }
    },

    /**
     * Delete a image after loading a datalet
     */
    deleteWaitImage : function() {
        $("img[src$='spin.svg']").remove();
    }
};