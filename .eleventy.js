module.exports = function(eleventyConfig) {
  // Keep source assets copied into the output folder. We no longer passthrough
  // `dist/assets` because Eleventy will write its output directly to `dist`.
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/assets/fonts");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addWatchTarget("src/assets/css");
  eleventyConfig.addWatchTarget("src/assets/js");
  eleventyConfig.addWatchTarget("dist/assets/css");

  eleventyConfig.addFilter("absoluteUrl", function(url, base) {
    if (!url) {
      return "";
    }

    try {
      return new URL(url, base).toString();
    } catch {
      return url;
    }
  });

  eleventyConfig.addFilter("canonicalUrl", function(pageUrl, base) {
    if (!pageUrl) {
      return "";
    }

    try {
      return new URL(pageUrl, base).toString();
    } catch {
      return pageUrl;
    }
  });

  eleventyConfig.addFilter("sitemapPages", function(collection) {
    return collection.filter(function(item) {
      return item.url && !item.data.noindex && !item.data.eleventyExcludeFromCollections;
    });
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "dist"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
};
