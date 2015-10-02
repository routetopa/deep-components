/*
     The MIT License (MIT)

     Copyright (c) 2015 Dipartimento di Informatica - Università di Salerno, Italy

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

var AjaxJsonJsonPathBehavior = {

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
     * Called when core-ajax component receive the json data from called url. It is responsible to
     * extract data from response, coded in json, and refine it by using JsonPath queries in the query attribute.
     * After this phase it parses the resulting object to populate the structure(keys,values) to fill the final table by using
     * angularJs syntax.
     *
     * @method handleResponse
     */
    handleResponse: function(e) {
        this.properties.json_results.value = e;
        this.createDataObject();
        this.runWorkcycle();
    },

    createDataObject : function(){

        this.data = [];
        this._component.fields = JSON.parse(this._component.fields);

        for(var i=0;i < this._component.fields.length; i++){
            var query = "$";
            var query_elements = this._component.fields[i].split(',');
            for(var j=0; j < query_elements.length - 1;j++){
                query += "['" + query_elements[j] + "']";
            }
            query += "[*]" + "['" + query_elements[query_elements.length - 1] + "']";
            this.data.push({name : query_elements[query_elements.length - 1], data : jsonPath(this.properties.json_results.value, query)});
        }
    }

};