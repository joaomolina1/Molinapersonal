import { useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { createRoot } from "react-dom/client";
import MapLocation from "./MapLocation";
import { createBEMClasses } from "@/_utils/classname";
import config from "@/_utils/config";

const loadMap = async (
  ref: HTMLDivElement,
  latitude: number,
  longitude: number,
  zoom: number,
) => {
  if (!config.googleMapsApiKey) {
    throw new Error("Please set the google maps api key");
  }

  const loader = new Loader({
    apiKey: config.googleMapsApiKey,
    version: "weekly",
    region: "PT",
    language: "pt-PT",
  });

  const { Map } = await loader.importLibrary("maps");

  const map = new Map(ref, {
    mapId: config.googleMapsMapId,
    center: { lat: latitude, lng: longitude },
    zoom,
    maxZoom: Math.max(14, zoom),
    minZoom: 8,
    disableDefaultUI: true,
    gestureHandling: "greedy",
  });

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  const markerIcon = document.createElement("div");
  createRoot(markerIcon).render(<MapLocation />);

  const formattedLocation = new google.maps.LatLng({
    lat: latitude,
    lng: longitude,
  });

  new AdvancedMarkerElement({
    map,
    content: markerIcon,
    position: formattedLocation,
  });
};

const { block } = createBEMClasses("map-with-pin");

const MapWithPin = ({
  latitude,
  longitude,
  zoom = 12,
}: {
  latitude: number;
  longitude: number;
  zoom?: number;
}) => {
  const mapRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        loadMap(node, latitude, longitude, zoom);
      }
    },
    [latitude, longitude, zoom],
  );

  return <div ref={mapRef} className={block()} />;
};

export default MapWithPin;
