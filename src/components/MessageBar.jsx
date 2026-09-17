// Mensaje emergente de estado para errores o confirmaciones.
function MessageBar({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className={`message-bar ${message.type}`} role={message.type === "error" ? "alert" : "status"}>
      {message.text}
    </div>
  );
}

export default MessageBar;
