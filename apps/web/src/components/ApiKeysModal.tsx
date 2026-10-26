import React, { useState, useEffect } from 'react';
import { Key, ExternalLink, Check, ShieldCheck, Sparkles, Map } from 'lucide-react';
import { Modal, Button } from '@forgegis/ui';
import { useProjectStore, DEFAULT_BASEMAPS } from '@forgegis/core';

export interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeysModal: React.FC<ApiKeysModalProps> = ({ isOpen, onClose }) => {
  const { setBasemap } = useProjectStore();
  const [cartoKey, setCartoKey] = useState('');
  const [mapboxToken, setMapboxToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingCarto =
        localStorage.getItem('forgegis_carto_api_key') ||
        localStorage.getItem('carto_api_key') ||
        ((import.meta as any).env?.VITE_CARTO_API_KEY as string) ||
        '';
      const existingMapbox =
        localStorage.getItem('forgegis_mapbox_token') ||
        localStorage.getItem('mapbox_token') ||
        ((import.meta as any).env?.VITE_MAPBOX_TOKEN as string) ||
        '';
      setCartoKey(existingCarto);
      setMapboxToken(existingMapbox);
    }
  }, [isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      if (cartoKey.trim()) {
        localStorage.setItem('forgegis_carto_api_key', cartoKey.trim());
      } else {
        localStorage.removeItem('forgegis_carto_api_key');
        localStorage.removeItem('carto_api_key');
      }

      if (mapboxToken.trim()) {
        localStorage.setItem('forgegis_mapbox_token', mapboxToken.trim());
      } else {
        localStorage.removeItem('forgegis_mapbox_token');
        localStorage.removeItem('mapbox_token');
      }

      // Notify map to immediately reload basemap tiles with new key
      window.dispatchEvent(new CustomEvent('forgegis-apikeys-updated'));
    }

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 700);
  };

  const handleSwitchToEsriDark = () => {
    const esri = DEFAULT_BASEMAPS.find((b) => b.id === 'esri-dark');
    if (esri) {
      setBasemap(esri);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="API Keys & Basemap Providers"
      subtitle="Configure keys for CARTO and Mapbox, or select free watermark-free alternatives"
      size="md"
    >
      <div className="p-6 space-y-6 text-xs text-[#9d9da8]">
        {/* Quick No-Key Alternative Banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#e3b450]/10 to-[#f47fa3]/10 border border-[#e3b450]/20 flex items-start gap-3">
          <Sparkles size={18} className="text-[#e3b450] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <span className="font-semibold text-xs text-[#f5f5f7] block">
              Want a dark basemap with zero API key or watermark?
            </span>
            <p className="text-[11px] text-[#9d9da8] leading-relaxed">
              You can instantly switch to <strong className="text-[#f5f5f7]">Esri Dark Gray</strong>,{' '}
              <strong className="text-[#f5f5f7]">OpenStreetMap</strong>, or{' '}
              <strong className="text-[#f5f5f7]">World Imagery</strong> with no key required.
            </p>
            <Button
              variant="subtle"
              size="sm"
              onClick={handleSwitchToEsriDark}
              icon={<Map size={12} className="text-[#e3b450]" />}
              className="mt-1"
            >
              Switch to Esri Dark Gray (Free)
            </Button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* CARTO Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="carto-key-input" className="font-medium text-[#f5f5f7] flex items-center gap-1.5">
                <Key size={14} className="text-[#f47fa3]" />
                CARTO Basemaps API Key
              </label>
              <a
                href="https://carto.com/basemaps/apikey/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1"
              >
                <span>Get free key</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <p className="text-[11px] text-[#9d9da8]">
              Removes the <em>"API KEY REQUIRED carto.com/basemaps/apikey"</em> watermark on Carto Dark Matter & Positron.
            </p>
            <input
              id="carto-key-input"
              type="text"
              placeholder="e.g. carto_live_... or your CARTO key"
              value={cartoKey}
              onChange={(e) => setCartoKey(e.target.value)}
              className="w-full bg-[#181820] border border-white/10 rounded-xl p-2.5 text-xs text-[#f5f5f7] font-mono outline-none focus:border-[#f47fa3] transition-colors"
            />
          </div>

          {/* Mapbox Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="mapbox-token-input" className="font-medium text-[#f5f5f7] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#38bdf8]" />
                Mapbox Access Token (Optional)
              </label>
              <a
                href="https://account.mapbox.com/access-tokens/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1"
              >
                <span>Mapbox tokens</span>
                <ExternalLink size={10} />
              </a>
            </div>
            <input
              id="mapbox-token-input"
              type="text"
              placeholder="e.g. pk.eyJ1Ijo..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="w-full bg-[#181820] border border-white/10 rounded-xl p-2.5 text-xs text-[#f5f5f7] font-mono outline-none focus:border-[#38bdf8] transition-colors"
            />
          </div>

          {/* Developer env note */}
          <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-[11px] text-[#9d9da8] leading-relaxed">
            <strong className="text-[#f5f5f7]">Developers:</strong> You can also set{' '}
            <code className="text-[#e3b450] bg-black/40 px-1 py-0.5 rounded font-mono">
              VITE_CARTO_API_KEY
            </code>{' '}
            in your <code className="text-[#f5f5f7]">apps/web/.env.local</code> file.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="subtle" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              icon={saved ? <Check size={14} /> : <Key size={14} />}
            >
              {saved ? 'Saved!' : 'Save & Apply'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
