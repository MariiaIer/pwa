export interface NotificationObject {
  body: string;
  icon: string;
  requireInteraction: boolean;
}
export interface CounterObject {
  id: ReturnType<typeof setTimeout>,
  completed: boolean
}
