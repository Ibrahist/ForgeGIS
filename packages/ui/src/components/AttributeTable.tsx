import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Maximize2,
  X,
  Download,
  Filter,
} from 'lucide-react';
import { useProjectStore } from '@forgegis/core';
import { Button } from './Button';
import { Pill } from './Pill';

export interface AttributeTableProps {
  className?: string;
}

export interface TableRowRecord {
  _id: number;
  _coords?: [number, number];
  [key: string]: unknown;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({ className = '' }) => {
  const {
    project,
    isAttributeTableOpen,
    attributeTableLayerId,
    closeAttributeTable,
    zoomToCoords,
  } = useProjectStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const layer = project.layers.find((l) => l.id === attributeTableLayerId);

  // Extract columns and row objects from FeatureCollection
  const { columns, rows } = useMemo(() => {
    if (!layer || !layer.data || !layer.data.features) {
      return { columns: [], rows: [] };
    }

    const cols = layer.fields.map((f) => f.name);
    const featureRows: TableRowRecord[] = layer.data.features.map((feat, idx) => {
      // Find coordinates for per-row zoom
      let coords: [number, number] | undefined;
      if (feat.geometry) {
        if (feat.geometry.type === 'Point') {
          coords = feat.geometry.coordinates as [number, number];
        } else if (feat.geometry.type === 'Polygon' || feat.geometry.type === 'MultiPolygon') {
          // Point in polygon or first coord
          const polyCoords = (feat.geometry as unknown as { coordinates: number[][][] }).coordinates[0]?.[0];
          if (polyCoords) coords = [polyCoords[0], polyCoords[1]];
        } else if (feat.geometry.type === 'LineString') {
          const lineCoords = feat.geometry.coordinates[0];
          if (lineCoords) coords = [lineCoords[0], lineCoords[1]];
        }
      }

      return {
        _id: idx,
        _coords: coords,
        ...(feat.properties || {}),
      };
    });

    return { columns: cols, rows: featureRows };
  }, [layer]);

  // Filter & Sort
  const filteredAndSortedRows = useMemo(() => {
    let result = rows;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => String(val ?? '').toLowerCase().includes(q))
      );
    }

    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === valB) return 0;
        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const cmp = String(valA).localeCompare(String(valB));
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, searchTerm, sortColumn, sortDirection]);

  const paginatedRows = useMemo(() => {
    return filteredAndSortedRows.slice(page * pageSize, (page + 1) * pageSize);
  }, [filteredAndSortedRows, page, pageSize]);

  const totalPages = Math.ceil(filteredAndSortedRows.length / pageSize);

  const toggleSort = (col: string) => {
    if (sortColumn === col) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    if (!layer || rows.length === 0) return;
    const header = columns.join(',');
    const csvContent = [
      header,
      ...rows.map((r) =>
        columns
          .map((col) => {
            const val = r[col];
            if (typeof val === 'string' && val.includes(',')) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return String(val ?? '');
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.replace(/\s+/g, '_')}_attributes.csv`;
    a.click();
  };

  if (!isAttributeTableOpen || !layer) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-[#121217] border-t border-white/10 shadow-2xl flex flex-col h-80 transition-transform ${className}`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#181820] border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f5f5f7] tracking-tight">
              Attribute Table: {layer.name}
            </span>
            <Pill label={`${filteredAndSortedRows.length} features`} variant="rose" />
          </div>

          {/* Search Input */}
          <div className="relative flex items-center">
            <Search size={13} className="absolute left-2.5 text-[#9d9da8]" />
            <input
              type="text"
              placeholder="Filter attributes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className="bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-full pl-8 pr-3 py-1 outline-none focus:border-[#f47fa3] w-52 placeholder-[#656573]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Export button */}
          <Button
            variant="glass"
            size="sm"
            onClick={handleExportCsv}
            icon={<Download size={13} />}
          >
            Export CSV
          </Button>

          {/* Close */}
          <button
            onClick={closeAttributeTable}
            className="p-1 rounded-full text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/10"
            title="Close Table"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="sticky top-0 bg-[#181820] border-b border-white/8 z-10 text-[11px] text-[#9d9da8]">
            <tr>
              <th className="px-3 py-2 w-12 text-center">Zoom</th>
              {columns.map((col) => {
                const isSorted = sortColumn === col;
                return (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className="px-3 py-2 cursor-pointer hover:text-[#f5f5f7] select-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      {isSorted ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp size={11} className="text-[#f47fa3]" />
                        ) : (
                          <ArrowDown size={11} className="text-[#f47fa3]" />
                        )
                      ) : (
                        <ArrowUpDown size={10} className="opacity-40" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12 text-[#9d9da8]">
                  No matching features found
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr key={row._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 py-1.5 text-center">
                    {row._coords && (
                      <button
                        onClick={() => zoomToCoords(row._coords as [number, number], 15)}
                        className="p-1 rounded text-[#9d9da8] hover:text-[#f47fa3] hover:bg-white/10"
                        title="Zoom to feature"
                      >
                        <Maximize2 size={12} />
                      </button>
                    )}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 text-[#ebdbb2] truncate max-w-[200px]">
                      {String(row[col] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#181820] border-t border-white/8 text-xs text-[#9d9da8]">
          <span>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="glass"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="glass"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
