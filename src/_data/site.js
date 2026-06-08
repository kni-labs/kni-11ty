const environment = process.env.ELEVENTY_ENV || process.env.CONTEXT || "development";

module.exports = {
  name: "KNI-11ty",
  title: "KNI-11ty",
  description: "A practical Eleventy starter for fast, content-driven websites.",
  url: process.env.URL || "http://localhost:8080",
  environment,
  isProduction: environment === "production",
  language: "en",
  locale: "en_US",
  author: "KNI",
  defaultImage: "/assets/images/sample-image.jpg",
  year: new Date().getFullYear()
};
