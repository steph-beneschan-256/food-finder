import { useState } from "react";
import mapManager from "./MapManager";

const validLong = /^0*-?((180(\.0*)?)|(1[0-7]\d|\d\d?)(\.\d*)?)$/;
const validLat = /^0*-?((90(\.0*)?)|([0-8]?\d(\.\d*)?))$/;
const validRad = /^\d{1,3}$/;

const selectableUnits = ["km", "mi"];
const conversionFactors = {
    "km": 1,
    "mi": 0.621504
}

// Check whether (lat, long) describes a location roughly within the SF area
function inSanFrancisco(lat, long) {
    return (
        (37.6773 <= lat)
        && (lat <= 37.9799)
        && (-122.6986 <= long)
        && (long <= -122.2174)
    );

}

export default function InputBar({onLocationSelected, onOptionsUpdated, defaultOptions}) {

    const [inputLat, setInputLat] = useState("37.719503");
    const [inputLong, setInputLong] = useState("-122.480777");

    const [selectedUnits, setSelectedUnits] = useState(defaultOptions.units);
    const [radius, setRadius] = useState(defaultOptions.radius);

    const [errorMsg, setErrorMsg] = useState("");

    const [loadingDeviceLoc, setLoadingDeviceLoc] = useState(false);

    /*
    When the user clicks on the map at a certain location,
    then clicks on the "use this location" button that consequently pops up,
    act as though the user input that location into this input component
    */
    // mapManager.setOnSelectLocation((lat, long) => {
    //     setInputLat(lat);
    //     setInputLong(long);
    // })

    // err: function which accepts an error message as a parameter
    function inputIsValid(err) {
        if(!validLat.test(inputLat)) {
            err("Please enter a valid latitude.");
            return false;
        }
        if(!validLong.test(inputLong)) {
            err("Please enter a valid longitude.");
            return false;
        }
        if(!inSanFrancisco(parseFloat(inputLat), parseFloat(inputLong))) {
            err("Please enter a location within the San Francisco area.");
            return false;
        }
        if(!validRad.test(radius)) {
            err("Please enter a valid radius of up to three digits.");
            return false;
        }
        return true;
    }

    function requestUserLocation() {
        setLoadingDeviceLoc(true);
        navigator.geolocation.getCurrentPosition((pos) => {
            setLoadingDeviceLoc(false);
            const lat = pos.coords.latitude;
            const long = pos.coords.longitude;
            onLocationSelected(lat, long); // Tell the parent component to conduct the search
        },
        (err) => {
            setErrorMsg("Sorry, we couldn't get your location. Please choose a location on the map instead.");
            setLoadingDeviceLoc(false);
        });
    }

    function submitInput() {
        if(inputIsValid((errMsg) => {setErrorMsg(errMsg)})) {
            setErrorMsg("");
            const lat = parseFloat(inputLat);
            const long = parseFloat(inputLong);
            const searchRadius = parseInt(radius) * conversionFactors[selectedUnits]; //get specified radius in km

            onLocationSelected(lat, long, searchRadius, selectedUnits);
        }
        else {
                console.log("invalid input");
        }

    }

    return(
        <div className="input-pane">

                        
            <div>
                <h3>
                To search, please select a location on the map or use your device location:
                </h3>
                
                <button onClick={requestUserLocation} disabled={loadingDeviceLoc} className="secondary-button">
                    {loadingDeviceLoc ? "Getting your location..." : "Use my location"}
                </button>

                {(errorMsg !== "") &&
                    <div className="error-msg">
                        &#x26A0; {errorMsg}
                    </div>
                }
            </div>

            <div className="options">
                <div className="divider"/>
                <h3>Options:</h3>
                <div>
                    <label>
                        1. Preferred Units of Distance:
                        <div className="unit-select-options">
                        {
                            selectableUnits.map((unit) => {
                                return(
                                    <div key={unit} className="unit-select-option">
                                        <input type="radio" name="unit-select" 
                                        checked={selectedUnits === unit}
                                        value={unit}
                                        onChange={(e) => {
                                            setSelectedUnits(e.target.value);
                                            onOptionsUpdated("units", e.target.value);
                                            }}/>
                                        {unit}
                                    </div>
                                )
                            })
                        }
                        </div>
                    </label>
                </div>
                
                {/* <div className="divider"/> */}
                <br/>

                <div>
                    <label className="input-search-radius">
                        <div>
                            2. Find vendors within this distance:
                        </div>
                        <div>
                            <b>{radius}</b> {selectedUnits}
                        </div>
                        <input type="range" value={radius} min="1" max="10"
                        onChange={(e)=>{
                            setRadius(e.target.value);
                            onOptionsUpdated("radius", e.target.value);
                        }}/>
                        
                    </label>
                </div>
                {/* <div className="divider"/> */}
            </div>

        </div>
    )

}