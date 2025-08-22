import * as vscode from 'vscode';

export class AutoModeratorHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) return null;

        const word = document.getText(wordRange);
        const line = document.lineAt(position.line).text;
        
        // Get documentation for the word
        const documentation = this.getDocumentation(word, line, position);
        if (!documentation) return null;

        return new vscode.Hover(documentation, wordRange);
    }

    private getDocumentation(word: string, line: string, position: vscode.Position): vscode.MarkdownString | null {
        const isInSubGroup = this.isInSubGroup(position);
        
        // Top-level fields documentation
        const topLevelFields: { [key: string]: string } = {
            'type': '**Type of item to check**\n\nDefines the type of item this rule should be checked against.\n\n**Valid values:**\n- `comment` - Apply rule to comments only\n- `submission` - Apply rule to all submissions\n- `text submission` - Apply rule to text posts only\n- `link submission` - Apply rule to link posts only\n- `crosspost submission` - Apply rule to crossposts only\n- `poll submission` - Apply rule to poll posts only\n- `gallery submission` - Apply rule to gallery posts only\n- `any` - Apply rule to any content type (default)',
            
            'priority': '**Rule Priority**\n\nMust be set to a number. Higher priority rules are checked first. Defaults to zero.\n\n**Example:**\n```yaml\npriority: 1\n```',
            
            'moderators_exempt': '**Moderator Exemption**\n\n`true/false` - Defines whether the rule should be skipped when the author is a moderator.\n\n**Default:** `true` for rules that can cause removal\n\n**Example:**\n```yaml\nmoderators_exempt: false\n```',
            
            'action': '**Moderation Action**\n\nA moderation action to perform on the item.\n\n**Valid values:**\n- `approve` - Approves the submission or comment\n- `remove` - Removes the submission or comment\n- `spam` - Removes the content and trains the spam filter\n- `filter` - Removes the post but keeps it in the modqueue\n- `report` - Reports the content to moderators',
            
            'action_reason': '**Action Reason**\n\nDisplays in the moderation log as a reason for the action. Supports placeholders.\n\n**Example:**\n```yaml\naction_reason: "Spam domain [{{match}}]"\n```',
            
            'comment': '**Auto-Comment**\n\nText of a comment to post in response to an item that satisfies the rule conditions.\n\n**Example:**\n```yaml\ncomment: |\n    Your submission was removed because it violates our rules.\n    Please review the community guidelines.\n```',
            
            'comment_locked': '**Lock Comment**\n\n`true/false` - If true, the comment will be locked from further replies.\n\n**Example:**\n```yaml\ncomment_locked: true\n```',
            
            'comment_stickied': '**Sticky Comment**\n\n`true/false` - If true, the comment will be stickied to the top of the submission.\n\n**Note:** Only works for top-level comments on submissions.',
            
            'modmail': '**Send Modmail**\n\nText of a modmail to send to moderators when an item satisfies the rule conditions.\n\n**Example:**\n```yaml\nmodmail: |\n    The above {{kind}} by /u/{{author}} has received multiple reports.\n    Please investigate.\n```',
            
            'modmail_subject': '**Modmail Subject**\n\nSubject of the modmail. Defaults to "AutoModerator notification" if not set.\n\n**Example:**\n```yaml\nmodmail_subject: "Spam detected"\n```',
            
            'message': '**Send Message**\n\nText of a message to send to the author of an item that satisfies the rule conditions.\n\n**Example:**\n```yaml\nmessage: |\n    Your {{kind}} was removed because it violates our rules.\n    Please review the community guidelines.\n```',
            
            'message_subject': '**Message Subject**\n\nSubject of the message. Defaults to "AutoModerator notification" if not set.',
            
            'standard': '**Standard Condition**\n\nUse a pre-defined standard condition that maintains a list of common domains or patterns.\n\n**Available standards:**\n- `image hosting sites` - Common image hosting domains\n- `video hosting sites` - Common video hosting domains\n- `direct image links` - Direct links to image files\n- `streaming sites` - Common streaming domains\n- `crowdfunding sites` - Common crowdfunding domains\n- `meme generator sites` - Common meme-generator sites\n- `facebook links` - Facebook links\n- `amazon affiliate links` - Amazon affiliate links'
        };

        // Search checks documentation
        const searchChecks: { [key: string]: string } = {
            'title': '**Search Submission Title**\n\nSearch for words/phrases/patterns in the submission title.\n\n**Example:**\n```yaml\ntitle: ["spam", "clickbait"]\ntitle (regex): ["\\[.*\\]"]\n```',
            
            'body': '**Search Post/Comment Body**\n\nSearch for words/phrases/patterns in the post or comment body.\n\n**Example:**\n```yaml\nbody: ["offensive word", "spam phrase"]\nbody (regex): ["https?://\\S+"]\n```',
            
            'domain': '**Search Submission Domain**\n\nSearch for specific domains in submissions.\n\n**Example:**\n```yaml\ndomain: ["youtube.com", "imgur.com"]\n~domain: ["spam.com", "malware.com"]\n```',
            
            'url': '**Search Submission URL**\n\nSearch for patterns in the submission URL.\n\n**Example:**\n```yaml\nurl (regex): ["bit\\.ly", "goo\\.gl"]\n```',
            
            'flair_text': '**Search Flair Text**\n\nSearch for specific flair text on submissions or users.\n\n**Example:**\n```yaml\nflair_text: ["Discussion", "Question"]\n```',
            
            'flair_css_class': '**Search Flair CSS Class**\n\nSearch for specific flair CSS classes.\n\n**Example:**\n```yaml\nflair_css_class: ["discussion", "question"]\n```',
            
            'id': '**Search ID**\n\nSearch for specific submission or comment IDs.\n\n**Example:**\n```yaml\nid: ["abc123", "def456"]\n```',
            
            'name': '**Search Author Name**\n\nSearch for specific author names (in author sub-group).\n\n**Example:**\n```yaml\nauthor:\n    name: ["spammer1", "spammer2"]\n```'
        };

        // Non-searching checks documentation
        const nonSearchChecks: { [key: string]: string } = {
            'reports': '**Minimum Reports**\n\nThe minimum number of reports the item must have to trigger the rule.\n\n**Example:**\n```yaml\nreports: 2\n```',
            
            'body_longer_than': '**Body Length Minimum**\n\nThe body must be longer than this number of characters.\n\n**Example:**\n```yaml\nbody_longer_than: 100\n```',
            
            'body_shorter_than': '**Body Length Maximum**\n\nThe body must be shorter than this number of characters.\n\n**Example:**\n```yaml\nbody_shorter_than: 1000\n```',
            
            'is_top_level': '**Top-Level Comment**\n\n`true/false` - If true, only applies to top-level comments.\n\n**Example:**\n```yaml\nis_top_level: true\n```',
            
            'is_edited': '**Edited Content**\n\n`true/false` - If true, only applies to edited content.\n\n**Example:**\n```yaml\nis_edited: true\n```',
            
            'is_original_content': '**Original Content**\n\n`true/false` - If true, only applies to OC flagged content.\n\n**Example:**\n```yaml\nis_original_content: true\n```',
            
            'is_poll': '**Poll Submission**\n\n`true/false` - If true, only applies to poll submissions.\n\n**Example:**\n```yaml\nis_poll: true\n```',
            
            'is_gallery': '**Gallery Submission**\n\n`true/false` - If true, only applies to gallery submissions.\n\n**Example:**\n```yaml\nis_gallery: true\n```'
        };

        // Sub-group documentation
        const subGroups: { [key: string]: string } = {
            'author': '**Author Sub-Group**\n\nChecks and actions that apply to the author of the content.\n\n**Example:**\n```yaml\nauthor:\n    comment_karma: "< 10"\n    account_age: "< 7 days"\n```',
            
            'crosspost_author': '**Crosspost Author Sub-Group**\n\nChecks and actions that apply to the author of the original crossposted content.\n\n**Example:**\n```yaml\ncrosspost_author:\n    name: ["banned_user"]\n```',
            
            'crosspost_subreddit': '**Crosspost Subreddit Sub-Group**\n\nChecks and actions that apply to the subreddit of the original crossposted content.\n\n**Example:**\n```yaml\ncrosspost_subreddit:\n    name: ["banned_subreddit"]\n```',
            
            'parent_submission': '**Parent Submission Sub-Group**\n\nChecks and actions that apply to the parent submission (for comments).\n\n**Example:**\n```yaml\nparent_submission:\n    set_flair: ["Discussion", "discussion"]\n```',
            
            'subreddit': '**Subreddit Sub-Group**\n\nChecks and actions that apply to the current subreddit.\n\n**Example:**\n```yaml\nsubreddit:\n    is_nsfw: true\n```'
        };

        // Action values documentation
        const actionValues: { [key: string]: string } = {
            'approve': '**Approve Content**\n\nApproves the submission or comment, making it visible to users.',
            'remove': '**Remove Content**\n\nRemoves the submission or comment from public view.',
            'spam': '**Mark as Spam**\n\nRemoves the content and trains the spam filter to catch similar content.',
            'filter': '**Filter Content**\n\nRemoves the post but keeps it in the modqueue for moderator review.',
            'report': '**Report Content**\n\nReports the content to moderators for review.'
        };

        // Type values documentation
        const typeValues: { [key: string]: string } = {
            'comment': '**Comment Type**\n\nApply rule to comments only.',
            'submission': '**Submission Type**\n\nApply rule to all submissions.',
            'text submission': '**Text Submission Type**\n\nApply rule to text posts only.',
            'link submission': '**Link Submission Type**\n\nApply rule to link posts only.',
            'crosspost submission': '**Crosspost Submission Type**\n\nApply rule to crossposts only.',
            'poll submission': '**Poll Submission Type**\n\nApply rule to poll posts only.',
            'gallery submission': '**Gallery Submission Type**\n\nApply rule to gallery posts only.',
            'any': '**Any Type**\n\nApply rule to any content type (default).'
        };

        // Standard conditions documentation
        const standardConditions: { [key: string]: string } = {
            'image hosting sites': '**Standard: Image Hosting Sites**\n\nWill match link submissions from common image hosting domains like imgur.com, i.redd.it, etc.',
            'video hosting sites': '**Standard: Video Hosting Sites**\n\nWill match link submissions from common video hosting domains like youtube.com, vimeo.com, etc.',
            'direct image links': '**Standard: Direct Image Links**\n\nWill match link submissions that link directly to image files (PNG, JPG, GIF, GIFV).',
            'streaming sites': '**Standard: Streaming Sites**\n\nWill match link submissions from common streaming domains.',
            'crowdfunding sites': '**Standard: Crowdfunding Sites**\n\nWill match link submissions from common crowdfunding domains like kickstarter.com, gofundme.com, etc.',
            'meme generator sites': '**Standard: Meme Generator Sites**\n\nWill match link submissions from common meme-generator sites.',
            'facebook links': '**Standard: Facebook Links**\n\nWill match submissions or comments including links to Facebook.',
            'amazon affiliate links': '**Standard: Amazon Affiliate Links**\n\nWill match submissions or comments including Amazon links with an affiliate.'
        };

        // Check if we're in a sub-group context
        if (isInSubGroup) {
            // Sub-group specific fields
            const subGroupFields: { [key: string]: string } = {
                'comment_karma': '**Comment Karma Check**\n\nCompare to the author\'s comment karma.\n\n**Example:**\n```yaml\ncomment_karma: "< -50"\ncomment_karma: "> 1000"\n```',
                
                'post_karma': '**Post Karma Check**\n\nCompare to the author\'s post karma.\n\n**Example:**\n```yaml\npost_karma: "< 0"\npost_karma: "> 500"\n```',
                
                'combined_karma': '**Combined Karma Check**\n\nCompare to the author\'s combined karma (comment + post karma).\n\n**Example:**\n```yaml\ncombined_karma: "< 0"\ncombined_karma: "> 1000"\n```',
                
                'account_age': '**Account Age Check**\n\nCompare to the age of the author\'s account.\n\n**Example:**\n```yaml\naccount_age: "< 1 days"\naccount_age: "> 30 days"\naccount_age: "< 2 weeks"\n```',
                
                'has_verified_email': '**Verified Email Check**\n\n`true/false` - Check if author has verified email.\n\n**Example:**\n```yaml\nhas_verified_email: true\n```',
                
                'is_gold': '**Reddit Gold Check**\n\n`true/false` - Check if author has Reddit Gold.\n\n**Example:**\n```yaml\nis_gold: true\n```',
                
                'is_contributor': '**Contributor Check**\n\n`true/false` - Check if author is an approved submitter.\n\n**Example:**\n```yaml\nis_contributor: true\n```',
                
                'is_moderator': '**Moderator Check**\n\n`true/false` - Check if author is a moderator.\n\n**Example:**\n```yaml\nis_moderator: true\n```',
                
                'set_flair': '**Set Flair**\n\nSet user or submission flair.\n\n**Example:**\n```yaml\nset_flair: ["Discussion", "discussion"]\nset_flair:\n    text: "Discussion"\n    css_class: "discussion"\n    template_id: "template_id_here"\n```',
                
                'overwrite_flair': '**Overwrite Flair**\n\n`true/false` - If true, overwrite existing flair.\n\n**Example:**\n```yaml\noverwrite_flair: true\n```'
            };

            if (subGroupFields[word]) {
                return new vscode.MarkdownString(subGroupFields[word]);
            }
        }

        // Check for top-level fields
        if (topLevelFields[word]) {
            return new vscode.MarkdownString(topLevelFields[word]);
        }

        // Check for search checks
        if (searchChecks[word]) {
            return new vscode.MarkdownString(searchChecks[word]);
        }

        // Check for non-searching checks
        if (nonSearchChecks[word]) {
            return new vscode.MarkdownString(nonSearchChecks[word]);
        }

        // Check for sub-groups
        if (subGroups[word]) {
            return new vscode.MarkdownString(subGroups[word]);
        }

        // Check for action values
        if (actionValues[word]) {
            return new vscode.MarkdownString(actionValues[word]);
        }

        // Check for type values
        if (typeValues[word]) {
            return new vscode.MarkdownString(typeValues[word]);
        }

        // Check for standard conditions
        if (standardConditions[word]) {
            return new vscode.MarkdownString(standardConditions[word]);
        }

        return null;
    }

    private isInSubGroup(position: vscode.Position): boolean {
        // This is a simplified version - in a real implementation,
        // you'd want to parse the YAML structure more carefully
        return false;
    }
} 