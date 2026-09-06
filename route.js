const MAPS_API_BASE = "http://localhost:8080/api/maps";

const routeState = {
    map: null,
    origin: null,
    destination: null,
    routePolyline: null,
    markers: [],
    places: [],
    baseRoute: null,
    currentRoute: null,
    selectedPlace: null,
    selectedFood: null,
    partnerFoods: [],
    foodRequestRestaurantId: null,
    visibleStoreCount: 3,
    travelMode: "TRANSIT"
};

// Estimated avoided lifecycle emissions for one rescued serving (kg CO2e).
// The model uses category-level serving assumptions because registered foods do not yet store weight.
const FOOD_SAVED_KG_CO2E = {
    MEAT: 2.50,
    VEGE: 0.50,
    BAKERY: 0.35,
    PROCESSED: 0.90,
    DRINKS: 0.25,
    DEFAULT: 0.80
};

// Operational passenger emissions in kg CO2e/km. Walking is treated as zero;
// transit uses the 2026 UK Government average local bus factor (0.10151 kg/pkm),
// and car uses the 2025 Government average petrol-car example factor (0.16272 kg/km).
const TRAVEL_KG_CO2E_PER_KM = { WALK: 0, TRANSIT: 0.10151, DRIVE: 0.16272 };

function setRouteStatus(message, isError = false) {
    const status = document.getElementById("routeStatus");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("error", isError);
}

async function fetchJson(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const detail = body?.error?.message || body?.message || `Request failed (${response.status})`;
        throw new Error(detail);
    }
    return body;
}

async function loadGoogleMaps() {
    const { apiKey } = await fetchJson(`${MAPS_API_BASE}/config`);
    if (!apiKey) throw new Error("The Google Maps web API key is not configured.");

    await new Promise((resolve, reject) => {
        window.__initGreenLoopMap = resolve;
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places,geometry&language=en&region=TH&callback=__initGreenLoopMap&loading=async`;
        script.async = true;
        script.onerror = () => reject(new Error("Google Maps could not be loaded."));
        document.head.appendChild(script);
    });
}

function initializeMap() {
    routeState.map = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: 18.7883, lng: 98.9853 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });
    document.getElementById("mapLoading")?.remove();

    bindAutocomplete("routeOrigin", "origin");
    bindAutocomplete("routeDestination", "destination");
}

function bindAutocomplete(inputId, stateKey) {
    const input = document.getElementById(inputId);
    const initialAddress = input.value.trim();
    const autocomplete = new google.maps.places.PlaceAutocompleteElement({
        includedRegionCodes: ["th"]
    });
    autocomplete.id = inputId;
    autocomplete.setAttribute("aria-label", input.getAttribute("aria-label") || inputId);
    autocomplete.placeholder = initialAddress;
    routeState[stateKey] = initialAddress ? { address: initialAddress } : null;
    input.replaceWith(autocomplete);

    autocomplete.addEventListener("gmp-select", async event => {
        const place = event.placePrediction.toPlace();
        await place.fetchFields({ fields: ["displayName", "formattedAddress", "location", "id"] });
        if (!place.location) {
            routeState[stateKey] = null;
            setRouteStatus("Please select a place from the suggestions.", true);
            return;
        }
        routeState[stateKey] = {
            address: place.formattedAddress || place.displayName,
            latitude: place.location.lat(),
            longitude: place.location.lng()
        };
        setRouteStatus("");
    });
    autocomplete.addEventListener("input", () => { routeState[stateKey] = null; });
}

function inputLocation(inputId, selected) {
    if (selected) return selected;
    const address = String(document.getElementById(inputId).value || "").trim();
    return address ? { address } : null;
}

async function resolveLocation(location) {
    if (!location || location.latitude != null) return location;
    const { places } = await google.maps.places.Place.searchByText({
        textQuery: location.address,
        fields: ["displayName", "formattedAddress", "location"],
        region: "TH",
        language: "en",
        maxResultCount: 1
    });
    const place = places?.[0];
    if (!place?.location) {
        throw new Error(`Place not found: ${location.address}`);
    }
    return {
        address: place.formattedAddress || place.displayName,
        latitude: place.location.lat(),
        longitude: place.location.lng()
    };
}

async function requestRoute(waypoint = null) {
    const originInput = inputLocation("routeOrigin", routeState.origin);
    const destinationInput = inputLocation("routeDestination", routeState.destination);
    const origin = await resolveLocation(originInput);
    const destination = await resolveLocation(destinationInput);
    if (!origin || !destination) throw new Error("Please enter an origin and destination.");

    if (waypoint && routeState.travelMode === "TRANSIT") {
        const [firstLeg, secondLeg] = await Promise.all([
            fetchRouteBetween(origin, waypoint),
            fetchRouteBetween(waypoint, destination)
        ]);
        return combineRouteLegs(firstLeg, secondLeg);
    }

    return fetchRouteBetween(origin, destination, waypoint);
}

async function fetchRouteBetween(origin, destination, waypoint = null) {
    const data = await fetchJson(`${MAPS_API_BASE}/routes`, {
        method: "POST",
        body: JSON.stringify({ origin, destination, waypoint, travelMode: routeState.travelMode })
    });
    if (!data.routes?.length) {
        if (["WALK", "DRIVE"].includes(routeState.travelMode)) {
            throw new Error("No route is available for this travel mode. Try another mode.");
        }
        throw new Error("No route was found. Please select exact places from the suggestions.");
    }
    return data.routes[0];
}

function durationSeconds(duration = "0s") {
    return Number.parseInt(duration, 10) || 0;
}

function combineRouteLegs(firstLeg, secondLeg) {
    const firstPath = google.maps.geometry.encoding.decodePath(firstLeg.polyline.encodedPolyline);
    const secondPath = google.maps.geometry.encoding.decodePath(secondLeg.polyline.encodedPolyline);
    const combinedPath = firstPath.concat(secondPath.slice(1));

    return {
        distanceMeters: (firstLeg.distanceMeters || 0) + (secondLeg.distanceMeters || 0),
        duration: `${durationSeconds(firstLeg.duration) + durationSeconds(secondLeg.duration)}s`,
        polyline: {
            encodedPolyline: google.maps.geometry.encoding.encodePath(combinedPath)
        }
    };
}

function clearMapObjects() {
    if (routeState.routePolyline) routeState.routePolyline.setMap(null);
    routeState.markers.forEach(marker => marker.setMap(null));
    routeState.markers = [];
}

function addMarker(position, title, color) {
    const marker = new google.maps.Marker({
        map: routeState.map,
        position,
        title,
        label: { text: title.slice(0, 1), color: "white", fontWeight: "700" },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 3
        }
    });
    routeState.markers.push(marker);
}

function renderRoute(route, selectedPlace = null) {
    routeState.currentRoute = route;
    clearMapObjects();
    const path = google.maps.geometry.encoding.decodePath(route.polyline.encodedPolyline);
    routeState.routePolyline = new google.maps.Polyline({
        map: routeState.map,
        path,
        strokeColor: "#16a36b",
        strokeOpacity: 0.95,
        strokeWeight: 6
    });

    addMarker(path[0], "A", "#407de8");
    addMarker(path[path.length - 1], "B", "#ff6b6b");
    if (selectedPlace?.location) {
        addMarker(selectedPlace.location, "S", "#16a36b");
    }

    const bounds = new google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    routeState.map.fitBounds(bounds, 55);
}

async function findPlacesAlongRoute(encodedPolyline) {
    const data = await fetchJson(`${MAPS_API_BASE}/places-along-route`, {
        method: "POST",
        body: JSON.stringify({ encodedPolyline, query: "eco-friendly restaurant vegan food" })
    });
    routeState.places = data.places || [];
    await attachGreenLoopRestaurants(encodedPolyline);
    renderPlaces();
}

async function attachGreenLoopRestaurants(encodedPolyline) {
    try {
        const restaurants = await fetchJson("http://localhost:8080/api/restaurants/partners");
        const routePath = google.maps.geometry.encoding.decodePath(encodedPolyline);
        const nearbyPartners = restaurants.filter(restaurant =>
            distanceFromRouteMeters(restaurant, routePath) <= 2000
        );
        const byPlaceId = new Map(nearbyPartners.map(restaurant => [restaurant.googlePlaceId, restaurant]));
        routeState.places = routeState.places.map(place => ({
            ...place,
            greenLoopRestaurant: byPlaceId.get(place.id) || null
        }));

        const existingPlaceIds = new Set(routeState.places.map(place => place.id));
        nearbyPartners.forEach(restaurant => {
            if (existingPlaceIds.has(restaurant.googlePlaceId)) return;
            routeState.places.unshift({
                id: restaurant.googlePlaceId,
                displayName: { text: restaurant.name },
                formattedAddress: restaurant.location,
                location: {
                    latitude: restaurant.latitude,
                    longitude: restaurant.longitude
                },
                primaryType: "restaurant",
                greenLoopRestaurant: restaurant
            });
        });
    } catch (error) {
        console.error("GreenLoop restaurant matching failed:", error);
    }
}

function distanceFromRouteMeters(restaurant, routePath) {
    const restaurantPoint = new google.maps.LatLng(restaurant.latitude, restaurant.longitude);
    return routePath.reduce((minimum, point) => Math.min(
        minimum,
        google.maps.geometry.spherical.computeDistanceBetween(restaurantPoint, point)
    ), Number.POSITIVE_INFINITY);
}

function escapeHtml(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
}

function renderPlaces() {
    const list = document.getElementById("storeList");
    if (!routeState.places.length) {
        list.innerHTML = '<div class="storeListEmpty">No matching stores were found along this route.</div>';
        document.getElementById("selectedStoreNote").textContent = "";
        return;
    }

    const visiblePlaces = routeState.places.slice(0, routeState.visibleStoreCount);
    list.innerHTML = visiblePlaces.map((place, index) => {
        const name = place.displayName?.text || "Unnamed place";
        const type = (place.primaryType || "restaurant").replaceAll("_", " ");
        const rating = place.rating ? ` · ★ ${place.rating}` : "";
        const partnerBadge = place.greenLoopRestaurant
            ? '<div class="co2Badge">GreenLoop Partner</div>'
            : '';
        return `<button type="button" class="storeRow" data-place-index="${index}">
            <div><div class="name">${escapeHtml(name)}</div>
            <div class="meta">${escapeHtml(type)}${rating}<br>${escapeHtml(place.formattedAddress || "")}</div></div>
            ${partnerBadge}
        </button>`;
    }).join("");

    const remainingCount = routeState.places.length - visiblePlaces.length;
    if (remainingCount > 0) {
        list.insertAdjacentHTML("beforeend", `
            <button type="button" id="storeShowMore" class="storeShowMore">
                Show more (${remainingCount})
            </button>
        `);
        document.getElementById("storeShowMore").addEventListener("click", () => {
            routeState.visibleStoreCount = routeState.places.length;
            renderPlaces();
        });
    }

    list.querySelectorAll(".storeRow").forEach(row => {
        row.addEventListener("click", () => selectPlace(Number(row.dataset.placeIndex), row));
    });
}

async function selectPlace(index, row) {
    const place = routeState.places[index];
    if (!place?.location) return;
    document.querySelectorAll(".storeRow").forEach(item => item.classList.remove("selected"));
    row.classList.add("selected");
    if (place.greenLoopRestaurant) {
        routeState.selectedFood = null;
        updateCarbonMetric();
        loadPartnerFoods(place.greenLoopRestaurant.id);
    } else {
        hidePartnerFoods();
    }
    setRouteStatus("Calculating a route via the selected store…");

    try {
        const route = await requestRoute({
            latitude: place.location.latitude,
            longitude: place.location.longitude
        });
        const selectedPlace = {
            ...place,
            location: { lat: place.location.latitude, lng: place.location.longitude }
        };
        routeState.selectedPlace = selectedPlace;
        renderRoute(route, selectedPlace);
        updateCarbonMetric();

        const extra = Math.max(0, route.distanceMeters - routeState.baseRoute.distanceMeters);
        const note = document.getElementById("selectedStoreNote");
        note.innerHTML = `Selected: <b>${escapeHtml(place.displayName?.text || "Store")}</b><br>` +
            `Extra distance: ${formatDistance(extra)} · Total ${formatDistance(route.distanceMeters)} · ${formatDuration(route.duration)}`;
        setRouteStatus("Showing the route via the selected store.");
    } catch (error) {
        setRouteStatus(error.message, true);
    }
}

async function loadPartnerFoods(restaurantId) {
    routeState.foodRequestRestaurantId = restaurantId;
    routeState.partnerFoods = [];
    routeState.selectedFood = null;
    const panel = document.getElementById("partnerFoodPanel");
    const list = document.getElementById("partnerFoodList");
    panel.classList.add("visible");
    list.innerHTML = '<div class="partnerFoodEmpty">Loading registered food…</div>';

    try {
        const foods = await fetchJson(`http://localhost:8080/api/foods/restaurant/${restaurantId}`);
        if (routeState.foodRequestRestaurantId !== restaurantId) return;
        const availableFoods = foods.filter(food => !food.sold);
        routeState.partnerFoods = availableFoods;
        routeState.selectedFood = null;
        updateCarbonMetric();
        if (!availableFoods.length) {
            list.innerHTML = '<div class="partnerFoodEmpty">There are currently no registered food items.</div>';
            return;
        }

        list.innerHTML = availableFoods.map(food => `
            <div class="partnerFoodCard" data-food-id="${food.id}">
                <button type="button" class="partnerFoodSelect" aria-label="Select ${escapeHtml(food.title)} for carbon calculation">
                    <img src="http://localhost:8080${escapeHtml(food.imageUrl)}" alt="${escapeHtml(food.title)}">
                    <span>
                        <span class="partnerFoodName">${escapeHtml(food.title)}</span>
                        <span class="partnerFoodMeta">${food.discountRate}% OFF · Closes ${escapeHtml(food.closingTime || "-")} · Select to calculate</span>
                    </span>
                </button>
                <span class="partnerFoodActions">
                    <span class="partnerFoodPrice">฿${food.discountedPrice}</span>
                    <button type="button" class="partnerFoodCartButton">Add to cart</button>
                </span>
            </div>
        `).join("");

        list.querySelectorAll(".partnerFoodCard").forEach(card => {
            const food = availableFoods.find(item => String(item.id) === card.dataset.foodId);

            card.querySelector(".partnerFoodSelect").addEventListener("click", () => {
                list.querySelectorAll(".partnerFoodCard").forEach(item => item.classList.remove("selected"));
                card.classList.add("selected");
                routeState.selectedFood = food || null;
                updateCarbonMetric();
            });

            card.querySelector(".partnerFoodCartButton").addEventListener("click", event => {
                event.stopPropagation();
                const foodId = card.dataset.foodId;
                sessionStorage.setItem("greenloop_pending_cart_food_id", foodId);
                window.location.href = `/index.html?addFoodId=${encodeURIComponent(foodId)}#food`;
            });
        });
    } catch (error) {
        if (routeState.foodRequestRestaurantId !== restaurantId) return;
        list.innerHTML = `<div class="partnerFoodEmpty">${escapeHtml(error.message)}</div>`;
    }
}

function hidePartnerFoods() {
    routeState.foodRequestRestaurantId = null;
    routeState.selectedFood = null;
    routeState.partnerFoods = [];
    updateCarbonMetric();
    document.getElementById("partnerFoodPanel")?.classList.remove("visible");
    const list = document.getElementById("partnerFoodList");
    if (list) list.innerHTML = "";
}

function updateCarbonMetric() {
    const value = document.getElementById("netCarbonValue");
    const breakdown = document.getElementById("carbonMetricBreakdown");
    const pill = document.getElementById("carbonMetricPill");
    if (!value || !breakdown || !pill) return;

    const food = routeState.selectedFood;
    const route = routeState.currentRoute;
    const baseRoute = routeState.baseRoute;
    if (!routeState.selectedPlace || !food || !route || !baseRoute) {
        value.textContent = "0.00";
        value.classList.remove("negative");
        breakdown.textContent = routeState.selectedPlace && routeState.partnerFoods.length
            ? "Select one of the food deals above to calculate its estimated carbon saving."
            : routeState.selectedPlace && !food
            ? "This restaurant has no available registered food deal, so food savings cannot be calculated."
            : "Select a GreenLoop Partner with an available food deal to calculate an estimate.";
        pill.textContent = "Estimated impact · not yet counted toward Net-Zero";
        return;
    }

    const category = food.category || "DEFAULT";
    const foodSaved = FOOD_SAVED_KG_CO2E[category] ?? FOOD_SAVED_KG_CO2E.DEFAULT;
    const extraDistanceKm = Math.max(0, route.distanceMeters - baseRoute.distanceMeters) / 1000;
    const emissionFactor = TRAVEL_KG_CO2E_PER_KM[routeState.travelMode] ?? 0;
    const travelEmissions = extraDistanceKm * emissionFactor;
    const netSaved = foodSaved - travelEmissions;

    value.textContent = netSaved.toFixed(2);
    value.classList.toggle("negative", netSaved < 0);
    breakdown.innerHTML = `
        <div><span>Food deal</span><b>${escapeHtml(food.title)} (${escapeHtml(category)})</b></div>
        <div><span>Food saved</span><b>+${foodSaved.toFixed(2)} kg CO₂e</b></div>
        <div><span>Extra travel</span><b>${extraDistanceKm.toFixed(2)} km × ${emissionFactor.toFixed(5)}</b></div>
        <div><span>Travel emissions</span><b>−${travelEmissions.toFixed(2)} kg CO₂e</b></div>
    `;
    pill.textContent = netSaved >= 0
        ? "✓ Positive estimated carbon saving"
        : "⚠ Detour emissions exceed the estimated food saving";
}

function formatDistance(meters = 0) {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters)}m`;
}

function formatDuration(duration = "0s") {
    const seconds = Number.parseInt(duration, 10) || 0;
    const minutes = Math.round(seconds / 60);
    return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min`;
}

async function recalculateSelectedRouteForMode() {
    const selectedPlace = routeState.selectedPlace;
    if (!selectedPlace?.location) {
        await searchRouteAndPlaces();
        return;
    }

    setRouteStatus("Recalculating the selected route for this transport mode…");
    try {
        const baseRoute = await requestRoute();
        routeState.baseRoute = baseRoute;

        const route = await requestRoute({
            latitude: selectedPlace.location.lat,
            longitude: selectedPlace.location.lng
        });
        renderRoute(route, selectedPlace);

        const extra = Math.max(0, route.distanceMeters - baseRoute.distanceMeters);
        const note = document.getElementById("selectedStoreNote");
        note.innerHTML = `Selected: <b>${escapeHtml(selectedPlace.displayName?.text || "Store")}</b><br>` +
            `Extra distance: ${formatDistance(extra)} · Total ${formatDistance(route.distanceMeters)} · ${formatDuration(route.duration)}`;

        updateCarbonMetric();
        setRouteStatus("Updated the carbon estimate for the selected transport mode.");
    } catch (error) {
        routeState.currentRoute = null;
        updateCarbonMetric();
        setRouteStatus(error.message, true);
    }
}

async function searchRouteAndPlaces() {
    const button = document.getElementById("routeSearchButton");
    button.disabled = true;
    setRouteStatus("Calculating the route and finding nearby stores…");
    try {
        routeState.visibleStoreCount = 3;
        const route = await requestRoute();
        routeState.baseRoute = route;
        routeState.currentRoute = route;
        routeState.selectedPlace = null;
        routeState.selectedFood = null;
        renderRoute(route);
        updateCarbonMetric();
        await findPlacesAlongRoute(route.polyline.encodedPolyline);
        setRouteStatus(`Route ${formatDistance(route.distanceMeters)} · ${formatDuration(route.duration)} · ${routeState.places.length} nearby store(s)`);
    } catch (error) {
        setRouteStatus(error.message, true);
    } finally {
        button.disabled = false;
    }
}

function bindControls() {
    document.getElementById("routeSearchButton").addEventListener("click", searchRouteAndPlaces);
    document.querySelectorAll(".transportButton").forEach((button, index) => {
        const modes = ["WALK", "TRANSIT", "DRIVE"];
        button.addEventListener("click", async () => {
            document.querySelectorAll(".transportButton").forEach(item => item.classList.remove("active"));
            button.classList.add("active");
            routeState.travelMode = modes[index];
            if (routeState.baseRoute) {
                document.querySelectorAll(".transportButton").forEach(item => item.disabled = true);
                try {
                    await recalculateSelectedRouteForMode();
                } finally {
                    document.querySelectorAll(".transportButton").forEach(item => item.disabled = false);
                }
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    if (typeof setLanguage === "function") setLanguage("en", { silent: true });
    bindControls();
    try {
        await loadGoogleMaps();
        initializeMap();
        setRouteStatus("Use the sample places or select locations from the suggestions.");
    } catch (error) {
        const loading = document.getElementById("mapLoading");
        if (loading) {
            loading.className = "mapError";
            loading.textContent = `${error.message} Check the backend and environment variables.`;
        }
        setRouteStatus(error.message, true);
    }
});
