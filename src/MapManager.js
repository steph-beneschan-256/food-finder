import L from "leaflet";
import 'leaflet/dist/leaflet.css';

/*
TODO: write note explaining why this class is necessary
*/

//TODO: add units

// Custom icons for the user location and food vendors
const userLocIconA = L.icon({
    iconUrl: "prelocus.svg",
    iconRetinalUrl: "prelocus.png",
    iconSize: L.point(20, 20)
})
const userLocIconB = L.icon({
    iconUrl: "locus.svg",
    iconRetinaUrl: "locus.png",
    iconSize: L.point(20, 20)
});  
const foodMarker = L.icon({
    iconUrl: "food-vendor.svg",
    iconRetinaUrl: "food-vendor.png",
    iconSize: L.point(20, 20)
});

class MapManager {
    constructor() {
        this.mapRef = null;

        this.selectedLocMarker = null; // before search, after selecting location on map
        this.searchLocMarker = null; // after search
        this.rangeCircle = null;
        this.vendorMarkers = [];


        /*
        todo: note about map popups
        */
        this.onSelectLocation = null;
        this.selectedLat = null;
        this.selectedLong = null;
    }

    convertUnits(quantity, fromUnit, toUnit) {
        if(fromUnit === toUnit)
            return quantity;
    
        //convert fromUnit to km
        let km = quantity;
        switch(fromUnit) {
            case "km":
                break;
            case "mi":
                km *= 1*1.60934;
                break;
            default:
                break;
        }
    
        switch(toUnit) {
            case "km":
                return km;
            case "mi":
                return km/1.60934;
            default:
                return km;
        }
    
    };

    popUpButtonClicked(e) {
        this.updateSelectedLocMarker(this.selectedLat, this.selectedLong);
        if(this.onSelectLocation !== null) {
            this.onSelectLocation(this.selectedLat, this.selectedLong);
        }
    }

    setSelectedLat(lat) {
        this.selectedLat = lat;
    }

    setSelectedLong(long) {
        this.selectedLong = long;
    }

    setOnSelectLocation(f) {
        this.onSelectLocation = f;
    }

    createMap(containerRef) {
            const newMap = L.map(containerRef, {
                minZoom: 9,
                maxBounds: L.latLngBounds(L.latLng(37.4773,-122.6986), L.latLng(37.9799,-122.2174))
            });

            newMap.setView([37.756141, -122.444834], 13); //roughly the center of San Francisco

            // Add tile layer and OpenStreetMap attribution
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
            }).addTo(newMap);

            let popup = L.popup();



            function onMapClick(e) {
                mapManager.setSelectedLat(e.latlng.lat);
                mapManager.setSelectedLong(e.latlng.lng);

                let popupButton = document.createElement("button");
                popupButton.textContent = "Use this location";
                popupButton.onclick = (e) => {
                    mapManager.popUpButtonClicked(e);
                    popup.close();
                }

                popup.setLatLng(e.latlng)
                .setContent(popupButton)
                //.setContent(e.latlng.toString())
                .openOn(newMap);
            }
            newMap.on('click', onMapClick);

            this.mapRef = newMap;

            
    }

    getMapRef() {
        return this.mapRef;
    }

    // Functions for updating the map
    focusMapView(lat, long, zoomLevel=12) {
        if(this.mapRef !== null)
            this.mapRef.setView([lat, long], zoomLevel);
    }

    updateSelectedLocMarker(lat, long) {
        if(this.selectedLocMarker !== null) {
            this.selectedLocMarker.remove();
        }
        const newMarker = L.marker([lat, long], {
            icon: userLocIconA
        });
        newMarker.addTo(this.mapRef);
        this.selectedLocMarker = newMarker;
    }

    updateSearchLocMarker(lat, long) {
        if(this.searchLocMarker !== null)
            this.searchLocMarker.remove();
        const newMarker = L.marker([lat, long], {
            icon: userLocIconB
        });
        newMarker.addTo(this.mapRef);
        this.searchLocMarker = newMarker;

    }

    // NOTE: radius must be given in meters (m)
    updateRangeCircle(lat, long, radius) {
        if(this.rangeCircle !== null)
            this.rangeCircle.remove();
        const newCircle = L.circle([lat, long], {
            radius: radius,
            color: "blue",
            fillColor: "blue",
            fillOpacity: 0.1,
            weight: 1
        });
        newCircle.addTo(this.mapRef);
        this.rangeCircle = newCircle;
    }

    updateVendorMarkers(nearbyVendors) {
        if(this.vendorMarkers.length > 0) {
            this.vendorMarkers.forEach((marker) => {marker.remove();})
        }
        const newVendorMarkers = [];
        nearbyVendors.forEach((vendor) => {
            let newMarker = L.marker([vendor.location.latitude, vendor.location.longitude], {
              icon: foodMarker
            });
            newMarker.bindPopup(vendor.name);
            newMarker.addTo(this.mapRef);
            newVendorMarkers.push(newMarker);
          });
          this.vendorMarkers = newVendorMarkers;
    }
}

const mapManager = new MapManager();

export default mapManager;