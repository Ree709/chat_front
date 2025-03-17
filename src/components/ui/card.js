export function Card({ children }) {
    return (
      <div style={{ border: "1px solid gray", padding: "15px", margin: "10px", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ children }) {
    return <div style={{ padding: "10px" }}>{children}</div>;
  }
  