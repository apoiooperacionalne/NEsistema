import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ControleAcesso from "./pages/ControleAcesso";
import RegistroAcesso from "./pages/RegistroAcesso";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ControleAcesso" element={<ControleAcesso />} />
        <Route path="/RegistroAcesso" element={<RegistroAcesso />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
