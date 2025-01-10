import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu/Menu";
import Upload_pag from "./pages/Upload_pag/Upload_pag";
import Manual from "./pages/Manual/Manual";
import Automatic from "./pages/Automatic/Automatic";
import Profiles from "./pages/Profiles/Profiles";


const App = () => {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/Upload_pag" element={<Upload_pag />} />
        <Route path="/agrupamento/manual" element={<Manual />} />
        <Route path="/agrupamento/automatico" element={<Automatic />} />
        <Route path="/profiles" element={<Profiles />} />
      </Routes>
    </Router>
  );
};

export default App;
