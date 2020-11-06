import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';

interface sniffUrlInterface {
  url: string;
  route: string;
  segments: Array<string>;
  queryParams: Object;
  fragment: string;
}

@Injectable({
  providedIn: 'root'
})
export class SniffurlService {

  constructor(
    private router: Router
  ) {
    this.sniff();
   }

  private subscription: Subscription;

  // will emit immediately with the last event, returns null on first load
  public readonly obs$ = new BehaviorSubject(<sniffUrlInterface>null);

  // listens from now on, will emit on the next event
  public readonly newObs$ = <Subject<sniffUrlInterface>> new Subject;

  private sniff():void {
    if (this.subscription) return;
    this.subscription = this.router.events.subscribe((event:Object):void => {
      if (event instanceof NavigationEnd) {
        let obs = this.parse(event.url);
        this.obs$.next(obs);
        this.newObs$.next(obs);
      }
    });
  }

  public stop():void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private parse(eventUrl:string):sniffUrlInterface {
    // faster than router.parseUrl()
    let url = eventUrl;
    let fragment = url.split('#')[1] || null;
    if (fragment) {
      url = url.replace('#'+ fragment, '');
    }
    let queryParams:any = url.split('?')[1] || {};
    if (queryParams[0]) {
      url = url.replace('?'+ queryParams, '');
      // faster than URLSearchParams
      queryParams = JSON.parse('{"' + queryParams.replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    let segments = url.split('/');
    segments.shift();

    let obs:sniffUrlInterface = {
      url: eventUrl,
      route: '/' + segments.join('/'),
      segments: segments,
      queryParams: queryParams,
      fragment: fragment
    };
    return obs;
  }

}
