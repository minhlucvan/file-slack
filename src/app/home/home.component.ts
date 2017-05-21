import {
  Component,
  OnInit
} from '@angular/core';

import { AppState } from '../app.service';
import { FirebaseService } from '../providers/firebase.service';
import { ActivatedRoute } from "@angular/router";

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  // Set our default values

  constructor(
    public appState: AppState,
    private firebaseService: FirebaseService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    console.log('hello `Home` component');
    this.route.params.subscribe(params => {
      if(params['chanel']){
        this.firebaseService.currentChanelId.next(params['chanel']);
      } else {
        this.firebaseService.currentChanelId.next('thongbao');
      }
    })
  }

  public submitState(value: string) {
   
  }
}
