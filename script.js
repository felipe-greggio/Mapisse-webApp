let map;

function initializeMap() {
    console.log('Initializing map...');
    map = L.map('map', { zoomControl: false }).setView([48.8566, 2.3522], 11);

    const apiKey = '26N3P58d0aMRXYQzjUTN'; // Your MapTiler API key
    const styleId = '547b1f7c-ef8f-49ba-bcbd-e2c08fda526f'; // Your custom style ID

    const tileLayer = L.tileLayer(`https://api.maptiler.com/maps/${styleId}/256/{z}/{x}/{y}.png?key=${apiKey}`, {
        attribution: '© MapTiler © OpenStreetMap contributors',
        maxZoom: 19,
        minZoom: 0
    }).addTo(map);

    console.log('Tile layer added:', tileLayer);
    // L.marker([48.8566, 2.3522]).addTo(map)
    //     .bindPopup('Paris')
    //     .openPopup();

    // Update footer with Paris data
    updateFooter('Paris', [48.8566, 2.3522]);
}

function searchCity() {
    const city = document.getElementById('cityInput').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }

    
console.log('Map object:', map, map instanceof L.Map);
    // Show loading indicator
    showLoading();

    const apiKey = '26N3P58d0aMRXYQzjUTN'; // Your MapTiler API key
    console.log(`Geocoding city: ${city}`);

    geocodeCity(city, apiKey)
     //   .catch(() => geocodeCity(`${city}, Brazil`, apiKey)) // Try with country if first fails
        .catch(() => useNominatim(city)) // Fallback to Nominatim if both fail
        .catch(error => {
            console.error('All geocoding attempts failed:', error);
            hideLoading();
            alert(`Error finding city: ${error.message}. Please try again.`);
        });
}

function geocodeCity(city, apiKey) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(city)}.json?key=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('MapTiler Geocoding response:', data);
                if (data.features && data.features.length > 0) {
                    const { lat, lon } = data.features[0].center;
                    console.log('Map object:', map, map instanceof L.Map);
                    console.log(`Found coordinates for ${city}: [${lat}, ${lon}]`);
                    map.setView([lat, lon], 13); // Center map
                    map.invalidateSize(); // Ensure map resizes and redraws tiles
                    // L.marker([lat, lon]).addTo(map)
                    //     .bindPopup(city)
                    //     .openPopup();
                    hideLoading();
                    updateFooter(city, [lat, lon]);
                    resolve();
                } else {
                    throw new Error('City not found');
                }
            })
            .catch(error => reject(error));
    });
}

function useNominatim(city) {
    return new Promise((resolve, reject) => {
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1&addressdetails=1`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('OSM Nominatim response:', data);   
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    console.log('Map object:', map, map instanceof L.Map);
                    console.log(`Found coordinates for ${city}: [${lat}, ${lon}]`);
                    map.setView([lat, lon], 13);
                    map.invalidateSize(); // Ensure map resizes and redraws tiles
                    // L.marker([lat, lon]).addTo(map)
                    //     .bindPopup(city)
                    //     .openPopup();
                    hideLoading();
                    updateFooter(city, [lat, lon]);
                    resolve();
                } else {
                    throw new Error('City not found');
                }
            })
            .catch(error => reject(error));
    });
}



function showLoading() {
    const mapDiv = document.getElementById('map');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.textContent = 'Loading map...';
    loadingDiv.style.position = 'absolute';
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
    loadingDiv.style.background = 'rgba(255, 255, 255, 0.8)';
    loadingDiv.style.padding = '10px';
    loadingDiv.style.zIndex = 1000;
    mapDiv.appendChild(loadingDiv);
}

function hideLoading() {
    const mapDiv = document.getElementById('map');
    const loadingDiv = mapDiv.querySelector('.loading');
    if (loadingDiv) {
        mapDiv.removeChild(loadingDiv);
    }
}

function updateFooter(city, coordinates) {
    const footer = document.getElementById('map-footer');
    const lat = coordinates[0].toFixed(4);
    const lon = coordinates[1].toFixed(4);
    footer.innerHTML = `
        <div class="city-name">${city.toUpperCase()}</div>
        <div class="city-coordinates">${lat}°N / ${lon}°E</div>
    `;
}

function downloadMap() {
    const mapWrapper = document.querySelector('.map-wrapper');
    html2canvas(mapWrapper, {
        scale: 2, // Increase resolution for better quality (optional)
        useCORS: true, // Allow cross-origin images (important for MapTiler tiles)
        logging: true // Enable logging for debugging
    }).then(canvas => {
        // Convert canvas to PNG and trigger download
        const link = document.createElement('a');
        link.download = 'map_' + document.getElementById('cityInput').value + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(error => {
        console.error('Error capturing map:', error);
        alert('Error downloading map. Please try again.');
    });
}

function zoomIn() {
    if (map.getZoom() < map.getMaxZoom()) {
        map.zoomIn();
    }
}

function zoomOut() {
    if (map.getZoom() > map.getMinZoom()) {
        map.zoomOut();
    }
}

document.addEventListener('DOMContentLoaded', initializeMap);