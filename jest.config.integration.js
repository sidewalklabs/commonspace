module.exports = {
  "roots": [
    "<rootDir>/src",
    "<rootDir>/functions/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "(\\.|/)it\\.tsx?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx"
  ],
}
