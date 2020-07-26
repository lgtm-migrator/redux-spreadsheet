import { PayloadAction } from '@reduxjs/toolkit'
import { EditorState } from 'draft-js'
import { IExcelState, IEditorState } from '../../@types/state'
import {
  nSelectMergeCell,
  nSelectActiveSheet,
  nSelectActiveSheetData,
  nSelectActiveCell,
} from '../tools/selectors'
import { TYPE_TEXT, TYPE_MERGE } from '../../constants/types'
import {
  createEditorStateFromCell,
  getFontBlockEditorState,
} from '../../tools/cell'
import { updateActiveCellValueInPlace } from '../tools/cell'
import { getCellMapSetFromState } from '../tools/area'
import { updateReferenceCell } from '../../tools/formula'

export const CELL_KEY_DOWN_SHIFT = (state: IExcelState): IExcelState => {
  return state
}

export const CELL_KEY_DOWN = (state: IExcelState): IExcelState => {
  const activeSheet = nSelectActiveSheet(state)
  if (state.isEditMode || state.activeCellPosition.y >= activeSheet.rowCount)
    return state

  const mergeData = nSelectMergeCell(state)

  state.activeCellPosition.y = mergeData
    ? mergeData.end.y + 1
    : state.activeCellPosition.y + 1
  state.inactiveSelectionAreas = []
  state.selectionAreaIndex = -1
  state.selectionArea = undefined

  return state
}

export const CELL_KEY_UP_SHIFT = (state: IExcelState): IExcelState => {
  return state
}

export const CELL_KEY_UP = (state: IExcelState): IExcelState => {
  if (state.isEditMode || state.activeCellPosition.y < 2) return state

  const mergeData = nSelectMergeCell(state)

  state.activeCellPosition.y = mergeData
    ? mergeData.end.y - 1
    : state.activeCellPosition.y - 1
  state.inactiveSelectionAreas = []
  state.selectionAreaIndex = -1
  state.selectionArea = undefined

  return state
}

export const CELL_KEY_RIGHT_SHIFT = (state: IExcelState): IExcelState => {
  return state
}

export const CELL_KEY_RIGHT = (state: IExcelState): IExcelState => {
  const activeSheet = nSelectActiveSheet(state)
  if (state.isEditMode || state.activeCellPosition.x >= activeSheet.columnCount)
    return state

  const mergeData = nSelectMergeCell(state)

  state.activeCellPosition.x = mergeData
    ? mergeData.end.x + 1
    : state.activeCellPosition.x + 1
  state.inactiveSelectionAreas = []
  state.selectionAreaIndex = -1
  state.selectionArea = undefined

  return state
}

export const CELL_KEY_LEFT_SHIFT = (state: IExcelState): IExcelState => {
  return state
}

export const CELL_KEY_LEFT = (state: IExcelState): IExcelState => {
  if (state.isEditMode || state.activeCellPosition.x < 2) return state

  const mergeData = nSelectMergeCell(state)

  state.activeCellPosition.x = mergeData
    ? mergeData.end.x - 1
    : state.activeCellPosition.x - 1
  state.inactiveSelectionAreas = []
  state.selectionAreaIndex = -1
  state.selectionArea = undefined

  return state
}

export const CELL_EDITOR_STATE_UPDATE = (
  state: IExcelState,
  action: PayloadAction<IEditorState>
): IExcelState => {
  const editorState = action.payload
  state.editorState = editorState
  return state
}

export const CELL_EDITOR_STATE_START = (state: IExcelState): IExcelState => {
  if (state.isEditMode) return state

  state.isEditMode = true
  let editorState = EditorState.moveFocusToEnd(EditorState.createEmpty())

  const activeCell = nSelectActiveCell(state)

  if (activeCell && activeCell.style && activeCell.style.font)
    editorState = getFontBlockEditorState(editorState, activeCell.style.font)

  state.editorState = editorState

  return state
}

export const CELL_KEY_DELETE = (state: IExcelState): IExcelState => {
  if (state.isEditMode) return state

  const cellMapSet = getCellMapSetFromState(state)

  const data = nSelectActiveSheetData(state)

  for (const rowIndex in cellMapSet) {
    const columnIndices = cellMapSet[rowIndex]

    const row = data[rowIndex]

    if (row) {
      columnIndices.forEach((columnIndex) => {
        const cell = row[columnIndex]

        if (cell) {
          if (cell.type !== TYPE_MERGE) {
            cell.type = TYPE_TEXT
            delete cell.value
          }

          updateReferenceCell(
            state,
            {},
            cell,
            { x: columnIndex, y: +rowIndex },
            state.activeSheetName
          )
        }
      })
    }
  }

  return state
}

export const CELL_KEY_ENTER = (state: IExcelState): IExcelState => {
  if (state.isEditMode) {
    updateActiveCellValueInPlace(state)
    state.isEditMode = false
  }

  return state
}

export const CELL_KEY_ENTER_EXIT = (state: IExcelState): IExcelState => {
  state.isEditMode = true
  const cell = nSelectActiveCell(state)

  state.editorState = createEditorStateFromCell(cell, true)
  return state
}
