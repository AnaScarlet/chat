import { Component } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { MessagingService } from "./messaging.service"
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DollarsChatClient';

  public onlineUsers: User[];
  public messages: Message[];
  //currentMessage: string = 'hh';

  constructor (private messagingService: MessagingService) {
  }

  messageFormControl = new FormControl('', [
    Validators.pattern(RegExp("")),
  ]);

  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    this.retrieveMessages();
    this.retrieveOnlineUsers();
    //this.sendMessage();
  }

  public retrieveOnlineUsers() {
    this.messagingService.joinUser()
        .subscribe((data: SocketUsersAndMessagesObject) => {
          console.log("Join user observabe: ");
          console.log(data.users);
          this.onlineUsers = data.users;
          this.messages = data.messages;
        });

    this.messagingService.leaveUser()
        .subscribe((users: User[]) => {
          console.log("Leave user observabe: ");
          console.log(users);
          this.onlineUsers = users;
        });
  }

  public retrieveMessages() {
    this.messagingService.getMessage()
        .subscribe((msg: Message[]) => {
          console.log(`getMessages observable:`);
          console.log(msg);
          this.messages = msg;
        });
  }

  public sendMessage() {
    //this.messageFormControl.valueChanges.subscribe(msg => {
      console.log("Sending message: " + this.messageFormControl.value)
      this.messagingService.sendMessage(this.messageFormControl.value);
      this.messageFormControl.setValue("");
    //})
    
  }
  
}

class SocketUsersAndMessagesObject {
  constructor(public users: User[], public messages: Message[]) {}
} 