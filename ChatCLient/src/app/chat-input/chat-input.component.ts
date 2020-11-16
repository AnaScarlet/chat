import { Component, Input, OnInit } from '@angular/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import { MessagingService } from "../messaging.service"
import { Cookie } from '../cookie';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent {

  @Input() cookie: Cookie;

  public messageFormControl = new FormControl('', [
  ]);

  public matcher = new MyErrorStateMatcher();

  constructor(private messagingService: MessagingService) { }

  public sendMessage() {
    this.messagingService.sendMessage(this.messageFormControl.value, this.cookie.getUsernameFromCookie());
    this.messageFormControl.setValue("");
  }
}
