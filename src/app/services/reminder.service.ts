import {Injectable, signal} from '@angular/core';
import {CounterObject, NotificationObject} from '../types/notification';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private icons = [
    'assets/icons/2_m.jpg',
    'assets/icons/4_m.jpg',
    'assets/icons/5_m.jpg',
    'assets/icons/6_m.jpg',
    'assets/icons/7_m.jpg',
    'assets/icons/8_m.jpg',
    'assets/icons/9_m.jpg',
    'assets/icons/10_m.jpg',
    'assets/icons/11_m.jpg',
    'assets/icons/12_m.jpg',
    'assets/icons/13_m.jpg',
    'assets/icons/15_m.jpg',
    'assets/icons/16_m.jpg',
    'assets/icons/18_m.jpg',
    'assets/icons/20_m.jpg',
    'assets/icons/22_m.jpg',
    'assets/icons/27_m.jpg',
    'assets/icons/30_m.jpg',
  ];
  private notificationTimerArray: CounterObject[] = []; // keep here timers' references to clear timeOuts
  private notificationsSet: Set<number> = new Set<number>(); // to track Notification by index
  public acceptNewTasksSignal = signal<boolean>(true);


  private getRandomIcon(): string {
    const randomIndex = Math.floor(Math.random() * this.icons.length);
    return this.icons[randomIndex];
  }


  public getNotificationTimerArray(): CounterObject[] {
    return this.notificationTimerArray;
  }


  private clearNotificationTimer(index: number): void {
    const timerIndex = this.notificationTimerArray.findIndex((_, i) => i === index);
    if (timerIndex !== -1) {
      clearTimeout(this.notificationTimerArray[timerIndex].id);
      this.notificationTimerArray.splice(timerIndex, 1);
      this.notificationsSet.delete(index);
    }
  }


  private showNotification(object: NotificationObject): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Exercise Reminder',
        object
      );
    }
  }


  public setReminder(time: string, message: string, index: number, resolve: Function): void {
    if (!this.notificationsSet.has(index)) { // if not yet added
      const delay = new Date(time).getTime() - new Date().getTime();
      const randomIcon = this.getRandomIcon();
      const notificationObject: NotificationObject = {
        body: message,
        icon: randomIcon,
        requireInteraction: true
      }
      this.notificationsSet.add(index);
      const timer = this.createMainTimer(notificationObject, delay);
      this.notificationTimerArray.push({ id: timer, completed: false });
      resolve();
    } else {
      throw new Error(`Reminder with index ${index} already exists.`);
    }
  }


  private createMainTimer(notificationObject: NotificationObject, delay: number): ReturnType<typeof setTimeout> {
    const timer = setTimeout(() => {
      this.showNotification(notificationObject);

      // Mark this timer as completed
      const timerIndex = this.notificationTimerArray.findIndex(t => t.id === timer);
      if (timerIndex !== -1) {
        this.notificationTimerArray[timerIndex].completed = true;

        // Check if all timers are completed
        if (this.notificationTimerArray.every(t => t.completed)) {
          console.log('All notifications have been shown.');
          this.onAllTimersComplete();
        }
      }
    }, delay);

    return timer;
  }


  public requestPermission(): void {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Notification permission granted.');
      } else {
        console.error('Notification permission denied.');
      }
    });
  }


  public removeNotification(index: number): void {
    this.clearNotificationTimer(index)
    this.notificationsSet.delete(index);
  }


  public disallowAcceptNewTasks(): void {
    this.acceptNewTasksSignal.set(false);
  }


  private onAllTimersComplete(): void {
    console.log('All notification timers have finished.');
    this.acceptNewTasksSignal.set(true);
  }

}
