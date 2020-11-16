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
  @Output() stateUpdateEvent = new EventEmitter<{messages: Message[], users: User[], cookie: Cookie}>();

 

  public renderedMessages: Message[];
  public renderStartIndex: number = 0;


  constructor(private messagingService: MessagingService) { }

  ngOnInit(): void {
    this.retrieveMessages();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.renderMessages) {
      this.setInnitialRenderedMessages();
      this.renderStartIndex = 0;
    }
  }

  public retrieveMessages() {
    this.messagingService.getMessage()
        .subscribe((socketObject: SocketReturnObject) => {
          this.messages = socketObject.messages;
          this.setInnitialRenderedMessages();
          this.renderStartIndex = 0;
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
          this.stateUpdateEvent.emit({messages:this.messages, users:onlineUsers, cookie:this.cookie});
        });
  }


    // private msgIndx = 0;
  // private prevPositionStart = 0;

  public updateRenderedMessages(data) {
    console.log("New messages:");
    this.renderedMessages = this.renderedMessages.concat(this.messages.slice(data.renderStartIndex, data.renderEndIndex));
    console.log(this.renderedMessages);
    console.log("Parent End index: " + data.renderEndIndex);
    // if (data.renderEndIndex >= this.messages.length-1) {
    //   this.renderStartIndex = 0;
    // }
    this.renderStartIndex = data.renderEndIndex;
  }

  private setInnitialRenderedMessages() {
    this.renderedMessages = this.messages.slice(0, 8);
  }

}
