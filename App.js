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
  <style>html, body, #map { height: 100%; margin: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map("map").setView([55.6761, 12.5683], 12);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);

    // Appen kalder denne funktion med alle markers fra Firestore
    window.setMarkers = (list) => {
      layer.clearLayers();
      list.forEach((m) => L.marker([m.latitude, m.longitude]).addTo(layer));
    };

    // Long-press: send koordinater til React Native
    map.on("contextmenu", (e) => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng })
      );
    });
  </script>
</body>
</html>
`;

export default function App() {
  const webRef = useRef(null);
  const [markers, setMarkers] = useState([]);
  const [ready, setReady] = useState(false);

  // Lyt live til Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(database, "markers"), (snap) => {
      setMarkers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsubscribe;
  }, []);

  // Send markers til kortet, når de ændrer sig (og kortet er loadet)
  useEffect(() => {
    if (!ready) return;
    webRef.current.injectJavaScript(
      `window.setMarkers(${JSON.stringify(markers)}); true;`
    );
  }, [markers, ready]);

  // Gem ny marker i Firestore, når kortet sender et long-press
  const handleMessage = async (event) => {
    const { latitude, longitude } = JSON.parse(event.nativeEvent.data);
    await addDoc(collection(database, "markers"), { latitude, longitude });
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