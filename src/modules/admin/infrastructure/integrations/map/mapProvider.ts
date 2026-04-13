/**
 * Leaflet is used for the current preview implementation because it is
 * lightweight, easy to ship inside the existing add-school flow, and fits the
 * current "show a place on a map" requirement without larger architectural
 * changes.
 */
export const schoolLocationMapProvider = {
  packageName: "react-leaflet",
  engineName: "Leaflet",
  tilesProviderName: "OpenStreetMap",
  geocodingProviderName: "Nominatim",
};
