import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>React hooks-based form API demos</h2>
      <ul>
        <li>
          <Link to="kitchen-sink">Kitchen sink demo</Link>
        </li>
        <li>
          <Link to="yup-schema-validation">Yup schema validation demo</Link>
        </li>
        <li>
          <Link to="dynamic-form">Dynamic form demo</Link>
        </li>
        <li>
          <Link to="reward-early-validate-late">
            Reward early validate late demo
          </Link>
        </li>
      </ul>
    </div>
  );
}

export { Home };
