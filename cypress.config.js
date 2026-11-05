const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "i4mqah",
  env: {
    urlApi: '',// http://localhost:8082/api/v1/
  },
  e2e: {
    baseUrl: "http://localhost:8080",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
