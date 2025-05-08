// Mock implementation for @expo/next-adapter/babel
module.exports = {
  preset: 'babel-preset-expo',
  plugins: [],
  withExpo: function() {
    return {
      plugins: []
    };
  }
}; 