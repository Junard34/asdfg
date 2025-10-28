
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Students from './pages/Students';
import Subjects from "./pages/Subjects";
import Grades from "./pages/Grades";

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/students" element={<Students />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/grades" element={<Grades />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App
