import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export class AutoModeratorFormatter implements vscode.DocumentFormattingEditProvider {
    provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
        const text = document.getText();
        const edits: vscode.TextEdit[] = [];

        try {
            // Split into rules
            const rules = this.parseRules(text);
            const formattedRules = this.formatRules(rules, options);
            
            // Replace entire document
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(text.length)
            );
            
            edits.push(vscode.TextEdit.replace(fullRange, formattedRules));
        } catch (error) {
            console.error('Formatting error:', error);
        }

        return edits;
    }

    private parseRules(text: string): string[] {
        const rules: string[] = [];
        const lines = text.split('\n');
        let currentRule: string[] = [];
        
        for (const line of lines) {
            if (line.trim() === '---') {
                if (currentRule.length > 0) {
                    rules.push(currentRule.join('\n'));
                    currentRule = [];
                }
            }
            currentRule.push(line);
        }
        
        if (currentRule.length > 0) {
            rules.push(currentRule.join('\n'));
        }
        
        return rules;
    }

    private formatRules(rules: string[], options: vscode.FormattingOptions): string {
        const formattedRules: string[] = [];
        
        for (const rule of rules) {
            if (rule.trim()) {
                formattedRules.push(this.formatRule(rule, options));
            }
        }
        
        return formattedRules.join('\n\n');
    }

    private formatRule(rule: string, options: vscode.FormattingOptions): string {
        const lines = rule.split('\n');
        const formattedLines: string[] = [];
        let inYamlBlock = false;
        let yamlIndent = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();
            
            // Handle rule separator
            if (trimmed === '---') {
                formattedLines.push('---');
                continue;
            }
            
            // Handle comments
            if (trimmed.startsWith('#')) {
                // Add spacing around section headers
                if (trimmed.includes('=') || trimmed.includes('-')) {
                    if (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] !== '') {
                        formattedLines.push('');
                    }
                }
                formattedLines.push(line);
                continue;
            }
            
            // Handle empty lines
            if (trimmed === '') {
                formattedLines.push('');
                continue;
            }
            
            // Handle YAML blocks
            if (line.includes('|')) {
                inYamlBlock = true;
                yamlIndent = line.indexOf('|') + 1;
                formattedLines.push(line);
                continue;
            }
            
            if (inYamlBlock) {
                if (line.trim() === '' || line.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*:/)) {
                    inYamlBlock = false;
                } else {
                    // Format YAML block content
                    const content = line.trim();
                    if (content) {
                        formattedLines.push(' '.repeat(yamlIndent) + content);
                    } else {
                        formattedLines.push('');
                    }
                    continue;
                }
            }
            
            // Handle regular YAML lines
            if (line.includes(':')) {
                const colonIndex = line.indexOf(':');
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                
                // Determine indentation level
                const indentLevel = this.getIndentLevel(key);
                const indent = ' '.repeat(indentLevel * options.tabSize);
                
                if (value) {
                    formattedLines.push(indent + key + ': ' + value);
                } else {
                    formattedLines.push(indent + key + ':');
                }
            } else {
                formattedLines.push(line);
            }
        }
        
        return formattedLines.join('\n');
    }

    private getIndentLevel(key: string): number {
        // Top-level fields
        const topLevelFields = [
            'type', 'priority', 'moderators_exempt', 'action', 'action_reason',
            'comment', 'comment_locked', 'comment_stickied', 'modmail',
            'modmail_subject', 'message', 'message_subject', 'standard',
            'reports', 'body_longer_than', 'body_shorter_than', 'is_top_level',
            'is_edited', 'is_original_content', 'is_poll', 'is_gallery'
        ];
        
        if (topLevelFields.includes(key)) {
            return 0;
        }
        
        // Sub-groups
        const subGroups = ['author', 'crosspost_author', 'crosspost_subreddit', 'parent_submission', 'subreddit'];
        if (subGroups.includes(key)) {
            return 0;
        }
        
        // Sub-group fields
        const subGroupFields = [
            'comment_karma', 'post_karma', 'combined_karma', 'account_age',
            'has_verified_email', 'is_gold', 'is_contributor', 'is_moderator',
            'set_flair', 'overwrite_flair'
        ];
        if (subGroupFields.includes(key)) {
            return 1;
        }
        
        return 0;
    }
} 