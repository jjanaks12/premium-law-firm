import { Router } from "express";

export interface ModuleInfo {
  name: string;
  description?: string;
  resources: string[];
  actions: string[];
}

export interface RegisteredModule extends ModuleInfo {
  router: Router;
  path: string;
}

class ModuleRegistry {
  private modules: Map<string, RegisteredModule> = new Map();

  register(path: string, router: Router, info: ModuleInfo) {
    this.modules.set(info.name, {
      ...info,
      path,
      router,
    });
  }

  getModules(): ModuleInfo[] {
    return Array.from(this.modules.values()).map(({ name, description, resources, actions }) => ({
      name,
      description,
      resources,
      actions,
    }));
  }

  getAllResources(): string[] {
    const resourcesSet = new Set<string>();
    for (const mod of this.modules.values()) {
      for (const res of mod.resources) {
        resourcesSet.add(res);
      }
    }
    return Array.from(resourcesSet);
  }

  getPermissionsMap(): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const mod of this.modules.values()) {
      for (const res of mod.resources) {
        map[res] = mod.actions;
      }
    }
    return map;
  }

  getRoutes(): { path: string; router: Router }[] {
    return Array.from(this.modules.values()).map(({ path, router }) => ({
      path,
      router,
    }));
  }
}

export const moduleRegistry = new ModuleRegistry();
