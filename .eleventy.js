module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({"dist/assets": "assets"});
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addWatchTarget("src/styles");
  eleventyConfig.addWatchTarget("dist/assets/css");

  return {
    dir: {
      input: "src",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["html", "njk", "md"]
  };
};
