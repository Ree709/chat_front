export function Button({ children, onClick }) {
    return (
      <button
        onClick={onClick}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "10px"
        }}
      >
        {children}
      </button>
    );
  }
  