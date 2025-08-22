# AutoModerator VSCode Extension

A comprehensive VSCode extension for Reddit AutoModerator configuration files with syntax highlighting, IntelliSense, snippets, and scaffolding support.

## Features

### 🎨 Syntax Highlighting
- Full syntax highlighting for `.automod` files with YAML colors
- Color-coded AutoModerator fields, actions, and values
- Support for YAML structure, comments, and placeholders
- Proper indentation and bracket matching
- Embedded YAML language support for better highlighting

### 🧠 IntelliSense & Auto-completion
- Smart completion for all AutoModerator fields and values
- Context-aware suggestions based on your current position in the file
- Completion for:
  - Top-level fields (type, action, priority, etc.)
  - Search checks (title, body, domain, etc.)
  - Non-searching checks (reports, body length, etc.)
  - Actions (approve, remove, spam, filter, report)
  - Sub-groups (author, crosspost_author, etc.)
  - Standard conditions (image hosting sites, video hosting sites, etc.)
  - Common domains and values

### 📖 Hover Documentation
- Detailed documentation for all AutoModerator fields
- Examples and usage patterns
- Context-sensitive help based on your cursor position
- Markdown-formatted documentation with code examples

### ⚡ Snippets
Comprehensive snippets for common AutoModerator patterns:

- `rule` - Basic AutoModerator rule template
- `domain-blacklist` - Domain blacklist rule
- `karma-check` - User karma/age check rule
- `content-filter` - Content filtering rule
- `flair` - Flair assignment rule
- `reports` - Report handling rule
- `comment` - Comment moderation rule
- `standard` - Standard condition usage
- `author` - Author sub-group checks
- `search` - Search check patterns
- `placeholder` - AutoModerator placeholders
- And many more!

### 🏗️ Scaffolding Command
Use the command `automoderator.createScaffold` (or press `Ctrl+Shift+P` and search for "Create AutoModerator Scaffold") to generate complete rule templates:

- **Complete Subreddit Moderation** - Professional setup for any subreddit (NEW!)
- **Basic Rule** - Simple rule template
- **Domain Blacklist** - Block specific domains
- **User Karma Check** - Filter by user karma/age
- **Content Filter** - Filter content by keywords
- **Flair Assignment** - Auto-assign flair
- **Report Handler** - Handle reported content
- **Comment Moderation** - Comment-specific rules
- **Complete Config** - Full configuration with multiple rules

### 📝 Formatting & Auto-Formatting
- **Manual Formatting** - Use `Ctrl+Shift+P` → "Format AutoModerator Document"
- **Format on Save** - Optional auto-formatting when saving (disabled by default to prevent conflicts)
- **Smart Indentation** - Proper YAML-style indentation for all AutoModerator fields
- **Rule Organization** - Automatically organize and space rules properly
- **Conflict Prevention** - Built-in safeguards to prevent formatting conflicts with other extensions

### 📁 File Support
- Primary support for `.automod` files
- Also works with `.yml` and `.yaml` files containing AutoModerator content
- Proper language detection and syntax highlighting

## Recent Fixes (v0.1.1)

### 🐛 Critical Bug Fixes
- **Fixed infinite line insertion** - Resolved auto-formatting conflicts that caused lines to be repeatedly inserted
- **Disabled format on save by default** - Prevents conflicts with other formatters and VSCode's built-in formatting
- **Removed IntelliSense from comments** - No more unwanted suggestions when typing in comment lines (starting with `#`)
- **Added extension icon** - Proper icon display in VSCode extension marketplace
- **Removed conflicting file icons** - No longer interferes with other file icon extensions

### ⚡ Performance Improvements
- **Better error handling** - More robust formatting with proper error catching
- **Smarter formatting logic** - Only formats when actual changes are needed
- **Reduced conflicts** - Better integration with VSCode's built-in features

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` in VSCode to launch the extension in debug mode
5. Or package the extension using `vsce package` and install the `.vsix` file

## Usage

### Creating AutoModerator Files
1. Create a new file with `.automod` extension
2. Start typing to get IntelliSense suggestions
3. Use snippets by typing the prefix (e.g., `rule` for basic rule)
4. Hover over any field for detailed documentation

### Using the Scaffolding Command
1. Open a `.automod` file
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Create AutoModerator Scaffold"
4. Select the type of scaffold you want
5. The template will be inserted at your cursor position

### Snippets Usage
Type any of these prefixes and press `Tab` to expand:

- `rule` - Basic rule template
- `domain-blacklist` - Domain blocking rule
- `karma-check` - User karma checks
- `content-filter` - Content filtering
- `flair` - Flair assignment
- `reports` - Report handling
- `comment` - Comment moderation
- `standard` - Standard conditions
- `author` - Author sub-groups
- `search` - Search patterns
- `placeholder` - Placeholders
- `action` - Action blocks
- `priority` - Priority settings
- `type` - Content type specification
- `regex` - Regex patterns

## Configuration

The extension provides these configuration options:

- `automoderator.enableIntelliSense` - Enable/disable IntelliSense (default: true)
- `automoderator.enableHover` - Enable/disable hover documentation (default: true)
- `automoderator.formatOnSave` - Enable/disable format on save (default: true)

## Examples

### Basic Rule
```yaml
---
# Basic AutoModerator Rule
title: ["spam", "clickbait"]
body: ["offensive word", "spam phrase"]
action: remove
action_reason: "Violates community guidelines"
comment: |
    Your {{kind}} was removed because it violates our community guidelines.
    Please review the rules before posting again.
---
```

### Domain Blacklist
```yaml
---
# Domain Blacklist Rule
domain: ["spam.com", "malware.com", "phishing.com"]
action: spam
action_reason: "Spam domain [{{match}}]"
---
```

### User Karma Check
```yaml
---
# User Karma Check Rule
author:
    comment_karma: "< 10"
    post_karma: "< 5"
    account_age: "< 7 days"
action: filter
action_reason: "New user with low karma"
---
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

If you encounter any issues or have feature requests, please open an issue on the [GitHub repository](https://github.com/Elixir-Piloting/reddit-automod).

## Acknowledgments

- Based on the official AutoModerator documentation
- Inspired by the need for better tooling for Reddit moderators
- Built with TypeScript and VSCode Extension API 