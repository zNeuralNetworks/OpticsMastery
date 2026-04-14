
import { InterfaceDef } from '../types';

export const INTERFACES: InterfaceDef[] = [
  // 800G (Dual 400G Engines)
  { id: '800G-2FR4', sku: 'OSFP-800G-2FR4', name: '2x400GBASE-FR4', media: 'SMF', wavelength: 'CWDM', connector: 'Dual LC', polish: 'UPC', modulation: 'PAM4', lanes: 8, speedPerLane: 100, formFactor: 'OSFP' },
  { id: '800G-2DR4', sku: 'OSFP-800G-2DR4', name: '2x400GBASE-DR4', media: 'SMF', wavelength: '1310nm', connector: 'Dual MPO-12', polish: 'APC', modulation: 'PAM4', lanes: 8, speedPerLane: 100, formFactor: 'OSFP' },
  
  // 400G SMF
  { id: '400G-DR4', sku: 'OSFP-400G-DR4', name: '400GBASE-DR4', media: 'SMF', wavelength: '1310nm', connector: 'MPO-12', polish: 'APC', modulation: 'PAM4', lanes: 4, speedPerLane: 100, formFactor: 'OSFP' },
  { id: '400G-FR4', sku: 'OSFP-400G-FR4', name: '400GBASE-FR4', media: 'SMF', wavelength: 'CWDM', connector: 'LC', polish: 'UPC', modulation: 'PAM4', lanes: 4, speedPerLane: 100, formFactor: 'OSFP' },
  
  // 100G SMF (Modern PAM4)
  { id: '100G-DR', sku: 'QSFP-100G-DR', name: '100GBASE-DR', media: 'SMF', wavelength: '1310nm', connector: 'LC', polish: 'UPC', modulation: 'PAM4', lanes: 1, speedPerLane: 100, formFactor: 'QSFP28' },
  
  // 100G SMF (Legacy NRZ)
  { id: '100G-LR4', sku: 'QSFP-100G-LR4', name: '100GBASE-LR4', media: 'SMF', wavelength: 'LAN-WDM', connector: 'LC', polish: 'UPC', modulation: 'NRZ', lanes: 4, speedPerLane: 25, formFactor: 'QSFP28' },
  { id: '100G-PSM4', sku: 'QSFP-100G-PSM4', name: '100GBASE-PSM4', media: 'SMF', wavelength: '1310nm', connector: 'MPO-12', polish: 'APC', modulation: 'NRZ', lanes: 4, speedPerLane: 25, formFactor: 'QSFP28' },
  
  // 100G MMF
  { id: '100G-SR4', sku: 'QSFP-100G-SR4', name: '100GBASE-SR4', media: 'MMF', wavelength: '850nm', connector: 'MPO-12', polish: 'UPC', modulation: 'NRZ', lanes: 4, speedPerLane: 25, formFactor: 'QSFP28' },
];
