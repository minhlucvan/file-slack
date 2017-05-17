import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class NotifyService {
    static TYPE = {
        SUCCESS: 'success',
        INFO: 'info',
        WARNING: 'warning',
        DANGER: 'danger',
            
    };

    static OPTIONS = {
        DEFAULT: {
            message: '',
            title: '',
            type: 'info',
            ttl: 4500,
            canClose: true,
            autoClose: true
        }
    }

    public data: BehaviorSubject<any> = new BehaviorSubject( new Map() );

    public info( message: string, title?: string, opt?: any){
        this.buildNoty(message, title, { 
            type: NotifyService.TYPE.INFO,
            ...opt
        });
    } 

    public success( message: string,title?: string, opt?: any){
        this.buildNoty(message, title, { 
            type: NotifyService.TYPE.SUCCESS,
            ...opt
        });
    } 

    public warning( message: string, title?: string, opt?: any){
        this.buildNoty(message, title, { 
            type: NotifyService.TYPE.WARNING,
            ...opt
        });
    } 

    public danger( message: string, title?: string, opt?: any){
        this.buildNoty(message, title, { 
            type: NotifyService.TYPE.DANGER,
            ...opt
        });
    } 

    public remove( key ){
        this.data.value.delete( key );
        this.data.next( this.data.value );
    }

    private buildNoty(message, title, opt){
        var option = Object.assign({}, NotifyService.OPTIONS.DEFAULT, opt)
        var key = 'xxxxxxxx'.replace(/[x]/g, (x) => {
            return  '' + Math.round(Math.random()*9);
        });

        var map = this.data.value;

        var noty = Object.assign({}, option, { message, title, key });
        map.set(key, noty);
        this.data.next(map);

        if( option.autoClose && typeof option.ttl === 'number' && option.ttl > 0 ){
            setTimeout( this.remove.bind(this, key), option.ttl );
        } 
    }
}