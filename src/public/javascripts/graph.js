// For the graph, these resources were helpful for learning:
// https://www.youtube.com/watch?v=HP1tOlxVYz4, https://www.youtube.com/watch?v=gda35eYXBJc
// The expand function was adapted from https://stackoverflow.com/questions/40018270/d3js-v4-add-nodes-to-force-directed-graph

const Graph = function(targetElement, graph) {

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const self = this,
    
    // change these to suit different screen types
    // make dyanmic in the future
    width = targetElement.offsetWidth,

    height = width / 3,

    // create an svg child within selected element
    svg = d3.select(targetElement).append('svg')
        .attr("width", width)
        .attr("height", height),

    simulation = d3.forceSimulation()
        .force("x", d3.forceX(width/2)) // every node wants to go to the middle
        .force("y", d3.forceY(height/2))
        .force("collide", d3.forceCollide(7)) // prevent collision
        .force("charge", d3.forceManyBody() // add force to keep separated at a distance
        .strength(-100))
        .force("link", d3.forceLink()
        .id(function (d) { return d.label; })); // the id of each svg circle should be the label of the associated node

    // add link and node types to svg
    linkGroup = svg.append("g")
                .attr("class", "links"),

    nodeGroup = svg.append("g")
                .attr("class", "nodes"),

    textGroup = svg.append("g")
                .attr("class", "texts")
    
    update = function() {

        // Tell the simulation where the nodes and links are coming from
        // .on("tick", ticked) means that the function ticked is called everytime the elements need to change
        // i.e. anytime you move the circles around
        simulation.nodes(graph.nodes).on("tick", ticked);

        simulation.force("link").links(graph.edges);

        // Update links
        link = linkGroup.selectAll("line").data(graph.edges);

        linkEnter = link.enter().append("line");

        link = linkEnter
            .merge(link);

        link.exit().remove();

        // Update the nodes
        node = nodeGroup.selectAll("circle").data(graph.nodes);
        console.log(node);

        // Enter new nodes
        nodeEnter = node.enter().append("circle")
            .attr("r", function(d){
                return 2 + (d.attributes.Degree*.4); // radius of svg circle depends somewhat on the node degree
            })
            .attr("fill", function(d){
                return color(d.attributes.company); // color is by country
            })
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


        node = nodeEnter.merge(node); // merge nodes
    
        // Exit any old nodes
        node.exit().remove();

        text = textGroup.selectAll("text.label").data(graph.nodes);

        textEnter = text.enter().append("text")
            .attr("class", "label")
            .attr("fill", function(d){
                return color(d.attributes.company);
            })
            .attr("font-size", "10px")
            .text(function(d) {
                return d.label;
            })
            .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


        text = textEnter.merge(text);
            
        text.exit().remove();
    
        // the function that specifies what to display where for each svg class
        function ticked() {
            link
                .attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) {
                    return d.x + d.attributes.Degree*.4 + 3; // Place the text a little to the right of the node
                })
                .attr("y", function(d) {
                    return d.y;
                });

        }
    
    
        },
    
        dragstarted = function(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        },
    
        dragged = function(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        },
    
        dragended = function(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        },
    
        expandGraph = function(links, node) {

            // add new node and links to the graph object 
            console.log("Extending Graph")
            console.log(links, node);
    
            console.log('adding node', node);
            graph.nodes.push(node);
    
            for (var i=0; i < links.length; i++) {
                console.log('adding link', links[i]);
                graph.edges.push(links[i]);
            }
    
            update();
    
        };
    
        this.expandGraph = expandGraph;
    
    update();
    
    };