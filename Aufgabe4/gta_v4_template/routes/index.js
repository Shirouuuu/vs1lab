// File origin: VS1LAB A3, A4

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require("express");
const router = express.Router();
const GeoTag = require("../models/geotag");
const GeoTagStore = require("../models/geotag-store");
const GeoTagExamples = require("../models/geotag-examples");

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get("/", (req, res) => {
  res.render("index", {
    latitude: "", //DEFINE LATITUDE FOR EJS TEMPLATE
    longitude: "", //DEFINE LONGITUDE FOR EJS TEMPLATE
    taglist: [],
  });
});

const geoTagStore = new GeoTagStore(); //Create new geoTagStore object

router.post("/tagging", (req, res) => {
  geoTagStore.addGeoTag(
    new GeoTag(
      req.body.name,
      req.body.latitude,
      req.body.longitude,
      req.body.hashtag
    )
  ); //Add geoTag with attributes from request body
  res.render("index", {
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    taglist: geoTagStore.getNearbyGeoTags(
      //get all geoTags in the proximity of 9999
      req.body.latitude,
      req.body.longitude,
      9999 //proximity in km
    ),
  });
});

router.post("/discovery", (req, res) => {
  let search = req.body.searchterm; //keyword for the filter

  res.render("index", {
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    taglist: geoTagStore.searchNearbyGeoTags(
      req.body.latitude,
      req.body.longitude,
      9999, //proximity in km
      search
    ),
  });
});

//Import example entries to geoTagStore
const tags = GeoTagExamples.tagList;

tags.forEach((tag) => {
  //for each entry of taglist split entry into those four variables
  const [name, latitude, longitude, hashtag] = tag; //name indices
  const geoTag = new GeoTag(name, latitude, longitude, hashtag); //create new geoTag with indices
  geoTagStore.addGeoTag(geoTag); //add geoTag to geoTagStore
});

// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get("/api/geotags", function (req, res) {
  const { latitude, longitude, searchterm } = req.query;
  console.log(latitude, longitude, searchterm);

  let geotagArray = geoTagStore.geotagArray;

  if (latitude && longitude) {
    //lat lon provided
    geotagArray = geoTagStore.getNearbyGeoTags(latitude, longitude, 100);
  }
  if (searchterm) {
    //only searchtermn provided
    geotagArray = geotagArray.filter(
      (tag) => tag.name.includes(searchterm) || tag.hashtag.includes(searchterm)
    );
  } else if (searchterm) {
    // both provided
    geotagArray = geoTagStore.searchNearbyGeoTags(
      parseFloat(latitude),
      parseFloat(longitude),
      100,
      searchterm
    );
  }
  res.send(JSON.stringify(geotagArray));
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

// TODO: ... your code here ...

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

// TODO: ... your code here ...

module.exports = router;
