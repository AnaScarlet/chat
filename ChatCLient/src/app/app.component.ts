import { Component, AfterViewInit } from '@angular/core';
import { Message } from "./message";
import { User } from "./user";
import { MessagingService } from "./messaging.service"
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';


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
export class AppComponent implements AfterViewInit {
  title = 'DollarsChatClient';

  public onlineUsers: User[];
  public messages: Message[];

  constructor (private messagingService: MessagingService, private breakpointObserver: BreakpointObserver) {
    
  }

  messageFormControl = new FormControl('', [
    Validators.pattern(RegExp("")),
  ]);

  matcher = new MyErrorStateMatcher();

  ngOnInit() {
    this.retrieveMessages();
    this.retrieveOnlineUsers();
  }

  ngAfterViewInit(){
    this.breakpointObserver.observe([
      Breakpoints.Medium
    ]).subscribe(result => {
      if (result.matches) {
        this.activateMediumLayout();
      }
    });
    this.breakpointObserver.observe([
      Breakpoints.Small
    ]).subscribe(result => {
      if (result.matches) {
        this.activateSmallLayout();
      }
    });
    this.breakpointObserver.observe([
      Breakpoints.XSmall
    ]).subscribe(result => {
      if (result.matches) {
        this.activateXSmallLayout();
      }
    });
  
  }

  public retrieveOnlineUsers() {
    this.messagingService.joinUser()
        .subscribe((data: SocketUsersAndMessagesObject) => {
          console.log("Join user observabe: ");
          console.log(data.users);
          if (!this.isUserRejoining(data.currentUser.username)) {
            console.log("User is not rejoining.");
            console.log("Users: ");
            console.log(data.users);
            this.onlineUsers = data.users;
            this.messages = data.messages;
          }
          else {
            console.log("User is rejoining.");
            this.messages = data.messages;
            this.messagingService.sendUserRejoin(this.getUsernameFromCookie());
          }
          // this.onlineUsers = data.users;
          // this.messages = data.messages;

        });

    this.messagingService.leaveUser()
        .subscribe((users: User[]) => {
          console.log("Leave user observabe: ");
          console.log(users);
          this.onlineUsers = users;
        });

    this.messagingService.userRejoin()
        .subscribe((users: User[]) => {
          console.log("User rejoin confirmation. Online users:");
          console.log(users);
          this.onlineUsers = users;
        });
  }

  public retrieveMessages() {
    this.messagingService.getMessage()
        .subscribe((msg: Message[]) => {
          this.messages = msg;
        });
  }

  public sendMessage() {
    this.messagingService.sendMessage(this.messageFormControl.value);
    this.messageFormControl.setValue("");
  }

  private isUserRejoining(currentUser: string): boolean {
    if (document.cookie) {
      console.log("I already have a cookie!");
      return true;
    }
    else {
      document.cookie = currentUser;
      return false;
    }
  }

  private getUsernameFromCookie() {
    return document.cookie;
  }

  public isUserCurrentUser(username: string) {
    console.log("Current user check called with username =***" + username + "***");
    console.log("result: " + (username == document.cookie));
    return username == document.cookie;
  }

///////////////// Media Queries from Angular Material //////////////////

  private activateMediumLayout() {
    document.getElementsByTagName("mat-sidenav")[1].setAttribute("style", "min-width: 0");
    document.getElementById("send-button").style.marginRight = "1rem";
  }

  private activateSmallLayout() {
    document.getElementsByTagName("mat-sidenav")[0].setAttribute("style", "min-width: 0");
    document.getElementById("send-button").style.marginRight = "0rem";
  }
  
  private activateXSmallLayout() {
    document.getElementById("main-content").style.gridTemplateRows = "100% 26%";
    document.getElementById("send-button").style.marginLeft = "0.2rem";
    document.getElementById("main-content").style.gridTemplateRows = "100% 26%";
    document.getElementsByTagName("mat-sidenav-container")[0].setAttribute("style",
      "position: absolute; top: 48px; bottom: 0; left: 0; right: 0;");
  }

}

class SocketUsersAndMessagesObject {
  constructor(public users: User[], public currentUser: User, public messages: Message[]) {}
} 