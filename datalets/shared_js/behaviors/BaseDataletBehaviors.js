/**
 * Created by Luigi Serra on 25/06/2015.
 */

var BaseDataletBehavior ={
    properties: {
        /**
         * It represent the data url from CKAN api
         *
         * @attribute dataUrl
         * @type string
         * @default 'null'
         */
        dataUrl: {
            type: String,
            value: ""
        },
        /**
         * It represents one or multiple query string in JsonPath format(separated by spaces) to apply to data in order to pass to the components
         *
         * @attribute query
         * @type string
         * @default 'null'
         */
        query:{
            type: String,
            value: ""
        },
        /**
         * The selected and transformed data you can use in presentation phase
         *
         * @attribute data
         * @type string
         * @default 'null'.
         */
        data: {
            type: Array,
            value: []
        }
    },

    factoryImpl: function(data_url, query) {
        this.data_url = data_url;
        this.query    = query;
    }
}

var WorkcycleBehavior = {
    _component: null,
    /**
     * Request data from source(e.g. CKAN by api) using some kind of technology(e.g. Ajax)
     *
     * @method requestData
     */
    requestData: function(){

    },
    /**
     * Select the fields from data(typically json) previously retrieved by ajax request. The selection could be done by jsonPath but
     * it depends on the representation data format(CKAN apies return a json representation of the dataset).
     *
     * @method selectData
     */
    selectData: function(){
    },
    /**
     * Filter data previously selected. An example of filterting could be an expression such "fields > 30" or "fields = 'AAA'"
     * If you are using jsonPath to select the datas you can apply an expression directly in the jsonPath query string.
     *
     * @method filterData
     */
    filterData: function(){
    },
    /**
     * Transform the selected data in order to build the structure that the presentation phase needs.
     *
     * @method transformData
     */
    transformData: function(){
    },
    /**
     * Called when core-ajax component receive the json data from called url. It is responsible to
     * extract data from response, coded in json, and refine it by using JsonPath queries in the query attribute.
     * After this phase it parses the resulting object to populate the structure(keys,values) to fill the final table by using
     * angularJs syntax.
     *
     * @method handleResponse
     */
    runWorkcycle: function() {
        this.selectData();
        this.filterData();
        this.transformData();
    },
    init: function(component){
        this._component = component;
        this.requestData();
    }
}