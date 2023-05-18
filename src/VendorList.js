import { useState } from "react"
import './VendorList.css';
import MapView from "./MapView";
import mapManager from "./MapManager";


function VendorRow({id, vendor, unit="km"}) {
    const displayDistance = mapManager.convertUnits(vendor.distance, "km", unit);
    return(
        <div key={vendor.id}
        onClick={()=>mapManager.focusMapView(vendor.location.latitude, vendor.location.longitude)}
        className="vendor-table-cell">
            <h1>{vendor.name}</h1>
            <h1>{vendor.key}</h1>
            <h2>{`${(vendor.distance * conversionFactors[unit]).toFixed(2)} ${unit} away`}</h2>
            <h2>{vendor.foodItems.join(", ")}</h2>
            {/* <h2>{`${vendor.location.longitude}, ${vendor.location.latitude}`}</h2> */}
        </div>
    )
}

// Factors for converting from km to other units
const conversionFactors = {
    "km": 1,
    "mi": 0.621504
}

export default function VendorList({vendors, unit}) {

    return( 
        <div className="vendor-view-container">
            <div className="vendor-view-container-inner">
                {(vendors.length > 0) ? (
                    <div>
                        {vendors.map((vendor) => {
                            return(<VendorRow id={vendor.id} vendor={vendor} unit={unit}/>);
                        })}
                    </div>) 
                :   (<div>
                    <p>
                        No vendors found.
                    </p>
                    <p>
                        Please try increasing your search radius or searching around a different location.
                    </p>
                    </div>)}
            </div>
        </div>

    )
}