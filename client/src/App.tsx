function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      <h1>🚀 B2B SaaS Collaboration Workspace</h1>

      <p>
        Welcome to the Real-Time Collaboration Platform.
      </p>

      <div style={{ marginTop: "20px" }}>
        <button style={{ marginRight: "10px" }}>
          Login
        </button>

        <button>
          Register
        </button>
      </div>
    </div>
  );
}

export default App;