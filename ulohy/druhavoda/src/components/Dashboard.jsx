import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchHouses, fetchGauges, getGaugeUsage } from '../services/api';
import FileUpload from './FileUpload';
import TriggerForm from './Triggers/TriggerForm';
import HouseManagement from './Houses/HouseManagement';
import GaugeManagement from './Gauges/GaugeManagement';
import UsageStatistics from './Usage/UsageStatistics';

const Dashboard = () => {
  const { token, logout } = useAuth();
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [houses, setHouses] = useState([]);
  const [gauges, setGauges] = useState([]);
  const [usageData, setUsageData] = useState([]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadHouses();
    }
  }, [token]);

  const loadHouses = async () => {
    setIsLoading(true);
    try {
      const response = await fetchHouses();
      setHouses(response.data);
      if (response.data.length > 0) {
        setSelectedHouse(response.data[0].ID);
      }
    } catch (err) {
      setError('Nepodařilo se načíst domy: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadGauges = async (houseId) => {
    if (!houseId) return;
    setIsLoading(true);
    try {
      const response = await fetchGauges(houseId);
      setGauges(response.data);
    } catch (err) {
      setError('Nepodařilo se načíst měřáky: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsageData = async (houseId) => {
    if (!houseId) return;
    setIsLoading(true);
    try {
      const response = await getGaugeUsage(houseId);
      setUsageData(response.data);
    } catch (err) {
      setError('Nepodařilo se načíst spotřebu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHouse) {
      loadGauges(selectedHouse);
      loadUsageData(selectedHouse);
    }
  }, [selectedHouse]);

  const handleHouseChange = (houseId) => {
    setSelectedHouse(houseId);
  };

  const handleFileUploadSuccess = () => {
    loadUsageData(selectedHouse);
  };

  const tabs = [
    { id: 'upload', label: 'Nahrát Data' },
    { id: 'triggers', label: 'Spouštěče' },
    { id: 'houses', label: 'Správa Domů' },
    { id: 'gauges', label: 'Správa Měřáků' },
    { id: 'stats', label: 'Statistiky' },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Vodárenský Portál</h1>
        <button onClick={logout} className="logout-button">
          Odhlásit se
        </button>
      </header>

      <div className="house-selector">
        <label>Vyberte dům:</label>
        <select
          value={selectedHouse || ''}
          onChange={(e) => handleHouseChange(Number(e.target.value))}
          disabled={isLoading}
        >
          {houses.map((house) => (
            <option key={house.ID} value={house.ID}>
              {house.Address}
            </option>
          ))}
        </select>
      </div>

      <nav className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="tab-content">
        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading-spinner">Načítání...</div>
        ) : (
          <>
            {activeTab === 'upload' && (
              <FileUpload 
                houseId={selectedHouse} 
                onSuccess={handleFileUploadSuccess} 
              />
            )}

            {activeTab === 'triggers' && (
              <TriggerForm houseId={selectedHouse} />
            )}

            {activeTab === 'houses' && (
              <HouseManagement 
                houses={houses} 
                onUpdate={loadHouses} 
              />
            )}

            {activeTab === 'gauges' && (
              <GaugeManagement 
                gauges={gauges} 
                houseId={selectedHouse} 
                onUpdate={() => loadGauges(selectedHouse)} 
              />
            )}

            {activeTab === 'stats' && (
              <UsageStatistics 
                data={usageData} 
                gauges={gauges} 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
