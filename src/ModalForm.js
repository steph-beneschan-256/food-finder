import { useState } from "react"
import "./modal.css";

export default function ModalForm({onSubmit, onClose}) {
    const [inputText, setInputText] = useState("");
    const [resultList, setResultList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");


    async function searchAddress() {
        // clear error message
        setErrorMsg("");

        setLoading(true);

        const requestURL = "https://api.geoapify.com/v1/geocode/search?" + new URLSearchParams({
            "text": inputText,
            "filter": "place:51701d461b6bac5ec05947b7dc6343e14240f00101f90160b5010000000000c0020992030d53616e204672616e636973636f", // San Francisco ID
            "format": "json",
            "apiKey": "f4ccd24c5ec945d192974e408d9f10a5"  
        });
        const geoapifyResponse = await fetch(requestURL);
        const jsonData = await geoapifyResponse.json();
        console.log(jsonData);

        let results = jsonData.results.filter((result) => {
            return (result.city) && (result.city === "San Francisco");
        })

        if(results.length > 0) {

            // Assume that first result is correct
            let result = results[0];
            onSubmit(result.lat, result.lon);
            onClose();

        }
        else {
            setErrorMsg("Sorry, but we couldn't find any places in San Francisco with that name.");
            setLoading(false);
        }


        
    }

    return(
        <div className="modal-container">
            <div className="modal-inner">
                <h2>Search by address</h2>
                <div>
                    <p>
                        To find food trucks near a particular address, please enter the address below:
                    </p>
                    <p>
                        (Note: Please be sure to enter an address within the city of San Francisco)
                    </p>
                    
                </div>
                <div>
                    <input className="address-input" value={inputText} onChange={(e)=>{setInputText(e.target.value)}}></input>
                </div>
                <div>
                    <button onClick={searchAddress} disabled={loading} className="secondary-button">
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>

                {(errorMsg !== "") &&
                    <div className="error-msg">
                        &#x26A0; {errorMsg}
                    </div>
                }

                <button onClick={onClose} className="tertiary-button">
                    Cancel
                </button>
            </div>
        </div>

    )
}