import {
    Component,
    OnInit
} from '@angular/core';
import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";

import { FirebaseService } from '../providers/firebase.service';
import { Router } from "@angular/router";

@Component({
    selector: 'layout',
    providers: [
    ],
    styles: [`
            .mt-85{ margin-top: 85px; }
            
            .loader-wrap{
                position: absolute;
                right: 40px;
                top: 7px;
            }

            .loader-grey>div>div {
                background-image: linear-gradient(transparent 0%, transparent 70%, #9d9d9d 30%, #9d9d9d 100%);
            }
            `],
    templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
    public showLoader: boolean;

    public me;
    public chanels = [];
    public onlineList = [];

    public currentChanelId = '';

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private router: Router
    ) { }

    public ngOnInit() {
        this.firebaseService.chanels.subscribe( chanels => {
            this.chanels = chanels;
        });

        this.db.list("/presence/").subscribe((users) => {
            this.onlineList = users.filter( u => (u.uid !== this.afAuth.auth.currentUser.uid));
        });

        this.firebaseService.currentChanelId.subscribe( id => {
            this.currentChanelId = id;
        });

        this.appState.loader.subscribe((show) =>{
            this.showLoader = show;
        })

        this.me = this.afAuth.auth.currentUser;            
    }

    public setChanel( id ){
        console.log('set chanel', id);
        this.firebaseService.currentChanelId.next(id);
        this.router.navigate(['/']);
    }

    public logout(){
        this.afAuth.auth.signOut().then(res => {
            this.router.navigate(['/login']);
        });
    }
}
