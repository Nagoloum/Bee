// Metro config pour monorepo npm workspaces + Expo + NativeWind
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Surveille tout le workspace pour la réactivité hot-reload
config.watchFolders = [workspaceRoot];

// 2. npm workspaces hoist les deps à la racine : Metro doit les y chercher
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Évite les doubles instances de React quand des deps ont leur propre node_modules
config.resolver.disableHierarchicalLookup = true;

// 4. Désactive les symlinks strict (problèmes connus sur Windows + npm workspaces)
config.resolver.unstable_enableSymlinks = false;

module.exports = withNativeWind(config, { input: './global.css' });
