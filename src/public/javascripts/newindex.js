// ask for graph data through /data route
// d3.json internally makes a Fetch request, so this is like an AJAX interaction
d3.json("/data", function (err, graph) {

    if (err) throw err;

    // targetElement is where we populate our SVG force directed graph
    const targetElement = document.querySelector('.chart-container'); 

    // file calls links "edges"
    graph.links = graph.edges;

    // call the graph script to actually make the graph
    graph = new Graph(targetElement, graph);

    d3.selectAll('button.expand').on('click', function (){
        // add form, on click use info to make node and add to database
        // text input is a form
        let textInput = document.getElementById("inputURL").value;
        // Validation that all letters are allowed on user input:
        textInput = textInput.split("/").pop();
        console.log("text input:", textInput);
        if (textInput.match(/^[A-Za-z0-9_]+$/)){

            validInput();
            
        }

        else{
            const statusObj = document.querySelector(".status");
            statusObj.textContent = "Input must not be empty and can only be a combination of letters, numbers, _ and /. ";
            statusObj.textContent+= " '/' can not be at the end.";
        }

        function validInput(){
        // AJAX interaction
        const req = new XMLHttpRequest();
        const to_scrape = textInput;
        req.open('GET', '/scrape/'+to_scrape, true);
        req.onload = function(){
            resObj = JSON.parse(req.responseText);
            const statusObj = document.querySelector(".status");
            linksList = document.querySelector(".linksList");
            console.log("Node:", resObj.node);
            console.log("Links:", resObj.links);
            if (resObj.node=="already exists" || resObj.node=="no relations found" || resObj.node=="entered URL not valid, try again"){
                console.log("Can not add:", resObj.node)
                statusObj.textContent = "Can not add: "+ resObj.node;
                linksList.innerHTML = "";
            }

            else{
                statusObj.textContent = "Matches found! Will add: " + resObj.node.label + ". Please click on a node to see update!";
                linksList.innerHTML = "<h3>" + resObj.node.label + " knows: </h3>";

                // reduce function used
                linksList.innerHTML += resObj.links.reduce((all_str, link)=>{
                    console.log(link["target"])
                    return all_str+ "<li>" + link["target"] + "</li>";
                }, " ");
               
                graph.expandGraph(resObj.links, resObj.node);
                
            }
        };

        // AJAX interation
        req.onerror = function(){
            console.log("error");
        }

        req.send();
    }

});

// handle form 2
d3.selectAll('button.name').on('click', function(){
    const nameInput = document.getElementById("inputName").value;
    const greeting = document.querySelector(".greeting");
    greeting.textContent = "Welcome " + nameInput + " to the Network of Influence!";
})

});

