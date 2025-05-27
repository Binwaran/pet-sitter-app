import 'leaflet/dist/leaflet.css';
import '../styles/globals.css';
import "react-datepicker/dist/react-datepicker.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}