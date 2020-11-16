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

  @Input() messages: Message[];
  @Input() cookie: Cookie;
  @Input() renderMessages: boolean;
  @Output() messagesStateUpdateEvent = new EventEmitter<{messages: Message[], users: User[], cookie: Cookie}>();

 

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
          this.messages = socketObject.messages;
          this.setInnitialRenderedMessages();
          if (socketObject.nameChanged && socketObject.currentUserName === this.cookie.getUsernameFromCookie()) {
            // User changed their name.
            console.log("User changed their name.");
            this.cookie.setUsername(socketObject.newName);
          }
          let onlineUsers = socketObject.users;
          console.log("Returned message object:");
          console.log(socketObject);
          if (socketObject.errorMessage && socketObject.currentUserName === this.cookie.getUsernameFromCookie()) {
            window.alert(socketObject.errorMessage);
          }
          this.messagesStateUpdateEvent.emit({messages:this.messages, users:onlineUsers, cookie:this.cookie});
        });
  }


  public updateRenderedMessages(data) {
    console.log("New messages:");
    //if (data.renderStartIndex >= 8) {
      this.renderedMessages = this.renderedMessages.concat(this.messages.slice(data.renderStartIndex, data.renderEndIndex));
      this.renderStartIndex = data.renderEndIndex;
    // }
    // else {
    //   let endIndx = data.renderEndIndex - 7;
    //   this.renderedMessages = this.renderedMessages.concat(this.messages.slice()
    // }
    console.log(this.renderedMessages);
    console.log("Parent End index: " + data.renderEndIndex);
    
  }

  private setInnitialRenderedMessages() {
    if (this.messages.length <= 8) {
      this.renderedMessages = this.messages;
    }
    else {
      this.renderedMessages = this.messages.slice(0, 8);
    }
    this.renderStartIndex = 0;

  }

}
