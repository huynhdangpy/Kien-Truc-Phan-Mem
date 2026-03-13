export class PluginManager {
  constructor() {
    this.plugins = [];
  }

  register(plugin) {
    if (!plugin?.name || typeof plugin.register !== "function") {
      throw new Error(
        "Invalid plugin: each plugin must expose name and register(app, context)",
      );
    }

    this.plugins.push(plugin);
  }

  initialize(app, context) {
    this.plugins.forEach((plugin) => {
      plugin.register(app, context);
      console.log(`[PluginManager] Loaded plugin: ${plugin.name}`);
    });
  }

  list() {
    return this.plugins.map((plugin) => plugin.name);
  }
}
