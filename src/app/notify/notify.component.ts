import { Component, OnInit } from '@angular/core';
import { NotifyService } from '../providers/notify.service';

@Component({
    selector: 'notify',
    templateUrl: './notify.component.html'
})

export class NotifyComponent implements OnInit {

    private noty = [];

    constructor(
        private notifyService: NotifyService
    ){}
    
    ngOnInit(): void {
        this.notifyService.data.subscribe(( notifications ) => {
            console.log(notifications);
            var values = notifications.values();
            this.noty = values;
        });
    }

    closeNoty( key ){
        this.notifyService.remove( key );
    }

}