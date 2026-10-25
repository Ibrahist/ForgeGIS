import React, { useState } from 'react';
import { Modal } from './Modal';
import { Pill } from './Pill';
import { Button } from './Button';
import { DEMO_PROJECTS_GALLERY, DemoProjectCard, useProjectStore } from '@forgegis/core';
import { Compass, Search, ExternalLink, MapPin, Layers } from 'lucide-react';

export interface DemoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectLoaded?: (project: DemoProjectCard) => void;
}

export const DemoGalleryModal: React.FC<DemoGalleryModalProps> = ({
  isOpen,
  onClose,
  onProjectLoaded,
}) => {
  const { loadProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');

  const domains = [
    { id: 'all', label: 'All Projects (10)' },
    { id: 'Coastal Monitoring', label: 'Coastal Monitoring' },
    { id: 'Marine Biology', label: 'Marine Biology' },
    { id: 'Disaster Management', label: 'Disaster Management' },
    { id: 'Marine Ecology', label: 'Marine Ecology' },
    { id: 'Clean Energy', label: 'Clean Energy' },
    { id: 'Urban Resilience', label: 'Urban Resilience' },
  ];

  const filteredProjects = DEMO_PROJECTS_GALLERY.filter((p) => {
    const matchesDomain = selectedDomain === 'all' || p.domain === selectedDomain;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesQuery;
  });

  const handleSelectProject = (demo: DemoProjectCard) => {
    loadProject(demo.project);
    onProjectLoaded?.(demo);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Open-Data Coastal & Environmental Project Gallery"
      subtitle="10 pre-configured real-world coastal studies with inlined telemetry, erosion contours, and spatial analysis"
      size="xl"
    >
      <div className="space-y-4">
        {/* Search & Domain Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-[#181820] border border-white/6 rounded-xl">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {domains.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedDomain === d.id
                    ? 'bg-[#22222c] text-[#e3b450] border border-[#e3b450]/30 shadow-sm'
                    : 'text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5 border border-transparent'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-56">
            <Search size={13} className="absolute left-3 top-2.5 text-[#9d9da8]" />
            <input
              type="text"
              placeholder="Search 10 demo projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-full pl-8 pr-3 py-1.5 outline-none focus:border-[#e3b450] placeholder-[#656573]"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {filteredProjects.map((demo) => (
            <div
              key={demo.id}
              className="p-4 rounded-xl bg-[#181820] border border-white/6 hover:border-[#e3b450]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg"
              data-testid={`demo-project-card-${demo.id}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#e3b450] font-mono font-semibold">
                    <Compass size={13} />
                    <span>{demo.domain}</span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-[#9d9da8] font-mono">
                    <MapPin size={11} className="text-[#f47fa3]" />
                    {demo.location}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-[#f5f5f7] group-hover:text-[#e3b450] transition-colors mb-1.5">
                  {demo.title}
                </h4>

                <p className="text-[11px] text-[#9d9da8] leading-relaxed mb-3">
                  {demo.description}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#9d9da8]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                <span className="text-[11px] text-[#9d9da8] flex items-center gap-1">
                  <Layers size={12} className="text-[#e3b450]" />
                  {demo.project.layers.length} layers
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSelectProject(demo)}
                  icon={<ExternalLink size={12} />}
                  data-testid={`load-demo-btn-${demo.id}`}
                >
                  Load Project
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
