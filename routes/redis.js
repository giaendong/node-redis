const redis = require('redis')
const client = redis.createClient();
const { promisify } = require('util');
const getAsync = promisify(client.get).bind(client);

// create redis middleware
const redisMiddleware = async (req, res, next) => {
  const key = "__hooqdExpiry__" + req.originalUrl || req.url;
  console.log(req.url)
  const result = await getAsync(key);
  if (result) {
    const parsed = JSON.parse(result)
    res.json(JSON.parse(parsed))
  } else {
    res.sendResponse = res.send;
    // set expiry time for different request 
    // expiry time dependant on what the app needed
    // e.g single episode is rarely updated and list(discover) has frequently updates
    let expTime = 180; // list(discover) or non single request have 3 minutes
    if (req.params.id) {
      if (req.query.season){
        if (req.query.episode) {
          expTime = 86400; // single episode request have 1 day expiry time
        } else expTime = 3600; // season request have 1 hour expiry time
      } else expTime = 600; // single tv request have 10 minutes expiry time
    }
    if (req.url === '/configuration') expTime = 604800; // configuration request have 7 days expiry time
    res.send = (body) => {
      client.set(key, JSON.stringify(body), 'EX', expTime); // set expire time
      res.sendResponse(body);
    }
    next();
  }
};

module.exports = redisMiddleware;