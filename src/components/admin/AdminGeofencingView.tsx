import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Coordinates } from '../../types';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Sliders, 
  Save, 
  ShieldCheck, 
  Compass, 
  Building, 
  Crosshair,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';
import L from 'leaflet';

const CITY_PRESETS = [
  {
    name: 'Jakarta Selatan (Menara Sudirman)',
    address: 'Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    lat: -6.22415,
    lng: 106.80985,
  },
  {
    name: 'Jakarta Pusat (Monas / Thamrin)',
    address: 'Jl. M.H. Thamrin No. 28-30, Gondangdia, Menteng, Jakarta Pusat',
    lat: -6.19150,
    lng: 106.82350,
  },
  {
    name: 'Bandung (Dago Digital Hub)',
    address: 'Jl. Ir. H. Juanda No. 120, Coblong, Kota Bandung',
    lat: -6.88720,
    lng: 107.61480,
  },
  {
    name: 'Surabaya (Gubeng Tech Center)',
    address: 'Jl. Pemuda No. 33-37, Embong Kaliasin, Surabaya',
    lat: -7.26550,
    lng: 112.74800,
  },
];

export const AdminGeofencingView: React.FC = () => {
  const {
    geofenceConfig,
    updateGeofenceConfig,
    addToast,
  } = useApp();

  // Local Form state
  const [officeName, setOfficeName] = useState(geofenceConfig.officeName);
  const [address, setAddress] = useState(geofenceConfig.address);
  const [centerCoords, setCenterCoords] = useState<Coordinates>(geofenceConfig.center);
  const [radiusMeters, setRadiusMeters] = useState<number>(geofenceConfig.radiusMeters);
  const [strictMode, setStrictMode] = useState<boolean>(geofenceConfig.strictMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Leaflet map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  // Fetch human readable address from lat, lng using Nominatim Reverse Geocoding
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const customOfficeIcon = L.divIcon({
        className: 'custom-office-pin',
        html: `<div style="background-color: #2563EB; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      });

      const map = L.map(mapContainerRef.current, {
        center: [centerCoords.lat, centerCoords.lng],
        zoom: 17,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Office Marker (Draggable)
      const marker = L.marker([centerCoords.lat, centerCoords.lng], {
        icon: customOfficeIcon,
        draggable: true,
      }).addTo(map);

      marker.bindPopup(`<b>${officeName}</b><br/>Titik Pusat Geofence`).openPopup();

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setCenterCoords({ lat: pos.lat, lng: pos.lng });
        fetchAddressFromCoords(pos.lat, pos.lng);
      });

      // Geofence Circle
      const circle = L.circle([centerCoords.lat, centerCoords.lng], {
        radius: radiusMeters,
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        weight: 2.5,
      }).addTo(map);

      // Click on map to move office position
      map.on('click', (e: L.LeafletMouseEvent) => {
        setCenterCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        fetchAddressFromCoords(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map when coordinates or radius changes
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      const latlng: [number, number] = [centerCoords.lat, centerCoords.lng];
      markerRef.current.setLatLng(latlng);
      circleRef.current.setLatLng(latlng);
      circleRef.current.setRadius(radiusMeters);
      mapInstanceRef.current.flyTo(latlng, 17, { animate: true, duration: 1.2 });
    }
  }, [centerCoords, radiusMeters]);

  // Handle Preset Selection
  const handleSelectPreset = (preset: typeof CITY_PRESETS[0]) => {
    setOfficeName(preset.name);
    setAddress(preset.address);
    setCenterCoords({ lat: preset.lat, lng: preset.lng });
    addToast({
      type: 'info',
      title: 'Lokasi Kantor Dipilih',
      message: preset.name,
    });
  };

  // Get current browser GPS location and move map to user position
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast({
        type: 'error',
        title: 'GPS Tidak Didukung',
        message: 'Browser Anda tidak mendukung Geolocation GPS.',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCenterCoords(coords);
        setIsLocating(false);

        // Fly map directly to GPS point
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([coords.lat, coords.lng], 18, { animate: true, duration: 1.2 });
        }

        // Fetch real street address
        await fetchAddressFromCoords(coords.lat, coords.lng);

        addToast({
          type: 'success',
          title: 'Posisi GPS Ditemukan!',
          message: `Peta berhasil diarahkan ke koordinat Anda (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}).`,
        });
      },
      (err) => {
        setIsLocating(false);
        addToast({
          type: 'error',
          title: 'Gagal Mengakses GPS',
          message: err.message || 'Mohon berikan izin akses lokasi pada browser Anda.',
        });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Search Address via Nominatim Geocoding API
  const handleSearchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const first = results[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);

          setCenterCoords({ lat, lng });
          setAddress(first.display_name);

          addToast({
            type: 'success',
            title: 'Lokasi Ditemukan',
            message: first.display_name.split(',')[0],
          });
        } else {
          addToast({
            type: 'warning',
            title: 'Lokasi Tidak Ditemukan',
            message: 'Periksa kembali kata kunci pencarian alamat.',
          });
        }
      }
    } catch (e) {
      addToast({
        type: 'error',
        title: 'Pencarian Gagal',
        message: 'Terjadi kesalahan koneksi saat mencari alamat.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveGeofence = () => {
    updateGeofenceConfig({
      officeName,
      address,
      center: centerCoords,
      radiusMeters,
      strictMode,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Pengaturan Radius Geofencing Kantor</h1>
          <p className="text-xs text-slate-500">
            Tentukan koordinat pusat kantor dan radius absensi presisi untuk seluruh karyawan.
          </p>
        </div>

        <button
          onClick={handleSaveGeofence}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Konfigurasi Geofence</span>
        </button>
      </div>

      {/* Main Grid: Map 70% & Config Panel 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Map Area (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
          {/* Map Search & Control Toolbar */}
          <div className="p-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Address Search Input Form */}
            <form onSubmit={handleSearchAddress} className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama gedung, jalan, atau kota..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Cari</span>}
              </button>
            </form>

            {/* GPS Location Button */}
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md shadow-emerald-600/20"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendeteksi...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4 text-emerald-200" />
                  <span>GPS Lokasi Saya</span>
                </>
              )}
            </button>

          </div>

          {/* Leaflet Map Canvas */}
          <div ref={mapContainerRef} className="flex-1 w-full min-h-[460px] z-0" />
          
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Petunjuk: Klik pada peta atau seret marker ikon biru untuk memindahkan lokasi kantor.</span>
          </div>
        </div>

        {/* Configuration Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Office Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" />
              Detail Informasi Geofence
            </h3>

            {/* Nama Kantor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Kantor / Cabang
              </label>
              <input
                type="text"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Terdeteksi / Custom
              </label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>

            {/* Radius Slider */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700">Batas Radius Absensi Valid</label>
                <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {radiusMeters} m
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>20 m (Presisi)</span>
                <span>500 m</span>
                <span>1000 m (1 Km)</span>
              </div>
            </div>

            {/* Manual Coordinates Input (Latitude & Longitude) */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Input Manual Koordinat GPS Kantor
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Latitude (Lat)</span>
                  <input
                    type="number"
                    step="any"
                    value={centerCoords.lat}
                    onChange={(e) => {
                      const newLat = parseFloat(e.target.value) || 0;
                      setCenterCoords(prev => ({ ...prev, lat: newLat }));
                      fetchAddressFromCoords(newLat, centerCoords.lng);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="-6.22415"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block mb-0.5">Longitude (Lng)</span>
                  <input
                    type="number"
                    step="any"
                    value={centerCoords.lng}
                    onChange={(e) => {
                      const newLng = parseFloat(e.target.value) || 0;
                      setCenterCoords(prev => ({ ...prev, lng: newLng }));
                      fetchAddressFromCoords(centerCoords.lat, newLng);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="106.80985"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Ketik manual koordinat GPS lokasi kantor Anda, peta akan otomatis mengarahkan ke titik tersebut.
              </p>
            </div>
          </div>

          {/* Quick Preset Locations */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Preset Lokasi Kota Besar
            </h4>
            <div className="space-y-1.5">
              {CITY_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors flex items-start justify-between gap-2 text-xs cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{preset.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{preset.address}</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 shrink-0">Pilih</span>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
