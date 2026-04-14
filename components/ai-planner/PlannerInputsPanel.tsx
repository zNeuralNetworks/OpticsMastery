import React from 'react';
import { Layers, Layout } from 'lucide-react';
import { GPU_PLATFORMS, STORAGE_PLATFORMS } from '../../data/aiSpecs';
import { ARISTA_SWITCHES } from '../../data/hardware';
import { FABRIC_PROFILES } from '../../data/fabricProfiles';
import { PlannerInputs, PlannerModel } from '../../features/ai-planner/types';
import { MediaPreferenceOption } from '../../services/mediaAdvisor';

interface PlannerInputsPanelProps {
  inputs: PlannerInputs;
  model: PlannerModel;
  updateInput: <K extends keyof PlannerInputs>(key: K, value: PlannerInputs[K]) => void;
}

export const PlannerInputsPanel: React.FC<PlannerInputsPanelProps> = ({ inputs, model, updateInput }) => {
  const leafSwitches = ARISTA_SWITCHES.filter((item) => item.role === 'LEAF');
  const spineSwitches = ARISTA_SWITCHES.filter((item) => item.role === 'SPINE');
  const selectedFabricProfile = FABRIC_PROFILES.find((item) => item.id === inputs.fabricProfileId) ?? FABRIC_PROFILES[0];
  const mediaPreferenceLabels: Record<MediaPreferenceOption, string> = {
    AUTO: 'Auto-select media',
    PREFER_DAC: 'Prefer passive copper',
    PREFER_AOC: 'Prefer direct-attach optics',
    PREFER_FIBER: 'Prefer structured fiber',
  };

  return (
    <div className="space-y-6">
      <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-6 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Planner Inputs
        </h2>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">GPU Platform</label>
              <select
                value={inputs.selectedGpuId}
                onChange={(event) => updateInput('selectedGpuId', event.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {GPU_PLATFORMS.map((platform) => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Scope</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'COMPUTE_FABRIC', label: 'Compute Fabric' },
                  { value: 'COMPUTE_AND_STORAGE', label: 'Compute + Storage' },
                ] as const).map((scope) => (
                  <button
                    key={scope.value}
                    onClick={() => updateInput('scope', scope.value)}
                    className={`py-3 rounded-lg border text-xs font-bold transition-all ${inputs.scope === scope.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                  >
                    {scope.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Fabric Profile</label>
            <select
              value={inputs.fabricProfileId}
              onChange={(event) => updateInput('fabricProfileId', event.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {FABRIC_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.label}</option>
              ))}
            </select>
            <p className="mt-2 text-[11px] text-gray-500 leading-relaxed">{selectedFabricProfile?.description}</p>
            {!selectedFabricProfile?.allowCustomOverride && (
              <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
                <div className="text-[10px] font-black uppercase tracking-widest text-blue-700">Auto spine selection</div>
                <div className="mt-1 text-xs font-bold text-slate-900">{model.spineSwitch.name}</div>
                <div className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Auto-picked from the modular spine pool based on projected leaf count, future scale, and a near-nonblocking AI fabric posture.
                </div>
              </div>
            )}
          </div>

          {selectedFabricProfile?.allowCustomOverride && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Compute Leaf Profile</label>
                <select
                  value={inputs.customLeafSku ?? ''}
                  onChange={(event) => updateInput('customLeafSku', event.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {leafSwitches.map((switchProfile) => (
                    <option key={switchProfile.sku} value={switchProfile.sku}>{switchProfile.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Spine Profile</label>
                <select
                  value={inputs.customSpineSku ?? ''}
                  onChange={(event) => updateInput('customSpineSku', event.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {spineSwitches.map((switchProfile) => (
                    <option key={switchProfile.sku} value={switchProfile.sku}>{switchProfile.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Total GPU Count</label>
              <input
                type="number"
                value={inputs.gpuCount}
                onChange={(event) => updateInput('gpuCount', Math.max(model.gpuPlatform.defaultGpusPerNode, parseInt(event.target.value, 10) || model.gpuPlatform.defaultGpusPerNode))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">18-Month GPU Target</label>
              <input
                type="number"
                value={inputs.targetGpuCount}
                onChange={(event) => updateInput('targetGpuCount', Math.max(inputs.gpuCount, parseInt(event.target.value, 10) || inputs.gpuCount))}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Oversubscription Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 4].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => updateInput('oversubscription', ratio)}
                    className={`py-3 rounded-lg border text-xs font-bold transition-all ${inputs.oversubscription === ratio ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    {ratio}:1
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Media Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {(['AUTO', 'PREFER_DAC', 'PREFER_AOC', 'PREFER_FIBER'] as MediaPreferenceOption[]).map((preference) => (
                  <button
                    key={preference}
                    onClick={() => updateInput('mediaPreference', preference)}
                    className={`py-3 rounded-lg border text-[10px] font-bold transition-all ${inputs.mediaPreference === preference ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                  >
                    {mediaPreferenceLabels[preference]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Fabric Evaluation Mode</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-slate-700">
                AI Training Cluster
                <div className="mt-1 text-[10px] font-medium text-slate-500">
                  AllReduce-heavy RoCEv2 evaluation profile with 1.1:1 fabric target.
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Routing Preference</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: 'EBGP_UNNUMBERED', label: 'eBGP unnumbered' },
                  { value: 'EBGP_NUMBERED', label: 'eBGP numbered' },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateInput('routingPreference', option.value)}
                    className={`py-3 rounded-lg border text-[10px] font-bold transition-all ${inputs.routingPreference === option.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Topology / Failure-Domain Posture</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'SINGLE_PLANE', label: 'Single plane', copy: 'Simpler 2-tier posture, local leaf failure domains.' },
                { value: 'RAIL_OPTIMIZED', label: 'Rail optimized', copy: 'Use rail-aware 2-tier reasoning when host and cabling design support it.' },
              ] as const).map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => updateInput('railMode', mode.value)}
                  className={`rounded-lg border p-3 text-left transition-all ${inputs.railMode === mode.value ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                >
                  <div className={`text-xs font-bold ${inputs.railMode === mode.value ? 'text-blue-700' : 'text-slate-700'}`}>{mode.label}</div>
                  <div className="mt-1 text-[10px] text-slate-500 leading-relaxed">{mode.copy}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Representative Inter-Rack Distance ({inputs.distanceMeters}m)</label>
            <input
              type="range"
              min="1"
              max="500"
              value={inputs.distanceMeters}
              onChange={(event) => updateInput('distanceMeters', parseInt(event.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {inputs.scope === 'COMPUTE_AND_STORAGE' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Storage Platform</label>
              <select
                value={inputs.selectedStorageId ?? 'WEKA'}
                onChange={(event) => updateInput('selectedStorageId', event.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {Object.values(STORAGE_PLATFORMS).map((platform) => (
                  <option key={platform.id} value={platform.id}>{platform.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Platform Assumptions
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
            <span className="text-slate-500">Topology Style</span>
            <span className="font-bold text-slate-900">{model.gpuPlatform.supportedFabricTopology.replace(/-/g, ' ')}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
            <span className="text-slate-500">Breakout Profile</span>
            <span className="font-bold text-slate-900">{model.gpuPlatform.breakoutProfile.replace(/-/g, ' ')}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
            <span className="text-slate-500">Recommended Rails</span>
            <span className="font-bold text-slate-900">{model.gpuPlatform.recommendedRailCount}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
            <span className="text-slate-500">Evaluation Oversub Target</span>
            <span className="font-bold text-slate-900">{inputs.maxOversubscriptionTarget}:1</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-lg border border-slate-100">
            <span className="text-slate-500">Storage Attachment</span>
            <span className="font-bold text-slate-900">{model.gpuPlatform.storageAttachmentModel.replace(/-/g, ' ')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
