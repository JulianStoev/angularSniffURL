# URL change detection and handling service for Angular

With the size of your Angular app you need more and more listeners for different stuff that you call on all possible pages
and sometimes forget to unbind. Having a centralized service for the URL changes makes it easy to handle, it keeps just one
active subscription to the router, and you can change how it works throughout the whole project from just one place.

### Example usage

```
import { Component, OnInit, OnDestroy } from '@angular/core';
import { sniffUrlService } from 'sniffurl.service';
import { Subscription } from 'rxjs/internal/Subscription';

export class MyComponent implements OnInit, OnDestroy {
  
  constructor(
    private sniffUrl: sniffUrlService
  ) { }

  private urlSubscription:Subscription;

  ngOnInit() {
    this.urlSubscription = this.sniffUrl.obs$.subscribe(e => {
      if (!e) return;
      console.log(e);
      // your code here
    });
  }

  ngOnDestroy() {
    if (this.urlSubscription) {
      this.urlSubscription.unsubscripbe();
    }
    // if you don't need the sniffer anymore
    this.sniffUrl.stop();
  }

}
```

The returned format of the URL will be like this:
```
{
  url: string;
  route: string;
  segments: Array<string>;
  queryParams: Object;
  fragment: string;
}
```

So, on this example url the result will be as follows:
```
https://example.com/path/folder/?sort=2&orderby=1#asc
```
```
{
  url: '/path/folder/?sort=2&orderby=1#asc',
  route: '/path/folder',
  segments: ['path', 'folder'],
  queryParams: {
    sort: '2',
    orderby: '1'
  },
  fragment: 'asc'
}
```
### Note
1. Upon subscribing to obs$ you will immediately receive the last event. In case there is no previous event it will return null so you need to check for it.
2. If you subscripe to newObs$ it will start listening from now on and will emit on the next event.
