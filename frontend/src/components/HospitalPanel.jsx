import { useState } from 'react'
import { geocodeAddress, fetchNearbyHospitals } from '../api'

function mapsLink(lat, lon, name) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`
}

export default function HospitalPanel() {
  const [address, setAddress] = useState('')
  const [results, setResults] = useState(null)
  const [emergencyNumber, setEmergencyNumber] = useState(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchNearby(lat, lon, countryCode) {
    setLoading(true)
    setError('')
    try {
      const data = await fetchNearbyHospitals({ lat, lon, countryCode })
      setResults(data.results)
      setEmergencyNumber(data.emergency_number)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError('Your browser does not support geolocation.')
      return
    }
    setLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationLabel('Your current location')
        searchNearby(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        setLoading(false)
        setError('Location access was denied. Try typing an address instead.')
      }
    )
  }

  async function handleAddressSubmit(e) {
    e.preventDefault()
    if (!address.trim()) return
    setLoading(true)
    setError('')
    try {
      const location = await geocodeAddress(address)
      setLocationLabel(location.display_name)
      await searchNearby(location.lat, location.lon, location.country_code)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="hospital-panel">
      <p className="hint" style={{ marginBottom: 16 }}>
        Find hospitals and clinics near you, using OpenStreetMap data.
      </p>

      <div className="hospital-controls">
        <button className="use-location-btn" onClick={useMyLocation} disabled={loading}>
          Use my location
        </button>
        <form onSubmit={handleAddressSubmit} className="history-search" style={{ flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Or type a city / address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button type="submit" disabled={loading}>Search</button>
        </form>
      </div>

      {error && <p className="error-note">{error}</p>}
      {loading && <p className="welcome">Searching…</p>}

      {emergencyNumber && (
        <div className="alert-banner" style={{ marginTop: 4 }}>
          Emergency number for this area: {emergencyNumber}
        </div>
      )}

      {locationLabel && !loading && (
        <p className="hint" style={{ marginBottom: 12 }}>Showing results near: {locationLabel}</p>
      )}

      {results && results.length === 0 && !loading && (
        <p className="welcome">No hospitals or clinics found nearby in OpenStreetMap's data for this area.</p>
      )}

      {results && results.length > 0 && (
        <div className="history-list">
          {results.map((h, i) => (
            <div className="history-item" key={i}>
              <div className="history-item-top">
                <span className="history-disease">{h.name}</span>
                <span className="history-confidence">{h.distance_km} km</span>
              </div>
              <p className="history-symptoms">{h.type === 'hospital' ? 'Hospital' : 'Clinic'}{h.address ? ` · ${h.address}` : ''}</p>
              <a href={mapsLink(h.lat, h.lon, h.name)} target="_blank" rel="noreferrer" className="map-link">
                View on map →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
