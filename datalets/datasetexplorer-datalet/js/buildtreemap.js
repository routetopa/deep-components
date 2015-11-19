/**
 * Created by Utente on 17/07/2015.
 */

function build(root, place_holder, select_listener) {

    var plwidth = $("#" + place_holder).width(),
        plheight = $("#" + place_holder).height();

    var margin = {top: 20, right: 0, bottom: 0, left: 0},
        width  = plwidth,
        height =  plheight - margin.top - margin.bottom,
        formatNumber = d3.format(",d"),
        transitioning;

    var x = d3.scale.linear()
        .domain([0, width])
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    var svg = d3.select("#" + place_holder)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    var dataletContainer = null;

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    //d3.json
    initialize(root);
    accumulate(root);
    layout(root);
    display(root);

    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
        return (d._children = d.children)
            ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 5)
            : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d._children) {
            treemap.nodes({_children: d._children});
            var i = 0;
            d._children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                c.depth = d.depth + 1;
                c.color = c.depth < 2
                        ? d3.scale.ordinal().domain(d3.range(d._children.length)).range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"])(i++)
                        : d.color;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        g.filter(function(d) { return d._children; })
            .classed("children", true)
            .on("click", transition);

        g.selectAll(".child")
            .data(function(d) { return d._children || [d]; })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect);

        g.append("rect")
            .attr("class", "parent")
            .call(rect)
            .append("title")
            .text(function(d) { return d.name;  /*formatNumber(d.value);*/ });

        g.append("text")
            .attr("dy", ".75em")
            .call(text);

        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            if (dataletContainer) {
                dataletContainer.remove();
                dataletContainer = null;
            }

            var g2 = display(d),
                t1 = g1.transition().duration(750),
                t2 = g2.transition().duration(750);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function(a, b) { return b.depth - a.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function() {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        if (!d._children[0]._children) {
            //grandparent.dispatchEvent(new CustomEvent('select', { detail: d._children[0].name }));
            if (select_listener) {
                select_listener(d._children[0].name);
            }

            var dataurl = d._children[0].name;
            var pageurl = dataurl.replace(/\/download\/.*/, '');
            dataletContainer = svg
                .append("foreignObject")
                .attr("width", root.dx)
                .attr("height", root.dy - root.y)
                .append("xhtml:body")
                .html('<iframe src="'+pageurl+'" width="'+root.dx+'" height="'+root.dy+'"></iframe>');
        }

        return g;
    }

    function text(text) {
        text
            .attr("x", function(d) { return x(d.x) + 6; })
            .attr("y", function(d) { return y(d.y) + 6; });
        text.call(wrap);
    }

    function wrap(d) {
        var wwidth = width;
        var hheight = height;

        d.each(function(){
            var text = d3.select(this),
                d = text[0][0].__data__,
                words = d.name.trim().split(/\s+|\./).reverse(),
                word = words.pop(),
                line = [word],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                x = parseFloat(text.attr("x")),
                y = parseFloat(text.attr("y")),
                dy = parseFloat(text.attr("dy"));
                text.selectAll("tspan").remove();

            var fx = d3.scale.linear()
                .domain([d.parent.x, d.parent.x + d.parent.dx])
                .range([0, wwidth]);

            var fy = d3.scale.linear()
                .domain([d.parent.y, d.parent.y + d.parent.dy])
                .range([0, hheight]);

            var tspan = text
                    .text(null)
                    .append("tspan")
                    .attr("x", fx(d.x) + 6)
                    .attr("y", fy(d.y) + 6)
                    .attr("dy", lineNumber++ * lineHeight + dy + "em");
            var width = fx(d.x + d.dx) - fx(d.x) - 12;
            var height = fy(d.y + d.dy) - fy(d.y) - 6;

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));

                    line = [word];

                    tspan = text
                        .append("tspan")
                        .attr("x", fx(d.x) + 6)
                        .attr("y", fy(d.y) + 6)
                        .attr("dy", lineNumber++ * lineHeight + dy + "em")
                        .text(word);

                    if (text.node().offsetHeight > height) {
                        tspan.remove();
                        break;
                    }
                }
            }
        });
    }

    function rect(rect) {
        rect.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
            .style("fill", function(d, i) { return d.color; })
            ;
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + "." + d.name
            : d.name;
    }
};