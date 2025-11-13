import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-travel-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">Travel Guide</Link>
          <div className="space-x-4">
            <Link to="/" className="hover:text-travel-light">Map</Link>
            <Link to="/groups" className="hover:text-travel-light">Groups</Link>
            <Link to="/solo" className="hover:text-travel-light">Solo</Link>
            <Link to="/emergency" className="hover:text-travel-light">Emergency</Link>
            <Link to="/itinerary" className="hover:text-travel-light">Itinerary</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
