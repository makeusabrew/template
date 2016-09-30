const Bluebird = require("bluebird");
const redis = require("redis");
const debug = require("debug")("lib:redis");

let client;

Bluebird.promisifyAll(redis);

module.exports = {
  createClient: () => {
    return redis.createClient(process.env.REDIS_PORT || 6379, process.env.REDIS_HOST || "localhost");
  },

  getClient: () => {
    if (!client) {
      client = module.exports.createClient();
    }
    return client;
  },

  publish: (channel, msg, encoder = JSON.stringify) => {
    // locally scoped client, no problem
    const client = module.exports.getClient();
    debug("PUBLISH %s", channel);
    return client.publish(channel, encoder(msg));
  },

  subscribe: (channel, callback, decoder = JSON.parse) => {
    const client = module.exports.createClient();

    debug("SUBSCRIBE %s", channel);
    client.subscribe(channel);

    client.on("message", (channel, msg) => {
      debug("MESSAGE %s", channel);
      callback(channel, decoder(msg));
    });

    return client;
  }
};
