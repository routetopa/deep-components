/**
 * @private
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {ol.Extent|undefined} Bounding box object.
 */
ol.format.WMSCapabilities.readLatLonBoundingBox_ = function (node, objectStack) {
    goog.asserts.assert(node.nodeType == Node.ELEMENT_NODE,
        'node.nodeType should be ELEMENT');
    goog.asserts.assert(node.localName == 'LatLonBoundingBox',
        'localName should be LatLonBoundingBox');
    return [
        ol.format.XSD.readDecimalString(node.getAttribute('minx')),
        ol.format.XSD.readDecimalString(node.getAttribute('miny')),
        ol.format.XSD.readDecimalString(node.getAttribute('maxx')),
        ol.format.XSD.readDecimalString(node.getAttribute('maxy'))
    ];
};

for(var a in ol.xml.makeStructureNS(
    ol.format.WMSCapabilities.NAMESPACE_URIS_, {
        'SRS': ol.xml.makeObjectPropertyPusher(ol.format.XSD.readString),
        'LatLonBoundingBox': ol.xml.makeObjectPropertySetter(
            ol.format.WMSCapabilities.readLatLonBoundingBox_),
    })){
    goog.object.extend(ol.format.WMSCapabilities.LAYER_PARSERS_[a],{
        'SRS': ol.xml.makeObjectPropertyPusher(ol.format.XSD.readString),
        'LatLonBoundingBox': ol.xml.makeObjectPropertySetter(
            ol.format.WMSCapabilities.readLatLonBoundingBox_),
    })
}