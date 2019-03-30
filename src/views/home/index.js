import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h2>React form hooks library demos</h2>
      <ul>
        <li>
          <Link to="sample-form">Kitchen sink sample</Link>
        </li>
      </ul>
    </div>
  );
}

export { Home };
