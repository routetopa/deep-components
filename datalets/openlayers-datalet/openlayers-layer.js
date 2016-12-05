var openlayersMap = openlayersMap || {};
window.openlayersMap.layer = {
    properties: {
        isLayer: {type: Boolean, value: true},
        format: {
            type: String,
            value: ""
        },
        url: {
            type: String,
            value: ""
        },
        title: {
            type: String,
            value: "",
            observer: '_titleChanged'
        },
        popup: {
            type: Object,
            value: null
        },
        opacity: {
            type: Number,
            value: 1.0,
            reflectToAttribute: true,
            notify: true,
            observer: '_opacityChanged'
        },
        // zindex: {
        //     type: Number,
        //     value: null,
        //     reflectToAttribute: true,
        //     observer: '_zIndexChanged'
        // },
        visible: {
            type: Boolean,
            value: true,
            reflectToAttribute: true,
            notify: true,
            observer: '_visibleChanged'
        },
        map: {
            type: Object,
            observer: '_mapChanged'
        },
        layerGroup: {
            type: Object,
            observer: '_groupChanged'
        },
        layer: {
            type: Object,
            value: null
        }

    },

    ready: function () {
        var me = this;
        this.async(function () {
            me.domReady()
        }, 1);
    },
    detached: function () {
        if (this.layer) {
            if (this.layerGroup) {
                var groupLayers = this.layerGroup.getLayers();
                groupLayers.forEach(function (l, i) {
                    this.layer === l && groupLayers.removeAt(i);
                }.bind(this));
            } else if (this.map) {
                this.map.removeLayer(this.layer);
            }
        }
        this._mutationObserver.disconnect();
    },

    domReady: function () {
        this._mutationObserver = new MutationObserver(this._registerLayerOnChildren.bind(this));
        this._mutationObserver.observe(this, {childList: true});
    },
    zoomToLayer: function () {
        this.layer && this._getMapElement().zoomToLayer(this);
        // var extent = this.layer.getExtent() ? this.layer.getExtent() : this.layer.getSource().getExtent()
        // this.map.getView().fit(extent, this.map.getSize());
    },
    _getMapElement: function () {
        var current = this
        while (current.localName != 'openlayers-map') {
            current = current.parentElement;
        }
        return current;
    },
    _addListeners: function () {
        this.layer.on('change:visible', function () {
            this.visible = this.layer.getVisible();
        }.bind(this));
        this.layer.on('change:opacity', function () {
            this.opacity = this.layer.getOpacity();
        }.bind(this));
        // this.layer.on('change:zIndex',function(){this.zindex = this.layer.getZIndex();}.bind(this));
    },
    _titleChanged: function () {
        if (this.layer) {
            this.layer.set('title', this.title);
        }
    },
    _groupChanged: function () {
        this.map = this.layerGroup.get('map');
    },
    _opacityChanged: function () {
        if (this.layer) {
            this.layer.setOpacity(this.opacity);
        }
    },
    // _zIndexChanged: function () {
    //     if (this.layer) {
    //         this.layer.setZIndex(this.zindex);
    //     }
    // },
    _visibleChanged: function () {
        if (this.layer) {
            this.layer.setVisible(this.visible);
        }
    },
    _registerLayerOnChildren: function () {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].layer = this.layer;
        }
    },

};
