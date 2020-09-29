const osascript = require('osascript').eval;
const punchResult = {
  msg: 'test'
}

// Beep
osascript('beep 3', { type: 'AppleScript' })

// Say
osascript('say "你好, 小麥"', { type: 'AppleScript' });

// Dialog
var script = `tell app "System Events" to display dialog "${punchResult.msg}" buttons {"OK"}`;
osascript(script, { type: 'AppleScript' });

// Alert
var script = `display alert "onDuty.js - ${punchResult.msg}" buttons {"OK"}`;
osascript(script, { type: 'AppleScript' });

osascript(`display alert "Hello World!" message "longer text can be added in the message field and it will be all shown on the pop-up alert." giving up after 5`, { type: 'AppleScript' });

// Notification
var script = `display notification "${punchResult.msg}" with title "OnDuty.js" subtitle "Punch Result" sound name "Submarine"`;
osascript(script, { type: 'AppleScript' });

osascript(`display notification "Punch Start" with title "OnDuty.js" sound name "Submarine"`, { type: 'AppleScript' });

osascript(`display notification "✨ 登入成功" with title "OnDuty.js" sound name "Submarine"`, { type: 'AppleScript' });
osascript(`display notification "⚡️ 開啟: 我要打卡" with title "OnDuty.js" sound name "Submarine"`, { type: 'AppleScript' });
osascript(`display notification "✨ 點擊: 上/下班 按鈕" with title "OnDuty.js" sound name "Submarine"`, { type: 'AppleScript' });