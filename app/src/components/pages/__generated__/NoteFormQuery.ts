/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NoteFormQuery
// ====================================================

export interface NoteFormQuery_deck {
  __typename: "Deck";
  /**
   * Deck id
   */
  id: string;
  /**
   * Title of the deck
   */
  title: string;
}

export interface NoteFormQuery_models_fields {
  __typename: "Field";
  /**
   * Field id
   */
  id: string;
  /**
   * Name of the field
   */
  name: string;
}

export interface NoteFormQuery_models {
  __typename: "Model";
  /**
   * Card model id
   */
  id: string;
  /**
   * Name of this card model (e.g. "Basic", "Basic with Reversed")
   */
  name: string | null;
  /**
   * Fields associated with this model
   */
  fields: NoteFormQuery_models_fields[];
}

export interface NoteFormQuery {
  /**
   * Get single deck
   */
  deck: NoteFormQuery_deck | null;
  /**
   * Retrieve all models for the logged user
   */
  models: NoteFormQuery_models[];
}

export interface NoteFormQueryVariables {
  slug: string;
}
