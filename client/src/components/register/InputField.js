import React from "react";

const InputField = React.memo(({ label, name, type, value, onChange, error, styles }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label>
    <input
      type={type}
      name={name}
      placeholder={`Enter your ${label.toLowerCase()}`}
      value={value}
      onChange={onChange}
      style={styles.input}
    />
    {error && <p style={styles.error}>{error}</p>}
  </div>
));

export default InputField;