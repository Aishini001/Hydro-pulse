import React, { useState, useEffect } from 'react';
import { 
  Droplet, MapPin, AlertTriangle, CheckCircle2, Snowflake, 
  Gauge, Plus, RefreshCw, Sparkles, Filter, ChevronRight, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_STATIONS = [
  {
    id: 1,
    name: 'Central Library - Ground Floor Foyer',
    building: 'Library',
    filterStatus: 'Green', // 'Green' | 'Red'
    temp: 'Ice Cold (12°C)',
    pressure: 'Normal',
    refillsLogged: 1420,
    lastInspected: '2 days ago',
    coords: { x: 32, y: 30 }
  },
  {
    id: 2,
    name: 'Academic Block 2 - CS Dept 1st Floor',
    building: 'Block 2',
    filterStatus: 'Green',
    temp: 'Chilled (15°C)',
    pressure: 'Normal',
    refillsLogged: 980,
    lastInspected: 'Yesterday',
    coords: { x: 68, y: 28 }
  },
  {
    id: 3,
    name: 'Mechanical Workshop Wing - Gate Entrance',
    building: 'Polytechnic',
    filterStatus: 'Red',
    temp: 'Room Temp (24°C)',
    pressure: 'Low Pressure',
    refillsLogged: 610,
    lastInspected: 'Needs Maintenance',
    coords: { x: 25, y: 72 }
  },
  {
    id: 4,
    name: 'Student Activity Centre - Gymnasium Lobby',
    building: 'SAC',
    filterStatus: 'Green',
    temp: 'Ice Cold (10°C)',
    pressure: 'High Pressure',
    refillsLogged: 2150,
    lastInspected: '3 days ago',
    coords: { x: 75, y: 70 }
  }
];

export default function App() {
  const [stations, setStations] = useState(() => {
    const saved = localStorage.getItem('hydropulse_stations');
    return saved ? JSON.parse(saved) : INITIAL_STATIONS;
  });

  const [studentRefills, setStudentRefills] = useState(() => {
    const saved = localStorage.getItem('hydropulse_refills');
    return saved ? parseInt(saved) : 6;
  });

  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [filterMode, setFilterMode] = useState('All');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportedStatus, setReportedStatus] = useState('Filter Red');
  const [reportedTemp, setReportedTemp] = useState('Room Temp');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('hydropulse_stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('hydropulse_refills', studentRefills.toString());
  }, [studentRefills]);

  const handleRefillMyBottle = (stationId) => {
    setStudentRefills(prev => prev + 1);
    setStations(prev => prev.map(st => {
      if (st.id === stationId) {
        return { ...st, refillsLogged: st.refillsLogged + 1 };
      }
      return st;
    }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const handleMaintenanceReport = (e) => {
    e.preventDefault();
    setStations(prev => prev.map(st => {
      if (st.id === selectedStation.id) {
        return {
          ...st,
          filterStatus: reportedStatus === 'Filter Red' ? 'Red' : 'Green',
          temp: reportedTemp === 'Room Temp' ? 'Room Temp (24°C)' : 'Ice Cold (12°C)',
          pressure: reportedStatus === 'Low Pressure' ? 'Low Pressure' : st.pressure,
          lastInspected: 'Report Dispatched'
        };
      }
      return st;
    }));

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
    }, 1200);
  };

  const filteredStations = stations.filter(st => {
    if (filterMode === 'All') return true;
    if (filterMode === 'Cold Only') return st.temp.includes('Cold') || st.temp.includes('Chilled');
    if (filterMode === 'Clean Filters') return st.filterStatus === 'Green';
    if (filterMode === 'Needs Service') return st.filterStatus === 'Red';
    return true;
  });

  const plasticBottlesSaved = studentRefills;
  const co2GramsSaved = (studentRefills * 82.8).toFixed(0);

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <header style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', background: '#0284c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplet size={22} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>HydroPulse</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Campus Water Quality & Filter Telemetry</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0369a1', color: '#e0f2fe', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
          <Sparkles size={14} /> {plasticBottlesSaved} Single-Use Bottles Saved
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
        
        {/* Left: Map & Filter Controls */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'Clean Filters', 'Cold Only', 'Needs Service'].map(tag => (
              <button
                key={tag}
                onClick={() => setFilterMode(tag)}
                style={{
                  background: filterMode === tag ? '#0284c7' : '#1e293b',
                  color: filterMode === tag ? '#ffffff' : '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Interactive Campus Map Canvas */}
          <div style={{
            background: '#0d1527',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            height: '340px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '14px', left: '16px', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
              CAMPUS REFILL LOCATIONS & FILTER STATUS
            </div>

            {/* Pins */}
            {filteredStations.map(st => {
              const isSelected = selectedStation.id === st.id;
              const isGreen = st.filterStatus === 'Green';
              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  style={{
                    position: 'absolute',
                    top: `${st.coords.y}%`,
                    left: `${st.coords.x}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <div style={{
                    width: isSelected ? '42px' : '32px',
                    height: isSelected ? '42px' : '32px',
                    borderRadius: '50%',
                    background: isGreen ? '#10b981' : '#ef4444',
                    border: isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.4)',
                    boxShadow: isGreen ? '0 0 12px rgba(16, 185, 129, 0.5)' : '0 0 12px rgba(239, 68, 68, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'all 0.15s ease'
                  }}>
                    <Droplet size={isSelected ? 20 : 16} />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#cbd5e1',
                    background: 'rgba(15, 23, 42, 0.85)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {st.building}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Station Directory Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {filteredStations.map(station => {
              const isSelected = selectedStation.id === station.id;
              const isGreen = station.filterStatus === 'Green';
              return (
                <div
                  key={station.id}
                  onClick={() => setSelectedStation(station)}
                  style={{
                    background: isSelected ? '#1e293b' : '#0f172a',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: isGreen ? '#064e3b' : '#7f1d1d',
                      color: isGreen ? '#6ee7b7' : '#fca5a5'
                    }}>
                      {isGreen ? 'Filter Clean' : 'Service Needed'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {station.refillsLogged} refills
                    </span>
                  </div>

                  <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '8px 0 4px 0', color: '#f8fafc' }}>
                    {station.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#cbd5e1', marginTop: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Snowflake size={12} color="#38bdf8" /> {station.temp.split(' ')[0]}
                    </span>
                    <span>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Gauge size={12} color="#94a3b8" /> {station.pressure}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Station Inspector & Actions */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Selected Station Telemetry */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Selected Dispenser
            </span>
            <h2 style={{ fontSize: '17px', fontWeight: '800', margin: '4px 0 14px 0' }}>{selectedStation.name}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#030712', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Filter Health</span>
                <div style={{ fontSize: '15px', fontWeight: '800', color: selectedStation.filterStatus === 'Green' ? '#10b981' : '#ef4444', marginTop: '4px' }}>
                  {selectedStation.filterStatus === 'Green' ? 'Pass (Green Light)' : 'Expired (Red Light)'}
                </div>
              </div>

              <div style={{ background: '#030712', padding: '12px', borderRadius: '10px', border: '1px solid #1e293b' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Temperature</span>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                  {selectedStation.temp}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleRefillMyBottle(selectedStation.id)}
                style={{
                  padding: '12px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={16} /> I Just Refilled My Bottle Here (+1 Saved)
              </button>

              <button
                onClick={() => setReportModalOpen(true)}
                style={{
                  padding: '10px',
                  background: '#1e293b',
                  color: '#f87171',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={14} /> 2-Tap Report to Maintenance
              </button>
            </div>
          </div>

          {/* Student Sustainability Footprint */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '18px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 10px 0', color: '#cbd5e1' }}>Your Campus Hydration Impact</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#030712', padding: '12px 16px', borderRadius: '10px', border: '1px solid #1e293b' }}>
              <div>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#38bdf8' }}>{studentRefills}</span>
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>Bottles Refilled</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{co2GramsSaved}g</span>
                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8' }}>CO2 Offset</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 2-Tap Maintenance Modal */}
      {reportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', margin: 0 }}>Report Issue: {selectedStation.building}</h3>
              <X size={18} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => setReportModalOpen(false)} />
            </div>

            {reportSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#10b981' }}>
                <CheckCircle2 size={36} style={{ margin: '0 auto 8px auto' }} />
                <p style={{ fontWeight: '700', fontSize: '14px' }}>Report Logged into Campus Facility Queue!</p>
              </div>
            ) : (
              <form onSubmit={handleMaintenanceReport} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Filter Light Indicator</label>
                  <select
                    value={reportedStatus}
                    onChange={e => setReportedStatus(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="Filter Red">Filter Light is RED (Replace Required)</option>
                    <option value="Low Pressure">Trickle / Low Water Pressure</option>
                    <option value="Filter Green">Filter is Clean / Green Light</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#94a3b8' }}>Water Temperature Status</label>
                  <select
                    value={reportedTemp}
                    onChange={e => setReportedTemp(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '13px', marginTop: '4px' }}
                  >
                    <option value="Room Temp">Warm / Chiller Broken (Room Temp)</option>
                    <option value="Cold">Chilled / Cold Water Working</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Maintenance Ping
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}