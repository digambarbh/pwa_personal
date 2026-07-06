import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles.css";
import PinLock from "./components/PinLock";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PinLock>
        <App />
      </PinLock>
    </BrowserRouter>
  </React.StrictMode>
);
