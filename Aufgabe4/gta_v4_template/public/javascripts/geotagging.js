// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

console.log("The geoTagging script is going to start...");
/**
 *
 *
 * @return {*} 
 */
function updateLocation() {
  var img = document.getElementById("mapView"); //create var for map img
  let mapmanager = new MapManager("wlvNEFoQ5OCICOpOR62Y4VzcsPDWcZJJ"); // create MapManager object with custom API key
  var mapQuestUrl;
  var latitudeValue = document.getElementById("latitude_input").value;
  var longitudeValue = document.getElementById("longitude_input").value;

  const taglist = JSON.parse(img.dataset.tags); //Parse list from img data tag to JSON
  console.log(taglist);

  if (latitudeValue && longitudeValue) {
    //when there are already values for lat and lon
    console.log("Coordinates already exist:", latitudeValue, longitudeValue);
    mapQuestUrl = mapmanager.getMapUrl(latitudeValue, longitudeValue, taglist); //call getMapUrl() with latitude and longitude as arguments
    img.src = mapQuestUrl; //change map img source to MapQuest URL
    return;
  }

  console.log("findLocation will be executed");
  LocationHelper.findLocation(function (helper) {
    //findLocation return LocationHelper object helper to callback function
    var latitude = helper.latitude; //saves latitude from helper into var latitude
    var longitude = helper.longitude; //saves longitude from helper into var longitude

    document.getElementById("latitude_input").value = latitude; //pass latitude value into latitude input on website
    document.getElementById("longitude_input").value = longitude; //pass longitude value into longitude input on website
    document.getElementById("latitude_hidden_input").value = latitude; //same on hidden input in discovery search
    document.getElementById("longitude_hidden_input").value = longitude; //same on hidden input in discovery search

    mapQuestUrl = mapmanager.getMapUrl(latitude, longitude, taglist); //call getMapUrl() with latitude and longitude as arguments
    img.src = mapQuestUrl; //change map img source to MapQuest URL
  }); // findLocation()-call with callback-function as argument: function(helper){...}
}

function taggingFormEventListener() {
  const taggingForm = document.getElementById("tag-form");

  taggingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const data = new FormData(taggingForm); //4 arrays with key/value pair lat lon hashtag name
    //use data from FormData and paste it into js object which will be later on stringified to JSON
    const dataAsJSON = {};
    data.forEach((value, key) => {
      dataAsJSON[key] = value;
    });

    fetch("/api/geotags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataAsJSON),
    })
      .then((res) => res.json())
      .then((data) => {
        const tagListElement = document.getElementById("discoveryResults");

        const { name, latitude, longitude, hashtag } = data;
        const listItem = document.createElement("li");
        listItem.textContent = `${name} (${latitude},${longitude}) ${hashtag}`;
        tagListElement.appendChild(listItem);
      });
  });
}

function discoveryFormEventListener() {
  const discoveryForm = document.getElementById("discoveryFilterForm");

  discoveryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const searchterm = document.getElementById("searchterm_input").value;
    const latitude = document.getElementById("latitude_hidden_input").value;
    const longitude = document.getElementById("longitude_hidden_input").value;

    const queryParams = new URLSearchParams({
      latitude: latitude,
      longitude: longitude,
      searchterm: searchterm,
    });

    fetch("/api/geotags?" + queryParams.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Erhaltene Daten in die taglist im EJS-Template einfügen
        const tagListElement = document.getElementById("discoveryResults");
        tagListElement.innerHTML = ""; // Leeren der aktuellen Listenelemente

        data.taglist.forEach((gtag) => {
          const listItem = document.createElement("li");
          listItem.textContent = `${gtag.name} (${gtag.latitude},${gtag.longitude}) ${gtag.hashtag}`;
          tagListElement.appendChild(listItem);
        });
      });
  });
}

function ajaxFetch() {
  taggingFormEventListener();
  discoveryFormEventListener();
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
  updateLocation(); // call function above
  ajaxFetch();
});
