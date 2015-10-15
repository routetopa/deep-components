/**
 * Created by Luigi Serra on 25/06/2015.
 */
var AjaxJsonDataRequestBehavior ={
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
        this.runWorkcycle();
    },

    getPropertyName: function(query){
        return query.substring(query.lastIndexOf("['") + 2, query.lastIndexOf("']") );
    }

}