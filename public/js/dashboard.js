const locations = JSON.parse(document.getElementById("main-map").dataset.locations);

const map = L.map("main-map", {
  center: [64.963, -19.02],
  zoom: 7,
});

const detailMap = L.map("detail-map", {
  center: [64.963, -19.02],
  zoom: 6,
  zoomControl: false,
  attributionControl: false,
  dragging: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  boxZoom: false,
  keyboard: false,
});

const terrain = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" });

const satellite = L.tileLayer("https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}", {
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
  attribution: "© Google",
});

const privateIcon = L.icon({
  iconUrl: "/images/marker-private.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const newLocationIcon = L.icon({
  iconUrl: "/images/marker-new.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

terrain.addTo(map);
satellite.addTo(detailMap);

const categoryLayers = {
  waterfall: L.layerGroup(),
  beach: L.layerGroup(),
  glacier: L.layerGroup(),
  "hot-spring": L.layerGroup(),
  uncategorized: L.layerGroup(),
};

const bounds = [];

locations.forEach((loc) => {
  const markerOptions = {};

  if (loc.visibility === "private") {
    markerOptions.icon = privateIcon;
  }

  const marker = L.marker([loc.latitude, loc.longitude], markerOptions)
    .bindPopup(`
      <strong><a href="/location/${loc._id}">${loc.title}</a></strong><br>
      <em>${loc.category}</em><br>
      ${loc.visibility}
    `)
    .on("click", () => {
      showInDetailMap(loc.latitude, loc.longitude);
      updatePoiDetails(loc); // optional, see below
    });


  if (categoryLayers[loc.category]) {
    marker.addTo(categoryLayers[loc.category]);
  } else {
    marker.addTo(categoryLayers.uncategorized);
  }

  bounds.push([loc.latitude, loc.longitude]);
});

Object.values(categoryLayers).forEach((layer) => layer.addTo(map));

// Because nothing forces you to place POIs in iceland
if (bounds.length) {
  const markerBounds = L.latLngBounds(bounds);

  if (!map.getBounds().contains(markerBounds)) {
    map.fitBounds(markerBounds);
  }
}

const baseMaps = {
  Terrain: terrain,
  Satellite: satellite,
};

const overlayMaps = {
  Waterfalls: categoryLayers.waterfall,
  Beaches: categoryLayers.beach,
  Glaciers: categoryLayers.glacier,
  "Hot Springs": categoryLayers["hot-spring"],
  Uncategorized: categoryLayers.uncategorized,
};

L.control.layers(baseMaps, overlayMaps).addTo(map);

let detailMarker = null;
let newMarker = null;
let placementMode = false;

const PlaceControl = L.Control.extend({
  options: { position: "topright" },

  onAdd() {
    const div = L.DomUtil.create("div", "leaflet-bar leaflet-control");
    div.innerHTML = `
        <button id="toggle-placement"
          title="Toggle placement mode"
          style="background:#fff;padding:6px 10px;border:none;cursor:pointer">
          📍 Place
        </button>
      `;

    L.DomEvent.disableClickPropagation(div);

    return div;
  },
});

map.addControl(new PlaceControl());

function popupHtml(marker) {
  const { lat, lng } = marker.getLatLng();

  return `
      <strong>New location</strong><br>
      Lat: ${lat.toFixed(5)}<br>
      Lng: ${lng.toFixed(5)}<br>
      <br>
      <button id="save-marker" class="button is-primary is-small">Create</button>
      <button id="cancel-marker" class="button is-danger is-small ml-2">
        Cancel
      </button>
    `;
}

function showInDetailMap(lat, lng) {
  const zoomLevel = 16; // nice close satellite zoom

  detailMap.setView([lat, lng], zoomLevel, {
    animate: true,
    duration: 0.5,
  });

  if (detailMarker) {
    detailMarker.setLatLng([lat, lng]);
  } else {
    detailMarker = L.marker([lat, lng]).addTo(detailMap);
  }
}

function updatePoiDetails(loc) {
  const panel = document.getElementById("poi-details");

  panel.innerHTML = `
    <strong>${loc.title}</strong><br>
    Category: ${loc.category}<br>
    Visibility: ${loc.visibility}<br>
    <br>
    <a class="button is-small is-link" href="/location/${loc._id}">
      Open details
    </a>
  `;
}


map.on("click", (e) => {
  if (!placementMode) return;
  const { lat, lng } = e.latlng;

  if (newMarker) {
    map.removeLayer(newMarker);
  }

  newMarker = L.marker([lat, lng], {
    draggable: true,
    icon: newLocationIcon,
  }).addTo(map);

  newMarker.bindPopup(popupHtml(newMarker)).openPopup();

  newMarker.on("dragend", () => {
    newMarker.setPopupContent(popupHtml(newMarker));
    newMarker.openPopup();
  });
});

map.on("popupopen", () => {
  const save = document.getElementById("save-marker");
  const cancel = document.getElementById("cancel-marker");

  if (save) {
    save.onclick = () => {
      const { lat, lng } = newMarker.getLatLng();
      window.location.href = `/dashboard/new?lat=${lat}&lng=${lng}`;
    };
  }

  if (cancel) {
    cancel.onclick = () => {
      map.removeLayer(newMarker);
      newMarker = null;
    };
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && newMarker) {
    map.removeLayer(newMarker);
    newMarker = null;
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id !== "toggle-placement") return;

  placementMode = !placementMode;
  e.target.style.background = placementMode ? "#48c774" : "#fff";
});
