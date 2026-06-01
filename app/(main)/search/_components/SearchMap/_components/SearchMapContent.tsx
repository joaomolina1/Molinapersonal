import { createBEMClasses } from "@/_utils/classname";
import { useCallback, useEffect, useState } from "react";
import { useJsApiLoader, GoogleMap } from "@react-google-maps/api";
import config from "@/_utils/config";
import { Library } from "@googlemaps/js-api-loader";
import SearchMapPin from "./SearchMapPin";
import SearchMapSpace from "./SearchMapSpace";
import SearchMapFilters from "./SearchMapFilters";
import { useSearchContext } from "@/(main)/search/useSearchState";
import { debounce } from "@/_utils/debounce";

const { block, element } = createBEMClasses("search-map-content");

const LIBRARIES = ["marker", "core"] as Library[];
const MAX_FIT_ZOOM = 13;

const SearchMapLoader = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: config.googleMapsApiKey ?? "",
    version: "beta",
    region: "PT",
    language: "pt-PT",
    libraries: LIBRARIES as Parameters<typeof useJsApiLoader>[0]["libraries"],
  });

  if (!isLoaded) {
    return null;
  }

  return <SearchMapContent />;
};

const SearchMapContent = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const {
    bounds,
    setBounds,
    mapPins,
    hoveredSearchResultId,
    hasDoneInitialFit,
    setHasDoneInitialFit,
  } = useSearchContext();

  const onBoundsChanged = useCallback(() => {
    // When the user moves the map, update the URL, triggering a re-search.
    // We need to check hasDoneInitialFit because the bounds_changed event
    // is called after the automatic initial fit.
    if (map && hasDoneInitialFit) {
      const newBounds = map.getBounds();

      if (newBounds) {
        setBounds(newBounds);
      }
    }
  }, [hasDoneInitialFit, map, setBounds]);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleArrowClick = (direction: "right" | "left") => {
    if (!selectedId || !mapPins.length) {
      return;
    }

    const currentGlobalIndex = mapPins.findIndex((pin) =>
      pin.spaceIds.includes(selectedId),
    );

    if (currentGlobalIndex === -1) {
      return;
    }

    const currentPin = mapPins[currentGlobalIndex];
    const currentPinIndex = currentPin.spaceIds.indexOf(selectedId);

    if (direction === "right") {
      if (currentPinIndex === currentPin.spaceIds.length - 1) {
        if (currentGlobalIndex === mapPins.length - 1) {
          setSelectedId(mapPins[0].spaceIds[0]);
        } else {
          setSelectedId(mapPins[currentGlobalIndex + 1].spaceIds[0]);
        }
      } else {
        setSelectedId(currentPin.spaceIds[currentPinIndex + 1]);
      }
    } else if (direction === "left") {
      if (currentPinIndex === 0) {
        if (currentGlobalIndex === 0) {
          setSelectedId(mapPins.at(-1)!.spaceIds.at(-1)!);
        } else {
          setSelectedId(mapPins[currentGlobalIndex - 1].spaceIds.at(-1)!);
        }
      } else {
        setSelectedId(currentPin.spaceIds[currentPinIndex - 1]);
      }
    }
  };

  useEffect(() => {
    // When the map mounts (or when the city changes)
    // Then automatically fit the map
    if (!hasDoneInitialFit) {
      if (map) {
        const fitMap = (
          newBounds: google.maps.LatLngBounds,
          padding: number,
        ) => {
          map.fitBounds(newBounds, padding);

          const newZoom = map.getZoom();
          if (!!newZoom && newZoom > MAX_FIT_ZOOM) {
            map.setZoom(MAX_FIT_ZOOM);
          }

          // Wait for the map to fit before setting the state
          // to prevent calling the `onBoundsChanged` method,
          // since it should only be called by a user action
          setTimeout(() => setHasDoneInitialFit(true), 1000);
        };

        if (bounds) {
          // If there are bounds in the URL, fit to them
          const newBounds = new google.maps.LatLngBounds({
            north: bounds.top,
            south: bounds.bottom,
            west: bounds.left,
            east: bounds.right,
          });

          fitMap(newBounds, 0);
        } else if (mapPins?.length) {
          // Otherwise, fit to the search results but focus on lisbon if possible
          const mapPinsInLisbon = mapPins.filter(
            (pin) =>
              pin.lat < 39.0 &&
              pin.lat > 38.5 &&
              pin.lng > -9.6 &&
              pin.lng < -8.3,
          );

          const searchResultsToConsider = mapPinsInLisbon.length
            ? mapPinsInLisbon
            : mapPins;

          const lats = searchResultsToConsider.map((pin) => pin.lat);
          const lngs = searchResultsToConsider.map((pin) => pin.lng);

          const bounds = new google.maps.LatLngBounds({
            north: Math.max(...lats),
            south: Math.min(...lats),
            west: Math.min(...lngs),
            east: Math.max(...lngs),
          });

          fitMap(bounds, 10);
        } else if (mapPins?.length === 0) {
          const bounds = new google.maps.LatLngBounds({
            north: 39.0,
            south: 38.5,
            west: -9.6,
            east: -8.3,
          });

          fitMap(bounds, 10);
        }
      }
    }
  }, [bounds, hasDoneInitialFit, setHasDoneInitialFit, map, mapPins]);

  useEffect(() => {
    // When the map unmounts and then remounts, we need to re-do the initial fit
    return () => {
      setHasDoneInitialFit(false);
    };
  }, [setHasDoneInitialFit]);

  return (
    <div className={block()}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        options={{
          mapId: config.googleMapsMapId,
          maxZoom: 14,
          minZoom: 7,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        }}
        onLoad={(map) => setMap(map)}
        onUnmount={() => setMap(null)}
        onBoundsChanged={debounce(onBoundsChanged, 1000)}
        onClick={() => setSelectedId(null)}
      >
        {!!map &&
          mapPins?.map((pin) => (
            <SearchMapPin
              key={`${pin.lat}${pin.lng}`}
              map={map}
              latitude={pin.lat}
              longitude={pin.lng}
              hovered={
                !!hoveredSearchResultId &&
                pin.spaceIds.includes(hoveredSearchResultId)
              }
              selected={!!selectedId && pin.spaceIds.includes(selectedId)}
              onClick={() => {
                if (!!selectedId && pin.spaceIds.includes(selectedId)) {
                  return;
                }
                setSelectedId(pin.spaceIds[0]);
              }}
            />
          ))}
      </GoogleMap>
      <div className={element("footer")}>
        <div className="hide-desktop-large">
          <SearchMapFilters />
        </div>
        {!!selectedId && (
          <SearchMapSpace
            id={selectedId}
            key={selectedId}
            onArrowClick={handleArrowClick}
          />
        )}
      </div>
    </div>
  );
};

export default SearchMapLoader;
