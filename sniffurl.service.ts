import { Injectable } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs/internal/Subject';

export interface sniffUrlInterface {
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

  // will emit immediately with the last event
  public readonly obs$ = new BehaviorSubject(this.parse(window.location.href.replace(window.location.protocol + '//' + window.location.host, '')) as sniffUrlInterface);

  // listens from now on, will emit on the next event
  public readonly newObs$ = new Subject() as Subject<sniffUrlInterface>;

  private historyBack = {
    url: '/',
    route: '/',
    segments: [],
    queryParams: {},
    fragment: null
  } as sniffUrlInterface;

  private currentUrl = {} as sniffUrlInterface;

  // get back, history.back may get you out of the site
  public back(): void {
    this.router.navigate([this.historyBack.route], {queryParams: this.historyBack.queryParams, fragment: this.historyBack.fragment});
  }

  // returns the history back object
  public getHistoryBack(): sniffUrlInterface {
    return this.historyBack;
  }
  
  // get fast the current URL object without subscription
  public getCurrentUrl(): sniffUrlInterface {
   return this.currentUrl; 
  }

  // start listening for url changes
  private sniff(): void {
    if (this.subscription) return;
    this.subscription = this.router.events.subscribe((event: object): void => {
      // get the previous router for navigating back, history.back() may get you out of the site
      // event.id = 1 means we are just arriving
      if (event instanceof NavigationStart && event.id > 1) {
        this.historyBack = this.parse(this.router.url);
      }

      // get the final destination
      if (event instanceof NavigationEnd) {
        this.currentUrl = this.parse(event.url);
        this.obs$.next(this.currentUrl);
        this.newObs$.next(this.currentUrl);
      }
    });
  }

  public stop(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private parse(eventUrl: string): sniffUrlInterface {
    // faster than router.parseUrl()
    let url = eventUrl;
    let fragment = url.split('#')[1] || '';
    if (fragment !== '') {
      url = url.replace('#'+ fragment, '');
    } else {
      fragment = null;
    }
    let queryParams = url.split('?')[1] || {} as any;
    if (queryParams[0]) {
      url = url.replace('?'+ queryParams, '');
      // faster than URLSearchParams
      queryParams = JSON.parse('{"' + queryParams.replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    }
    const segments = url.split('/');
    segments.shift();

    return {
      url: eventUrl,
      route: '/' + segments.join('/'),
      segments: segments,
      queryParams: queryParams,
      fragment: fragment
    };
  }

}
