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

@Component({
    selector: 'chanel',
    providers: [
    ],
    styles: [''],
    templateUrl: './chanel.component.html'
})
export class ChanelComponent implements OnInit {

    public chanel = {};
    public topics = [];

    public pageTopics = [];
    public pages = [];
    public totalPage = 0;
    public currentPage = 0;
    public itemPerPage = 20;

    constructor(
        private appState: AppState,
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private firebaseService: FirebaseService
    ) { }

    public ngOnInit() {
        this.firebaseService.currentChanelId.subscribe( this.loadChanel.bind(this) );
    }

    public loadChanel( id ){

        this.db.object('/options/chanels/' + id).subscribe(chanel => {
            this.chanel = chanel;
        })

        this.db.list('/chanels/' + id + '/topics/', {
            query: {}
        }).subscribe(this.setTopics.bind(this));
    }

    public setTopics(topics) {
        this.topics = topics;

        this.totalPage = Math.floor(topics.length / this.itemPerPage) + 1;
        console.log(this.totalPage);
        this.setPage(1);
    }

    public setPage(page) {
        if (page < 1 || page > this.totalPage) { return; }

        this.currentPage = 1;
        this.pages = Array(this.totalPage).fill(0).map((v, i) => (i + 1));
        this.pageTopics = this.topics.filter((t, i) => (i >= (this.currentPage - 1) * this.itemPerPage && i < (this.currentPage) * this.itemPerPage));
    }
}
