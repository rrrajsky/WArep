import { useEffect, useState } from 'react';
import { fetchHouses } from '../../services/api';

const HousePicker = ({ onSelect }) => {
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState('');

  useEffect(() => {
    const loadHouses = async () => {
      try {
        const response = await fetchHouses();
        setHouses(response.data);
      } catch (error) {
        console.error('Chyba při načítání domů:', error);
      }
    };
    loadHouses();
  }, []);

  return (
    <select
      value={selectedHouse}
      onChange={(e) => {
        setSelectedHouse(e.target.value);
        onSelect(e.target.value);
      }}
    >
      <option value="">Vyberte dům</option>
      {houses.map((house) => (
        <option key={house.ID} value={house.ID}>
          {house.Address}
        </option>
      ))}
    </select>
  );
};
