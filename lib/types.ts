export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  photo: string | null; // base64 data URL
  enabled: boolean;
}
