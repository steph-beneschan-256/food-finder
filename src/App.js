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

const testData = require("./test-data.json");

// debug function to get different food item types
function getFoodItemTypes() {
  let foodItemTypes = new Set();
  testData.forEach((location, i) => {
    if(location.fooditems) {
      location.fooditems.split(": ").forEach((item) => {
        foodItemTypes.add(item);
      });
    }

  });
  console.log(foodItemTypes);
}

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

  const [selectedUnit, setSelectedUnit] = useState("km");
 
  function findVendors(lat, long, radius, unit="km") { // radius should be in km
    // Note: input validation is handled by the InputBar class

      let nearbyVendors = [];

      testData.forEach((location, i) => {
          if(location.status === "APPROVED") {

              const vendorLat = parseFloat(location.location.latitude);
              const vendorLong = parseFloat(location.location.longitude);
              
              const c = distance(lat, long, vendorLat, vendorLong);
              if(c <= radius) {
                  nearbyVendors.push({
                      id: i,
                      name: location.applicant,
                      location: location.location,
                      distance: c,
                      foodItems: location.fooditems.split(/: ?/)

                  })
              };
          }
      })
      nearbyVendors.sort((a,b) => a.distance - b.distance); // show closest vendors first
      console.log(nearbyVendors);
      setVendors(nearbyVendors);

      // Update map display
      mapManager.updateRangeCircle(lat, long, radius * 1000); // convert radius from km to m
      mapManager.updateVendorMarkers(nearbyVendors);
      mapManager.updateSearchLocMarker(lat, long);
      mapManager.focusMapView(lat,long);

      setSelectedUnit(unit);
      
    }

  return (
    <div className="App">
      <header>
        
      </header>

      <InputBar processInput={findVendors}/>

      <div className="map-and-vendors-container">
        <VendorList vendors={vendors} unit={selectedUnit}/>
        <MapView updateLocation={()=>{console.log('a')}}/>
      </div>

            
    </div>
  );
}

export default App;
