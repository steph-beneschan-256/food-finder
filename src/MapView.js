import 'leaflet/dist/leaflet.css';
import {useEffect, useRef} from "react";
import mapManager from "./MapManager";

//https://react.dev/reference/react/useEffect#wrapping-effects-in-custom-hooks


export default function MapView() {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if(mapRef.current === null) {
            mapManager.createMap(mapContainerRef.current);
            mapRef.current = mapManager.getMapRef();
            // onMapConstructed(mapManager.getMapRef());
        }
    });

    return(
        <div className="display-map" ref={mapContainerRef} />
    )
}