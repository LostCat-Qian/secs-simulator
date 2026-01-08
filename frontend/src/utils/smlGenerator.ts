/**
 * SML Generator - TOML validation utilities for EventBind configuration
 *
 * Note: SML generation is now handled by the backend service using secs4js
 * This file only provides TOML validation and default templates
 */

import toml from 'toml'

export interface DefineLinkConfig {
  ceidRptidBinding: Record<string, string>
  rptidCeidBinding: Record<string, string>
}

/**
 * Validate TOML configuration format for EventBind
 * Checks for required sections and proper structure
 * @param tomlContent TOML format string
 * @returns Validation result with success flag and optional error message
 */
export function validateDefineLinkToml(tomlContent: string): { valid: boolean; error?: string } {
  try {
    const parsed = toml.parse(tomlContent)

    // Check for required sections
    if (!parsed.CEID_RPTID_BINDING && !parsed.RPTID_CEID_BINDING) {
      return { valid: false, error: 'Missing required sections: CEID_RPTID_BINDING and/or RPTID_CEID_BINDING' }
    }

    // Validate section types
    if (parsed.CEID_RPTID_BINDING && typeof parsed.CEID_RPTID_BINDING !== 'object') {
      return { valid: false, error: 'CEID_RPTID_BINDING must be a key-value mapping' }
    }

    if (parsed.RPTID_CEID_BINDING && typeof parsed.RPTID_CEID_BINDING !== 'object') {
      return { valid: false, error: 'RPTID_CEID_BINDING must be a key-value mapping' }
    }

    return { valid: true }
  } catch (error: any) {
    return { valid: false, error: `TOML parse error: ${error.message}` }
  }
}

/**
 * Default template for DefineLink TOML configuration
 */
export const DEFAULT_DEFINE_LINK_TEMPLATE = `# DefineLink Configuration Template
# Format: CEID_RPTID_BINDING section maps Collection Event IDs to Report IDs
# Format: RPTID_CEID_BINDING section shows which CEIDs use each RPTID (for reference)

[CEID_RPTID_BINDING]
# CEID = RPTID
# Example: When CEID 1001 occurs, send Report 2001
1001 = 2001
1002 = 3001
1003 = 2001

[RPTID_CEID_BINDING]
# RPTID = CEID (optional - shows reference mapping)
# Example: Report 2001 is sent when CEID 2004 occurs
2001 = 2004
3001 = 2001
`
