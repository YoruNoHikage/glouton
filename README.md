# Glouton

Ever wanted to send a lot of requests concurrently to an API but got bothered with API limits ? Or failing requests ?

## Example with fetch

```js
import glouton from 'glouton';

const fetchNoLimit = glouton(fetch, {

  concurrency: 400, // 400 requests at a time

  validateResponse: r => {

    // if limit has been reached, we wait 1 second
    if (!r.ok && r.headers.get('x-ratelimit') === 0) {
      return 1000;
    }
    
    // if request has failed, we'll try again later
    if (!r.ok) {
      return 0;
    }

    // everything is ok, we shall proceed
    return true;
  },

});

[/* some ids */].forEach(() => {
  fetchNoLimit('http://someapi.on.the.web')
  .then((r) => {
    console.log("Here's my response!", r);
  });
});
```
