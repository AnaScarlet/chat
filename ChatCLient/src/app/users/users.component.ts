import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Cookie } from '../cookie';
import { Message } from '../message';
import { MessagingService } from "../messaging.service";
import { SocketReturnObject } from '../socket-return-object';
import { User } from '../user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  @Input() cookie: Cookie;
  @Output() usersStateUpdateEvent = new EventEmitter<{messages: Message[], users: User[], cookie: Cookie, renderMessages: boolean}>();
  @Output() usersUpdateEvent = new EventEmitter<User[]>();

  public onlineUsers: User[];
  private messages: Message[];
  private renderMessages: boolean = false;

  constructor(private messagingService: MessagingService) { }

  ngOnInit(): void {
    this.retrieveOnlineUsers();
  }

  public retrieveOnlineUsers() {
    this.messagingService.joinUser()
        .subscribe((socketObject: SocketReturnObject) => {
          console.log("Got user join event.");

          // If cookie is set, send it to server
          if (this.cookie !== undefined && this.cookie.getUsernameFromCookie()) {
            console.log("Cookie is already set.");
            this.messagingService.sendUserJoin(this.cookie.getUsernameFromCookie());
          }
          else {
            console.log("Cookie is not set.");
            this.cookie = new Cookie(socketObject.currentUserName)
          }
          this.onlineUsers = socketObject.users;
          this.messages = socketObject.messages;
          this.renderMessages = true;
          this.usersStateUpdateEvent.emit({messages:this.messages, users:this.onlineUsers, cookie:this.cookie, renderMessages:this.renderMessages});
        });

    this.messagingService.leaveUser()
        .subscribe((users: User[]) => {
          console.log("Leave user observabe: ");
          console.log(users);
          this.updateUsers(users);
        });

    this.messagingService.userRejoin()
        .subscribe((users: User[]) => {
          console.log("User rejoin confirmation. Online users:");
          console.log(users);
          this.updateUsers(users);
        });
    
    this.messagingService.userPoll()
        .subscribe((usernameToCheck: string) => {
          console.log("Got user poll.");
          if (this.cookie.getUsernameFromCookie() === usernameToCheck) {
            console.log("It was me.");
            this.messagingService.respondToUserPoll(true, usernameToCheck);
          }
          else {
            console.log("Not me.");
            this.messagingService.respondToUserPoll(false, usernameToCheck);
          }
        });
    
    this.messagingService.usersUpdate()
        .subscribe((users: User[]) => {
          console.log("Updated Online users:");
          console.log(users);
          this.updateUsers(users);
        });
  }

  private updateUsers(users: User[]) {
    this.onlineUsers = users;
    this.usersUpdateEvent.emit(this.onlineUsers);
  }

}
