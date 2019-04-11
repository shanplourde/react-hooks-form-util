import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home } from "../../demo/home";
import { KitchenSink } from "../../demo/kitchen-sink";
import { DynamicForm } from "../../demo/dynamic-form";

function Routes() {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/kitchen-sink" component={KitchenSink} />
        <Route exact path="/dynamic-form" component={DynamicForm} />
      </Switch>
    </React.Fragment>
  );
}

export { Routes };
