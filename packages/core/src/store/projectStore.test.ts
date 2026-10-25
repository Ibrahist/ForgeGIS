import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore, INITIAL_PROJECT } from './projectStore';
import { ForgeLayer } from '../types/layers';

describe('projectStore', () => {
  beforeEach(() => {
    useProjectStore.getState().loadProject({
      ...INITIAL_PROJECT,
      layers: [],
    });
  });

  const mockLayer: ForgeLayer = {
    id: 'layer_mock_1',
    name: 'Coastal Wetlands',
    sourceType: 'geojson',
    visible: true,
    opacity: 0.8,
    zIndex: 1,
    fields: [{ name: 'area_ha', type: 'number' }],
    featureCount: 12,
    style: {
      color: '#34d399',
      opacity: 0.8,
    },
  };

  it('adds and selects a layer', () => {
    const store = useProjectStore.getState();
    store.addLayer(mockLayer);

    const updated = useProjectStore.getState();
    expect(updated.project.layers.length).toBe(1);
    expect(updated.project.layers[0].name).toBe('Coastal Wetlands');
    expect(updated.selectedLayerId).toBe('layer_mock_1');
  });

  it('toggles visibility and modifies opacity', () => {
    const store = useProjectStore.getState();
    store.addLayer(mockLayer);

    store.toggleLayerVisibility('layer_mock_1');
    expect(useProjectStore.getState().project.layers[0].visible).toBe(false);

    store.setLayerOpacity('layer_mock_1', 0.45);
    expect(useProjectStore.getState().project.layers[0].opacity).toBe(0.45);
  });

  it('renames and removes layer', () => {
    const store = useProjectStore.getState();
    store.addLayer(mockLayer);

    store.renameLayer('layer_mock_1', 'Protected Mangroves');
    expect(useProjectStore.getState().project.layers[0].name).toBe('Protected Mangroves');

    store.removeLayer('layer_mock_1');
    expect(useProjectStore.getState().project.layers.length).toBe(0);
    expect(useProjectStore.getState().selectedLayerId).toBeNull();
  });

  it('reorders layers correctly', () => {
    const store = useProjectStore.getState();
    store.addLayer({ ...mockLayer, id: 'l1', name: 'Layer 1' });
    store.addLayer({ ...mockLayer, id: 'l2', name: 'Layer 2' }); // Added to index 0

    expect(useProjectStore.getState().project.layers[0].id).toBe('l2');
    expect(useProjectStore.getState().project.layers[1].id).toBe('l1');

    store.reorderLayers(0, 1);
    expect(useProjectStore.getState().project.layers[0].id).toBe('l1');
    expect(useProjectStore.getState().project.layers[1].id).toBe('l2');
  });
});
