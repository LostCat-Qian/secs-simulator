# electron/service/ 开发指南

**Generated:** 2026-01-12

## OVERVIEW
Core business logic layer handling SECS/GEM engine management, SML files, auto-reply scripts, and automation workflows.

## STRUCTURE

| Service | Lines | Responsibility |
|---------|-------|----------------|
| engine.js | 634 | SECS/GEM engine lifecycle (HSMS/SECS-I), message handling, reply priority |
| autoflow.js | 648 | Automation flow execution (send/wait/delay/log steps), pause/resume/stop |
| smlFile.js | 344 | SML file tree CRUD, recursive directory operations |
| autoReply.js | 265 | Script CRUD, matching logic for auto-reply handler discovery |
| eventBind.js | 280 | GEM event binding generation (S2F33/S2F35/S2F37), TOML parsing |
| engineBus.js | 28 | Event bus for engine message stream (decoupling layer) |
| funcExcutor.js | 25 | Dynamic function execution from string (sandboxed script runner) |
| pathHelper.js | 31 | Cross-env path resolution (dev vs packaged) |

## WHERE TO LOOK

- **Message reply priority chain**: `engine.js:259-336` - Script → File → Default L()
- **SML file parsing**: `engine.js:18` imports `SmlParser` from `secs4js`
- **AutoFlow validation**: `autoflow.js:66-128` - strict schema validation before execution
- **Service instance pattern**: Every service exports both class and singleton: `module.exports = { XxxService, xxxService: new XxxService() }`
- **Path handling**: `pathHelper.js` resolves resources differently for dev (`projectRoot/dir`) vs packaged (`exeSibling/dir`)

## CONVENTIONS

```javascript
'use strict'

// Import shared utilities
const { logger } = require('ee-core/log')
const { getExtraResourceDir } = require('./pathHelper')
const { L, SmlParser } = require('secs4js')  // secs4js for SECS messages

// Class-based service
class XxxService {
  /**
   * Method with JSDoc
   * @param {Object} args - 参数对象
   * @param {String} args.key - 参数说明
   * @returns {Object} 返回结果
   */
  async method(args) {
    const { key } = args || {}
    if (!key) {
      logger.error('❌ [method] Key is empty')
      throw new Error('Key 不能为空')
    }

    try {
      // Implementation
      logger.info('✅ [method] Success')
      return { success: true, message: '操作成功' }
    } catch (error) {
      logger.error('❌ [method] Failed:', error)
      throw new Error(`操作失败: ${error.message}`)
    }
  }
}

// Export pattern: class + singleton + toString
XxxService.toString = () => '[class XxxService]'
module.exports = { XxxService, xxxService: new XxxService() }
```

### Logging Style
- Entry points: `logger.info('🔍 [method] Action:', value)`
- Success: `logger.info('✅ [method] Success')`
- Error: `logger.error('❌ [method] Error:', error)`
- Debug: `logger.debug('📌 [method] Detail:', value)`

### Path Resolution
Always use `getExtraResourceDir('dirName')` for cross-env compatibility:
- Dev: `<projectRoot>/dirName`
- Packaged: `<exeSibling>/dirName`

### Error Messages
Use Chinese with context: `throw new Error('Key 不能为空')` or `throw new Error(\`操作失败: ${error.message}\`)`

## ANTI-PATTERNS

- ❌ Mixing dev/packaged path logic directly in services - use `pathHelper.getExtraResourceDir()`
- ❌ Empty catch blocks without logging or re-throwing
- ❌ Direct synchronous file operations - always use `fs.promises` API
- ❌ Missing validation before file operations (check path emptiness, existence first)
- ❌ Returning raw errors to frontend - always wrap in custom error messages with context
- ❌ Not using event bus (`engineBus`) for message stream - avoid tight coupling between engine and listeners
- ❌ Global state mutations without cleanup - ensure event listeners are removed in `finally` blocks
- ❌ Inconsistent parameter structure - always use `{ key: value }` args object, never positional
