module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/functions/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "babel-jest"
  },
  "testRegex": "(\\.|/)(test|spec)\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
}
