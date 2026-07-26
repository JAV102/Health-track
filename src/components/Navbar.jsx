import '../styles/NavBar.css';

const NavBar = ({ page, setPage }) => {
  return (
    <div className="navbar">
      <div className="brand" onClick={() => setPage('home')}>
        
        <span className="brand-name">HealthTrack</span>
      </div>

      <div className="rightSide">
        <a className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}> Home </a>
        <a className={page === 'features' ? 'active' : ''} onClick={() => setPage('features')}> Features </a>
        <a className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')}> Dashboard </a>
        <a className={page === 'about' ? 'active' : ''} onClick={() => setPage('about')}> About </a>
        <a className={page === 'contact' ? 'active' : ''} onClick={() => setPage('contact')}> Contact </a>
      </div>
    </div>
  );
};

export default NavBar;
