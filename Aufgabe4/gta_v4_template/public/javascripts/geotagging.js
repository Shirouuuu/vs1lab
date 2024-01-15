// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

console.log("The geoTagging script is going to start...");

function updateLocation() {
  //Create var for map img
  var img = document.getElementById("mapView");

  //Mapmanager Object with Mapquest API key
  let mapmanager = new MapManager("wlvNEFoQ5OCICOpOR62Y4VzcsPDWcZJJ");

  var mapQuestUrl;
  var latitudeValue = document.getElementById("latitude_input").value;
  var longitudeValue = document.getElementById("longitude_input").value;

  //Parse list from img data tag to JSON
  const taglist = JSON.parse(img.dataset.tags);

  //Latitude and longitude exist
  if (latitudeValue && longitudeValue) {
    console.log("-".repeat(43));
    console.log("Coordinates already exist:", latitudeValue, longitudeValue);
    console.log("-".repeat(43));

    //Call getMapUrl() with latitude and longitude as arguments
    mapQuestUrl = mapmanager.getMapUrl(latitudeValue, longitudeValue, taglist);

    //Change map img source to MapQuest URL
    img.src = mapQuestUrl;

    return;
  }

  console.log("-".repeat(25));
  console.log("findLocation will be executed");
  console.log("-".repeat(25));

  LocationHelper.findLocation(function (helper) {
    //Saves latitude & longitude from helper
    var latitude = helper.latitude;
    var longitude = helper.longitude;

    //Pass values on elmt values
    document.getElementById("latitude_input").value = latitude;
    document.getElementById("longitude_input").value = longitude;
    document.getElementById("latitude_hidden_input").value = latitude;
    document.getElementById("longitude_hidden_input").value = longitude;

    mapQuestUrl = mapmanager.getMapUrl(latitude, longitude, taglist);

    //Change map img source to MapQuest URL
    img.src = mapQuestUrl;
  });
}

function taggingFormEventListener() {
  //Declaring variables
  const taggingForm = document.getElementById("tag-form");

  //EventListener for tagging from ON SUBMIT
  taggingForm.addEventListener("submit", (event) => {
    //Prevent default behavior
    event.preventDefault();

    //Create formData
    const formData = new FormData(taggingForm);
    //Convert formData to JS Object
    const data = Object.fromEntries(formData);

    //logging
    console.log("-".repeat(100));
    console.log(
      "FETCH TAGGING POST REQUEST TRIGGERED:\n" +
        "data: " +
        JSON.stringify(data)
    );
    console.log("-".repeat(100));

    //Fetch Request for adding Geotags
    fetch("/api/geotags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        //Variable for unordered list in discoveryResults
        const taglistHTML = document.getElementById("discoveryResults");

        //Extract variables from data (order does not matter)
        const { name, latitude, longitude, hashtag } = data;
        const newGeoTag = { name, latitude, longitude, hashtag };

        //Create listElmt
        const listItem = document.createElement("li");

        //Fill with content "name (lat,lon) hashtag"
        listItem.textContent = `${name} (${latitude},${longitude}) ${hashtag}`;
        taglistHTML.appendChild(listItem);

        //Update Map with geotags
        let img = document.getElementById("mapView");
        let mapmanager = new MapManager("wlvNEFoQ5OCICOpOR62Y4VzcsPDWcZJJ");

        //create taglist with newGeotag only
        const taglist = [newGeoTag];

        //Call getMapUrl() with new taglist
        mapQuestUrl = mapmanager.getMapUrl(latitude, longitude, taglist);

        //Overwrite old map
        img.src = mapQuestUrl;
      });
  });
}

function discoveryFormEventListener() {
  //Declaring vars
  const discoveryForm = document.getElementById("discoveryFilterForm");

  //EventListener for discovery from ON SUBMIT
  discoveryForm.addEventListener("submit", (event) => {
    //Prevent default behavior
    event.preventDefault();

    const searchterm = document.getElementById("searchterm_input").value;
    const latitude = document.getElementById("latitude_hidden_input").value;
    const longitude = document.getElementById("longitude_hidden_input").value;

    const queryParams = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      searchterm: searchterm,
    });

    //fetch "/api/geotags?" with query params e.g "name='luca'&age='19'
    fetch("/api/geotags?" + queryParams.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const tagListElement = document.getElementById("discoveryResults");

        //logging
        console.log("-".repeat(100));
        console.log(
          "FETCH DISCOVERY GET REQUEST TRIGGERED:\n" +
            "data: " +
            JSON.stringify(data)
        );
        console.log("-".repeat(100));

        //Empty current displayed discoveryResults
        tagListElement.innerHTML = "";

        //Iterate through data with filtered geotags and append to list
        data.taglist.forEach((gtag) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${gtag.name} (${gtag.latitude},${gtag.longitude}) ${gtag.hashtag}`;
          tagListElement.appendChild(listItem);
        });

        //Update Map with geotags
        var img = document.getElementById("mapView");
        let mapmanager = new MapManager("wlvNEFoQ5OCICOpOR62Y4VzcsPDWcZJJ");

        //Call getMapUrl() with new taglist
        mapQuestUrl = mapmanager.getMapUrl(latitude, longitude, data.taglist);

        //Overwrite old map
        img.src = mapQuestUrl;
      });
  });
}

function ajaxFetch() {
  taggingFormEventListener();
  discoveryFormEventListener();
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  updateLocation();
  ajaxFetch();
});
