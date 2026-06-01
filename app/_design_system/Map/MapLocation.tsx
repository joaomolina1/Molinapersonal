import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceMiscellaneousPin from "../_icons/UserInterface/Miscellaneous/Pin.svg";

const { block, element } = createBEMClasses("map-location");

const MapLocation = () => (
  <div className={block()}>
    <div className={element("icon")}>
      <IconUserInterfaceMiscellaneousPin />
    </div>
  </div>
);

export default MapLocation;
