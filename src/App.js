import logo from './logo.svg';
import './App.css';
import VendorList from './VendorList';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import MapView from './MapView';
import { useRef, useState } from 'react';
import InputBar from './InputBar';

import mapManager from './MapManager';

// For retrieval of SF data
const appToken = "LXkSVzJ9evKQ88cg6zQGsQENw";

/*
Get distance between two geographic locations, each represented by latitude and longitude
Formula source:
https://en.wikipedia.org/wiki/Geographical_distance#Ellipsoidal_Earth_projected_to_a_plane
*/
function distance(lat1, long1, lat2, long2) {
  let meanLat = (lat1 + lat2) / 2 * (Math.PI/180);
  let deltaPhi = (lat1 - lat2)
  let deltaLambda = (long1 - long2)
  let K1 = 111.13209 - 0.56605*Math.cos(2*meanLat) + 0.00120*Math.cos(4*meanLat);
  let K2 = 111.41513*Math.cos(meanLat) - 0.09455 * Math.cos(3*meanLat) + 0.00012*Math.cos(5*meanLat);
  return Math.sqrt(Math.pow(K1*deltaPhi,2) + Math.pow(K2*deltaLambda,2));
}

function App() {

  // list of nearby vendors
  const [vendors, setVendors] = useState([]);

  // list of food types offered by nearby vendors
  const [foodTypes, setFoodTypes] = useState(new Set());

  const [selectedUnit, setSelectedUnit] = useState("km");

  // Vendor Data fetched from the SF dataset
  // It's probably safe to assume that the data will not be modified on a daily basis,
  // so save the data for the rest of the user's session
  const vendorData = useRef(null);

  async function getVendors() {
    if(vendorData.current === null) {
      const newVendorData = await fetch("https://data.sfgov.org/resource/rqzj-sfat.json", {
        method: "GET",
        data: {
          limit: 5000,
          app_token: appToken
        }
      });
      vendorData.current = await newVendorData.json();
    }

    return vendorData.current;
  }
 
  function findVendors(lat, long, radius, unit="km") { // radius should be in km
    // Note: input validation is handled by the InputBar class

      getVendors().then((vendorInfo) => {
        let nearbyVendors = [];
        let nearbyFoodTypes = new Set();

        vendorInfo.forEach((location, i) => {
            if(location.status === "APPROVED") {
  
                const vendorLat = parseFloat(location.location.latitude);
                const vendorLong = parseFloat(location.location.longitude);
                
                const c = distance(lat, long, vendorLat, vendorLong);
                if(c <= radius) {
                    const foodTypes = location.fooditems.split(/: ?/);
                    foodTypes.forEach((foodType) => 
                      {nearbyFoodTypes.add(foodType)}
                    );
                    nearbyVendors.push({
                        id: location.objectid,
                        name: location.applicant,
                        location: location.location,
                        distance: c,
                        foodItems: foodTypes
  
                    })
                };
            }
        })
        nearbyVendors.sort((a,b) => a.distance - b.distance); // show closest vendors first
        setVendors(nearbyVendors);
        setFoodTypes(nearbyFoodTypes);
  
        // Update map display
        mapManager.updateRangeCircle(lat, long, radius * 1000); // convert radius from km to m
        mapManager.updateVendorMarkers(nearbyVendors);
        mapManager.updateSearchLocMarker(lat, long);
        mapManager.focusMapView(lat,long);
  
        setSelectedUnit(unit);

      })
      
    }

  return (
    <div className="App">
      <header></header>

      <InputBar processInput={findVendors}/>

      <div className="map-and-vendors-container">
        <VendorList vendors={vendors} unit={selectedUnit}/>
        <MapView updateLocation={()=>{console.log('a')}}/>
      </div>

      {/* <div>
        <h3>Types of food nearby:</h3>
        <ul>
          {(Array.from(foodTypes)).map((foodType) => {
            return <li>{foodType}</li>
          })}
        </ul>
      </div> */}

            
    </div>
  );
}

export default App;
