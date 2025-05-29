export default function TimeLineGraph() {
  return (
    <div style={{ width: "100%", height: "600px", border: "none" }}>
      <iframe
        src="/html/timeline.html"
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Timeline Visualization"
      />
    </div>
  );
}
