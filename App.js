import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

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

    // Long-press på touch udløser "contextmenu"
    map.on("contextmenu", (e) => {
      L.marker(e.latlng).addTo(map);
    });
  </script>
</body>
</html>
`;

export default function App() {
  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});