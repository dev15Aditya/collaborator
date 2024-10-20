import { Route, BrowserRouter as Router, Routes } from "react-router-dom"
import Footer from "./components/Footer"
import NavbarComp from "./components/Navbar"
import Homepage from "./pages/Homepage"
import Whiteboard from "./pages/Whiteboard"

function App() {

  return (
    <Router>
    <div className="container min-h-[100vh]">
      <NavbarComp />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/whiteboard/:roomId"
          element={<Whiteboard />}
        />
      </Routes>
      {/* <Homepage /> */}

      <Footer/>
    </div>
    </Router>
  )
}

export default App
