<div align=center>
<center><h1>secs-simulator<h1></center>
<div align=center>
<img src="./public/images/logo.png" width="150" height="150" />
</div>
<center><h3>Special Thanks<h3></center>
</div>
<br>

<div align=center>
<img src="./public/images/example/logo.png" width="150" height="150" />
</div>

<div align=center>
<h3><strong>An easy-to-start, cross-platform, enterprise-grade desktop software development framework</strong></h3>
</div>
<br>

# 1. Introduction

`secs-simulator` is a visually appealing, easy-to-use tool with high flexibility in auto-reply for SECS/GEM testing and device simulation.

Built on `electron-egg`, using `arco-design-vue` as the UI component library and `secs4js` as the SECS/GEM communication library.

Core Dependencies:

- [`electron-egg`](https://github.com/dromara/electron-egg): A desktop application framework built on `electron`.
- [`arco-design-vue`](https://github.com/arco-design/arco-design-vue): A Vue component library by ByteDance, providing rich UI components.
- [`secs4js`](https://github.com/LostCat-Qian/secs4js): A SECS/GEM communication library built on TypeScript for implementing SECS/GEM protocol communication.

<div align=center>
<img src="./README_IMAGES/index.png" width="800" height="500" />
</div>

## 1.1 Communication with SECS/GEM Simulators

`SEComSimulator`:
<div align=center>
<img src="./README_IMAGES/communicate-with-SEComSimulator.png" width="800" height="500" />
</div>

`FASTSim`:
<div align=center>
<img src="./README_IMAGES/communicate-with-FASTSim.png" width="800" height="500" />
</div>

# 2. Core Features

## 2.1 Engines

You can create and manage SECS/GEM engines through the `Engines` module. Each engine can be configured to communicate with different devices.

Main Features:

- Support for creating multiple SECS/GEM engine instances.
- Each engine instance can be configured to communicate with different devices.
- Support for configuring engine connection parameters such as IP address, port number, etc.
- Support for starting and stopping engine communication.

## 2.2 SML File

You can load and parse SECS/GEM protocol SML files through the `SML File` module. SML files are text files used to describe SECS/GEM protocols, typically used to define device functionality and communication parameters.

Main Features:

- Support for viewing and editing SML file content.
- Support for generating corresponding SECS/GEM protocol code from SML files.

## 2.3 LogPanel

You can view SECS/GEM engine communication logs through the `LogPanel` module. The log panel displays communication details between the engine and device, including sent messages, received messages, etc.

Main Features:

- Support for viewing SECS/GEM engine communication logs.
- Automatic log saving to the `secs-logs` folder in the root directory.

## 2.4 AutoReply

You can configure automatic replies for SECS/GEM engines through the `AutoReply` module. The auto-reply feature can automatically reply with predefined messages based on messages sent by the device.

Supports three automatic reply mechanisms (sorted by priority):

1. Priority-based reply using AutoReply Scripts
2. Next, based on reply rules in SML File, automatically search for files named `S{stream}F{func + 1}`, parse the SML, and auto-reply.
3. If neither mechanism is triggered, use default reply (S stream F func+1)

## 2.5 AutoReply Scripts

You can configure automatic reply scripts for SECS/GEM engines through the `AutoReply Scripts` module. Auto-reply scripts are JavaScript-based scripts used to automatically reply with predefined messages based on messages sent by the device.

Main Features:

- Support for viewing and editing AutoReply Scripts content.
- Support for parsing corresponding SECS/GEM SML code from SML files using AutoReply Scripts.

# 3. How to Use

## 3.1 Start the Application

You will see the main application interface:

<div align=center>
<img src="./README_IMAGES/index.png" width="800" height="500" />
</div>

## 3.2 Configure Engine

Supports three communication modes:

- HSMS-SS
- SECS-I
- SECS-I On TCP/IP

<div align=center>
<img src="./README_IMAGES/engine-config.png" width="800" height="500" />
</div>

## 3.3 Open Engine

After configuration, click the `Open` button to open the engine.

<div align=center>
<img src="./README_IMAGES/open-engine.png" width="800" height="500" />
</div>

## 3.4 Send Messages

After configuration, click the `Send` button to send messages to the device.

<div align=center>
<img src="./README_IMAGES/send.png" width="800" height="500" />
</div>

## 3.5 Configure AutoReply Scripts

AutoReply Scripts are JavaScript-based scripts used to automatically reply with predefined messages based on messages sent by the device.

<div align=center>
<img src="./README_IMAGES/autoreply-scripts.png" width="800" height="500" />
</div>

The default method name is `handler(comingMsg, filePaths)`, with parameter meanings as follows:

1. `comingMsg`: The message sent to this engine by the device, which is a `SecsMessage` object.
2. `filePaths`: The relative paths of all local SML files.

Additionally, the tool provides a method `getMsgByFilePath(filePath: string)` to obtain the corresponding SECS/GEM message object based on the SML file path. This method returns a `SecsMessage` object parsed from the SML text, which you can manipulate as needed.

Example:

```javascript
/**
 * Auto reply handler
 * use getMsgByFilePath(filePath) to get sml message object
 * @param {object} comingMsg args: stream, func, wBit, body(example: body[0][1].value)
 * @param {number} comingMsg.stream
 * @param {number} comingMsg.func
 * @param {boolean} comingMsg.wBit
 * @param {object} comingMsg.body
 * @param {string[]} filePaths args: sml files directory paths
 * @returns {string} sml file path
 */
async function handler(comingMsg, filePaths) {
  let targetPath = filePaths.find((f) => f.includes('S1F2_Other'))
  const msg = await getMsgByFilePath(targetPath)
  const value = msg.body[0].value
  if (value === 'MDLN-A') {
    return targetPath
  }
}
```

The above script logic: Search for files containing `S1F2_Other` in all SML files. If the file exists and the first element value in its SML body is `MDLN-A`, return the file path. Otherwise, default to returning `undefined`.

If this rule is triggered, you will see logs similar to the following in the corresponding LogPanel:

```
23:33:16[INFO]Received Message: DeviceId=10, SystemBytes=1, Data=
S1F1 W.
23:33:16[INFO][Action Script Reply] Reply Message: DeviceId=10, SystemBytes=1, Data=
S1F2
<L [2]
  <A [6] "MDLN-A">
  <A [13] "SOFTREV-0.0.1">
>.
```

## 3.6 Configure Event Bind

EventBind generates a complete set of GEM event-binding related SML commands from a TOML configuration, so you can quickly apply DefineReport / DefineLink bindings on the equipment side.

### 3.6.1 Steps

1. Click `EventBind` in the top toolbar.
2. Fill in or adjust the TOML configuration in the left editor.
3. Click `Convert` to generate the preview (switch tabs on the right to view all 6 SML outputs).
4. Click `Save` to write files to: `sml/EventBind/EventBind_YYMMDDHHmm/`.
5. In the left `SML File` tree, locate the generated folder and send the files to the equipment (recommended order below).

### 3.6.2 TOML Configuration

- `[CEID_RPTID_BINDING]`: maps a CEID (Collection Event) to a list of RPTIDs (Reports).
- `[RPTID_CEID_BINDING]`: maps an RPTID (Report) to a list of CEIDs (used to generate DefineReport content).

You can provide only one section, but it is recommended to keep both sections consistent to get a complete set of generated files.

<div align=center>
<img src="./README_IMAGES/event-bind.png" width="800" height="500" />
</div>

### 3.6.3 Generated Files (6 in total)

- `01_S2F37_DisableAllEvents.txt`: S2F37, Disable All Events.
- `02_S2F35_DisableLink.txt`: S2F35, Disable Link (generated from CEIDs in `CEID_RPTID_BINDING`).
- `03_S2F33_DisableReport.txt`: S2F33, Disable Report (generated from RPTIDs in `RPTID_CEID_BINDING`).
- `04_S2F33_DefineReport.txt`: S2F33, Define Report (generated from `RPTID_CEID_BINDING`).
- `05_S2F35_EnableLinkEvent.txt`: S2F35, Enable Link Event (generated from `CEID_RPTID_BINDING`).
- `06_S2F37_EnableAllEvents.txt`: S2F37, Enable All Events.

### 3.6.4 Recommended Send Order

In most cases, send files in filename order (01 → 06) to clear existing bindings first and then re-define them.

### 3.6.5 Troubleshooting

- `Convert` is disabled: check whether TOML is empty, has syntax errors, or is missing required section names (`CEID_RPTID_BINDING` / `RPTID_CEID_BINDING`).
- Some generated outputs look empty: the related section may be missing (e.g., only `CEID_RPTID_BINDING` is provided, so report-related outputs may contain empty lists).
- Cannot find the saved folder: in dev it is under project root `sml/EventBind/`; in packaged app it is under the exe sibling folder `sml/EventBind/`.

example:

```toml
# DefineLink Configuration Template
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
```

## 3.7 AutoFlow

AutoFlow lets you chain “send / wait / delay / log” steps into a runnable flow, with live progress and run logs. It is designed for automating EAP/GEM interaction sequences.

### 3.7.1 Prerequisites

- Only `simulate=Equipment` engines are supported (Host engines are not selectable).
- The target equipment engine must be opened and in RUNNING state.
- `send` steps require existing SML files from the `SML File` tree (`filePath` uses the relative path shown there).

### 3.7.2 Quick Start

1. Click `AutoFlow` in the top toolbar.
2. Click `New`, select an equipment engine in `Select Engine`, and enter a `Flow Name`.
3. Add steps via `+ Send / + Wait / + Delay / + Log / + End`.
4. Click `Save`.
5. Click `Run` to start; use `Pause / Resume / Stop` during execution if needed.

### 3.7.3 Storage

- Each flow is stored as a JSON file: `autoflows/<FlowName>.json`.
- Dev: under project root `autoflows/`; packaged: under the exe sibling folder `autoflows/`.

### 3.7.4 Step Types

- `send`: send an SML file.
  - Required: `filePath`.
  - Optional: `timeoutMs` (default 30000).
  - Optional: `waitReply` (use engine “wait reply” send mode).
  - Optional: `expect` (wait for an incoming message matching the condition after sending).
- `wait`: wait for an incoming message matching `expect`.
  - Required: `expect`.
  - Optional: `timeoutMs` (default 30000).
- `delay`: wait for a duration.
  - Required: `ms` (milliseconds, can be 0).
- `log`: write an internal AutoFlow log (does not go to engine LogPanel).
  - Required: `message`.
  - Optional: `level` (`INFO` / `WARN` / `ERROR`).
- `end`: end the flow.

Note: the first step must be `send` (used to trigger the flow start).

### 3.7.5 expect Matching

`expect` defines what message to wait for. It supports:

- `sf`: shortcut like `S6F12`.
- `stream` / `func` / `wBit`: detailed matching (can be used with or without `sf`).
- `smlIncludes`: requires the SML text to contain a substring.
- `conditions`: an AND list of advanced conditions, each contains:
  - `path`: value path like `a.b[0].c` / `a[0][1].value`.
  - `op`: `exists` / `eq` / `neq` / `contains` / `regex` / `gt` / `gte` / `lt` / `lte`.
  - `value`: required for most ops except `exists`.

### 3.7.6 Example

Minimal example: send S1F1 and wait for S1F2, then end.

```json
{
  "name": "DemoFlow",
  "tool": "TOOL",
  "steps": [
    {
      "type": "send",
      "filePath": "Commnication\\S1F1.txt",
      "timeoutMs": 30000,
      "expect": { "sf": "S1F2", "smlIncludes": "MDLN" }
    },
    { "type": "end" }
  ]
}
```
