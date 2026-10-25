import { describe, it, expect } from 'vitest';
import { DEMO_PROJECTS_GALLERY } from './demoProjects';
import { validateProject, serializeProject, deserializeProject } from '../project/projectSchema';

describe('Coastal Demo Projects Gallery', () => {
  it('contains 10 curated open-data coastal & marine projects', () => {
    expect(DEMO_PROJECTS_GALLERY).toHaveLength(10);
  });

  it('ensures each demo project has valid metadata and tags', () => {
    for (const demo of DEMO_PROJECTS_GALLERY) {
      expect(demo.id).toBeTruthy();
      expect(demo.title).toBeTruthy();
      expect(demo.domain).toBeTruthy();
      expect(demo.location).toBeTruthy();
      expect(demo.description).toBeTruthy();
      expect(Array.isArray(demo.tags)).toBe(true);
      expect(demo.tags.length).toBeGreaterThan(0);
      expect(demo.project).toBeDefined();
    }
  });

  it('validates all 10 demo projects against the ForgeGIS Schema v1.0.0', () => {
    for (const demo of DEMO_PROJECTS_GALLERY) {
      const validation = validateProject(demo.project);
      expect(validation.valid, `Project ${demo.id} failed schema validation: ${validation.errors.join(', ')}`).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }
  });

  it('confirms every demo project has coordinates and layers configured', () => {
    for (const demo of DEMO_PROJECTS_GALLERY) {
      const { view, layers } = demo.project;
      expect(typeof view.longitude).toBe('number');
      expect(typeof view.latitude).toBe('number');
      expect(view.zoom).toBeGreaterThan(0);
      expect(layers.length).toBeGreaterThan(0);
      for (const layer of layers) {
        expect(layer.id).toBeTruthy();
        expect(layer.name).toBeTruthy();
        expect(layer.style).toBeDefined();
      }
    }
  });

  it('supports lossless JSON serialization and deserialization for all demo projects', () => {
    for (const demo of DEMO_PROJECTS_GALLERY) {
      const json = serializeProject(demo.project);
      const deserialized = deserializeProject(json);
      expect(deserialized.id).toBe(demo.project.id);
      expect(deserialized.title).toBe(demo.project.title);
      expect(deserialized.layers.length).toBe(demo.project.layers.length);
    }
  });

  it('covers diverse coastal and marine focus domains', () => {
    const domains = new Set(DEMO_PROJECTS_GALLERY.map((d) => d.domain));
    expect(domains.has('Coastal Monitoring')).toBe(true);
    expect(domains.has('Marine Biology')).toBe(true);
    expect(domains.has('Disaster Management')).toBe(true);
    expect(domains.has('Marine Ecology')).toBe(true);
    expect(domains.has('Clean Energy')).toBe(true);
    expect(domains.has('Urban Resilience')).toBe(true);
  });
});
