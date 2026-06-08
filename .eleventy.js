module.exports = function(eleventyConfig) {
  // Keep source assets copied into the output folder. We no longer passthrough
  // `dist/assets` because Eleventy will write its output directly to `dist`.
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addWatchTarget("src/assets/css");
  eleventyConfig.addWatchTarget("dist/assets/css");

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
