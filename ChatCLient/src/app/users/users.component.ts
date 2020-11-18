import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
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

  @Input()
  get cookie(): Cookie {
    return this._cookie;
  }
  set cookie(cookie: Cookie) {
    this._cookie = cookie;
  }
  @Input()
  public get onlineUsers(): User[] {
    return this._onlineUsers;
  }
  public set onlineUsers(value: User[]) {
    this._onlineUsers = value;
  }
  @Output() usersStateUpdateEvent = new EventEmitter<{messages: Message[], users: User[], cookieUsername: string, renderMessages: boolean}>();
  @Output() usersUpdateEvent = new EventEmitter<User[]>();

  public _onlineUsers: User[];
  private messages: Message[];
  private renderMessages: boolean = false;
  public _cookie: Cookie;

  constructor(private messagingService: MessagingService) { }

  ngOnInit(): void {
    this.retrieveOnlineUsers();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes.cookie) {
  //     console.log("Users: Cookie change detected.")
  //     this.myCookie = changes.cookie.currentValue;
  //   }
  // }

  public retrieveOnlineUsers() {
    this.messagingService.joinUser()
        .subscribe((socketObject: SocketReturnObject) => {
          console.log("Got user join event.");
          let cookieUsername = null;

          // If cookie is set, send it to server
          if (this._cookie === undefined) {
            console.log("Cookie object undefined. Panic!");
          }
          if (this._cookie.getUsernameFromCookie()) {
            console.log("Cookie is already set to " + this._cookie.getUsernameFromCookie());
            cookieUsername = this._cookie.getUsernameFromCookie();
            this.messagingService.sendUserJoin(cookieUsername);
          }
          else {
            console.log("Cookie is not set.");
            cookieUsername = socketObject.currentUserName;
            console.log("Set cookie to " + this._cookie.getUsernameFromCookie());
          }
          this._onlineUsers = socketObject.users;
          this.messages = socketObject.messages;
          this.renderMessages = true;
          this.usersStateUpdateEvent.emit({messages:this.messages, users:this._onlineUsers, cookieUsername:cookieUsername, renderMessages:this.renderMessages});
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
          if (this._cookie.getUsernameFromCookie() === usernameToCheck) {
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
    this._onlineUsers = users;
    this.usersUpdateEvent.emit(this._onlineUsers);
  }

}
