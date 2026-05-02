# Gemini Multi-Account OAuth Plugin for Opencode

![License](https://img.shields.io/npm/l/opencode-gemini-auth-multi-account)
![Version](https://img.shields.io/npm/v/opencode-gemini-auth-multi-account)

> [!WARNING]
> Google has stated that using Gemini CLI OAuth with third-party software is a
> policy-violating use case and may trigger abuse detection or account
> restrictions. It is unclear how aggressively this is enforced for projects
> like this one, but you should assume there is real risk and use this plugin at
> your own discretion. If you want the lowest-risk option, use Opencode with
> your own Gemini API key instead.
>
> See: https://github.com/google-gemini/gemini-cli/discussions/22970

**Authenticate the Opencode CLI with multiple Google accounts.** This plugin enables
you to use your existing Gemini plans and quotas (including the free tier)
directly within Opencode, with **automatic rotation between accounts** when quotas are exhausted.

## Prerequisites

- [Opencode CLI](https://opencode.ai) installed.
- One or more Google accounts with access to Gemini.

## Installation

Add the plugin to your Opencode configuration file
(`~/.config/opencode/opencode.json` or similar):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-gemini-auth-multi-account@latest"]
}
```

> [!IMPORTANT]
> Explicitly configure a Google Cloud `projectId` if you're using an
> organization-backed Gemini Code Assist subscription
> (`Standard`/`Enterprise`) or a company, school, or Google Workspace account.
> Most individual Google accounts should not need this.

## Usage

1. **Login**: Run the authentication command in your terminal:

   ```bash
   opencode auth login
   ```

2. **Select Provider**: Choose **Google** from the list.
3. **Authenticate**: Select **OAuth with Google (Gemini CLI)**.
   - A browser window will open for you to approve the access.
   - The plugin spins up a temporary local server to capture the callback.
4. **Add More Accounts**: To add another account, run `opencode auth login` again and select **Add another Google Account**.

Once authenticated, Opencode will automatically manage your accounts.

### Multi-Account & Rotation

The plugin automatically handles quota management:
- **Automatic Switching**: If an account hits a `429 RESOURCE_EXHAUSTED` error, the plugin will automatically switch to the next available account.
- **Exhaustion Tracking**: Accounts that hit quota limits are temporarily marked as exhausted (typically for 1 hour) before being retried.
- **Seamless Flow**: Your requests continue as long as at least one account has remaining quota.

To check the current status and remaining quotas for all your accounts, run:

```bash
/gquota
```

## Configuration

### Google Cloud Project

By default, the plugin attempts to provision or find a suitable Google Cloud
project for each account. To force a specific project, set the `projectId` in your configuration:

```json
{
  "provider": {
    "google": {
      "options": {
        "projectId": "your-specific-project-id"
      }
    }
  }
}
```

### Model list

Use OpenCode's `provider.google.whitelist` or `provider.google.blacklist` settings to manage visible models.

```json
{
  "provider": {
    "google": {
      "whitelist": [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "gemini-3-flash-preview",
        "gemini-3-pro-preview"
      ]
    }
  }
}
```

## Troubleshooting

### Quotas and 429 Errors

If all your accounts are exhausted, you will see a `RESOURCE_EXHAUSTED` error. You can:
- Wait for the quota to reset (check `/gquota` for reset times).
- Add more Google accounts via `opencode auth login`.
- Use a dedicated Google Cloud project with higher limits.

### Debugging

To view detailed logs of Gemini requests and account switching:

```bash
OPENCODE_GEMINI_DEBUG=1 opencode
```

This will generate `gemini-debug-<timestamp>.log` files in your working directory.

## Development

To develop on this plugin locally:

1. **Clone**:

   ```bash
   git clone https://github.com/Gl1ch5/opencode-gemini-auth-multi-account.git
   cd opencode-gemini-auth-multi-account
   bun install
   ```

2. **Link**:
   Update your Opencode config to point to your local directory:

   ```json
   {
     "plugin": ["file:///absolute/path/to/opencode-gemini-auth-multi-account"]
   }
   ```

## License

MIT
