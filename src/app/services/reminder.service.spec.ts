import { TestBed } from '@angular/core/testing';
import { ReminderService } from './reminder.service';
import { NotificationObject } from '../types/notification';

describe('ReminderService', () => {
  let service: ReminderService;
  let notificationSpy: jasmine.Spy;
  let requestPermissionSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderService);

    const notificationObject: NotificationObject = {
      body: 'Test reminder message',
      icon: 'test-icon.jpg',
      requireInteraction: true
    }

    // Mock the Notification API
    notificationSpy = spyOn(window, 'Notification').and.callFake((title = 'test', options = notificationObject) => {
      return {
        title,
        ...options
      } as Notification;
    });

    // Mock the requestPermission method
    requestPermissionSpy = spyOn(Notification, 'requestPermission').and.returnValue(Promise.resolve('granted'));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request notification permission', async () => {
    service.requestPermission();
    await requestPermissionSpy.calls.mostRecent().returnValue;
    expect(requestPermissionSpy).toHaveBeenCalled();
    expect(JSON.stringify(requestPermissionSpy.calls.mostRecent().returnValue)).toEqual(JSON.stringify(Promise.resolve('granted')));
  });

  it('should set a reminder and show notification',  () => {
    const message = 'Test reminder message';
    const notificationObject = {
      body: message,
      icon: 'test-icon.jpg',
      requireInteraction: true
    }
    const testTime = new Date().getTime() + 100; // 100ms in the future
    const formattedTime = new Date(testTime).toISOString();

    spyOn(service as any, 'showNotification').and.callFake(() => { // override private method
      new Notification('Exercise Reminder',
        notificationObject
      );
    });
    spyOn(service as any, 'getRandomIcon').and.returnValue('test-icon.jpg');
    service.setReminder(formattedTime, message, 0);

    setTimeout(() => {
      expect(notificationSpy).toHaveBeenCalledWith('Exercise Reminder', notificationObject as NotificationOptions);
    }, 150); // wait a little longer than the reminder time
  });

  it('should prevent duplicate reminders for the same index', () => {
    const testTime = new Date().getTime() + 1000;
    const formattedTime = new Date(testTime).toISOString();
    const message = 'Test reminder message';

    service.setReminder(formattedTime, message, 1);
    service.setReminder(formattedTime, message, 1); // trying to set the same reminder again

    expect((service as any).notificationsSet.size).toBe(1); // should only be added once
  });

  it('should remove a notification and clear the timer', () => {
    const testTime = new Date().getTime() + 1000;
    const formattedTime = new Date(testTime).toISOString();
    const message = 'Test reminder message';

    service.setReminder(formattedTime, message, 2);
    service.removeNotification(2);

    expect((service as any).notificationsSet.has(2)).toBe(false);
  });

  it('should clear timer when removing a notification', () => {
    const testTime = new Date().getTime() + 1000;
    const formattedTime = new Date(testTime).toISOString();
    const message = 'Test reminder message';

    service.setReminder(formattedTime, message, 3);
    const clearTimeoutSpy = spyOn(window, 'clearTimeout');

    service.removeNotification(3);

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect((service as any).notificationsSet.has(3)).toBe(false);
  });

});
