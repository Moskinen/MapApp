import { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import { database } from "./firebase";

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .pin {
      width: 22px; height: 22px; border-radius: 50%;
      border: 3px solid #fff; box-shadow: 0 1px 5px rgba(0,0,0,.5);
    }
    #picker {
      display: none; position: absolute; z-index: 1000;
      background: #fff; border-radius: 10px; padding: 6px;
      box-shadow: 0 2px 12px rgba(0,0,0,.4);
      font-family: sans-serif; min-width: 170px;
    }
    #picker button {
      display: flex; align-items: center; gap: 10px;
      width: 100%; padding: 12px; border: 0; background: none;
      font-size: 16px; text-align: left;
    }
    #picker .dot { width: 16px; height: 16px; border-radius: 50%; }
    #picker .cancel { color: #888; font-size: 14px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="picker"></div>
  <script>
    const CATEGORIES = {
      restaurant: { label: "Restaurant", color: "#e53935" },
      aktivitet:  { label: "Aktivitet",  color: "#43a047" },
      adresse:    { label: "Adresser",   color: "#1e88e5" },
      andet:      { label: "Andet",      color: "#8e24aa" },
    };

    const map = L.map("map").setView([55.6761, 12.5683], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const picker = document.getElementById("picker");

    function makeIcon(category) {
      const color = (CATEGORIES[category] || CATEGORIES.andet).color;
      return L.divIcon({
        className: "",
        html: '<div class="pin" style="background:' + color + '"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
    }

    window.setMarkers = (list) => {
      layer.clearLayers();
      list.forEach((m) =>
        L.marker([m.latitude, m.longitude], { icon: makeIcon(m.category) }).addTo(layer)
      );
    };

    function hidePicker() { picker.style.display = "none"; }

    // Long-press: vis kategori-menu
    map.on("contextmenu", (e) => {
      picker.innerHTML = "";

      Object.entries(CATEGORIES).forEach(([key, cat]) => {
        const btn = document.createElement("button");
        btn.innerHTML = '<span class="dot" style="background:' + cat.color + '"></span>' + cat.label;
        btn.onclick = () => {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              latitude: e.latlng.lat,
              longitude: e.latlng.lng,
              category: key,
            })
          );
          hidePicker();
        };
        picker.appendChild(btn);
      });

      const cancel = document.createElement("button");
      cancel.className = "cancel";
      cancel.textContent = "Annuller";
      cancel.onclick = hidePicker;
      picker.appendChild(cancel);

      // Placér menuen ved fingeren, men hold den inde på skærmen
      const p = e.containerPoint;
      picker.style.display = "block";
      const maxLeft = window.innerWidth - picker.offsetWidth - 8;
      const maxTop = window.innerHeight - picker.offsetHeight - 8;
      picker.style.left = Math.max(8, Math.min(p.x, maxLeft)) + "px";
      picker.style.top = Math.max(8, Math.min(p.y, maxTop)) + "px";
    });

    map.on("click movestart", hidePicker);
  </script>
</body>
</html>
`;

export default function App() {
  const webRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, "markers"), (snap) => {
      setMarkers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!ready) return;
    webRef.current.injectJavaScript(
      `window.setMarkers(${JSON.stringify(markers)}); true;`
    );
  }, [markers, ready]);

  const handleMessage = async (event) => {
    const { latitude, longitude, category } = JSON.parse(event.nativeEvent.data);
    await addDoc(collection(database, "markers"), { latitude, longitude, category });
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.container}
        onLoadEnd={() => setReady(true)}
        onMessage={handleMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});