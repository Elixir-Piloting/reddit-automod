import * as vscode from 'vscode';

export class AutoModeratorCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        // Check if aggressive IntelliSense is enabled
        const config = vscode.workspace.getConfiguration('automoderator');
        const aggressiveMode = config.get('aggressiveIntelliSense', false);
        
        // If not in aggressive mode and triggered by Enter, don't show suggestions
        if (!aggressiveMode && context.triggerKind === vscode.CompletionTriggerKind.TriggerCharacter && context.triggerCharacter === '\n') {
            return [];
        }
        const linePrefix = document.lineAt(position).text.substr(0, position.character);
        const items: vscode.CompletionItem[] = [];

        // Top-level checks and actions
        const topLevelItems = [
            { label: 'type', detail: 'Type of item to check', documentation: 'Defines the type of item this rule should be checked against. Valid values: comment, submission, text submission, link submission, crosspost submission, poll submission, gallery submission, or any (default).' },
            { label: 'priority', detail: 'Rule priority', documentation: 'Must be set to a number. Higher priority rules are checked first. Defaults to zero.' },
            { label: 'moderators_exempt', detail: 'Moderator exemption', documentation: 'true/false - Defines whether the rule should be skipped when the author is a moderator.' },
            { label: 'action', detail: 'Moderation action', documentation: 'A moderation action to perform: approve, remove, spam, filter, or report.' },
            { label: 'action_reason', detail: 'Action reason', documentation: 'Displays in the moderation log as a reason for the action. Supports placeholders.' },
            { label: 'comment', detail: 'Auto-comment', documentation: 'Text of a comment to post in response to an item that satisfies the rule conditions.' },
            { label: 'comment_locked', detail: 'Lock comment', documentation: 'true/false - if true, the comment will be locked from further replies.' },
            { label: 'comment_stickied', detail: 'Sticky comment', documentation: 'true/false - if true, the comment will be stickied to the top of the submission.' },
            { label: 'modmail', detail: 'Send modmail', documentation: 'Text of a modmail to send to moderators when an item satisfies the rule conditions.' },
            { label: 'modmail_subject', detail: 'Modmail subject', documentation: 'Subject of the modmail. Defaults to "AutoModerator notification".' },
            { label: 'message', detail: 'Send message', documentation: 'Text of a message to send to the author of an item that satisfies the rule conditions.' },
            { label: 'message_subject', detail: 'Message subject', documentation: 'Subject of the message. Defaults to "AutoModerator notification".' }
        ];

        // Search checks
        const searchChecks = [
            { label: 'title', detail: 'Search submission title', documentation: 'Search for words/phrases/patterns in the submission title.' },
            { label: 'body', detail: 'Search post/comment body', documentation: 'Search for words/phrases/patterns in the post or comment body.' },
            { label: 'domain', detail: 'Search submission domain', documentation: 'Search for specific domains in submissions.' },
            { label: 'url', detail: 'Search submission URL', documentation: 'Search for patterns in the submission URL.' },
            { label: 'flair_text', detail: 'Search flair text', documentation: 'Search for specific flair text on submissions or users.' },
            { label: 'flair_css_class', detail: 'Search flair CSS class', documentation: 'Search for specific flair CSS classes.' },
            { label: 'id', detail: 'Search ID', documentation: 'Search for specific submission or comment IDs.' },
            { label: 'name', detail: 'Search author name', documentation: 'Search for specific author names (in author sub-group).' }
        ];

        // Non-searching checks
        const nonSearchChecks = [
            { label: 'reports', detail: 'Minimum reports', documentation: 'The minimum number of reports the item must have to trigger the rule.' },
            { label: 'body_longer_than', detail: 'Body length minimum', documentation: 'The body must be longer than this number of characters.' },
            { label: 'body_shorter_than', detail: 'Body length maximum', documentation: 'The body must be shorter than this number of characters.' },
            { label: 'is_top_level', detail: 'Top-level comment', documentation: 'true/false - if true, only applies to top-level comments.' },
            { label: 'is_edited', detail: 'Edited content', documentation: 'true/false - if true, only applies to edited content.' },
            { label: 'is_original_content', detail: 'Original content', documentation: 'true/false - if true, only applies to OC flagged content.' },
            { label: 'is_poll', detail: 'Poll submission', documentation: 'true/false - if true, only applies to poll submissions.' },
            { label: 'is_gallery', detail: 'Gallery submission', documentation: 'true/false - if true, only applies to gallery submissions.' }
        ];

        // Actions
        const actions = [
            { label: 'approve', detail: 'Approve content', documentation: 'Approves the submission or comment.' },
            { label: 'remove', detail: 'Remove content', documentation: 'Removes the submission or comment.' },
            { label: 'spam', detail: 'Mark as spam', documentation: 'Removes the content and trains the spam filter.' },
            { label: 'filter', detail: 'Filter content', documentation: 'Removes the post but keeps it in the modqueue.' },
            { label: 'report', detail: 'Report content', documentation: 'Reports the content to moderators.' }
        ];

        // Sub-groups
        const subGroups = [
            { label: 'author', detail: 'Author sub-group', documentation: 'Checks and actions that apply to the author of the content.' },
            { label: 'crosspost_author', detail: 'Crosspost author sub-group', documentation: 'Checks and actions that apply to the author of the original crossposted content.' },
            { label: 'crosspost_subreddit', detail: 'Crosspost subreddit sub-group', documentation: 'Checks and actions that apply to the subreddit of the original crossposted content.' },
            { label: 'parent_submission', detail: 'Parent submission sub-group', documentation: 'Checks and actions that apply to the parent submission (for comments).' },
            { label: 'subreddit', detail: 'Subreddit sub-group', documentation: 'Checks and actions that apply to the current subreddit.' }
        ];

        // Standard conditions
        const standardConditions = [
            { label: 'image hosting sites', detail: 'Standard: Image hosting sites', documentation: 'Will match link submissions from common image hosting domains.' },
            { label: 'video hosting sites', detail: 'Standard: Video hosting sites', documentation: 'Will match link submissions from common video hosting domains.' },
            { label: 'direct image links', detail: 'Standard: Direct image links', documentation: 'Will match link submissions that link directly to image files (PNG, JPG, GIF, GIFV).' },
            { label: 'streaming sites', detail: 'Standard: Streaming sites', documentation: 'Will match link submissions from common streaming domains.' },
            { label: 'crowdfunding sites', detail: 'Standard: Crowdfunding sites', documentation: 'Will match link submissions from common crowdfunding domains.' },
            { label: 'meme generator sites', detail: 'Standard: Meme generator sites', documentation: 'Will match link submissions from common meme-generator sites.' },
            { label: 'facebook links', detail: 'Standard: Facebook links', documentation: 'Will match submissions or comments including links to Facebook.' },
            { label: 'amazon affiliate links', detail: 'Standard: Amazon affiliate links', documentation: 'Will match submissions or comments including Amazon links with an affiliate.' }
        ];

        // Common domains for blacklists/whitelists
        const commonDomains = [
            'youtube.com', 'youtu.be', 'imgur.com', 'reddit.com', 'redd.it',
            'twitter.com', 'x.com', 'instagram.com', 'facebook.com', 'fb.com',
            'tiktok.com', 'discord.gg', 'discord.com', 'github.com', 'gitlab.com',
            'stackoverflow.com', 'medium.com', 'dev.to', 'hashnode.dev'
        ];

        // Check if we're in a sub-group context
        const isInSubGroup = this.isInSubGroup(document, position);
        const isAfterColon = linePrefix.includes(':');
        const isAfterStandard = linePrefix.includes('standard:');

        if (isAfterStandard) {
            // Complete standard conditions
            standardConditions.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Value);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                items.push(completionItem);
            });
        } else if (isAfterColon && !isInSubGroup) {
            // Complete values for top-level fields
            if (linePrefix.includes('action:')) {
                actions.forEach(item => {
                    const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Value);
                    completionItem.detail = item.detail;
                    completionItem.documentation = new vscode.MarkdownString(item.documentation);
                    completionItem.insertText = item.label;
                    items.push(completionItem);
                });
            } else if (linePrefix.includes('type:')) {
                const types = [
                    { label: 'comment', detail: 'Comment type', documentation: 'Apply rule to comments only.' },
                    { label: 'submission', detail: 'Submission type', documentation: 'Apply rule to all submissions.' },
                    { label: 'text submission', detail: 'Text submission type', documentation: 'Apply rule to text posts only.' },
                    { label: 'link submission', detail: 'Link submission type', documentation: 'Apply rule to link posts only.' },
                    { label: 'crosspost submission', detail: 'Crosspost submission type', documentation: 'Apply rule to crossposts only.' },
                    { label: 'poll submission', detail: 'Poll submission type', documentation: 'Apply rule to poll posts only.' },
                    { label: 'gallery submission', detail: 'Gallery submission type', documentation: 'Apply rule to gallery posts only.' },
                    { label: 'any', detail: 'Any type', documentation: 'Apply rule to any content type (default).' }
                ];
                types.forEach(item => {
                    const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Value);
                    completionItem.detail = item.detail;
                    completionItem.documentation = new vscode.MarkdownString(item.documentation);
                    completionItem.insertText = item.label;
                    items.push(completionItem);
                });
            } else if (linePrefix.includes('domain:') || linePrefix.includes('title:') || linePrefix.includes('body:')) {
                // Suggest common domains for domain field
                commonDomains.forEach(domain => {
                    const completionItem = new vscode.CompletionItem(domain, vscode.CompletionItemKind.Value);
                    completionItem.detail = 'Common domain';
                    items.push(completionItem);
                });
            }
        } else if (!isInSubGroup) {
            // Complete top-level fields
            topLevelItems.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Field);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                completionItem.insertText = item.label + ': ';
                items.push(completionItem);
            });

            // Complete search checks
            searchChecks.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Field);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                completionItem.insertText = item.label + ': ';
                items.push(completionItem);
            });

            // Complete non-searching checks
            nonSearchChecks.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Field);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                completionItem.insertText = item.label + ': ';
                items.push(completionItem);
            });

            // Complete sub-groups
            subGroups.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Class);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                completionItem.insertText = item.label + ':\n    ';
                items.push(completionItem);
            });

            // Complete standard condition
            const standardItem = new vscode.CompletionItem('standard', vscode.CompletionItemKind.Field);
            standardItem.detail = 'Standard condition';
            standardItem.documentation = new vscode.MarkdownString('Use a pre-defined standard condition like "image hosting sites" or "video hosting sites".');
            standardItem.insertText = 'standard: ';
            items.push(standardItem);
        } else {
            // Complete sub-group fields
            const subGroupFields = [
                ...searchChecks,
                ...nonSearchChecks,
                { label: 'comment_karma', detail: 'Comment karma check', documentation: 'Compare to the author\'s comment karma.' },
                { label: 'post_karma', detail: 'Post karma check', documentation: 'Compare to the author\'s post karma.' },
                { label: 'combined_karma', detail: 'Combined karma check', documentation: 'Compare to the author\'s combined karma.' },
                { label: 'account_age', detail: 'Account age check', documentation: 'Compare to the age of the author\'s account.' },
                { label: 'has_verified_email', detail: 'Verified email check', documentation: 'true/false - check if author has verified email.' },
                { label: 'is_gold', detail: 'Reddit Gold check', documentation: 'true/false - check if author has Reddit Gold.' },
                { label: 'is_contributor', detail: 'Contributor check', documentation: 'true/false - check if author is an approved submitter.' },
                { label: 'is_moderator', detail: 'Moderator check', documentation: 'true/false - check if author is a moderator.' },
                { label: 'set_flair', detail: 'Set flair', documentation: 'Set user or submission flair.' },
                { label: 'overwrite_flair', detail: 'Overwrite flair', documentation: 'true/false - if true, overwrite existing flair.' }
            ];

            subGroupFields.forEach(item => {
                const completionItem = new vscode.CompletionItem(item.label, vscode.CompletionItemKind.Field);
                completionItem.detail = item.detail;
                completionItem.documentation = new vscode.MarkdownString(item.documentation);
                completionItem.insertText = item.label + ': ';
                items.push(completionItem);
            });
        }

        return items;
    }

    private isInSubGroup(document: vscode.TextDocument, position: vscode.Position): boolean {
        const line = position.line;
        const text = document.getText();
        const lines = text.split('\n');
        
        // Check if we're inside a sub-group (indented section)
        for (let i = line; i >= 0; i--) {
            const currentLine = lines[i];
            if (currentLine.trim() === '') continue;
            
            // If we find a sub-group declaration, check if we're indented under it
            if (currentLine.includes(':') && !currentLine.startsWith('#')) {
                const fieldName = currentLine.split(':')[0].trim();
                if (['author', 'crosspost_author', 'crosspost_subreddit', 'parent_submission', 'subreddit'].includes(fieldName)) {
                    // Check if current line is indented
                    const currentLineText = lines[position.line];
                    const indentLevel = currentLineText.length - currentLineText.trimStart().length;
                    const subGroupIndentLevel = currentLine.length - currentLine.trimStart().length;
                    return indentLevel > subGroupIndentLevel;
                }
            }
        }
        
        return false;
    }
} 