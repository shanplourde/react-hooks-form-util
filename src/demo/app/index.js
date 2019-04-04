import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { Routes } from "../routes";

function DictationApp() {
  return (
    <div className="App">
      <Router>
        <React.Fragment>
          <Routes />
        </React.Fragment>
      </Router>
    </div>
  );
}

export default DictationApp;
