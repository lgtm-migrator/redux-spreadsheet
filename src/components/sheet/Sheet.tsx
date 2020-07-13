import React, { useEffect, useRef, FunctionComponent } from 'react'
import { VariableSizeGrid } from 'react-window'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { useTypedSelector } from '../../redux/redux'
import Cell from './Cell'
import {
  selectData,
  selectGetRowHeight,
  selectGetColumnWidth,
  selectColumnWidthsAdjusted,
  selectTableRowCount,
  selectTableColumnCount,
  selectTableFreezeRowCount,
  selectTableFreezeColumnCount,
  selectActiveResults,
  selectResults,
} from '../../redux/selectors'
import BottomRightPane from './BottomRightPane'
import { shallowEqual } from 'react-redux'
import TopLeftPane from './TopLeftPane'
import TopRightPane from './TopRightPane'
import BottomLeftPane from './BottomLeftPane'
import { ContextMenuTrigger } from 'react-contextmenu'
import CustomContextMenu from './CustomContextMenu'

export const Sheet: FunctionComponent<Size> = ({ height, width }) => {
  const gridRef = useRef<VariableSizeGrid>(null)
  const {
    results,
    sheetResults,
    tableColumnCount,
    tableRowCount,
    data,
    getColumnWidth,
    getRowHeight,
    tableFreezeColumnCount,
    tableFreezeRowCount,
    columnWidthsAdjusted,
  } = useTypedSelector(
    (state) => ({
      results: selectResults(state),
      sheetResults: selectActiveResults(state),
      tableColumnCount: selectTableColumnCount(state),
      tableRowCount: selectTableRowCount(state),
      data: selectData(state),
      getColumnWidth: selectGetColumnWidth(state),
      getRowHeight: selectGetRowHeight(state),
      tableFreezeRowCount: selectTableFreezeRowCount(state),
      tableFreezeColumnCount: selectTableFreezeColumnCount(state),
      columnWidthsAdjusted: selectColumnWidthsAdjusted(state),
    }),
    shallowEqual
  )

  const itemData = { data, columnWidthsAdjusted, getRowHeight, sheetResults }

  useEffect(() => {
    const current = gridRef.current

    if (current) current.resetAfterIndices({ columnIndex: 0, rowIndex: 0 })
  }, [getColumnWidth, getRowHeight])

  return (
    <div className="sheetGrid" tabIndex={-1}>
      <VariableSizeGrid
        ref={gridRef}
        columnCount={tableColumnCount}
        columnWidth={getColumnWidth}
        height={height}
        rowCount={tableRowCount}
        rowHeight={getRowHeight}
        width={width}
        itemData={itemData}
        freezeColumnCount={tableFreezeColumnCount}
        freezeRowCount={tableFreezeRowCount}
        extraTopLeftElement={<TopLeftPane key="top-left-pane" />}
        extraTopRightElement={<TopRightPane key="top-right-pane" />}
        extraBottomLeftElement={<BottomLeftPane key="bottom-left-pane" />}
        extraBottomRightElement={<BottomRightPane key="bottom-right-pane" />}
      >
        {Cell}
      </VariableSizeGrid>
    </div>
  )
}

const SheetSizer: FunctionComponent<Size> = ({ height, width }) => (
  <ContextMenuTrigger id="react-context-menu">
    <Sheet height={height} width={width} />
  </ContextMenuTrigger>
)

const SheetContainer: FunctionComponent = () => (
  <div className="sheet">
    <AutoSizer children={SheetSizer} />
    <CustomContextMenu />
  </div>
)

export default SheetContainer
