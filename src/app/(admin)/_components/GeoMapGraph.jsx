export default function GeoMapGraph() {
  return (
    <div style={{ width: "100%", height: "600px", border: "none" }}>
      <iframe
        src="/html/geomap.html"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Geomap Visualization"
      />
    </div>
  );
}
