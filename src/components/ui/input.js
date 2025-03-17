export function Input({ value, onChange, placeholder }) {
    return (
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: "10px",
          border: "2px solid #007bff",
          borderRadius: "5px",
          width: "100%",
          fontSize: "16px",
          outline: "none",
        }}
      />
    );
  }
  