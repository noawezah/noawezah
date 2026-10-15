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
  /** Physical display aspect ratio for fitting the complete capture without cropping. */
  screenAspect?: number;
  /** Safe display margins as [top, right, bottom, left] fractions. */
  screenInsets?: readonly [number, number, number, number];
  /** Display colour outside the fitted capture, such as a dark camera safe area. */
  screenBackground?: string;
  /** Room lighting and a subdued device finish; display colors remain unchanged. */
  lighting?: {
    ambient?: number;
    key?: number;
    fill?: number;
    keyColor?: string;
    fillColor?: string;
    keyPosition?: readonly [number, number, number];
    bodyTint?: string;
    exposure?: number;
  };
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
    src: '/models/laptop/laptop-screen-fit.glb',
    format: 'glb',
    screenName: 'LaptopScreen',
    screenFlipY: true,
    screenAspect: 1.6024755814,
    screenInsets: [0, 0, 0, 0],
    screenBackground: '#080a08',
    rotation: [0, 18, 0],
    lighting: {
      ambient: 1.1, key: 1.5, fill: .25,
      keyColor: '#fff3de', fillColor: '#c3c0dd', keyPosition: [-3, 5, 4],
      bodyTint: '#585c60', exposure: .95,
    },
  },
  phone: {
    src: '/models/phone/phone.glb',
    format: 'glb',
    screenName: 'PhoneScreen',
    screenFlipY: true,
    screenAspect: .462015622,
    screenInsets: [.065, .015, .015, .015],
    screenBackground: '#080a08',
    rotation: [0, -18, 0],
    lighting: { ambient: 1.1, key: 1.5, fill: .25, exposure: .95 },
  },
};
