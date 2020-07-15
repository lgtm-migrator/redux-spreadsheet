import React, {
  useCallback,
  Fragment,
  FunctionComponent,
  CSSProperties,
} from 'react'
import { Editor, RichUtils, EditorState } from 'draft-js'
import { useTypedSelector } from '../../redux/redux'
import { shallowEqual, useDispatch } from 'react-redux'
import {
  INormalActiveCellProps,
  IEditorCellProps,
  ICommonPaneProps,
} from '../../@types/components'
import {
  selectIsEditMode,
  selectCellEditorState,
  selectActiveCellAreaBottomLeftStyle,
  selectActiveCellAreaBottomRightStyle,
  selectActiveCellAreaTopLeftStyle,
  selectActiveCellAreaTopRightStyle,
  selectIsActiveCellInBottomLeftPane,
  selectIsActiveCellInBottomRightPane,
  selectIsActiveCellInTopLeftPane,
  selectIsActiveCellInTopRightPane,
} from '../../redux/selectors'
import { ExcelActions } from '../../redux/store'

const EditorCell: FunctionComponent<IEditorCellProps> = ({ style }) => {
  const dispatch = useDispatch()

  const editorState = useTypedSelector(
    (state) => selectCellEditorState(state),
    shallowEqual
  )

  const handleChange = useCallback(
    (editorState) =>
      dispatch(ExcelActions.CELL_EDITOR_STATE_UPDATE(editorState)),
    [dispatch]
  )

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)

    if (newState) {
      handleChange(newState)
      return 'handled'
    }

    return 'not-handled'
  }

  return (
    <div className="cell__active cell__active--edit" style={style}>
      <Editor
        editorState={editorState}
        onChange={handleChange}
        handleKeyCommand={handleKeyCommand}
      />
    </div>
  )
}

const NormalActiveCell = ({ style }: INormalActiveCellProps) => {
  return <div className="cell__active cell__active--normal" style={style} />
}

const ActiveCell: FunctionComponent<ICommonPaneProps> = ({ type }) => {
  const { isEditMode, style, isInCorrectPane } = useTypedSelector((state) => {
    let style: CSSProperties
    let isInCorrectPane: boolean

    switch (type) {
      case 'BOTTOM_LEFT':
        style = selectActiveCellAreaBottomLeftStyle(state)
        isInCorrectPane = selectIsActiveCellInBottomLeftPane(state)
        break
      case 'BOTTOM_RIGHT':
        style = selectActiveCellAreaBottomRightStyle(state)
        isInCorrectPane = selectIsActiveCellInBottomRightPane(state)
        break
      case 'TOP_LEFT':
        style = selectActiveCellAreaTopLeftStyle(state)
        isInCorrectPane = selectIsActiveCellInTopLeftPane(state)
        break
      case 'TOP_RIGHT':
        style = selectActiveCellAreaTopRightStyle(state)
        isInCorrectPane = selectIsActiveCellInTopRightPane(state)
        break
    }

    return {
      isEditMode: selectIsEditMode(state),
      style,
      isInCorrectPane,
    }
  }, shallowEqual)

  if (!isInCorrectPane) return <Fragment />

  return isEditMode ? (
    <EditorCell style={style} />
  ) : (
    <NormalActiveCell style={style} />
  )
}

export default ActiveCell
