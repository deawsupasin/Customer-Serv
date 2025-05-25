const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getCustomers: (searchTerm) => ipcRenderer.invoke('getCustomers', searchTerm),
  getCustomer: (id) => ipcRenderer.invoke('getCustomer', id),
  saveCustomer: (data) => ipcRenderer.invoke('saveCustomer', data),
  deleteCustomer: (id) => ipcRenderer.invoke('deleteCustomer', id)
});