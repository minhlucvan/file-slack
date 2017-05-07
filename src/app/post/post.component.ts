import {
    Component,
    OnInit,
    Input
} from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { Router } from "@angular/router";
import * as firebase from 'firebase';


@Component({
    selector: 'post',
    providers: [
    ],
    styles: [''],
    templateUrl: './post.component.html'
})
export class PostComponent implements OnInit {

    public topic;
    public currentChanelId;
    public chanels;

    public file: File;
    public postForm: FormGroup;

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private router: Router,
        private formBuilder: FormBuilder
    ) { }

    public ngOnInit() {
        this.postForm = this.formBuilder.group({
            'title': ['', [ Validators.required ]],
            'chanel': [this.currentChanelId || '', [ Validators.required ]],
            'content': ['', [ Validators.required ]]
        })

        this.firebaseService.currentChanelId.subscribe(id => {
            this.currentChanelId = id;
            this.postForm.controls.chanel.setValue(id);
        });

        this.firebaseService.chanels.subscribe( chanels => {
            this.chanels = chanels;
        })
    }

    public selectFile( event ){
        var files = event.srcElement.files;
        this.file = files[0];
    }

    public post(){
        var data = this.postForm.getRawValue();
        console.log(data);

        data.author = {
            name: this.afAuth.auth.currentUser.displayName,
            uid: this.afAuth.auth.currentUser.uid
        }

        data.created = firebase.database.ServerValue.TIMESTAMP;

        data.public = true;
        
        var topics = this.db.list(`/chanels/${data.chanel}/topics/`);

        topics.push(data).then(res => {
            console.log(res.key);

            var firebase = this.db.app;
            var storageRef = firebase.storage().ref();

            data.key = res.key;

             var fileRef = storageRef.child(`topics/${res.$key}/${this.file.name}`);
             return fileRef.put(this.file);
        }).then(res => {
            return this.db.object(`/chanels/${data.chanel}/topics/${data.key}/`).update({'files': `/topics/${res.$key}/${this.file.name}`})
        }).then(res => {
            return this.router.navigate(['/topic', data.chanel, data.key]);
        });
    }


}
