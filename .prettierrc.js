module.exports = {
  plugins: [
    require("@trivago/prettier-plugin-sort-imports"),
    require("prettier-plugin-sort-json"),
    require("prettier-plugin-packagejson"),
  ],
  importOrderParserPlugins: [
    "typescript",
    "classProperties",
    "decorators-legacy",
  ],
  importOrder: ["^reflect-metadata$", ".+"],
};
