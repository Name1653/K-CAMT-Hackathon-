const RESTAURANT_API_BASE = "http://localhost:8080";
let selectedGooglePlace = null;

async function loadRestaurantGooglePlaces() {
    const response = await fetch(`${RESTAURANT_API_BASE}/api/maps/config`);
    if (!response.ok) throw new Error("Could not load the Google Maps configuration.");
    const { apiKey } = await response.json();

    await new Promise((resolve, reject) => {
        window.__initRestaurantPlaces = resolve;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=en&region=TH&callback=__initRestaurantPlaces&loading=async`;
        script.async = true;
        script.onerror = () => reject(new Error("Google Places could not be loaded."));
        document.head.appendChild(script);
    });
}

function initializeRestaurantAutocomplete() {
    const input = document.getElementById("restaurantLocation");
    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes: ["th"],
        includedPrimaryTypes: ["restaurant", "cafe", "bakery", "meal_takeaway"]
    });
    autocomplete.id = "restaurantLocation";
    autocomplete.placeholder = "Search by restaurant name or address";
    input.replaceWith(autocomplete);

    autocomplete.addEventListener("input", () => {
        selectedGooglePlace = null;
        document.getElementById("restaurantName").value = "";
        document.getElementById("selectedGooglePlace").style.display = "none";
    });

    autocomplete.addEventListener("gmp-select", async event => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({
            fields: ["id", "displayName", "formattedAddress", "location"]
        });
        if (!place.id || !place.location) {
            alert("Please select a valid Google place.");
            return;
        }

        selectedGooglePlace = {
            googlePlaceId: place.id,
            name: place.displayName,
            location: place.formattedAddress,
            latitude: place.location.lat(),
            longitude: place.location.lng()
        };

        document.getElementById("restaurantName").value = selectedGooglePlace.name;
        const selected = document.getElementById("selectedGooglePlace");
        selected.innerHTML = `<b>Selected:</b> ${escapeRestaurantHtml(selectedGooglePlace.name)}<br>${escapeRestaurantHtml(selectedGooglePlace.location)}`;
        selected.style.display = "block";
    });
}

function escapeRestaurantHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
}

async function submitRestaurant(event) {
    event.preventDefault();
    const openTime = document.getElementById("openTime").value;
    const closeTime = document.getElementById("closeTime").value;

    if (!selectedGooglePlace) {
        alert("Please select your restaurant from Google Places.");
        return;
    }
    if (!openTime || !closeTime) {
        alert("Please enter the opening and closing times.");
        return;
    }

    try {
        const response = await fetch(`${RESTAURANT_API_BASE}/api/restaurants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                ...selectedGooglePlace,
                openTime: `${openTime}:00`,
                closeTime: `${closeTime}:00`
            })
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Restaurant registration failed.");
        }

        const restaurant = await response.json();
        const meResponse = await fetch(`${RESTAURANT_API_BASE}/api/auth/me`, {
            credentials: "include"
        });
        if (meResponse.ok) {
            const me = await meResponse.json();
            localStorage.setItem(`greenloop_restaurant_${me.memberId}`, JSON.stringify(restaurant));
        }

        alert("Your restaurant has been registered as a GreenLoop Partner.");
        window.location.replace("/index.html");
    } catch (error) {
        console.error("Restaurant registration failed:", error);
        alert(error.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof setLanguage === "function") setLanguage("en", { silent: true });
    document.getElementById("restaurantForm")?.addEventListener("submit", submitRestaurant);
    try {
        await loadRestaurantGooglePlaces();
        initializeRestaurantAutocomplete();
    } catch (error) {
        console.error(error);
        alert(`${error.message} Check the backend and API key settings.`);
    }
});
