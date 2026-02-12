import { BrowserRouter as Router } from "react-router-dom";
import ErrorBoundary from "./error-boundary.js";
import { AppRoutes } from "./routes.js";
import { Navigation } from "./components/navigation.js";

export function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Navigation />
        <AppRoutes />
      </ErrorBoundary>
    </Router>
  );
}
