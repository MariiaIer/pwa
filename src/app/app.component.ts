import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ReminderService } from './services/reminder.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [FormsModule]
})
export class AppComponent implements OnInit {
  public reminderForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private reminderService: ReminderService
  ) {
    this.reminderForm = this.fb.group({
      reminders: this.fb.array([]) // Initialize an empty array of reminders
    });
    this.addReminder(); // Add the first reminder form group by default
  }

  ngOnInit(): void {
    this.requestNotificationPermission();
  }

  get reminders(): FormArray {
    return this.reminderForm.get('reminders') as FormArray;
  }

  // Method to create a new reminder form group
  private createReminder(): FormGroup {
    return this.fb.group({
      time: ['', Validators.required],
      message: ['Time to do task!', Validators.required]
    });
  }

  // Add a new reminder form group to the FormArray
  public addReminder(): void {
    const lastReminder = this.reminders.at(this.reminders.length - 1);

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
    this.reminders.controls.forEach((control, index) => {
      const { time, message } = control.value;
      if (time && message) {
        this.reminderService.setReminder(time, message, index);
      }
    });
    alert('Reminders set successfully!');
  }

  public requestNotificationPermission(): void {
    this.reminderService.requestPermission();
  }

}
