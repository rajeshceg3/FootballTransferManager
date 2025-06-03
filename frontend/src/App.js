import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
// Transfer Components
import TransferListPage from './components/TransferListPage';
import NewTransferPage from './components/NewTransferPage';
import TransferDetailsPage from './components/TransferDetailsPage';
// Player Components
import PlayerListPage from './components/PlayerListPage';
import CreatePlayerPage from './components/CreatePlayerPage';
import EditPlayerPage from './components/EditPlayerPage';
// Club Components
import ClubListPage from './components/ClubListPage';
import CreateClubPage from './components/CreateClubPage';
import EditClubPage from './components/EditClubPage';

const mainContentStyle = {
  flexGrow: 1,
  paddingTop: '1.5rem',
  paddingBottom: '1.5rem',
  backgroundColor: '#ffffff',
};

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main style={mainContentStyle}>
          <div className="container">
            <Routes>
              {/* Transfer Routes */}
              <Route path="/" element={<TransferListPage />} />
              <Route path="/transfer/new" element={<NewTransferPage />} />
              <Route path="/transfer/:transferId" element={<TransferDetailsPage />} />

              {/* Player Management Routes */}
              <Route path="/players" element={<PlayerListPage />} />
              <Route path="/players/new" element={<CreatePlayerPage />} />
              <Route path="/players/edit/:id" element={<EditPlayerPage />} />

              {/* Club Management Routes */}
              <Route path="/clubs" element={<ClubListPage />} />
              <Route path="/clubs/new" element={<CreateClubPage />} />
              <Route path="/clubs/edit/:id" element={<EditClubPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
