import React from 'react'
import { Excel } from '../src/Excel'
import { IExcelState } from '../src/@types/state'
import formulaState from '../samples/formulas.json'
import { EditorState } from 'draft-js'
import { initialExcelState } from '../src/redux/store'
import { selectExcel } from '../src/redux/selectors'
import { updateWorkbookReference } from '../src/tools/formula'

const initialState: IExcelState = updateWorkbookReference({
  ...initialExcelState,
  ...selectExcel(JSON.parse(JSON.stringify(formulaState))),
  editorState: EditorState.createEmpty(),
})

export const Formulas: any = () => (
  <Excel key="formula" initialState={initialState} />
)
