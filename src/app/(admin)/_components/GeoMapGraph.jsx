export default function GeoMapGraph() {
  return (
    <div style={{ width: "100%", height: "700px", border: "none",margin:"20px 0 0 " }}>
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
