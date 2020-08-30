import { Injectable } from '@angular/core';
import { Router, NavigationEnd, UrlTree, UrlSegment } from '@angular/router';
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
  public obs$ = new BehaviorSubject(<sniffUrlInterface>null);

  // listens from now on, will emit on the next event
  public newObs$ = <Subject<sniffUrlInterface>> new Subject;

  private sniff():void {
    if (this.subscription) return;
    this.subscription = this.router.events.subscribe((event:Object) => {
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

}
