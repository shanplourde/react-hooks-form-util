import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>React hooks-based form API demos</h2>
      <ul>
        <li>
          <Link to="kitchen-sink">Kitchen sink sample</Link>
        </li>
      </ul>
    </div>
  );
}

export { Home };
