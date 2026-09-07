import { useEffect, useState } from 'react';

type AvailabilityWindow = {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  notes: string | null;
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export function AvailabilityPage() {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${apiBaseUrl}/availability`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load availability');
        return response.json() as Promise<{ windows: AvailabilityWindow[] }>;
      })
      .then((data) => setWindows(data.windows))
      .catch(() => setError('Availability is temporarily unavailable.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-eyebrow">Availability</span>
          <h2>Availability management</h2>
        </div>

        {isLoading && <p>Loading availability...</p>}
        {!isLoading && error && <p role="alert">{error}</p>}
        {!isLoading && !error && windows.length === 0 && (
          <p>No availability windows have been published.</p>
        )}
        {!isLoading && !error && windows.length > 0 && (
          <div className="card-grid">
            {windows.map((window) => (
              <article key={window.id} className="card">
                <span className="section-eyebrow">{dayNames[window.dayOfWeek]}</span>
                <h3>{window.title}</h3>
                <p>{window.startTime} - {window.endTime} ({window.timezone})</p>
                {window.notes && <p>{window.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
