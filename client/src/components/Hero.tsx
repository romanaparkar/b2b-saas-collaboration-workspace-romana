function Hero() {
  return (
    <div
      style={{
        width: "500px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "50px",
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          lineHeight: "1.2",
          marginBottom: "20px",
          color: "#111827",
        }}
      >
        B2B SaaS
        <br />
        Collaboration
        <br />
        Workspace
      </h1>

      <p
        style={{
          color: "#6b7280",
          fontSize: "18px",
          marginBottom: "35px",
        }}
      >
        Collaborate with your team in real time.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <button
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 28px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Login
        </button>

        <button
          style={{
            backgroundColor: "white",
            color: "#2563eb",
            border: "2px solid #2563eb",
            padding: "12px 28px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default Hero;