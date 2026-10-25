import React from 'react';
import { Modal } from './Modal';
import { Pill } from './Pill';
import { Button } from './Button';
import { ForgePlugin, PluginManager } from '@forgegis/core';
import { Blocks, CheckCircle2, ShieldCheck, Sparkles, Power } from 'lucide-react';

export interface PluginManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pluginManager: PluginManager;
  onTogglePlugin?: (pluginId: string, enabled: boolean) => void;
}

export const PluginManagerModal: React.FC<PluginManagerModalProps> = ({
  isOpen,
  onClose,
  pluginManager,
  onTogglePlugin,
}) => {
  const plugins = pluginManager.getRegisteredPlugins();

  const handleToggle = async (plugin: ForgePlugin) => {
    const isCurrentlyEnabled = pluginManager.isPluginEnabled(plugin.manifest.id);
    if (isCurrentlyEnabled) {
      pluginManager.disablePlugin(plugin.manifest.id);
      onTogglePlugin?.(plugin.manifest.id, false);
    } else {
      await pluginManager.enablePlugin(plugin.manifest.id);
      onTogglePlugin?.(plugin.manifest.id, true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plugin Ecosystem & Extensions"
      subtitle="Extend ForgeGIS with modular sandboxed capabilities, temporal analysis, and planetary basemaps"
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#181820] border border-white/6 text-xs">
          <div className="flex items-center gap-2">
            <Blocks size={16} className="text-[#e3b450]" />
            <span className="font-semibold text-[#f5f5f7]">Capability Sandboxing</span>
          </div>
          <div className="flex items-center gap-2 text-[#9d9da8]">
            <ShieldCheck size={14} className="text-[#34d399]" />
            <span>Strict Permission Boundary</span>
          </div>
        </div>

        {/* Plugin Cards List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {plugins.map((plugin) => {
            const isEnabled = pluginManager.isPluginEnabled(plugin.manifest.id);

            return (
              <div
                key={plugin.manifest.id}
                className={`p-4 rounded-xl border transition-all ${
                  isEnabled
                    ? 'bg-[#181820] border-[#e3b450]/30 shadow-md'
                    : 'bg-[#121217] border-white/6 opacity-85'
                }`}
                data-testid={`plugin-card-${plugin.manifest.id}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#f5f5f7]">
                        {plugin.manifest.name}
                      </h4>
                      <Pill label={`v${plugin.manifest.version}`} variant="gold" />
                      <span className="text-[10px] text-[#9d9da8] font-mono">
                        by {plugin.manifest.author}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9d9da8] leading-relaxed">
                      {plugin.manifest.description}
                    </p>
                  </div>

                  {/* Toggle Button */}
                  <Button
                    variant={isEnabled ? 'primary' : 'glass'}
                    size="sm"
                    onClick={() => handleToggle(plugin)}
                    icon={<Power size={13} />}
                    data-testid={`plugin-toggle-${plugin.manifest.id}`}
                  >
                    {isEnabled ? 'Enabled' : 'Enable'}
                  </Button>
                </div>

                {/* Permissions Badges */}
                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] uppercase font-mono text-[#656573] mr-1">
                      Permissions:
                    </span>
                    {plugin.manifest.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-[#9d9da8] border border-white/5"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px]">
                    {isEnabled ? (
                      <span className="flex items-center gap-1 text-[#34d399] font-medium font-mono text-[10px]">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="text-[#656573] font-mono text-[10px]">Inactive</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
