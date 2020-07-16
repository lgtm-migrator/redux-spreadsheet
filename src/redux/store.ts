import { createSlice } from '@reduxjs/toolkit'
import { undox } from 'undox'
import {
  CELL_MOUSE_DOWN,
  CELL_MOUSE_ENTER,
  CELL_MOUSE_UP,
  CELL_MOUSE_DOWN_SHIFT,
  CELL_MOUSE_DOWN_CTRL,
  CELL_DOUBLE_CLICK,
} from './reducers/mouse/cell'
import {
  CELL_KEY_DOWN,
  CELL_KEY_UP,
  CELL_KEY_RIGHT,
  CELL_KEY_LEFT,
  CELL_EDITOR_STATE_UPDATE,
  CELL_EDITOR_STATE_START,
  CELL_KEY_DELETE,
} from './reducers/keyboard/cell'
import { UPDATE_STATE } from './reducers/events'
import {
  CHANGE_SHEET,
  CHANGE_SHEET_ORDER,
  ADD_SHEET,
  REMOVE_SHEET,
  OPEN_SHEET_NAVIGATION_OPTION,
  CLOSE_SHEET_NAVIGATION_OPTION,
  CHANGE_SHEET_NAME_TEXT,
  ENABLE_SHEET_NAME_EDIT,
  DISABLE_SHEET_NAME_EDIT,
  CHANGE_ACTIVE_SHEET_NAME,
  RESET_SHEET_NAME_EDIT,
} from './reducers/sheet'
import { createInitialExcelState } from './tools/state'
import { SELECT_ALL } from './reducers/keyboard/operations'

export const initialExcelState = createInitialExcelState()

export const ExcelStore = createSlice({
  name: 'EXCEL',
  initialState: initialExcelState,
  reducers: {
    CELL_MOUSE_DOWN,
    CELL_MOUSE_ENTER,
    CELL_MOUSE_UP,
    CELL_MOUSE_DOWN_SHIFT,
    CELL_MOUSE_DOWN_CTRL,
    CELL_KEY_DOWN,
    CELL_KEY_UP,
    CELL_KEY_RIGHT,
    CELL_KEY_LEFT,
    CELL_KEY_DELETE,
    CELL_DOUBLE_CLICK,
    CELL_EDITOR_STATE_UPDATE,
    CELL_EDITOR_STATE_START,
    UPDATE_STATE,
    CHANGE_SHEET,
    CHANGE_SHEET_ORDER,
    ADD_SHEET,
    OPEN_SHEET_NAVIGATION_OPTION,
    CLOSE_SHEET_NAVIGATION_OPTION,
    REMOVE_SHEET,
    SELECT_ALL,
    CHANGE_SHEET_NAME_TEXT,
    CHANGE_ACTIVE_SHEET_NAME,
    ENABLE_SHEET_NAME_EDIT,
    DISABLE_SHEET_NAME_EDIT,
    RESET_SHEET_NAME_EDIT,
  },
})

export const ExcelActions = ExcelStore.actions

const ignoredActionsMap = {
  [ExcelActions.CELL_MOUSE_ENTER.type]: true,
  [ExcelActions.CELL_KEY_DOWN.type]: true,
  [ExcelActions.CELL_KEY_UP.type]: true,
  [ExcelActions.CELL_KEY_RIGHT.type]: true,
  [ExcelActions.CELL_KEY_LEFT.type]: true,
  [ExcelActions.CELL_MOUSE_DOWN_CTRL.type]: true,
  [ExcelActions.CELL_MOUSE_DOWN_SHIFT.type]: true,
  [ExcelActions.CELL_MOUSE_UP.type]: true,
  [ExcelActions.CELL_MOUSE_DOWN.type]: true,
  [ExcelActions.CELL_EDITOR_STATE_UPDATE.type]: true,
  [ExcelActions.CELL_DOUBLE_CLICK.type]: true,
  [ExcelActions.CELL_EDITOR_STATE_START.type]: true,
  [ExcelActions.UPDATE_STATE.type]: true,
}

const UndoxExcelStore = undox(
  ExcelStore.reducer,
  undefined,
  undefined,
  ignoredActionsMap
)

export default UndoxExcelStore
