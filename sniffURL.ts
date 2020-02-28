import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { Router, NavigationEnd, UrlTree, UrlSegment } from '@angular/router';

export interface sniffUrlInterface {
  url: string;
  route: string;
  segments: Array<string>;
  queryParams: Object;
  fragment: string;
}

@Injectable({
  providedIn: 'root',
})

export class sniffUrlService {
  constructor(
    private router: Router
  ) { }
  
  public sniffURL = {
    subscription: <Subscription>null,
    obs$: new BehaviorSubject(<sniffUrlInterface>null),
    newObs$: <Subject<sniffUrlInterface>> new Subject,
    start: ():void => {
      if (this.sniffURL.subscription) return;
      this.sniffURL.subscription = this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          let url:UrlTree = this.router.parseUrl(event.url);
          let segments = <Array<string>>[];
          if (url.root.children.primary && url.root.children.primary.segments) {
            segments = url.root.children.primary.segments.map((el:UrlSegment) => {
              return el.path;
            });
          }
          let obs:sniffUrlInterface = {
            url: event.url,
            route: '/' + segments.join('/'),
            segments: segments,
            queryParams: url.queryParams,
            fragment: url.fragment
          };
          this.sniffURL.obs$.next(obs);
          this.sniffURL.newObs$.next(obs);
        }
      });
    },
    stop: ():void => {
      if (this.sniffURL.subscription) {
        this.sniffURL.subscription.unsubscribe();
      }
    }
  };
}
