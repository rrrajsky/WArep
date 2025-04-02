import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../services/api';

const FileUpload = () => {
  const { token } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [houseId, setHouseId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Vyberte soubor!');
      return;
    }
    try {
      await uploadFile(selectedFile, houseId);
      alert('Soubor úspěšně nahrán!');
    } catch (error) {
      alert('Chyba při nahrávání souboru!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button type="submit">Nahrát</button>
    </form>
  );
};
