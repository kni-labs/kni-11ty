module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy({"dist/styles": "styles"});
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addWatchTarget("src/styles");
  eleventyConfig.addWatchTarget("dist/styles");

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
