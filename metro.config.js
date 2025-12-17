const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const { resolver: { sourceExts, assetExts } } = defaultConfig;

const config = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...sourceExts, 'cjs'],
    extraNodeModules: {
      ...defaultConfig.resolver.extraNodeModules,
      buffer: require.resolve('buffer/'),
      stream: require.resolve('stream-browserify'),
    },
    nodeModulesPaths: [__dirname + '/node_modules'],
  },
  watchFolders: [__dirname],
  server: {
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        if (req.url.endsWith('.map')) {
          res.status(404).end();
          return;
        }
        return middleware(req, res, next);
      };
    },
  },
};

module.exports = config;
