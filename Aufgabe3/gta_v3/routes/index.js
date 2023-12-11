// File origin: VS1LAB A3

/**
 * Define module dependencies.
 */
const express = require("express");
const router = express.Router();
const GeoTag = require("../models/geotag");
const GeoTagStore = require("../models/geotag-store");
const GeoTagExamples = require("../models/geotag-examples");

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

module.exports = router;
