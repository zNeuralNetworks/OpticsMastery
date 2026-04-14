
export interface SfpType {
  id: string;
  name: string;
  speed: string;
  modulation: 'NRZ' | 'PAM4';
  lanes: number;
  baudRate: string;
  backCompat: string;
  aristaUsage: string;
  color: string;
  description: string;
}
