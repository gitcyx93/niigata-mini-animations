"""Install both upstream bridges into an explicitly selected trial resource folder."""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

p = argparse.ArgumentParser(description=__doc__)
for key in ['daemon', 'mcp', 'resource', 'project']:
    p.add_argument('--' + key, required=True, type=Path)
a = p.parse_args()
resource, project = a.resource.resolve(), a.project.resolve(strict=True)
scripts = resource / 'Scripts'
effects = resource / 'Effects/reaper-mcp'
scripts.mkdir(parents=True, exist_ok=True)
effects.mkdir(parents=True, exist_ok=True)
ini = resource / 'reaper.ini'
if not ini.exists():
    ini.write_text('[REAPER]\nofflineinact=0\n')
for source in (a.mcp / 'reaper').glob('*.lua'):
    shutil.copyfile(source, scripts / source.name)
for source in (a.mcp / 'reaper').glob('*.jsfx*'):
    shutil.copyfile(source, effects / source.name)
bridge = scripts / 'mcp_bridge.lua'
bridge.write_text(bridge.read_text().replace('local OPEN_UI_ON_START = true', 'local OPEN_UI_ON_START = false'))
subprocess.run([sys.executable, str(a.daemon / 'setup/install.py'),
    '--allow-audio-writes', '--allow-project-save', '--allow-script-execution'],
    env=dict(os.environ, REAPER_RESOURCE_PATH=str(resource)), check=True)
startup = scripts / '__startup.lua'
begin, end = '-- yahiko-sfx-trial begin', '-- yahiko-sfx-trial end'
text = startup.read_text()
if begin in text:
    left, rest = text.split(begin, 1)
    _, right = rest.split(end, 1)
    text = (left + right).rstrip() + '\n'
text = text.strip() + '\n'
text += f'''\n{begin}
reaper.Main_openProject({json.dumps(str(project))})
local id = reaper.AddRemoveReaScript(true, 0, {json.dumps(str(bridge))}, true)
reaper.Main_OnCommand(id, 0)
{end}\n'''
startup.write_text(text)
config = {'mcpServers': {
    'reaper-daemon': {'command': sys.executable, 'args': [str((a.daemon / 'reaper_mcp.py').resolve())]},
    'reaper-mcp': {'command': shutil.which('node') or 'node',
        'args': [str((a.mcp / 'main.js').resolve()), 'serve'],
        'env': {'REAPER_RESOURCE_PATH': str(resource), 'REAPER_MCP_TELEMETRY': '0'}}}}
(project.parent / 'mcp-servers.json').write_text(json.dumps(config, indent=2) + '\n')
print(project.parent / 'mcp-servers.json')
