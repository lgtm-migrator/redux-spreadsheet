import { IExcelState } from '../../@types/state'
import { nSelectActiveSheet, nSelectActiveCell } from './selectors'
import { createValueFromCellAndEditorState } from '../../tools/text'
import { updateActiveCellRef } from '../../tools/formula/formula'

export const updateActiveCellValueInPlace = (state: IExcelState): void => {
  const cellValue = createValueFromCellAndEditorState(
    nSelectActiveCell(state),
    state.editorState
  )

  const activeSheet = nSelectActiveSheet(state)
  const { x, y } = state.activeCellPosition

  if (!activeSheet.data[y]) activeSheet.data[y] = {}
  if (!activeSheet.data[y][x]) activeSheet.data[y][x] = {}

  activeSheet.data[y][x] = cellValue

  updateActiveCellRef(
    state.activeSheetName,
    state.activeCellPosition,
    state.sheetsMap,
    state.dependentReferences,
    state.independentReferences,
    state.results
  )
}
