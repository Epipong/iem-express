import * as oauth2 from "./google.config.json";

const config = {
  ...oauth2,
  sourcePathAndroid: process.env.SOURCE_PATH_ANDROID || "",
  targetPathAndroid: process.env.TARGET_PATH_ANDROID || "",
  sourcePathLinux: process.env.SOURCE_PATH_LINUX || "",
  targetPathLinux: process.env.TARGET_PATH_LINUX || "",
  sourcePathMacOs: process.env.SOURCE_PATH_MACOS || "",
  targetPathMacOs: process.env.TARGET_PATH_MACOS || "",
}

export { config };
