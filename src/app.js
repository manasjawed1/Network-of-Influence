const express = require("express");
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const request = require('request');
const cheerio = require('cheerio')
const bodyParser = require('body-parser');
const db = require('./db');
const Node = db.Node;
const Link = db.Link;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));


app.get('/', (req, res) => {
   console.log('request received');
});

app.get('/data', (req, res) => {
   console.log('data request received');
   Link.find((err, links)=>{
      Node.find((err, nodes)=>{
         const obj = {
            nodes: nodes,
            edges: links
         }
         res.json(obj);

      });
   })
});

// route to handle scrape request
app.get('/scrape/:url', (req, res)=>{

   console.log("received url to scrape")
   const short_url = req.params.url;
   const full_url = "https://en.wikipedia.org/wiki/" + short_url;
   console.log("full url: " + full_url)

   // request is similar to an AJAX interaction
   request(full_url, (err, response, html)=>{

      if(response.statusCode>=400 && response.statusCode<=500){
         response = {
            "node": "entered URL not valid, try again"
         }
         res.send(JSON.stringify(response));
      }

      // only run scraping part of code if response is valid
      else{
      const scrapedRes = cheerio.load(html);

      // Load name to see if person already in db. If so, don't make a node for them
      let name = scrapedRes('#firstHeading');
      name = scrapedRes(name).text();
      console.log("Person requested is: " + name)

      Node.find({label: name}, (err, node)=>{
         if(node.length===0){
            console.log("Person not found! Will scrape page now!")
            scrapePage(name);
         }

         else{
            response = {
               "node": "already exists"
            }
            res.send(JSON.stringify(response));
         }

      })

      function scrapePage(orginalName){
         linkObj = scrapedRes('#bodyContent a[href]').nextUntil("#References"); // get all body content until the references heading

         const all_links = new Set(); // make a set for all links

         scrapedRes(linkObj).each( (i, element) => {
            all_links.add(scrapedRes(element).attr('href')) // add links
         });
         
         all_links_array = Array.from(all_links);

         // map function used
         criteriaArray = all_links_array.map((wikiLink)=>{
            obj = {"attributes.link": wikiLink};
            return obj;
         });

         query = {
            $or: criteriaArray
         }
         
         // Check if query using all_links returns matching nodes
         Node.find( query , (err, nodes)=>{
            if (nodes.length===0){ // if no node found, just return
               response = {
                  "node": "no relations found"
               }
               res.send(JSON.stringify(response));
            }

            else{ // if nodes are found, make links accordingly
               wiki_url = "/wiki/"+ short_url;
               const newNode = {"label":orginalName, "id":orginalName,"attributes":{"Degree":nodes.length+"", "link": wiki_url, "company": "AddedByUser"}, "size":10.0}

               // map function used
               newLinks = nodes.map((foundNode)=>{
                  obj = {"source": orginalName, "target": foundNode.label};
                  return obj;
               })

               // disable addition (the two inserMany functions) here if you dont want to alter the database
               Link.insertMany(newLinks);
               Node.insertMany(newNode);

               const to_send = {
                  "node": newNode,
                  "links": newLinks
               }
               const to_send_string = JSON.stringify(to_send);
               console.log(to_send_string);
      
               res.send(to_send_string);
            }
            

         })

      }
     

   }

   })

});

const port = process.env.PORT || 3000;

app.listen(port, () => {console.log(`Server is listening on ${port}`);});
