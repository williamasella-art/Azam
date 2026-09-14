/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: 'widget',
  name: 'AzamWidget',
  displayName: 'Azam',
  deploymentTarget: '16.0',
  entitlements: {
    'com.apple.security.application-groups': config.ios.entitlements['com.apple.security.application-groups'],
  },
  colors: {
    azamNavy: '#08223B',
    azamSky: '#0EA5E9',
    azamSkyLight: '#7DD3FC',
    azamGold: '#FFE3A3',
  },
});
