import { useState } from "react";
import mapManager from "./MapManager";
import VendorList from "./VendorList";
import InputBar from "./InputBar";

export default function StatusPane({vendorsFound, onResetSearch, unit}) {

    return(
        <div className="status-pane">
            <div>
                <VendorList vendors={vendorsFound} unit={unit}/>
                <div className="divider"/>
                <div className="new-search-button-container">
                    <button onClick={onResetSearch} className="secondary-button new-search-button">
                        New Search
                    </button>
                </div>
                
            </div>
        </div>
    )
};