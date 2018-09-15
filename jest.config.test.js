module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/functions/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(\\.|/)(test|spec)\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
}
