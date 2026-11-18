const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api',{
 list:()=>ipcRenderer.invoke('projects:list'), getProject:id=>ipcRenderer.invoke('projects:get',id),
 save:p=>ipcRenderer.invoke('projects:save',p), remove:id=>ipcRenderer.invoke('projects:delete',id),
 addFollowup:v=>ipcRenderer.invoke('followups:add',v),
 addPayment:v=>ipcRenderer.invoke('payments:add',v), updatePayment:v=>ipcRenderer.invoke('payments:update',v), deletePayment:id=>ipcRenderer.invoke('payments:delete',id), listPayments:id=>ipcRenderer.invoke('payments:list',id),
 backup:()=>ipcRenderer.invoke('backup:create'), restore:()=>ipcRenderer.invoke('backup:restore'),
 exportExcel:()=>ipcRenderer.invoke('excel:export'), importExcel:()=>ipcRenderer.invoke('excel:import'),
 info:()=>ipcRenderer.invoke('app:info'), getSettings:()=>ipcRenderer.invoke('settings:get'), saveSettings:v=>ipcRenderer.invoke('settings:save',v)
});
