
var nodes;
var links;

function buildGraph(t) {
            var graph = {};

            graph.nodes = t.nodes;
            graph.links = t.links;

            force = d3.layout.force().nodes(graph.nodes).links(graph.links).size([width, height]).charge(-1e3).friction(.5).linkDistance(function (t)
            {
                return t.value ? t.value : 80
            }).on("tick", tick).start();

svg=svg.append("g")
        .call(d3.behavior.zoom().scaleExtent([.25, 20]).on("zoom", zoom))
        .append("g");

    svg.append("rect")
        .attr("fill", "white")
        .attr("width", width)
        .attr("height", height);

    links = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link");

            nodes = svg.selectAll(".node").data(graph.nodes).enter().append("g")
                .attr("class", function (t) {
                    return t.fixed ? "node fixed" : "node"
                }).attr("name", function (t) {
                    return t.name ? t.name.split(" ").join("_").toLowerCase() : ""
                }).on("mouseover", mouseover).on("mouseout", mouseout).on("click", active)
                   .append("circle")
                       .attr("class", function (t) {
                           return t.fixed ? "" : "drag"
                       })
                       .attr("r", function (t) {
                           return t.r ? t.r : 15
                       })
                       .attr("style", function (t) {
                           return t.color ? "stroke:" + t.color : !1
                       });

            //d3.selectAll(".drag").call(force.drag), svg.selectAll("g.fixed").call(text);
            d3.selectAll(".drag").call(force.drag), svg.selectAll("g.node").call(text);

           /* d3.selectAll("circle").attr("transform", function(t) {
                return "translate(" + t.x + "," + t.y + ")";
            });*/
            //d3.selectAll("circle").attr("transform", function(t) {
            //            return "translate(" + t + ")";
            //        });

}

function destroyGraph(){
    nodes.remove();
    links.remove();
    svg.remove();
    nodes = [];
    links = [];
}

function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

function text(t) {
    {
        var e = t.append("svg:foreignObject").attr("width", 120).attr("height", 30);
        e.attr("style", function (t) {
            return "color:" + (t.color ? t.color : "#000")
        }).append("xhtml:div").html(function (t) {
            //return t.fixed ? t.name : null
            return t.name;
        })
    }
}

/*function textS(t) {
    t.append("text").attr("dx", 12).attr("dy", ".35em").text(function (t) {
        return t.name
    })
}*/

function tick() {
   // d3.select("svg").attr("style", "transform:translate(8%)");
    d3.selectAll("g foreignObject").attr("x", function (t) {
        return t.x + (t.r ? 1.1 * t.r : 15)
    }).attr("y", function (t) {
        return t.y - 35
    });

    d3.selectAll("#logo text").attr("x", function (t) {
        return t.x + .7 * (t.r ? t.r : 15)
    }).attr("y", function (t) {
        return t.y
    });

    nodes.attr("cx", function (t) {
        return t.x = Math.max(25, Math.min(width - 50, t.x))
    }).attr("cy", function (t) {
        return t.y = Math.max(8, Math.min(600, t.y))
    });

    links.attr("x1", function (t) {
        return t.source.x
    }).attr("y1", function (t) {
        return t.source.y
    }).attr("x2", function (t) {
        return t.target.x
    }).attr("y2", function (t) {
        return t.target.y
    })
}
function mouseover(t) {
    d3.select(this).selectAll("circle").transition().duration(600).ease("elastic").attr("r", function (t) {
        return 1 == t.fixed ? 1.4 * t.r : 15
    });
    //$("#sbiricuda").html($("." + t.name.split(" ").join("_").toLowerCase()).html())
}
function mouseout() {
    d3.select(this).selectAll("text").style("visibility", "hidden"), d3.select(this).selectAll("circle").transition().duration(400).attr("r", function (t) {
        return t.r ? t.r : 15
    })
}
function active(t) {
    t.fixed && openModal(t.name)
}
function openModal(t) {
    var e = t.split(" ").join("_").toLowerCase();
    $(".modal-content").hide();
    $("." + e).fadeIn();
    $("#modal").modal()
}
/*
var width = 900;//1250;
var height = 9 * width / 16, svg, link, node, svg = d3.select("svg#sbiricuda").attr("class", "svg").attr({
    width: "100%",
    height: "100%"
}).attr("viewBox", "0 0 " + width + " " + height).attr("pointer-events", "all").style("position", "absolute").attr("style", "transform:translate(0px)");*/
