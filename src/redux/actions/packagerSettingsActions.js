export const UPDATE_SINGLE_PACKAGER_SETTING = "packagerSettings:UpdateSingle";
export const UPDATE_ALL_PACKAGER_SETTINGS = "packagerSettings:UpdateAll";
export const UPDATE_PACKAGER_PRESET = "packagerPresets:UpdateSingle";

export function updatePackagerSetting(packagerSettings) {
  return {
    type: UPDATE_SINGLE_PACKAGER_SETTING,
    payload: {
      // Payload is the package settings object so only pass
      // the children of packagerSettings children.
      packagerSettings
    }
  };
}

export function updateAllPackagerSettings(packagerSettings) {
  return {
    type: UPDATE_ALL_PACKAGER_SETTINGS,
    payload: {
      packagerSettings
    }
  };
}

export function updatePackagerPreset(packagerPreset) {
  return {
    type: UPDATE_PACKAGER_PRESET,
    payload: {
      packagerPreset
    }
  };
}
