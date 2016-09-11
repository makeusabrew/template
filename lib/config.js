if (!process.env.CONFIG_DIR) {
  throw new Error("Please provide a CONFIG_DIR environment variable");
}

const env = process.env.NODE_ENV || "production";

module.exports = require(`${process.env.CONFIG_DIR}/${env}.json`);
