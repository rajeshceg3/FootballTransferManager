import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

// No specific transfers to display yet, so no loading state is strictly needed for now.
// If we were fetching a list of transfers, we'd have loading/error states.

function TransferListPage() {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');
  const [sortKey, setSortKey] = useState('initiationTimestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // Default sort order (newest first)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  useEffect(() => {
    const fetchTransfers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/v1/transfers');
        setTransfers(response.data || []); // Ensure transfers is always an array
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch transfers.');
        setTransfers([]); // Clear transfers on error
        console.error("Error fetching transfers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransfers();
  }, []); // Empty dependency array means this effect runs once on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'statusFilter') {
      setStatusFilter(value);
    } else if (name === 'clubFilter') {
      setClubFilter(value);
    } else if (name === 'playerFilter') {
      setPlayerFilter(value);
    }
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sortKey') {
      setSortKey(value);
    } else if (name === 'sortOrder') {
      setSortOrder(value);
    }
  };

  const sortedAndFilteredTransfers = [...transfers]
    .filter(transfer => {
      return (
        (statusFilter ? transfer.status === statusFilter : true) &&
        (clubFilter ? (transfer.fromClub?.name.toLowerCase().includes(clubFilter.toLowerCase()) || transfer.toClub?.name.toLowerCase().includes(clubFilter.toLowerCase())) : true) &&
        (playerFilter ? transfer.player?.name.toLowerCase().includes(playerFilter.toLowerCase()) : true)
      );
    })
    .sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'player') { // Assuming player is an object with a name property
        valA = a.player?.name?.toLowerCase() || '';
        valB = b.player?.name?.toLowerCase() || '';
      } else if (sortKey === 'initiationTimestamp') {
        valA = a.initiationTimestamp ? new Date(a.initiationTimestamp).getTime() : 0;
        valB = b.initiationTimestamp ? new Date(b.initiationTimestamp).getTime() : 0;
      }
      // Add other specific sort key handling if necessary

      if (valA < valB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndFilteredTransfers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedAndFilteredTransfers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading transfers..." />;
  }

  if (error) {
    // .error-message class already handles styling, text-center can be added if needed
    return <p className="error-message text-center">Error: {error}</p>;
  }

  return (
    <div className="container mt-3 mb-3"> {/* Using utility classes for margin */}
      <h2 className="text-center mb-3">Transfer Market</h2>

      {/* Filter Controls */}
      <div className="row mb-3 g-3"> {/* Added g-3 for gutter spacing */}
        <div className="col-md-3">
          <label htmlFor="statusFilter" className="form-label">Filter by Status:</label>
          <select id="statusFilter" name="statusFilter" className="form-select" value={statusFilter} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REJECTED">Rejected</option>
            {/* PENDING was there before, but it's not in the list of states from TransferWorkflowEngine.java.
                Keeping it commented out in case it's a valid status from another context or future use.
            <option value="PENDING">Pending</option> */}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="clubFilter" className="form-label">Filter by Club:</label>
          <input type="text" id="clubFilter" name="clubFilter" className="form-control" value={clubFilter} onChange={handleFilterChange} placeholder="Enter club name" />
        </div>
        <div className="col-md-3">
          <label htmlFor="playerFilter" className="form-label">Filter by Player:</label>
          <input type="text" id="playerFilter" name="playerFilter" className="form-control" value={playerFilter} onChange={handleFilterChange} placeholder="Enter player name" />
        </div>
        <div className="col-md-3">
          <label htmlFor="sortKey" className="form-label">Sort by:</label>
          <select id="sortKey" name="sortKey" className="form-select" value={sortKey} onChange={handleSortChange}>
            <option value="initiationTimestamp">Date</option>
            <option value="player">Player Name</option>
            {/* Add other sortable fields here, e.g., club names, status if needed */}
          </select>
          <select id="sortOrder" name="sortOrder" className="form-select mt-2" value={sortOrder} onChange={handleSortChange}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {sortedAndFilteredTransfers.length === 0 ? (
        <div className="empty-state-container"> {/* Using the standard empty state container */}
          <p>No transfers match your filters/sorting, or no transfers to display yet. Be the first to make a move!</p>
          {/* button-link and button-primary are from index.css */}
          <Link to="/transfer/new" className="button-link button-primary">
            Initiate New Transfer
          </Link>
        </div>
      ) : (
        <div className="table-responsive"> {/* Optional: for better small screen table handling */}
          <table className="table">
            <thead>
              <tr>
                <th>Player</th>
                <th>From Club</th>
                <th>To Club</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(transfer => (
                <tr key={transfer.id}>
                  <td>{transfer.player?.name || 'N/A'}</td>
                  <td>{transfer.fromClub?.name || 'N/A'}</td>
                  <td>{transfer.toClub?.name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge status-${transfer.status?.toUpperCase()}`}>
                      {transfer.status || 'N/A'}
                    </span>
                  </td>
                  <td>{transfer.initiationTimestamp ? new Date(transfer.initiationTimestamp).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <Link to={`/transfer/${transfer.id}`} className="button-link button-secondary">View Details</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage - 1)}>Previous</button>
                </li>
                {[...Array(totalPages).keys()].map(number => (
                  <li key={number + 1} className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => paginate(number + 1)}>
                      {number + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => paginate(currentPage + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
          {/* Items per page selector */}
          <div className="d-flex justify-content-center mt-2">
            <label htmlFor="itemsPerPage" className="me-2 col-form-label">Items per page:</label>
            <div>
              <select id="itemsPerPage" className="form-select form-select-sm" value={itemsPerPage} onChange={handleItemsPerPageChange}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransferListPage;
