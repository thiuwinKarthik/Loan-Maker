
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </Router>
  );
}

export default App;
