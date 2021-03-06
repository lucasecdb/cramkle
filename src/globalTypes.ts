/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

/**
 * Type of error
 */
export enum Error {
  authentication = "authentication",
  badInput = "badInput",
  serverError = "serverError",
}

export enum FlashCardAnswer {
  EASY = "EASY",
  GOOD = "GOOD",
  HARD = "HARD",
  REPEAT = "REPEAT",
}

export enum FlashCardStatus {
  LEARNING = "LEARNING",
  NEW = "NEW",
  REVIEW = "REVIEW",
}

export interface BlockInput {
  key: string;
  type: string;
  text: string;
  depth: number;
  inlineStyleRanges: InlineStyleRangeInput[];
  entityRanges: EntityRangeInput[];
  data?: any | null;
}

export interface ContentStateInput {
  blocks: BlockInput[];
  entityMap?: any | null;
}

export interface EntityRangeInput {
  key: number;
  length: number;
  offset: number;
}

export interface FieldInput {
  id?: string | null;
  name?: string | null;
}

export interface FieldValueInput {
  data?: ContentStateInput | null;
  field?: FieldInput | null;
}

export interface InlineStyleRangeInput {
  style: string;
  length: number;
  offset: number;
}

export interface TemplateInput {
  name: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
