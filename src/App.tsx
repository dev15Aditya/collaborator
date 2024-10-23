import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Footer from "./components/Footer";
import NavbarComp from "./components/Navbar";
import WhiteBoard from "./pages/WhiteBoard";
import Homepage from "./pages/Homepage";

function App() {
  return (
    <Router>
    <div className="container min-h-[100vh]">
    <NavbarComp />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/whiteboard/:roomId"
          element={<WhiteBoard />}
        />
      </Routes>
      <Footer/>
    </div>
    </Router>
  )
}

export default App
