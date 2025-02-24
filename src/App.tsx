
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppStateProvider } from "@/components/AppStateProvider";
import { AppRoutes } from "./AppRoutes";
import "./App.css";

function App() {
  return (
    <Router>
      <AppStateProvider>
        <AppRoutes />
        <Toaster />
      </AppStateProvider>
    </Router>
  );
}

export default App;
