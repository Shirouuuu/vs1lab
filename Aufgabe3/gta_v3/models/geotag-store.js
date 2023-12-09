// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 *
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 *
 * Provide a method 'addGeoTag' to add a geotag to the store.
 *
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 *
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 *
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields.
 */
class InMemoryGeoTagStore {
  #geotagArray = [];

  get geotagArray() {
    return this.#geotagArray;
  }

  arrayLength() {
    return this.#geotagArray.length;
  }

  addGeoTag(GeoTag) {
    this.#geotagArray.push(GeoTag);
  }

  removeGeoTag(locationName) {
    for (let i = 0; i < this.arrayLength(); i++) {
      currentGeoTag = this.#geotagArray[i];
      if (currentGeoTag.locationName == locationName) {
        this.#geotagArray.splice(i, 1);
        return;
      }
    }
  }

  distance(lat1, lon1, lat2, lon2) { //Haversine formula to calculate distance between two coordinates on a globe "as the crow flies"
    const r = 6371; // km
    const p = Math.PI / 180;

    const a =
      0.5 -
      Math.cos((lat2 - lat1) * p) / 2 +
      (Math.cos(lat1 * p) *
        Math.cos(lat2 * p) *
        (1 - Math.cos((lon2 - lon1) * p))) /
        2;

    return 2 * r * Math.asin(Math.sqrt(a));
  }

  getNearbyGeoTags(lat1,lon1, desiredProximity) {
    let nearbyGeoTags = [];


    for (let i = 0; i < this.arrayLength(); i++) {
      let currentGeoTag = this.#geotagArray[i];
      let lat2 = currentGeoTag.latitude;
      let lon2 = currentGeoTag.longitude;
      let distance = this.distance(lat1, lon1, lat2, lon2);
      if (distance <= desiredProximity) {
        nearbyGeoTags.push(currentGeoTag);
      }
    }
    return nearbyGeoTags;
  }

  searchNearbyGeoTags(lat, lon, desiredProximity, keyword) {
    let nearbyGeoTags = this.getNearbyGeoTags(lat,lon, desiredProximity);
    let nameArray = nearbyGeoTags.filter((GeoTag) =>
      GeoTag.name.includes(keyword)
    );
    let hashtagArray = nearbyGeoTags.filter((GeoTag) =>
      GeoTag.hashtag.includes(keyword)
    );
    let finalArray = nameArray.concat(hashtagArray);
    if (finalArray.length == 0) {
      return [];
    }
    return finalArray;
  }
}

module.exports = InMemoryGeoTagStore;
