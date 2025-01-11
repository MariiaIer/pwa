import {ChangeDetectionStrategy, Component, computed, effect, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, Validators} from '@angular/forms';
import {ReminderService} from './services/reminder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  private maxTasks = 5;
  public reminderForm!: FormGroup;
  public acceptNewTasks = computed(() => this.reminderService['acceptNewTasksSignal']());

  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService
  ) {
    effect(() => {
      if (this.acceptNewTasks()) {
        this.resetForm();
      }
    });
  }


  ngOnInit(): void {
    this.reminderForm = this.fb.group({
      reminders: this.fb.array([])
    });
    this.addReminder(); // Add the first reminder form group by default
    this.requestNotificationPermission();
    this.reminderService.getNotificationTimerArray();
  }


  get reminders(): FormArray {
    return this.reminderForm.get('reminders') as FormArray;
  }


  private createReminder(): FormGroup {
    return this.fb.group({
      time: ['', Validators.required],
      message: ['Time to do task!', Validators.required]
    });
  }


  private resetForm(): void {
    this.reminderForm.reset({
      reminders: []
    });

    const reminders = this.reminderForm.get('reminders') as FormArray;
    while (reminders.length > 1) {
      reminders.removeAt(1);
    }
  }


  // Add a new reminder form group to the FormArray
  public addReminder(): void {
    const lastReminder = this.reminders.at(this.reminders.length - 1);

    if (this.reminders.length === this.maxTasks) {
      alert(`${this.maxTasks} tasks allowed`);
      return;
    }

    if ((this.reminders.length < 1) || lastReminder.valid) {
      this.reminders.push(this.createReminder());
    } else {
      alert('Please fill out the previous reminder before adding a new one.');
    }
  }


  // Remove a reminder form group at a specified index
  public removeReminder(index: number): void {
    this.reminders.removeAt(index);
    this.reminderService.removeNotification(index);
  }


  // Handle form submission to set reminders
  public setReminders(): void {
    const allReminders = this.reminders.controls.map((control, index) => {
      return new Promise((resolve, reject) => {
        const {time, message} = control.value;
        if (time && message) {
          this.reminderService.setReminder(time, message, index, resolve);
        } else {
          reject("Provide time && message");
        }
      });
    });

    Promise.all(allReminders)
      .then(() => {
        alert('Reminders set successfully!');
        this.reminderService.disallowAcceptNewTasks();
      })
      .catch((error) =>  console.log(error));
  }


  public requestNotificationPermission(): void {
    this.reminderService.requestPermission();
  }


  public checkSubmitDisabled(): boolean {
    return !this.reminderForm.valid || !this.acceptNewTasks();
  }


  public checkAddReminderDisabled(): boolean {
    return this.reminders.length < 5 && this.acceptNewTasks();
  }

}
