import React from "react";
import ReactDOM from "react-dom";
import App from "./components/app";

import "./styles.scss";

export const initialize = async () => {
  const rootElement = document.getElementById("root");

  ReactDOM.render(
    <div className="App">
      <App />
    </div>,
    rootElement
  );
};

initialize();
