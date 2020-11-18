import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MessagingService } from "../messaging.service";
import { Message } from "../message";
import { User } from "../user";
import { SocketReturnObject } from '../socket-return-object';
import { Cookie } from '../cookie';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css', '../app.component.css']
})
export class MessagesComponent implements OnInit {

  @Input()
  public get messages(): Message[] {
    return this._messages;
  }
  public set messages(value: Message[]) {
    this._messages = value;
  }
  @Input()
  get cookie(): Cookie {
    return this._cookie;
  }
  set cookie(cookie: Cookie) {
    this._cookie = cookie;
  }
  @Input() renderMessages: boolean;
  @Output() messagesStateUpdateEvent = new EventEmitter<{messages: Message[], users: User[], cookieUsername: string}>();

 
  private _cookie;
  private _messages: Message[];
  public renderedMessages: Message[];
  public renderStartIndex: number = 0;


  constructor(private messagingService: MessagingService) { }

  ngOnInit(): void {
    this.retrieveMessages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.renderMessages && !changes.renderMessages.isFirstChange()) {
      this.setInnitialRenderedMessages();
    }
  }

  public retrieveMessages() {
    this.messagingService.getMessage()
        .subscribe((socketObject: SocketReturnObject) => {
          this._messages = socketObject.messages;
          this.setInnitialRenderedMessages();
          let cookieUsername = this._cookie.getUsernameFromCookie();
          if (socketObject.nameChanged && socketObject.currentUserName === this._cookie.getUsernameFromCookie()) {
            // User changed their name.
            console.log("User changed their name.");
            cookieUsername = socketObject.newName;
          }
          let onlineUsers = socketObject.users;
          console.log("Returned message object:");
          console.log(socketObject);
          if (socketObject.errorMessage && socketObject.currentUserName === this._cookie.getUsernameFromCookie()) {
            window.alert(socketObject.errorMessage);
          }
          this.messagesStateUpdateEvent.emit({messages:this._messages, users:onlineUsers, cookieUsername:cookieUsername});
        });
  }


  public updateRenderedMessages(data) {
    console.log("*Parent got new messages*");
    console.log("Messages.length = " + this._messages.length);
    if (data.renderEndIndex <= this._messages.length-1) {
      console.log("Have enough messages in the array to display a whole portion.");
      console.log("End index: " + data.renderEndIndex);
      this.renderedMessages = this.renderedMessages.concat(this._messages.slice(data.renderStartIndex, data.renderEndIndex));
      this.renderStartIndex = data.renderEndIndex;
    }
    else if (data.renderEndIndex > this._messages.length-1) {
      console.log("Not enough messages in the array to display a whole portion.");
      let endIndx = this._messages.length - 1;
      console.log("End index: " + endIndx);
      this.renderedMessages = this.renderedMessages.concat(this._messages.slice(data.renderStartIndex, endIndx+1));
      this.renderStartIndex = endIndx;
    } else {
      // don't concatenate to rendered messages because the start index is 0 and this was the default rendered messages.
    }
    console.log("New messages:");
    console.log(this.renderedMessages);
  }

  private setInnitialRenderedMessages() {
    if (this._messages.length <= 8) {
      this.renderedMessages = this._messages;
    }
    else {
      this.renderedMessages = this._messages.slice(0, 8);
    }
    this.renderStartIndex = 8;
  }

}
