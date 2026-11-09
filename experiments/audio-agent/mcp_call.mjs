// Call the upstream MCP SDK without changing any user's MCP/client settings.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const [serverPath, name, json = '{}'] = process.argv.slice(2);
if (!serverPath || !name) throw Error('Usage: node mcp_call.mjs SERVER_MAIN_JS TOOL JSON');
const server = path.resolve(serverPath);
const require = createRequire(pathToFileURL(server));
const { Client } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/index.js')));
const { StdioClientTransport } = await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/stdio.js')));
const client = new Client({ name: 'yahiko-sfx-trial', version: '1.0.0' });
const transport = new StdioClientTransport({ command: process.execPath,
  args: [server, 'serve'], env: { ...process.env, REAPER_MCP_TELEMETRY: '0' }, stderr: 'inherit' });
try {
  await client.connect(transport);
  const call = async (name, args) => {
    const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
    if (response.isError) throw Error(JSON.stringify({ name, response }));
    return response;
  };
  let result;
  if (name === 'list') result = await client.listTools();
  else if (name === 'plan') {
    result = [];
    for (const step of JSON.parse(json)) {
      const response = await call(step.name, step.arguments ?? {});
      result.push({ name: step.name, response });
    }
  } else result = await call(name, JSON.parse(json));
  console.log(JSON.stringify(result, null, 2));
  if (result.isError) process.exitCode = 1;
} finally { await client.close(); }
