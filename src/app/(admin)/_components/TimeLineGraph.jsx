export default function TimeLineGraph() {
  return (
    <div style={{ width: "100%", height: "800px", border: "none",marginTop:"20px", border:"1px solid #434343" }}>
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
