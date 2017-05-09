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
import { FormGroup, FormBuilder, Validators } from "@angular/forms";


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
            this.userForm = this.formBuilder.group({
                'name': ['', [ Validators.required ] ],
                'mssv': ['', []],
                'gender': ['', [] ],
                'birth': ['', [] ],
                'bacdt': ['', []],
                'htdt': ['', []],
                'ctdt': ['', [] ],
                'khoa': ['', []],
                'class': ['', []],
                'homeTown': ['', []],
                'email': ['', []],
                'phone': ['', [] ]
             });

        this.route.params.subscribe(params => {
            this.state = params['state'] || 'me';
            this.uid = params['uid'] || 'view';

            if (this.uid == 'me') {
                this.uid = this.afAuth.auth.currentUser.uid;
            }
            this.loadUser( );
        });

        this.db.object('/options/').subscribe(options => {
            Object.keys(options).forEach((key) => {
                options[key] = Object.keys(options[key]).map(subKey => options[key][subKey]);
            });
            this.options = options;
        });
    }

    public ngOnChanges(changes) {
    }

    public loadUser( ) {
        this.db.object(`/users/${this.uid}`).subscribe(user => {
            console.log('user change');
            this.user = user;
            this.userForm.setValue(user);
            this.userForm.controls.email.disable();
        });
    }

    public submitProfile(){
        console.log('submitProfile');
        var user = this.userForm.getRawValue();

        this.db.object(`/users/${this.uid}`).update(user).then(this.toView.bind(this));
    }

    public toView(){
        this.router.navigate(['/profile','me', 'view']);
    }

    public toEdit() {
        this.router.navigate(['/profile','me', 'edit']);
    }

}
