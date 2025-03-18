import { useEffect, useRef, useState, useId } from 'react';
import './App.css';

interface Shift {
  name: string;
  time: number;
}

function App() {
  // Do useState se dá nastavit i objekt s výchozími hodnotami
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  // useRef se používá pro uchování hodnot, které se nemění a nemají vliv na vykreslení komponenty
  const intervalRef = useRef<number | null>(null);
  // useId je vlastní hook, který generuje unikátní ID pro inputy
  const nameInputId = useId();

  // useEffect se spustí při prvním vykreslení komponenty a při změně hodnoty v závislostech
  useEffect(() => {
    if (isRunning && currentShift) {
      intervalRef.current = window.setInterval(() => {
        setCurrentShift((prevShift) => {
          if (prevShift) {
            return { ...prevShift, time: prevShift.time + 1 };
          }
          return prevShift;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentShift]);

  const handleStart = () => {
    setCurrentShift({ name: '', time: 0 });
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleSave = () => {
    if (currentShift) {
      setShifts((prevShifts) => {
        const existingShiftIndex = prevShifts.findIndex(
          (shift) => shift.name === currentShift.name
        );
        if (existingShiftIndex !== -1) {
          const updatedShifts = [...prevShifts];
          updatedShifts[existingShiftIndex] = currentShift;
          return updatedShifts;
        }
        return [...prevShifts, currentShift];
      });
      setCurrentShift(null);
    }
  };

  const handleEdit = (shift: Shift) => {
    setCurrentShift(shift);
    setIsRunning(true);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newTime = parseInt(e.target.value, 10) || 0;
    setShifts((prevShifts) => {
      const updatedShifts = [...prevShifts];
      if (newTime > updatedShifts[index].time) {
        updatedShifts[index].time = newTime;
      }
      return updatedShifts;
    });
    setCurrentShift(shifts[index]);
    setIsRunning(true);
  };

  return (
    <div className="container">
      <h1>Docházkový systém</h1>
      {currentShift ? (
        <div>
          <label htmlFor={nameInputId}>Jméno:</label>
          <input
            id={nameInputId}
            type="text"
            value={currentShift?.name || ''}
            onChange={(e) =>
              setCurrentShift({ ...currentShift!, name: e.target.value })
            }
            placeholder="Zadejte jméno"
          />
          <p>
            <strong>Čas ve směně:</strong> {currentShift?.time || 0} sekund
          </p>
          <button onClick={handleStop} disabled={!isRunning}>
            Zastavit
          </button>
          <button onClick={handleSave} disabled={isRunning || !currentShift?.name}>
            Uložit
          </button>
        </div>
      ) : (
        <button onClick={handleStart} disabled={isRunning}>
          Přidat směnu
        </button>
      )}
      <h2>Seznam směn</h2>
      <ul>
        {shifts.map((shift, index) => (
          <li key={index}>
            <strong>Jméno:</strong> {shift.name}, <strong>Čas:</strong>
            {shift.time >= 3600
              ? `${Math.floor(shift.time / 3600)} hodin ${Math.floor((shift.time % 3600) / 60)} minut ${shift.time % 60} sekund`
              : shift.time >= 60
              ? `${Math.floor(shift.time / 60)} minut ${shift.time % 60} sekund`
              : `${shift.time} sekund`}
            <button onClick={() => handleEdit(shift)}>Upravit</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
