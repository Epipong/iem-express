#!/usr/bin/env ts-node
import { ImagingEdgeMobile } from "./src/sony/entities/imaging-edge-mobile";
import { getopt, opt } from "./src/settings/posix-options";
import { ImagingEdgeSrvc } from "./src/sony/services/imaging-edge-srvc";
import { PhotosProvider } from "./src/interfaces/photos.provider";
import { AuthProvider } from "./src/interfaces/auth.provider";
import { AuthFactory } from "./src/services/auth/auth-factory";
import { PhotosFactory } from "./src/services/photos/photos-factory";

const main = async () => {
  const auth: AuthProvider = AuthFactory.createAuth(opt.options);
  const iem = new ImagingEdgeMobile(opt.options);
  const manager = new ImagingEdgeSrvc(iem);
  const photos: PhotosProvider = PhotosFactory.createPhotos({
    ...opt.options,
    auth,
  });
  const cmd: string = process.argv[2];
  const commands: {
    [cmd: string]: () => any;
  } = {
    import: () => manager.importFiles(opt.options.force as boolean),
    export: () => manager.exportFiles(opt.options.force as boolean),
    init: async () => await auth.init(),
    token: async () => await auth.token(),
    albums: async () => await photos.main(opt.options),
    help: () => getopt.showHelp(),
  };
  commands[cmd in commands ? cmd : "help"]();
};

main();
