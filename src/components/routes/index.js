import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home } from "../../views/home";
import { SampleForm } from "../../views/sample-form";

function Routes() {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/sample-form" component={SampleForm} />
      </Switch>
    </React.Fragment>
  );
}

export { Routes };
