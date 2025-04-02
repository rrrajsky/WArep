import { useState } from 'react';
import { saveTriggers } from '../../services/api';

const TriggerForm = ({ houseId }) => {
  const [triggers, setTriggers] = useState([]);

  const addTrigger = () => {
    setTriggers([...triggers, { month: '', year: '', alertType: 1, limit: '' }]);
  };

  const handleSave = async () => {
    try {
      await saveTriggers(houseId, triggers);
      alert('Spouštěče uloženy!');
    } catch (error) {
      alert('Chyba při ukládání spouštěčů!');
    }
  };

  return (
    <div>
      <button onClick={addTrigger}>Přidat spouštěč</button>
      {triggers.map((trigger, index) => (
        <div key={index}>
          <input
            type="number"
            placeholder="Měsíc"
            value={trigger.month}
            onChange={(e) => /* Update logic */}
          />
          {/* Add other fields similarly */}
          <button onClick={() => /* Remove trigger logic */}>Odebrat</button>
        </div>
      ))}
      <button onClick={handleSave}>Uložit spouštěče</button>
    </div>
  );
};
