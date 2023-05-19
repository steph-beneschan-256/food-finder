import { useState } from "react";
import mapManager from "./MapManager";
import ModalForm from "./ModalForm";

const selectableUnits = ["km", "mi"];

export default function InputBar({onLocationSelected, onOptionsUpdated, defaultOptions}) {
    const [selectedUnits, setSelectedUnits] = useState(defaultOptions.units);
    const [radius, setRadius] = useState(defaultOptions.radius);
    const [errorMsg, setErrorMsg] = useState("");
    const [loadingDeviceLoc, setLoadingDeviceLoc] = useState(false);
    const [searchModalOpen, setSearchModalOpen] = useState(false);
    const [desiredFoodType, setDesiredFoodType] = useState(defaultOptions.desiredFoodType);

    function requestUserLocation() {
        setLoadingDeviceLoc(true);
        navigator.geolocation.getCurrentPosition((pos) => {
            setLoadingDeviceLoc(false);
            const lat = pos.coords.latitude;
            const long = pos.coords.longitude;
            if(mapManager.isInSanFrancisco(lat, long))
                onLocationSelected(lat, long); // Tell the parent component to conduct the search
            else
                setErrorMsg("Sorry, but it looks like you're outside of San Francisco.");
        },
        (err) => {
            setErrorMsg("Sorry, we couldn't get your location.");
            setLoadingDeviceLoc(false);
        });
    }

    function openSearchModal() {
        setSearchModalOpen(true);

    }

    function closeSearchModal() {
        setSearchModalOpen(false);
    }

    return(
        <div className="input-pane">

            {searchModalOpen && (
                <ModalForm onSubmit={(lat, long) => onLocationSelected(lat, long)} onClose={closeSearchModal}/>
            )}
                        
            <div>
                <h3>
                To find food trucks near a particular location, please choose one of the input options below (you can also click on the map):
                </h3>

                <button onClick={openSearchModal} className="secondary-button">
                    Enter Address
                </button>
                
                <button onClick={requestUserLocation} disabled={loadingDeviceLoc} className="secondary-button">
                    {loadingDeviceLoc ? "Getting your location..." : "Get my location"}
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

                <br/>

                <div>
                    <label>
                        <div>
                            3. Only show vendors offering this type of food:
                        </div>
                        <input className="text-input" type="text" value={desiredFoodType}
                        placeholder="(Leave blank to accept all food types)"
                        onChange={(e) => {
                            setDesiredFoodType(e.target.value);
                            onOptionsUpdated("desiredFoodType", e.target.value);
                        }}/>
                    </label>
                </div>

                {/* <div className="divider"/> */}
            </div>

        </div>
    )

}