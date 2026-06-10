export type LogEvent = {
  type: string;
  severity: string;
  status?: string;
  message: string;
  source: string;
  time: string;
  item?: string;
  itemId?: string;
  relatedId?: string;
};
