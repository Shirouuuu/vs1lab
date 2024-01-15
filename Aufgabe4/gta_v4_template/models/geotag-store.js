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

  addGeoTag(geoTag) {
    const index = this.#geotagArray.length;
    geoTag.id = index;
    this.#geotagArray.push(geoTag);
  }
  removeGeoTag(locationName) {
    this.#geotagArray = this.#geotagArray.filter(
      (tag) => tag.name != locationName
    ); //changed remove function
  }

  removeById(id){
    this.#geotagArray = this.#geotagArray.filter((tag) => tag.id != id);
  }

  getNearbyGeoTags(latitude, longitude, desiredProximity) {
    return this.#geotagArray.filter(
      (tag) =>
        (tag.latitude - latitude) * (tag.latitude - latitude) +
          (tag.longitude - longitude) * (tag.longitude - longitude) <=
        desiredProximity * desiredProximity
    );
  }

  searchNearbyGeoTags(lat, lon, desiredProximity, keyword) {
    let nearbyGeoTags = this.getNearbyGeoTags(lat, lon, desiredProximity);
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
