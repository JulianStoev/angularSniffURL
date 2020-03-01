# URL change detection and handling service for Angular

With the size of your Angular app you need more and more listeners for different stuff that you call on all possible pages
and sometimes forget to unbind. Having a centralized service for the URL changes makes it easy to handle, it keeps just one
active subscription to the router, and you can change how it works throughout the whole project from just one place.

### Example usage

1. Before you can subscribe for changes, you need to start listening for events, by calling sniffUrl.start();
2. If you think your app won't need to listen anymore for URL changes, you can stop listneing with sniffUrl.stop();
3. You don't need to start/stop the listener on each component unless you need it for specific situations only.
The usual usage is to just enable it in your App compoennt on init so you can use it in every component at all times.

```
import { sniffUrlService } from 'sniffurl.service';
import { Subscription } from 'rxjs/internal/Subscription';

export class MyComponent {
  
  constructor(
    public content: sniffUrlService
  ) { }
  
  private urlSubs:Subscription;
  
  ngOnInit() {
    this.sniffUrl.start();
    this.urlSubs = this.tools.sniffUrl.obs$.subscribe(e => {
      if (e) {
        // console.log(e);
        // there was a change with the URL
        // your code here        
      }
    });
  }
  
  ngOnDestroy() {
    if (this.urlSubs) {
      this.urlSubs.unsubscripbe();
    }
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
    orderBy: '1'
  },
  fragment: 'asc'
}
```
### Note
1. Call sniffUrl.start() once somewhere in your app to start listening for router changes.
2. Upon subscribing to obs$ you will immediately receive the last event. In case there is no previous event it will return null so you need to check for it.
2. If you subscripe to newObs$ it will start listening from now on and will emit on the next event.
