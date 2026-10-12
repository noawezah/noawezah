export type DeviceModelAsset = {
  /** Public URL of the supplied model. */
  src: string;
  format: 'obj' | 'fbx' | 'glb';
  /** OBJ material library, when supplied. */
  materials?: string;
  /** Folder for external textures, including the trailing slash. */
  resourcePath?: string;
  /** Adjust the exported model orientation in degrees. */
  rotation?: readonly [number, number, number];
  /** Name of a UV-mapped screen mesh or material to receive the website capture. */
  screenName?: string;
  screenImage?: string;
  /** Optional UV correction for the screen capture. */
  screenFlipY?: boolean;
};

export type DeviceSceneLayout = {
  composition: 'left' | 'right';
  /** CSS object-position values; the image always covers the existing scene. */
  backgroundPosition: string;
  mobileBackgroundPosition?: string;
  /** Keep devices fixed to a photographed surface, rather than floating on scroll. */
  photoAnchored?: boolean;
  backgroundBrightness?: number;
  models?: {
    laptop?: DeviceModelAsset;
    phone?: DeviceModelAsset;
  };
};

/** Supplied device models, prepared once and reused with each project's screen captures. */
export const portfolioDeviceModels: NonNullable<DeviceSceneLayout['models']> = {
  laptop: {
    src: '/models/laptop/laptop.glb',
    format: 'glb',
    screenName: 'LaptopScreen',
    screenFlipY: true,
    rotation: [25, -6, 0],
  },
  phone: {
    src: '/models/phone/phone.glb',
    format: 'glb',
    screenName: 'PhoneScreen',
    screenFlipY: true,
    rotation: [0, -10, 0],
  },
};
