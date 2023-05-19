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
        this.vendorPopups = new Map();


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

    /*
    This function should be called when the user clicks on the map,
    then clicks on the "Use this location" button that appears in
    the resulting popup
    */
    popUpButtonClicked(lat=this.selectedLat, long=this.selectedLong) {
        this.updateSelectedLocMarker(lat, long);
        if(this.onSelectLocation !== null) {
            this.onSelectLocation(lat, long);
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
                minZoom: 12,
                maxBounds: L.latLngBounds(L.latLng(37.67,-122.69), L.latLng(37.89,-122.22))
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

                // Create a div for within the popup
                let popupDiv = document.createElement("div");
                popupDiv.className = "popup-inner-div";

                // Create a div within the popup that shows the clicked location
                let latlngDiv = document.createElement("div");
                latlngDiv.textContent = `(${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(2)})`;
                popupDiv.appendChild(latlngDiv);

                /*
                Create a div within the popup that shows a "use this location" button
                Clicking the button updates the InputBar component as if the user had
                typed in the the clicked location's coordinates
                */
                let setLocButtonDiv = document.createElement("div");
                let setLocButton = document.createElement("button");
                setLocButton.textContent = "Search at this location";
                setLocButton.onclick = () => {
                    mapManager.popUpButtonClicked(e.latlng.lat, e.latlng.lng);
                    popup.close();
                }
                setLocButton.className = "secondary-button";
                setLocButtonDiv.appendChild(setLocButton);
                popupDiv.appendChild(setLocButtonDiv);

                // let gMapsButtonDiv = document.createElement("div");
                // let gMapsButton = document.createElement("button");
                // gMapsButton.textContent = "View on Google Maps";
                // gMapsButton.onclick = (e) => {
                //     window.open(`google.com/maps/@${e.latlng.lat},${e.latlng.lng},17z`, "_blank");
                // }
                // gMapsButtonDiv.appendChild(gMapsButton);

                popup.setLatLng(e.latlng)
                .setContent(popupDiv)
                .openOn(newMap);
            }
            newMap.on('click', onMapClick);

            this.mapRef = newMap;

            
    }

    openVendorPopup(vendorID) {
        this.vendorPopups[vendorID].openOn(this.mapRef);
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

    // NOTE: radius argument should be given in meters (m)
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

    /*
    For a nearby vendor, create a popup message that will appear upon selecting the
    vendor in the list of search results or clicking its location on the map
    */
    createVendorPopup(vendor) {
        let newPopup = L.popup();
        let popupDiv = document.createElement("div");
            
        let p = document.createElement("p");
        p.textContent = `${vendor.facilitytype} by `;
        let b = document.createElement("b");
        b.textContent = vendor.name;
        p.appendChild(b);
        popupDiv.appendChild(p);

        let p2 = document.createElement("p");
        p2.textContent = `Location: ${vendor.locationdescription}`
        popupDiv.appendChild(p2);

        const vendorLatLng = L.latLng(vendor.location.latitude, vendor.location.longitude);

        newPopup.setLatLng(vendorLatLng).setContent(popupDiv);
        this.vendorPopups[vendor.id] = newPopup;

        return newPopup;
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

            const newPopup = this.createVendorPopup(vendor);
            newMarker.bindPopup(newPopup);
            newMarker.addTo(this.mapRef);
            newVendorMarkers.push(newMarker);
          });
          this.vendorMarkers = newVendorMarkers;
    }

    clearMarkers() {
        if(this.selectedLocMarker !== null)
            this.selectedLocMarker.remove();
        if(this.searchLocMarker !== null)
            this.searchLocMarker.remove();
        if(this.vendorMarkers.length > 0)
            this.vendorMarkers.forEach((marker) => {marker.remove();})
        if(this.rangeCircle !== null)
            this.rangeCircle.remove();
    }
}

const mapManager = new MapManager();

export default mapManager;