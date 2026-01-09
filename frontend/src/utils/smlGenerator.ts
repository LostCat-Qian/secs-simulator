/**
 * SML Generator - TOML validation utilities for EventBind configuration
 *
 * Note: SML generation is now handled by the backend service using secs4js
 * This file only provides TOML validation and default templates
 */

import toml from 'toml'

export interface DefineLinkConfig {
  ceidRptidBinding: Record<string, string[]>
  rptidCeidBinding: Record<string, string[]>
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

# value is an array of Report IDs
[CEID_RPTID_BINDING]
# CEID = RPTID
1001 = [2001, 2002]
1002 = [2002, 3001]
1003 = [2001]

# value is an array of Collection Event IDs
[RPTID_CEID_BINDING]
# RPTID = CEID (optional - shows reference mapping)
2001 = [2004]
2002 = [2005]
3001 = [2001]
`
