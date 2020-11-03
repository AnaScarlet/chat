import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'DollarsChatClient';

  public messages = [new Message("AnaScarlet", "Hello"), new Message("Bubba", "Yoooooo")];
}

class Message {

  constructor( public from: string, public content: string) {

  }
  
}
