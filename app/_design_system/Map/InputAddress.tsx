"use client";

import Callout from "@/_design_system/Callout";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { useDebouncedState } from "@/_utils/debounce";
import { Loader } from "@googlemaps/js-api-loader";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import StackHalfHalf from "../StackHalfHalf";
import IconUserInterfaceMiscellaneousGps from "../_icons/UserInterface/Miscellaneous/Gps.svg";
import IconUserInterfaceMiscellaneousPin from "../_icons/UserInterface/Miscellaneous/Pin.svg";
import IconVenuesTypeOfVenueApartment from "../_icons/Venues/TypeOfVenue/Apartment.svg";
import IconUserInterfaceMiscellaneousVenues from "../_icons/UserInterface/Miscellaneous/Venues.svg";
import { createRoot } from "react-dom/client";
import MapLocation from "./MapLocation";
import Button from "../Button/Button";
import IconUserInterfaceActionsDelete from "../_icons/UserInterface/Actions/Delete.svg";
import InputGroup from "../_utils/InputGroup";
import { SPACE_CATEGORIES_FLAT } from "@/_constants/space/categories";
import config from "@/_utils/config";
import Alert from "../Alert";
import IconUserInterfaceMiscellaneousTip from "../_icons/UserInterface/Miscellaneous/Tip.svg";
import { useMediaQuery } from "@/_utils/mediaQuery";

const loadMap = async (ref: HTMLDivElement) => {
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
    center: { lat: 38.7214745, lng: -9.1331154 },
    zoom: 12,
    maxZoom: 17,
    minZoom: 8,
    disableDefaultUI: true,
    gestureHandling: "greedy",
  });

  const { AutocompleteService } = await loader.importLibrary("places");

  const autocompleteService = new AutocompleteService();

  const { AdvancedMarkerElement } = await loader.importLibrary("marker");

  const markerIcon = document.createElement("div");
  createRoot(markerIcon).render(<MapLocation />);

  const markerElement = new AdvancedMarkerElement({
    map,
    content: markerIcon,
  });

  const { Geocoder } = await loader.importLibrary("geocoding");

  const geocoder = new Geocoder();

  return { map, autocompleteService, markerElement, geocoder };
};

export type VenueAddress = {
  country: string;
  street1: string;
  street2: string;
  postalCode: string;
  city: string;
};

export type VenueLocation = {
  latitude: number;
  longitude: number;
};

const getAddressComponent = (
  address_components: google.maps.GeocoderAddressComponent[],
  type: string,
) => {
  return address_components?.find(({ types }) => types.includes(type));
};

const formatAddressComponents = (
  addressComponents: google.maps.GeocoderAddressComponent[],
  placeName?: string,
): VenueAddress => {
  const streetName = getAddressComponent(addressComponents, "route")?.long_name;
  const streetNumber = getAddressComponent(
    addressComponents,
    "street_number",
  )?.long_name;

  const street1Base = [streetName, streetNumber].filter(Boolean).join(" ");

  const street1BaseWithName = [placeName, street1Base]
    .filter(Boolean)
    .join(", ");

  const street1 =
    streetNumber || placeName === street1Base
      ? street1Base
      : street1BaseWithName;

  return {
    country: "Portugal - PT",
    street1,
    street2: "",
    postalCode:
      getAddressComponent(addressComponents, "postal_code")?.long_name ?? "",
    city: getAddressComponent(addressComponents, "locality")?.long_name ?? "",
  };
};

const { block, element } = createBEMClasses("input-address");

const InputAddress = ({
  location,
  address,
  debouncedAddress,
  onChangeLocation,
  onChangeAddress,
  showErrors,
  tip,
}: {
  location?: VenueLocation | null;
  address?: VenueAddress | null;
  debouncedAddress?: VenueAddress | null;
  onChangeLocation?: Dispatch<SetStateAction<VenueLocation | null>>;
  onChangeAddress?: Dispatch<SetStateAction<VenueAddress | null>>;
  showErrors?: boolean;
  tip?: ReactNode;
}) => {
  const isMobile = useMediaQuery("large");

  // Google map libraries
  const [map, setMap] = useState<google.maps.Map>();
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService>();
  const [markerElement, setMarkerElement] =
    useState<google.maps.marker.AdvancedMarkerElement>();
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();

  // Map autocomplete
  const [query, debouncedQuery, setQuery] = useDebouncedState("", 500);
  const inputRef = useRef<HTMLInputElement>(null);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [showGuideOptions, setShowGuideOptions] = useState(false);

  const mapRef = useCallback((node: HTMLDivElement) => {
    if (node) {
      loadMap(node).then(
        ({ map, autocompleteService, markerElement, geocoder }) => {
          setMap(map);
          setAutocompleteService(autocompleteService);
          setMarkerElement(markerElement);
          setGeocoder(geocoder);
        },
      );
    }
  }, []);

  useEffect(() => {
    if (map && markerElement) {
      if (location) {
        const formattedLocation = new google.maps.LatLng({
          lat: location.latitude,
          lng: location.longitude,
        });

        map.panTo(formattedLocation);
        map.setZoom(16);
        markerElement.position = formattedLocation;
      } else {
        map.panTo({ lat: 38.7214745, lng: -9.1331154 });
        map.setZoom(12);
        markerElement.position = null;
      }
    }
  }, [location, map, markerElement]);

  const handleQueryChange = (query: string) => {
    setQuery(query);

    if (!query) {
      setShowGuideOptions(true);
    }
  };

  useEffect(() => {
    if (!debouncedQuery) {
      setPredictions([]);
    } else if (autocompleteService) {
      autocompleteService.getPlacePredictions(
        {
          input: debouncedQuery,
          language: "pt-PT",
          region: "pt",
          componentRestrictions: { country: "PT" },
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setPredictions(results ?? []);
          } else if (
            status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            setPredictions([]);
          }
        },
      );
    }
  }, [autocompleteService, debouncedQuery]);

  const calloutOptions =
    predictions.length > 0
      ? predictions.map((prediction) => {
          const iconForType = SPACE_CATEGORIES_FLAT.find((category) =>
            category.googleTypes.some((googleType) =>
              prediction.types.includes(googleType),
            ),
          )?.icon;

          const fallbackIcon = prediction.types.includes("geocode") ? (
            <IconUserInterfaceMiscellaneousVenues />
          ) : (
            <IconVenuesTypeOfVenueApartment />
          );

          return {
            id: prediction.place_id,
            icon: iconForType ?? fallbackIcon,
            text: prediction.structured_formatting.main_text,
            subText: prediction.structured_formatting.secondary_text,
          };
        })
      : [
          {
            id: "current-location",
            icon: <IconUserInterfaceMiscellaneousGps />,
            text: "Usar a minha localização atual",
          },
          {
            id: "search",
            actionText: "Escrever a morada manualmente",
          },
        ];

  const handleCalloutOptionClick = (id: string) => {
    if (id === "current-location") {
      handleCurrentLocationClick();
      setShowGuideOptions(false);
    } else if (id === "search") {
      inputRef.current?.focus();
      setShowGuideOptions(false);
    } else {
      const placeClicked = calloutOptions.find((option) => option.id === id);

      handlePlaceClick(id, placeClicked?.text);
    }
  };

  const handleCurrentLocationClick = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not available");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        geocoder?.geocode(
          {
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          },
          (results, status) => {
            if (
              status === google.maps.GeocoderStatus.OK &&
              results?.[0].geometry?.location &&
              results?.[0].address_components
            ) {
              onChangeLocation?.({
                latitude: results[0].geometry.location.lat(),
                longitude: results[0].geometry.location.lng(),
              });
              onChangeAddress?.(
                formatAddressComponents(results[0].address_components),
              );
            }
          },
        );
      },
      (positionError) => {
        console.warn(
          `Error getting current location - ${positionError.message}`,
        );
      },
    );
  };

  const handlePlaceClick = (placeId: string, placeName?: string) => {
    geocoder?.geocode(
      {
        placeId,
        language: "pt-PT",
        region: "pt",
      },
      (results, status) => {
        if (
          status === google.maps.GeocoderStatus.OK &&
          results?.[0].geometry?.location &&
          results?.[0].address_components
        ) {
          onChangeLocation?.({
            latitude: results[0].geometry.location.lat(),
            longitude: results[0].geometry.location.lng(),
          });
          onChangeAddress?.(
            formatAddressComponents(results[0].address_components, placeName),
          );
        }
      },
    );
  };

  const resetMap = () => {
    onChangeLocation?.(null);
    onChangeAddress?.(null);

    setQuery("");
    setPredictions([]);
    setShowGuideOptions(false);
  };

  useEffect(() => {
    if (debouncedAddress) {
      geocoder?.geocode(
        {
          address: `${debouncedAddress?.street1} ${debouncedAddress?.postalCode}`,
          componentRestrictions: {
            country: "PT",
            locality: debouncedAddress?.city || undefined,
          },
          language: "pt-PT",
          region: "pt",
        },
        (results, status) => {
          if (
            status === google.maps.GeocoderStatus.OK &&
            results?.[0].geometry?.location
          ) {
            onChangeLocation?.({
              latitude: results[0].geometry.location.lat(),
              longitude: results[0].geometry.location.lng(),
            });
          }
        },
      );
    }
  }, [debouncedAddress, geocoder, onChangeLocation]);

  return (
    <StackHalfHalf rightEmpty={!address}>
      <Stack
        gap="1rem"
        style={{ flexDirection: isMobile ? "column-reverse" : "column" }}
      >
        <div className={block()}>
          <div ref={mapRef} className={element("map")} />
          {!address && (
            <Stack gap="0.5rem" className={element("search")}>
              <InputText
                label="Insira a morada do local"
                leftIcon={<IconUserInterfaceMiscellaneousPin />}
                onChange={handleQueryChange}
                value={query}
                onFocus={() => setShowGuideOptions(true)}
                ref={inputRef}
              />
              {(showGuideOptions || predictions.length > 0) && (
                <Callout
                  ariaLabel={
                    predictions.length > 0 ? "Search results" : "Search options"
                  }
                  options={calloutOptions}
                  onClickOption={(id) => handleCalloutOptionClick(id)}
                />
              )}
            </Stack>
          )}
          {!!address && (
            <Button
              type="secondary"
              label="Reset map"
              leftIcon={<IconUserInterfaceActionsDelete />}
              className={element("reset")}
              onClick={() => resetMap()}
            />
          )}
        </div>
        {!!tip && (
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text={tip}
          />
        )}
      </Stack>

      {!!address && (
        <Stack gap="16px">
          <InputText label="País/Região" value={address.country} disabled />
          <InputGroup>
            <InputText
              label="Morada"
              value={address.street1}
              onChange={(street1) => onChangeAddress?.({ ...address, street1 })}
              autoComplete="street-address"
              invalid={showErrors && !address.street1}
            />
            <InputText
              label="Apartamento, porta, etc. (se aplicável)"
              value={address.street2}
              onChange={(street2) => onChangeAddress?.({ ...address, street2 })}
            />
            <InputText
              label="Código postal"
              value={address.postalCode}
              onChange={(postalCode) =>
                onChangeAddress?.({ ...address, postalCode })
              }
              autoComplete="postal-code"
              invalid={showErrors && !address.postalCode}
            />
            <InputText
              label="Cidade/Localidade"
              value={address.city}
              onChange={(city) => onChangeAddress?.({ ...address, city })}
              autoComplete="address-level1"
              invalid={showErrors && !address.city}
            />
          </InputGroup>
        </Stack>
      )}
    </StackHalfHalf>
  );
};

export default InputAddress;
