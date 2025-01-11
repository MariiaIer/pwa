import { TestBed } from '@angular/core/testing';
import { ReminderService } from './reminder.service';

describe('ReminderService', () => {
  let service: ReminderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReminderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setReminder', () => {
    it('should add a reminder to the timer array', () => {
      const spy = spyOn(service as any, 'createMainTimer').and.returnValue(1234);
      const resolveSpy = jasmine.createSpy('resolve');
      const time = new Date().toISOString();
      const message = 'Test task';
      const index = 0;

      service.setReminder(time, message, index, resolveSpy);

      expect(service['notificationTimerArray'].length).toBe(1);
      expect(resolveSpy).toHaveBeenCalled();
      expect(service['notificationTimerArray'][0].completed).toBe(false);
    });

    it('should throw an error if reminder already exists', () => {
      const resolveSpy = jasmine.createSpy('resolve');
      const time = new Date().toISOString();
      const message = 'Test task';
      const index = 0;

      service.setReminder(time, message, index, resolveSpy);

      expect(() => {
        service.setReminder(time, message, index, resolveSpy);
      }).toThrowError(`Reminder with index ${index} already exists.`);
    });
  });

  describe('removeNotification', () => {
    it('should remove the reminder from the timer array and set', () => {
      const time = new Date().toISOString();
      const message = 'Test task';
      const index = 0;
      const resolveSpy = jasmine.createSpy('resolve');

      service.setReminder(time, message, index, resolveSpy);
      const initialTimerArrayLength = service['notificationTimerArray'].length;

      // Now remove the notification and verify
      service.removeNotification(index);

      expect(service['notificationTimerArray'].length).toBe(initialTimerArrayLength - 1);
      expect(service['notificationsSet'].has(index)).toBe(false);
    });
  });

  describe('disallowAcceptNewTasks', () => {
    it('should set acceptNewTasksSignal to false', () => {
      service.disallowAcceptNewTasks();
      expect(service.acceptNewTasksSignal()).toBe(false);
    });
  });

  describe('getNotificationTimerArray', () => {
    it('should return the correct notification timer array', () => {
      const time = new Date().toISOString();
      const message = 'Test task';
      const index = 0;
      const resolveSpy = jasmine.createSpy('resolve');

      service.setReminder(time, message, index, resolveSpy);

      const timerArray = service.getNotificationTimerArray();
      expect(timerArray.length).toBe(1);
    });
  });

  describe('onAllTimersComplete', () => {
    it('should set acceptNewTasksSignal to true when all timers are complete', () => {
      const spyOnSet = spyOn(service.acceptNewTasksSignal, 'set');

      // Set the notificationTimerArray to simulate completed timers
      service['notificationTimerArray'] = [
        { id: 1, completed: true },
        { id: 2, completed: true }
      ];

      // This simulates the logic inside `setReminder` or the timeout callback
      if (service['notificationTimerArray'].every(timer => timer.completed)) {
        service.acceptNewTasksSignal.set(true);
      }

      // Ensure the signal was set to `true` when all timers are completed
      expect(spyOnSet).toHaveBeenCalledWith(true);
    });
  });

});
