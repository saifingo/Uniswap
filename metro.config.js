const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce the number of watched files
config.watchFolders = [__dirname];
config.resolver.nodeModulesPaths = [__dirname + '/node_modules'];

// Use polling instead of file system events
config.watchFolders = [
  __dirname,
];

config.server = {
  port: 8081,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Reduce memory usage in the dev server
      if (req.url.endsWith('.map')) {
        res.status(404).end();
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
