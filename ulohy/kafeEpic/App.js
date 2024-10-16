import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [coffeeDetails, setCoffeeDetails] = useState('');
    const [task, setTask] = useState('');

    // Funkce pro obnovu spojení
    const reconnect = async (attempts = 0) => {
        if (attempts < 10) {
            try {
                // Pokus o připojení k API
                await axios.get('http://localhost:5000/some-endpoint');
                console.log("Úspěšně připojeno.");
            } catch (error) {
                console.error("Chyba při připojování:", error);
                setTimeout(() => reconnect(attempts + 1), 1000); // Zkusit znovu za 1 sekundu
            }
        } else {
            alert("Nemohu se připojit.");
        }
    };

    // Příklad volání reconnect při načtení komponenty
    useEffect(() => {
        reconnect(); // Pokus o připojení při načtení
    }, []);

    const recordCoffee = async () => {
        const userId = 'user1'; // Nahraďte skutečným ID uživatele
        await axios.post('http://localhost:5000/record-coffee', { userId, coffeeDetails });
        setCoffeeDetails('');
    };

    const addTask = async () => {
        const userId = 'user1'; // Nahraďte skutečným ID uživatele
        await axios.post('http://localhost:5000/add-task', { userId, task });
        setTask('');
    };

    return (
        <div>
            <h1>Coffee App</h1>
            <div>
                <h2>Record Coffee</h2>
                <input
                    value={coffeeDetails}
                    onChange={(e) => setCoffeeDetails(e.target.value)}
                    placeholder="Enter coffee details"
                />
                <button onClick={recordCoffee}>Submit</button>
            </div>
            <div>
                <h2>Add Task</h2>
                <input
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Enter task"
                />
                <button onClick={addTask}>Submit</button>
            </div>
        </div>
    );
}

export default App;
