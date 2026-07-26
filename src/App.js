import { useState } from 'react';
import './App.css';
import NavBar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Features from './pages/Features.jsx';
import Contact from './pages/Contact.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const [page, setPage] = useState('home');

  return (
    <div className="App">
      <NavBar page={page} setPage={setPage} />

      {page === 'home' && <Home setPage={setPage} />}
      {page === 'features' && <Features />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'about' && <About />}
      {page === 'contact' && <Contact />}

      <Footer />
    </div>
  );
}

export default App;
