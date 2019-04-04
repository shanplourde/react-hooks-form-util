import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home } from "../../demo/home";
import { KitchenSink } from "../../demo/kitchen-sink";

function Routes() {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/kitchen-sink" component={KitchenSink} />
      </Switch>
    </React.Fragment>
  );
}

export { Routes };
