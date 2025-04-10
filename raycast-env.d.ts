/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Host (memo >= 0.22.0) - Your memo website domain. */
  "host"?: string,
  /** Token (memo >= 0.22.0) - Your token can be found in memo settings. */
  "token"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `sendMemo` command */
  export type SendMemo = ExtensionPreferences & {}
  /** Preferences accessible in the `openMemoWebsite` command */
  export type OpenMemoWebsite = ExtensionPreferences & {}
  /** Preferences accessible in the `sendMemoForm` command */
  export type SendMemoForm = ExtensionPreferences & {}
  /** Preferences accessible in the `memosList` command */
  export type MemosList = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `sendMemo` command */
  export type SendMemo = {
  /** Text */
  "text": string
}
  /** Arguments passed to the `openMemoWebsite` command */
  export type OpenMemoWebsite = {}
  /** Arguments passed to the `sendMemoForm` command */
  export type SendMemoForm = {}
  /** Arguments passed to the `memosList` command */
  export type MemosList = {
  /** Search Memo */
  "text": string
}
}

