import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Map from './pages/Map';
import Groups from './pages/Groups';
import Solo from './pages/Solo';
import Emergency from './pages/Emergency';
import Itinerary from './pages/Itinerary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-travel-light">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/solo" element={<Solo />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/itinerary" element={<Itinerary />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
