import React, { useState } from 'react';
import {
  Play,
  Save,
  Clock,
  Layers,
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  Bookmark,
} from 'lucide-react';
import { useProjectStore, defaultDuckDB } from '@forgegis/core';
import { Button } from './Button';
import { Pill } from './Pill';
import { Tabs } from './Tabs';

export interface SqlWorkspaceProps {
  className?: string;
}

const SAMPLE_QUERIES = [
  {
    name: 'High Water Temperature Buoys',
    sql: 'SELECT station_name, water_temp_c, wave_height_m, latitude, longitude\nFROM sf_bay_marine_sensor_buoys\nWHERE water_temp_c > 14.5\nORDER BY water_temp_c DESC;',
  },
  {
    name: 'Critical Flood Risk Coastal Zones',
    sql: 'SELECT zone_name, category, elevation_m, flood_depth_m, geom\nFROM coastal_flood___erosion_risk_zones\nWHERE flood_depth_m > 1.0\nORDER BY flood_depth_m DESC;',
  },
  {
    name: 'Sensor Averages & Range Stats',
    sql: 'SELECT COUNT(*) as total_stations, AVG(water_temp_c) as avg_temp_c, MAX(wave_height_m) as max_wave_m, AVG(salinity_psu) as avg_salinity\nFROM sf_bay_marine_sensor_buoys;',
  },
];

export const SqlWorkspace: React.FC<SqlWorkspaceProps> = ({ className = '' }) => {
  const {
    project,
    activeSqlText,
    setActiveSqlText,
    isSqlExecuting,
    setSqlExecuting,
    lastQueryResult,
    setLastQueryResult,
    saveQuery,
    deleteSavedQuery,
    queryHistory,
    addQueryHistory,
    clearQueryHistory,
    addQueryResultAsLayer,
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'results' | 'saved' | 'history'>('results');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newSaveName, setNewSaveName] = useState('');
  const [isSavingQuery, setIsSavingQuery] = useState(false);
  const [newLayerName, setNewLayerName] = useState('');
  const [isAddingLayer, setIsAddingLayer] = useState(false);

  const handleRunQuery = async () => {
    if (!activeSqlText.trim()) return;
    setSqlExecuting(true);
    setErrorMessage(null);

    const startTime = performance.now();
    try {
      const result = await defaultDuckDB.executeQuery(activeSqlText, project.layers);
      setLastQueryResult(result);
      setActiveTab('results');

      addQueryHistory({
        id: 'hist_' + Date.now(),
        sql: activeSqlText,
        timestamp: new Date().toLocaleTimeString(),
        durationMs: result.durationMs,
        rowCount: result.rowCount,
        status: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      addQueryHistory({
        id: 'hist_' + Date.now(),
        sql: activeSqlText,
        timestamp: new Date().toLocaleTimeString(),
        durationMs: Math.round(performance.now() - startTime),
        rowCount: 0,
        status: 'error',
        errorMessage: msg,
      });
    } finally {
      setSqlExecuting(false);
    }
  };

  const handleSaveCurrentQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaveName.trim()) return;
    saveQuery(newSaveName.trim(), activeSqlText);
    setNewSaveName('');
    setIsSavingQuery(false);
  };

  const handleCreateLayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastQueryResult || !lastQueryResult.geoJson) return;
    addQueryResultAsLayer(newLayerName.trim() || 'SQL Query Result');
    setIsAddingLayer(false);
    setNewLayerName('');
  };

  return (
    <div className={`flex flex-col h-full bg-[#121217] text-[#f5f5f7] ${className}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#181820] border-b border-white/8 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <Database size={16} className="text-[#38bdf8]" />
          <h3 className="text-xs font-semibold tracking-wide uppercase text-[#f5f5f7]">
            DuckDB-WASM Spatial SQL
          </h3>
          <Pill label="Client-Side" variant="cyan" />
        </div>

        {/* Quick query presets dropdown */}
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) setActiveSqlText(e.target.value);
            }}
            className="bg-[#0a0a0c] border border-white/10 text-xs text-[#9d9da8] rounded-full px-3 py-1 outline-none hover:text-[#f5f5f7] cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>
              Sample Queries...
            </option>
            {SAMPLE_QUERIES.map((q, idx) => (
              <option key={idx} value={q.sql}>
                {q.name}
              </option>
            ))}
          </select>

          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsSavingQuery(true)}
            icon={<Save size={13} />}
          >
            Save Query
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={isSqlExecuting || !activeSqlText.trim()}
            onClick={handleRunQuery}
            icon={<Play size={13} className="fill-current" />}
          >
            {isSqlExecuting ? 'Executing...' : 'Run Query'}
          </Button>
        </div>
      </div>

      {/* SQL Editor Area */}
      <div className="p-3 border-b border-white/8 bg-[#0a0a0c]/60">
        <div className="relative rounded-xl border border-white/10 bg-[#0a0a0c] overflow-hidden focus-within:border-[#38bdf8]">
          <textarea
            value={activeSqlText}
            onChange={(e) => setActiveSqlText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRunQuery();
              }
            }}
            placeholder="Write your spatial SQL query here (e.g. SELECT * FROM sf_bay_marine_sensor_buoys)..."
            rows={5}
            className="w-full p-3 font-mono text-xs text-[#ebdbb2] bg-transparent outline-none resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#14141c] border-t border-white/5 text-[10px] text-[#9d9da8] font-mono">
            <span>Press Ctrl+Enter to Execute</span>
            <span>DuckDB Spatial Extension Enabled</span>
          </div>
        </div>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="m-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="font-mono">{errorMessage}</span>
        </div>
      )}

      {/* Results Header with Actions */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181820] border-b border-white/6">
        <Tabs
          tabs={[
            {
              id: 'results',
              label: 'Results',
              count: lastQueryResult ? lastQueryResult.rowCount : undefined,
            },
            {
              id: 'saved',
              label: 'Saved Queries',
              count: project.sqlWorkspace.queries.length,
            },
            {
              id: 'history',
              label: 'History',
              count: queryHistory.length,
            },
          ]}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as typeof activeTab)}
        />

        {activeTab === 'results' && lastQueryResult && (
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-[#9d9da8]">
              {lastQueryResult.rowCount} rows in {lastQueryResult.durationMs}ms
            </span>

            {lastQueryResult.geoJson && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddingLayer(true)}
                icon={<Layers size={13} />}
              >
                Add as Map Layer
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tab Content Panels */}
      <div className="flex-1 overflow-auto">
        {/* 1. Results Table */}
        {activeTab === 'results' && (
          <div>
            {!lastQueryResult ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#9d9da8] text-xs">
                <Database size={32} className="mb-2 opacity-40 stroke-1" />
                <p>Run a query to view results table and map spatial features</p>
              </div>
            ) : lastQueryResult.rows.length === 0 ? (
              <div className="text-center py-12 text-[#9d9da8] text-xs">Query returned 0 rows</div>
            ) : (
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-[#181820] border-b border-white/8 z-10 text-[11px] text-[#9d9da8]">
                  <tr>
                    {lastQueryResult.columns.map((col) => (
                      <th key={col} className="px-3 py-2 font-medium">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lastQueryResult.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      {lastQueryResult.columns.map((col) => (
                        <td
                          key={col}
                          className="px-3 py-1.5 text-[#ebdbb2] truncate max-w-[200px]"
                        >
                          {String(row[col] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 2. Saved Queries */}
        {activeTab === 'saved' && (
          <div className="p-3 space-y-2">
            {project.sqlWorkspace.queries.length === 0 ? (
              <div className="text-center py-12 text-[#9d9da8] text-xs">No saved queries yet</div>
            ) : (
              project.sqlWorkspace.queries.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-xl bg-[#181820] border border-white/6 hover:border-white/12 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#f5f5f7]">{q.name}</span>
                    <pre className="text-[10px] font-mono text-[#9d9da8] mt-1 truncate max-w-md">
                      {q.sql}
                    </pre>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        setActiveSqlText(q.sql);
                        handleRunQuery();
                      }}
                      icon={<Play size={12} />}
                    >
                      Run
                    </Button>
                    <button
                      onClick={() => deleteSavedQuery(q.id)}
                      className="p-1.5 rounded text-[#9d9da8] hover:text-red-400 hover:bg-white/5"
                      title="Delete saved query"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. Query History */}
        {activeTab === 'history' && (
          <div className="p-3 space-y-2">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[11px] font-mono text-[#9d9da8]">Recent Query History</span>
              {queryHistory.length > 0 && (
                <button
                  onClick={clearQueryHistory}
                  className="text-[11px] text-[#9d9da8] hover:text-red-400"
                >
                  Clear History
                </button>
              )}
            </div>

            {queryHistory.length === 0 ? (
              <div className="text-center py-12 text-[#9d9da8] text-xs">No query history yet</div>
            ) : (
              queryHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-[#181820] border border-white/6 flex items-center justify-between"
                >
                  <div className="flex flex-col min-w-0 mr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'success' ? 'bg-[#34d399]' : 'bg-red-400'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-[#9d9da8]">{item.timestamp}</span>
                      <span className="text-[10px] font-mono text-[#e3b450]">
                        {item.durationMs}ms
                      </span>
                      {item.rowCount > 0 && (
                        <span className="text-[10px] font-mono text-[#9d9da8]">
                          • {item.rowCount} rows
                        </span>
                      )}
                    </div>
                    <pre className="text-[11px] font-mono text-[#f5f5f7] mt-1 truncate">
                      {item.sql}
                    </pre>
                  </div>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      setActiveSqlText(item.sql);
                      handleRunQuery();
                    }}
                    icon={<Play size={11} />}
                  >
                    Run
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Save Query Modal */}
      {isSavingQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleSaveCurrentQuery}
            className="w-full max-w-md bg-[#181820] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
          >
            <h4 className="text-sm font-semibold text-[#f5f5f7]">Save Query</h4>
            <div>
              <label className="text-xs text-[#9d9da8] block mb-1.5">Query Name</label>
              <input
                type="text"
                required
                placeholder="e.g. SF Bay High Temp Stations"
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                autoFocus
                className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2.5 outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setIsSavingQuery(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Save size={13} />}>
                Save
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Add Layer From Query Result Modal */}
      {isAddingLayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateLayer}
            className="w-full max-w-md bg-[#181820] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4"
          >
            <h4 className="text-sm font-semibold text-[#f5f5f7]">Add Query Result as Map Layer</h4>
            <div>
              <label className="text-xs text-[#9d9da8] block mb-1.5">New Layer Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Filtered Sensor Stations"
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                autoFocus
                className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2.5 outline-none focus:border-[#38bdf8]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" size="sm" onClick={() => setIsAddingLayer(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Layers size={13} />}>
                Add to Map
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
