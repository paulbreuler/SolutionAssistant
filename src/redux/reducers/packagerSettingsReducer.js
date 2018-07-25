import {
  UPDATE_SINGLE_PACKAGER_SETTING,
  UPDATE_ALL_PACKAGER_SETTINGS,
  UPDATE_PACKAGER_PRESET
} from "../actions/packagerSettingsActions";
import update from "immutability-helper";
const ipcRenderer = window.require("electron").ipcRenderer;

const initialPreset = {
  presetName: "Default",
  action: "extract", // {Extract|Pack}
  zipFile: "", // <file path>
  zipFilePath: "",
  folder: "", // <folder path>
  packageType: "", // {Unmanaged|Managed|Both}
  allowWrite: "", // {Yes|No}
  allowDelete: "", // {Yes|No|Prompt}
  clobber: "",
  errorLevel: "", // {Yes|No|Prompt}
  map: "", // <file path>
  nologo: "",
  log: "", // <file path>
  sourceLoc: "", // <string>
  localize: ""
};

const initialState = {
  current: initialPreset,
  presets: {
    [initialPreset.presetName]: initialPreset
  }
};

// compare previous state to new state and update accordingly.
export default function packagerSettingsReducer(
  state = initialState,
  { type, payload }
) {
  switch (type) {
    case UPDATE_SINGLE_PACKAGER_SETTING:
      // Can you iterete in update?
      return update(state, {
        current: {
          [Object.keys(payload.packagerSettings)[0]]: {
            $set:
              payload.packagerSettings[Object.keys(payload.packagerSettings)[0]]
          }
        }
      });
    case UPDATE_ALL_PACKAGER_SETTINGS:
      return update(state, { current: { $set: payload.packagerSettings } });
    case UPDATE_PACKAGER_PRESET:
      if (state.presets[payload.packagerPreset.presetName]) {
        ipcRenderer.send("packagerPresets:update", payload.packagerPreset);
      } else {
        ipcRenderer.send("packagerPresets:insert", payload.packagerPreset);
      }
      return update(state, {
        presets: {
          [payload.packagerPreset.presetName]: { $set: payload.packagerPreset }
        }
      });
    default:
      return state;
  }
}
