export type AppState = 'upload' | 'loading' | 'editor' | 'exporting'

export type EditorTool = 
  | 'select' 
  | 'text' 
  | 'links' 
  | 'forms' 
  | 'images' 
  | 'sign' 
  | 'whiteout' 
  | 'annotate' 
  | 'shape-rect'
  | 'shape-circle'
  | 'shape-line'
  | 'shape-arrow'

export type ShapeType = 'ellipse' | 'rect' | 'line' | 'arrow'
export type AnnotateMode = 'highlight' | 'strikeout' | 'underline' | 'freehand-highlight' | 'freehand-draw'
export type FormFieldType = 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'signbox'

export interface PageThumbnail {
  id: string
  pageNum: number
  thumbnailUrl: string
  width: number
  height: number
  pageRef: any
  rotation: number
}
