'use strict'

const { EventEmitter } = require('events')

/**
 * Engine 事件总线
 *
 * 设计目的：
 * - 解耦 EngineService 与 AutoFlow 等上层功能
 * - 对外提供统一的“消息流事件”，用于等待/匹配对端消息、记录发送/回包等
 *
 * 事件约定：
 * - 事件名：engine:message
 * - payload:
 *   - name: string 引擎名称
 *   - direction: 'in' | 'out' 方向（收到/发送）
 *   - kind: 'recv' | 'send' | 'reply' 类型（被动收到/主动发送/主动发送的同步回包）
 *   - msg: SecsMessage 原始 secs4js 消息对象（仅在主进程内部使用）
 *   - sml: string 可读 SML 文本（用于日志/调试）
 *   - ts: number 时间戳（ms）
 */
const engineBus = new EventEmitter()

module.exports = {
  engineBus
}

