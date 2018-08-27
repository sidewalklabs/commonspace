import { Dimensions } from "react-native";
import { Header } from "react-navigation";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default {
  window: {
    width,
    height
  },
  header: {
    height: Header.HEIGHT
  },
  drawer: {
    height: height - Header.HEIGHT,
    width
  },
  isSmallDevice: width < 375
};
