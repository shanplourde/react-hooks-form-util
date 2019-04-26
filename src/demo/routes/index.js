import React from "react";
import { Route, Switch } from "react-router-dom";
import { Home } from "../../demo/home";
import { KitchenSink } from "../../demo/kitchen-sink";
import { DynamicForm } from "../../demo/dynamic-form";
import { RewardEarlyValidateLate } from "../../demo/reward-early-validate-late";
import { YupSchemaValidation } from "../../demo/yup-schema-validation";

function Routes() {
  return (
    <React.Fragment>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/kitchen-sink" component={KitchenSink} />
        <Route exact path="/dynamic-form" component={DynamicForm} />
        <Route
          exact
          path="/yup-schema-validation"
          component={YupSchemaValidation}
        />
        <Route
          exact
          path="/reward-early-validate-late"
          component={RewardEarlyValidateLate}
        />
      </Switch>
    </React.Fragment>
  );
}

export { Routes };
