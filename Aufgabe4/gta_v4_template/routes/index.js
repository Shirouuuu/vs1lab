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
  let geotagArray = geoTagStore.geotagArray;

  if (latitude && longitude) {
    if (searchterm) {
      geotagArray = geoTagStore.searchNearbyGeoTags(
        parseFloat(latitude),
        parseFloat(longitude),
        50,
        searchterm
      );
    } else {
      geotagArray = geoTagStore.getNearbyGeoTags(
        parseFloat(latitude),
        parseFloat(longitude),
        50
      );
    }
  } else if (searchterm) {
    geotagArray = geotagArray.filter(
      (tag) => tag.name.includes(searchterm) || tag.hashtag.includes(searchterm)
    );
  }

  res.send({ latitude, longitude, taglist: geotagArray });
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
router.post("/api/geotags", function (req, res) {
  const { name, latitude, longitude, hashtag } = req.body;
  const newGeoTag = new GeoTag(name, latitude, longitude, hashtag);
  geoTagStore.addGeoTag(newGeoTag);

  res.location("/api/geotags/${newGeoTag.id}").status(201).json(newGeoTag);
});

/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get("/api/geotags/:id", function (req, res) {
  const id = req.params.id;
  const geoTag = geoTagStore.geotagArray[id];
  if (!geoTag) {
    res.send("There is no geotag with id of " + id);
  }
  res.send(JSON.stringify(geoTag));
});

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

router.put("/api/geotags/:id", function (req, res) {
  const { name, latitude, longitude, hashtag } = req.body;

  const id = req.params.id;
  console.log(id);

  const geoTagToUpdate = geoTagStore.geotagArray[id];

  console.log(geoTagToUpdate);

  if (geoTagToUpdate) {
    geoTagToUpdate.name = name;
    geoTagToUpdate.latitude = latitude;
    geoTagToUpdate.longitude = longitude;
    geoTagToUpdate.hashtag = hashtag;
    res.send(JSON.stringify(geoTagToUpdate));
  } else res.send("GeoTag to Update not found!");
});

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

router.delete("/api/geotags/:id", function (req, res) {
  const id = req.params.id;
  const geoTagToDelete = geoTagStore.geotagArray[id];
  if (!geoTagToDelete) {
    res.send(
      "Could not delete geotag since there is no geotag with id of " + id
    );
  } else {
    geoTagStore.removeGeoTag(geoTagToDelete.name);
    res.send(JSON.stringify(geoTagToDelete));
  }
});

module.exports = router;
