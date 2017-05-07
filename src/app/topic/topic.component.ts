import {
    Component,
    OnInit,
    Input
} from '@angular/core';
import { Observable } from 'rxjs';

import { AppState } from '../app.service';
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import { FirebaseService } from "../providers/firebase.service";
import { ActivatedRoute } from "@angular/router";


import * as moment from 'moment';
import 'moment/locale/vi';

moment.locale('vi');
console.log(moment.locale());

@Component({
    selector: 'topic',
    providers: [
    ],
    styles: [''],
    templateUrl: './topic.component.html'
})
export class TopicComponent implements OnInit {

    public topic;

    public cid = '';
    public tid = '';
    private subs = [];

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService,
        private route: ActivatedRoute
    ) { }

    public ngOnInit() {
        this.route.params.subscribe( params => {

            this.cid = params['chanel'];
            this.tid = params['topic'];
            this.loadTopic();
        })
    }

    public loadTopic(){
        this.db.object(`/chanels/${this.cid}/topics/${this.tid}/`).subscribe(topic => {
            console.log(topic);
            topic.created = moment.unix( topic.created ).format("DD MMM YYYY hh:mm a");
            this.topic = topic;
        })
    }

}
