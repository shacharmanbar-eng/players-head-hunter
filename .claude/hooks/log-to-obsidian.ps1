# Appends one line per agent action (tool call) to the Obsidian vault note "Agent Log".
# Called by the PostToolUse hook in .claude/settings.json; the hook JSON arrives on stdin.
$vault = 'C:\Users\shacharm\OneDrive - OSG\Documents\Obsidian Vault\Players Head Hunter'
$log = Join-Path $vault 'Agent Log.md'

try {
    $j = [Console]::In.ReadToEnd() | ConvertFrom-Json
    $in = $j.tool_input

    $detail = $null
    foreach ($name in 'description', 'command', 'file_path', 'path', 'pattern', 'url', 'prompt', 'skill') {
        if ($in -and $in.$name) { $detail = [string]$in.$name; break }
    }
    if ($detail) {
        $detail = ($detail -replace '\s+', ' ').Trim()
        if ($detail.Length -gt 160) { $detail = $detail.Substring(0, 160) + '...' }
        $detail = $detail -replace '\|', '\|'
    }

    New-Item -ItemType Directory -Force -Path $vault | Out-Null
    $utf8 = New-Object System.Text.UTF8Encoding($false)
    $today = Get-Date -Format 'yyyy-MM-dd'
    $text = ''
    if (-not (Test-Path $log)) {
        $text += "---`ntags: [players-head-hunter, agent-log]`n---`n# Agent Log`n`nAutomatic record of every action Claude Code takes in this project. See [[Players Head Hunter]].`n"
    }
    if (-not (Test-Path $log) -or -not (Select-String -Path $log -SimpleMatch "## $today" -Quiet)) {
        $text += "`n## $today`n"
    }
    $line = '- {0} - **{1}**' -f (Get-Date -Format 'HH:mm:ss'), $j.tool_name
    if ($detail) { $line += ' - ' + $detail }
    $text += $line + "`n"
    [System.IO.File]::AppendAllText($log, $text, $utf8)
} catch {
    # Never block the agent because logging failed.
    exit 0
}
