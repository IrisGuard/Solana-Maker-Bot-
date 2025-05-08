// Simple shim for AsyncStorage in web
const AsyncStorageShim = {
  getItem: function(key) {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  setItem: function(key, value) {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  removeItem: function(key) {
    try {
      localStorage.removeItem(key);
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  clear: function() {
    try {
      localStorage.clear();
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  getAllKeys: function() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return Promise.resolve(keys);
    } catch (e) {
      return Promise.resolve([]);
    }
  },
  multiGet: function(keys) {
    try {
      const result = keys.map(key => [key, localStorage.getItem(key)]);
      return Promise.resolve(result);
    } catch (e) {
      return Promise.resolve([]);
    }
  },
  multiSet: function(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  },
  multiRemove: function(keys) {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      return Promise.resolve(true);
    } catch (e) {
      return Promise.reject(e);
    }
  }
};

export default AsyncStorageShim; 