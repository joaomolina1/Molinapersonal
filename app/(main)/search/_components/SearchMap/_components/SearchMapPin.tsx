import { useEffect, useRef } from "react";
import { Root, createRoot } from "react-dom/client";
import IconUserInterfaceMiscellaneousPinFilled from "@/_design_system/_icons/UserInterface/Miscellaneous/PinFilled.svg";
import { createBEMClasses } from "@/_utils/classname";

type SearchMapPinProps = {
  map: google.maps.Map;
  latitude: number;
  longitude: number;
  hovered: boolean;
  selected: boolean;
  onClick: () => void;
};

const SearchMapPin = ({
  map,
  latitude,
  longitude,
  hovered,
  selected,
  onClick,
}: SearchMapPinProps) => {
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement>(null);
  const rootRef = useRef<Root>(null);

  useEffect(() => {
    if (!rootRef.current) {
      const container = document.createElement("div");

      rootRef.current = createRoot(container);
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        content: container,
        gmpClickable: true,
      });

      rootRef.current.render(
        <SearchMapPinContent selected={false} hovered={false} />,
      );
    }
  }, []);

  useEffect(() => {
    if (!markerRef.current) return;

    markerRef.current.position = new google.maps.LatLng({
      lat: latitude,
      lng: longitude,
    });
    markerRef.current.map = map;

    return () => {
      if (markerRef.current) {
        markerRef.current.map = undefined;
        markerRef.current.position = null;
      }
    };
  }, [latitude, longitude, map]);

  useEffect(() => {
    if (markerRef.current) {
      if (hovered) {
        markerRef.current.zIndex = 2;
      } else if (selected) {
        markerRef.current.zIndex = 1;
      } else {
        markerRef.current.zIndex = undefined;
      }
    }
  }, [hovered, selected]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.addListener("gmp-click", () => {
        onClick();
      });
    }
  }, [onClick]);

  useEffect(() => {
    if (!rootRef.current) return;

    rootRef.current.render(
      <SearchMapPinContent selected={selected} hovered={hovered} />,
    );
  }, [selected, hovered]);

  return <></>;
};

const { block } = createBEMClasses("search-map-pin");

const SearchMapPinContent = ({
  selected,
  hovered,
}: {
  selected: boolean;
  hovered: boolean;
}) => {
  return (
    <div className={block({ selected, hovered })}>
      <IconUserInterfaceMiscellaneousPinFilled />
    </div>
  );
};

export default SearchMapPin;
