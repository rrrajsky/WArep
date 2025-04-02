import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { saveTriggers } from '../../services/api';

const months = [
  { value: 1, label: 'Leden' },
  { value: 2, label: 'Únor' },
  { value: 3, label: 'Březen' },
  { value: 4, label: 'Duben' },
  { value: 5, label: 'Květen' },
  { value: 6, label: 'Červen' },
  { value: 7, label: 'Červenec' },
  { value: 8, label: 'Srpen' },
  { value: 9, label: 'Září' },
  { value: 10, label: 'Říjen' },
  { value: 11, label: 'Listopad' },
  { value: 12, label: 'Prosinec' },
];

const alertTypes = [
  { id: 1, name: 'Překročení limitu tepla' },
  { id: 2, name: 'Překročení limitu vody' },
];

const TriggerForm = ({ houseId }) => {
  const { token } = useAuth();
  const [triggers, setTriggers] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateTrigger = (trigger) => {
    const newErrors = {};
    if (!trigger.month) newErrors.month = 'Vyberte měsíc';
    if (!trigger.year || trigger.year < 2020) newErrors.year = 'Neplatný rok';
    if (!trigger.alertTypeId) newErrors.alertTypeId = 'Vyberte typ upozornění';
    if (!trigger.limit || trigger.limit <= 0) newErrors.limit = 'Zadejte kladné číslo';
    return newErrors;
  };

  const handleAddTrigger = () => {
    setTriggers([...triggers, {
      month: '',
      year: new Date().getFullYear(),
      alertTypeId: '',
      limit: '',
    }]);
  };

  const handleRemoveTrigger = (index) => {
    const updatedTriggers = triggers.filter((_, i) => i !== index);
    setTriggers(updatedTriggers);
  };

  const handleTriggerChange = (index, field, value) => {
    const updatedTriggers = triggers.map((trigger, i) => 
      i === index ? { ...trigger, [field]: value } : trigger
    );
    setTriggers(updatedTriggers);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrors({});

    // Validate all triggers
    const validationResults = triggers.map(validateTrigger);
    const hasErrors = validationResults.some(result => Object.keys(result).length > 0);

    if (hasErrors) {
      setErrors(validationResults.reduce((acc, curr, index) => {
        if (Object.keys(curr).length > 0) acc[index] = curr;
        return acc;
      }, {}));
      setIsSubmitting(false);
      return;
    }

    try {
      await saveTriggers(houseId, triggers.map(t => ({
        ...t,
        month: parseInt(t.month),
        year: parseInt(t.year),
        limit: parseFloat(t.limit)
      })));
      alert('Spouštěče byly úspěšně uloženy!');
      setTriggers([]);
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      alert('Nepodařilo se uložit spouštěče: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="trigger-form">
      <h3>Nastavení Spouštěčů</h3>
      
      <div className="triggers-container">
        {triggers.map((trigger, index) => (
          <div key={index} className="trigger-item">
            <div className="form-group">
              <label>Měsíc:</label>
              <select
                value={trigger.month}
                onChange={(e) => handleTriggerChange(index, 'month', e.target.value)}
                className={errors[index]?.month ? 'error' : ''}
              >
                <option value="">Vyberte měsíc</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              {errors[index]?.month && <span className="error-message">{errors[index].month}</span>}
            </div>

            <div className="form-group">
              <label>Rok:</label>
              <input
                type="number"
                value={trigger.year}
                onChange={(e) => handleTriggerChange(index, 'year', e.target.value)}
                min="2020"
                max="2030"
                className={errors[index]?.year ? 'error' : ''}
              />
              {errors[index]?.year && <span className="error-message">{errors[index].year}</span>}
            </div>

            <div className="form-group">
              <label>Typ upozornění:</label>
              <select
                value={trigger.alertTypeId}
                onChange={(e) => handleTriggerChange(index, 'alertTypeId', e.target.value)}
                className={errors[index]?.alertTypeId ? 'error' : ''}
              >
                <option value="">Vyberte typ</option>
                {alertTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors[index]?.alertTypeId && (
                <span className="error-message">{errors[index].alertTypeId}</span>
              )}
            </div>

            <div className="form-group">
              <label>Limit:</label>
              <input
                type="number"
                step="0.1"
                value={trigger.limit}
                onChange={(e) => handleTriggerChange(index, 'limit', e.target.value)}
                className={errors[index]?.limit ? 'error' : ''}
              />
              {errors[index]?.limit && <span className="error-message">{errors[index].limit}</span>}
            </div>

            <button
              type="button"
              className="remove-button"
              onClick={() => handleRemoveTrigger(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="add-button"
          onClick={handleAddTrigger}
          disabled={isSubmitting}
        >
          Přidat Spouštěč
        </button>
        
        <button
          type="button"
          className="save-button"
          onClick={handleSubmit}
          disabled={isSubmitting || triggers.length === 0}
        >
          {isSubmitting ? 'Ukládání...' : 'Uložit Všechny Spouštěče'}
        </button>
      </div>
    </div>
  );
};

export default TriggerForm;
