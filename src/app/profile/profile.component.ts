import {
    Component,
    OnInit,
    Input,
    OnChanges
} from '@angular/core';
import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { ActivatedRoute, Router } from "@angular/router";

import * as firebase from 'firebase';
import { FormGroup, FormBuilder } from "@angular/forms";


@Component({
    selector: 'profile',
    providers: [
    ],
    styles: [''],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit, OnChanges {
    public state = '';
    public uid = '';
    public options = {};
    public user = {};
    public userForm: FormGroup;

    private subs = [];


    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private route: ActivatedRoute,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    public ngOnInit() {
        this.route.params.subscribe(params => {
            this.state = params['state'];
            this.uid = params['uid'];
            if (this.uid == 'me') {
                this.uid = this.afAuth.auth.currentUser.uid;
            }
        });

        this.db.object('/options/').subscribe(options => {
            Object.keys(options).forEach((key) => {
                options[key] = Object.keys(options[key]).map(subKey => options[key][subKey]);
            });
            this.options = options;
            console.log(this.options);
        });

        this.userForm = this.formBuilder.group({
            'name': ['', [] ],
            'gender': ['', [] ],
            'birth': ['', [] ],
            'bacdt': ['', []],
            'htdt': ['', []],
            'ctdt': ['', [] ],
            'khoa': ['', []],
            'class': ['', []],
            'howmTown': ['', []],
            'email': ['', []],
            'phone': ['', [] ]
        });
    }

    public ngOnChanges(changes) {
        if( changes['uid'] ){
            this.loadUser( changes['uid']['currentValue'] );
        }
    }

    public loadUser( uid ) {
        this.db.object(`/users/${uid}`).subscribe(user => {
            this.user = user;
        });
    }

    public submitProfile(){
        
    }

    public toEdit() {
        this.router.navigate(['/profile', 'edit']);
    }

}
