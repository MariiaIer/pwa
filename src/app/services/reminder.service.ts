import { Injectable } from '@angular/core';
import { NotificationObject } from '../types/notification';

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
  private notificationTimerArray = [] as (number | ReturnType<typeof setTimeout> | undefined)[]; // keep here timers for clear timeOuts
  private notificationsSet = new Set(); // to track Notification by index
  private getRandomIcon(): string {
    const randomIndex = Math.floor(Math.random() * this.icons.length);
    return this.icons[randomIndex];
  }

  private clearNotificationTimer(index: number): void {
    clearTimeout(this.notificationTimerArray[index]);
  }

  private showNotification(object: NotificationObject): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Exercise Reminder',
        object
      );
    }
  }

  public setReminder(time: string, message: string, index: number): void {
    if (!this.notificationsSet.has(index)) { // if not yet added
      const delay = new Date(time).getTime() - new Date().getTime();
      const randomIcon = this.getRandomIcon();
      const notificationObject: NotificationObject = {
        body: message,
        icon: randomIcon,
        requireInteraction: true
      }
      this.notificationsSet.add(index);
      this.notificationTimerArray.push(
        setTimeout(() => {
          this.showNotification(notificationObject);
        }, delay)
      );
    }
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

}
