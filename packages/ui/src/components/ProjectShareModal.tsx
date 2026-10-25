import React, { useState, useRef } from 'react';
import {
  useProjectStore,
  serializeProject,
  deserializeProject,
  generateStandaloneHtml,
  generateEmbedCode,
} from '@forgegis/core';
import { Modal } from './Modal';
import { Tabs, TabItem } from './Tabs';
import { Button } from './Button';
import { Pill } from './Pill';
import {
  Download,
  Upload,
  FileCode,
  Globe,
  Code2,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  FileJson,
  Layers,
  Database,
} from 'lucide-react';

export interface ProjectShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'project' | 'html' | 'embed';
}

export const ProjectShareModal: React.FC<ProjectShareModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'project',
}) => {
  const { project, loadProject, updateProjectMetadata } = useProjectStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [inlineData, setInlineData] = useState<boolean>(true);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);
  const [embedWidth, setEmbedWidth] = useState<string>('100%');
  const [embedHeight, setEmbedHeight] = useState<string>('500px');
  const [embedBorder, setEmbedBorder] = useState<boolean>(true);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs: TabItem[] = [
    { id: 'project', label: 'Project File (.project.json)', icon: <FileJson size={14} /> },
    { id: 'html', label: 'Standalone HTML', icon: <Globe size={14} /> },
    { id: 'embed', label: 'Iframe Embed & API', icon: <Code2 size={14} /> },
  ];

  // 1. Export Project File (.project.json)
  const handleDownloadProject = () => {
    try {
      const jsonString = serializeProject(project, inlineData);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'forgegis-project'}.project.json`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setFeedbackMessage({
        text: `Exported "${filename}" successfully!`,
        type: 'success',
      });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to export project',
        type: 'error',
      });
    }
  };

  // 2. Import Project File (.project.json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const loadedProject = deserializeProject(content);
        loadProject(loadedProject);
        setFeedbackMessage({
          text: `Successfully loaded project "${loadedProject.title}" with ${loadedProject.layers.length} layers!`,
          type: 'success',
        });
      } catch (err: unknown) {
        setFeedbackMessage({
          text: err instanceof Error ? err.message : 'Invalid project JSON format',
          type: 'error',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 3. Export Standalone HTML
  const handleDownloadHtml = () => {
    try {
      const htmlContent = generateStandaloneHtml(project);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `forgegis-report-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'report'}.html`;
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setFeedbackMessage({
        text: `Generated standalone HTML report "${filename}"! Ready for zero-server offline sharing.`,
        type: 'success',
      });
    } catch (err: unknown) {
      setFeedbackMessage({
        text: err instanceof Error ? err.message : 'Failed to generate HTML report',
        type: 'error',
      });
    }
  };

  // 4. Generate Embed Code
  const currentAppUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://forgegis.org';
  const embedSnippet = generateEmbedCode({
    url: currentAppUrl,
    width: embedWidth,
    height: embedHeight,
    border: embedBorder,
  });

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Sharing & Exporters"
      subtitle="Save project files, export zero-server offline HTML reports, or embed with live postMessage API"
      size="lg"
    >
      <div className="space-y-4">
        {feedbackMessage && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-[#34d399]/10 border-[#34d399]/30 text-[#34d399]'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle size={15} className="flex-shrink-0" />
            ) : (
              <AlertCircle size={15} className="flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {/* Tab 1: Project JSON */}
        {activeTab === 'project' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#181820] border border-white/6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#f5f5f7]">Project Metadata</h4>
                  <p className="text-[11px] text-[#9d9da8]">
                    Specification v1.0.0 conformant portable state
                  </p>
                </div>
                <Pill label="Schema v1.0.0" variant="gold" />
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-[#9d9da8] block mb-1">Project Title</label>
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProjectMetadata({ title: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-xl px-3 py-2 outline-none focus:border-[#e3b450]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#9d9da8] block mb-1">Description</label>
                  <input
                    type="text"
                    value={project.description || ''}
                    placeholder="Brief description of coastal, marine or urban study..."
                    onChange={(e) => updateProjectMetadata({ description: e.target.value })}
                    className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-xl px-3 py-2 outline-none focus:border-[#e3b450] placeholder-[#656573]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#9d9da8] pt-2 border-t border-white/5">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-[#e3b450]" />
                  <span>{project.layers.length} Layers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Database size={13} className="text-[#38bdf8]" />
                  <span>{project.sqlWorkspace?.queries?.length || 0} Saved Queries</span>
                </div>
              </div>
            </div>

            {/* Inline Data Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-white/6">
              <div>
                <span className="text-xs font-medium text-[#f5f5f7] block">Inline GeoJSON Data</span>
                <span className="text-[11px] text-[#9d9da8]">
                  Embed feature collections directly in the JSON file for 100% self-contained offline portability
                </span>
              </div>
              <input
                type="checkbox"
                checked={inlineData}
                onChange={(e) => setInlineData(e.target.checked)}
                className="w-4 h-4 accent-[#e3b450] cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload size={14} />}
              >
                Upload / Open .project.json
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadProject}
                icon={<Download size={14} />}
              >
                Download .project.json
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Standalone HTML */}
        {activeTab === 'html' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#181820] border border-white/6 space-y-3">
              <div className="flex items-center gap-2.5">
                <FileCode size={18} className="text-[#e3b450]" />
                <div>
                  <h4 className="text-xs font-semibold text-[#f5f5f7]">
                    Self-Contained Interactive Report
                  </h4>
                  <p className="text-[11px] text-[#9d9da8]">
                    Generates a single offline HTML file that works without any web server or database
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#9d9da8] pt-2">
                <div className="p-2.5 rounded-lg bg-white/4 border border-white/4">
                  <span className="text-[#f5f5f7] font-semibold block mb-0.5">Offline-Ready</span>
                  Inlines all GeoJSON datasets, view camera, styling rules, and legend.
                </div>
                <div className="p-2.5 rounded-lg bg-white/4 border border-white/4">
                  <span className="text-[#f5f5f7] font-semibold block mb-0.5">VoiceStudio Theme</span>
                  Clean dark aesthetic, blur backdrops, pill badges, and attribute popups.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadHtml}
                icon={<Download size={15} />}
              >
                Download Standalone HTML Report
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Embed & postMessage API */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#181820] border border-white/6 space-y-3">
              <h4 className="text-xs font-semibold text-[#f5f5f7]">Iframe Dimensions</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#9d9da8] block mb-1">Width</label>
                  <input
                    type="text"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none focus:border-[#e3b450]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#9d9da8] block mb-1">Height</label>
                  <input
                    type="text"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-white/10 text-xs text-[#f5f5f7] rounded-lg p-2 outline-none focus:border-[#e3b450]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={embedBorder}
                    onChange={(e) => setEmbedBorder(e.target.checked)}
                    id="border-check"
                    className="w-4 h-4 accent-[#e3b450] cursor-pointer"
                  />
                  <label htmlFor="border-check" className="text-xs text-[#9d9da8] cursor-pointer">
                    VoiceStudio Border
                  </label>
                </div>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="p-4 rounded-xl bg-[#0a0a0c] border border-white/10 font-mono text-[11px] text-[#34d399] overflow-x-auto leading-relaxed">
                {embedSnippet}
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#181820] hover:bg-[#22222c] border border-white/10 text-xs text-[#f5f5f7] flex items-center gap-1.5 transition-colors"
              >
                {copiedEmbed ? <Check size={13} className="text-[#34d399]" /> : <Copy size={13} />}
                <span>{copiedEmbed ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            {/* PostMessage API Reference */}
            <div className="p-3.5 rounded-xl bg-[#181820] border border-white/6 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e3b450]">PostMessage Protocol Supported</span>
                <span className="text-[10px] text-[#9d9da8] font-mono">window.postMessage(...)</span>
              </div>
              <p className="text-[11px] text-[#9d9da8] leading-relaxed">
                Embedded iframes listen for <code className="text-[#f5f5f7] bg-white/5 px-1 py-0.5 rounded">FORGEGIS_SET_LAYER</code>,{' '}
                <code className="text-[#f5f5f7] bg-white/5 px-1 py-0.5 rounded">FORGEGIS_FLY_TO</code>, and{' '}
                <code className="text-[#f5f5f7] bg-white/5 px-1 py-0.5 rounded">FORGEGIS_EXECUTE_SQL</code> commands, and post back responses automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
