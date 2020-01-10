const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NodeSchema = new Schema({
  label: String,
  x: Number,
  y: Number,
  id: String,
  attributes: {
    Degree: Number,
    link: String,
    company: String
  },
  color: String,
  size: Number
});

const LinkSchema = new Schema({
  source : String,
  target : String,
  id : Number,
  attributes : {
    color : String
  },
  color : String,
  size : Number
});

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/final';
}

mongoose.connect(dbconf, { useNewUrlParser: true });

module.exports ={
  Node: mongoose.model("Nodes", NodeSchema),
  Link: mongoose.model("Links", LinkSchema)
};
