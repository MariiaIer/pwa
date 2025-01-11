import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AppComponent } from './app.component';
import { ReminderService } from './services/reminder.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let reminderServiceSpy: jasmine.SpyObj<ReminderService>;

  beforeEach(async () => {
    const reminderSpy = jasmine.createSpyObj('ReminderService', [
      'setReminder',
      'removeNotification',
      'requestPermission',
      'getNotificationTimerArray',
      'acceptNewTasksSignal'
    ]);

    // Mocking service methods
    reminderSpy.getNotificationTimerArray.and.returnValue([]); // Mocking getNotificationTimerArray response
    reminderSpy.acceptNewTasksSignal.and.returnValue(true); // Mocking a return value for the signal

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [AppComponent],
      providers: [
        FormBuilder,
        { provide: ReminderService, useValue: reminderSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    reminderServiceSpy = TestBed.inject(ReminderService)  as jasmine.SpyObj<ReminderService>;
    fixture.detectChanges();
    await fixture.whenStable();  // Wait for async tasks to finish
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one reminder form group', async () => {
    // Ensure that ngOnInit has completed before checking
    await fixture.whenStable(); // Waits for asynchronous tasks in the component to finish
    expect(component.reminders.length).toBe(1);
  });

  it('should add a reminder when previous reminder is valid', () => {
    component.reminders.at(0).setValue({ time: '10:00', message: 'Test task' });
    component.addReminder();
    expect(component.reminders.length).toBe(2);
  });

  it('should not add a reminder if the previous reminder is invalid', () => {
    component.reminders.at(0).setValue({ time: '', message: '' });
    component.addReminder();
    expect(component.reminders.length).toBe(1);
  });

  it('should remove a reminder and call removeNotification from ReminderService', () => {
    component.reminders.at(0).setValue({ time: '10:00', message: 'Test task' });
    component.removeReminder(0);
    expect(component.reminders.length).toBe(0);
    expect(reminderServiceSpy.removeNotification).toHaveBeenCalledWith(0);
  });

  it('should set reminders and call setReminder from ReminderService', () => {
    component.reminders.at(0).setValue({ time: '10:00', message: 'Test task' });
    // Call setReminders to trigger the service method
    component.setReminders();
    expect(reminderServiceSpy.setReminder).toHaveBeenCalledWith('10:00', 'Test task', 0, jasmine.any(Function));
  });


  it('should request notification permission on init', () => {
    component.ngOnInit();
    expect(reminderServiceSpy.requestPermission).toHaveBeenCalled();
  });
});
