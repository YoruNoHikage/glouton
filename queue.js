function createScheduler(fetchFn, options) {
  const queue = [];
  let isPaused = false;
  let running = false;
  let concurrency = options.concurrency || Infinity;

  // true: valid
  // false: abort // todo ?
  // number: retry after the given time
  let validateResponse = options.validateResponse || (() => true);

  function next() {
    running = true;
    if (queue.length === 0) {
      running = false;
      return;
    }
    if (isPaused || concurrency <= 0) {
      return;
    }

    concurrency--;

    const { request, resolve } = queue.shift();

    const cb = r => {
      const responseValid = validateResponse(r);
      if (typeof responseValid === "number") {
        isPaused = true;
        queue.push({ request, resolve });
        return setTimeout(
          () => {
            isPaused = false;
            concurrency++;
            next();
          },
          responseValid
        );
      }
      resolve(r);
      concurrency++;
      next();
    };

    request().then(cb, cb);

    next();
  }

  return function(...args) {
    let resolver = () => {};
    const promise = new Promise(resolve => {
      resolver = resolve;
    });
    queue.push({ request: () => fetchFn(...args), resolve: resolver });

    if (!running) {
      next();
    }

    return promise;
  };
}

module.exports = createScheduler;
