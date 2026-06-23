export interface Alarm {
  id: string;
  hour: number;
  minute: number;
  label: string;
  photoUri: string | null;
  enabled: boolean;
  notificationId: string | null;
}
