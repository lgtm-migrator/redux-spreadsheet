import {
  EditorState,
  convertToRaw,
  RawDraftInlineStyleRange,
  RawDraftContentBlock,
  RawDraftContentState,
  DraftInlineStyleType,
  convertFromRaw,
  ContentState,
} from 'draft-js'
import {
  IRange,
  IRichTextValue,
  IFragment,
  IRichTextBlock,
  IInlineStyles,
  ICell,
} from '../../@types/state'
import uniqid from 'uniqid'
import { getElementaryRanges, mergeRanges } from './range'
import { IInlineStylesRange } from '../../@types/general'
import {
  TYPE_RICH_TEXT,
  TYPE_TEXT,
  TYPE_FORMULA,
  TYPE_NUMBER,
} from '../../constants/cellTypes'
import { exactNumberRegex } from '../../tools/regex'

export const getRangesFromInlineRanges = (
  inlineStyleRanges: RawDraftInlineStyleRange[]
): IRange[] =>
  inlineStyleRanges.reduce((acc, { offset, length }) => {
    acc.push({ start: offset, end: offset + length - 1 })
    return acc
  }, [] as Array<IRange>)

export const getTextFromRichText = (richText: IRichTextValue): string => {
  let text = ''

  for (const block of richText) {
    const blockFragments = block.fragments
    for (let i = 0; i < blockFragments.length; i++) {
      text += blockFragments[i].text
    }
  }

  return text
}

export const updateStyleInPlace = (
  inlineRange: RawDraftInlineStyleRange,
  styles: IInlineStyles
): void => {
  switch (inlineRange.style) {
    case 'BOLD':
      styles.fontWeight = 'bold'
      break
    case 'ITALIC':
      styles.fontStyle = 'italic'
      break
    case 'STRIKETHROUGH':
      if (styles.textDecoration) {
        styles.textDecoration += ' line-through'
      } else {
        styles.textDecoration = 'line-through'
      }
      break
    case 'UNDERLINE':
      if (styles.textDecoration) {
        styles.textDecoration += ' underline'
      } else {
        styles.textDecoration = 'underline'
      }
      break

    default:
      break
  }
}

export const createValueFromEditorState = (
  editorState: EditorState
): Partial<ICell> => {
  const richText: IRichTextValue = []

  const rawBlocks = convertToRaw(editorState.getCurrentContent()).blocks

  for (const rawBlock of rawBlocks) {
    const blockFragments: IFragment[] = []
    const mergedRanges = getElementaryRanges(
      getRangesFromInlineRanges(rawBlock.inlineStyleRanges),
      rawBlock.text.length
    )

    const inlineStyleRanges = rawBlock.inlineStyleRanges

    for (const mergedRange of mergedRanges) {
      const { start, end } = mergedRange

      const fragment: IFragment = {
        key: uniqid(),
        text: rawBlock.text.substring(start, end + 1),
      }

      for (let i = 0; i < inlineStyleRanges.length; i++) {
        const inlineRange = inlineStyleRanges[i]
        const inlineStart = inlineRange.offset
        const inlineEnd = inlineStart + inlineRange.length - 1

        if (inlineStart <= start && end <= inlineEnd) {
          if (!fragment.styles) fragment.styles = {}

          updateStyleInPlace(inlineRange, fragment.styles)
        }
      }

      blockFragments.push(fragment)
    }

    richText.push({ key: uniqid(), fragments: blockFragments })
  }

  let isRichText = richText.length > 1

  for (const block of richText) {
    for (const fragment of block.fragments) {
      if (fragment.styles) isRichText = true
    }
  }

  const cell: ICell = {}

  const text = getTextFromRichText(richText)

  if (isRichText) {
    cell.value = richText
    cell.type = TYPE_RICH_TEXT
  } else if (text.includes('=')) {
    cell.value = text.substring(1)
    cell.type = TYPE_FORMULA
  } else if (text.match(exactNumberRegex)) {
    cell.value = +text
    cell.type = TYPE_NUMBER
  } else {
    cell.value = text
    cell.type = TYPE_TEXT
  }

  return cell
}

export const getRichTextBlockText = (block: IRichTextBlock): string => {
  let text = ''

  const fragments = block.fragments
  for (const fragment of fragments) {
    text += fragment.text
  }

  return text
}

// Currently the fragment styles are in elementary ranges, unlike overlapping ranges.. may not matter at all
export const getRawInlineStyleRangesFromRichTextBlock = (
  block: IRichTextBlock
): { text: string; inlineStyleRanges: RawDraftInlineStyleRange[] } => {
  // Any fragment with style is an inline style
  const inlineStyleRanges: RawDraftInlineStyleRange[] = []
  let text = ''

  const fragments = block.fragments

  const data: IInlineStylesRange = {
    BOLD: [],
    ITALIC: [],
    STRIKETHROUGH: [],
    UNDERLINE: [],
  }

  let previousOffset = -1

  for (const fragment of fragments) {
    const start = previousOffset + 1
    let end = start

    if (fragment.text) {
      text += fragment.text
      end = text.length - 1
    }

    previousOffset = end

    const range: IRange = { start, end }

    if (fragment.styles) {
      const {
        fontWeight,
        // fontFamily,
        // fontSize,
        fontStyle,
        textDecoration,
        // verticalAlign,
        // color
      } = fragment.styles

      if (fontWeight === 'bold') {
        data.BOLD.push(range)
      }

      if (fontStyle === 'italic') {
        data.ITALIC.push(range)
      }

      if (textDecoration) {
        if (textDecoration.includes('underline')) {
          data.UNDERLINE.push(range)
        }

        if (textDecoration.includes('line-through')) {
          data.STRIKETHROUGH.push(range)
        }
      }
    }
  }

  for (const style in data) {
    const ranges = mergeRanges(data[style])

    for (const range of ranges) {
      const length = range.end - range.start + 1
      inlineStyleRanges.push({
        offset: range.start,
        length,
        style: style as DraftInlineStyleType,
      })
    }
  }

  return { text, inlineStyleRanges }
}

export const createRawContentBlockFromRichTextBlock = (
  block: IRichTextBlock
): RawDraftContentBlock => {
  const { inlineStyleRanges, text } = getRawInlineStyleRangesFromRichTextBlock(
    block
  )
  return {
    key: uniqid(),
    type: 'unstyled',
    text,
    depth: 0,
    entityRanges: [],
    inlineStyleRanges,
  }
}

export const getRawContentStateFromRichText = (
  richText: IRichTextValue
): RawDraftContentState => ({
  blocks: richText.map((block) =>
    createRawContentBlockFromRichTextBlock(block)
  ),
  entityMap: {},
})

export const createEditorStateFromRichText = (
  value: IRichTextValue
): EditorState =>
  EditorState.moveFocusToEnd(
    EditorState.createWithContent(
      convertFromRaw(getRawContentStateFromRichText(value))
    )
  )

export const createEditorStateFromText = (value: string): EditorState =>
  EditorState.moveFocusToEnd(
    EditorState.createWithContent(ContentState.createFromText(value))
  )

export const createEmptyEditorState = (): EditorState =>
  EditorState.moveFocusToEnd(EditorState.createEmpty())
